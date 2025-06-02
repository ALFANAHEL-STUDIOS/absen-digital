"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Calendar, Clock, Phone, Mail, X, CheckCircle, AlertCircle } from "lucide-react";
interface ExpirationTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string | null;
}
export default function ExpirationTracker({
  isOpen,
  onClose,
  schoolId
}: ExpirationTrackerProps) {
  const [expirationData, setExpirationData] = useState({
    expiryDate: new Date('2025-12-31'),
    daysLeft: 0,
    isExpired: false,
    planType: 'Free Trial',
    features: ['Absensi Siswa', 'Laporan Dasar', 'QR Code Generator'],
    usageStats: {
      students: 150,
      maxStudents: 200,
      reports: 25,
      maxReports: 50
    }
  });
  useEffect(() => {
    if (isOpen) {
      calculateExpiration();
    }
  }, [isOpen]);
  const calculateExpiration = () => {
    const now = new Date();
    const expiry = expirationData.expiryDate;
    const timeDiff = expiry.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setExpirationData(prev => ({
      ...prev,
      daysLeft,
      isExpired: daysLeft <= 0
    }));
  };
  const getStatusColor = () => {
    if (expirationData.isExpired) return 'from-red-500 to-red-600';
    if (expirationData.daysLeft <= 7) return 'from-orange-500 to-red-500';
    if (expirationData.daysLeft <= 30) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-blue-500';
  };
  const getStatusIcon = () => {
    if (expirationData.isExpired) return <AlertTriangle className="h-8 w-8 text-red-600" />;
    if (expirationData.daysLeft <= 7) return <AlertCircle className="h-8 w-8 text-orange-600" />;
    return <CheckCircle className="h-8 w-8 text-green-600" />;
  };
  const getStatusMessage = () => {
    if (expirationData.isExpired) return 'Masa berlaku telah berakhir';
    if (expirationData.daysLeft <= 7) return 'Masa berlaku akan segera berakhir';
    if (expirationData.daysLeft <= 30) return 'Masa berlaku akan berakhir dalam 1 bulan';
    return 'Masa berlaku masih tersedia';
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-unique-id="8f2253a3-fc6f-437a-9e58-d91fc7af9512" data-file-name="components/ExpirationTracker.tsx">
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
      }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" data-unique-id="e193ad5c-0952-47c6-abc3-9d80d996eee5" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getStatusColor()} px-6 py-4`} data-unique-id="7544c714-210f-4446-9312-c702f624c548" data-file-name="components/ExpirationTracker.tsx">
            <div className="flex items-center justify-between" data-unique-id="7785ee42-35ce-431e-83f1-b76a527e0ee6" data-file-name="components/ExpirationTracker.tsx">
              <div className="flex items-center space-x-3" data-unique-id="e38ddf32-7d4f-4ad6-ae9b-d0f09609eaf5" data-file-name="components/ExpirationTracker.tsx">
                <motion.div animate={{
                scale: [1, 1.1, 1]
              }} transition={{
                repeat: Infinity,
                duration: 2
              }} className="bg-white/20 p-2 rounded-lg" data-unique-id="68097290-f3e8-4866-a091-6bf88a470ca2" data-file-name="components/ExpirationTracker.tsx">
                  <Calendar className="h-6 w-6 text-white" data-unique-id="293c8bfb-06b1-4c6a-a6ac-75e2a2669b78" data-file-name="components/ExpirationTracker.tsx" />
                </motion.div>
                <div data-unique-id="1b446cb5-0844-4290-93fd-a5c02c48f5f7" data-file-name="components/ExpirationTracker.tsx">
                  <h2 className="text-xl font-bold text-white" data-unique-id="3c4a2179-34b7-471d-97a4-6d0c83cc182e" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="fa2a6d06-ca89-47ac-8019-b5257bf358ff" data-file-name="components/ExpirationTracker.tsx">Status Masa Berlaku</span></h2>
                  <p className="text-white/80 text-sm" data-unique-id="d568682c-e29e-4cf0-b02e-41285539d2fc" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">{expirationData.planType}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" data-unique-id="69b90f64-f088-4aab-90ef-3635b76e8dc1" data-file-name="components/ExpirationTracker.tsx">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6" data-unique-id="1c9eb530-dbc9-4983-9172-79ca79da9a8d" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
            {/* Status Card */}
            <div className={`bg-gradient-to-br ${expirationData.isExpired ? 'from-red-50 to-red-100 border-red-200' : expirationData.daysLeft <= 7 ? 'from-orange-50 to-orange-100 border-orange-200' : expirationData.daysLeft <= 30 ? 'from-yellow-50 to-yellow-100 border-yellow-200' : 'from-green-50 to-green-100 border-green-200'} rounded-xl p-6 border`} data-unique-id="1bcc0f0b-f5ff-4607-b39c-546ef8680a14" data-file-name="components/ExpirationTracker.tsx">
              <div className="flex items-center space-x-4" data-unique-id="b4222255-136b-4293-9036-fdd6edf30b42" data-file-name="components/ExpirationTracker.tsx">
                <div className="flex-shrink-0" data-unique-id="205f4b64-ebb3-4579-bbb2-c08a86e0fe36" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
                  {getStatusIcon()}
                </div>
                <div className="flex-1" data-unique-id="b0bfa69b-e913-4f79-b9e0-0c3ad71a1df5" data-file-name="components/ExpirationTracker.tsx">
                  <h3 className="text-xl font-bold text-gray-800 mb-1" data-unique-id="97b91042-40fe-4b59-b098-552eaed1e80c" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
                    {getStatusMessage()}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600" data-unique-id="f01d5b00-8b3a-4df5-a381-c4b696109260" data-file-name="components/ExpirationTracker.tsx">
                    <div className="flex items-center space-x-1" data-unique-id="b4781135-f7cc-49a6-966b-28ddac6558e5" data-file-name="components/ExpirationTracker.tsx">
                      <Clock className="h-4 w-4" />
                      <span data-unique-id="cde764f7-a77b-46e7-9522-6b0e2ab406f6" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
                        {expirationData.isExpired ? 'Kedaluwarsa' : `${expirationData.daysLeft} hari tersisa`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1" data-unique-id="e6e97f4e-c046-413f-b011-5e5403afea6e" data-file-name="components/ExpirationTracker.tsx">
                      <Calendar className="h-4 w-4" data-unique-id="9f064bea-7115-4c30-aecf-07bd2c16c3a1" data-file-name="components/ExpirationTracker.tsx" />
                      <span data-unique-id="c34404c1-24bc-453e-b00f-e23da4b4e8b3" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="f88ab15b-8a00-47b0-afbf-98fccdbac2d6" data-file-name="components/ExpirationTracker.tsx">
                        Berakhir: </span>{expirationData.expiryDate.toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-gray-50 rounded-xl p-6" data-unique-id="aa5519e4-f01f-4e81-b644-daea03a0916a" data-file-name="components/ExpirationTracker.tsx">
              <h4 className="text-lg font-semibold text-gray-800 mb-4" data-unique-id="893e6a5a-c69b-4449-a425-e73abe496247" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="3480ba97-3f2e-4d2a-ac4e-3a0764b6644a" data-file-name="components/ExpirationTracker.tsx">Statistik Penggunaan</span></h4>
              <div className="space-y-4" data-unique-id="c9e34180-e760-472b-aaf4-3cf2e33512af" data-file-name="components/ExpirationTracker.tsx">
                <div data-unique-id="0f7e38ab-9b9b-43e2-8300-990149d0ef4e" data-file-name="components/ExpirationTracker.tsx">
                  <div className="flex justify-between items-center mb-2" data-unique-id="20e4aec6-f10d-4594-bdd3-809764e26552" data-file-name="components/ExpirationTracker.tsx">
                    <span className="text-sm font-medium text-gray-700" data-unique-id="6fd71e75-24bd-4863-9319-681373848a34" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="1b1c3bb1-af6f-4e34-aafe-1c2cf477710f" data-file-name="components/ExpirationTracker.tsx">Siswa Terdaftar</span></span>
                    <span className="text-sm text-gray-500" data-unique-id="9bfe4a90-e30f-40d1-819c-9d59cd4f7091" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
                      {expirationData.usageStats.students}<span className="editable-text" data-unique-id="470d345c-e8ed-41d9-85cc-c3fd0acddd97" data-file-name="components/ExpirationTracker.tsx"> / </span>{expirationData.usageStats.maxStudents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" data-unique-id="f98d0b0d-bcf4-4d51-8f8d-a28c648e1bbe" data-file-name="components/ExpirationTracker.tsx">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
                    width: `${expirationData.usageStats.students / expirationData.usageStats.maxStudents * 100}%`
                  }} data-unique-id="9e1b41d0-3a71-4456-af5f-204ebf34107e" data-file-name="components/ExpirationTracker.tsx"></div>
                  </div>
                </div>

                <div data-unique-id="3b5a04f5-80a6-4ffd-bcc5-d7d0371cf996" data-file-name="components/ExpirationTracker.tsx">
                  <div className="flex justify-between items-center mb-2" data-unique-id="23195441-ba1c-478b-be45-d9d3d20fa095" data-file-name="components/ExpirationTracker.tsx">
                    <span className="text-sm font-medium text-gray-700" data-unique-id="926d289d-266a-44d2-81fc-64cb32853e37" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="a0be3afb-b138-47a4-87b5-a0b27952858b" data-file-name="components/ExpirationTracker.tsx">Laporan Dibuat</span></span>
                    <span className="text-sm text-gray-500" data-unique-id="d2d3d6d8-930d-4a99-b281-18d8789b05aa" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
                      {expirationData.usageStats.reports}<span className="editable-text" data-unique-id="6cadbea3-51b4-47da-bb56-988309373c68" data-file-name="components/ExpirationTracker.tsx"> / </span>{expirationData.usageStats.maxReports}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" data-unique-id="f21e36fe-3c0e-481b-9354-ffc8ff7f5a31" data-file-name="components/ExpirationTracker.tsx">
                    <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{
                    width: `${expirationData.usageStats.reports / expirationData.usageStats.maxReports * 100}%`
                  }} data-unique-id="b44043ee-f265-45aa-8da0-77d88158b491" data-file-name="components/ExpirationTracker.tsx"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200" data-unique-id="4894054e-1b81-4ee8-b48a-73c14e8dc799" data-file-name="components/ExpirationTracker.tsx">
              <h4 className="text-lg font-semibold text-blue-800 mb-4" data-unique-id="07afc8c2-6a58-423e-a9ad-bde625652a2a" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="68406c3d-62fd-4f33-8b6e-8a54367c9e82" data-file-name="components/ExpirationTracker.tsx">Fitur Aktif</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-unique-id="908ae5b6-c7f2-4f84-9585-f3da7956a648" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">
                {expirationData.features.map((feature, index) => <div key={index} className="flex items-center space-x-2" data-unique-id="d6ef7b20-8f7d-4082-9d05-35f043fd61e8" data-file-name="components/ExpirationTracker.tsx">
                    <CheckCircle className="h-4 w-4 text-green-600" data-unique-id="cb255c18-e87d-419b-8349-f1e73ab522dd" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true" />
                    <span className="text-sm text-gray-700" data-unique-id="64e20ad2-0565-4c08-9625-3ba4b87b3fa1" data-file-name="components/ExpirationTracker.tsx" data-dynamic-text="true">{feature}</span>
                  </div>)}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200" data-unique-id="ede64be9-c0b9-4982-aa78-e350b509dbe1" data-file-name="components/ExpirationTracker.tsx">
              <h4 className="text-lg font-semibold text-purple-800 mb-3" data-unique-id="2c44af6d-a3e1-4b76-b24e-0e1124d19bd2" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="61604d51-53cb-4977-8480-671a2ee5171b" data-file-name="components/ExpirationTracker.tsx">
                Hubungi Kami untuk Perpanjangan:
              </span></h4>
              
              <div className="space-y-3" data-unique-id="fea319bb-49b8-483d-9d49-5aa30b18cb57" data-file-name="components/ExpirationTracker.tsx">
                <div className="flex items-center space-x-3" data-unique-id="eeb4b123-9bed-46d8-b421-b0dcf944bbb2" data-file-name="components/ExpirationTracker.tsx">
                  <div className="bg-green-100 p-2 rounded-lg" data-unique-id="5a7d17d4-795c-4ee7-b8b9-448b2d0e30ac" data-file-name="components/ExpirationTracker.tsx">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div data-unique-id="82acb687-2415-4f58-b125-3c058a0bb7a2" data-file-name="components/ExpirationTracker.tsx">
                    <p className="font-medium text-gray-800" data-unique-id="b95b46e4-f15c-426c-87bf-de28489f19ff" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="b422ad93-1f1d-4a3f-8f89-d45bb1f3f2b7" data-file-name="components/ExpirationTracker.tsx">WhatsApp</span></p>
                    <a href="tel:081272405881" className="text-green-600 font-medium hover:underline" data-unique-id="e8bcc2d8-c5e7-494f-b72b-4e3651a7c36b" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="029d07ab-7529-4e72-99a0-be73964b5fd8" data-file-name="components/ExpirationTracker.tsx">
                      0812 7240 5881
                    </span></a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3" data-unique-id="0538ebcf-4661-4c5f-a1ce-31e163759dbc" data-file-name="components/ExpirationTracker.tsx">
                  <div className="bg-blue-100 p-2 rounded-lg" data-unique-id="f3fd6234-59a0-4951-a456-2acc2cb11a4c" data-file-name="components/ExpirationTracker.tsx">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div data-unique-id="1939814a-0ced-4e90-9c46-a3c7769c0532" data-file-name="components/ExpirationTracker.tsx">
                    <p className="font-medium text-gray-800" data-unique-id="2aa9a2ea-e838-4d4a-b531-2ac70cd1ef37" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="fbb98394-9d7d-4a4d-9156-1f845e80f38c" data-file-name="components/ExpirationTracker.tsx">Email</span></p>
                    <a href="mailto:lehan.virtual@gmail.com" className="text-blue-600 font-medium hover:underline" data-unique-id="3b0f8f3b-cc1b-457c-9e40-d395f23db2b8" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="25bd70ce-2e1d-4657-b111-d3e02cd401ad" data-file-name="components/ExpirationTracker.tsx">
                      lehan.virtual@gmail.com
                    </span></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex space-x-3" data-unique-id="5cf8b24b-df5e-4276-94ed-fb7f4fd04774" data-file-name="components/ExpirationTracker.tsx">
            <a href="https://wa.me/6281272405881?text=Halo%2C%20saya%20ingin%20perpanjangan%20aplikasi%20Absensi%20Digital" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center" data-unique-id="eb5817cf-f744-43bb-9329-faa5b1c61a0f" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="71292f7f-0da8-42de-86fd-5ac0f49b4c53" data-file-name="components/ExpirationTracker.tsx">
              Chat WhatsApp
            </span></a>
            <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors" data-unique-id="40217dba-b5f3-4047-aca9-772ce1eb572a" data-file-name="components/ExpirationTracker.tsx"><span className="editable-text" data-unique-id="ecc4b906-f0bc-4026-9c10-dea7fa823008" data-file-name="components/ExpirationTracker.tsx">
              Tutup
            </span></button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}