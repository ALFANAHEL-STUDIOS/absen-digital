"use client";

import React, { useEffect, useState } from "react";
import { Home, Users, X, Bell, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Import role-specific dashboard components
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ExpirationModal from "@/components/ExpirationModal";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import ExpirationTracker from "@/components/ExpirationTracker";
interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date;
}
import DynamicDashboard from "@/components/DynamicDashboard";
export default function Dashboard() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showCustomDashboard, setShowCustomDashboard] = useState(false);
  const {
    user,
    schoolId,
    userRole,
    userData
  } = useAuth();
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [userName, setUserName] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationData, setExpirationData] = useState<{
    daysLeft: number;
    expired: boolean;
  } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Pop-up states
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  const [showExpirationPopup, setShowExpirationPopup] = useState(false);
  const [hasActiveAnnouncements, setHasActiveAnnouncements] = useState(false);
  const [expirationStatus, setExpirationStatus] = useState({
    daysLeft: 30,
    isNearExpiry: false,
    isExpired: false
  });

  // Check if this is the user's first login
  useEffect(() => {
    if (user) {
      // Check if this is the first login by looking for a flag in localStorage
      const isFirstLogin = localStorage.getItem(`hasLoggedIn_${user.uid}`) !== 'true';
      if (isFirstLogin) {
        setShowWelcomePopup(true);
        // Mark that the user has logged in
        localStorage.setItem(`hasLoggedIn_${user.uid}`, 'true');
      }
    }
  }, [user]);
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (schoolId) {
        try {
          setLoading(true);
          // Fetch school info
          const schoolDoc = await getDoc(doc(db, "schools", schoolId));
          if (schoolDoc.exists()) {
            setSchoolName(schoolDoc.data().name || "Sekolah Anda");
          }

          // Fetch total students count
          const studentsRef = collection(db, `schools/${schoolId}/students`);
          const studentsSnapshot = await getDocs(studentsRef);
          setTotalStudents(studentsSnapshot.size);

          // Fetch total classes count
          const classesRef = collection(db, `schools/${schoolId}/classes`);
          const classesSnapshot = await getDocs(classesRef);
          setTotalClasses(classesSnapshot.size);

          // Fetch total teachers count
          const teachersRef = collection(db, "users");
          const teachersQuery = query(teachersRef, where("schoolId", "==", schoolId), where("role", "==", "teacher"));
          const teachersSnapshot = await getDocs(teachersQuery);
          setTotalTeachers(teachersSnapshot.size);

          // Calculate attendance rate
          const today = new Date().toISOString().split('T')[0];
          const startOfMonth = today.substring(0, 8) + '01'; // First day of current month

          const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
          const attendanceQuery = query(attendanceRef, where("date", ">=", startOfMonth), where("date", "<=", today));
          const attendanceSnapshot = await getDocs(attendanceQuery);
          let present = 0;
          let total = 0;
          attendanceSnapshot.forEach(doc => {
            total++;
            const status = doc.data().status;
            if (status === 'hadir' || status === 'present') {
              present++;
            }
          });
          setAttendanceRate(total > 0 ? Math.round(present / total * 100) : 0);

          // Fetch recent attendance records
          const recentAttendanceQuery = query(attendanceRef, orderBy("timestamp", "desc"), limit(5));
          const recentAttendanceSnapshot = await getDocs(recentAttendanceQuery);
          const recentAttendanceData = [];
          recentAttendanceSnapshot.forEach(doc => {
            const data = doc.data();
            recentAttendanceData.push({
              id: doc.id,
              ...data,
              // Ensure notes field is available for display
              notes: data.notes || data.note || data.catatan || null
            });
          });
          setRecentAttendance(recentAttendanceData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching school data:", error);
          setLoading(false);
        }
      }
    };
    fetchSchoolData();
    setUserName(user?.displayName || "Pengguna");

    // Check if the user is an admin without school setup
    if (typeof window !== 'undefined' && userRole === 'admin') {
      const needsSetup = localStorage.getItem('needsSchoolSetup');
      if (needsSetup === 'true' && !schoolId) {
        router.push('/dashboard/setup-school');
      }
    }
  }, [user, schoolId, userRole, router]);
  useEffect(() => {
    if (!loading && user && userRole) {
      checkAccountExpiry();
      fetchAnnouncements();
      checkAndShowPopups();
    }
  }, [user, userRole, schoolId, loading]);

  // Auto-show popups on dashboard load
  useEffect(() => {
    if (!loading && schoolId) {
      const timer = setTimeout(() => {
        checkAndShowPopups();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, schoolId]);
  const checkAccountExpiry = async () => {
    if (!user || userRole !== 'admin') return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.expiryType === "forever") return; // Unlimited access

        if (userData.expiryDate) {
          const expiryDate = userData.expiryDate.toDate();
          const now = new Date();
          const timeDiff = expiryDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          if (daysLeft <= 0) {
            setExpirationData({
              daysLeft: 0,
              expired: true
            });
            setShowExpirationModal(true);
          } else if (daysLeft <= 7) {
            setExpirationData({
              daysLeft,
              expired: false
            });
            setShowExpirationModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking account expiry:", error);
    }
  };
  const fetchAnnouncements = async () => {
    try {
      const announcementsQuery = query(collection(db, "announcements"), where("isActive", "==", true), orderBy("createdAt", "desc"), limit(3));
      const snapshot = await getDocs(announcementsQuery);
      const announcementsList: Announcement[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        announcementsList.push({
          id: doc.id,
          title: data.title || "",
          message: data.message || "",
          isActive: data.isActive !== false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        });
      });
      setAnnouncements(announcementsList);
      setHasActiveAnnouncements(!snapshot.empty);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };
  const checkExpiration = () => {
    const expiryDate = new Date('2025-12-31');
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setExpirationStatus({
      daysLeft,
      isNearExpiry: daysLeft <= 30 && daysLeft > 0,
      isExpired: daysLeft <= 0
    });
  };
  const checkAndShowPopups = () => {
    checkExpiration();
    if (expirationStatus.isExpired || expirationStatus.isNearExpiry && expirationStatus.daysLeft <= 7) {
      setShowExpirationPopup(true);
    } else if (hasActiveAnnouncements) {
      setShowAnnouncementPopup(true);
    }
  };
  const handleAnnouncementClose = () => {
    setShowAnnouncementPopup(false);
    if (expirationStatus.isNearExpiry || expirationStatus.isExpired) {
      setTimeout(() => setShowExpirationPopup(true), 500);
    }
  };
  return <div className="min-h-screen bg-gray-50" data-unique-id="81d88c60-ab91-4765-9a53-78553fc563b4" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">
      {/* Announcements Banner */}
      {announcements.length > 0 && showAnnouncement && <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl" data-unique-id="8603c446-c922-40ad-91bd-1d771bb0cd43" data-file-name="app/dashboard/page.tsx">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" data-unique-id="34a805f4-6e58-4d6b-bb57-80443e205893" data-file-name="app/dashboard/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="fbbb811f-297e-4c6e-8663-f0d8451de3de" data-file-name="app/dashboard/page.tsx">
              <div className="flex items-center space-x-3" data-unique-id="08179a77-76a0-4555-9a77-7ca7857b9629" data-file-name="app/dashboard/page.tsx">
                <Bell className="h-5 w-5" />
                <div data-unique-id="7090a29d-b46d-42e6-a2f6-b2a021271ccd" data-file-name="app/dashboard/page.tsx">
                  <h4 className="font-semibold" data-unique-id="ab5a9e1a-bc39-41da-94ff-113bf66652c4" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">{announcements[0].title}</h4>
                  <p className="text-sm text-blue-100" data-unique-id="505e8614-c9a0-492d-952f-cf9567cbc6c0" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">{announcements[0].message}</p>
                </div>
              </div>
              <button onClick={() => setShowAnnouncement(false)} className="text-white/80 hover:text-white transition-colors" data-unique-id="847bc0cb-4c70-4c2c-b538-ad5b396fcd8c" data-file-name="app/dashboard/page.tsx">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>}

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1 py-0" data-unique-id="1a4a48fd-01ed-4b84-b0b2-0a27f175184c" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">
        {/* Quick Action Buttons */}
        <div className="flex justify-end space-x-3 mb-2" data-unique-id="039baa40-d8fb-4a17-9deb-c8827dfce48d" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">
          {/* {hasActiveAnnouncements && <motion.button initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} onClick={() => setShowAnnouncementPopup(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors" data-unique-id="62cb0be1-3d05-4cf1-89a0-72e6fe1f96f2" data-file-name="app/dashboard/page.tsx">
              <motion.div animate={{
            rotate: [0, 10, -10, 0]
          }} transition={{
            repeat: Infinity,
            duration: 2
          }} data-unique-id="4c87a380-74f4-4170-b8ec-3123e1bc4c71" data-file-name="app/dashboard/page.tsx">
                <Bell className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium" data-unique-id="aa23c0c5-a586-4fad-95c0-429c9bec6d8d" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="c770e236-a7fd-4607-ac53-8cfe133b8c33" data-file-name="app/dashboard/page.tsx">Lihat Pengumuman</span></span>
            </motion.button>}
            
          {(expirationStatus.isNearExpiry || expirationStatus.isExpired) && <motion.button initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} onClick={() => setShowExpirationPopup(true)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-colors ${expirationStatus.isExpired ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`} data-unique-id="cf07715c-5f61-4db2-b8cc-351832cac722" data-file-name="app/dashboard/page.tsx">
              <motion.div animate={{
            scale: [1, 1.2, 1]
          }} transition={{
            repeat: Infinity,
            duration: 1.5
          }} data-unique-id="2643f533-e713-4b5f-8553-e0762ca1bcb1" data-file-name="app/dashboard/page.tsx">
                <Clock className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium" data-unique-id="27c7ccc8-c788-4bd1-b5c8-35e674a4c1e6" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">
                {expirationStatus.isExpired ? 'Sudah Kedaluwarsa' : `${expirationStatus.daysLeft} Hari Lagi`}
              </span>
            </motion.button>}*/}
        </div>

        {/* Dashboard Header */}
        <div className="mb-3" data-unique-id="762335b4-4fb7-4c36-a4b0-fa741ac90f35" data-file-name="app/dashboard/page.tsx">
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="e44f3f1c-4564-4c82-a3dd-f3841f91ca57" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="42f96034-a9ca-423d-90ec-3f642a79108d" data-file-name="app/dashboard/page.tsx">
            Hai, </span>{userName}
            {userRole && <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full" data-unique-id="4456f6f1-da61-4816-99eb-52aedb8c2dcd" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">
                {userRole === 'admin' ? 'Administrator' : userRole === 'teacher' ? 'Guru' : 'Siswa'}
              </span>}
          </h1>
          <div className="flex items-center mt-1 text-gray-500" data-unique-id="7f35e0a7-5766-4b57-bd4c-c36f1bb5407a" data-file-name="app/dashboard/page.tsx">
            <Home size={14} className="mr-1.5" />
            <span className="font-medium text-xs" data-unique-id="30872479-1379-44c6-81f2-689839523f35" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="64bfdd39-3d85-4ca7-b1f9-8b79573fe201" data-file-name="app/dashboard/page.tsx">SISTEM ABSENSI DIGITAL GURU DAN SISWA</span></span>
          </div>
        </div>

        {/* Render different dashboard based on user role */}
        {userRole === 'admin' && <>
            {showCustomDashboard ? <DynamicDashboard userRole={userRole} schoolId={schoolId} /> : <AdminDashboard schoolName={schoolName} principalName={userData?.principalName || ""} principalNip={userData?.principalNip || ""} stats={{
          totalStudents,
          totalClasses,
          attendanceRate,
          totalTeachers
        }} recentAttendance={recentAttendance} loading={loading} />}
          </>}
        
        {/*{userRole === 'teacher' && <>
            {showCustomDashboard ? <DynamicDashboard userRole={userRole} schoolId={schoolId} /> : <TeacherDashboard schoolName={schoolName} userName={userName} stats={{
          totalStudents,
          totalClasses,
          attendanceRate,
          totalTeachers
        }} recentAttendance={recentAttendance} loading={loading} />}
          </>}*/}
        
        {userRole === 'student' && <StudentDashboard userData={userData} schoolId={schoolId} />}
        
        {/* Fallback if no role is detected */}
        {!userRole && <div className="bg-white rounded-xl shadow-sm p-8 text-center" data-unique-id="ed2b1343-cfb6-4b79-8a5e-9093cafb6981" data-file-name="app/dashboard/page.tsx">
            <div className="flex flex-col items-center" data-unique-id="d70d6a24-c5af-490f-aa10-0a50b1c94927" data-file-name="app/dashboard/page.tsx">
              <div className="bg-blue-100 p-4 rounded-full mb-4" data-unique-id="c98ce74c-20b7-4fe0-908b-ea3eea553440" data-file-name="app/dashboard/page.tsx">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2" data-unique-id="5f33d13e-b0ba-4769-9dae-d88901a3bfa8" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="dd3d451d-6caf-4655-873f-7779dc745dd9" data-file-name="app/dashboard/page.tsx">Selamat Datang di Dashboard</span></h2>
              <p className="text-gray-600 mb-4" data-unique-id="60afceb3-c1f9-467b-a48e-7abcce9d3cc7" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="1505d7e6-f133-467c-bb32-34b5ea58fb8d" data-file-name="app/dashboard/page.tsx">
                Silakan hubungi administrator untuk mengatur peran akses Anda.
              </span></p>
            </div>
          </div>}
      </div>

      {/* Welcome Popup for First-time Login */}
      <AnimatePresence>
        {showWelcomePopup && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4" data-unique-id="77e8cbd3-f997-448e-8885-bd3b9ae5acc6" data-file-name="app/dashboard/page.tsx">
            <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.9,
          opacity: 0
        }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6" data-unique-id="5d955f2b-13c4-4843-b168-f9c53b774dc2" data-file-name="app/dashboard/page.tsx">
              <div className="flex justify-end" data-unique-id="52d7e5d3-a8db-4cb9-9373-af42c2c03966" data-file-name="app/dashboard/page.tsx">
                <button onClick={() => setShowWelcomePopup(false)} className="text-gray-500 hover:text-gray-700" data-unique-id="6ab100e2-d1b7-419d-a3f9-6bc6bdda4d3b" data-file-name="app/dashboard/page.tsx">
                  <X size={20} />
                </button>
              </div>
              <div className="text-center mb-6" data-unique-id="c7178ff8-72c5-4aaf-816f-64760916c722" data-file-name="app/dashboard/page.tsx">
                <h2 className="text-xl font-bold mb-1" data-unique-id="f0fc5805-00e7-4e84-a183-b2bc17b57c9b" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="aa09a354-e7a3-4682-80d8-3855c46668ba" data-file-name="app/dashboard/page.tsx">SELAMAT DATANG</span></h2>
                <h3 className="text-lg font-bold text-primary mb-4" data-unique-id="9d484951-582e-4c42-a2aa-3630ba29ffb7" data-file-name="app/dashboard/page.tsx" data-dynamic-text="true">{userData?.name || userName}</h3>
                <p className="text-gray-700 text-sm sm:text-base" data-unique-id="75a424d8-d13a-4ab8-8617-639a152d643b" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="dce659af-01ac-4e5f-a15b-d08b69ef6687" data-file-name="app/dashboard/page.tsx">
                  Jika anda pertama kali login ke Aplikasi ABSENSI DIGITAL, jangan lupa untuk dapat menggunakan aplikasi ini, silahkan lengkapi </span><span className="font-bold" data-unique-id="a653f151-b5c0-497b-8b52-512420ee7dc1" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="42cb4d7e-5f70-4ba3-a497-f853503ff3b3" data-file-name="app/dashboard/page.tsx">Profil Sekolah</span></span><span className="editable-text" data-unique-id="1ba3961d-5e9c-468f-9197-f7404dcd5ca2" data-file-name="app/dashboard/page.tsx"> anda dengan cara mengakses Menu yang berada di pojok kanan atas.
                </span></p>
              </div>
              <div className="flex justify-center" data-unique-id="8c49e0f0-20d7-4cd9-8946-9298e0248467" data-file-name="app/dashboard/page.tsx">
                <button onClick={() => setShowWelcomePopup(false)} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="1482bc50-9209-4bc3-b0ad-ab2489f217b3" data-file-name="app/dashboard/page.tsx"><span className="editable-text" data-unique-id="6e0e217f-0013-42a6-aa2f-fc02ba178110" data-file-name="app/dashboard/page.tsx">
                  Saya Mengerti
                </span></button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* Expiration Modal */}
      <ExpirationModal isOpen={showExpirationModal} onClose={() => setShowExpirationModal(false)} daysLeft={expirationData?.daysLeft || 0} />

      {/* Pop-ups */}
      <AnnouncementPopup isOpen={showAnnouncementPopup} onClose={handleAnnouncementClose} schoolId={schoolId} />

      <ExpirationTracker isOpen={showExpirationPopup} onClose={() => setShowExpirationPopup(false)} schoolId={schoolId} />
    </div>;
}
