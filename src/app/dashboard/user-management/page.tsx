"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, PlusCircle, Edit, Trash2, Loader2, Mail, User as UserIcon, Lock, UserPlus, CheckCircle, X, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
interface UserData {
 id: string;
 name: string;
 email: string;
 role: string;
 schoolId?: string;
 createdAt?: any;
}
interface ImportData {
 nama: string;
 email: string;
 hakAkses: string;
 row: number;
}
export default function UserManagement() {
 const { userRole, schoolId } = useAuth();
 const router = useRouter();
 const [users, setUsers] = useState<UserData[]>([]);
 const [loading, setLoading] = useState(true);
 const [showAddModal, setShowAddModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showImportModal, setShowImportModal] = useState(false);
 const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
 const [formData, setFormData] = useState({
   name: '',
   email: '',
   password: '',
   role: 'teacher',
 });
 const [formLoading, setFormLoading] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');

 // Import states
 const [importFile, setImportFile] = useState<File | null>(null);
 const [importData, setImportData] = useState<ImportData[]>([]);
 const [importLoading, setImportLoading] = useState(false);
 const [importPreview, setImportPreview] = useState(false);
 const [importErrors, setImportErrors] = useState<string[]>([]);
 // Redirect if not admin
 useEffect(() => {
   if (userRole !== 'admin') {
     toast.error("Anda tidak memiliki akses ke halaman ini");
     router.push('/dashboard');
   }
 }, [userRole, router]);
 // Fetch users when component mounts
 useEffect(() => {
   const fetchUsers = async () => {
     try {
       setLoading(true);
       const { userApi } = await import('@/lib/api');

       let usersData: UserData[] = [];
       if (schoolId) {
         usersData = await userApi.getBySchool(schoolId) as UserData[];
       }

       setUsers(usersData);
     } catch (error) {
       console.error('Error fetching users:', error);
       toast.error('Gagal mengambil data pengguna');
     } finally {
       setLoading(false);
     }
   };
   if (userRole === 'admin') {
     fetchUsers();
   }
 }, [userRole, schoolId]);
 // Download Excel template
 const downloadTemplate = () => {
   const templateData = [
     {
       'NAMA': 'John Doe',
       'E-MAIL': 'john.doe@example.com',
       'HAK AKSES': 'teacher'
     },
     {
       'NAMA': 'Jane Smith',
       'E-MAIL': 'jane.smith@example.com',
       'HAK AKSES': 'admin'
     },
     {
       'NAMA': 'Bob Johnson',
       'E-MAIL': 'bob.johnson@example.com',
       'HAK AKSES': 'student'
     }
   ];
   const wb = XLSX.utils.book_new();
   const ws = XLSX.utils.json_to_sheet(templateData);

   // Set column widths
   ws['!cols'] = [
     { wch: 25 }, // NAMA
     { wch: 30 }, // E-MAIL
     { wch: 15 }  // HAK AKSES
   ];
   XLSX.utils.book_append_sheet(wb, ws, 'Template User');
   XLSX.writeFile(wb, 'Template_Import_User.xlsx');
   toast.success('Template Excel berhasil diunduh');
 };
 // Handle file upload
 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
   if (file) {
     if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
       toast.error('Harap pilih file Excel (.xlsx)');
       return;
     }
     setImportFile(file);
     parseExcelFile(file);
   }
 };
 // Parse Excel file
 const parseExcelFile = (file: File) => {
   const reader = new FileReader();
   reader.onload = (e) => {
     try {
       const data = new Uint8Array(e.target?.result as ArrayBuffer);
       const workbook = XLSX.read(data, { type: 'array' });
       const sheetName = workbook.SheetNames[0];
       const worksheet = workbook.Sheets[sheetName];
       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
       if (jsonData.length < 2) {
         toast.error('File Excel tidak memiliki data yang valid');
         return;
       }
       // Parse data starting from row 2 (skip header)
       const parsedData: ImportData[] = [];
       const errors: string[] = [];
       for (let i = 1; i < jsonData.length; i++) {
         const row = jsonData[i];
         if (row.length >= 3 && row[0] && row[1] && row[2]) {
           const nama = String(row[0]).trim();
           const email = String(row[1]).trim();
           const hakAkses = String(row[2]).toLowerCase().trim();
           // Validate email format
           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (!emailRegex.test(email)) {
             errors.push(`Baris ${i + 1}: Format email tidak valid (${email})`);
             continue;
           }
           // Validate role
           if (!['admin', 'teacher', 'student'].includes(hakAkses)) {
             errors.push(`Baris ${i + 1}: Hak akses tidak valid (${hakAkses}). Gunakan: admin, teacher, atau student`);
             continue;
           }
           // Check for duplicate emails in current users
           const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
           if (existingUser) {
             errors.push(`Baris ${i + 1}: Email sudah terdaftar (${email})`);
             continue;
           }
           parsedData.push({
             nama,
             email,
             hakAkses,
             row: i + 1
           });
         }
       }
       setImportData(parsedData);
       setImportErrors(errors);
       setImportPreview(true);
       if (parsedData.length === 0) {
         toast.error('Tidak ada data yang valid untuk diimpor');
       } else {
         toast.success(`${parsedData.length} data valid siap diimpor`);
       }
     } catch (error) {
       console.error('Error parsing Excel:', error);
       toast.error('Gagal membaca file Excel');
     }
   };
   reader.readAsArrayBuffer(file);
 };
 // Process import
 const processImport = async () => {
   if (!schoolId || importData.length === 0) {
     return;
   }
   try {
     setImportLoading(true);

     const { createUserWithEmailAndPassword, getAuth } = await import('firebase/auth');
     const { doc, setDoc } = await import('firebase/firestore');
     const { db } = await import('@/lib/firebase');
     const { serverTimestamp } = await import('firebase/firestore');
     const auth = getAuth();
     let successCount = 0;
     let errorCount = 0;
     const newUsers: UserData[] = [];
     for (const userData of importData) {
       try {
         // Generate default password
         const defaultPassword = '12345678';

         // Create user with Firebase Auth
         const userCredential = await createUserWithEmailAndPassword(
           auth,
           userData.email,
           defaultPassword
         );

         const user = userCredential.user;

         // Create user document in Firestore
         await setDoc(doc(db, 'users', user.uid), {
           name: userData.nama,
           email: userData.email,
           role: userData.hakAkses,
           schoolId,
           createdAt: serverTimestamp(),
         });
         newUsers.push({
           id: user.uid,
           name: userData.nama,
           email: userData.email,
           role: userData.hakAkses,
           schoolId,
         });
         successCount++;
       } catch (error: any) {
         console.error(`Error creating user ${userData.email}:`, error);
         errorCount++;
       }
     }
     // Update local state
     setUsers([...users, ...newUsers]);

     // Reset import states
     setShowImportModal(false);
     setImportFile(null);
     setImportData([]);
     setImportPreview(false);
     setImportErrors([]);
     if (successCount > 0) {
       toast.success(`${successCount} pengguna berhasil diimpor`);
     }
     if (errorCount > 0) {
       toast.error(`${errorCount} pengguna gagal diimpor`);
     }
   } catch (error) {
     console.error('Error processing import:', error);
     toast.error('Gagal memproses impor data');
   } finally {
     setImportLoading(false);
   }
 };
 const handleAddUser = () => {
   setFormData({
     name: '',
     email: '',
     password: '',
     role: 'teacher',
   });
   setShowAddModal(true);
 };
 const handleEditUser = (user: UserData) => {
   setSelectedUser(user);
   setFormData({
     name: user.name,
     email: user.email,
     password: '',
     role: user.role,
   });
   setShowEditModal(true);
 };
 const handleDeleteUser = async (userId: string) => {
   if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
     return;
   }
   try {
     const { userApi } = await import('@/lib/api');
     await userApi.delete(userId);
     setUsers(users.filter(user => user.id !== userId));
     toast.success('Pengguna berhasil dihapus');
   } catch (error) {
     console.error('Error deleting user:', error);
     toast.error('Gagal menghapus pengguna');
   }
 };
 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });
 };
 const handleSubmitAddUser = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!schoolId) {
     toast.error('Tidak dapat mengakses data sekolah');
     return;
   }
   try {
     setFormLoading(true);

     const { createUserWithEmailAndPassword, getAuth } = await import('firebase/auth');
     const { doc, setDoc } = await import('firebase/firestore');
     const { db } = await import('@/lib/firebase');
     const { serverTimestamp } = await import('firebase/firestore');
     const auth = getAuth();

     const userCredential = await createUserWithEmailAndPassword(
       auth,
       formData.email,
       formData.password
     );

     const user = userCredential.user;

     await setDoc(doc(db, 'users', user.uid), {
       name: formData.name,
       email: formData.email,
       role: formData.role,
       schoolId,
       createdAt: serverTimestamp(),
     });

     setUsers([...users, {
       id: user.uid,
       name: formData.name,
       email: formData.email,
       role: formData.role,
       schoolId,
     }]);

     setShowAddModal(false);
     toast.success('Pengguna berhasil ditambahkan');
   } catch (error: any) {
     console.error('Error adding user:', error);
     let errorMessage = 'Gagal menambahkan pengguna';

     if (error.code === 'auth/email-already-in-use') {
       errorMessage = 'Email sudah digunakan';
     } else if (error.code === 'auth/weak-password') {
       errorMessage = 'Password terlalu lemah';
     }

     toast.error(errorMessage);
   } finally {
     setFormLoading(false);
   }
 };
 const handleSubmitEditUser = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!selectedUser) {
     return;
   }
   try {
     setFormLoading(true);

     const { userApi } = await import('@/lib/api');

     await userApi.update(selectedUser.id, {
       name: formData.name,
       role: formData.role,
     });

     setUsers(users.map(user =>
       user.id === selectedUser.id
         ? { ...user, name: formData.name, role: formData.role }
         : user
     ));

     setShowEditModal(false);
     toast.success('Pengguna berhasil diperbarui');
   } catch (error) {
     console.error('Error updating user:', error);
     toast.error('Gagal memperbarui pengguna');
   } finally {
     setFormLoading(false);
   }
 };

 const filteredUsers = users.filter(user =>
   user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   user.email.toLowerCase().includes(searchQuery.toLowerCase())
 );
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
       <div className="flex items-center mb-5 md:mb-0">
         <Users className="h-7 w-7 text-primary mr-3" />
         <h1 className="text-2xl font-bold text-gray-800">Daftar Guru dan Tendik</h1>
       </div>

       <div className="flex flex-col sm:flex-row gap-2">
        

         <button
           onClick={handleAddUser}
           className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors shadow-sm"
         >
           <UserPlus size={18} />
           Tambah Data Pendidik
         </button>

         <button
           onClick={() => setShowImportModal(true)}
           className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
         >
           <Upload size={18} />
           Import Dengan Excel
         </button>
       </div>
     </div>
     {/* Search bar */}
     <div className="mb-4">
       <div className="relative">
         <input
           type="text"
           placeholder="Cari pengguna berdasarkan nama atau email..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
         />
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           <UserIcon size={18} className="text-gray-400" />
         </div>
       </div>
     </div>
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-10 w-10 text-primary animate-spin" />
       </div>
     ) : filteredUsers.length > 0 ? (
       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hak Akses</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {filteredUsers.map((user) => (
                 <tr key={user.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                         {user.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="ml-4">
                         <div className="text-sm font-medium text-gray-900">{user.name}</div>
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-500">{user.email}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                       ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                       ${user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : ''}
                       ${user.role === 'student' ? 'bg-green-100 text-green-800' : ''}
                     `}>
                       {user.role === 'admin' ? 'Administrator' :
                        user.role === 'teacher' ? 'Guru' : 'Siswa'}
                     </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex justify-end gap-2">
                       <button
                         onClick={() => handleEditUser(user)}
                         className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                         title="Edit pengguna"
                       >
                         <Edit size={18} />
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     ) : (
       <div className="bg-white rounded-xl shadow-sm p-10 text-center">
         <div className="flex flex-col items-center">
           <div className="bg-gray-100 rounded-full p-3 mb-4">
             <Users className="h-8 w-8 text-gray-400" />
           </div>
           <p className="text-gray-500 mb-4">
             {searchQuery ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada data pengguna'}
           </p>
           <button
             onClick={handleAddUser}
             className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
           >
             Tambah Pengguna
           </button>
         </div>
       </div>
     )}
     {/* Import Excel Modal */}
     <AnimatePresence>
       {showImportModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
           >
             {/* Header */}
             <div className="bg-gradient-to-r from-green-600 to-indigo-600 px-6 py-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <div className="bg-white/20 p-2 rounded-lg">
                     <FileSpreadsheet className="h-6 w-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-lg font-bold text-white">Import Data Pengguna</h2>
                   </div>
                 </div>
                 <button
                   onClick={() => {
                     setShowImportModal(false);
                     setImportFile(null);
                     setImportData([]);
                     setImportPreview(false);
                     setImportErrors([]);
                   }}
                   className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               </div>
             </div>
             {/* Content */}
             <div className="p-3 overflow-y-auto max-h-[calc(90vh-140px)]">
               {!importPreview ? (
                 <div className="space-y-6">
                   {/* Download Template Section */}
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                     <div className="flex-col items-center mb-1 justify-between">
                       <div>
                         <h3 className="text-lg font-semibold text-blue-800 mb-2">
                           Langkah 1 : Download Template
                         </h3>
                         <p className="text-blue-700 text-sm mb-3">
                           Download file template Excel, isi dengan data Pendidik, lalu upload kembali.
                         </p>
                        {/*<div className="text-xs mb-4  text-blue-600 space-y-1">
                           <p>• Kolom 1 : NAMA (Nama lengkap Pengguna)</p>
                           <p>• Kolom 2 : E-MAIL (Email yang valid)</p>
                           <p>• Kolom 3 : HAK AKSES (admin/teacher/student)</p>
                         </div>*/}
                       </div>
                       <center><button
                         onClick={downloadTemplate}
                         className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                       >
                         <Download size={16} />
                         Download Template
                       </button></center>
                     </div>
                   </div>
                   {/* Upload Section */}
                   <div className="space-y-3">
                     <h3 className="text-lg font-semibold text-gray-800">
                       Langkah 2 : Upload File Excel
                     </h3>

                     <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
                       <input
                         type="file"
                         accept=".xlsx"
                         onChange={handleFileUpload}
                         className="hidden"
                         id="excel-upload"
                       />

                       <div className="space-y-4">
                         <div className="flex justify-center">
                           <div className="bg-green-100 p-2 rounded-full">
                             <Upload className="h-8 w-8 text-green-600" />
                           </div>
                         </div>

                         <div>
                          {/*<p className="text-lg font-medium text-gray-700 mb-2">
                             Drag & Drop file Excel di sini
                           </p>
                           <p className="text-gray-500 text-sm mb-4">atau</p>*/}
                           <label
                             htmlFor="excel-upload"
                             className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                           >
                             <FileSpreadsheet size={18} />
                             Pilih File Excel
                           </label>
                         </div>

                         <p className="text-xs text-gray-500">
                           Hanya menerima file .xlsx maksimal 100 data
                         </p>
                       </div>
                     </div>
                     {importFile && (
                       <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between border border-green-200">
                         <div className="flex items-center space-x-3">
                           <FileSpreadsheet className="h-5 w-5 text-green-600" />
                           <div>
                             <p className="font-medium text-green-800">{importFile.name}</p>
                             <p className="text-sm text-green-600">
                               {(importFile.size / 1024).toFixed(1)} KB
                             </p>
                           </div>
                         </div>
                         <CheckCircle className="h-5 w-5 text-green-600" />
                       </div>
                     )}
                   </div>
                 </div>
               ) : (
                 /* Preview Section */
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-gray-800">
                       Preview : {importData.length} Total Data
                     </h3>
                     <button
                       onClick={() => {
                         setImportPreview(false);
                         setImportFile(null);
                         setImportData([]);
                         setImportErrors([]);
                       }}
                       className="text-gray-500 hover:text-gray-700 text-sm"
                     >
                       ← Kembali
                     </button>
                   </div>
                   {/* Errors */}
                   {importErrors.length > 0 && (
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                       <div className="flex items-start space-x-3">
                         <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                         <div>
                           <h4 className="text-sm font-medium text-red-800">
                             Ditemukan {importErrors.length} error:
                           </h4>
                           <ul className="mt-2 text-sm text-red-700 space-y-1">
                             {importErrors.map((error, index) => (
                               <li key={index}>• {error}</li>
                             ))}
                           </ul>
                         </div>
                       </div>
                     </div>
                   )}
                   {/* Preview Table */}
                   <div className="bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                     <table className="w-full">
                       <thead className="bg-gray-100 sticky top-0">
                         <tr>
                           <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                             Nama
                           </th>
                           <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                             Email
                           </th>
                           <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                             Hak Akses
                           </th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200">
                         {importData.map((user, index) => (
                           <tr key={index} className="hover:bg-gray-50">
                             <td className="px-4 py-3 text-sm text-gray-900">
                               {user.nama}
                             </td>
                             <td className="px-4 py-3 text-sm text-gray-900">
                               {user.email}
                             </td>
                             <td className="px-4 py-3 text-sm text-gray-900">
                               <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                 ${user.hakAkses === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                                 ${user.hakAkses === 'teacher' ? 'bg-blue-100 text-blue-800' : ''}
                                 ${user.hakAkses === 'student' ? 'bg-green-100 text-green-800' : ''}
                               `}>
                                 {user.hakAkses === 'admin' ? 'Administrator' :
                                  user.hakAkses === 'teacher' ? 'Guru' : 'Siswa'}
                               </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                   <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                     <div className="flex items-start space-x-3">
                       <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                       <div>
                         <p className="text-sm font-medium text-yellow-800">
                           INFORMASI PENTING !!!
                         </p>
                         <p className="text-sm text-yellow-700 mt-1">
                           • Password default : <strong>12345678</strong>
                         </p>
                         
                         <p className="text-sm text-yellow-700">
                           • Data akan diimport ke database
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
             </div>
             {/* Footer */}
             <div className="bg-gray-50 px-6 py-2 flex justify-end space-x-3">
               <button
                 onClick={() => {
                   setShowImportModal(false);
                   setImportFile(null);
                   setImportData([]);
                   setImportPreview(false);
                   setImportErrors([]);
                 }}
                 className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Batal
               </button>

               {importPreview && (
                 <button
                   onClick={processImport}
                   disabled={importLoading || importData.length === 0}
                   className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {importLoading ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                   ) : (
                     <Upload className="h-4 w-4" />
                   )}
                   {importLoading ? 'Mengimpor...' : `Import ${importData.length} Data`}
                 </button>
               )}
             </div>
           </motion.div>
         </div>
       )}
     </AnimatePresence>
     {/* Add User Modal */}
     {showAddModal && (
       <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
         >
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold text-gray-800 flex items-center">
               <UserPlus className="mr-2 h-5 w-5 text-primary" />
               Tambah Pengguna Baru
             </h3>
             <button
               onClick={() => setShowAddModal(false)}
               className="text-gray-500 hover:text-gray-700"
             >
               <X size={20} />
             </button>
           </div>

           <form onSubmit={handleSubmitAddUser}>
             <div className="space-y-4">
               <div>
                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Lengkap
                 </label>
                 <input
                   id="name"
                   name="name"
                   type="text"
                   required
                   value={formData.name}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Masukkan nama lengkap"
                 />
               </div>

               <div>
                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                   Email
                 </label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input
                     id="email"
                     name="email"
                     type="email"
                     required
                     value={formData.email}
                     onChange={handleInputChange}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                     placeholder="Masukkan E-mail"
                   />
                 </div>
               </div>

               <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                   Password
                 </label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input
                     id="password"
                     name="password"
                     type="password"
                     required
                     value={formData.password}
                     onChange={handleInputChange}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                     placeholder="Masukkan password"
                   />
                 </div>
               </div>

               <div>
                 <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                   Hak Akses
                 </label>
                 <select
                   id="role"
                   name="role"
                   value={formData.role}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   required
                 >
                   <option value="admin">Administrator</option>
                   <option value="teacher">Guru</option>
                   <option value="student">Siswa</option>
                 </select>
               </div>
             </div>

             <div className="mt-6 flex justify-end">
               <button
                 type="button"
                 onClick={() => setShowAddModal(false)}
                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50"
               >
                 Batal
               </button>

               <button
                 type="submit"
                 disabled={formLoading}
                 className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-500 active:bg-orange-600 flex items-center gap-2"
               >
                 {formLoading ? (
                   <Loader2 className="animate-spin h-4 w-4 mr-1" />
                 ) : (
                   <UserPlus size={16} />
                 )}
                 {formLoading ? "Menambahkan..." : "Tambah Pengguna"}
               </button>
             </div>
           </form>
         </motion.div>
       </div>
     )}
     {/* Edit User Modal */}
     {showEditModal && selectedUser && (
       <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
         >
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold text-gray-800 flex items-center">
               <Edit className="mr-2 h-5 w-5 text-primary" />
               Edit Pengguna
             </h3>
             <button
               onClick={() => setShowEditModal(false)}
               className="text-gray-500 hover:text-gray-700"
             >
               <X size={20} />
             </button>
           </div>

           <form onSubmit={handleSubmitEditUser}>
             <div className="space-y-4">
               <div>
                 <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Lengkap
                 </label>
                 <input
                   id="edit-name"
                   name="name"
                   type="text"
                   required
                   value={formData.name}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                 />
               </div>

               <div>
                 <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                   Email
                 </label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input
                     id="edit-email"
                     name="email"
                     type="email"
                     disabled
                     value={formData.email}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                   />
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
               </div>

               <div>
                 <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                   Hak Akses
                 </label>
                 <select
                   id="edit-role"
                   name="role"
                   disabled
                   value={formData.role}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   required
                 >
                   <option value="admin">Administrator</option>
                   <option value="teacher">Guru</option>
                   <option value="student">Siswa</option>
                 </select>
               </div>
             </div>

             <div className="mt-6 flex justify-end">
               <button
                 type="button"
                 onClick={() => setShowEditModal(false)}
                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50"
               >
                 Batal
               </button>

               <button
                 type="submit"
                 disabled={formLoading}
                 className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-500 active:bg-orange-600 flex items-center gap-2"
               >
                 {formLoading ? (
                   <Loader2 className="animate-spin h-4 w-4 mr-1" />
                 ) : (
                   <CheckCircle size={16} />
                 )}
                 {formLoading ? "Menyimpan..." : "Simpan Perubahan"}
               </button>
             </div>
           </form>
         </motion.div>
       </div>
     )}
   </div>
 );
}
