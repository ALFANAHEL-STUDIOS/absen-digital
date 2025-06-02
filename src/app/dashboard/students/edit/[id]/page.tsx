"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { User, Hash, Calendar, MapPin, Phone, Save, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
interface ClassData {
 id: string;
 name: string;
 level: string;
 teacherName: string;
}
interface StudentData {
 name: string;
 nisn: string;
 class: string;
 gender: string;
 birthPlace: string;
 birthDate: string;
 telegramNumber: string;
}
export default function EditStudent({ params }: { params: { id: string } }) {
 const { schoolId } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [loadingClasses, setLoadingClasses] = useState(true);
 const [classes, setClasses] = useState<ClassData[]>([]);
 const [studentData, setStudentData] = useState<StudentData>({
   name: "",
   nisn: "",
   class: "",
   gender: "male",
   birthPlace: "",
   birthDate: "",
   telegramNumber: ""
 });
 // Fetch student data and classes
 useEffect(() => {
   const fetchData = async () => {
     if (!schoolId || !params.id) return;
     try {
       setLoading(true);

       // Fetch student data
       const studentDoc = await getDoc(doc(db, `schools/${schoolId}/students`, params.id));
       if (studentDoc.exists()) {
         const data = studentDoc.data();
         setStudentData({
           name: data.name || "",
           nisn: data.nisn || "",
           class: data.class || "",
           gender: data.gender || "male",
           birthPlace: data.birthPlace || "",
           birthDate: data.birthDate || "",
           telegramNumber: data.telegramNumber || ""
         });
       } else {
         toast.error("Data siswa tidak ditemukan");
         router.push('/dashboard/students');
         return;
       }
       // Fetch classes
       setLoadingClasses(true);
       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const classesQuery = query(classesRef, orderBy('level'), orderBy('name'));
       const classesSnapshot = await getDocs(classesQuery);

       const fetchedClasses: ClassData[] = [];
       classesSnapshot.forEach(doc => {
         fetchedClasses.push({
           id: doc.id,
           ...doc.data()
         } as ClassData);
       });

       setClasses(fetchedClasses);

     } catch (error) {
       console.error("Error fetching data:", error);
       toast.error("Gagal mengambil data");
     } finally {
       setLoading(false);
       setLoadingClasses(false);
     }
   };
   fetchData();
 }, [schoolId, params.id, router]);
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   const { name, value } = e.target;
   setStudentData(prev => ({
     ...prev,
     [name]: value
   }));
 };
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!schoolId || !params.id) {
     toast.error("Tidak dapat mengakses data sekolah");
     return;
   }
   try {
     setSaving(true);

     await updateDoc(doc(db, `schools/${schoolId}/students`, params.id), {
       ...studentData,
       updatedAt: new Date()
     });
     toast.success("Data siswa berhasil diperbarui");
     router.push('/dashboard/students');
   } catch (error) {
     console.error("Error updating student:", error);
     toast.error("Gagal memperbarui data siswa");
   } finally {
     setSaving(false);
   }
 };
 if (loading) {
   return (
     <div className="flex justify-center items-center h-64">
       <Loader2 className="h-12 w-12 text-primary animate-spin" />
     </div>
   );
 }
 return (
   <div className="w-full max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6">
     <div className="flex items-center mb-6">
       <Link href="/dashboard/students" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
         <ArrowLeft size={20} />
       </Link>
       <h1 className="text-2xl font-bold text-gray-800">Edit Data Siswa</h1>
     </div>

     <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
       <form onSubmit={handleSubmit}>
         <div className="space-y-6">

           {/* Student Information */}
           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6">
             <div>
               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                 Nama Lengkap
               </label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="text"
                   id="name"
                   name="name"
                   value={studentData.name}
                   onChange={handleChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                   placeholder="Nama lengkap siswa"
                   required
                 />
               </div>
             </div>

             <div>
               <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">
                 NISN
               </label>
               <div className="relative">
                 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="text"
                   id="nisn"
                   name="nisn"
                   value={studentData.nisn}
                   onChange={handleChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                   placeholder="Nomor NISN"
                   required
                 />
               </div>
             </div>

             <div>
               <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                 Kelas
               </label>
               <div className="relative">
                 <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <select
                   id="class"
                   name="class"
                   value={studentData.class}
                   onChange={handleChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white appearance-none"
                   required
                   disabled={loadingClasses}
                 >
                   <option value="" disabled>
                     {loadingClasses ? "Memuat kelas..." : "Pilih Kelas"}
                   </option>
                   {classes.map((classItem) => (
                     <option key={classItem.id} value={classItem.name}>
                       {classItem.name} - {classItem.teacherName}
                     </option>
                   ))}
                 </select>
                 {loadingClasses && (
                   <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
                 )}
               </div>
             </div>

             <div>
               <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                 Jenis Kelamin
               </label>
               <select
                 id="gender"
                 name="gender"
                 value={studentData.gender}
                 onChange={handleChange}
                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                 required
               >
                 <option value="male">Laki-laki</option>
                 <option value="female">Perempuan</option>
               </select>
             </div>

             <div>
               <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">
                 Tempat Lahir
               </label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="text"
                   id="birthPlace"
                   name="birthPlace"
                   value={studentData.birthPlace}
                   onChange={handleChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                   placeholder="Tempat lahir"
                   required
                 />
               </div>
             </div>

             <div>
               <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                 Tanggal Lahir
               </label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="date"
                   id="birthDate"
                   name="birthDate"
                   value={studentData.birthDate}
                   onChange={handleChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                   required
                 />
               </div>
             </div>

             <div>
               <label htmlFor="telegramNumber" className="block text-sm font-medium text-gray-700 mb-1">
                 Nomor Telegram
               </label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="text"
                   id="telegramNumber"
                   name="telegramNumber"
                   value={studentData.telegramNumber}
                   onChange={handleChange}
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                   placeholder="Nomor Telegram"
                   required
                 />
               </div>
             </div>
           </div>

           {/* QR Code Preview */}
           {studentData.nisn && (
             <div className="flex flex-col items-center pt-4 border-t border-gray-200">
               <h3 className="text-lg font-medium text-gray-700 mb-3">QR Code Siswa</h3>
               <div className="bg-white p-4 border border-gray-300 rounded-lg">
                 <QRCodeSVG value={studentData.nisn} size={150} level="H" includeMargin={true} />
               </div>
               <p className="text-sm text-gray-500 mt-2">QR Code dibuat berdasarkan NISN siswa.</p>
             </div>
           )}

           <div className="flex justify-end gap-3">
             <Link
               href="/dashboard/students"
               className="flex items-center gap-2 border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
             >
               Batal
             </Link>
             <button
               type="submit"
               disabled={saving}
               className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {saving ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
               ) : (
                 <Save size={20} />
               )}
               {saving ? "Menyimpan..." : "Perbarui Data"}
             </button>
           </div>
         </div>
       </form>
     </div>
   </div>
 );
}
