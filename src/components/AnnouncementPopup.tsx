"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Calendar, Clock, User, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface AnnouncementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string | null;
}
export default function AnnouncementPopup({
  isOpen,
  onClose,
  schoolId
}: AnnouncementPopupProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (isOpen && schoolId) {
      fetchAnnouncements();
    }
  }, [isOpen, schoolId]);
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const {
        collection,
        query,
        where,
        getDocs,
        orderBy
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      const announcementsRef = collection(db, "announcements");
      const q = query(announcementsRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const announcementsList: Announcement[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        announcementsList.push({
          id: doc.id,
          title: data.title || "",
          message: data.message || "",
          isActive: data.isActive !== false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
        });
      });
      setAnnouncements(announcementsList);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };
  const nextAnnouncement = () => {
    setCurrentIndex(prev => (prev + 1) % announcements.length);
  };
  const prevAnnouncement = () => {
    setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-unique-id="0144c5e8-d85d-4f74-a315-f951a3bf4b9b" data-file-name="components/AnnouncementPopup.tsx">
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
      }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" data-unique-id="e4b8d7a0-7b52-437c-a40c-509b663fb4d9" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4" data-unique-id="ecca8ee3-6979-47ab-8f79-9b61ec9fabc2" data-file-name="components/AnnouncementPopup.tsx">
            <div className="flex items-center justify-between" data-unique-id="5f30cee5-730f-47e5-8480-16a5001c5a7f" data-file-name="components/AnnouncementPopup.tsx">
              <div className="flex items-center space-x-3" data-unique-id="2a8f88d7-30a2-4546-a86a-a156edf878e1" data-file-name="components/AnnouncementPopup.tsx">
                <motion.div animate={{
                rotate: [0, 10, -10, 0]
              }} transition={{
                repeat: Infinity,
                duration: 2
              }} className="bg-white/20 p-2 rounded-lg" data-unique-id="d36abe15-2728-4ac9-8088-94a8f15d7b72" data-file-name="components/AnnouncementPopup.tsx">
                  <Bell className="h-6 w-6 text-white" />
                </motion.div>
                <div data-unique-id="88541a2d-b122-4a2f-b1f0-c89c7f731c70" data-file-name="components/AnnouncementPopup.tsx">
                  <h2 className="text-xl font-bold text-white" data-unique-id="92c98006-c3fb-4ca7-9067-bf515ec47e58" data-file-name="components/AnnouncementPopup.tsx"><span className="editable-text" data-unique-id="ead2bfa0-c63f-4e5e-834c-f8fe8c6f9101" data-file-name="components/AnnouncementPopup.tsx">Pengumuman Sekolah</span></h2>
                  <p className="text-blue-100 text-sm" data-unique-id="397c1604-808e-4c4f-bb4f-7444fe298655" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                    {announcements.length > 0 ? `${announcements.length} pengumuman aktif` : 'Tidak ada pengumuman'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" data-unique-id="f9a07047-77e4-4a09-97b7-c2a2f63036d9" data-file-name="components/AnnouncementPopup.tsx">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6" data-unique-id="a7c5c48a-8495-4912-b800-984baa772867" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
            {loading ? <div className="flex items-center justify-center py-12" data-unique-id="77037170-055b-4a52-a6dc-cdf2598eb8fb" data-file-name="components/AnnouncementPopup.tsx">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" data-unique-id="1f108c00-eed4-444d-9c75-28917acaac29" data-file-name="components/AnnouncementPopup.tsx"></div>
              </div> : announcements.length > 0 ? <div className="space-y-6" data-unique-id="c311574a-e26d-49f4-95fc-eb6a3b06cccd" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                {/* Current Announcement */}
                <motion.div key={currentIndex} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.3
            }} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200" data-unique-id="c3e8beef-f021-4647-8f0c-9b857f02dafb" data-file-name="components/AnnouncementPopup.tsx">
                  <div className="flex items-start justify-between mb-4" data-unique-id="9a31479c-f264-4daa-9044-66169f55575f" data-file-name="components/AnnouncementPopup.tsx">
                    <h3 className="text-xl font-bold text-gray-800 pr-4" data-unique-id="6402680a-5adf-428e-b38c-06b405ea868b" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                      {announcements[currentIndex].title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-blue-600 bg-white px-3 py-1 rounded-full" data-unique-id="80ca75a5-2480-4436-bd16-ea996335948d" data-file-name="components/AnnouncementPopup.tsx">
                      <Calendar className="h-4 w-4" data-unique-id="ea12363b-c00c-4dbd-b8e4-c22f58fd361e" data-file-name="components/AnnouncementPopup.tsx" />
                      <span data-unique-id="287cd6f0-86ff-4c6b-a11e-ea9aa0925b52" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                        {format(announcements[currentIndex].createdAt, "d MMM yyyy", {
                      locale: id
                    })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none" data-unique-id="141999ae-ef1a-4ebf-8f0c-e7fa9db0a4d2" data-file-name="components/AnnouncementPopup.tsx">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" data-unique-id="107ee2f8-ba7b-4108-9cd5-eb850b556913" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                      {announcements[currentIndex].message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-200" data-unique-id="06812779-3c20-48e2-9763-c5c88d9a0f78" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                    <div className="flex items-center space-x-2 text-sm text-gray-500" data-unique-id="f8c87428-fa00-4270-a80f-1d637e24d5fa" data-file-name="components/AnnouncementPopup.tsx">
                      <Clock className="h-4 w-4" />
                      <span data-unique-id="4a272d46-e3dc-4439-bf6e-5830bdca3189" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="5c5cf93d-e3f2-43c3-8596-d56a122c7d40" data-file-name="components/AnnouncementPopup.tsx">
                        Diperbarui </span>{format(announcements[currentIndex].updatedAt, "d MMM yyyy HH:mm", {
                      locale: id
                    })}
                      </span>
                    </div>
                    
                    {announcements.length > 1 && <div className="flex items-center space-x-2" data-unique-id="fff59d8e-e167-4bf2-ad3d-8b0e27410d06" data-file-name="components/AnnouncementPopup.tsx">
                        <button onClick={prevAnnouncement} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-unique-id="169567e7-9ac9-47b6-8c74-d6e1ec55b561" data-file-name="components/AnnouncementPopup.tsx">
                          <ChevronRight className="h-4 w-4 rotate-180" />
                        </button>
                        <span className="text-sm text-gray-500 px-2" data-unique-id="8abc9f68-f227-45f0-b9bb-b32d0bacc005" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                          {currentIndex + 1}<span className="editable-text" data-unique-id="b479b41e-abd2-43ad-84b6-423049b19d08" data-file-name="components/AnnouncementPopup.tsx"> / </span>{announcements.length}
                        </span>
                        <button onClick={nextAnnouncement} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-unique-id="cbbaf0ca-b8f9-493a-b0b4-ad2bb5bfac87" data-file-name="components/AnnouncementPopup.tsx">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>}
                  </div>
                </motion.div>

                {/* Navigation dots */}
                {announcements.length > 1 && <div className="flex justify-center space-x-2" data-unique-id="7c70cd39-acdf-4e87-97e4-28eee7ae3029" data-file-name="components/AnnouncementPopup.tsx" data-dynamic-text="true">
                    {announcements.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`} data-unique-id="e1cd0c09-9924-4ed6-8f03-9cfd5f51bd4b" data-file-name="components/AnnouncementPopup.tsx" />)}
                  </div>}
              </div> : <div className="text-center py-12" data-unique-id="9e515636-82ee-4495-ae92-068f11fe37b3" data-file-name="components/AnnouncementPopup.tsx">
                <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center" data-unique-id="d47e4652-52f2-4013-badb-19ebd61f696e" data-file-name="components/AnnouncementPopup.tsx">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2" data-unique-id="793d8579-318c-4b5f-856b-2a1aca18de41" data-file-name="components/AnnouncementPopup.tsx"><span className="editable-text" data-unique-id="0e82206b-e9c6-4a21-a044-405cacb73a58" data-file-name="components/AnnouncementPopup.tsx">Tidak Ada Pengumuman</span></h3>
                <p className="text-gray-500" data-unique-id="edf10687-e573-49f9-9857-cec9f0d2c868" data-file-name="components/AnnouncementPopup.tsx"><span className="editable-text" data-unique-id="9cf3f727-fae4-4122-8724-025704c6b04b" data-file-name="components/AnnouncementPopup.tsx">
                  Saat ini tidak ada pengumuman aktif yang perlu ditampilkan.
                </span></p>
              </div>}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4" data-unique-id="e9dcc604-9cd4-4f47-8401-d8e7d176eec8" data-file-name="components/AnnouncementPopup.tsx">
            <button onClick={onClose} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl" data-unique-id="cfb38756-a058-487e-8a0d-9269b1c33449" data-file-name="components/AnnouncementPopup.tsx"><span className="editable-text" data-unique-id="204b417d-4ea4-472c-9db8-bbb19fc72eef" data-file-name="components/AnnouncementPopup.tsx">
              Tutup Pengumuman
            </span></button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}