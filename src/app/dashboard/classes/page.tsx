"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit, Trash2, BookOpen, User, Loader2, Search, X, Save, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
interface ClassData {
 id: string;
 name: string;
 level: string;
 teacherName: string;
 createdAt: Date;
 updatedAt: Date;
}
export default function ClassesPage() {
 const { schoolId, userRole } = useAuth();
 const [classes, setClasses] = useState<ClassData[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [showAddModal, setShowAddModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [currentClass, setCurrentClass] = useState<ClassData | null>(null);
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState({
   name: "",
   level: "",
   teacherName: ""
 });
 // Level options for dropdown
 const levelOptions = Array.from({ length: 12 }, (_, i) => ({
   value: `${i + 1}`,
   label: `Kelas ${i + 1}`
 }));
 // Load classes data
 useEffect(() => {
   const fetchClasses = async () => {
     if (!schoolId) return;

     try {
       setLoading(true);
       const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
       const { db } = await import('@/lib/firebase');

       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const classesQuery = query(classesRef, orderBy('name', 'asc'));
       const snapshot = await getDocs(classesQuery);

       const classesList: ClassData[] = [];
       snapshot.forEach(doc => {
         const data = doc.data();
         classesList.push({
           id: doc.id,
           name: data.name || "",
           level: data.level || "",
           teacherName: data.teacherName || "",
           createdAt: data.createdAt?.toDate() || new Date(),
           updatedAt: data.updatedAt?.toDate() || new Date()
         });
       });

       setClasses(classesList);
     } catch (error) {
       console.error("Error fetching classes:", error);
       toast.error("Gagal memuat data kelas");
     } finally {
       setLoading(false);
     }
   };
   fetchClasses();
 }, [schoolId]);
 // Handle form input changes
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
 };
 // Add new class
 const handleAddClass = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!schoolId) {
     toast.error("ID sekolah tidak ditemukan");
     return;
   }
   try {
     setSaving(true);
     const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
     const { db } = await import('@/lib/firebase');
     const newClassData = {
       name: formData.name,
       level: formData.level,
       teacherName: formData.teacherName,
       schoolId,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     };
     const docRef = await addDoc(collection(db, `schools/${schoolId}/classes`), newClassData);

     const newClass: ClassData = {
       id: docRef.id,
       name: formData.name,
       level: formData.level,
       teacherName: formData.teacherName,
       createdAt: new Date(),
       updatedAt: new Date()
     };
     setClasses(prev => [...prev, newClass].sort((a, b) => a.name.localeCompare(b.name)));
     setFormData({ name: "", level: "", teacherName: "" });
     setShowAddModal(false);
     toast.success("Kelas berhasil ditambahkan");
   } catch (error) {
     console.error("Error adding class:", error);
     toast.error("Gagal menambahkan kelas");
   } finally {
     setSaving(false);
   }
 };
 // Edit class
 const handleEditClass = (classData: ClassData) => {
   setCurrentClass(classData);
   setFormData({
     name: classData.name,
     level: classData.level,
     teacherName: classData.teacherName
   });
   setShowEditModal(true);
 };
 // Update class
 const handleUpdateClass = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!schoolId || !currentClass) {
     toast.error("Data tidak lengkap");
     return;
   }
   try {
     setSaving(true);
     const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
     const { db } = await import('@/lib/firebase');
     const classRef = doc(db, `schools/${schoolId}/classes`, currentClass.id);
     await updateDoc(classRef, {
       name: formData.name,
       level: formData.level,
       teacherName: formData.teacherName,
       updatedAt: serverTimestamp()
     });
     setClasses(prev => prev.map(cls =>
       cls.id === currentClass.id
         ? { ...cls, ...formData, updatedAt: new Date() }
         : cls
     ).sort((a, b) => a.name.localeCompare(b.name)));
     setShowEditModal(false);
     setCurrentClass(null);
     setFormData({ name: "", level: "", teacherName: "" });
     toast.success("Kelas berhasil diperbarui");
   } catch (error) {
     console.error("Error updating class:", error);
     toast.error("Gagal memperbarui kelas");
   } finally {
     setSaving(false);
   }
 };
 // Delete class confirmation
 const handleDeleteConfirmation = (classData: ClassData) => {
   setCurrentClass(classData);
   setShowDeleteModal(true);
 };
 // Delete class
 const handleDeleteClass = async () => {
   if (!schoolId || !currentClass) {
     toast.error("Data tidak lengkap");
     return;
   }
   try {
     const { doc, deleteDoc } = await import('firebase/firestore');
     const { db } = await import('@/lib/firebase');
     await deleteDoc(doc(db, `schools/${schoolId}/classes`, currentClass.id));
     setClasses(prev => prev.filter(cls => cls.id !== currentClass.id));
     setShowDeleteModal(false);
     setCurrentClass(null);
     toast.success("Kelas berhasil dihapus");
   } catch (error) {
     console.error("Error deleting class:", error);
     toast.error("Gagal menghapus kelas");
   }
 };
 // Filter classes by search query
 const filteredClasses = classes.filter(cls =>
   cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
 );
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
       <div className="flex items-center mb-4 md:mb-0">
         <BookOpen className="h-7 w-7 text-primary mr-3" />
         <h1 className="text-2xl font-bold text-gray-800">DAFTAR KELAS</h1>
       </div>

       {userRole === 'admin' && (
         <center><button
           onClick={() => setShowAddModal(true)}
           className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors shadow-sm"
         >
           {/*<Plus size={18} />*/}
           Tambah Kelas Baru
         </button></center>
       )}
     </div>
     {/* Search */}
     <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input
           type="text"
           placeholder="Cari nama kelas atau wali kelas..."
           className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
       </div>
     </div>
     {/* Classes Grid */}
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-12 w-12 text-primary animate-spin" />
       </div>
     ) : filteredClasses.length > 0 ? (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredClasses.map((classData, index) => {
           const gradients = [
             "bg-gradient-to-r from-blue-50 to-indigo-100",
             "bg-gradient-to-r from-green-50 to-emerald-100",
             "bg-gradient-to-r from-purple-50 to-violet-100",
             "bg-gradient-to-r from-pink-50 to-rose-100",
             "bg-gradient-to-r from-yellow-50 to-amber-100",
             "bg-gradient-to-r from-cyan-50 to-sky-100"
           ];

           const gradientClass = gradients[index % gradients.length];

           return (
             <motion.div
               key={classData.id}
               className={`${gradientClass} rounded-xl shadow-sm overflow-hidden`}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, delay: index * 0.1 }}
             >
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-bold text-gray-800">{classData.name}</h3>
                   <span className="bg-white/70 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                     {classData.level ? `Tingkat ${classData.level}` : 'Tingkat -'}
                   </span>
                 </div>

                 <div className="space-y-2 mb-4">
                   <div className="flex items-center text-gray-600">
                     <User className="h-4 w-4 mr-2" />
                     <span className="text-sm">{classData.teacherName || 'Belum ada wali kelas'}</span>
                   </div>
                 </div>
                 {userRole === 'admin' && (
                   <div className="flex justify-end gap-2">
                     <button
                       onClick={() => handleEditClass(classData)}
                       className="p-2 text-blue-600 rounded-lg hover:bg-blue-100/50 transition-colors"
                       title="Edit Kelas"
                     >
                       <Edit size={16} />
                     </button>
                     <button
                       onClick={() => handleDeleteConfirmation(classData)}
                       className="p-2 text-red-600 rounded-lg hover:bg-red-100/50 transition-colors"
                       title="Hapus Kelas"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 )}
               </div>
             </motion.div>
           );
         })}
       </div>
     ) : (
       <div className="bg-white rounded-xl shadow-sm p-10 text-center">
         <div className="flex flex-col items-center">
           <div className="bg-gray-100 rounded-full p-3 mb-4">
             <BookOpen className="h-8 w-8 text-gray-400" />
           </div>
           <p className="text-gray-500 mb-4">
             {searchQuery ? "Tidak ada kelas yang sesuai dengan pencarian" : "Belum ada data kelas"}
           </p>
           {userRole === 'admin' && (
             <button
               onClick={() => setShowAddModal(true)}
               className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors"
             >
               Tambah Kelas Baru
             </button>
           )}
         </div>
       </div>
     )}
     {/* Add Class Modal */}
     {showAddModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <motion.div
           className="bg-white rounded-xl shadow-lg max-w-md w-full"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
         >
           <div className="flex items-center justify-between p-6 border-b">
             <h3 className="text-lg font-semibold">Tambah Kelas Baru</h3>
             <button onClick={() => setShowAddModal(false)}>
               <X size={24} className="text-gray-500 hover:text-gray-700" />
             </button>
           </div>

           <form onSubmit={handleAddClass}>
             <div className="p-6 space-y-4">
               <div>
                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Kelas
                 </label>
                 <input
                   type="text"
                   id="name"
                   name="name"
                   value={formData.name}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Contoh: VII A"
                   required
                 />
               </div>

               <div>
                 <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                   Tingkat/Kelas
                 </label>
                 <select
                   id="level"
                   name="level"
                   value={formData.level}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   required
                 >
                   <option value="">Pilih Tingkat</option>
                   {levelOptions.map(option => (
                     <option key={option.value} value={option.value}>
                       {option.label}
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Wali Kelas
                 </label>
                 <input
                   type="text"
                   id="teacherName"
                   name="teacherName"
                   value={formData.teacherName}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Nama lengkap wali kelas"
                   required
                 />
               </div>
             </div>

             <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
               <button
                 type="button"
                 onClick={() => setShowAddModal(false)}
                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
               >
                 Batal
               </button>
               <button
                 type="submit"
                 disabled={saving}
                 className="px-4 py-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
               >
                 {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Simpan Data
               </button>
             </div>
           </form>
         </motion.div>
       </div>
     )}
     {/* Edit Class Modal */}
     {showEditModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <motion.div
           className="bg-white rounded-xl shadow-lg max-w-md w-full"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
         >
           <div className="flex items-center justify-between p-6 border-b">
             <h3 className="text-lg font-semibold">Edit Kelas</h3>
             <button onClick={() => setShowEditModal(false)}>
               <X size={24} className="text-gray-500 hover:text-gray-700" />
             </button>
           </div>

           <form onSubmit={handleUpdateClass}>
             <div className="p-6 space-y-4">
               <div>
                 <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Kelas
                 </label>
                 <input
                   type="text"
                   id="edit-name"
                   name="name"
                   value={formData.name}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Contoh: VII A"
                   required
                 />
               </div>

               <div>
                 <label htmlFor="edit-level" className="block text-sm font-medium text-gray-700 mb-1">
                   Tingkat/Kelas
                 </label>
                 <select
                   id="edit-level"
                   name="level"
                   value={formData.level}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   required
                 >
                   <option value="">Pilih Tingkat</option>
                   {levelOptions.map(option => (
                     <option key={option.value} value={option.value}>
                       {option.label}
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <label htmlFor="edit-teacherName" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Wali Kelas
                 </label>
                 <input
                   type="text"
                   id="edit-teacherName"
                   name="teacherName"
                   value={formData.teacherName}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Nama lengkap wali kelas"
                   required
                 />
               </div>
             </div>

             <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
               <button
                 type="button"
                 onClick={() => setShowEditModal(false)}
                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
               >
                 Batal
               </button>
               <button
                 type="submit"
                 disabled={saving}
                 className="px-4 py-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
               >
                 {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Perbarui Data
               </button>
             </div>
           </form>
         </motion.div>
       </div>
     )}
     {/* Delete Confirmation Modal */}
     {showDeleteModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <motion.div
           className="bg-white rounded-xl shadow-lg max-w-md w-full"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
         >
           <div className="p-6">
             <div className="flex items-center mb-4">
               <div className="bg-red-100 p-2 rounded-full mr-4">
                 <AlertTriangle className="h-6 w-6 text-red-600" />
               </div>
               <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
             </div>

             <p className="text-gray-600 mb-6">
               Apakah Anda yakin ingin menghapus kelas <strong>{currentClass?.name}</strong>?
               Tindakan ini tidak dapat dibatalkan.
             </p>

             <div className="flex justify-end gap-3">
               <button
                 type="button"
                 onClick={() => setShowDeleteModal(false)}
                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
               >
                 Batal
               </button>
               <button
                 type="button"
                 onClick={handleDeleteClass}
                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
               >
                 Hapus
               </button>
             </div>
           </div>
         </motion.div>
       </div>
     )}
   </div>
 );
}
