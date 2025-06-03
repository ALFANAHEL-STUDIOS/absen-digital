'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, FileSpreadsheet, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
interface ClassData {
 namaKelas: string;
 tingkat: string;
 namaWaliKelas: string;
}
interface ClassImportModalProps {
 isOpen: boolean;
 onClose: () => void;
 onImport: (classes: ClassData[]) => Promise<void>;
}
export default function ClassImportModal({ isOpen, onClose, onImport }: ClassImportModalProps) {
 const [uploading, setUploading] = useState(false);
 const [dragActive, setDragActive] = useState(false);
 const [selectedFile, setSelectedFile] = useState<File | null>(null);
 const [previewData, setPreviewData] = useState<ClassData[]>([]);
 const [showPreview, setShowPreview] = useState(false);
 const downloadTemplate = () => {
   // Create sample data
   const templateData = [
     {
       'Nama Kelas': 'VII A',
       'Tingkat/Kelas': '7',
       'Nama Wali Kelas': 'Budi Santoso, S.Pd'
     },
     {
       'Nama Kelas': 'VII B',
       'Tingkat/Kelas': '7',
       'Nama Wali Kelas': 'Siti Aminah, S.Pd'
     },
     {
       'Nama Kelas': 'VIII A',
       'Tingkat/Kelas': '8',
       'Nama Wali Kelas': 'Ahmad Wijaya, S.Pd'
     }
   ];
   // Create workbook
   const wb = XLSX.utils.book_new();
   const ws = XLSX.utils.json_to_sheet(templateData);
   // Set column widths
   ws['!cols'] = [
     { wch: 15 }, // Nama Kelas
     { wch: 15 }, // Tingkat/Kelas
     { wch: 25 }  // Nama Wali Kelas
   ];
   // Add worksheet to workbook
   XLSX.utils.book_append_sheet(wb, ws, 'Template Kelas');
   // Generate Excel file buffer
   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

   // Create blob and save
   const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   saveAs(blob, 'Template_Data_Kelas.xlsx');

   toast.success('Template Excel berhasil diunduh');
 };
 const handleFileSelect = (file: File) => {
   if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
     setSelectedFile(file);
     parseExcelFile(file);
   } else {
     toast.error('Harap pilih file Excel (.xlsx)');
   }
 };
 const parseExcelFile = (file: File) => {
   const reader = new FileReader();
   reader.onload = (e) => {
     try {
       const data = new Uint8Array(e.target?.result as ArrayBuffer);
       const workbook = XLSX.read(data, { type: 'array' });
       const sheetName = workbook.SheetNames[0];
       const worksheet = workbook.Sheets[sheetName];
       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
       // Skip header row and process data
       const classes: ClassData[] = [];
       for (let i = 1; i < jsonData.length; i++) {
         const row = jsonData[i] as any[];
         if (row.length >= 3 && row[0] && row[1] && row[2]) {
           classes.push({
             namaKelas: String(row[0]).trim(),
             tingkat: String(row[1]).trim(),
             namaWaliKelas: String(row[2]).trim()
           });
         }
       }
       if (classes.length === 0) {
         toast.error('Tidak ada data kelas yang valid ditemukan');
         return;
       }
       setPreviewData(classes);
       setShowPreview(true);
       toast.success(`${classes.length} kelas berhasil dibaca dari file`);
     } catch (error) {
       console.error('Error parsing Excel:', error);
       toast.error('Gagal membaca file Excel');
     }
   };
   reader.readAsArrayBuffer(file);
 };
 const handleDrop = (e: React.DragEvent) => {
   e.preventDefault();
   setDragActive(false);
   const files = e.dataTransfer.files;
   if (files[0]) {
     handleFileSelect(files[0]);
   }
 };
 const handleImportConfirm = async () => {
   if (previewData.length === 0) return;

   setUploading(true);
   try {
     await onImport(previewData);
     toast.success(`${previewData.length} kelas berhasil diimpor`);
     onClose();
     setPreviewData([]);
     setShowPreview(false);
     setSelectedFile(null);
   } catch (error) {
     console.error('Error importing classes:', error);
     toast.error('Gagal mengimpor data kelas');
   } finally {
     setUploading(false);
   }
 };
 const resetModal = () => {
   setSelectedFile(null);
   setPreviewData([]);
   setShowPreview(false);
   setDragActive(false);
 };
 const handleClose = () => {
   resetModal();
   onClose();
 };
 if (!isOpen) return null;
 return (
   <AnimatePresence>
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
       <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
       >
         {/* Header */}
         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="bg-white/20 p-2 rounded-lg">
                 <FileSpreadsheet className="h-6 w-6 text-white" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-white">Import Data Kelas</h2>
                 <p className="text-blue-100 text-sm">Upload file Excel untuk menambah data kelas secara massal</p>
               </div>
             </div>
             <button
               onClick={handleClose}
               className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
             >
               <X className="h-5 w-5" />
             </button>
           </div>
         </div>
         <div className="p-6 space-y-6">
           {!showPreview ? (
             <>
               {/* Download Template Section */}
               <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold text-green-800 mb-2">
                       Langkah 1: Download Template Excel
                     </h3>
                     <p className="text-green-700 text-sm mb-4">
                       Download file template Excel, isi dengan data kelas, lalu upload kembali
                     </p>
                     <div className="text-xs text-green-600 space-y-1">
                       <p>• Kolom 1: Nama Kelas (contoh: VII A)</p>
                       <p>• Kolom 2: Tingkat/Kelas (contoh: 7)</p>
                       <p>• Kolom 3: Nama Wali Kelas (contoh: Budi Santoso, S.Pd)</p>
                     </div>
                   </div>
                   <button
                     onClick={downloadTemplate}
                     className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                   >
                     <Download size={18} />
                     Download Template
                   </button>
                 </div>
               </div>
               {/* Upload Section */}
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-800">
                   Langkah 2: Upload File Excel
                 </h3>

                 <div
                   onDrop={handleDrop}
                   onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                   onDragLeave={() => setDragActive(false)}
                   className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                     dragActive
                       ? 'border-blue-500 bg-blue-50'
                       : 'border-gray-300 hover:border-gray-400'
                   }`}
                 >
                   <input
                     type="file"
                     accept=".xlsx"
                     onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                     className="hidden"
                     id="excel-upload"
                   />

                   <div className="space-y-4">
                     <div className="flex justify-center">
                       <div className="bg-blue-100 p-4 rounded-full">
                         <Upload className="h-8 w-8 text-blue-600" />
                       </div>
                     </div>

                     <div>
                       <p className="text-lg font-medium text-gray-700 mb-2">
                         Drag & Drop file Excel di sini
                       </p>
                       <p className="text-gray-500 text-sm mb-4">atau</p>
                       <label
                         htmlFor="excel-upload"
                         className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                       >
                         <FileSpreadsheet size={18} />
                         Pilih File Excel
                       </label>
                     </div>

                     <p className="text-xs text-gray-500">
                       Hanya menerima file .xlsx dengan maksimal 100 kelas
                     </p>
                   </div>
                 </div>
                 {selectedFile && (
                   <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between border border-blue-200">
                     <div className="flex items-center space-x-3">
                       <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                       <div>
                         <p className="font-medium text-blue-800">{selectedFile.name}</p>
                         <p className="text-sm text-blue-600">
                           {(selectedFile.size / 1024).toFixed(1)} KB
                         </p>
                       </div>
                     </div>
                     <CheckCircle className="h-5 w-5 text-green-600" />
                   </div>
                 )}
               </div>
             </>
           ) : (
             /* Preview Section */
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold text-gray-800">
                   Preview Data Kelas ({previewData.length} kelas)
                 </h3>
                 <button
                   onClick={() => setShowPreview(false)}
                   className="text-gray-500 hover:text-gray-700 text-sm"
                 >
                   ← Kembali ke Upload
                 </button>
               </div>
               <div className="bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                 <table className="w-full">
                   <thead className="bg-gray-100 sticky top-0">
                     <tr>
                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                         Nama Kelas
                       </th>
                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                         Tingkat
                       </th>
                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                         Wali Kelas
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {previewData.map((classData, index) => (
                       <tr key={index} className="hover:bg-gray-50">
                         <td className="px-4 py-3 text-sm text-gray-900">
                           {classData.namaKelas}
                         </td>
                         <td className="px-4 py-3 text-sm text-gray-900">
                           {classData.tingkat}
                         </td>
                         <td className="px-4 py-3 text-sm text-gray-900">
                           {classData.namaWaliKelas}
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
                       Periksa data sebelum mengimpor
                     </p>
                     <p className="text-sm text-yellow-700 mt-1">
                       Pastikan semua data sudah benar. Data yang diimpor akan langsung ditambahkan ke database.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>
         {/* Footer */}
         <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
           <button
             onClick={handleClose}
             className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
           >
             Batal
           </button>

           {showPreview && (
             <button
               onClick={handleImportConfirm}
               disabled={uploading || previewData.length === 0}
               className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {uploading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Upload className="h-4 w-4" />
               )}
               {uploading ? 'Mengimpor...' : `Import ${previewData.length} Kelas`}
             </button>
           )}
         </div>
       </motion.div>
     </div>
   </AnimatePresence>
 );
}