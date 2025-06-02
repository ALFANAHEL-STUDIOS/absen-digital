"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, Mail, X } from "lucide-react";
interface ExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysLeft?: number;
}
export default function ExpirationModal({
  isOpen,
  onClose,
  daysLeft = 0
}: ExpirationModalProps) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" data-unique-id="87658392-8fbb-4cb2-884d-9bbe52211288" data-file-name="components/ExpirationModal.tsx">
      <motion.div initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.9
    }} className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden" data-unique-id="ed24f920-234c-40de-b209-7952aad0ea5d" data-file-name="components/ExpirationModal.tsx" data-dynamic-text="true">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4" data-unique-id="e5f1aad0-1d2c-40c5-9cf1-2ff604efda89" data-file-name="components/ExpirationModal.tsx">
          <div className="flex items-center justify-between" data-unique-id="6c709148-b2a1-46e9-9228-9852c565a16e" data-file-name="components/ExpirationModal.tsx">
            <div className="flex items-center space-x-3" data-unique-id="9dc7878a-fc2a-4e89-8ab8-230287f626fc" data-file-name="components/ExpirationModal.tsx">
              <AlertTriangle className="h-6 w-6 text-white" />
              <h3 className="text-lg font-semibold text-white" data-unique-id="11de3ebc-07cc-4ed1-8f42-eb3e8efaf596" data-file-name="components/ExpirationModal.tsx" data-dynamic-text="true">
                {daysLeft <= 0 ? "Masa Berlaku Habis" : "Masa Berlaku Akan Habis"}
              </h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" data-unique-id="5853fb6e-b3f9-487e-a1a8-8eac5d29ed4f" data-file-name="components/ExpirationModal.tsx">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6" data-unique-id="f51f037d-7e02-4c15-bbac-69a1a2b107cc" data-file-name="components/ExpirationModal.tsx" data-dynamic-text="true">
          <div className="text-center mb-6" data-unique-id="fde84783-2045-4418-8bc5-4bf7fd897d02" data-file-name="components/ExpirationModal.tsx" data-dynamic-text="true">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-unique-id="0842be0e-827c-4718-9880-736502c69259" data-file-name="components/ExpirationModal.tsx">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            {daysLeft <= 0 ? <div data-unique-id="fd761906-a242-4583-8497-334f77a80cb3" data-file-name="components/ExpirationModal.tsx">
                <h4 className="text-xl font-bold text-gray-900 mb-2" data-unique-id="d8a86e88-84b6-4c6d-b58f-9e4df5abef83" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="ab346920-41e4-48f0-8e0f-b2b66a8f7aa8" data-file-name="components/ExpirationModal.tsx">
                  Penggunaan Aplikasi Gratis Telah Habis
                </span></h4>
                <p className="text-gray-600" data-unique-id="bf458790-150a-4bfe-9cfd-343411964c11" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="056fd4dc-bbac-4996-a0f5-7b1c18ee1805" data-file-name="components/ExpirationModal.tsx">
                  Masa berlaku penggunaan gratis aplikasi Absensi Digital telah berakhir. 
                  Untuk tetap menggunakan aplikasi, silakan berlangganan dengan menghubungi kami.
                </span></p>
              </div> : <div data-unique-id="4924e11e-ecf6-44aa-9e10-7ca8dd0caa38" data-file-name="components/ExpirationModal.tsx">
                <h4 className="text-xl font-bold text-gray-900 mb-2" data-unique-id="5129d3f3-bcef-41fc-8dcd-415af22f5e43" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="0878707f-8b46-49e6-a386-87f762d3432a" data-file-name="components/ExpirationModal.tsx">
                  Masa Berlaku Akan Berakhir
                </span></h4>
                <p className="text-gray-600" data-unique-id="f7a055ba-d0f8-4af5-b1cf-f3863ca5ac92" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="3c288410-04b7-456d-a755-9ffb347fda8e" data-file-name="components/ExpirationModal.tsx">
                  Penggunaan gratis aplikasi Absensi Digital akan berakhir dalam</span>{" "}
                  <span className="font-semibold text-red-600" data-unique-id="34e4b4a2-3753-40b9-b49c-4fa180179ce8" data-file-name="components/ExpirationModal.tsx" data-dynamic-text="true">{daysLeft}<span className="editable-text" data-unique-id="ff444e81-aa40-44ca-8067-b11c7375bf7f" data-file-name="components/ExpirationModal.tsx"> hari</span></span><span className="editable-text" data-unique-id="cf644949-424a-4845-b165-ffecf76a000d" data-file-name="components/ExpirationModal.tsx">.
                  Segera lakukan pembayaran untuk melanjutkan layanan.
                </span></p>
              </div>}
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6" data-unique-id="7362b1f0-f80a-46d5-be62-c991880b2c58" data-file-name="components/ExpirationModal.tsx">
            <h5 className="font-semibold text-gray-900 mb-3 text-center" data-unique-id="0b4abfb8-6803-4b45-81f9-63d307250304" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="e2e1e4d7-3bf1-43c0-a2c5-e4706585cc1d" data-file-name="components/ExpirationModal.tsx">
              Hubungi Kami untuk Berlangganan:
            </span></h5>
            
            <div className="space-y-3" data-unique-id="0b11fa11-ab9a-459c-9f2e-1a12eb503b9c" data-file-name="components/ExpirationModal.tsx">
              <div className="flex items-center justify-center space-x-3" data-unique-id="a66c291b-8e63-4325-ac7c-086f825768dc" data-file-name="components/ExpirationModal.tsx">
                <Phone className="h-5 w-5 text-blue-600" />
                <a href="tel:081272405881" className="text-blue-600 font-medium hover:underline" data-unique-id="62929ddd-d737-4862-9db7-2b9b71ff5970" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="c701faff-e209-450b-be32-becf3613fabf" data-file-name="components/ExpirationModal.tsx">
                  0812 7240 5881
                </span></a>
              </div>
              
              <div className="flex items-center justify-center space-x-3" data-unique-id="9b308a4f-f754-42c0-9142-b3bab48813c3" data-file-name="components/ExpirationModal.tsx">
                <Mail className="h-5 w-5 text-purple-600" />
                <a href="mailto:lehan.virtual@gmail.com" className="text-purple-600 font-medium hover:underline" data-unique-id="45d6a0b0-68d1-4337-8fb6-63ee679b7d31" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="602c596a-d34d-4748-abf4-eb9f5d10b9a8" data-file-name="components/ExpirationModal.tsx">
                  lehan.virtual@gmail.com
                </span></a>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3" data-unique-id="9e1f523f-2a0b-4d04-a19d-baa7c84ed8d2" data-file-name="components/ExpirationModal.tsx">
            <a href="https://wa.me/6281272405881?text=Halo%2C%20saya%20ingin%20berlangganan%20aplikasi%20Absensi%20Digital" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center font-medium" data-unique-id="ad57e7cf-fc10-4cf3-9665-e8cead30b774" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="b6cf989a-507a-4daf-877b-74918be28bf4" data-file-name="components/ExpirationModal.tsx">
              Chat WhatsApp
            </span></a>
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium" data-unique-id="26c540d5-f62a-4c41-8a6b-5ad0928c3f01" data-file-name="components/ExpirationModal.tsx"><span className="editable-text" data-unique-id="457d0475-baaa-4257-ae33-b8e41c82b69b" data-file-name="components/ExpirationModal.tsx">
              Tutup
            </span></button>
          </div>
        </div>
      </motion.div>
    </div>;
}