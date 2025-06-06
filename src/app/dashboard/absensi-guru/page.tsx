"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, MapPin, Clock, Zap, Camera, Settings, FileText, PlusCircle, Loader2, History } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
export default function AbsensiGuruPage() {
 const {
   user,
   userRole,
   schoolId
 } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({
   totalTeachers: 0,
   presentToday: 0,
   lateToday: 0,
   absentToday: 0,
   izinToday: 0,
   alphaToday: 0
 });
 const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
 // Load dashboard data
 useEffect(() => {
   // Check authorization
   if (userRole !== 'admin') {
     toast.error("Anda tidak memiliki akses ke halaman ini");
     router.push('/dashboard');
     return;
   }
   const loadData = async () => {
     if (!schoolId) return;
     try {
       setLoading(true);
       // Get teacher data
       const {
         collection,
         query,
         where,
         getDocs,
         orderBy,
         limit
       } = await import("firebase/firestore");
       const {
         db
       } = await import("@/lib/firebase");
       // Get teachers count
       const teachersRef = collection(db, "users");
       const teachersQuery = query(teachersRef, where("schoolId", "==", schoolId), where("role", "in", ["teacher", "staff"]));
       const teachersSnapshot = await getDocs(teachersQuery);
       const teachersCount = teachersSnapshot.size;
       // Get today's date
       const today = new Date();
       const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
       // Get today's attendance
       const attendanceRef = collection(db, "teacherAttendance");
       const attendanceQuery = query(attendanceRef, where("schoolId", "==", schoolId), where("date", "==", todayStr), orderBy("timestamp", "desc"));
       const attendanceSnapshot = await getDocs(attendanceQuery);
       const attendance = attendanceSnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       }));
       // Calculate stats
       const presentToday = attendance.filter(a => (a as any).status === "present").length;
       const lateToday = attendance.filter(a => (a as any).status === "late").length;
       const izinToday = attendance.filter(a => (a as any).status === "izin").length;
       const alphaToday = attendance.filter(a => (a as any).status === "alpha").length;
       const absentToday = teachersCount - presentToday - lateToday - izinToday - alphaToday;

       setStats({
         totalTeachers: teachersCount,
         presentToday,
         lateToday,
         absentToday,
         izinToday,
         alphaToday
       });
       // Get recent attendance records
       const recentAttendanceRef = collection(db, "teacherAttendance");
       const recentAttendanceQuery = query(recentAttendanceRef, where("schoolId", "==", schoolId), orderBy("timestamp", "desc"), limit(5));
       const recentAttendanceSnapshot = await getDocs(recentAttendanceQuery);
       const recentAttendanceData = recentAttendanceSnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       }));
       setRecentAttendance(recentAttendanceData);
     } catch (error) {
       console.error("Error loading teacher attendance data:", error);
       toast.error("Gagal memuat data absensi guru");
     } finally {
       setLoading(false);
     }
   };
   loadData();
 }, [schoolId, userRole, router]);
 // Format date function
 const formatDate = (dateStr: string) => {
   const options: Intl.DateTimeFormatOptions = {
     day: 'numeric',
     month: 'long',
     year: 'numeric'
   };
   return new Date(dateStr).toLocaleDateString('id-ID', options);
 };
 // Function to get status display
 const getStatusDisplay = (status: string) => {
   switch (status) {
     case "present":
       return {
         text: "Tepat Waktu",
         className: "bg-green-100 text-green-800"
       };
     case "late":
       return {
         text: "Terlambat",
         className: "bg-orange-100 text-orange-800"
       };
     case "izin":
       return {
         text: "Izin",
         className: "bg-blue-100 text-blue-800"
       };
     case "alpha":
       return {
         text: "Alpha",
         className: "bg-red-100 text-red-800"
       };
     default:
       return {
         text: "Tidak Hadir",
         className: "bg-gray-100 text-gray-800"
       };
   }
 };
 return <div className="pb-20 md:pb-6">
     <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
       <div className="flex items-center mb-4 md:mb-0">
         <Users className="h-7 w-7 text-primary mr-3" />
         <h1 className="text-2xl font-bold text-gray-800">Dashboard Absensi Guru Berbasis Lokasi</h1>
       </div>

       <div className="flex gap-3">
         {/*<Link href="/dashboard/absensi-guru/scan" className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors">
           <Camera size={18} />
           <span>Scan Absensi</span>
         </Link>
         <Link href="/dashboard/absensi-guru/data" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
           <PlusCircle size={18} />
           <span>Kelola Data</span>
         </Link>*/}
       </div>
     </div>

     {loading ? <div className="flex justify-center items-center h-64">
         <Loader2 className="h-12 w-12 text-primary animate-spin" />
       </div> : <>
         {/* Stats Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
           <motion.div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md" initial={{
         opacity: 0,
         y: 20
       }} animate={{
         opacity: 1,
         y: 0
       }} transition={{
         duration: 0.3
       }}>
             <div className="flex items-center mb-1">
               <Users className="h-7 w-7 text-white mr-3" />
               <h3 className="font-semibold text-base">Jumlah Guru</h3>
             </div>
             <p className="text-2xl font-bold">{stats.totalTeachers}</p>
             <p className="text-xs text-blue-100 mt-1">Terdaftar di sistem</p>
           </motion.div>

           <motion.div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md" initial={{
         opacity: 0,
         y: 20
       }} animate={{
         opacity: 1,
         y: 0
       }} transition={{
         duration: 0.3,
         delay: 0.1
       }}>
             <div className="flex items-center mb-1">
               <Zap className="h-7 w-7 text-white mr-3" />
               <h3 className="font-semibold text-base">Tepat Waktu</h3>
             </div>
             <p className="text-2xl font-bold">{stats.presentToday}</p>
             <p className="text-xs text-green-100 mt-1">Guru tepat waktu hari ini</p>
           </motion.div>

           <motion.div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md" initial={{
         opacity: 0,
         y: 20
       }} animate={{
         opacity: 1,
         y: 0
       }} transition={{
         duration: 0.3,
         delay: 0.2
       }}>
             <div className="flex items-center mb-1">
               <Clock className="h-7 w-7 text-white mr-3" />
               <h3 className="font-semibold text-base">Terlambat</h3>
             </div>
             <p className="text-2xl font-bold">{stats.lateToday}</p>
             <p className="text-xs text-orange-100 mt-1">Guru terlambat hari ini</p>
           </motion.div>

           <motion.div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md" initial={{
         opacity: 0,
         y: 20
       }} animate={{
         opacity: 1,
         y: 0
       }} transition={{
         duration: 0.3,
         delay: 0.3
       }}>
             <div className="flex items-center mb-1">
               <Calendar className="h-7 w-7 text-white mr-3" />
               <h3 className="font-semibold text-base">Belum Absen</h3>
             </div>
             <p className="text-2xl font-bold">{stats.absentToday}</p>
             <p className="text-xs text-red-100 mt-1">Guru belum absen hari ini</p>
           </motion.div>
         </div>

         {/* Recent Attendance */}
         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
           <div className="p-3 border-b border-gray-100">
             <h2 className="text-lg font-semibold flex items-center">
               <History className="h-5 w-5 text-primary mr-2" />
               Riwayat Absensi Terbaru
             </h2>
           </div>

           {recentAttendance.length > 0 ? <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="bg-gray-50 text-left">
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Absensi</th>
                     <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                   {recentAttendance.map(entry => {
                     const statusDisplay = getStatusDisplay(entry.status);
                     return (
                       <tr key={entry.id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{entry.teacherName}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(entry.date)}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.time}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {entry.type === "in" ? "Masuk" : "Pulang"}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.className}`}>
                             {statusDisplay.text}
                           </span>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div> : <div className="text-center py-12 text-gray-500">
               Belum ada data absensi guru
             </div>}

           <div className="p-4 border-t border-gray-100 flex justify-end">
             <Link href="/dashboard/absensi-guru/reports" className="text-primary font-medium hover:underline text-sm flex items-center">
               Lihat semua riwayat
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
               </svg>
             </Link>
           </div>
         </div>
         {/* Quick Access */}
         <div className="bg-white rounded-xl shadow-sm p-3 mb-6 mt-4">
           <h2 className="text-lg font-semibold mb-4 flex items-center">
             <Zap className="h-5 w-5 text-primary mr-2" />
             Akses Cepat Admin
           </h2>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <Link href="/dashboard/absensi-guru/attendance-table" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
               <Camera className="h-10 w-10 text-blue-600 mb-2" />
               <span className="font-medium text-blue-800">Absensi Guru</span>
             </Link>

             <Link href="/dashboard/absensi-guru/data" className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
               <Users className="h-10 w-10 text-green-600 mb-2" />
               <span className="font-medium text-green-800">Data Guru</span>
             </Link>

             <Link href="/dashboard/absensi-guru/reports" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
               <FileText className="h-10 w-10 text-purple-600 mb-2" />
               <span className="font-medium text-purple-800">Laporan</span>
             </Link>

             <Link href="/dashboard/absensi-guru/settings" className="flex flex-col items-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors">
               <Settings className="h-10 w-10 text-amber-600 mb-2" />
               <span className="font-medium text-amber-800">Pengaturan</span>
             </Link>
           </div>
         </div>
       </>}
   </div>;
}
