"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// Import dashboard components
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import DashboardPopups from "@/components/DashboardPopups";
// Types
interface AttendanceRecord {
 id: string;
 studentName: string;
 class: string;
 status: string;
 date: string;
 time: string;
 notes?: string;
}
interface DashboardStats {
 totalStudents: number;
 totalClasses: number;
 attendanceRate: number;
 totalTeachers: number;
}
export default function Dashboard() {
 const { user, userRole, schoolId, userData } = useAuth();
 const router = useRouter();

 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState<DashboardStats>({
   totalStudents: 0,
   totalClasses: 0,
   attendanceRate: 0,
   totalTeachers: 0
 });
 const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
 const [schoolName, setSchoolName] = useState("");
 const [principalName, setPrincipalName] = useState("");
 const [principalNip, setPrincipalNip] = useState("");
 // Load dashboard data
 useEffect(() => {
   const loadDashboardData = async () => {
     if (!user || !schoolId) {
       setLoading(false);
       return;
     }
     try {
       setLoading(true);

       // Import Firebase functions
       const { collection, query, getDocs, doc, getDoc, where, orderBy, limit } = await import('firebase/firestore');
       const { db } = await import('@/lib/firebase');
       // Get school information
       const schoolDoc = await getDoc(doc(db, "schools", schoolId));
       if (schoolDoc.exists()) {
         const schoolData = schoolDoc.data();
         setSchoolName(schoolData.name || "");
         setPrincipalName(schoolData.principalName || "");
         setPrincipalNip(schoolData.principalNip || "");
       }
       // Get stats based on user role
       if (userRole === 'admin') {
         // Get total students
         const studentsRef = collection(db, `schools/${schoolId}/students`);
         const studentsSnapshot = await getDocs(studentsRef);
         const totalStudents = studentsSnapshot.size;
         // Get total classes
         const classesRef = collection(db, `schools/${schoolId}/classes`);
         const classesSnapshot = await getDocs(classesRef);
         const totalClasses = classesSnapshot.size;
         // Get total teachers
         const usersRef = collection(db, "users");
         const teachersQuery = query(
           usersRef,
           where("schoolId", "==", schoolId),
           where("role", "in", ["teacher", "staff"])
         );
         const teachersSnapshot = await getDocs(teachersQuery);
         const totalTeachers = teachersSnapshot.size;
         // Get recent attendance
         const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
         const recentAttendanceQuery = query(
           attendanceRef,
           orderBy("timestamp", "desc"),
           limit(10)
         );
         const attendanceSnapshot = await getDocs(recentAttendanceQuery);

         const attendanceRecords: AttendanceRecord[] = [];
         let presentCount = 0;
         let totalRecords = 0;
         attendanceSnapshot.forEach(doc => {
           const data = doc.data();
           attendanceRecords.push({
             id: doc.id,
             studentName: data.studentName || "",
             class: data.class || "",
             status: data.status || "",
             date: data.date || "",
             time: data.time || "",
             notes: data.notes || ""
           });
           if (data.status === "present" || data.status === "hadir") {
             presentCount++;
           }
           totalRecords++;
         });
         const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
         setStats({
           totalStudents,
           totalClasses,
           attendanceRate,
           totalTeachers
         });
         setRecentAttendance(attendanceRecords);
       }
     } catch (error) {
       console.error("Error loading dashboard data:", error);
       toast.error("Gagal memuat data dashboard");
     } finally {
       setLoading(false);
     }
   };
   loadDashboardData();
 }, [user, userRole, schoolId]);
 // Redirect if not authenticated
 useEffect(() => {
   if (!loading && !user) {
     router.push('/login');
   }
 }, [user, loading, router]);
 // Loading state
 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
       <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="text-center"
       >
         <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
         <p className="text-lg font-medium text-gray-700">Memuat Dashboard...</p>
         <p className="text-sm text-gray-500 mt-1">Harap tunggu sebentar</p>
       </motion.div>
     </div>
   );
 }
 // Not authenticated
 if (!user || !userRole) {
   return null;
 }
 return (
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5 }}
     className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
   >
     {/* Toast Container */}
     <Toaster
       position="top-center"
       toastOptions={{
         duration: 4000,
         style: {
           background: '#363636',
           color: '#fff',
         },
       }}
     />
     {/* Dashboard Content */}
     <div className="container mx-auto px-4 py-6">
       {/* Render appropriate dashboard based on user role */}
       {userRole === 'admin' && (
         <AdminDashboard
           schoolName={schoolName}
           principalName={principalName}
           principalNip={principalNip}
           stats={stats}
           recentAttendance={recentAttendance}
           loading={loading}
         />
       )}
       {userRole === 'student' && (
         <StudentDashboard
           userData={userData}
           schoolId={schoolId}
         />
       )}
       {(userRole === 'teacher' || userRole === 'staff') && (
         <div className="text-center py-20">
           <h2 className="text-2xl font-bold text-gray-800 mb-4">
             Dashboard Guru
           </h2>
           <p className="text-gray-600">
             Selamat datang di dashboard guru dan tenaga kependidikan
           </p>
         </div>
       )}
     </div>
     {/* Dashboard Popups Component */}
     <DashboardPopups
       schoolId={schoolId}
       userRole={userRole}
     />
   </motion.div>
 );
}
