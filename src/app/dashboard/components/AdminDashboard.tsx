"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, Users, BookOpen, Settings, FileText, PlusCircle, School, Scan, UserPlus, Loader2 } from "lucide-react";
import DynamicDashboard from "@/components/DynamicDashboard";
import AutoAnnouncementPopup from "@/components/AutoAnnouncementPopup";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
interface AdminDashboardProps {
  schoolName: string;
  principalName?: string;
  principalNip?: string;
  stats: {
    totalStudents: number;
    totalClasses: number;
    attendanceRate: number;
    totalTeachers: number;
  };
  recentAttendance: any[];
  loading: boolean;
}
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: Date;
  isRead?: boolean;
  readBy?: string[];
}
export default function AdminDashboard({
  schoolName,
  principalName,
  principalNip,
  stats,
  recentAttendance,
  loading
}: AdminDashboardProps) {
  const [attendanceData, setAttendanceData] = useState([{
    name: "Hadir",
    value: 85,
    color: "#4C6FFF"
  }, {
    name: "Sakit",
    value: 7,
    color: "#FF9800"
  }, {
    name: "Izin",
    value: 5,
    color: "#8BC34A"
  }, {
    name: "Alpha",
    value: 3,
    color: "#F44336"
  }]);
  const [classData, setClassData] = useState([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<Announcement[]>([]);
  const {
    schoolId,
    userRole,
    user
  } = useAuth();
  const [weeklyData, setWeeklyData] = useState([{
    name: "Senin",
    hadir: 95,
    sakit: 3,
    izin: 1,
    alpha: 1
  }, {
    name: "Selasa",
    hadir: 92,
    sakit: 4,
    izin: 2,
    alpha: 2
  }, {
    name: "Rabu",
    hadir: 88,
    sakit: 6,
    izin: 3,
    alpha: 3
  }, {
    name: "Kamis",
    hadir: 90,
    sakit: 5,
    izin: 3,
    alpha: 2
  }, {
    name: "Jumat",
    hadir: 93,
    sakit: 3,
    izin: 2,
    alpha: 2
  }]);

  // State to toggle between static and dynamic dashboard
  const [showDynamicDashboard, setShowDynamicDashboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showDynamicDashboard') === 'true';
    }
    return false;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showDynamicDashboard', showDynamicDashboard.toString());
    }
  }, [showDynamicDashboard]);

  // Fetch class data with student counts
  useEffect(() => {
    const fetchClassData = async () => {
      if (!schoolId) return;
      try {
        // Get classes with student counts
        const classesRef = collection(db, `schools/${schoolId}/classes`);
        const classesQuery = query(classesRef, orderBy("name"));
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = [];
        const classMap = {};
        classesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name) {
            const classItem = {
              name: data.name,
              students: 0
            };
            classesData.push(classItem);
            classMap[data.name] = classItem;
          }
        });

        // Count students per class
        const studentsRef = collection(db, `schools/${schoolId}/students`);
        const studentsSnapshot = await getDocs(studentsRef);
        studentsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.class && classMap[data.class]) {
            classMap[data.class].students++;
          }
        });
        if (classesData.length > 0) {
          setClassData(classesData);
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };
    fetchClassData();
  }, [schoolId]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!schoolId || !user) return;
      try {
        const announcementsRef = collection(db, `schools/${schoolId}/announcements`);
        const announcementsQuery = query(announcementsRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(announcementsQuery);
        const fetchedAnnouncements: Announcement[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          fetchedAnnouncements.push({
            id: doc.id,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            createdAt: data.createdAt?.toDate() || new Date(),
            readBy: data.readBy || []
          });
        });
        setAnnouncements(fetchedAnnouncements);

        // Filter unread announcements
        const unread = fetchedAnnouncements.filter(announcement => !announcement.readBy?.includes(user.uid));
        setUnreadAnnouncements(unread);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchAnnouncements();
  }, [schoolId, user]);

  // Calculate attendance distribution
  useEffect(() => {
    if (stats && stats.attendanceRate) {
      // Create attendance distribution based on stats
      const present = stats.attendanceRate;
      const remaining = 100 - present;

      // Distribute the remaining percentage among sick, izin, and alpha
      // This is an approximation - in a real app you'd get actual data
      const sick = Math.round(remaining * 0.5);
      const izin = Math.round(remaining * 0.3);
      const alpha = remaining - sick - izin;
      setAttendanceData([{
        name: "Hadir",
        value: present,
        color: "#4C6FFF"
      }, {
        name: "Sakit",
        value: sick,
        color: "#FF9800"
      }, {
        name: "Izin",
        value: izin,
        color: "#8BC34A"
      }, {
        name: "Alpha",
        value: alpha,
        color: "#F44336"
      }]);
    }
  }, [stats]);
  return <div data-unique-id="ecccc124-0a70-45ab-a28a-a554862724e6" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
      {showDynamicDashboard ?
    // Dynamic Dashboard
    <div className="mb-6" data-unique-id="c4ce54ee-f75b-490c-aa43-934a636cdbf9" data-file-name="app/dashboard/components/AdminDashboard.tsx">
          <DynamicDashboard userRole={userRole} schoolId={schoolId} />
        </div> : <>
          {/* School Information */}
          <div className="bg-blue-600 text-white p-4 sm:p-5 mb-4 sm:mb-6 rounded-xl" data-unique-id="817239a2-bdc3-46a7-9308-4fc79db79827" data-file-name="app/dashboard/components/AdminDashboard.tsx">
            <div className="flex items-center mb-1" data-unique-id="d1bec14a-8ebf-4789-b0cd-4f5ef25ea5b7" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <School className="h-4 w-4 text-white mr-1.5" />
              <h3 className="text-sm font-medium text-white" data-unique-id="24586829-50eb-483a-83df-3b8b2ac46a28" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="ee8119e4-d9cf-497f-8648-cd9ca12aad7d" data-file-name="app/dashboard/components/AdminDashboard.tsx">DATA SEKOLAH</span></h3>
            </div>
            <p className="text-lg font-bold text-white" data-unique-id="030206ed-b3dc-44eb-895a-6e648d82e1b1" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">{schoolName}</p>
            <div className="flex flex-wrap items-center mt-2 text-xs text-white" data-unique-id="e996bb7c-1637-4033-97ee-9c3b26924a5b" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <span data-unique-id="06b630a4-a1ff-4fd6-8de9-22cda51e3235" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="3b69a802-68fa-418e-b81d-0018d04aaab0" data-file-name="app/dashboard/components/AdminDashboard.tsx">Tahun Pelajaran 2024/2025</span></span>
              <span className="mx-2" data-unique-id="508f6dd5-252f-4efc-9d7a-0746b429b1de" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="cb9f8821-ac93-4247-8c3f-980845cee1a1" data-file-name="app/dashboard/components/AdminDashboard.tsx">•</span></span>
              <span className="flex items-center" data-unique-id="9b5d8a5e-8c91-4900-b324-8167bbec3e3c" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <span className="mr-1 h-2 w-2 bg-green-300 rounded-full inline-block animate-pulse" data-unique-id="478419ed-fc20-4bcb-80b4-f6a4d5d1f7c3" data-file-name="app/dashboard/components/AdminDashboard.tsx"></span><span className="editable-text" data-unique-id="ffd8dcde-39e6-4d2d-b6d3-3ffa25da3eac" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                Aktif
              </span></span>
            </div>
          </div>

          {/* Admin-specific stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6" data-unique-id="4e2cb6e1-7215-4686-8276-2e66dca1423e" data-file-name="app/dashboard/components/AdminDashboard.tsx">
            <div className="bg-blue-500 rounded-xl p-3 sm:p-5 text-white" data-unique-id="d33fbd02-1864-4566-bd15-e49e339ee0cd" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <div className="flex items-center mb-1" data-unique-id="c082589a-ae43-49dc-8f5c-6f839af59844" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-white mr-1.5 sm:mr-2" />
                <h3 className="text-xs sm:text-sm font-medium text-white" data-unique-id="cc6cd030-f9a9-42c4-a663-2d89309a74bc" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="247fd0ee-e65d-4652-8909-6ab15d29bbd6" data-file-name="app/dashboard/components/AdminDashboard.tsx">Total Siswa</span></h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white" data-unique-id="53c9d6d9-8ba1-425a-98f1-b47cb2358eb2" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">{stats.totalStudents}</p>
              <div className="text-xs text-white mt-1 sm:mt-2" data-unique-id="41b65599-d702-46db-b867-d0eecddd4287" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <span data-unique-id="a7887009-aa71-4ffe-ba49-8f78e41052fc" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="ff52b906-37a5-4b9d-a067-ddc669a4ef7e" data-file-name="app/dashboard/components/AdminDashboard.tsx">Pada Semester ini</span></span>
              </div>
            </div>
            
            <div className="bg-purple-500 rounded-xl p-3 sm:p-5 text-white" data-unique-id="bf0c5e3f-98a1-4783-8335-1f3c6e1739a9" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <div className="flex items-center mb-1" data-unique-id="4cbd4725-e1fd-4d58-9c45-cfddc967370f" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-white mr-1.5 sm:mr-2" />
                <h3 className="text-xs sm:text-sm font-medium text-white" data-unique-id="9ff35b75-d14d-4cc5-9300-c0928e887282" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="6d0887b0-041d-4e7a-a5e5-7cf8315721f0" data-file-name="app/dashboard/components/AdminDashboard.tsx">Total Kelas</span></h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white" data-unique-id="6436c570-1635-46b1-ac5e-13625ca10d4b" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">{stats.totalClasses}</p>
              <div className="text-xs text-white mt-1 sm:mt-2" data-unique-id="59ee71a9-0ae3-4c7e-9e11-1160cedd31f0" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <span data-unique-id="58954e72-69e3-46b5-b1a4-db7ca82bdb53" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="eae6c58d-614c-4ffa-8ae3-55a184cc32af" data-file-name="app/dashboard/components/AdminDashboard.tsx">Pada Semester ini</span></span>
              </div>
            </div>
            
            <div className="bg-orange-500 rounded-xl p-3 sm:p-5 text-white" data-unique-id="411c25fe-cc66-460d-b099-5e0c09fe7e93" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <div className="flex items-center mb-1" data-unique-id="02758734-8065-4142-8b7b-7f264cd41aa5" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-white mr-1.5 sm:mr-2" />
                <h3 className="text-xs sm:text-sm font-medium text-white" data-unique-id="1a370514-de4d-4eb1-8b37-21452410d697" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="d5c00b9e-a4d7-4776-93f8-d0a922d1c31e" data-file-name="app/dashboard/components/AdminDashboard.tsx">Kehadiran</span></h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white" data-unique-id="5200d142-7a22-4f69-983f-1bcbbbd7554c" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">{stats.attendanceRate}<span className="editable-text" data-unique-id="40e8a4d1-31e2-4882-9cc8-800c5bf92b0e" data-file-name="app/dashboard/components/AdminDashboard.tsx">%</span></p>
              <div className="text-xs text-white mt-1 sm:mt-2" data-unique-id="1c72ce2e-f41d-4ca2-9590-f46ed7468480" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <span data-unique-id="1f1ef708-ef66-45f0-83ed-c6e299bc96a7" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="aa863641-3084-43e5-8c91-ef71233081e3" data-file-name="app/dashboard/components/AdminDashboard.tsx">Pada Bulan ini</span></span>
              </div>
            </div>
            
            <div className="bg-green-500 rounded-xl p-3 sm:p-5 text-white" data-unique-id="7e4b1d68-63de-4137-9a4d-5ec84887ccc6" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <div className="flex items-center mb-1" data-unique-id="520d2586-ca25-413d-8df5-8695b47e790f" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-white mr-1.5 sm:mr-2" />
                <h3 className="text-xs sm:text-sm font-medium text-white" data-unique-id="b987e881-4a77-4a75-b915-f8461ba549f4" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="aba8ded7-09b9-43eb-8f1a-7512ad064e2b" data-file-name="app/dashboard/components/AdminDashboard.tsx">Guru Aktif</span></h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white" data-unique-id="26bc7049-754e-4bd4-b6e8-480b6e8d7b7c" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">{stats.totalTeachers}</p>
              <div className="text-xs text-white mt-1 sm:mt-2" data-unique-id="5216d7e4-5e9b-4707-9bf7-734622e5110a" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <span data-unique-id="e4386820-9eec-4438-9bf4-30fc835ba6d9" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="9ff73c10-ece6-4f91-96e0-5ac940df858b" data-file-name="app/dashboard/components/AdminDashboard.tsx">Pada Semester ini</span></span>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="mb-6 bg-yellow-50 p-4 sm:p-6 rounded-xl" data-unique-id="c8063c48-aac7-44ec-836e-781606bcd52e" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
            <div className="flex items-center mb-3 sm:mb-4" data-unique-id="7bd12a25-3d06-4828-8500-e1fbb7f36f09" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3" data-unique-id="72b5600b-bec3-4293-a772-fc269462ea48" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <Users className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold" data-unique-id="90b50b96-5b07-4d8c-83a9-7ce0f0939e6e" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="60c76bf6-b853-4f82-a72e-d9711ebeb1e9" data-file-name="app/dashboard/components/AdminDashboard.tsx">Riwayat Kehadiran</span></h2>
            </div>
            
            {loading ? <div className="flex justify-center items-center py-8 sm:py-10" data-unique-id="6a76cf26-8a48-46f7-ae1e-3dea50c1dda8" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <Loader2 className="h-7 sm:h-8 w-7 sm:w-8 text-primary animate-spin" />
              </div> : <div className="overflow-x-auto -mx-4 sm:mx-0" data-unique-id="bd0aae13-0d70-4de1-b476-2af678c64d32" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <table className="min-w-full divide-y divide-gray-200" data-unique-id="a68ffdc1-a053-41c1-bdb6-c54774dced0f" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                  <thead className="bg-gray-50" data-unique-id="0a0d4d4c-82d4-4df9-8f62-946316dddfe9" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                    <tr data-unique-id="fdb21544-734a-4b23-a05a-18fd130fa42a" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                      <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="155229d6-3bd8-45e4-a5f6-14f362e5bae9" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="3d012e65-dabe-4a01-b58f-c058a0c3b15b" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        Nama
                      </span></th>
                      <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="690a35f5-6281-46a1-b362-630a3bf2067a" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="fd783f09-7891-496f-bf18-e067c0c17eb1" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        Kelas
                      </span></th>
                      <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="ca76c58b-2f8e-422f-b0e1-498bc4337339" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="84f875c4-7a39-4aeb-9161-2aa80aef142d" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        Status
                      </span></th>
                      <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="f8675923-2a67-4770-a17c-a4d5eca695ac" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="6c101672-5c5b-4b51-ad84-0e3b936d2547" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        Tanggal
                      </span></th>
                      <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="c0656139-a8f0-4486-8def-e91573e2a587" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="d02b7121-a597-438b-9b02-c05d3437aa24" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        Waktu
                      </span></th>
                      <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="0d7f74cc-b052-4e31-975b-a091b8b5c26c" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="1963469e-3c6e-43e0-9500-53377da4ea92" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        Catatan
                      </span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200" data-unique-id="223ccd70-517c-44e7-b6d2-cb399a1f9f1c" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
                    {recentAttendance.length > 0 ? recentAttendance.map(record => <tr key={record.id} data-is-mapped="true" data-unique-id="f11e8f19-4067-4080-9a4f-11c4446e7f41" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap" data-is-mapped="true" data-unique-id="a1fdda44-c36f-44f4-ba8c-f29b4fc30a52" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                            <div className="font-medium text-gray-900 text-xs" data-is-mapped="true" data-unique-id="0c6254f3-a6e4-4746-b0a8-4247f4d6f825" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">{record.studentName}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500" data-is-mapped="true" data-unique-id="3424d140-1c3b-442e-af82-0b77c66137de" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
                            {record.class}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap" data-is-mapped="true" data-unique-id="ae001407-3603-49c4-8b65-b73f5fc7fd09" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'hadir' || record.status === 'present' ? 'bg-green-100 text-green-800' : record.status === 'sakit' || record.status === 'sick' ? 'bg-orange-100 text-orange-800' : record.status === 'izin' || record.status === 'permitted' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`} data-is-mapped="true" data-unique-id="8f9805cd-f925-4b52-8b43-477cc4240238" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
                              {record.status === 'hadir' || record.status === 'present' ? 'Hadir' : record.status === 'sakit' || record.status === 'sick' ? 'Sakit' : record.status === 'izin' || record.status === 'permitted' ? 'Izin' : 'Alpha'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500" data-is-mapped="true" data-unique-id="5ed47a14-c136-4603-8dde-23f93e8fe1d8" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
                            {record.date ? record.date.split('-').reverse().join('-') : '-'}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500" data-is-mapped="true" data-unique-id="b74c292b-67f8-4346-836f-a22dabebe2ff" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
                            {record.time}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500" data-is-mapped="true" data-unique-id="e6a57a75-ca32-46df-b5cc-7bf224242460" data-file-name="app/dashboard/components/AdminDashboard.tsx" data-dynamic-text="true">
                            {record.notes || record.note || record.catatan || '-'}
                          </td>
                        </tr>) : <tr data-unique-id="bfc0c649-6b60-4e80-94bc-f326ad3e3900" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                        <td colSpan={4} className="px-4 py-3 text-center text-gray-500" data-unique-id="c698134a-59a7-4aa5-aa40-d6bca371e888" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="91f81ed5-82a7-482c-a6cc-a116a0e1f788" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                          Belum ada data kehadiran
                        </span></td>
                      </tr>}
                  </tbody>
                </table>
              </div>}
          </div>

          {/* Admin Quick Access */}
          <div className="mb-6" data-unique-id="f1bed5a9-e635-44d7-8f60-e6f6bdec4206" data-file-name="app/dashboard/components/AdminDashboard.tsx">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center" data-unique-id="6d3ae9d7-1f26-4020-96ac-31e2b1207635" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <Settings className="h-4 sm:h-5 w-4 sm:w-5 text-primary mr-1.5 sm:mr-2" /><span className="editable-text" data-unique-id="d783bffe-f356-4461-8b7b-e599fa6cd159" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              Akses Cepat Admin
            </span></h2>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4" data-unique-id="02279f98-f99e-4915-9ba6-dffe8228d89b" data-file-name="app/dashboard/components/AdminDashboard.tsx">
              <Link href="/dashboard/students/add" className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-sm p-5 hover:shadow-md transition-all text-white" data-unique-id="2a73da23-a601-4cc2-af8e-03be1718b1a8" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="58009d9a-8a11-467b-869f-cc7328cd7b29" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                  <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full mb-3" data-unique-id="acbe57ea-624d-4233-b413-955f90f876cc" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center" data-unique-id="01a994de-96dd-435e-a3d2-41ade6099394" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="716d0c05-81ac-4878-bc77-ca3b6c4926c1" data-file-name="app/dashboard/components/AdminDashboard.tsx">Tambah Siswa</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/classes" className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-sm p-5 hover:shadow-md transition-all text-white" data-unique-id="4cc1a1cd-caf0-4409-b527-711e82954b73" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="60472927-675f-4578-8e94-283a365e3ce0" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                  <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full mb-3" data-unique-id="54d731af-2a18-4e16-abf2-c80b0851f18c" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center" data-unique-id="f8934491-3c06-443a-bafa-886396d5deb7" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="d802c507-4180-456c-9fbc-d6541dc2e970" data-file-name="app/dashboard/components/AdminDashboard.tsx">Kelola Kelas</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/attendance-history" className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl shadow-sm p-5 hover:shadow-md transition-all text-white" data-unique-id="20c1ead9-5022-42e5-8f98-ca2babaf012b" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="a465b8e3-0ca8-41df-b55a-12cf76495300" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                  <div className="bg-amber-400 bg-opacity-30 p-3 rounded-full mb-3" data-unique-id="2cfa9f92-e119-4144-a6f0-41564e22578a" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center" data-unique-id="e63d0bed-5d71-4516-a0d8-f5095c351f84" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="f28c81bf-0c2a-4e86-9e74-da1310769c62" data-file-name="app/dashboard/components/AdminDashboard.tsx">Riwayat Absen</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/user-management" className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-sm p-5 hover:shadow-md transition-all text-white" data-unique-id="7ff024de-0150-41b5-bb2d-262adad9f94d" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="6df70bad-4a06-4c6c-ac28-76af8d5dc328" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                  <div className="bg-green-400 bg-opacity-30 p-3 rounded-full mb-3" data-unique-id="9fdf47f8-f40c-4d09-a3b9-74fe8dbd969f" data-file-name="app/dashboard/components/AdminDashboard.tsx">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center" data-unique-id="41df2729-f74a-4961-a28e-dffc5d4bc10b" data-file-name="app/dashboard/components/AdminDashboard.tsx"><span className="editable-text" data-unique-id="4997bb31-914d-483e-8322-a3472eeeb786" data-file-name="app/dashboard/components/AdminDashboard.tsx">Setting User</span></h3>
                </div>
              </Link>
            </div>
          </div>
        </>}
    <hr className="border-t border-none mb-5" />
    <hr className="border-t border-none mb-5" />
    </div>;
}
