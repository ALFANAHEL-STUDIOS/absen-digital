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
        {showAnnouncement && announcements.length > 0 && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-unique-id="31c54d7f-266e-4980-8251-9e83e5ce6889" data-file-name="components/DashboardPopups.tsx">
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
        }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-unique-id="d136768f-dcf9-4dec-8d97-2959aacb2845" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
              {/* Header */}
              <div className={`bg-gradient-to-r ${getAnnouncementColors(announcements[currentAnnouncementIndex].type)} px-6 py-4 border-b`} data-unique-id="ab5d5460-270a-4bc8-a4db-07b16132a43a" data-file-name="components/DashboardPopups.tsx">
                <div className="flex items-center justify-between" data-unique-id="6991a7f1-b381-48a5-aae7-6199e524c579" data-file-name="components/DashboardPopups.tsx">
                  <div className="flex items-center space-x-3" data-unique-id="5c25aa5b-da7c-4dfd-8104-f7ea5ad02538" data-file-name="components/DashboardPopups.tsx">
                    <motion.div animate={{
                  scale: [1, 1.1, 1]
                }} transition={{
                  repeat: Infinity,
                  duration: 2
                }} className="bg-white/20 p-2 rounded-lg" data-unique-id="25716905-bfc4-4d46-a476-2cb27d68a3f4" data-file-name="components/DashboardPopups.tsx">
                      <Bell className="h-6 w-6 text-gray-700" />
                    </motion.div>
                    <div data-unique-id="0b3d2ce3-bbc4-4328-8f31-3b03a43353d0" data-file-name="components/DashboardPopups.tsx">
                      <h2 className="text-lg font-bold text-gray-800" data-unique-id="a6dd590c-7c36-4ca3-9989-d9fd10feebb4" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="7388fcac-e923-481a-8acc-83ff56b0d2c7" data-file-name="components/DashboardPopups.tsx">Pengumuman</span></h2>
                      <p className="text-sm text-gray-600" data-unique-id="489bbc2e-f588-4c61-8d1a-d89bd9c0ecd3" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                        {currentAnnouncementIndex + 1}<span className="editable-text" data-unique-id="2e25bd7c-1698-4085-8be5-6d271e669800" data-file-name="components/DashboardPopups.tsx"> dari </span>{announcements.length}
                      </p>
                    </div>
                  </div>
                  <button onClick={dismissAnnouncement} className="text-gray-500 hover:text-gray-700 hover:bg-white/20 p-2 rounded-lg transition-colors" data-unique-id="653762e5-9df3-407d-860b-cf46451f2de8" data-file-name="components/DashboardPopups.tsx">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6" data-unique-id="734e2b39-c137-462e-9eb1-363e8d1f37fd" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                <div className="flex items-start space-x-3 mb-4" data-unique-id="219f6d7e-5b31-4f10-a6ba-c16457faea8c" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                  {getAnnouncementIcon(announcements[currentAnnouncementIndex].type)}
                  <div className="flex-1" data-unique-id="f171bbd0-d5f5-4255-ac22-b631edc09b77" data-file-name="components/DashboardPopups.tsx">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-unique-id="7673f0ad-03d5-4dc6-9cf3-dc8fb18f2472" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                      {announcements[currentAnnouncementIndex].title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" data-unique-id="f2d249c3-3fc3-4ae6-9264-a82a9b9ce439" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                      {announcements[currentAnnouncementIndex].message}
                    </p>
                  </div>
                </div>

                {/* Progress indicators */}
                {announcements.length > 1 && <div className="flex justify-center space-x-2 mb-4" data-unique-id="aa51ff5e-7983-4162-8b58-88f813e73fbc" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                    {announcements.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentAnnouncementIndex ? 'bg-blue-500' : 'bg-gray-300'}`} data-unique-id="3cbbac3e-2768-416b-baea-2d977aaaad25" data-file-name="components/DashboardPopups.tsx" />)}
                  </div>}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center" data-unique-id="e25d2fdb-55ac-4ffc-9f9e-f4b6ea4bf531" data-file-name="components/DashboardPopups.tsx">
                <button onClick={dismissAnnouncement} className="text-gray-500 hover:text-gray-700 font-medium" data-unique-id="496069fe-cc22-44c4-8557-c4239a0fcaf6" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="739063f0-25ed-4f24-ad6b-252b19cce6b4" data-file-name="components/DashboardPopups.tsx">
                  Tutup Semua
                </span></button>
                <button onClick={nextAnnouncement} className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors" data-unique-id="a0248887-346d-451a-a987-bc95a6561408" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                  {currentAnnouncementIndex < announcements.length - 1 ? 'Selanjutnya' : 'Selesai'}
                </button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

      {/* Expiration Popup */}
      <AnimatePresence>
        {showExpiration && expirationData && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-unique-id="84cd94bd-10e1-4823-b058-6b34205903fe" data-file-name="components/DashboardPopups.tsx">
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
        }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" data-unique-id="7c663ddb-7d0a-4da7-8343-c1f92c3f07fa" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
              {/* Header */}
              <div className={`bg-gradient-to-r ${getExpirationColor()} px-6 py-4`} data-unique-id="a220f347-933c-4019-94a2-6885ac5eed58" data-file-name="components/DashboardPopups.tsx">
                <div className="flex items-center justify-between" data-unique-id="1772347f-3127-40e5-99cb-f25d6f5d70ff" data-file-name="components/DashboardPopups.tsx">
                  <div className="flex items-center space-x-3" data-unique-id="07db7502-45b1-4b80-a6d7-a3edfdf15722" data-file-name="components/DashboardPopups.tsx">
                    <motion.div animate={{
                  scale: [1, 1.1, 1]
                }} transition={{
                  repeat: Infinity,
                  duration: 2
                }} className="bg-white/20 p-2 rounded-lg" data-unique-id="5d4e30e8-e474-475c-9981-f066df2cbf6e" data-file-name="components/DashboardPopups.tsx">
                      <Calendar className="h-6 w-6 text-white" data-unique-id="4c342f7b-35fe-4ab1-8fbc-9d4d9d8d33ed" data-file-name="components/DashboardPopups.tsx" />
                    </motion.div>
                    <div data-unique-id="8b46ee19-91ef-45a0-b14e-7867eb7b127c" data-file-name="components/DashboardPopups.tsx">
                      <h2 className="text-xl font-bold text-white" data-unique-id="42085c8a-406c-4c5a-b2a8-08ffefd2331e" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="ae20598d-b52d-4f2b-a770-336d7761fb67" data-file-name="components/DashboardPopups.tsx">Status Masa Berlaku</span></h2>
                      <p className="text-white/80 text-sm" data-unique-id="a89d5a6e-f917-4528-b198-5eef6bd281f6" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">{expirationData.planType}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowExpiration(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" data-unique-id="19a2ee4f-ddd6-4860-a3a4-d2b40984cfab" data-file-name="components/DashboardPopups.tsx">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6" data-unique-id="43fb529a-7ce4-4bdc-8fd3-05d262e5b88a" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                {/* Status Card */}
                <div className={`bg-gradient-to-br ${expirationData.isExpired ? 'from-red-50 to-red-100 border-red-200' : expirationData.daysLeft <= 7 ? 'from-orange-50 to-orange-100 border-orange-200' : expirationData.daysLeft <= 30 ? 'from-yellow-50 to-yellow-100 border-yellow-200' : 'from-green-50 to-green-100 border-green-200'} rounded-xl p-6 border`} data-unique-id="d7de1b90-821f-433e-b6a2-1e504315b5c4" data-file-name="components/DashboardPopups.tsx">
                  <div className="flex items-center space-x-4" data-unique-id="cf361855-943a-4b6c-9dac-34fdbf356a9d" data-file-name="components/DashboardPopups.tsx">
                    <div className="flex-shrink-0" data-unique-id="af9ab180-7779-4153-a07f-8c396a877a34" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                      {expirationData.isExpired ? <AlertTriangle className="h-8 w-8 text-red-600" /> : expirationData.daysLeft <= 7 ? <AlertTriangle className="h-8 w-8 text-orange-600" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
                    </div>
                    <div className="flex-1" data-unique-id="dd8caaac-6897-4ace-9451-e1db2686cca5" data-file-name="components/DashboardPopups.tsx">
                      <h3 className="text-xl font-bold text-gray-800 mb-1" data-unique-id="2c349347-5e25-417f-a740-89fc3c4c54fb" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                        {getExpirationMessage()}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600" data-unique-id="31cfb027-60b9-45d5-a8ae-f325d5aad07d" data-file-name="components/DashboardPopups.tsx">
                        <div className="flex items-center space-x-1" data-unique-id="1622c814-b426-47ac-8530-3fa80c35b9d1" data-file-name="components/DashboardPopups.tsx">
                          <Clock className="h-4 w-4" />
                          <span data-unique-id="780bb165-7c02-4875-83d7-f509bb4595d4" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                            {expirationData.isExpired ? 'Kedaluwarsa' : `${expirationData.daysLeft} hari tersisa`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1" data-unique-id="4d03a1a0-b6ff-469f-8a8e-e2aa32055045" data-file-name="components/DashboardPopups.tsx">
                          <Calendar className="h-4 w-4" data-unique-id="568d5b90-8ffd-4153-843e-d256c04a7660" data-file-name="components/DashboardPopups.tsx" />
                          <span data-unique-id="d601ba71-8fbb-4265-8662-874aa38e460d" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="c7057934-f5ee-4aea-988d-e13b614799ac" data-file-name="components/DashboardPopups.tsx">Berakhir: </span>{expirationData.expiryDate.toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200" data-unique-id="ad875c4d-5799-403f-8161-64b4f82b4eee" data-file-name="components/DashboardPopups.tsx">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4" data-unique-id="313c86c6-ddbe-4924-85ab-630d2647a740" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="1151c5c0-b71a-4029-9864-67b5b5618408" data-file-name="components/DashboardPopups.tsx">Fitur Aktif</span></h4>
                  <div className="grid grid-cols-1 gap-3" data-unique-id="3ba99f67-10bf-48b0-9248-0a1873ba426b" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
                    {expirationData.features.map((feature, index) => <div key={index} className="flex items-center space-x-2" data-unique-id="83ac8c2e-372f-4731-9f21-b5ac60c0506f" data-file-name="components/DashboardPopups.tsx">
                        <CheckCircle className="h-4 w-4 text-green-600" data-unique-id="f29b1c9f-10ba-40d4-a24d-7cde2177442a" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true" />
                        <span className="text-sm text-gray-700" data-unique-id="69ade9e7-747f-408e-af5f-8ea82490f835" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">{feature}</span>
                      </div>)}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200" data-unique-id="97539f91-6964-4948-9684-65b3ddaa8dbe" data-file-name="components/DashboardPopups.tsx">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3" data-unique-id="54554c5f-28bd-4988-8c31-318dcf5a77ce" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="99c87250-f110-4524-b391-6eb7baf1d53b" data-file-name="components/DashboardPopups.tsx">
                    Hubungi Kami untuk Perpanjangan:
                  </span></h4>
                  
                  <div className="space-y-3" data-unique-id="31e79b5a-d835-4fca-8511-d3d782d141dc" data-file-name="components/DashboardPopups.tsx">
                    <div className="flex items-center space-x-3" data-unique-id="dc9185e2-aba5-4c0d-861f-8530f74c6a97" data-file-name="components/DashboardPopups.tsx">
                      <div className="bg-green-100 p-2 rounded-lg" data-unique-id="e8c2e44e-3421-46e9-b8aa-155d6b66daff" data-file-name="components/DashboardPopups.tsx">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div data-unique-id="be64e0b8-1d50-4d4f-9e2e-0faffa66e567" data-file-name="components/DashboardPopups.tsx">
                        <p className="font-medium text-gray-800" data-unique-id="a36f0b7c-50ed-4ebe-bf66-63e1dc45db0d" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="769b628b-04fa-4e06-bbc8-47a32fbec5a8" data-file-name="components/DashboardPopups.tsx">WhatsApp</span></p>
                        <a href="tel:081272405881" className="text-green-600 font-medium hover:underline" data-unique-id="3c65a54e-422e-47bd-b0ca-a5896dee99d6" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="d6165271-7cf6-473f-991e-51ea7979c717" data-file-name="components/DashboardPopups.tsx">
                          0812 7240 5881
                        </span></a>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3" data-unique-id="b4ef2a60-a857-434b-ba17-e4192d4d684a" data-file-name="components/DashboardPopups.tsx">
                      <div className="bg-blue-100 p-2 rounded-lg" data-unique-id="c04d9ca3-a81b-44e6-b95a-30648fad9d1a" data-file-name="components/DashboardPopups.tsx">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div data-unique-id="9927ff09-15b0-4191-9763-76d5b81539b9" data-file-name="components/DashboardPopups.tsx">
                        <p className="font-medium text-gray-800" data-unique-id="b74f35ff-a6cd-42e1-8324-f5508e29f117" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="ee2f9eee-1465-4b7f-ad06-43e6b897c8f4" data-file-name="components/DashboardPopups.tsx">Email</span></p>
                        <a href="mailto:lehan.virtual@gmail.com" className="text-blue-600 font-medium hover:underline" data-unique-id="ef0a6070-4991-4e07-98bb-05e937d08e5f" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="09405d52-9134-4ce5-b9c1-b587e172d6a5" data-file-name="components/DashboardPopups.tsx">
                          lehan.virtual@gmail.com
                        </span></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex space-x-3" data-unique-id="1cf1bc37-f86f-4477-95b2-9686c9405930" data-file-name="components/DashboardPopups.tsx">
                <a href="https://wa.me/6281272405881?text=Halo%2C%20saya%20ingin%20perpanjangan%20aplikasi%20Absensi%20Digital" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center" data-unique-id="4086ec90-70ed-45bc-baee-2ef1fad1f250" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="2e169113-29a3-4c8c-95f9-50c9ad41690d" data-file-name="components/DashboardPopups.tsx">
                  Chat WhatsApp
                </span></a>
                <button onClick={() => setShowExpiration(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors" data-unique-id="7720c517-e4aa-44fb-abd7-4631963c10ce" data-file-name="components/DashboardPopups.tsx"><span className="editable-text" data-unique-id="0e789903-ec3f-4cc9-a805-28ee30e32f12" data-file-name="components/DashboardPopups.tsx">
                  Tutup
                </span></button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40" data-unique-id="605dd13a-b31b-4921-948a-2652db91df9d" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
        {/* Announcement Button */}
        {announcements.length > 0 && <motion.button initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }} onClick={() => setShowAnnouncement(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative" data-unique-id="25fd3d6c-e3f4-4b91-a3a0-6ca58e8f084e" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
            <Bell className="h-6 w-6" />
            {announcements.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium" data-unique-id="20b40a12-cab6-4282-a078-5e8288fefd86" data-file-name="components/DashboardPopups.tsx" data-dynamic-text="true">
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
      }} onClick={() => setShowExpiration(true)} className={`text-white p-3 rounded-full shadow-lg transition-colors ${expirationData.isExpired ? 'bg-red-600 hover:bg-red-700' : expirationData.daysLeft <= 7 ? 'bg-orange-600 hover:bg-orange-700' : expirationData.daysLeft <= 30 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`} data-unique-id="63152ac1-be0c-4264-8a81-5bbb20843fca" data-file-name="components/DashboardPopups.tsx">
            <Calendar className="h-6 w-6" data-unique-id="0114b4d1-7a54-485e-a98e-78718c86d35f" data-file-name="components/DashboardPopups.tsx" />
          </motion.button>}
      </div>
    </>;
}
