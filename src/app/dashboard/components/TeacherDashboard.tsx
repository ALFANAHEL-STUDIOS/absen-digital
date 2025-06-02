"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Users, BookOpen, FileText, Scan, QrCode, Calendar, Clock, CheckCircle, XCircle, BarChart2, PieChart, AlertCircle, Settings, Loader2, School, UserCheck } from "lucide-react";
import DynamicDashboard from "@/components/DynamicDashboard";
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
  const {
    schoolId,
    userRole
  } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    sick: 0,
    permitted: 0,
    absent: 0,
    total: 0
  });

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
  return <div data-unique-id="5ef19a16-aac9-498d-8903-b01634fd5891" data-file-name="app/dashboard/components/TeacherDashboard.tsx" data-dynamic-text="true">
      {/* Dashboard content */}

      {showDynamicDashboard ?
    // Dynamic Dashboard
    <div className="mb-6" data-unique-id="776caf38-6a74-4bbb-81a3-e7fa1c889b20" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
          <DynamicDashboard userRole={userRole} schoolId={schoolId} />
        </div> : <>
          {/* School Information */}
          <div className="bg-blue-600 text-white p-5 mb-6 rounded-xl" data-unique-id="3957d8b2-0b7e-4bb4-a397-52a3bcc30197" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
            <div className="flex items-center mb-1" data-unique-id="11c15353-00cd-4c55-b54b-e1c063040f0f" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
              <School className="h-4 w-4 text-white mr-1.5" />
              <h3 className="text-sm font-medium text-white" data-unique-id="af19962b-0c21-45fe-b468-2606274dbdb8" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="6045d6ec-2734-450e-ae37-0501f054a3aa" data-file-name="app/dashboard/components/TeacherDashboard.tsx">DATA SEKOLAH</span></h3>
            </div>
            <p className="text-lg font-bold text-white" data-unique-id="22bf21ed-07ae-4075-a901-2132244d34e0" data-file-name="app/dashboard/components/TeacherDashboard.tsx" data-dynamic-text="true">{schoolName}</p>
            <div className="flex items-center mt-2 text-xs text-white" data-unique-id="1c4f0cbe-896d-4af2-ae57-d09e1f795869" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
              <span data-unique-id="366ead59-107f-4baf-8657-42c9c715db00" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="019198a2-4ab9-4361-b642-560ca0dfd1f8" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Tahun Pelajaran 2024/2025</span></span>
              <span className="mx-2" data-unique-id="ae1b8da0-f1a3-4be6-abc2-e95c60926ce3" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="028b453e-545c-4448-a2d4-d8e69ea718a0" data-file-name="app/dashboard/components/TeacherDashboard.tsx">•</span></span>
              <span className="flex items-center" data-unique-id="91fae385-0789-4247-ad6e-784f35626695" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <span className="mr-1 h-2 w-2 bg-green-300 rounded-full inline-block animate-pulse" data-unique-id="74d9e76c-0966-44d4-a987-cb7f764fd78d" data-file-name="app/dashboard/components/TeacherDashboard.tsx"></span><span className="editable-text" data-unique-id="5e1a8b87-fddf-42c4-a7ca-bbe0ff7fd333" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                Aktif
              </span></span>
            </div>
          </div>

          {/* Teacher Quick Access */}
          <div className="mb-6" data-unique-id="cf352b63-c640-4abf-8cc0-94bffbb01af7" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
            <div className="flex items-center mb-4" data-unique-id="fe2bf259-abc8-4194-bfaf-385248659c40" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
              <div className="bg-blue-100 p-2 rounded-lg mr-3" data-unique-id="b29bb49c-137a-4260-833b-56e13b575b6b" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800" data-unique-id="32f1e552-e282-4b08-9cb1-bf2781899bb3" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="ec131399-6996-4784-8011-3998c621e65d" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Akses Cepat Guru</span></h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-4" data-unique-id="faf680a5-abb1-4d6b-9d1a-a26b97e34866" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
              <Link href="/dashboard/scan" className="bg-[#4361EE] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all" data-unique-id="e17c6b6e-a50d-44f8-a5f0-afdb107b4416" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="55adcba4-f5c0-4145-949c-aaa9462ce872" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                  <div className="bg-[#4361EE] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3" data-unique-id="ccc4a34d-71a4-40e4-ad43-24ed381528d5" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center text-xs sm:text-sm" data-unique-id="609c4162-2414-4e4b-a9a8-f0a71c182604" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="2e07b892-3dbd-4194-a764-9d852b6f9a02" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Absensi Siswa</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/students/qr" className="bg-[#F72585] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all" data-unique-id="546ad386-6b69-4ff3-b2b1-c7828e09c765" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="adac5ada-ae57-485b-92f1-b651fef5c1e7" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                  <div className="bg-[#F72585] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3" data-unique-id="47489796-2b71-4aa9-9a0a-517c54d8383a" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center text-xs sm:text-sm" data-unique-id="122f5cd2-39aa-4e19-8248-734fe6d62309" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="ac2dcf78-63d1-48f8-bad2-b8d8e7c1b434" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Kartu QR Siswa</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/reports" className="bg-[#21A366] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all" data-unique-id="c3b1e119-f48d-469c-b66b-73c277ca861b" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="0c6abbe0-88d2-4893-9faa-4496852a1a4c" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                  <div className="bg-[#21A366] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3" data-unique-id="e2281a01-9f0a-41c3-b11f-0895ab3f5e48" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center text-xs sm:text-sm" data-unique-id="b5c6afcb-97e6-4013-b638-9ab0a7f20f77" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="d32a2fc9-a7d4-4dae-ba5a-910272448399" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Laporan Siswa</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/students" className="bg-[#F77F00] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all" data-unique-id="e0e80fc5-0680-4fa3-99da-442407547c15" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="1ce3bb65-6fdf-406f-bb94-6e3cf8cd5e8c" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                  <div className="bg-[#F77F00] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3" data-unique-id="5cdbbac1-c7dc-4c25-b62d-b98f02c7a55c" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center text-xs sm:text-sm" data-unique-id="173cbdc5-7ac9-40ec-92d4-97c6b841c0a3" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="39d4d96f-49e3-47fc-a39d-386d58761837" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Daftar Siswa</span></h3>
                </div>
              </Link>

              <Link href="/dashboard/absensi-guru/scan" className="bg-[#7B2CBF] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all" data-unique-id="a161727c-60aa-4541-a5de-c1788e2885c8" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="a914f2b0-9e26-437c-b7a7-7a56a090b4bd" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                  <div className="bg-[#7B2CBF] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3" data-unique-id="3a2eb2df-62bd-4eb5-ab5d-1feeb5200ac7" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center text-xs sm:text-sm" data-unique-id="dfb50062-edc3-4e96-a6ba-71f0bbc6b5b8" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="ec59fc72-8691-49f1-b3f6-13a8e85f95bd" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Absensi Guru</span></h3>
                </div>
              </Link>
              
              <Link href="/dashboard/profile-user" className="bg-[#4361EE] rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all" data-unique-id="0927d2b6-f13d-450a-9aed-f073dff1b4a5" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                <div className="flex flex-col items-center justify-center" data-unique-id="742981d1-5f9d-4112-beee-68cdaf934354" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                  <div className="bg-[#4361EE] bg-opacity-20 p-2 sm:p-3 rounded-full mb-2 sm:mb-3" data-unique-id="5b61b2f0-a4af-4c2b-a904-7d367fbffa11" data-file-name="app/dashboard/components/TeacherDashboard.tsx">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-center text-xs sm:text-sm" data-unique-id="f89bcb28-45c0-4b22-b124-316c23390feb" data-file-name="app/dashboard/components/TeacherDashboard.tsx"><span className="editable-text" data-unique-id="7ecccc9f-5e96-4e83-a54e-894007aead8c" data-file-name="app/dashboard/components/TeacherDashboard.tsx">Profile Saya</span></h3>
                </div>
              </Link>
            </div>
          </div>
        </>}
    <hr className="border-t border-none mb-5" />
    <hr className="border-t border-none mb-5" />
    
    </div>;
}
