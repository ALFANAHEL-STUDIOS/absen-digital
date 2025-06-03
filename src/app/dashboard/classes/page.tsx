"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Plus, Edit, Trash2, Search, Upload, Users, GraduationCap, User, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import ClassImportModal from "@/components/ClassImportModal";
interface ClassData {
 id: string;
 name: string;
 level: string;
 teacherName: string;
 teacherNip?: string;
 createdAt?: any;
 studentCount?: number;
}
interface ImportClassData {
 namaKelas: string;
 tingkat: string;
 namaWaliKelas: string;
}
export default function ClassesPage() {
 const { schoolId, userRole } = useAuth();
 const [classes, setClasses] = useState<ClassData[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [showImportModal, setShowImportModal] = useState(false);
 const [importing, setImporting] = useState(false);
 useEffect(() => {
   if (schoolId) {
     fetchClasses();
   }
 }, [schoolId]);
 const fetchClasses = async () => {
   if (!schoolId) return;

   try {
     setLoading(true);

     // Fetch classes
     const classesRef = collection(db, `schools/${schoolId}/classes`);
     const classesQuery = query(classesRef, orderBy("name"));
     const classesSnapshot = await getDocs(classesQuery);

     const fetchedClasses: ClassData[] = [];

     // Get student counts for each class
     const studentsRef = collection(db, `schools/${schoolId}/students`);
     const studentsSnapshot = await getDocs(studentsRef);
     const studentCounts: { [key: string]: number } = {};

     studentsSnapshot.forEach(doc => {
       const studentData = doc.data();
       const className = studentData.class;
       if (className) {
         studentCounts[className] = (studentCounts[className] || 0) + 1;
       }
     });

     classesSnapshot.forEach(doc => {
       const classData = doc.data();
       fetchedClasses.push({
         id: doc.id,
         name: classData.name || "",
         level: classData.level || "",
         teacherName: classData.teacherName || "",
         teacherNip: classData.teacherNip || "",
         createdAt: classData.createdAt,
         studentCount: studentCounts[classData.name] || 0
       });
     });

     setClasses(fetchedClasses);
   } catch (error) {
     console.error("Error fetching classes:", error);
     toast.error("Gagal mengambil data kelas");
   } finally {
     setLoading(false);
   }
 };
 const handleImportClasses = async (importData: ImportClassData[]) => {
   if (!schoolId) {
     toast.error("ID Sekolah tidak ditemukan");
     return;
   }
   setImporting(true);
   try {
     const classesRef = collection(db, `schools/${schoolId}/classes`);

     // Check for duplicates
     const existingNames = classes.map(c => c.name.toLowerCase());
     const duplicates = importData.filter(item =>
       existingNames.includes(item.namaKelas.toLowerCase())
     );

     if (duplicates.length > 0) {
       toast.error(`Kelas berikut sudah ada: ${duplicates.map(d => d.namaKelas).join(', ')}`);
       return;
     }
     // Add classes to Firestore
     const addPromises = importData.map(classData =>
       addDoc(classesRef, {
         name: classData.namaKelas,
         level: classData.tingkat,
         teacherName: classData.namaWaliKelas,
         teacherNip: "",
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       })
     );
     await Promise.all(addPromises);

     // Refresh the classes list
     await fetchClasses();

     toast.success(`${importData.length} kelas berhasil diimpor!`);
   } catch (error) {
     console.error("Error importing classes:", error);
     toast.error("Gagal mengimpor data kelas");
     throw error;
   } finally {
     setImporting(false);
   }
 };
 const handleDeleteClass = async (classId: string, className: string) => {
   if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${className}"? Tindakan ini tidak dapat dibatalkan.`)) {
     return;
   }
   try {
     await deleteDoc(doc(db, `schools/${schoolId}/classes`, classId));
     setClasses(classes.filter(c => c.id !== classId));
     toast.success(`Kelas "${className}" berhasil dihapus`);
   } catch (error) {
     console.error("Error deleting class:", error);
     toast.error("Gagal menghapus kelas");
   }
 };
 const filteredClasses = classes.filter(classItem =>
   classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   classItem.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   classItem.level.toLowerCase().includes(searchQuery.toLowerCase())
 );
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
       <div className="flex items-center">
         <BookOpen className="h-7 w-7 text-blue-600 mr-3" />
         <div>
           <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
           
         </div>
       </div>

       <div className="flex flex-col sm:flex-row gap-2">
         
         {userRole === 'admin' && (
           <Link
             href="/dashboard/classes/add"
             className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
           >
             <Plus size={18} />
             Tambah Data Kelas
           </Link>
         )}


          <button
           onClick={() => setShowImportModal(true)}
           className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
         >
           <Upload size={18} />
           Import Dengan Excel
         </button>


        
       </div>
     </div>
     {/* Search */}
     <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input
           type="text"
           placeholder="Cari kelas, wali kelas, atau tingkat..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
         />
       </div>
     </div>
     {/* Statistics Cards */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
       <div className="bg-[#F72585] rounded-xl p-6 text-white">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-white text-sm font-medium">Total Kelas</p>
             <p className="text-3xl font-bold">{classes.length}</p>
           </div>
           <BookOpen className="h-10 w-10 text-white" />
         </div>
       </div>

       <div className="bg-[#7B2CBF] rounded-xl p-6 text-white">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-white text-sm font-medium">Total Siswa</p>
             <p className="text-3xl font-bold">
               {classes.reduce((sum, classItem) => sum + (classItem.studentCount || 0), 0)}
             </p>
           </div>
           <Users className="h-10 w-10 text-white" />
         </div>
       </div>

       <div className="bg-[#F77F00] rounded-xl p-6 text-white">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-white text-sm font-medium">Rata-Rata per Kelas</p>
             <p className="text-3xl font-bold">
               {classes.length > 0
                 ? Math.round(classes.reduce((sum, classItem) => sum + (classItem.studentCount || 0), 0) / classes.length)
                 : 0
               }
             </p>
           </div>
           <GraduationCap className="h-10 w-10 text-white" />
         </div>
       </div>
     </div>
     {/* Classes Grid */}
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
       </div>
     ) : filteredClasses.length > 0 ? (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredClasses.map((classItem) => (
           <motion.div
             key={classItem.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
           >
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center space-x-3">
                {/*<div className="bg-blue-100 p-3 rounded-lg">
                   <BookOpen className="h-6 w-6 text-blue-600" />
                 </div>*/}
                 <div>
                   <h3 className="text-lg font-semibold text-gray-800">
                     Kelas {classItem.name}
                   </h3>
                   <p className="text-sm text-gray-500">Tingkat {classItem.level}</p>
                 </div>
               </div>

               {userRole === 'admin' && (
                 <div className="flex space-x-1">
                   <button
                     onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                     className="p-2 text-red-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               )}
             </div>
             <div className="space-y-3">
               <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                 <span className="text-sm text-gray-600">
                   Wali Kelas : {classItem.teacherName || 'Belum ditentukan'}
                 </span>
               </div>

               <div className="flex items-center space-x-2">
                 <Users className="h-4 w-4 text-gray-400" />
                 <span className="text-sm text-gray-600">
                   Jumlah <b>{classItem.studentCount || 0}</b> Siswa
                 </span>
               </div>
             </div>
            
           </motion.div>
         
         ))}
        
       </div>
    
     ) : (
       <div className="bg-white rounded-xl shadow-sm p-10 text-center">
         <div className="flex flex-col items-center">
           <div className="bg-gray-100 rounded-full p-3 mb-4">
             {searchQuery ? (
               <Search className="h-8 w-8 text-gray-400" />
             ) : (
               <BookOpen className="h-8 w-8 text-gray-400" />
             )}
           </div>
           <h3 className="text-lg font-medium text-gray-800 mb-2">
             {searchQuery ? 'Tidak Ada Hasil Pencarian' : 'Belum Ada Kelas'}
           </h3>
           <p className="text-gray-500 mb-6">
             {searchQuery
               ? 'Coba ubah kata kunci pencarian Anda'
               : 'Mulai dengan menambahkan kelas baru atau import dari Excel'
             }
           </p>
           <div className="flex gap-3">
            {/*<button
               onClick={() => setShowImportModal(true)}
               className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
             >
               <Upload size={18} />
               Import Excel
             </button>*/}
             {userRole === 'admin' && (
               <Link
                 href="/dashboard/classes/add"
                 className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <Plus size={18} />
                 Tambah Kelas Manual
               </Link>
             )}
           </div>
         </div>
       </div>
     )}
    <hr className="border-t border-none mb-5" />
     {/* Import Modal */}
     <ClassImportModal
       isOpen={showImportModal}
       onClose={() => setShowImportModal(false)}
       onImport={handleImportClasses}
     />
   </div>
 );
 <hr className="border-t border-none mb-5" />
}
