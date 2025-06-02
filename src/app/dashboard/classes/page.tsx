"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Search, Edit, Trash2, Users, BookOpen, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
interface ClassData {
 id?: string;
 name: string;
 teacherName: string;
 capacity: number;
 description: string;
 createdAt?: any;
}
export default function ClassesPage() {
 const { schoolId, userRole } = useAuth();
 const [classes, setClasses] = useState<ClassData[]>([]);
 const [loading, setLoading] = useState(true);
 const [showAddModal, setShowAddModal] = useState(false);
 const [editingClass, setEditingClass] = useState<ClassData | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState<ClassData>({
   name: "",
   teacherName: "",
   capacity: 30,
   description: ""
 });
 // Fetch classes
 useEffect(() => {
   fetchClasses();
 }, [schoolId]);
 const fetchClasses = async () => {
   if (!schoolId) return;

   try {
     setLoading(true);
     const { classApi } = await import('@/lib/api');
     const fetchedClasses = await classApi.getAll(schoolId);
     setClasses(fetchedClasses || []);
   } catch (error) {
     console.error("Error fetching classes:", error);
     toast.error("Gagal mengambil data kelas");
   } finally {
     setLoading(false);
   }
 };
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!schoolId) return;
   try {
     setSaving(true);
     const { classApi } = await import('@/lib/api');

     if (editingClass) {
       // Update existing class
       await classApi.update(schoolId, editingClass.id!, formData);
       toast.success("Kelas berhasil diperbarui");
     } else {
       // Create new class
       await classApi.create(schoolId, formData);
       toast.success("Kelas berhasil ditambahkan");
     }

     // Reset form and close modal
     setFormData({
       name: "",
       teacherName: "",
       capacity: 30,
       description: ""
     });
     setShowAddModal(false);
     setEditingClass(null);

     // Refresh classes list
     await fetchClasses();
   } catch (error) {
     console.error("Error saving class:", error);
     toast.error("Gagal menyimpan kelas");
   } finally {
     setSaving(false);
   }
 };
 const handleEdit = (classData: ClassData) => {
   setEditingClass(classData);
   setFormData({
     name: classData.name,
     teacherName: classData.teacherName,
     capacity: classData.capacity,
     description: classData.description
   });
   setShowAddModal(true);
 };
 const handleDelete = async (classId: string) => {
   if (!schoolId || !confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;
   try {
     const { classApi } = await import('@/lib/api');
     await classApi.delete(schoolId, classId);
     toast.success("Kelas berhasil dihapus");
     await fetchClasses();
   } catch (error) {
     console.error("Error deleting class:", error);
     toast.error("Gagal menghapus kelas");
   }
 };
 const filteredClasses = classes.filter(cls =>
   cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
 );
 return (
   <div className="p-6">
     <div className="flex items-center justify-between mb-6">
       <div>
         <h1 className="text-3xl font-bold text-gray-900">Manajemen Kelas</h1>
         <p className="text-gray-600 mt-1">Kelola kelas dan data pengajar</p>
       </div>
       {userRole === 'admin' && (
         <button
           onClick={() => setShowAddModal(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
         >
           <Plus size={20} />
           Tambah Kelas
         </button>
       )}
     </div>
     {/* Search */}
     <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input
           type="text"
           placeholder="Cari kelas atau nama guru..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         />
       </div>
     </div>
     {/* Classes Grid */}
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
       </div>
     ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredClasses.map((cls) => (
           <motion.div
             key={cls.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
           >
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="bg-blue-100 p-2 rounded-lg">
                   <BookOpen className="h-6 w-6 text-blue-600" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                   <p className="text-sm text-gray-500">Kapasitas: {cls.capacity} siswa</p>
                 </div>
               </div>
               {userRole === 'admin' && (
                 <div className="flex gap-2">
                   <button
                     onClick={() => handleEdit(cls)}
                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                   >
                     <Edit size={16} />
                   </button>
                   <button
                     onClick={() => handleDelete(cls.id!)}
                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               )}
             </div>

             <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <Users className="h-4 w-4 text-gray-400" />
                 <span className="text-sm text-gray-600">Wali Kelas: {cls.teacherName}</span>
               </div>
               {cls.description && (
                 <p className="text-sm text-gray-600 mt-2">{cls.description}</p>
               )}
             </div>
           </motion.div>
         ))}
       </div>
     )}
     {filteredClasses.length === 0 && !loading && (
       <div className="text-center py-12">
         <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
         <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kelas</h3>
         <p className="text-gray-600">Mulai dengan menambahkan kelas baru</p>
       </div>
     )}
     {/* Add/Edit Modal */}
     <AnimatePresence>
       {showAddModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
           >
             <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-semibold">
                   {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                 </h2>
                 <button
                   onClick={() => {
                     setShowAddModal(false);
                     setEditingClass(null);
                     setFormData({
                       name: "",
                       teacherName: "",
                       capacity: 30,
                       description: ""
                     });
                   }}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <X size={24} />
                 </button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Nama Kelas
                   </label>
                   <input
                     type="text"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Contoh: Kelas 1A"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Nama Wali Kelas
                   </label>
                   <input
                     type="text"
                     value={formData.teacherName}
                     onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Nama lengkap wali kelas"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Kapasitas Siswa
                   </label>
                   <input
                     type="number"
                     value={formData.capacity}
                     onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     min="1"
                     max="50"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Deskripsi (Opsional)
                   </label>
                   <textarea
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     rows={3}
                     placeholder="Deskripsi tambahan tentang kelas"
                   />
                 </div>
                 <div className="flex gap-3 pt-4">
                   <button
                     type="button"
                     onClick={() => {
                       setShowAddModal(false);
                       setEditingClass(null);
                       setFormData({
                         name: "",
                         teacherName: "",
                         capacity: 30,
                         description: ""
                       });
                     }}
                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     Batal
                   </button>
                   <button
                     type="submit"
                     disabled={saving}
                     className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                   >
                     {saving ? (
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     ) : (
                       <Save size={16} />
                     )}
                     {saving ? 'Menyimpan...' : (editingClass ? 'Update' : 'Simpan')}
                   </button>
                 </div>
               </form>
             </div>
           </motion.div>
         </div>
       )}
     </AnimatePresence>
   </div>
 );
}
