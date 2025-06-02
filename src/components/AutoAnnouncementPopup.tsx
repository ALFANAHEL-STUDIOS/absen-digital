'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: Date;
  isRead?: boolean;
}
interface AutoAnnouncementPopupProps {
  announcements: Announcement[];
  onMarkAsRead: (announcementId: string) => void;
  onCloseAll: () => void;
}
const AutoAnnouncementPopup: React.FC<AutoAnnouncementPopupProps> = ({
  announcements,
  onMarkAsRead,
  onCloseAll
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (announcements.length > 0) {
      setIsVisible(true);
    }
  }, [announcements]);
  const currentAnnouncement = announcements[currentIndex];
  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };
  const handleClose = () => {
    if (currentAnnouncement) {
      onMarkAsRead(currentAnnouncement.id);
    }
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
      onCloseAll();
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'urgent':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'from-orange-500 to-orange-600';
      case 'success':
        return 'from-green-500 to-green-600';
      case 'urgent':
        return 'from-red-500 to-red-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };
  if (!currentAnnouncement || !isVisible) return null;
  return <AnimatePresence>
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-unique-id="26a9a99d-45f9-4b3f-884d-e5d8c3b4682a" data-file-name="components/AutoAnnouncementPopup.tsx">
        <motion.div initial={{
        scale: 0.9,
        opacity: 0,
        y: 20
      }} animate={{
        scale: 1,
        opacity: 1,
        y: 0
      }} exit={{
        scale: 0.9,
        opacity: 0,
        y: 20
      }} transition={{
        type: "spring",
        duration: 0.5
      }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-unique-id="635ccd83-c73b-4a0c-a37e-74a852c8db8b" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getTypeColor(currentAnnouncement.type)} p-6 text-white relative`} data-unique-id="d399d6f7-cf28-4f36-add1-ba96f1edcb2d" data-file-name="components/AutoAnnouncementPopup.tsx">
            <button onClick={handleClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors" data-unique-id="c1a7b9af-8fbd-44c5-a71d-15ef0e48cac8" data-file-name="components/AutoAnnouncementPopup.tsx">
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3" data-unique-id="362fb2f0-3b1a-4b24-bc45-fa9cc0ceaad4" data-file-name="components/AutoAnnouncementPopup.tsx">
              <div className="bg-white bg-opacity-20 p-2 rounded-full" data-unique-id="5899d526-63eb-4bb1-a2ee-0088dfe8fa2d" data-file-name="components/AutoAnnouncementPopup.tsx">
                <Bell className="h-6 w-6" />
              </div>
              <div data-unique-id="1efe5b57-ed4b-41ac-9a51-87e78a147861" data-file-name="components/AutoAnnouncementPopup.tsx">
                <h3 className="text-lg font-bold" data-unique-id="ec9e1485-2f1a-4c31-99d7-5727bb3a459d" data-file-name="components/AutoAnnouncementPopup.tsx"><span className="editable-text" data-unique-id="473d6644-5f23-404b-8908-23d4f49f5ada" data-file-name="components/AutoAnnouncementPopup.tsx">Pengumuman Baru</span></h3>
                <p className="text-sm opacity-90" data-unique-id="9526d239-9ee8-4522-8765-9e086f0b1205" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
                  {currentIndex + 1}<span className="editable-text" data-unique-id="4d8ef09c-d264-4097-817c-8a51bf76d150" data-file-name="components/AutoAnnouncementPopup.tsx"> dari </span>{announcements.length}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6" data-unique-id="32aa8e49-abab-4e2f-9943-987a7d2a19c8" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
            <div className="flex items-start space-x-3 mb-4" data-unique-id="d4a1a0f1-1e4e-4029-b747-a388b1d8d352" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
              {getTypeIcon(currentAnnouncement.type)}
              <div className="flex-1" data-unique-id="5c2e3f49-cb15-48bd-921b-1d83d9721225" data-file-name="components/AutoAnnouncementPopup.tsx">
                <h4 className="text-lg font-semibold text-gray-800 mb-2" data-unique-id="ae0d7b9d-998e-4cfb-81af-f2b872c29932" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
                  {currentAnnouncement.title}
                </h4>
                <p className="text-gray-600 leading-relaxed" data-unique-id="b07b49a3-e0a2-4946-acc9-26c0f8a515dd" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
                  {currentAnnouncement.message}
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-6" data-unique-id="44908604-1116-47c4-87a1-90e1b5a6f37b" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
              {currentAnnouncement.createdAt.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            </div>

            {/* Actions */}
            <div className="flex space-x-3" data-unique-id="3bc41c35-6dbb-481d-9002-efcf3efdd27b" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
              {currentIndex < announcements.length - 1 ? <>
                  <button onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" data-unique-id="ebc67180-00a3-4bd2-b5e4-59d8fa1cb58d" data-file-name="components/AutoAnnouncementPopup.tsx"><span className="editable-text" data-unique-id="392c2463-f4b9-4e19-8171-98e4f1803160" data-file-name="components/AutoAnnouncementPopup.tsx">
                    Lewati
                  </span></button>
                  <button onClick={handleNext} className={`flex-1 px-4 py-2 bg-gradient-to-r ${getTypeColor(currentAnnouncement.type)} text-white rounded-lg hover:opacity-90 transition-opacity`} data-unique-id="fafe2708-4739-4196-b3da-c43ef149d4b8" data-file-name="components/AutoAnnouncementPopup.tsx"><span className="editable-text" data-unique-id="46016c0a-70ff-4625-8b00-282a91742568" data-file-name="components/AutoAnnouncementPopup.tsx">
                    Selanjutnya
                  </span></button>
                </> : <button onClick={handleClose} className={`w-full px-4 py-2 bg-gradient-to-r ${getTypeColor(currentAnnouncement.type)} text-white rounded-lg hover:opacity-90 transition-opacity`} data-unique-id="feaa992d-e315-4b74-9538-1d2d4b528e56" data-file-name="components/AutoAnnouncementPopup.tsx"><span className="editable-text" data-unique-id="e0391649-c775-4aca-9a76-004d95fc6c21" data-file-name="components/AutoAnnouncementPopup.tsx">
                  Mengerti
                </span></button>}
            </div>
          </div>

          {/* Progress indicator */}
          {announcements.length > 1 && <div className="px-6 pb-4" data-unique-id="f6c2da30-5957-438d-8a59-9bcb914b43f2" data-file-name="components/AutoAnnouncementPopup.tsx">
              <div className="flex space-x-1" data-unique-id="7d6c54fd-b9ee-4888-afd9-46b42eb6ef0a" data-file-name="components/AutoAnnouncementPopup.tsx" data-dynamic-text="true">
                {announcements.map((_, index) => <div key={index} className={`h-1 flex-1 rounded-full transition-colors ${index <= currentIndex ? 'bg-blue-500' : 'bg-gray-200'}`} data-unique-id="6cba7721-e3b0-4dba-909c-9c3cb1c12f93" data-file-name="components/AutoAnnouncementPopup.tsx" />)}
              </div>
            </div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>;
};
export default AutoAnnouncementPopup;