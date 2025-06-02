"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, Clock, TrendingUp, QrCode, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardPopups from "@/components/DashboardPopups";
interface TeacherStats {
 totalStudents: number;
 presentToday: number;
 absentToday: number;
 lateToday: number;
}
export default function TeacherDashboard() {
 const { user, userRole, schoolId } = useAuth();
 const [stats, setStats] = useState<TeacherStats>({
   totalStudents: 0,
   presentToday: 0,
   absentToday: 0,
   lateToday: 0
 });
 const [loading, setLoading] = useState(true);
 useEffect(() => {
   const fetchStats = async () => {
     if (!schoolId) return;

     try {
       setLoading(true);

       // In real implementation, fetch actual data from Firestore
       // For now, using sample data
       const sampleStats: TeacherStats = {
         totalStudents: 150,
         presentToday: 142,
         absentToday: 5,
         lateToday: 3
       };

       setStats(sampleStats);
     } catch (error) {
       console.error("Error fetching teacher stats:", error);
     } finally {
       setLoading(false);
     }
   };
   fetchStats();
 }, [schoolId]);
 const getCurrentDate = () => {
   return new Date().toLocaleDateString('id-ID', {
     weekday: 'long',
     year: 'numeric',
     month: 'long',
     day: 'numeric'
   });
 };
 const getCurrentTime = () => {
   return new Date().toLocaleTimeString('id-ID', {
     hour: '2-digit',
     minute: '2-digit'
   });
 };
 const [currentTime, setCurrentTime] = useState(getCurrentTime());
 useEffect(() => {
   const timer = setInterval(() => {
     setCurrentTime(getCurrentTime());
   }, 1000);
   return () => clearInterval(timer);
 }, []);
 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
     {/* Dashboard Popups Component */}
     <DashboardPopups
       schoolId={schoolId}
       userRole={userRole}
       userEmail={user?.email || null}
     />
     <div className="p-6">
       {/* Header */}
       <div className="mb-8">
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
           <div className="mb-4 lg:mb-0">
             <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
               Dashboard Guru
             </h1>
             <p className="text-gray-600 mt-1">
               Selamat datang kembali, {user?.displayName || user?.email}
             </p>
           </div>

           <div className="flex flex-col sm:flex-row sm:items-center gap-4">
             <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
               <div className="flex items-center gap-2">
                 <Calendar className="h-4 w-4 text-blue-600" />
                 <span className="text-sm font-medium text-gray-700">{getCurrentDate()}</span>
               </div>
             </div>
             <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
               <div className="flex items-center gap-2">
                 <Clock className="h-4 w-4 text-blue-600" />
                 <span className="text-sm font-medium text-gray-700">{currentTime}</span>
               </div>
             </div>
           </div>
         </div>
       </div>
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
         >
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600 mb-1">Total Siswa</p>
               <p className="text-3xl font-bold text-gray-900">
                 {loading ? "..." : stats.totalStudents.toLocaleString()}
               </p>
             </div>
             <div className="bg-blue-100 p-3 rounded-lg">
               <Users className="h-6 w-6 text-blue-600" />
             </div>
           </div>
           <div className="mt-4">
             <div className="flex items-center text-sm text-gray-600">
               <TrendingUp className="h-4 w-4 mr-1" />
               <span>Siswa terdaftar</span>
             </div>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
         >
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600 mb-1">Hadir Hari Ini</p>
               <p className="text-3xl font-bold text-green-600">
                 {loading ? "..." : stats.presentToday.toLocaleString()}
               </p>
             </div>
             <div className="bg-green-100 p-3 rounded-lg">
               <CheckCircle className="h-6 w-6 text-green-600" />
             </div>
           </div>
           <div className="mt-4">
             <div className="flex items-center text-sm text-green-600">
               <span>{loading ? "0" : ((stats.presentToday / stats.totalStudents) * 100).toFixed(1)}% dari total siswa</span>
             </div>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
         >
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600 mb-1">Tidak Hadir</p>
               <p className="text-3xl font-bold text-red-600">
                 {loading ? "..." : stats.absentToday.toLocaleString()}
               </p>
             </div>
             <div className="bg-red-100 p-3 rounded-lg">
               <XCircle className="h-6 w-6 text-red-600" />
             </div>
           </div>
           <div className="mt-4">
             <div className="flex items-center text-sm text-red-600">
               <span>{loading ? "0" : ((stats.absentToday / stats.totalStudents) * 100).toFixed(1)}% dari total siswa</span>
             </div>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
         >
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600 mb-1">Terlambat</p>
               <p className="text-3xl font-bold text-amber-600">
                 {loading ? "..." : stats.lateToday.toLocaleString()}
               </p>
             </div>
             <div className="bg-amber-100 p-3 rounded-lg">
               <AlertTriangle className="h-6 w-6 text-amber-600" />
             </div>
           </div>
           <div className="mt-4">
             <div className="flex items-center text-sm text-amber-600">
               <span>{loading ? "0" : ((stats.lateToday / stats.totalStudents) * 100).toFixed(1)}% dari total siswa</span>
             </div>
           </div>
         </motion.div>
       </div>
       {/* Quick Actions */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
         >
           <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Link
               href="/dashboard/scan"
               className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
             >
               <QrCode className="h-6 w-6" />
               <div>
                 <p className="font-medium">Scan Absensi</p>
                 <p className="text-sm text-blue-100">Lakukan absensi siswa</p>
               </div>
             </Link>

             <Link
               href="/dashboard/students"
               className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
             >
               <Users className="h-6 w-6" />
               <div>
                 <p className="font-medium">Data Siswa</p>
                 <p className="text-sm text-green-100">Kelola data siswa</p>
               </div>
             </Link>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.5 }}
           className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
         >
           <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Utama</h2>
           <div className="space-y-3">
             <Link
               href="/dashboard/attendance-history"
               className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <Calendar className="h-5 w-5 text-gray-600" />
                 <span className="font-medium text-gray-700">Riwayat Absensi</span>
               </div>
               <span className="text-sm text-gray-500">→</span>
             </Link>

             <Link
               href="/dashboard/classes"
               className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <Users className="h-5 w-5 text-gray-600" />
                 <span className="font-medium text-gray-700">Daftar Kelas</span>
               </div>
               <span className="text-sm text-gray-500">→</span>
             </Link>

             <Link
               href="/dashboard/reports"
               className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <TrendingUp className="h-5 w-5 text-gray-600" />
                 <span className="font-medium text-gray-700">Laporan</span>
               </div>
               <span className="text-sm text-gray-500">→</span>
             </Link>
           </div>
         </motion.div>
       </div>
     </div>
   </div>
 );
}
