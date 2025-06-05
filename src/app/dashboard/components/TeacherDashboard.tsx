"use client";
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Users, BookOpen, FileText, Scan, QrCode, Calendar, Clock, CheckCircle, XCircle, BarChart2, PieChart, AlertCircle, Settings, Loader2, School, UserCheck } from "lucide-react";
import DynamicDashboard from "@/components/DynamicDashboard";
import DashboardPopups from "@/components/DashboardPopups";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
interface TeacherDashboardProps {
 schoolName: string;
 userName: string;
 stats: {
   totalStudents: number;
   totalClasses: number;
   attendanceRate: number;
   totalTeachers: number;
 };
 recentAttendance: any[];
 loading: boolean;
}
export default function TeacherDashboard({
 schoolName,
 userName,
 stats,
 recentAttendance,
 loading
}: TeacherDashboardProps) {
 const { schoolId, userRole, user } = useAuth();
 const [attendanceStats, setAttendanceStats] = useState({
   present: 0,
   sick: 0,
   permitted: 0,
   absent: 0,
   total: 0
 });
 const [localStats, setLocalStats] = useState(stats);
 const [localLoading, setLocalLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 // Static dashboard only
 const showDynamicDashboard = false;
 // Get current date and time
 const currentDate = new Date();
 const formattedDate = new Intl.DateTimeFormat('id-ID', {
   weekday: 'long',
   year: 'numeric',
   month: 'long',
   day: 'numeric'
 }).format(currentDate);
 // Load additional teacher-specific data with proper error handling
 useEffect(() => {
   const loadTeacherData = async () => {
     if (!schoolId || !user) return;

     try {
       setLocalLoading(true);
       setError(null);
       // Ensure user is authenticated and token is valid
       await user.getIdToken(true);
       // Try to get basic school stats that teacher should have access to
       const studentsRef = collection(db, `schools/${schoolId}/students`);
       const studentsSnapshot = await getDocs(studentsRef);

       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const classesSnapshot = await getDocs(classesRef);
       // Get today's attendance for quick stats
       const today = new Date().toISOString().split('T')[0];
       const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
       const todayAttendanceQuery = query(
         attendanceRef,
         where("date", "==", today)
       );
       const todayAttendanceSnapshot = await getDocs(todayAttendanceQuery);
       // Calculate attendance stats
       let present = 0, sick = 0, permitted = 0, absent = 0;
       todayAttendanceSnapshot.forEach(doc => {
         const data = doc.data();
         switch(data.status) {
           case 'present':
           case 'hadir':
             present++;
             break;
           case 'sick':
           case 'sakit':
             sick++;
             break;
           case 'permitted':
           case 'izin':
             permitted++;
             break;
           case 'absent':
           case 'alpha':
             absent++;
             break;
         }
       });
       const total = present + sick + permitted + absent;
       const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
       // Update local stats
       setLocalStats({
         totalStudents: studentsSnapshot.size,
         totalClasses: classesSnapshot.size,
         attendanceRate: attendanceRate,
         totalTeachers: stats.totalTeachers // Keep from props if available
       });
       setAttendanceStats({
         present,
         sick,
         permitted,
         absent,
         total
       });
     } catch (error: any) {
       console.error("Error loading teacher data:", error);

       // Handle specific Firebase errors
       if (error.code === 'permission-denied') {
         setError("Anda tidak memiliki izin untuk mengakses data ini. Silakan hubungi administrator.");
       } else if (error.code === 'unauthenticated') {
         setError("Sesi Anda telah berakhir. Silakan login kembali.");
       } else if (error.code === 'unavailable') {
         setError("Layanan sedang tidak tersedia. Silakan coba lagi nanti.");
       } else {
         setError("Terjadi kesalahan saat memuat data. Silakan refresh halaman.");
       }

       // Use fallback stats from props
       setLocalStats(stats);
     } finally {
       setLocalLoading(false);
     }
   };
   loadTeacherData();
 }, [schoolId, user, stats]);
 // Calculate attendance statistics from recent attendance data
 useEffect(() => {
   if (recentAttendance && recentAttendance.length > 0) {
     const today = new Date().toISOString().split('T')[0];
     // Filter today's attendance
     const todayAttendance = recentAttendance.filter(record => record.date === today);
     const stats = {
       present: 0,
       sick: 0,
       permitted: 0,
       absent: 0,
       total: todayAttendance.length
     };
     todayAttendance.forEach(record => {
       if (record.status === "present" || record.status === "hadir") {
         stats.present++;
       } else if (record.status === "sick" || record.status === "sakit") {
         stats.sick++;
       } else if (record.status === "permitted" || record.status === "izin") {
         stats.permitted++;
       } else if (record.status === "absent" || record.status === "alpha") {
         stats.absent++;
       }
     });
     setAttendanceStats(stats);
   }
 }, [recentAttendance]);
 // Show error state if there's an error
 if (error) {
   return (
     <div>
       {/* Dashboard Popups Component */}
       <DashboardPopups schoolId={schoolId} userRole={userRole} />
       {/* Error State */}
       {/*<div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
         <div className="flex items-center">
           <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
           <div>
             <h2 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h2>
             <p className="text-red-700 mb-4">{error}</p>
             <button
               onClick={() => window.location.reload()}
               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
             >
               Muat Ulang Halaman
             </button>
           </div>
         </div>
       </div>*/}
       {/* Basic Navigation */}
       <div className="bg-white rounded-xl shadow-sm p-6">
         <h2 className="text-lg font-semibold mb-4">Akses Cepat</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
           <Link href="/dashboard/scan" className="bg-[#4361EE] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
             <div className="flex flex-col items-center justify-center">
               <div className="bg-[#4361EE] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                 <QrCode className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
               </div>
               <h3 className="font-medium text-white text-center text-sm sm:text-sm">Scan QR Code</h3>
             </div>
           </Link>

           <Link href="/dashboard/students/qr" className="bg-[#F72585] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
             <div className="flex flex-col items-center justify-center">
               <div className="bg-[#F72585] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                 <QrCode className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
               </div>
               <h3 className="font-medium text-white text-center text-sm sm:text-sm">QR Code Siswa</h3>
             </div>
           </Link>
         </div>
       </div>
     </div>
   );
 }
 return (
   <div>
     {/* Dashboard Popups Component */}
     <DashboardPopups schoolId={schoolId} userRole={userRole} />
     {/* Greeting Section */}
     {/*<div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 mb-6 rounded-xl shadow-lg">
       <div className="flex items-center">
         <div className="bg-white/20 p-3 rounded-full mr-4">
           <UserCheck className="h-8 w-8 text-white" />
         </div>
         <div>
           <h1 className="text-2xl font-bold mb-1">
             Hai, {userName}
           </h1>
           <p className="text-emerald-100 text-sm">
             Selamat datang di Dashboard Guru
           </p>
           <p className="text-emerald-100 text-xs mt-1">
             {formattedDate}
           </p>
         </div>
       </div>
     </div>*/}
     {/* Dashboard content */}
     {showDynamicDashboard ? (
       // Dynamic Dashboard
       <div className="mb-6">
         <DynamicDashboard userRole={userRole} schoolId={schoolId} />
       </div>
     ) : (
       <>
         {/* School Information */}
         <div className="bg-blue-600 text-white p-5 mb-6 rounded-xl">
           <div className="flex items-center mb-1">
             <School className="h-4 w-4 text-white mr-1.5" />
             <h3 className="text-sm font-medium text-white">DATA SEKOLAH</h3>
           </div>
           <p className="text-lg font-bold text-white">{schoolName}</p>
           <div className="flex items-center mt-2 text-xs text-white">
             <span>Tahun Pelajaran 2024/2025</span>
             <span className="mx-2">•</span>
             <span className="flex items-center">
               <span className="mr-1 h-2 w-2 bg-green-300 rounded-full inline-block animate-pulse"></span>
               Aktif
             </span>
           </div>
         </div>
         {/* Stats Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
           <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 border border-blue-200">
             <div className="flex items-center gap-3 mb-2">
               <div className="bg-blue-100 p-2 rounded-lg">
                 <Users className="h-5 w-5 text-blue-600" />
               </div>
               <h3 className="text-sm font-medium text-gray-600">Total Semua Siswa</h3>
             </div>
             {localLoading ? (
               <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
             ) : (
               <p className="text-1xl text-center font-bold text-blue-600">{localStats.totalStudents} Siswa</p>
             )}
           </div>
           <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2 border border-green-200">
             <div className="flex items-center gap-3 mb-2">
               <div className="bg-green-100 p-2 rounded-lg">
                 <BookOpen className="h-5 w-5 text-green-600" />
               </div>
               <h3 className="text-sm font-medium text-gray-600">Total Semua Kelas</h3>
             </div>
             {localLoading ? (
               <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
             ) : (
               <p className="text-1xl text-center font-bold text-green-600">{localStats.totalClasses} Kelas</p>
             )}
           </div>
           <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-2 border border-purple-200">
             <div className="flex items-center gap-3 mb-2">
               <div className="bg-purple-100 p-2 rounded-lg">
                 <BarChart2 className="h-5 w-5 text-purple-600" />
               </div>
               <h3 className="text-sm font-medium text-gray-600">Tingkat Kehadiran</h3>
             </div>
             {localLoading ? (
               <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
             ) : (
               <p className="text-1xl text-center font-bold text-purple-600">{localStats.attendanceRate} Persen</p>
             )}
           </div>
           <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-2 border border-orange-200">
             <div className="flex items-center gap-3 mb-2">
               <div className="bg-orange-100 p-2 rounded-lg">
                 <CheckCircle className="h-5 w-5 text-orange-600" />
               </div>
               <h3 className="text-sm font-medium text-gray-600">Total Siswa Hadir Hari Ini</h3>
             </div>
             {localLoading ? (
               <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
             ) : (
               <p className="text-1xl text-center font-bold text-orange-600">{attendanceStats.present} Siswa</p>
             )}
           </div>
         </div>
         {/* Teacher Quick Access */}
         <div className="mb-6">
           <div className="flex items-center mb-4">
             <div className="bg-blue-100 p-2 rounded-lg mr-3">
               <Settings className="h-5 w-5 text-blue-600" />
             </div>
             <h2 className="text-lg font-semibold text-gray-800">Akses Cepat Guru</h2>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
             <Link href="/dashboard/scan" className="bg-[#4361EE] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
               <div className="flex flex-col items-center justify-center">
                 <div className="bg-[#4361EE] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                   <QrCode className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
                 </div>
                 <h3 className="font-medium text-white text-center text-sm sm:text-sm">Scan QR Code</h3>
               </div>
             </Link>

             <Link href="/dashboard/students/qr" className="bg-[#F72585] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
               <div className="flex flex-col items-center justify-center">
                 <div className="bg-[#F72585] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                   <QrCode className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
                 </div>
                 <h3 className="font-medium text-white text-center text-sm sm:text-sm">QR Code Siswa</h3>
               </div>
             </Link>

             <Link href="/dashboard/reports" className="bg-[#21A366] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
               <div className="flex flex-col items-center justify-center">
                 <div className="bg-[#21A366] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                   <FileText className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
                 </div>
                 <h3 className="font-medium text-white text-center text-sm sm:text-sm">Laporan</h3>
               </div>
             </Link>

             <Link href="/dashboard/students" className="bg-[#F77F00] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
               <div className="flex flex-col items-center justify-center">
                 <div className="bg-[#F77F00] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                   <Users className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
                 </div>
                 <h3 className="font-medium text-white text-center text-sm sm:text-sm">Daftar Siswa</h3>
               </div>
             </Link>
             <Link href="/dashboard/absensi-guru/scan" className="bg-[#7B2CBF] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
               <div className="flex flex-col items-center justify-center">
                 <div className="bg-[#7B2CBF] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                   <QrCode className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
                 </div>
                 <h3 className="font-medium text-white text-center text-sm sm:text-sm">Absensi Guru</h3>
               </div>
             </Link>

             <Link href="/dashboard/profile-user" className="bg-[#4361EE] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
               <div className="flex flex-col items-center justify-center">
                 <div className="bg-[#4361EE] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                   <FileText className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
                 </div>
                 <h3 className="font-medium text-white text-center text-sm sm:text-sm">Profile Saya</h3>
               </div>
             </Link>
           </div>
         </div>
       </>
     )}
    <hr className="border-t border-none mb-5" />
    <hr className="border-t border-none mb-5" />
    <hr className="border-t border-none mb-5" />
    <hr className="border-t border-none mb-5" />
   </div>
 );
}
