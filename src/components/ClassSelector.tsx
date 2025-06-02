"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookOpen, Loader2, Plus } from "lucide-react";
import Link from "next/link";
interface ClassData {
 id: string;
 name: string;
 level: string;
 teacherName: string;
}
interface ClassSelectorProps {
 schoolId: string | null;
 value: string;
 onChange: (value: string) => void;
 placeholder?: string;
 required?: boolean;
 disabled?: boolean;
 showAddClassLink?: boolean;
}
export default function ClassSelector({
 schoolId,
 value,
 onChange,
 placeholder = "Pilih Kelas",
 required = false,
 disabled = false,
 showAddClassLink = true
}: ClassSelectorProps) {
 const [classes, setClasses] = useState<ClassData[]>([]);
 const [loading, setLoading] = useState(true);
 useEffect(() => {
   const fetchClasses = async () => {
     if (!schoolId) return;

     try {
       setLoading(true);
       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const classesQuery = query(classesRef, orderBy('level'), orderBy('name'));
       const snapshot = await getDocs(classesQuery);

       const fetchedClasses: ClassData[] = [];
       snapshot.forEach(doc => {
         fetchedClasses.push({
           id: doc.id,
           ...doc.data()
         } as ClassData);
       });

       setClasses(fetchedClasses);
     } catch (error) {
       console.error("Error fetching classes:", error);
     } finally {
       setLoading(false);
     }
   };
   fetchClasses();
 }, [schoolId]);
 return (
   <div>
     <div className="relative">
       <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
       <select
         value={value}
         onChange={(e) => onChange(e.target.value)}
         className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white appearance-none"
         required={required}
         disabled={disabled || loading}
       >
         <option value="" disabled>
           {loading ? "Memuat kelas..." : placeholder}
         </option>
         {classes.map((classItem) => (
           <option key={classItem.id} value={classItem.name}>
             {classItem.name} - {classItem.teacherName}
           </option>
         ))}
       </select>
       {loading && (
         <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
       )}
     </div>

     {classes.length === 0 && !loading && showAddClassLink && (
       <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
         <div className="flex items-center justify-between">
           <div className="flex items-center">
             <BookOpen size={16} className="text-amber-600 mr-2" />
             <p className="text-sm text-amber-700">
               Belum ada kelas tersedia
             </p>
           </div>
           <Link
             href="/dashboard/classes"
             className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
           >
             <Plus size={14} />
             Tambah Kelas
           </Link>
         </div>
       </div>
     )}
   </div>
 );
}