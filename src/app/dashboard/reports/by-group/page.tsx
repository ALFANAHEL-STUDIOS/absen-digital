"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Calendar, FileText, FileSpreadsheet, Download, Loader2, ChevronDown, X, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import Link from "next/link";
export default function GroupAttendanceReport() {
 const { schoolId, user } = useAuth();
 const [loading, setLoading] = useState(true);
 const [isDownloading, setIsDownloading] = useState(false);
 const [selectedClass, setSelectedClass] = useState("all");
 const [classes, setClasses] = useState<string[]>([]);
 const [students, setStudents] = useState<any[]>([]);
 const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
 const [dateRange, setDateRange] = useState({
   start: format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"),
   end: format(new Date(), "yyyy-MM-dd")
 });
 const [schoolInfo, setSchoolInfo] = useState({
   name: "NAMA SEKOLAH",
   address: "Alamat",
   npsn: "NPSN",
   principalName: "",
   principalNip: ""
 });
 // Fetch school info, classes and student data
 useEffect(() => {
   const fetchData = async () => {
     if (!schoolId) return;
     try {
       setLoading(true);
       // Fetch school information
       const schoolDoc = await getDoc(doc(db, "schools", schoolId));
       if (schoolDoc.exists()) {
         const data = schoolDoc.data();
         setSchoolInfo({
           name: data.name || "NAMA SEKOLAH",
           address: data.address || "Alamat",
           npsn: data.npsn || "NPSN",
           principalName: data.principalName || "",
           principalNip: data.principalNip || ""
         });
       }
       // Fetch classes
       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const classesQuery = query(classesRef, orderBy("name"));
       const classesSnapshot = await getDocs(classesQuery);
       const classesData: string[] = [];
       classesSnapshot.forEach((doc) => {
         const data = doc.data();
         if (data.name) {
           classesData.push(data.name);
         }
       });
       setClasses(classesData.sort());
       // Fetch students with attendance data
       await fetchStudentsWithAttendance();
     } catch (error) {
       console.error("Error fetching data:", error);
       toast.error("Gagal mengambil data dari database");
     } finally {
       setLoading(false);
     }
   };
   fetchData();
 }, [schoolId]);
 // Fetch attendance data when date range or class selection changes
 useEffect(() => {
   if (schoolId) {
     fetchStudentsWithAttendance();
   }
 }, [dateRange, selectedClass, schoolId]);
 // Set filtered students whenever students array changes
 useEffect(() => {
   setFilteredStudents(students);
 }, [students]);
 const fetchStudentsWithAttendance = async () => {
   if (!schoolId) return;
   try {
     setLoading(true);
     // Fetch students filtered by class if needed
     const studentsRef = collection(db, `schools/${schoolId}/students`);
     const studentsQuery = selectedClass === "all"
       ? query(studentsRef, orderBy("name"))
       : query(studentsRef, where("class", "==", selectedClass), orderBy("name"));
     const studentsSnapshot = await getDocs(studentsQuery);
     let studentsList: any[] = [];
     studentsSnapshot.forEach(doc => {
       studentsList.push({
         id: doc.id,
         ...doc.data(),
         // Initialize attendance counters
         hadir: 0,
         sakit: 0,
         izin: 0,
         alpha: 0,
         total: 0
       });
     });
     // If we have students, fetch attendance records for the date range
     if (studentsList.length > 0) {
       const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
       const attendanceQuery = query(
         attendanceRef,
         where("date", ">=", dateRange.start),
         where("date", "<=", dateRange.end)
       );
       const attendanceSnapshot = await getDocs(attendanceQuery);
       // Count attendance by student ID
       attendanceSnapshot.forEach(doc => {
         const data = doc.data();
         const studentId = data.studentId;
         const status = data.status;
         // Find the student and update counts
         const studentIndex = studentsList.findIndex(s => s.id === studentId);
         if (studentIndex !== -1) {
           if (status === 'present' || status === 'hadir') {
             studentsList[studentIndex].hadir++;
           } else if (status === 'sick' || status === 'sakit') {
             studentsList[studentIndex].sakit++;
           } else if (status === 'permitted' || status === 'izin') {
             studentsList[studentIndex].izin++;
           } else if (status === 'absent' || status === 'alpha') {
             studentsList[studentIndex].alpha++;
           }
           studentsList[studentIndex].total++;
         }
       });
     }
     setStudents(studentsList);
   } catch (error) {
     console.error("Error fetching student attendance data:", error);
     toast.error("Gagal mengambil data kehadiran siswa");
   } finally {
     setLoading(false);
   }
 };
 const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
   setDateRange(prev => ({
     ...prev,
     [name]: value
   }));
 };
 const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
   setSelectedClass(e.target.value);
 };
 // Generate and download PDF report
 const handleDownloadPDF = async () => {
   setIsDownloading(true);
   try {
     // Create PDF document
     const doc = new jsPDF({
       orientation: "portrait",
       unit: "mm",
       format: "a4"
     });
     const pageWidth = doc.internal.pageSize.getWidth();
     const pageHeight = doc.internal.pageSize.getHeight();
     const margin = 15;
     const contentWidth = pageWidth - (margin * 2);
     // Set default font
     doc.setFont("helvetica", "normal");
     // Add KOP Sekolah
     doc.setFontSize(16);
     doc.setFont("helvetica", "bold");
     doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin + 5, { align: "center" });
     doc.setFontSize(12);
     doc.setFont("helvetica", "normal");
     doc.text(schoolInfo.address, pageWidth / 2, margin + 12, { align: "center" });
     doc.text(`NPSN ${schoolInfo.npsn}`, pageWidth / 2, margin + 18, { align: "center" });
     // Horizontal line
     doc.setLineWidth(0.5);
     doc.line(margin, margin + 22, pageWidth - margin, margin + 22);
     // Add report title and class information
     doc.setFontSize(14);
     doc.setFont("helvetica", "normal");
     doc.text("REKAPITULASI LAPORAN ABSENSI SISWA", pageWidth / 2, margin + 30, { align: "center" });
     doc.setFontSize(12);
     doc.setFont("helvetica", "normal");
     doc.text(`KELAS ${selectedClass === "all" ? "SEMUA KELAS" : selectedClass.toUpperCase()}`, pageWidth / 2, margin + 36, { align: "center" });
     // Add date range
     const startDate = format(new Date(dateRange.start), "d MMMM yyyy", { locale: id });
     const endDate = format(new Date(dateRange.end), "d MMMM yyyy", { locale: id });
     doc.text(`Periode ${startDate} - ${endDate}`, pageWidth / 2, margin + 42, { align: "center" });
     // Draw table headers
     const headers = ["NO.", "NAMA SISWA", "NISN", "KELAS", "HADIR", "SAKIT", "IZIN", "ALPHA", "TOTAL"];
     const colWidths = [10, 50, 25, 16, 16, 16, 14, 16, 18];
     let yPos = margin + 52;
     // Draw header row with light blue background
     doc.setFillColor(173, 216, 230); // Light blue
     doc.rect(margin, yPos, contentWidth, 10, "F");
     doc.setDrawColor(0, 0, 0);
     doc.setLineWidth(0.3);
     doc.rect(margin, yPos, contentWidth, 10, "S");
     let xPos = margin;
     // Draw column headers
     doc.setFontSize(10);
     doc.setFont("helvetica", "bold");
     doc.setTextColor(0, 0, 0);
     headers.forEach((header, i) => {
       // Draw vertical line (except for first column)
       if (i > 0) {
         doc.line(xPos, yPos, xPos, yPos + 10);
       }
       // Add header text
       doc.text(header, xPos + colWidths[i]/2, yPos + 6, { align: "center" });
       xPos += colWidths[i];
     });
     yPos += 10;
     // Draw table rows
     doc.setFont("helvetica", "normal");
     doc.setFontSize(9);
     students.forEach((student, index) => {
       // Check if we need a new page
       if (yPos > pageHeight - margin - 50) {
         doc.addPage();
         // Redraw header on new page
         doc.setFont("helvetica", "bold");
         doc.setFontSize(14);
         doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin + 5, { align: "center" });
         doc.setFontSize(10);

         doc.setFont("helvetica", "normal");
         doc.text(schoolInfo.address, pageWidth / 2, margin + 12, { align: "center" });
         doc.text(`NPSN ${schoolInfo.npsn}`, pageWidth / 2, margin + 18, { align: "center" });

        
         doc.setFont("helvetica", "normal");
         doc.text("", pageWidth / 2, margin + 12, { align: "center" });
         yPos = margin + 25;
         // Redraw table header
         doc.setFillColor(173, 216, 230);
         doc.rect(margin, yPos, contentWidth, 10, "F");
         doc.rect(margin, yPos, contentWidth, 10, "S");
         xPos = margin;
         doc.setFont("helvetica", "bold");
         doc.setFontSize(10);
         headers.forEach((header, i) => {
           if (i > 0) {
             doc.line(xPos, yPos, xPos, yPos + 10);
           }
           doc.text(header, xPos + colWidths[i]/2, yPos + 6, { align: "center" });
           xPos += colWidths[i];
         });
         yPos += 10;
         doc.setFont("helvetica", "normal");
         doc.setFontSize(9);
       }
       // Alternating row background
       if (index % 2 === 0) {
         doc.setFillColor(245, 245, 245);
         doc.rect(margin, yPos, contentWidth, 8, "F");
       }
       // Draw row border
       doc.setDrawColor(0, 0, 0);
       doc.rect(margin, yPos, contentWidth, 8, "S");
       // Draw cell content
       xPos = margin;
       // Number
       doc.text((index + 1).toString(), xPos + colWidths[0]/2, yPos + 5, { align: "center" });
       xPos += colWidths[0];
       // Vertical line
       doc.line(xPos, yPos, xPos, yPos + 8);
       // Name (truncate if too long)
       const studentName = student.name || "";
       const displayName = studentName.length > 35 ? studentName.substring(0, 32) + "..." : studentName;
       doc.text(displayName, xPos + 3, yPos + 5);
       xPos += colWidths[1];
       // NISN - Convert to string to fix the error
       doc.line(xPos, yPos, xPos, yPos + 8);
       doc.text(String(student.nisn || ""), xPos + colWidths[2]/2, yPos + 5, { align: "center" });
       xPos += colWidths[2];
       // Class
       doc.line(xPos, yPos, xPos, yPos + 8);
       doc.text(String(student.class || ""), xPos + colWidths[3]/2, yPos + 5, { align: "center" });
       xPos += colWidths[3];
       // Attendance data - Convert all numbers to strings
       const attendanceValues = [
         student.hadir || 0,
         student.sakit || 0,
         student.izin || 0,
         student.alpha || 0,
         student.total || 0
       ];
       attendanceValues.forEach((value, i) => {
         doc.line(xPos, yPos, xPos, yPos + 8);
         doc.text(String(value), xPos + colWidths[4 + i]/2, yPos + 5, { align: "center" });
         xPos += colWidths[4 + i];
       });
       yPos += 8;
     });
     // Add total row
     doc.setFillColor(220, 220, 220);
     doc.rect(margin, yPos, contentWidth, 8, "F");
     doc.rect(margin, yPos, contentWidth, 8, "S");
     doc.setFont("helvetica", "bold");
     const totalHadir = students.reduce((sum, student) => sum + (student.hadir || 0), 0);
     const totalSakit = students.reduce((sum, student) => sum + (student.sakit || 0), 0);
     const totalIzin = students.reduce((sum, student) => sum + (student.izin || 0), 0);
     const totalAlpha = students.reduce((sum, student) => sum + (student.alpha || 0), 0);
     const grandTotal = totalHadir + totalSakit + totalIzin + totalAlpha;
     xPos = margin;
     doc.text("TOTAL", xPos + (colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3])/2, yPos + 5, { align: "center" });
     xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
     // Convert all totals to strings
     const totalValues = [totalHadir, totalSakit, totalIzin, totalAlpha, grandTotal];
     totalValues.forEach((value, i) => {
       doc.line(xPos, yPos, xPos, yPos + 8);
       doc.text(String(value), xPos + colWidths[4 + i]/2, yPos + 5, { align: "center" });
       xPos += colWidths[4 + i];
     });
     yPos += 15;
     // Add footer with signature section
     const currentDate = format(new Date(), "d MMMM yyyy", { locale: id });
     doc.setFont("helvetica", "normal");
     doc.setFontSize(10);
     const signatureWidth = (pageWidth - margin * 2) / 2;
     doc.text("Mengetahui", margin + signatureWidth * 0.25, yPos + 10, { align: "center" });
     doc.text("Administrator Sekolah", margin + signatureWidth * 1.75, yPos + 10, { align: "center" });
     doc.text("Kepala Sekolah,", margin + signatureWidth * 0.25, yPos + 16, { align: "center" });
     doc.text("Absensi Digital,", margin + signatureWidth * 1.75, yPos + 16, { align: "center" });
     doc.setFont("helvetica", "bold");
     doc.text(schoolInfo.principalName || "________________", margin + signatureWidth * 0.25, yPos + 35, { align: "center" });
     doc.text(".......................................", margin + signatureWidth * 1.75, yPos + 35, { align: "center" });
     doc.setFont("helvetica", "normal");
     doc.text(`NIP. ${schoolInfo.principalNip || "_______________"}`, margin + signatureWidth * 0.25, yPos + 41, { align: "center" });
     doc.text("NIP. _______________", margin + signatureWidth * 1.75, yPos + 41, { align: "center" });
     // Generate filename with current date
     const classLabel = selectedClass === "all" ? "Semua_Kelas" : selectedClass.replace(/\s+/g, '_');
     const fileName = `Laporan_Kehadiran_${classLabel}_${format(new Date(), "yyyyMMdd")}.pdf`;
     doc.save(fileName);
     toast.success(`Laporan ${selectedClass === "all" ? "Semua Kelas" : selectedClass} berhasil diunduh sebagai ${fileName}`);
   } catch (error) {
     console.error("Error generating PDF:", error);
     toast.error("Gagal mengunduh laporan PDF: " + error);
   } finally {
     setIsDownloading(false);
   }
 };
 // Generate and download Excel report
 const handleDownloadExcel = async () => {
   setIsDownloading(true);
   try {
     // Create worksheet data with school information
     const wsData = [
       [schoolInfo.name.toUpperCase()],
       [schoolInfo.address],
       [`NPSN: ${schoolInfo.npsn}`],
       [],
       ["REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK"],
       [`KELAS: ${selectedClass === "all" ? "SEMUA KELAS" : selectedClass.toUpperCase()}`],
       [`Periode: ${format(new Date(dateRange.start), "d MMMM yyyy", { locale: id })} - ${format(new Date(dateRange.end), "d MMMM yyyy", { locale: id })}`],
       [],
       ["No.", "Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"]
     ];
     // Add student data
     students.forEach((student, index) => {
       wsData.push([
         index + 1,
         student.name || "",
         student.nisn || "",
         student.class || "",
         student.hadir || 0,
         student.sakit || 0,
         student.izin || 0,
         student.alpha || 0,
         student.total || 0
       ]);
     });
     // Add total row
     const totalHadir = students.reduce((sum, student) => sum + (student.hadir || 0), 0);
     const totalSakit = students.reduce((sum, student) => sum + (student.sakit || 0), 0);
     const totalIzin = students.reduce((sum, student) => sum + (student.izin || 0), 0);
     const totalAlpha = students.reduce((sum, student) => sum + (student.alpha || 0), 0);
     const grandTotal = totalHadir + totalSakit + totalIzin + totalAlpha;
     wsData.push([
       "TOTAL", "", "", "", totalHadir, totalSakit, totalIzin, totalAlpha, grandTotal
     ]);
     // Add signature section
     wsData.push(
       [],
       [],
       [`${schoolInfo.address}, ${format(new Date(), "d MMMM yyyy", { locale: id })}`],
       [],
       ["Mengetahui,", "", "", "", "", "", "", "", "Administrator"],
       ["Kepala Sekolah", "", "", "", "", "", "", "", "Pengelola Data"],
       [],
       [],
       [schoolInfo.principalName || "________________", "", "", "", "", "", "", "", "Administrator"],
       [`NIP. ${schoolInfo.principalNip || "_______________"}`, "", "", "", "", "", "", "", "NIP. _______________"]
     );
     // Create workbook and add worksheet
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.aoa_to_sheet(wsData);
     // Set column widths
     const colWidths = [
       { wch: 5 },  // No
       { wch: 30 }, // Nama Siswa
       { wch: 15 }, // NISN
       { wch: 10 }, // Kelas
       { wch: 8 },  // Hadir
       { wch: 8 },  // Sakit
       { wch: 8 },  // Izin
       { wch: 8 },  // Alpha
       { wch: 8 }   // Total
     ];
     ws['!cols'] = colWidths;
     // Add worksheet to workbook
     XLSX.utils.book_append_sheet(wb, ws, "Laporan Kehadiran");
     // Generate filename with current date
     const classLabel = selectedClass === "all" ? "Semua_Kelas" : selectedClass.replace(/\s+/g, '_');
     const fileName = `Laporan_Kehadiran_${classLabel}_${format(new Date(), "yyyyMMdd")}.xlsx`;
     XLSX.writeFile(wb, fileName);
     toast.success(`Laporan ${selectedClass === "all" ? "Semua Kelas" : selectedClass} berhasil diunduh sebagai ${fileName}`);
   } catch (error) {
     console.error("Error generating Excel:", error);
     toast.error("Gagal mengunduh laporan Excel");
   } finally {
     setIsDownloading(false);
   }
 };
 return (
   <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
     <div className="flex items-center mb-6">
       <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
         <ArrowLeft size={20} />
       </Link>
       <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Laporan Absen Rombel</h1>
     </div>
     {/* Filters and Date Range */}
     <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
       <h2 className="text-lg font-semibold mb-4 flex items-center">
         <Filter className="h-5 w-5 mr-2" />
         Filter Data
       </h2>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
         {/* Class Filter */}
         <div>
           <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
             Filter Kelas
           </label>
           <div className="relative">
             <select
               id="classFilter"
               value={selectedClass}
               onChange={handleClassChange}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
             >
               <option value="all">Semua Kelas</option>
               {classes.map((className) => (
                 <option key={className} value={className}>
                   {className}
                 </option>
               ))}
             </select>
             <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
           </div>
         </div>
         {/* Date Range */}
         <div>
           <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
             Tanggal Mulai
           </label>
           <input
             type="date"
             id="start"
             name="start"
             value={dateRange.start}
             onChange={handleDateChange}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
           />
         </div>
         <div>
           <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
             Tanggal Akhir
           </label>
           <input
             type="date"
             id="end"
             name="end"
             value={dateRange.end}
             onChange={handleDateChange}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
           />
         </div>
       </div>
       {/* Filter Summary */}
       <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
         <p className="text-sm text-blue-800">
           <strong>Filter Aktif:</strong>
           {selectedClass === "all" ? " Semua Kelas" : ` Kelas ${selectedClass}`} |
           Periode: {format(new Date(dateRange.start), "d MMM yyyy", { locale: id })} - {format(new Date(dateRange.end), "d MMM yyyy", { locale: id })} |
           Total Siswa: {students.length}
         </p>
       </div>
     </div>
     {/* School Information and Table */}
     <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
       <div className="text-center mb-4 sm:mb-3">
         <h2 className="text-gray-700 sm:text-xl font-bold uppercase">{schoolInfo.name}</h2>
         <p className="text-gray-700 text-sm sm:text-base font-bold">{schoolInfo.address}</p>
         <p className="text-gray-700 text-sm sm:text-base font-bold">NPSN {schoolInfo.npsn}</p>
       </div>
       <hr className="border-t border-gray-800 mt-1 mb-6" />
       <div className="text-center mb-4 sm:mb-6">
         <h3 className="text-base sm:text-lg font-bold text-gray-600 uppercase">REKAP LAPORAN KEHADIRAN SISWA</h3>
         <p className="text-sm text-gray-600 font-medium">
           KELAS {selectedClass === "all" ? "SEMUA KELAS" : selectedClass.toUpperCase()}
         </p>
         <p className="text-xs sm:text-sm text-gray-600 mt-1">
           Periode {format(new Date(dateRange.start), "d MMMM yyyy", { locale: id })} - {format(new Date(dateRange.end), "d MMMM yyyy", { locale: id })}
         </p>
       </div>
       {loading ? (
         <div className="flex justify-center items-center h-64">
           <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
         </div>
       ) : students.length > 0 ? (
         <div className="overflow-x-auto -mx-4 sm:mx-0">
           <div className="inline-block min-w-full align-middle">
             <div className="overflow-hidden">
               <table className="min-w-full bg-white border border-gray-300">
                 <thead className="bg-green-100 border-b-2 border-green-200">
                   <tr>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">NO.</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-left font-bold text-xs sm:text-sm">NAMA SISWA</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">NISN</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">KELAS</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">HADIR</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">SAKIT</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">IZIN</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">ALPHA</th>
                     <th className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm">TOTAL</th>
                   </tr>
                 </thead>
                 <tbody>
                   {students.map((student, index) => (
                     <tr key={student.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">{index + 1}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">{student.name}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">{student.nisn}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-medium">{student.class}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-green-600">{student.hadir}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-orange-600">{student.sakit}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-blue-600">{student.izin}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-red-600">{student.alpha}</td>
                       <td className="text-gray-700 border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-bold">{student.total}</td>
                     </tr>
                   ))}
                   {/* Total Row */}
                   <tr className="bg-gray-200 border-t-2 border-gray-400 font-bold">
                     <td colSpan={4} className="text-gray-800 border border-gray-300 px-2 sm:px-4 py-3 text-center text-sm font-bold">TOTAL</td>
                     <td className="text-gray-800 border border-gray-300 px-2 sm:px-4 py-3 text-center text-sm font-bold text-green-700">
                       {students.reduce((sum, student) => sum + (student.hadir || 0), 0)}
                     </td>
                     <td className="text-gray-800 border border-gray-300 px-2 sm:px-4 py-3 text-center text-sm font-bold text-orange-700">
                       {students.reduce((sum, student) => sum + (student.sakit || 0), 0)}
                     </td>
                     <td className="text-gray-800 border border-gray-300 px-2 sm:px-4 py-3 text-center text-sm font-bold text-blue-700">
                       {students.reduce((sum, student) => sum + (student.izin || 0), 0)}
                     </td>
                     <td className="text-gray-800 border border-gray-300 px-2 sm:px-4 py-3 text-center text-sm font-bold text-red-700">
                       {students.reduce((sum, student) => sum + (student.alpha || 0), 0)}
                     </td>
                     <td className="text-gray-800 border border-gray-300 px-2 sm:px-4 py-3 text-center text-sm font-bold">
                       {students.reduce((sum, student) => sum + (student.total || 0), 0)}
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
         </div>
       ) : (
         <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
           <div className="text-gray-400 mb-3">
             <FileText className="h-12 w-12 mx-auto" />
           </div>
           <p className="text-gray-600 font-medium">Tidak ada data yang ditemukan</p>
           <p className="text-gray-500 text-sm mt-1">
             Coba ubah filter kelas atau rentang tanggal
           </p>
         </div>
       )}
     </div>
     {/* Download Buttons */}
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 pb-20 sm:pb-0">
       <button target="_blank"
         onClick={handleDownloadPDF}
         disabled={isDownloading || students.length === 0}
         className="flex items-center justify-center gap-2 sm:gap-3 bg-red-600 text-white p-3 sm:p-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
       >
         {isDownloading ? (
           <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
         ) : (
           <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
         )}
         <span className="font-medium text-sm sm:text-base">Download Laporan PDF</span>
       </button>
       <button
         onClick={handleDownloadExcel}
         disabled={isDownloading || students.length === 0}
         className="flex items-center justify-center gap-2 sm:gap-3 bg-green-600 text-white p-3 sm:p-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
       >
         {isDownloading ? (
           <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
         ) : (
           <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6" />
         )}
         <span className="font-medium text-sm sm:text-base">Download Laporan Excel</span>
       </button>
     </div>
   </div>
 );
}
