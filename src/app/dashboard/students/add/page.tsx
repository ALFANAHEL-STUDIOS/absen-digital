"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Users, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
interface ClassData {
 id: string;
 name: string;
 level: string;
 teacherName: string;
}
export default function AddStudent() {
 const { schoolId, userRole } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [classes, setClasses] = useState<ClassData[]>([]);
 const [loadingClasses, setLoadingClasses] = useState(true);

 const [formData, setFormData] = useState({
   name: "",
   nisn: "",
   class: "",
   gender: "male",
   birthDate: "",
   parentName: "",
   parentPhone: "",
   address: "",
   photoUrl: ""
 });
 // Check authorization
 useEffect(() => {
   if (userRole !== 'admin') {
     toast.error("Anda tidak memiliki akses ke halaman ini");
     router.push('/dashboard/students');
     return;
   }
 }, [userRole, router]);
 // Fetch classes from database
 useEffect(() => {
   const fetchClasses = async () => {
     if (!schoolId) return;

     try {
       setLoadingClasses(true);
       const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
       const { db } = await import('@/lib/firebase');

       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const classesQuery = query(classesRef, orderBy('name', 'asc'));
       const snapshot = await getDocs(classesQuery);

       const fetchedClasses: ClassData[] = [];
       snapshot.forEach((doc) => {
         const data = doc.data();
         fetchedClasses.push({
           id: doc.id,
           name: data.name,
           level: data.level,
           teacherName: data.teacherName
         });
       });

       setClasses(fetchedClasses);
     } catch (error) {
       console.error("Error fetching classes:", error);
       toast.error("Gagal mengambil data kelas");
     } finally {
       setLoadingClasses(false);
     }
   };
   fetchClasses();
 }, [schoolId]);
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
 };
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!schoolId) {
     toast.error("ID sekolah tidak ditemukan");
     return;
   }
   if (!formData.name || !formData.nisn || !formData.class) {
     toast.error("Mohon lengkapi data yang wajib diisi");
     return;
   }
   try {
     setLoading(true);
     const { studentApi } = await import('@/lib/api');

     await studentApi.create(schoolId, {
       ...formData,
       createdAt: new Date(),
       updatedAt: new Date()
     });
     toast.success("Data siswa berhasil ditambahkan");
     router.push('/dashboard/students');
   } catch (error) {
     console.error("Error adding student:", error);
     toast.error("Gagal menambahkan data siswa");
   } finally {
     setLoading(false);
   }
 };
 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24 md:pb-6">
     <div className="w-full max-w-4xl mx-auto px-1 sm:px-6 md:px-8">
       {/* Header */}
       <div className="flex items-center mb-4 pt-2">
         <Link
           href="/dashboard/students"
           className="p-2 mr-3 hover:bg-white hover:shadow-md rounded-full transition-all duration-200"
         >
           <ArrowLeft size={20} className="text-gray-600" />
         </Link>
         <div className="flex items-center">
           {/*<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl mr-4">
             <User className="h-6 w-6 text-white" />
           </div>*/}
           <h1 className="text-2xl font-bold text-gray-800">Tambah Data Siswa</h1>
         </div>
       </div>
       {/* Form */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6 }}
         className="bg-white rounded-2xl shadow-xl overflow-hidden"
       >
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4">
           <center><h2 className="text-xl font-semibold text-white">Tambah Siswa Baru</h2></center>
           {/*<p className="text-blue-100 mt-2">Lengkapi data dengan benar</p>*/}
         </div>
         <form onSubmit={handleSubmit} className="p-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Nama Lengkap */}
             <div className="md:col-span-2">
               <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                 Nama Lengkap *
               </label>
               <input
                 type="text"
                 id="name"
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 placeholder="Masukkan nama lengkap siswa"
                 required
               />
             </div>
             {/* NISN */}
             <div>
               <label htmlFor="nisn" className="block text-sm font-semibold text-gray-700 mb-2">
                 NISN *
               </label>
               <input
                 type="text"
                 id="nisn"
                 name="nisn"
                 value={formData.nisn}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 placeholder="Masukkan NISN"
                 required
               />
             </div>
             {/* Kelas */}
             <div>
               <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-2">
                 Kelas *
               </label>
               <div className="relative">
                 <select
                   id="class"
                   name="class"
                   value={formData.class}
                   onChange={handleChange}
                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                   required
                   disabled={loadingClasses}
                 >
                   <option value="">
                     {loadingClasses ? "Memuat kelas..." : "Pilih Kelas"}
                   </option>
                   {classes.map((classItem) => (
                     <option key={classItem.id} value={classItem.name}>
                       {classItem.name} - {classItem.teacherName}
                     </option>
                   ))}
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                   {loadingClasses ? (
                     <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                   ) : (
                     <BookOpen className="h-5 w-5 text-gray-400" />
                   )}
                 </div>
               </div>
               {classes.length === 0 && !loadingClasses && (
                 <p className="text-sm text-red-500 mt-1">
                   Belum ada kelas tersedia.
                   <Link href="/dashboard/classes" className="text-blue-500 hover:underline ml-1">
                     Tambah kelas terlebih dahulu
                   </Link>
                 </p>
               )}
             </div>
             {/* Jenis Kelamin */}
             <div>
               <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                 Jenis Kelamin *
               </label>
               <select
                 id="gender"
                 name="gender"
                 value={formData.gender}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 required
               >
                 <option value="male">Laki-laki</option>
                 <option value="female">Perempuan</option>
               </select>
             </div>
             {/* Tanggal Lahir */}
             <div>
               <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 mb-2">
                 Tanggal Lahir
               </label>
               <input
                 type="date"
                 id="birthDate"
                 name="birthDate"
                 value={formData.birthDate}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
               />
             </div>
             {/* Nama Orang Tua */}
             <div>
               <label htmlFor="parentName" className="block text-sm font-semibold text-gray-700 mb-2">
                 Nama Orang Tua/Wali
               </label>
               <input
                 type="text"
                 id="parentName"
                 name="parentName"
                 value={formData.parentName}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 placeholder="Masukkan nama orang tua/wali"
               />
             </div>
             {/* Nomor Telepon Orang Tua */}
             <div>
               <label htmlFor="parentPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                 ID Telegram Orang Tua - <Link
           href="/dashboard/students/qr/instructions"
                 className="text-sm text-blue-600 font-bold hover:underline"> (Panduan)</Link>
               </label>
               <input
                 type="tel"
                 id="parentPhone"
                 name="parentPhone"
                 value={formData.parentPhone}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 placeholder="Masukkan ID Telegram"
               />
             </div>
             {/* Alamat */}
             <div className="md:col-span-2">
               <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                 Alamat
               </label>
               <textarea
                 id="address"
                 name="address"
                 value={formData.address}
                 onChange={handleChange}
                 rows={3}
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 placeholder="Masukkan alamat lengkap"
               />
             </div>
           </div>
           {/* Submit Button */}
           <div className="flex justify-end mt-4 pt-6 border-t border-gray-200">
             <motion.button
               type="submit"
               disabled={loading || loadingClasses}
               className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
             >
               {loading ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
               ) : (
                 <Save className="h-5 w-5" />
               )}
               <span className="font-semibold">
                 {loading ? "Menyimpan..." : "Simpan Data Siswa"}
               </span>
             </motion.button>
           </div>
         </form>
       </motion.div>
     </div>
   </div>
 );
}
