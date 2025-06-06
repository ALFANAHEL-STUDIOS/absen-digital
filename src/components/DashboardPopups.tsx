'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Clock, X, AlertTriangle, CheckCircle, Info, Phone, Mail } from 'lucide-react';
interface AnnouncementData {
 id: string;
 title: string;
 message: string;
 type: 'info' | 'warning' | 'success' | 'error';
 priority: 'high' | 'medium' | 'low';
 createdAt: Date;
 expiresAt?: Date;
}
interface ExpirationData {
 daysLeft: number;
 isExpired: boolean;
 planType: string;
 expiryDate: Date;
 features: string[];
 schoolId: string;
 schoolName: string;
}
interface TeacherExpirationData {
 daysLeft: number;
 isExpired: boolean;
 planType: string;
 expiryDate: Date;
 schoolName: string;
 message: string;
 contactInfo: {
   whatsapp: string;
   email: string;
 };
}
interface DashboardPopupsProps {
 schoolId: string | null;
 userRole: string | null;
 userEmail: string | null;
}
export default function DashboardPopups({ schoolId, userRole, userEmail }: DashboardPopupsProps) {
 const [showAnnouncement, setShowAnnouncement] = useState(false);
 const [showExpiration, setShowExpiration] = useState(false);
 const [showTeacherExpiration, setShowTeacherExpiration] = useState(false);
 const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
 const [expirationData, setExpirationData] = useState<ExpirationData | null>(null);
 const [teacherExpirationData, setTeacherExpirationData] = useState<TeacherExpirationData | null>(null);
 const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
 // Load announcements and expiration data
 useEffect(() => {
   const loadData = async () => {
     if (!schoolId) return;
     try {
       // Check for announcements
       const savedAnnouncements = localStorage.getItem('dashboard_announcements');
       const lastCheck = localStorage.getItem('last_announcement_check');
       const now = new Date().getTime();
       // Check every 24 hours
       if (!lastCheck || now - parseInt(lastCheck) > 24 * 60 * 60 * 1000) {
         const newAnnouncements: AnnouncementData[] = [{
           id: '1',
           title: 'Absensi Guru Berbasis Lokasi',
           message: 'Untuk menggunakan Absensi berbasis lokasi, jangan lupa untuk menyalakan GPS pada Smartphone. Khusus untuk jenis Absensi Izin dan Alpha bisa dilakukan dari rumah.',
           type: 'info',
           priority: 'medium',
           createdAt: new Date(),
           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
         }];

         setAnnouncements(newAnnouncements);
         localStorage.setItem('dashboard_announcements', JSON.stringify(newAnnouncements));
         localStorage.setItem('last_announcement_check', now.toString());
         if (newAnnouncements.length > 0) {
           setTimeout(() => setShowAnnouncement(true), 1500);
         }
       } else if (savedAnnouncements) {
         const parsed = JSON.parse(savedAnnouncements);
         setAnnouncements(parsed);
       }
       // Load expiration data for admin
       if (userRole === 'admin') {
         await loadAdminExpirationData();
       }
       // Load expiration data for teacher
       if (userRole === 'teacher') {
         await loadTeacherExpirationData();
       }
     } catch (error) {
       console.error('Error loading dashboard data:', error);
     }
   };
   loadData();
 }, [schoolId, userRole, userEmail]);
 const loadAdminExpirationData = async () => {
   try {
     // Check expiration for admin
     const expData: ExpirationData = {
       daysLeft: 15,
       isExpired: false,
       planType: 'Premium',
       expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
       features: ['Absensi Siswa', 'Laporan Lengkap', 'QR Code Generator', 'Notifikasi Telegram'],
       schoolId: schoolId!,
       schoolName: 'Sekolah Sample'
     };

     setExpirationData(expData);
     if (expData.daysLeft <= 30 && !expData.isExpired) {
       setTimeout(() => setShowExpiration(true), 3000);
     }
   } catch (error) {
     console.error('Error loading admin expiration data:', error);
   }
 };
 const loadTeacherExpirationData = async () => {
   try {
     if (!schoolId || !userEmail) return;
     // Fetch school data and check if teacher belongs to this school
     const { db } = await import('@/lib/firebase');
     const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
     // Check if teacher is registered in this school
     const usersRef = collection(db, 'users');
     const teacherQuery = query(
       usersRef,
       where('schoolId', '==', schoolId),
       where('email', '==', userEmail),
       where('role', 'in', ['teacher', 'staff'])
     );

     const teacherSnapshot = await getDocs(teacherQuery);

     if (teacherSnapshot.empty) {
       console.log('Teacher not found in this school');
       return;
     }
     // Get school information
     const schoolDoc = await getDoc(doc(db, 'schools', schoolId));
     let schoolName = 'Sekolah Anda';

     if (schoolDoc.exists()) {
       schoolName = schoolDoc.data().name || schoolName;
     }
     // Check expiration data from localStorage or Firestore
     const savedExpiration = localStorage.getItem(`school_expiration_${schoolId}`);
     let expirationInfo;
     if (savedExpiration) {
       expirationInfo = JSON.parse(savedExpiration);
     } else {
       // Default expiration data (in real app, this would come from school settings)
       expirationInfo = {
         expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
         planType: 'Free Trial',
         daysLeft: 7,
         isExpired: false
       };
     }
     const teacherExpData: TeacherExpirationData = {
       daysLeft: expirationInfo.daysLeft,
       isExpired: expirationInfo.isExpired,
       planType: expirationInfo.planType,
       expiryDate: new Date(expirationInfo.expiryDate),
       schoolName: schoolName,
       message: `Masa berlaku aplikasi absensi untuk ${schoolName} akan berakhir dalam ${expirationInfo.daysLeft} hari. Hubungi administrator sekolah untuk perpanjangan.`,
       contactInfo: {
         whatsapp: '081272405881',
         email: 'lehan.virtual@gmail.com'
       }
     };
     setTeacherExpirationData(teacherExpData);
     // Show popup if expiration is approaching (7 days or less)
     if (teacherExpData.daysLeft <= 7 && !teacherExpData.isExpired) {
       const lastShown = localStorage.getItem(`teacher_expiration_popup_${schoolId}_${userEmail}`);
       const now = new Date().getTime();

       // Show popup once per day
       if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
         setTimeout(() => setShowTeacherExpiration(true), 2000);
         localStorage.setItem(`teacher_expiration_popup_${schoolId}_${userEmail}`, now.toString());
       }
     }
   } catch (error) {
     console.error('Error loading teacher expiration data:', error);
   }
 };
 const getAnnouncementIcon = (type: string) => {
   switch (type) {
     case 'success':
       return <CheckCircle className="h-6 w-6 text-green-500" />;
     case 'warning':
       return <AlertTriangle className="h-6 w-6 text-amber-500" />;
     case 'error':
       return <AlertTriangle className="h-6 w-6 text-red-500" />;
     default:
       return <Info className="h-6 w-6 text-blue-500" />;
   }
 };
 const getAnnouncementColors = (type: string) => {
   switch (type) {
     case 'success':
       return 'from-green-50 to-emerald-50 border-green-200';
     case 'warning':
       return 'from-amber-50 to-yellow-50 border-amber-200';
     case 'error':
       return 'from-red-50 to-rose-50 border-red-200';
     default:
       return 'from-blue-50 to-indigo-50 border-blue-200';
   }
 };
 const nextAnnouncement = () => {
   if (currentAnnouncementIndex < announcements.length - 1) {
     setCurrentAnnouncementIndex(prev => prev + 1);
   } else {
     setShowAnnouncement(false);
     setCurrentAnnouncementIndex(0);
   }
 };
 const dismissAnnouncement = () => {
   setShowAnnouncement(false);
   setCurrentAnnouncementIndex(0);
   localStorage.setItem('announcements_dismissed', Date.now().toString());
 };
 const getExpirationColor = () => {
   if (!expirationData) return 'from-gray-500 to-gray-600';
   if (expirationData.isExpired) return 'from-red-500 to-red-600';
   if (expirationData.daysLeft <= 7) return 'from-orange-500 to-red-500';
   if (expirationData.daysLeft <= 30) return 'from-yellow-500 to-orange-500';
   return 'from-green-500 to-blue-500';
 };
 const getTeacherExpirationColor = () => {
   if (!teacherExpirationData) return 'from-gray-500 to-gray-600';
   if (teacherExpirationData.isExpired) return 'from-red-500 to-red-600';
   if (teacherExpirationData.daysLeft <= 3) return 'from-red-500 to-red-600';
   if (teacherExpirationData.daysLeft <= 7) return 'from-orange-500 to-red-500';
   return 'from-yellow-500 to-orange-500';
 };
 const handleWhatsAppClick = () => {
   window.open('https://wa.me/6281272405881?text=Halo%2C%20saya%20guru%20dari%20sekolah%20yang%20menggunakan%20aplikasi%20Absensi%20Digital.%20Aplikasi%20akan%20berakhir%20masa%20berlakunya.', '_blank');
 };
 return (
   <>
     {/* Announcement Popup */}
     <AnimatePresence>
       {showAnnouncement && announcements.length > 0 && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
           >
             {/* Header */}
             <div className={`bg-gradient-to-r from-green-600 to-indigo-600 px-6 py-4 border-b`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <motion.div
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="bg-white/20 p-2 rounded-lg"
                   >
                     <Bell className="h-6 w-6 text-white" />
                   </motion.div>
                   <div>
                     <h2 className="text-xl font-bold text-white">PENGUMUMAN</h2>
                     <p className="text-sm text-white">
                       
                     </p>
                   </div>
                 </div>
                 <button
                   onClick={dismissAnnouncement}
                   className="text-white hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               </div>
             </div>
             {/* Content */}
             <div className="p-4">
               <div className="flex items-start space-x-3 mb-0">
                 {getAnnouncementIcon(announcements[currentAnnouncementIndex].type)}
                 <div className="flex-1">
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     {announcements[currentAnnouncementIndex].title}
                   </h3>
                   <p className="text-gray-600 leading-relaxed">
                     {announcements[currentAnnouncementIndex].message}
                   </p>
                 </div>
               </div>
               {announcements.length > 1 && (
                 <div className="flex justify-center space-x-2 mb-4">
                   {announcements.map((_, index) => (
                     <div
                       key={index}
                       className={`w-2 h-2 rounded-full transition-colors ${
                         index === currentAnnouncementIndex ? 'bg-blue-500' : 'bg-gray-300'
                       }`}
                     />
                   ))}
                 </div>
               )}
             </div>
             {/* Footer */}
             <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
               <button
                 onClick={dismissAnnouncement}
                 className="text-gray-500 hover:text-gray-700 font-medium"
               >
                 
               </button>
               <button
                 onClick={nextAnnouncement}
                 className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
               >
                 {currentAnnouncementIndex < announcements.length - 1 ? 'Selanjutnya' : 'Saya Mengerti'}
               </button>
             </div>
           </motion.div>
         </div>
       )}
     </AnimatePresence>
     {/* Admin Expiration Popup */}
     <AnimatePresence>
       {showExpiration && expirationData && userRole === 'admin' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
           >
             {/* Header */}
             <div className={`bg-gradient-to-r ${getExpirationColor()} px-6 py-4`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <motion.div
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="bg-white/20 p-2 rounded-lg"
                   >
                     <Calendar className="h-6 w-6 text-white" />
                   </motion.div>
                   <div>
                     <h2 className="text-xl font-bold text-white">Status Masa Berlaku</h2>
                     <p className="text-white/80 text-sm">{expirationData.planType}</p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowExpiration(false)}
                   className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               </div>
             </div>
             {/* Content */}
             <div className="p-6 space-y-6">
               <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
                 <div className="flex items-center space-x-4">
                   <div className="flex-shrink-0">
                     <AlertTriangle className="h-8 w-8 text-orange-600" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-gray-800 mb-1">
                       Masa berlaku akan berakhir
                     </h3>
                     <div className="flex items-center space-x-4 text-sm text-gray-600">
                       <div className="flex items-center space-x-1">
                         <Clock className="h-4 w-4" />
                         <span>{expirationData.daysLeft} hari tersisa</span>
                       </div>
                       <div className="flex items-center space-x-1">
                         <Calendar className="h-4 w-4" />
                         <span>Berakhir: {expirationData.expiryDate.toLocaleDateString('id-ID')}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                 <h4 className="text-lg font-semibold text-purple-800 mb-3">
                   Hubungi Kami untuk Perpanjangan:
                 </h4>

                 <div className="space-y-3">
                   <div className="flex items-center space-x-3">
                     <div className="bg-green-100 p-2 rounded-lg">
                       <Phone className="h-5 w-5 text-green-600" />
                     </div>
                     <div>
                       <p className="font-medium text-gray-800">WhatsApp</p>
                       <a href="tel:081272405881" className="text-green-600 font-medium hover:underline">
                         0812 7240 5881
                       </a>
                     </div>
                   </div>

                   <div className="flex items-center space-x-3">
                     <div className="bg-blue-100 p-2 rounded-lg">
                       <Mail className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                       <p className="font-medium text-gray-800">Email</p>
                       <a href="mailto:lehan.virtual@gmail.com" className="text-blue-600 font-medium hover:underline">
                         lehan.virtual@gmail.com
                       </a>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             {/* Footer */}
             <div className="bg-gray-50 px-6 py-4 flex space-x-3">
               <a
                 href="https://wa.me/6281272405881?text=Halo%2C%20saya%20ingin%20perpanjangan%20aplikasi%20Absensi%20Digital"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
               >
                 Chat WhatsApp
               </a>
               <button
                 onClick={() => setShowExpiration(false)}
                 className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
               >
                 Tutup
               </button>
             </div>
           </motion.div>
         </div>
       )}
     </AnimatePresence>
     {/* Teacher Expiration Popup */}
     <AnimatePresence>
       {showTeacherExpiration && teacherExpirationData && userRole === 'teacher' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
           >
             {/* Header */}
             <div className={`bg-gradient-to-r ${getTeacherExpirationColor()} px-6 py-4`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <motion.div
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="bg-white/20 p-2 rounded-lg"
                   >
                     <AlertTriangle className="h-6 w-6 text-white" />
                   </motion.div>
                   <div>
                     <h2 className="text-xl font-bold text-white">Pemberitahuan Masa Berlaku</h2>
                     <p className="text-white/80 text-sm">{teacherExpirationData.schoolName}</p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowTeacherExpiration(false)}
                   className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               </div>
             </div>
             {/* Content */}
             <div className="p-6 space-y-6">
               {/* Warning Message */}
               <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
                 <div className="flex items-center space-x-4">
                   <div className="flex-shrink-0">
                     <AlertTriangle className="h-8 w-8 text-orange-600" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-gray-800 mb-2">
                       Masa Berlaku Akan Berakhir
                     </h3>
                     <p className="text-gray-700 leading-relaxed">
                       {teacherExpirationData.message}
                     </p>
                     <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3">
                       <div className="flex items-center space-x-1">
                         <Clock className="h-4 w-4" />
                         <span className="font-semibold text-red-600">
                           {teacherExpirationData.daysLeft} hari tersisa
                         </span>
                       </div>
                       <div className="flex items-center space-x-1">
                         <Calendar className="h-4 w-4" />
                         <span>Berakhir: {teacherExpirationData.expiryDate.toLocaleDateString('id-ID')}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               {/* Action Instructions */}
               <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                 <h4 className="text-lg font-semibold text-blue-800 mb-3">
                   Apa yang harus dilakukan?
                 </h4>
                 <div className="space-y-2 text-sm text-blue-700">
                   <p>• Hubungi administrator sekolah Anda</p>
                   <p>• Atau hubungi tim support aplikasi Absensi Digital</p>
                   <p>• Aplikasi akan berhenti berfungsi setelah masa berlaku habis</p>
                 </div>
               </div>
               {/* Contact Information */}
               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                 <h4 className="text-lg font-semibold text-purple-800 mb-3">
                   Kontak Tim Support:
                 </h4>

                 <div className="space-y-3">
                   <div className="flex items-center space-x-3">
                     <div className="bg-green-100 p-2 rounded-lg">
                       <Phone className="h-5 w-5 text-green-600" />
                     </div>
                     <div>
                       <p className="font-medium text-gray-800">WhatsApp</p>
                       <p className="text-green-600 font-medium">
                         {teacherExpirationData.contactInfo.whatsapp}
                       </p>
                     </div>
                   </div>

                   <div className="flex items-center space-x-3">
                     <div className="bg-blue-100 p-2 rounded-lg">
                       <Mail className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                       <p className="font-medium text-gray-800">Email</p>
                       <p className="text-blue-600 font-medium">
                         {teacherExpirationData.contactInfo.email}
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             {/* Footer */}
             <div className="bg-gray-50 px-6 py-4 flex space-x-3">
               <button
                 onClick={handleWhatsAppClick}
                 className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
               >
                 Hubungi Support
               </button>
               <button
                 onClick={() => setShowTeacherExpiration(false)}
                 className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
               >
                 Tutup
               </button>
             </div>
           </motion.div>
         </div>
       )}
     </AnimatePresence>
     {/* Floating Action Buttons */}
     <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
       {/* Announcement Button */}
      {/* {announcements.length > 0 && (
          <motion.button
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => setShowAnnouncement(true)}
           className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
         >
           <Bell className="h-6 w-6" />
           {announcements.length > 0 && (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
               {announcements.length}
             </span>
           )}
         </motion.button>
       )}*/}
       {/* Admin Expiration Button */}
       {expirationData && userRole === 'admin' && (
         <motion.button
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => setShowExpiration(true)}
           className={`text-white p-3 rounded-full shadow-lg transition-colors ${
             expirationData.isExpired
               ? 'bg-red-600 hover:bg-red-700'
               : expirationData.daysLeft <= 7
               ? 'bg-orange-600 hover:bg-orange-700'
               : expirationData.daysLeft <= 30
               ? 'bg-yellow-600 hover:bg-yellow-700'
               : 'bg-green-600 hover:bg-green-700'
           }`}
         >
           <Calendar className="h-6 w-6" />
         </motion.button>
       )}
       {/* Teacher Expiration Button */}
       {teacherExpirationData && userRole === 'teacher' && (
         <motion.button
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => setShowTeacherExpiration(true)}
           className={`text-white p-3 rounded-full shadow-lg transition-colors ${
             teacherExpirationData.isExpired
               ? 'bg-red-600 hover:bg-red-700'
               : teacherExpirationData.daysLeft <= 3
               ? 'bg-red-600 hover:bg-red-700'
               : teacherExpirationData.daysLeft <= 7
               ? 'bg-orange-600 hover:bg-orange-700'
               : 'bg-yellow-600 hover:bg-yellow-700'
           }`}
         >
           <AlertTriangle className="h-6 w-6" />
           <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
             !
           </span>
         </motion.button>
       )}
     </div>
   </>
 );
}
