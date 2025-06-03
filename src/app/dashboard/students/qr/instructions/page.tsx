"use client";

import React from "react";
import { QrCode, Info, LinkIcon, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QRInstructionsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/students/add" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-800">Panduan ID Telegram</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center mb-3">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">Cara Melihat ID Telegram</h2>
        </div>
        
        <div className="prose max-w-full">
          
          <p className="text-gray-700">
            Sistem absensi ini terintegrasi dengan Bot Telegram untuk mengirimkan notifikasi secara real-time kepada orang tua siswa tentang kehadiran siswa di sekolah. 
            Untuk mengaktifkan fitur ini:
          </p>
          
          <ol className="space-y-4 list-decimal list-inside mt-4">
            <li className="text-gray-700">
              <span className="font-medium">Cari Bot Telegram</span>
              <p className="mt-1 ml-6">
                Buka aplikasi Telegram dan cari bot <span className="font-semibold">@userinfobot</span>
              </p>
            </li>
            
            <li className="text-gray-700">
              <span className="font-medium">Mulai percakapan dengan bot</span>
              <p className="mt-1 ml-6">
                Klik "Start" atau ketik "/start" untuk memulai percakapan dengan bot.
              </p>
            </li>
            
            <li className="text-gray-700">
              <span className="font-medium">Dapatkan Telegram Chat ID</span>
              <p className="mt-1 ml-6">
                Ketik "/id" untuk mendapatkan Chat ID Telegram Anda. Ini yang akan digunakan sebagai Telegram Number siswa.
              </p>
            </li>
            
            <li className="text-gray-700">
              <span className="font-medium">Update data siswa</span>
              <p className="mt-1 ml-6">
                Masukkan Chat ID tersebut sebagai nomor Telegram pada profil siswa di sistem.
              </p>
            </li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-200">
            <h4 className="text-blue-800 font-medium mb-2">Link Bot Telegram</h4>
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 text-blue-600 mr-2" />
              <a 
                href="https://t.me/userinfobot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                t.me/userinfobot
              </a>
            </div>
          </div>
          
          
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <Link 
          href="/dashboard/students/add/" 
          className="bg-gray-200 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-blu-700 active:bg-orange-700 transition-colors"
        >
          Kembali ke Tambah Data Siswa
        </Link>
      </div>
	    <hr className="border-t border-none mb-5" />
	    <hr className="border-t border-none mb-5" />
    </div>
	
	
  );
}
