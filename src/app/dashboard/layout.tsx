"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Home, User, School, Settings, Database, LogOut, Menu, X, Bell, ChevronDown, Users, BookOpen, FileText, CheckCircle, Trash2, ChevronLeft, ChevronRight, Scan, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ConfirmDialogWrapper as ConfirmDialog } from '@/components/client-wrappers';
const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const {
    user,
    userRole,
    userData,
    logout,
    loading,
    schoolId
  } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([{
    message: "Berhasil Login",
    time: "5 menit yang lalu",
    read: false
  }, {
    message: "Data siswa berhasil ditambahkan",
    time: "1 jam yang lalu",
    read: false
  }, {
    message: "Laporan bulanan tersedia",
    time: "1 hari yang lalu",
    read: true
  }]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Store notifications in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Load notifications from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    }
  }, []);
  const pathname = usePathname();

  // State to store school name
  const [schoolName, setSchoolName] = useState("Sekolah");

  // Load sidebar state from localStorage - auto-hide disabled
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setSidebarCollapsed(false); // Always show sidebar
      }
    }

    // Fetch school name from Firestore
    const fetchSchoolName = async () => {
      if (schoolId) {
        try {
          const schoolDoc = await getDoc(doc(db, "schools", schoolId));
          if (schoolDoc.exists()) {
            setSchoolName(schoolDoc.data().name || "Sekolah");
          }
        } catch (error) {
          console.error("Error fetching school name:", error);
        }
      }
    };
    fetchSchoolName();
  }, [schoolId]);

  // Save sidebar state to localStorage when changed - auto-hide disabled
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', 'false'); // Always save as not collapsed
    }
  }, [sidebarCollapsed]);

  // Notification functions
  const markNotificationAsRead = index => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].read = true;
    setNotifications(updatedNotifications);
    toast.success('Notifikasi ditandai sebagai dibaca');
  };
  const deleteNotification = index => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    toast.success('Notifikasi dihapus');
  };
  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    toast.success('Semua notifikasi ditandai dibaca');
  };
  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('Semua notifikasi dihapus');

    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  };

  // Get count of unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Ensure user is authenticated with proper role-based access handling
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Get current path
        const path = window.location.pathname;

        // Define restricted paths for each role
        const adminOnlyPaths = ['/dashboard/settings', '/dashboard/data-management'];
        const teacherRestrictedPaths = ['/dashboard/students/add', '/dashboard/classes/add'];
        const studentRestrictedPaths = ['/dashboard/students/add', '/dashboard/classes', '/dashboard/settings', '/dashboard/data-management', '/dashboard/profile-school'];

        // Check permissions based on role
        if (userRole === 'student' && studentRestrictedPaths.some(p => path.startsWith(p))) {
          toast.error('Akses dibatasi untuk siswa');
          router.push('/dashboard');
        } else if (userRole === 'teacher' && teacherRestrictedPaths.some(p => path.startsWith(p))) {
          toast.error('Guru tidak dapat menambah atau menghapus data');
          router.push('/dashboard');
        }
      }
    }
  }, [user, userRole, router, loading]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" data-unique-id="accc0698-452e-40da-bf76-a88c794da4c6" data-file-name="app/dashboard/layout.tsx">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-unique-id="d4a9b26a-fb9e-48cb-8f4a-f58806bebbbc" data-file-name="app/dashboard/layout.tsx"></div>
      </div>;
  }
  if (!user) {
    return null;
  }
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil keluar');
      router.push('/login');
    } catch (error) {
      toast.error('Gagal keluar');
    }
  };
  const openLogoutDialog = () => {
    setLogoutDialogOpen(true);
    setProfileOpen(false);
  };

  // Check if the path is active
  const isActive = (path: string) => {
    return pathname === path;
  };
  return <div className="min-h-screen bg-gray-50 overflow-hidden" data-unique-id="b381d3be-afbe-487c-898a-3cee7559b47b" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
      <Toaster position="top-center" />
      
      {/* Mobile Header */}
      <header className="bg-primary text-white py-2 sm:py-3 px-3 sm:px-4 fixed top-0 left-0 right-0 z-40 shadow-md flex items-center justify-between" data-unique-id="61cee88c-371b-4582-ad28-84cc17ead335" data-file-name="app/dashboard/layout.tsx">
        <div className="flex items-center" data-unique-id="db58def3-ca41-4b7c-94b5-d450fe270c6b" data-file-name="app/dashboard/layout.tsx">
          <button className="mr-3" onClick={() => {
          setMenuOpen(!menuOpen);
          setSidebarCollapsed(!sidebarCollapsed);
        }} data-unique-id="cccb3fa9-00f5-45cd-aa96-98604b8294c7" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2" data-unique-id="c49daf16-1426-47f9-b437-f212a878f144" data-file-name="app/dashboard/layout.tsx">
            <QrCode className="h-6 w-6" />
            <span className="font-bold text-lg" data-unique-id="73a32482-35e7-43ef-aa9d-6ef852b10baf" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="d992ed51-9320-44aa-baed-e4bd3540c979" data-file-name="app/dashboard/layout.tsx">ABSENSI DIGITAL</span></span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3" data-unique-id="045075b4-c036-41b3-a072-d3a35ad5ec80" data-file-name="app/dashboard/layout.tsx">
          <div className="relative" data-unique-id="2d716d30-f37c-480b-95cc-7438b9d837dd" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
            <button className="p-1.5 rounded-full hover:bg-white/20" onClick={() => {
            setNotificationOpen(!notificationOpen);
            setProfileOpen(false);
          }} data-unique-id="39a2c42c-670e-4eb2-b949-527538e57a29" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center" data-unique-id="3dc65366-c2d7-48d0-b920-c1a712a9492a" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
                  {unreadCount}
                </span>}
            </button>
            
            {notificationOpen && <>
                {/* Dark overlay */}
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setNotificationOpen(false)} data-unique-id="427309a8-1b18-481f-8077-0189abe4a75a" data-file-name="app/dashboard/layout.tsx"></div>
                
                <motion.div className="fixed top-[calc(50%-6cm)] left-[calc(40%-3.5cm)] transform -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[450px] max-w-[480px] bg-white rounded-xl shadow-xl z-50 border border-gray-200 max-h-[80vh]" initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.9
            }} data-unique-id="f45c486d-8da7-4f30-9905-b2653b2fdd9c" data-file-name="app/dashboard/layout.tsx">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary to-blue-700 text-white rounded-t-xl" data-unique-id="dd18534e-da4e-4c5b-a9be-7014202bb44c" data-file-name="app/dashboard/layout.tsx">
                  <h3 className="text-base font-semibold" data-unique-id="843fb18d-5d81-4831-a6f2-8dea9fbb2270" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="d24b9cba-72d9-44c2-9b3a-4ab7d6b5cada" data-file-name="app/dashboard/layout.tsx">NOTIFIKASI</span></h3>
                  <div className="flex space-x-2" data-unique-id="1fa7e0fe-915f-40f6-b1e2-00b49bc5dfd1" data-file-name="app/dashboard/layout.tsx">
                    <button onClick={() => markAllNotificationsAsRead()} className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded text-white" data-unique-id="bc0e3203-252a-42ff-a66b-f3a6974ecc25" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="92c39cbd-b563-499f-b8f7-0f6df48e3c84" data-file-name="app/dashboard/layout.tsx">
                      DIBACA
                    </span></button>
                    <button onClick={() => clearAllNotifications()} className="px-2 py-1 text-xs bg-red-500/80 hover:bg-red-600 rounded text-white" data-unique-id="c761cf5b-7152-4583-aeee-ac289f8f47d9" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="8d6a750f-509f-4e57-ad48-17de7a931d0a" data-file-name="app/dashboard/layout.tsx">
                      HAPUS
                    </span></button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto w-full sm:w-auto bg-gray-100/50" data-unique-id="d8d06414-de72-457f-89fc-7f5571052fd9" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
                  {notifications.length > 0 ? notifications.map((notification, index) => <div key={index} className={`px-4 py-3 hover:bg-gray-100 ${notification.read ? 'border-l-4 border-gray-200 bg-white' : 'border-l-4 border-blue-500 bg-blue-50'} flex items-center justify-between mb-1`} data-is-mapped="true" data-unique-id="df791196-96ce-4090-b30f-95fe23bfd41d" data-file-name="app/dashboard/layout.tsx">
                        <div data-is-mapped="true" data-unique-id="99e7a7b1-b046-4666-a6cf-ddc244bdd81d" data-file-name="app/dashboard/layout.tsx">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-primary'}`} data-is-mapped="true" data-unique-id="43e326af-7176-433c-b0e2-b5469192a895" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">{notification.message}</p>
                          <p className="text-xs text-gray-500" data-is-mapped="true" data-unique-id="503781bf-1591-4cab-bf58-ccfc220c769e" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">{notification.time}</p>
                        </div>
                        <div className="flex items-center" data-is-mapped="true" data-unique-id="16698e42-b63f-433f-bd3b-506605c82707" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
                          {!notification.read && <button onClick={() => markNotificationAsRead(index)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md ml-2" title="Tandai dibaca" data-is-mapped="true" data-unique-id="e092c175-a94a-4ba4-bc5e-cff5852dc89d" data-file-name="app/dashboard/layout.tsx">
                              <CheckCircle size={16} data-unique-id="bf3b3a07-584b-49c6-86ef-e4782d149b8a" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true" />
                            </button>}
                          <button onClick={() => deleteNotification(index)} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md ml-2" title="Hapus" data-is-mapped="true" data-unique-id="30de5fb2-3708-4792-a35e-5425af504679" data-file-name="app/dashboard/layout.tsx">
                            <Trash2 size={16} data-unique-id="62d4b3c0-7e7d-48dd-ada6-ad38cbb73070" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true" />
                          </button>
                        </div>
                      </div>) : <div className="px-4 py-6 text-center text-gray-500" data-unique-id="3fc9ff16-021f-4756-9cd9-31ae8093ebe7" data-file-name="app/dashboard/layout.tsx">
                      <p data-unique-id="1d95dc14-5e6c-47ba-80e5-b0392947effe" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="1e5443e4-4b2e-4670-a21b-c00ad63f7850" data-file-name="app/dashboard/layout.tsx">Tidak ada notifikasi</span></p>
                    </div>}
                </div>
                </motion.div>
              </>}
          </div>
          
          <div className="relative" data-unique-id="a4aaa227-5ea5-4f57-8d88-526759fd5e2e" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
            <button className="flex items-center gap-2 py-1.5 px-2 rounded-full hover:bg-white/20" onClick={() => {
            setProfileOpen(!profileOpen);
            setNotificationOpen(false);
          }} data-unique-id="5e656d30-bbc1-4c2c-9f43-d4aad62be5c8" data-file-name="app/dashboard/layout.tsx">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-bold text-lg" data-unique-id="773ec6d7-938a-4011-9a64-7071e64d9268" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={16} />
            </button>
            
            {profileOpen && <motion.div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-[224px] sm:w-56 bg-white rounded-md shadow-lg py-2 z-50" initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} data-unique-id="509eede9-44fc-4d46-b167-b5dd93f9d662" data-file-name="app/dashboard/layout.tsx">
                <Link href="/dashboard/profile-school" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors" onClick={() => setProfileOpen(false)} data-unique-id="22f3528f-9aab-47d2-bd36-80369001b841" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="1dbe1618-d46b-4daa-989e-fb64664d2d49" data-file-name="app/dashboard/layout.tsx">
                  Profil Sekolah
                </span></Link>
                <Link href="/dashboard/profile-user" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors" onClick={() => setProfileOpen(false)} data-unique-id="038ce3ab-52f1-4769-a9cb-3fdf231e6322" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="6040ab94-30fd-4ffb-8243-fc2434831cfd" data-file-name="app/dashboard/layout.tsx">
                  Profil Pengguna
                </span></Link>
                <button onClick={openLogoutDialog} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors" data-unique-id="219c601a-e95d-415e-81c8-b90221997a52" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="3c64fa5f-41f1-4a6a-80df-c636ebf0b968" data-file-name="app/dashboard/layout.tsx">
                  Keluar
                </span></button>
              </motion.div>}
          </div>
        </div>
      </header>
      
      {/* Sidebar - Toggle visibility based on sidebarCollapsed state */}
      <aside className={`fixed left-0 top-0 z-30 h-full bg-[#1E329F] text-white shadow-lg w-[220px] sm:w-64 pt-16 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:-translate-x-full' : 'md:translate-x-0'} md:pt-16 transition-all overflow-y-auto`} data-unique-id="a87bc908-0fdd-419c-9c34-4489019d19b9" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
        {/* User profile section */}
        <div className="px-4 py-3 flex flex-col items-center text-center border-b border-blue-800 border-opacity-80 border-b-2" data-unique-id="5f6365c5-bac5-4a4f-8305-c95be13d5856" data-file-name="app/dashboard/layout.tsx">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold" data-unique-id="3dc61790-c035-400a-957b-4e891b68c7f3" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
            {userData?.name?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <p className="font-bold text-sm text-gray-200 mt-1.5" data-unique-id="99b8b5f2-6857-4706-9a7d-d798920413c0" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">{userData?.name || user?.displayName || 'User'}</p>
          <div className="mt-1" data-unique-id="d37f114f-134e-471c-9ac6-d97317f52168" data-file-name="app/dashboard/layout.tsx">
            <span className="px-2 py-0.5 text-[7px] text-green-700 bg-green-100 border border-green-300 rounded flex items-center" data-unique-id="18b256fb-f351-4f2d-9ee3-06752a06259c" data-file-name="app/dashboard/layout.tsx">
              <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big mr-0.5" aria-hidden="true" data-unique-id="336f0e11-663a-462f-9abb-fa75da941d54" data-file-name="app/dashboard/layout.tsx">
                <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg><span className="editable-text" data-unique-id="2f31063d-60a2-433c-950d-33f362a22aab" data-file-name="app/dashboard/layout.tsx">
              Akun Terverifikasi
            </span></span>
          </div>
          <p className="text-xs text-gray-200 mt-1.5" data-unique-id="c9cfa890-f32e-4066-bf08-6a10dd6b0945" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">{schoolName}</p>
        </div>
        
        <nav className="p-3 space-y-0.5" data-unique-id="ff065f1e-0df6-4488-861e-e8140380e4b5" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
          {/* Dashboard - All users */}
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="1e9c529c-82a5-4049-94c1-4bd414b6e97b" data-file-name="app/dashboard/layout.tsx">
            <Home size={20} />
            <span data-unique-id="4e323106-056f-4f76-a3fd-103ee10a9ac6" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="3e93f570-a6bc-4992-b747-75827596abb0" data-file-name="app/dashboard/layout.tsx">Dashboard</span></span>
          </Link>
          
          {/* ADMIN NAVIGATION */}
          {userRole === 'admin' && <>
              <Link href="/dashboard/classes" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/classes') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="f1cd74be-e1b3-4d31-a5b4-55241db4be79" data-file-name="app/dashboard/layout.tsx">
                <BookOpen size={20} />
                <span data-unique-id="a3181182-64ba-4255-9028-b2f27ca97943" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="12e2d035-e559-4e0e-8117-4cb9d62aad64" data-file-name="app/dashboard/layout.tsx">Manajemen Kelas</span></span>
              </Link>
              
              <Link href="/dashboard/students" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/students') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="7ff0b429-a804-40f8-ad3f-f06be4e8041e" data-file-name="app/dashboard/layout.tsx">
                <Users size={20} />
                <span data-unique-id="d710d678-bff0-49b2-a886-d201b416b0c4" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="304ab095-117c-4c73-95c6-6954c3ea921d" data-file-name="app/dashboard/layout.tsx">Manajemen Siswa</span></span>
              </Link>
              
              <Link href="/dashboard/scan" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/scan') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="86be8fbd-5e10-427c-81d3-3d3ba21ff2f2" data-file-name="app/dashboard/layout.tsx">
                <Scan size={20} />
                <span data-unique-id="0870256a-c6e1-44db-bf9f-3feb51d03122" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="ee1c28a6-d6fb-4cdd-999a-e14d19f549bf" data-file-name="app/dashboard/layout.tsx">Scan QR Code</span></span>
              </Link>
              
              <Link href="/dashboard/attendance-history" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/attendance-history') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="b6f69899-e9d5-4ef8-a467-3947fca85dee" data-file-name="app/dashboard/layout.tsx">
                <Calendar size={20} data-unique-id="cb1d95e3-6845-4d23-af45-b80136eaf45a" data-file-name="app/dashboard/layout.tsx" />
                <span data-unique-id="372b003d-1ee9-4bab-b861-b0c9d8982b69" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="0d5f6e69-6f80-4ec1-a70c-8bba5e15682c" data-file-name="app/dashboard/layout.tsx">Riwayat Kehadiran</span></span>
              </Link>


              <Link href="/dashboard/students/qr" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/students/qr') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="bcaa3d03-4cf4-4576-aee6-e26d00480339" data-file-name="app/dashboard/layout.tsx">
                <QrCode size={20} />
                <span data-unique-id="08b0ffa4-55de-4cb4-a733-b13a1beb2456" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="65dd1b99-6679-4626-8f7d-4139d4e9dc38" data-file-name="app/dashboard/layout.tsx">Kartu QR Code</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/absensi-guru') || isActive('/dashboard/absensi-guru/data') || isActive('/dashboard/absensi-guru/settings') || isActive('/dashboard/absensi-guru/reports') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="ed1b2447-335e-47c6-b846-62cf0cca825b" data-file-name="app/dashboard/layout.tsx">
                <Users size={20} />
                <span data-unique-id="2217a601-0e4c-493a-a04b-961e370d564e" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="f6600bd5-2441-449a-9dc9-645554ad4093" data-file-name="app/dashboard/layout.tsx">Absensi Guru</span></span>
              </Link>
            </>}
          
          {/* TEACHER NAVIGATION */}
          {userRole === 'teacher' && <>            
              
              <Link href="/dashboard/classes" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/classes') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="56c85ad1-407f-42b8-82d4-9f338c174a33" data-file-name="app/dashboard/layout.tsx">
                <BookOpen size={20} />
                <span data-unique-id="b2ecb1ec-153a-4598-87c1-650ce34ed279" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="0548d7ad-28d2-4e3f-9005-5b078cbfa228" data-file-name="app/dashboard/layout.tsx">Manajemen Kelas</span></span>
              </Link>

            <Link href="/dashboard/students" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/students') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="259fbafe-ad6a-479d-92c8-62692283d982" data-file-name="app/dashboard/layout.tsx">
                <Users size={20} />
                <span data-unique-id="d3f36798-6f83-42c1-82a9-ca6ec4fdcd27" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="d0af66be-8c34-44a2-b215-b1e0fa7de230" data-file-name="app/dashboard/layout.tsx">Manajemen Siswa</span></span>
              </Link>
                            
              <Link href="/dashboard/scan" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/scan') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="8452dace-0f39-4699-a723-9e377dca752e" data-file-name="app/dashboard/layout.tsx">
                <Scan size={20} />
                <span data-unique-id="13ba8a42-97d7-4430-bea4-808c9e10db74" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="f3a6caab-3d61-489c-aba1-d7f06413534a" data-file-name="app/dashboard/layout.tsx">Absensi Siswa</span></span>
              </Link>


            <Link href="/dashboard/students/qr" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/students') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="259fbafe-ad6a-479d-92c8-62692283d982" data-file-name="app/dashboard/layout.tsx">
                <QrCode size={20} />
                <span data-unique-id="d3f36798-6f83-42c1-82a9-ca6ec4fdcd27" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="d0af66be-8c34-44a2-b215-b1e0fa7de230" data-file-name="app/dashboard/layout.tsx">Kartu QR Siswa</span></span>
              </Link>

            <Link href="/dashboard/absensi-guru/scan" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/scan') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="8452dace-0f39-4699-a723-9e377dca752e" data-file-name="app/dashboard/layout.tsx">
                <Users size={20} />
                <span data-unique-id="13ba8a42-97d7-4430-bea4-808c9e10db74" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="f3a6caab-3d61-489c-aba1-d7f06413534a" data-file-name="app/dashboard/layout.tsx">Absensi Guru</span></span>
              </Link>
              
            </>}
          
          {/* COMMON NAVIGATION FOR ALL USERS */}          
          <Link href="/dashboard/reports" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive('/dashboard/reports') || isActive('/dashboard/reports/by-student') || isActive('/dashboard/reports/by-class') || isActive('/dashboard/reports/by-group') || isActive('/dashboard/reports/monthly-attendance') ? 'bg-blue-800 text-white font-medium' : 'text-white hover:bg-blue-800'}`} onClick={() => setMenuOpen(false)} data-unique-id="c0ba8adb-253e-4d09-af45-54ade5a76530" data-file-name="app/dashboard/layout.tsx">
            <FileText size={20} />
            <span data-unique-id="dfecc4be-c592-44ff-9e90-21970886661a" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="a9e686ec-1fcf-4f81-9ff0-d828cf0e1a1f" data-file-name="app/dashboard/layout.tsx">Laporan Absensi</span></span>
          </Link>
          
          
          <button onClick={openLogoutDialog} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-white hover:bg-blue-800 w-full text-left mt-4`} data-unique-id="125aaf92-088f-404f-9c47-8088efa60323" data-file-name="app/dashboard/layout.tsx">
            <LogOut size={20} />
            <span data-unique-id="05504583-a7f6-434c-9305-864f7d893511" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="91f92e53-2e76-414f-bff7-db81d43140f0" data-file-name="app/dashboard/layout.tsx">Keluar</span></span>
          </button>
        </nav>
      </aside>
      
      {/* Backdrop to close the sidebar on mobile */}
      {menuOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setMenuOpen(false)} data-unique-id="8f5d8154-54c3-43a4-9bee-128e9ad966e8" data-file-name="app/dashboard/layout.tsx"></div>}

      {/* Main Content */}
      <main className={`pt-16 min-h-screen transition-all ${sidebarCollapsed ? 'md:pl-0' : 'md:pl-64'}`} onClick={() => menuOpen && setMenuOpen(false)} data-unique-id="19f6ee37-745d-49e4-b0d9-bc191a969c79" data-file-name="app/dashboard/layout.tsx">
        <div className="p-3 sm:p-4 md:p-6" data-unique-id="c58c0cfe-8106-453f-bc4c-ee193e8651e8" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Role-specific */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg" data-unique-id="4c7ddbff-40e5-4672-b53d-f904ae3ccb51" data-file-name="app/dashboard/layout.tsx">
        <div className="flex justify-around items-center py-1" data-unique-id="3cd68a92-6f73-41f9-8e14-9b7f1d271eb6" data-file-name="app/dashboard/layout.tsx" data-dynamic-text="true">
          {/* Home - All users */}
          <Link href="/dashboard" className="flex flex-col items-center p-2" data-unique-id="de5e9ff2-3ee9-4469-b2a9-f242c1ac1424" data-file-name="app/dashboard/layout.tsx">
            <Home size={24} className={isActive('/dashboard') ? 'text-primary' : 'text-gray-500'} />
            <span className={`text-xs mt-1 ${isActive('/dashboard') ? 'text-primary' : 'text-gray-500'}`} data-unique-id="2185ca06-8ecc-461b-aa33-49c53398864f" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="9d456cc6-e9d9-44a1-a65a-17239d4e01da" data-file-name="app/dashboard/layout.tsx">Home</span></span>
          </Link>
          
          {/* Admin and Teacher */}
          {(userRole === 'admin' || userRole === 'teacher') && <Link href="/dashboard/students" className="flex flex-col items-center p-2" data-unique-id="0e75f6b4-960c-480c-876b-ad56bf9fc2a7" data-file-name="app/dashboard/layout.tsx">
              <Users size={24} className={isActive('/dashboard/students') ? 'text-primary' : 'text-gray-500'} />
              <span className={`text-xs mt-1 ${isActive('/dashboard/students') ? 'text-primary' : 'text-gray-500'}`} data-unique-id="502e2695-36fd-43f4-9b37-7b608df8bad0" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="7699a583-1ece-40ca-8330-631d886c89ba" data-file-name="app/dashboard/layout.tsx">Siswa</span></span>
            </Link>}
          
          {/* Admin and Teacher */}
          {(userRole === 'admin' || userRole === 'teacher') && <Link href="/dashboard/scan" className="flex flex-col items-center p-2" data-unique-id="1e66bb1d-df66-4887-a47c-c5c8cb9e8d0d" data-file-name="app/dashboard/layout.tsx">
              <div className="bg-primary rounded-full p-3 -mt-5" data-unique-id="ac956c0c-98eb-4ac9-b614-1660859628fb" data-file-name="app/dashboard/layout.tsx">
                <Scan className="h-10 w-10 text-white" />
              </div>
              <span className="text-xs mt-1 text-gray-500" data-unique-id="90fdee9f-f921-44aa-99e1-70beac144ef3" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="78e4202a-128f-4819-87a0-bde2965e63a8" data-file-name="app/dashboard/layout.tsx">Scan QR</span></span>
            </Link>}
          
          {/* Student */}
          {userRole === 'student' && <Link href="/dashboard/profile-user" className="flex flex-col items-center p-2" data-unique-id="e9de3d38-512a-4ef2-9d1a-a0ff097e7b3c" data-file-name="app/dashboard/layout.tsx">
              <div className="bg-primary rounded-full p-3 -mt-5" data-unique-id="3f736360-8515-43d7-a847-2adcf94bf37f" data-file-name="app/dashboard/layout.tsx">
                <User size={24} className="text-white" />
              </div>
              <span className="text-xs mt-1 text-gray-500" data-unique-id="3c33dfbd-2e27-403c-8f1c-d3e6be190a81" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="af10e0ea-4ecd-44cf-a993-7994e1af9f41" data-file-name="app/dashboard/layout.tsx">Profil</span></span>
            </Link>}
          
          {/* Admin and Teacher */}
          {(userRole === 'admin' || userRole === 'teacher') && <Link href="/dashboard/classes" className="flex flex-col items-center p-2" data-unique-id="dc79ce9d-7bbe-499b-8c6b-a93238828a45" data-file-name="app/dashboard/layout.tsx">
              <BookOpen size={24} className={isActive('/dashboard/classes') ? 'text-primary' : 'text-gray-500'} />
              <span className={`text-xs mt-1 ${isActive('/dashboard/classes') ? 'text-primary' : 'text-gray-500'}`} data-unique-id="24cfbdea-0b67-4c03-a69e-c07f7c78351a" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="ca7a557e-6768-457c-b00b-15305c141d7b" data-file-name="app/dashboard/layout.tsx">Kelas</span></span>
            </Link>}
          
          {/* All users */}
          <Link href="/dashboard/reports" className="flex flex-col items-center p-2" data-unique-id="b6b029ae-f22b-4b38-9890-0aa566a202dc" data-file-name="app/dashboard/layout.tsx">
            <FileText size={24} className={isActive('/dashboard/reports') ? 'text-primary' : 'text-gray-500'} />
            <span className={`text-xs mt-1 ${isActive('/dashboard/reports') ? 'text-primary' : 'text-gray-500'}`} data-unique-id="c12706c9-7fdd-4f2b-bf10-8fb8fc661d0b" data-file-name="app/dashboard/layout.tsx"><span className="editable-text" data-unique-id="1e746562-994a-4e4d-9863-6b5d70c9e08a" data-file-name="app/dashboard/layout.tsx">Laporan</span></span>
          </Link>
        </div>
      </div>
      <ConfirmDialog isOpen={logoutDialogOpen} title="Konfirmasi Keluar" message="Apakah Anda yakin ingin keluar dari aplikasi?" confirmLabel="Keluar" cancelLabel="Batal" confirmColor="bg-red-500 hover:bg-red-600" onConfirm={handleLogout} onCancel={() => setLogoutDialogOpen(false)} icon={<LogOut size={20} className="text-red-500" />} />
    </div>;
};
export default DashboardLayout;
