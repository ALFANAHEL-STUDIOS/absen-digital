"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Save, BookOpen, User, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AddClassPage() {
 const { schoolId } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
   name: "",
   level: "",
   teacherName: "",
   teacherNip: ""
 });
 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
 };
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!schoolId) {
     toast.error("ID Sekolah tidak ditemukan");
     return;
   }
   setLoading(true);
   try {
     const classesRef = collection(db, `schools/${schoolId}/classes`);

     await addDoc(classesRef, {
       name: formData.name,
       level: formData.level,
       teacherName: formData.teacherName,
       teacherNip: formData.teacherNip,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });
     toast.success("Kelas berhasil ditambahkan!");
     router.push("/dashboard/classes");
   } catch (error) {
     console.error("Error adding class:", error);
     toast.error("Gagal menambahkan kelas");
   } finally {
     setLoading(false);
   }
 };
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex items-center mb-6">
       <Link
         href="/dashboard/classes"
         className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
       >
         <ArrowLeft size={20} />
       </Link>
       <div className="flex items-center">
         
         <div>
           <h1 className="text-2xl font-bold text-gray-800">Tambah Kelas Baru</h1>
           
         </div>
       </div>
     </div>
     <div className="max-w-2xl mx-auto">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
       >
         <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                 Nama Kelas *
               </label>
               <div className="relative">
                 <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input
                   type="text"
                   id="name"
                   name="name"
                   value={formData.name}
                   onChange={handleInputChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Contoh : VII-A"
                   required
                 />
               </div>
             </div>
             <div>
               <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                 Tingkat/Kelas *
               </label>
               <div className="relative">
                 <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input
                   type="text"
                   id="level"
                   name="level"
                   value={formData.level}
                   onChange={handleInputChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Contoh : 7"
                   required
                 />
               </div>
             </div>
           </div>
           <div>
             <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-2">
               Nama Wali Kelas *
             </label>
             <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="text"
                 id="teacherName"
                 name="teacherName"
                 value={formData.teacherName}
                 onChange={handleInputChange}
                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Contoh : Budi Santoso, S.Pd"
                 required
               />
             </div>
           </div>
           <div>
             <label htmlFor="teacherNip" className="block text-sm font-medium text-gray-700 mb-2">
               NIP Wali Kelas (Opsional)
             </label>
             <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="text"
                 id="teacherNip"
                 name="teacherNip"
                 value={formData.teacherNip}
                 onChange={handleInputChange}
                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Contoh : 196801011990031001"
               />
             </div>
           </div>
           <div className="flex justify-end pt-4">
             <button
               type="submit"
               disabled={loading}
               className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
               ) : (
                 <Save className="h-5 w-5" />
               )}
               {loading ? 'Menyimpan...' : 'Simpan Data Kelas'}
             </button>
           </div>
         </form>
       </motion.div>
     </div>
   </div>
  
 );
 <hr className="border-t border-none mb-5" />
}
