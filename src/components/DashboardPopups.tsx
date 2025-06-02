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
}
interface DashboardPopupsProps {
  schoolId: string | null;
  userRole: string | null;
}
export default function DashboardPopups({
  schoolId,
  userRole
}: DashboardPopupsProps) {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showExpiration, setShowExpiration] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [expirationData, setExpirationData] = useState<ExpirationData | null>(null);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // Load announcements and expiration data
  useEffect(() => {
    const loadData = async () => {
      // Check for new announcements
      const savedAnnouncements = localStorage.getItem('dashboard_announcements');
      const lastCheck = localStorage.getItem('last_announcement_check');
      const now = new Date().getTime();

      // Check every 24 hours
      if (!lastCheck || now - parseInt(lastCheck) > 24 * 60 * 60 * 1000) {
        // Sample announcements - in real app, fetch from Firebase
        const newAnnouncements: AnnouncementData[] = [{
          id: '1',
          title: 'Pembaruan Sistem Absensi',
          message: 'Sistem absensi telah diperbarui dengan fitur baru. Silakan login ulang untuk mendapatkan pengalaman terbaik.',
          type: 'info',
          priority: 'medium',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }, {
          id: '2',
          title: 'Backup Data Otomatis',
          message: 'Data sekolah Anda telah di-backup secara otomatis. Semua informasi siswa dan absensi tersimpan dengan aman.',
          type: 'success',
          priority: 'low',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }];
        setAnnouncements(newAnnouncements);
        localStorage.setItem('dashboard_announcements', JSON.stringify(newAnnouncements));
        localStorage.setItem('last_announcement_check', now.toString());

        // Show announcement popup if there are new ones
        if (newAnnouncements.length > 0) {
          setTimeout(() => setShowAnnouncement(true), 1500);
        }
      } else if (savedAnnouncements) {
        const parsed = JSON.parse(savedAnnouncements);
        setAnnouncements(parsed);
      }

      // Check expiration status
      if (userRole === 'admin') {
        // Sample expiration data - in real app, fetch from Firebase
        const expData: ExpirationData = {
          daysLeft: 15,
          isExpired: false,
          planType: 'Free Trial',
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          features: ['Absensi Siswa', 'Laporan Dasar', 'QR Code Generator']
        };
        setExpirationData(expData);

        // Show expiration popup if less than 30 days left
        if (expData.daysLeft <= 30 && !expData.isExpired) {
          setTimeout(() => setShowExpiration(true), 3000);
        }
      }
    };
    if (schoolId) {
      loadData();
    }
  }, [schoolId, userRole]);
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
    // Mark as read
    localStorage.setItem('announcements_dismissed', Date.now().toString());
  };
  const getExpirationColor = () => {
    if (!expirationData) return 'from-gray-500 to-gray-600';
    if (expirationData.isExpired) return 'from-red-500 to-red-600';
    if (expirationData.daysLeft <= 7) return 'from-orange-500 to-red-500';
    if (expirationData.daysLeft <= 30) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-blue-500';
  };
  const getExpirationMessage = () => {
    if (!expirationData) return 'Memuat informasi masa berlaku...';
    if (expirationData.isExpired) return 'Masa berlaku telah berakhir';
    if (expirationData.daysLeft <= 7) return 'Masa berlaku akan segera berakhir';
    if (expirationData.daysLeft <= 30) return 'Masa berlaku akan berakhir dalam 1 bulan';
    return 'Masa berlaku masih tersedia';
  };
  return <>
      {/* Announcement Popup */}
      <AnimatePresence>
        {showAnnouncement && announcements.length > 0 && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-unique-id="c904519c-bd49-4a2a-8502-ff419d880185" data-file-name="components/DashboardPopups.tsx">
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} transition={{
          duration: 0.3,
          ease: "easeOut"
        }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-unique-id="54be33cc-f6f8-449f-b3de-bed50526d482" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
              {/* Header */}
              <div className={`bg-gradient-to-r ${getAnnouncementColors(announcements[currentAnnouncementIndex].type)} px-6 py-4 border-b`} data-unique-id="235628f2-d62b-4931-946e-2e67c0124af9" data-file-name="components/DashboardPopups.tsx">
                <div className="flex items-center justify-between" data-unique-id="fcb4192e-6701-4ede-837e-23f7c2083847" data-file-name="components/DashboardPopups.tsx">
                  <div className="flex items-center space-x-3" data-unique-id="e8b8ad70-6ae7-4395-8eab-7d54fed50430" data-file-name="components/DashboardPopups.tsx">
                    <motion.div animate={{
                  scale: [1, 1.1, 1]
                }} transition={{
                  repeat: Infinity,
                  duration: 2
                }} className="bg-white/20 p-2 rounded-lg" data-unique-id="897f8818-766a-49fa-9ed6-b84c44694893" data-file-name="components/DashboardPopups.tsx">
                      <Bell className="h-6 w-6 text-gray-700" />
                    </motion.div>
                    <div data-unique-id="370aad0a-25ab-41a7-8a08-b48a412d839b" data-file-name="components/DashboardPopups.tsx">
                      <h2 className="text-lg font-bold text-gray-800" data-unique-id="43d94b87-7e3b-4d95-ac0c-7d5c16afae58" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="87ff3b04-eb71-4064-ba43-3c0555decb43" data-file-name="components/DashboardPopups.tsx">Pengumuman</span></h2>
                      <p className="text-sm text-gray-600" data-unique-id="20c678dc-8361-4370-aa1d-c303d27e4de0" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                        {currentAnnouncementIndex + 1}<span className="editable-text" data-unique-id="de631a1a-0689-438e-92d0-631edaa6aaa4" data-file-name="components/DashboardPopups.tsx"> dari </span>{announcements.length}
                      </p>
                    </div>
                  </div>
                  <button onClick={dismissAnnouncement} className="text-gray-500 hover:text-gray-700 hover:bg-white/20 p-2 rounded-lg transition-colors" data-unique-id="e3e08f24-d4a3-4ce5-89f9-e7a4f32dc9a4" data-file-name="components/DashboardPopups.tsx">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6" data-unique-id="e90e49ac-be4c-4982-9179-6c1e4b9d7e9b" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                <div className="flex items-start space-x-3 mb-4" data-unique-id="5fe19a25-5faa-42d9-8147-9de9941622d9" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                  {getAnnouncementIcon(announcements[currentAnnouncementIndex].type)}
                  <div className="flex-1" data-unique-id="5574aef8-6a62-4f12-b383-ba1182ae9d46" data-file-name="components/DashboardPopups.tsx">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-unique-id="2354eb11-2f5e-489b-85b9-423e23c59b30" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                      {announcements[currentAnnouncementIndex].title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" data-unique-id="d34bb0b1-eddf-4aaa-b560-b25e4862967d" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                      {announcements[currentAnnouncementIndex].message}
                    </p>
                  </div>
                </div>

                {/* Progress indicators */}
                {announcements.length > 1 && <div className="flex justify-center space-x-2 mb-4" data-unique-id="5b257723-9e72-4360-b407-c6ee2185e566" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                    {announcements.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentAnnouncementIndex ? 'bg-blue-500' : 'bg-gray-300'}`} data-unique-id="b5194ed7-296c-4101-9435-8ff18f0de9dd" data-file-name="components/DashboardPopups.tsx" />)}
                  </div>}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center" data-unique-id="d1def9f4-337b-4a68-bbb8-9346d0ee2623" data-file-name="components/DashboardPopups.tsx">
                <button onClick={dismissAnnouncement} className="text-gray-500 hover:text-gray-700 font-medium" data-unique-id="09d97398-191f-4350-9aaf-2bedcae0e209" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="5e681287-0e74-4c21-b9bf-ed20636bc328" data-file-name="components/DashboardPopups.tsx">
                  Tutup Semua
                </span></button>
                <button onClick={nextAnnouncement} className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors" data-unique-id="d6dbe6a7-8b44-4755-8825-ef676b554187" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                  {currentAnnouncementIndex < announcements.length - 1 ? 'Selanjutnya' : 'Selesai'}
                </button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

      {/* Expiration Popup */}
      <AnimatePresence>
        {showExpiration && expirationData && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-unique-id="8d9f981e-7c01-4c98-b861-1ba1d46187e5" data-file-name="components/DashboardPopups.tsx">
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} transition={{
          duration: 0.3,
          ease: "easeOut"
        }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" data-unique-id="7b7fcf91-41d9-46b7-a230-fe800cf526ad" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
              {/* Header */}
              <div className={`bg-gradient-to-r ${getExpirationColor()} px-6 py-4`} data-unique-id="2eed0b0d-d9a5-4ce4-a505-ad1b816c5e17" data-file-name="components/DashboardPopups.tsx">
                <div className="flex items-center justify-between" data-unique-id="9b44c274-39cb-4e1b-8a11-3fef569a736f" data-file-name="components/DashboardPopups.tsx">
                  <div className="flex items-center space-x-3" data-unique-id="b3daf08e-e022-48e8-b5a6-c45ca69c6975" data-file-name="components/DashboardPopups.tsx">
                    <motion.div animate={{
                  scale: [1, 1.1, 1]
                }} transition={{
                  repeat: Infinity,
                  duration: 2
                }} className="bg-white/20 p-2 rounded-lg" data-unique-id="f5192e8b-7b26-4bea-9517-b8374dafb819" data-file-name="components/DashboardPopups.tsx">
                      <Calendar className="h-6 w-6 text-white" data-unique-id="cb182d47-8d6b-4996-ac7c-169373f6bed0" data-file-name="components/DashboardPopups.tsx" />
                    </motion.div>
                    <div data-unique-id="719c8025-1ac6-47e2-a130-fd33d58db1ec" data-file-name="components/DashboardPopups.tsx">
                      <h2 className="text-xl font-bold text-white" data-unique-id="21515052-9bd2-4158-8979-933d83f54986" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="4678d410-25fc-43fb-8552-484923da8cb0" data-file-name="components/DashboardPopups.tsx">Status Masa Berlaku</span></h2>
                      <p className="text-white/80 text-sm" data-unique-id="624ad101-89d1-4e08-b1af-522d8f148b1c" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">{expirationData.planType}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowExpiration(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" data-unique-id="f6faa518-454f-49b5-b78d-ded5c5eec8e3" data-file-name="components/DashboardPopups.tsx">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6" data-unique-id="38753fd0-9d60-468b-9019-a8a05853ab5d" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                {/* Status Card */}
                <div className={`bg-gradient-to-br ${expirationData.isExpired ? 'from-red-50 to-red-100 border-red-200' : expirationData.daysLeft <= 7 ? 'from-orange-50 to-orange-100 border-orange-200' : expirationData.daysLeft <= 30 ? 'from-yellow-50 to-yellow-100 border-yellow-200' : 'from-green-50 to-green-100 border-green-200'} rounded-xl p-6 border`} data-unique-id="ec74fef2-9013-4221-ab75-7a5c1a2410c6" data-file-name="components/DashboardPopups.tsx">
                  <div className="flex items-center space-x-4" data-unique-id="44f75a94-8f17-4c88-afa5-2be0d82cc3f8" data-file-name="components/DashboardPopups.tsx">
                    <div className="flex-shrink-0" data-unique-id="26acaedb-52ce-4fef-873e-65a0bde53295" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                      {expirationData.isExpired ? <AlertTriangle className="h-8 w-8 text-red-600" /> : expirationData.daysLeft <= 7 ? <AlertTriangle className="h-8 w-8 text-orange-600" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
                    </div>
                    <div className="flex-1" data-unique-id="ac0582ad-75b2-43d2-9d14-1f0fc3f14af3" data-file-name="components/DashboardPopups.tsx">
                      <h3 className="text-xl font-bold text-gray-800 mb-1" data-unique-id="5791ceec-8814-49c5-a882-4f2999e867bf" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                        {getExpirationMessage()}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600" data-unique-id="c04afbbb-4507-4469-9ad0-c66b79e0793d" data-file-name="components/DashboardPopups.tsx">
                        <div className="flex items-center space-x-1" data-unique-id="0aa38ddd-251b-4845-b1cb-8247f32c914b" data-file-name="components/DashboardPopups.tsx">
                          <Clock className="h-4 w-4" />
                          <span data-unique-id="96e5bbe8-c80c-46fc-aebd-484427899b13" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                            {expirationData.isExpired ? 'Kedaluwarsa' : `${expirationData.daysLeft} hari tersisa`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1" data-unique-id="deabef13-f8ea-4ec5-8d5f-223c2aebc425" data-file-name="components/DashboardPopups.tsx">
                          <Calendar className="h-4 w-4" data-unique-id="41e41d42-1b81-4981-9535-4f4a331e2913" data-file-name="components/DashboardPopups.tsx" />
                          <span data-unique-id="19da557d-c047-46b9-806d-bcf690228bf9" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="037e014e-5778-4a06-8ea8-455c84ebaa35" data-file-name="components/DashboardPopups.tsx">Berakhir: </span>{expirationData.expiryDate.toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200" data-unique-id="5c70b16a-2a41-4fb9-9083-3d54156b0636" data-file-name="components/DashboardPopups.tsx">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4" data-unique-id="2a62fa57-2015-4afd-818b-8fbf9af227b6" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="d51769a6-8894-4490-9fda-6352c9c1ae43" data-file-name="components/DashboardPopups.tsx">Fitur Aktif</span></h4>
                  <div className="grid grid-cols-1 gap-3" data-unique-id="3e47f4d5-c4fc-4625-9141-25dd166800f6" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                    {expirationData.features.map((feature, index) => <div key={index} className="flex items-center space-x-2" data-unique-id="94a81abb-2e8d-466f-be4e-c137d2d7efc1" data-file-name="components/DashboardPopups.tsx">
                        <CheckCircle className="h-4 w-4 text-green-600" data-unique-id="c8fe98ba-279a-4cf7-9251-198f3831a78c" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true" />
                        <span className="text-sm text-gray-700" data-unique-id="a27cb7f7-af85-4ac6-87dd-256eea2a518b" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">{feature}</span>
                      </div>)}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200" data-unique-id="8bb1fbf8-22a7-4dac-8f06-ec5e04b14b72" data-file-name="components/DashboardPopups.tsx">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3" data-unique-id="4b3c73d2-2f59-4aa7-9969-3822ad126c20" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="ed7ee6b5-e20e-473f-8a95-433e1015371d" data-file-name="components/DashboardPopups.tsx">
                    Hubungi Kami untuk Perpanjangan:
                  </span></h4>
                  
                  <div className="space-y-3" data-unique-id="9798ae5a-2c27-4c71-ad37-13ab11c34a7c" data-file-name="components/DashboardPopups.tsx">
                    <div className="flex items-center space-x-3" data-unique-id="aa81b154-5703-4c01-a958-c378222355f9" data-file-name="components/DashboardPopups.tsx">
                      <div className="bg-green-100 p-2 rounded-lg" data-unique-id="d0d63d9f-34de-4221-aa90-e37dcad7c2ba" data-file-name="components/DashboardPopups.tsx">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div data-unique-id="9da42be7-64ef-4758-a3be-5530cd7167be" data-file-name="components/DashboardPopups.tsx">
                        <p className="font-medium text-gray-800" data-unique-id="dee40cd2-aa38-471e-b9e6-271ece227070" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="032a0872-eb8a-418b-8cfa-01254719eb37" data-file-name="components/DashboardPopups.tsx">WhatsApp</span></p>
                        <a href="tel:081272405881" className="text-green-600 font-medium hover:underline" data-unique-id="3cb7ff83-c048-452f-a2a1-b54ced5a97c5" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="cae2e3e9-cfbb-4973-9102-cb95f85a1214" data-file-name="components/DashboardPopups.tsx">
                          0812 7240 5881
                        </span></a>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3" data-unique-id="09811eb9-f94e-4085-af26-3fede95aa21c" data-file-name="components/DashboardPopups.tsx">
                      <div className="bg-blue-100 p-2 rounded-lg" data-unique-id="8c3c942d-5aa8-4d3c-865a-054c9cbd2247" data-file-name="components/DashboardPopups.tsx">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div data-unique-id="f5a5cf0f-cab1-4fc2-bc47-93ec83e78903" data-file-name="components/DashboardPopups.tsx">
                        <p className="font-medium text-gray-800" data-unique-id="8a899789-fa7b-4f39-8665-29e3ca3ba3a9" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="f3c94276-483b-4406-830a-03fd71e4c2a9" data-file-name="components/DashboardPopups.tsx">Email</span></p>
                        <a href="mailto:lehan.virtual@gmail.com" className="text-blue-600 font-medium hover:underline" data-unique-id="a8259dec-87a8-49fd-9dac-c7f33e279dc7" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="c4dd6bb0-e2c3-4b72-9669-7dc989a287de" data-file-name="components/DashboardPopups.tsx">
                          lehan.virtual@gmail.com
                        </span></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex space-x-3" data-unique-id="215b56e9-4b2f-40c5-935d-51757ec1c92b" data-file-name="components/DashboardPopups.tsx">
                <a href="https://wa.me/6281272405881?text=Halo%2C%20saya%20ingin%20perpanjangan%20aplikasi%20Absensi%20Digital" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center" data-unique-id="515b0be4-149b-47be-aaa2-f3b6438523c4" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="af5aee02-8f39-46af-a36c-130d58493340" data-file-name="components/DashboardPopups.tsx">
                  Chat WhatsApp
                </span></a>
                <button onClick={() => setShowExpiration(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors" data-unique-id="10095c17-e8cc-41b2-a029-8193075dfbd8" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="55f72c35-35e7-4bbc-b317-5da1071587a5" data-file-name="components/DashboardPopups.tsx">
                  Tutup
                </span></button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40" data-unique-id="ba7a2eb8-733d-425c-85a8-9d2ac4ce6059" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
        {/* Announcement Button */}
        {announcements.length > 0 && <motion.button initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }} onClick={() => setShowAnnouncement(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative" data-unique-id="f3c9d001-902c-40e2-85b7-350515d414ee" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
            <Bell className="h-6 w-6" />
            {announcements.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium" data-unique-id="a4dd8131-8fd6-43c0-aac2-d83b27826b75" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                {announcements.length}
              </span>}
          </motion.button>}

        {/* Expiration Button */}
        {expirationData && userRole === 'admin' && <motion.button initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }} onClick={() => setShowExpiration(true)} className={`text-white p-3 rounded-full shadow-lg transition-colors ${expirationData.isExpired ? 'bg-red-600 hover:bg-red-700' : expirationData.daysLeft <= 7 ? 'bg-orange-600 hover:bg-orange-700' : expirationData.daysLeft <= 30 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`} data-unique-id="be7b936e-1550-47ac-b88d-af42d5992006" data-file-name="components/DashboardPopups.tsx">
            <Calendar className="h-6 w-6" data-unique-id="0ccd2ccb-c070-412c-ba6b-1759f2fa4a90" data-file-name="components/DashboardPopups.tsx" />
          </motion.button>}
      </div>
    </>;
}