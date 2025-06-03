"use client";
import React, { useState } from "react";
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
interface ImportStudentsModalProps {
 isOpen: boolean;
 onClose: () => void;
 onImportSuccess: () => void;
 schoolId: string;
 classes: string[];
}
export default function ImportStudentsModal({
 isOpen,
 onClose,
 onImportSuccess,
 schoolId,
 classes
}: ImportStudentsModalProps) {
 const [file, setFile] = useState<File | null>(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const [previewData, setPreviewData] = useState<any[]>([]);
 const [showPreview, setShowPreview] = useState(false);
 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const selectedFile = e.target.files?.[0];
   if (selectedFile) {
     setFile(selectedFile);
     processExcelFile(selectedFile);
   }
 };
 const processExcelFile = async (file: File) => {
   try {
     const buffer = await file.arrayBuffer();
     const workbook = XLSX.read(buffer, { type: 'buffer' });
     const sheetName = workbook.SheetNames[0];
     const worksheet = workbook.Sheets[sheetName];
     const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

     // Skip header row and process data
     const processedData = data.slice(1).map((row: any, index) => ({
       rowNumber: index + 2,
       namaLengkap: row[0] || '',
       nisn: row[1] || '',
       kelas: row[2] || '',
       jenisKelamin: row[3] || '',
       tanggalLahir: row[4] || '',
       namaOrangTua: row[5] || '',
       idTelegramOrangTua: row[6] || '',
       alamatSiswa: row[7] || ''
     })).filter(row => row.namaLengkap && row.nisn);
     setPreviewData(processedData);
     setShowPreview(true);
   } catch (error) {
     toast.error("Error reading Excel file. Please check the format.");
   }
 };
 const validateData = (data: any[]) => {
   const errors: string[] = [];

   data.forEach((student, index) => {
     if (!student.namaLengkap) errors.push(`Row ${student.rowNumber}: Nama Lengkap is required`);
     if (!student.nisn) errors.push(`Row ${student.rowNumber}: NISN is required`);
     if (!student.kelas) errors.push(`Row ${student.rowNumber}: Kelas is required`);
     if (!classes.includes(student.kelas)) errors.push(`Row ${student.rowNumber}: Kelas '${student.kelas}' not found in system`);
     if (!student.jenisKelamin || !['Laki-laki', 'Perempuan'].includes(student.jenisKelamin)) {
       errors.push(`Row ${student.rowNumber}: Jenis Kelamin must be 'Laki-laki' or 'Perempuan'`);
     }
   });
   return errors;
 };
 const handleImport = async () => {
   if (!previewData.length) {
     toast.error("No data to import");
     return;
   }
   const validationErrors = validateData(previewData);
   if (validationErrors.length > 0) {
     toast.error(`Validation errors: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`);
     return;
   }
   setIsProcessing(true);
   try {
     const { studentApi } = await import('@/lib/api');
     let successCount = 0;
     let errorCount = 0;
     for (const student of previewData) {
       try {
         const studentData = {
           name: student.namaLengkap,
           nisn: student.nisn,
           class: student.kelas,
           gender: student.jenisKelamin === 'Laki-laki' ? 'male' : 'female',
           birthDate: student.tanggalLahir,
           parentName: student.namaOrangTua,
           telegramNumber: student.idTelegramOrangTua,
           address: student.alamatSiswa,
           createdAt: new Date().toISOString()
         };
         await studentApi.create(schoolId, studentData);
         successCount++;
       } catch (error) {
         errorCount++;
         console.error(`Error importing student ${student.namaLengkap}:`, error);
       }
     }
     if (successCount > 0) {
       toast.success(`Successfully imported ${successCount} students${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
       onImportSuccess();
       onClose();
     } else {
       toast.error("Failed to import any students");
     }
   } catch (error) {
     toast.error("Import failed. Please try again.");
   } finally {
     setIsProcessing(false);
   }
 };
 const downloadTemplate = () => {
   const templateData = [
     ['Nama Lengkap', 'NISN', 'Kelas', 'Jenis Kelamin', 'Tanggal Lahir', 'Nama Orang Tua/Wali', 'ID Telegram Orang Tua', 'Alamat Siswa'],
     ['Ahmad Farhan', '0012345678', classes[0] || 'X-A', 'Laki-laki', '2005-03-15', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 10'],
     ['Siti Aisyah', '0012345679', classes[0] || 'X-A', 'Perempuan', '2005-07-20', 'Sri Wahyuni', '081234567891', 'Jl. Pahlawan No. 5']
   ];
   const ws = XLSX.utils.aoa_to_sheet(templateData);
   const wb = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');

   // Set column widths
   const colWidths = [
     { wch: 20 }, // Nama Lengkap
     { wch: 15 }, // NISN
     { wch: 10 }, // Kelas
     { wch: 15 }, // Jenis Kelamin
     { wch: 15 }, // Tanggal Lahir
     { wch: 20 }, // Nama Orang Tua
     { wch: 20 }, // ID Telegram
     { wch: 30 }  // Alamat
   ];
   ws['!cols'] = colWidths;
   XLSX.writeFile(wb, 'Template_Data_Siswa.xlsx');
   toast.success("Template downloaded successfully");
 };
 if (!isOpen) return null;
 return (
   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
     <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
       {/* Header */}
       <div className="bg-gradient-to-r from-green-600 to-indigo-600 flex items-center justify-between p-5 border-b">
        
         <h2 className="text-xl text-white font-semibold">Import Data Siswa</h2>
         <button onClick={onClose} className="text-white hover:text-gray-700">
           <X size={24} />
         </button>
       </div>
       {/* Content */}
       <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
         {!showPreview ? (
           <div>
             {/* Download Template Section */}
             <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
               <h3 className="font-semibold text-blue-800 mb-2">Langkah 1 : Download Template</h3>
               <p className="text-blue-700 text-sm mb-3">
                 Download template Excel terlebih dahulu, isi dengan data siswa, lalu upload kembali.
                
               </p>
               <button
                 onClick={downloadTemplate}
                 className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors"
               >
                 <Download size={16} />
                 Download Template Excel
               </button>
             </div>
             {/* Upload Section */}
             <div className="mb-6">
               <h3 className="font-semibold mb-3">Langkah 2 : Upload File Excel</h3>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                 <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600 mb-4">Drag & drop file Excel atau klik untuk memilih</p>
                 <input
                   type="file"
                   accept=".xlsx,.xls"
                   onChange={handleFileChange}
                   className="hidden"
                   id="file-upload"
                 />
                 <label
                   htmlFor="file-upload"
                   className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors inline-flex items-center gap-2"
                 >
                   <Upload size={16} />
                   Pilih File Excel
                 </label>
               </div>
               {file && (
                 <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                   <div className="flex items-center gap-2">
                     <CheckCircle className="h-5 w-5 text-green-600" />
                     <span className="text-green-800 font-medium">File terpilih: {file.name}</span>
                   </div>
                 </div>
               )}
             </div>
             {/* Format Info */}
             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
               <div className="flex items-start gap-2">
                 <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                 <div>
                   <h4 className="font-semibold text-yellow-800">Format Data Excel</h4>
                   <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                     <li>• Kolom A : Nama Lengkap (wajib)</li>
                     <li>• Kolom B : NISN (wajib)</li>
                     <li>• Kolom C : Kelas (sesuai kelas)</li>
                     <li>• Kolom D : Jenis Kelamin</li>
                     <li>• Kolom E : Tanggal Lahir</li>
                     <li>• Kolom F : Nama Orang Tua/Wali</li>
                     <li>• Kolom G : ID Telegram Orang Tua </li>
                     <li>• Kolom H : Alamat Siswa</li>
                   </ul>
                 </div>
               </div>
             </div>
            
           </div>
         ) : (
           <div>
             {/* Preview Section */}
             <div className="mb-6">
               <h3 className="font-semibold mb-3">Preview Data ({previewData.length} siswa)</h3>
               <div className="overflow-x-auto max-h-60 border rounded-lg">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis Kelamin</th>
                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {previewData.slice(0, 10).map((student, index) => (
                       <tr key={index}>
                         <td className="px-4 py-2 text-sm">{student.namaLengkap}</td>
                         <td className="px-4 py-2 text-sm">{student.nisn}</td>
                         <td className="px-4 py-2 text-sm">{student.kelas}</td>
                         <td className="px-4 py-2 text-sm">{student.jenisKelamin}</td>
                         <td className="px-4 py-2 text-sm">{student.namaOrangTua}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {previewData.length > 10 && (
                   <div className="p-2 text-center text-sm text-gray-500">
                     ... dan {previewData.length - 10} siswa lainnya
                   </div>
                 )}
               </div>
             </div>
             <div className="flex justify-between">
               <button
                 onClick={() => setShowPreview(false)}
                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 Kembali
               </button>
               <button
                 onClick={handleImport}
                 disabled={isProcessing}
                 className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
               >
                 {isProcessing ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                   <CheckCircle className="h-4 w-4" />
                 )}
                 {isProcessing ? 'Mengimpor...' : 'Import Data'}
               </button>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
}
