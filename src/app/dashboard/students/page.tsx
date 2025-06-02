"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { readDocuments, deleteDocument } from "@/lib/firestore";
import { where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Search, Plus, QrCode, ExternalLink, Filter, Upload, AlertTriangle, Trash2, Edit, Users } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import dynamic from 'next/dynamic';
const ConfirmDialog = dynamic(() => import('@/components/ConfirmDialog'), {
  ssr: false
});
interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  gender: string;
  photoUrl: string;
}
export default function Students() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);
  const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId) return;
      try {
        const {
          studentApi
        } = await import('@/lib/api');
        const fetchedStudents = (await studentApi.getAll(schoolId)) as Student[];
        const fetchedClasses = new Set<string>();
        fetchedStudents.forEach(student => {
          fetchedClasses.add(student.class);
        });

        // Map to ensure all students have the required fields
        const normalizedStudents = fetchedStudents.map(student => ({
          ...student,
          photoUrl: student.photoUrl || "/placeholder-student.jpg"
        }));
        setStudents(normalizedStudents);
        setClasses(Array.from(fetchedClasses).sort());
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [schoolId]);

  // Function to delete a student
  const handleDeleteStudent = async (studentId: string) => {
    if (!schoolId) return;
    setStudentToDelete(null);
    setDeleteDialogOpen(false);
    try {
      const {
        studentApi
      } = await import('@/lib/api');
      await studentApi.delete(schoolId, studentId);

      // Update the local state to remove the deleted student
      setStudents(students.filter(student => student.id !== studentId));

      // Show confirmation toast
      toast.success("Data siswa berhasil dihapus");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Gagal menghapus data siswa");
    }
  };
  const openDeleteDialog = (studentId: string) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };
  const filteredStudents = students.filter(student => {
    // Filter by class
    if (selectedClass !== "all" && student.class !== selectedClass) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.nisn.includes(searchQuery);
    }
    return true;
  });

  // Loading state removed

  return <div className="pb-20 md:pb-6" data-unique-id="c20563f3-8eaa-488a-bbda-79c9e4ccf49c" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
      <div className="flex flex-col items-center mb-6" data-unique-id="0d926799-e6cd-4f10-a287-9468b5e133a9" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
        <div className="flex flex-col md:flex-row md:justify-center md:items-center w-full" data-unique-id="54671aff-1748-4927-8e56-991e46475dea" data-file-name="app/dashboard/students/page.tsx">
          <div className="flex items-center justify-center mb-3" data-unique-id="165be3ff-ec10-476d-ab1d-a69ba675487c" data-file-name="app/dashboard/students/page.tsx">
            <Users className="h-7 w-7 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-gray-800 text-center" data-unique-id="be74e0e5-5c7f-4938-be96-f976320b0677" data-file-name="app/dashboard/students/page.tsx"><span className="editable-text" data-unique-id="8b1e2007-72ac-4a63-8b81-40a830b0ec83" data-file-name="app/dashboard/students/page.tsx">DAFTAR PESERTA DIDIK</span></h1>
          </div>
        </div>
        {userRole === 'admin' && <div className="flex flex-col sm:flex-row gap-2" data-unique-id="f249ff0e-552b-4cd4-9176-499031a34574" data-file-name="app/dashboard/students/page.tsx">
            <Link href="/dashboard/students/add" className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors shadow-sm text-sm w-full sm:w-auto" data-unique-id="e3bd42d3-f0a3-4947-a889-9eb5b7f4bf2a" data-file-name="app/dashboard/students/page.tsx">
              <Plus size={16} /><span className="editable-text" data-unique-id="a5f1ac99-bd84-4db4-9633-be4a7bf04add" data-file-name="app/dashboard/students/page.tsx">
              Tambah Data Siswa
            </span></Link>
          </div>}
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-5 mb-4 sm:mb-6" data-unique-id="c56c6ee6-7c4b-442f-9661-041faba11964" data-file-name="app/dashboard/students/page.tsx">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:gap-4" data-unique-id="7e1dc086-d19e-475b-9571-76a880929399" data-file-name="app/dashboard/students/page.tsx">
          <div className="flex-1" data-unique-id="79ad270a-2c4c-48ee-9136-6dfd0ac3c2f8" data-file-name="app/dashboard/students/page.tsx">
            <div className="relative" data-unique-id="2a6a13a2-c0b9-4174-aae0-54ead28b4009" data-file-name="app/dashboard/students/page.tsx">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Cari nama atau NISN siswa..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} data-unique-id="1d677364-5753-4b7c-8cce-fe0c14d2a16f" data-file-name="app/dashboard/students/page.tsx" />
            </div>
          </div>
          
          <div className="md:w-72" data-unique-id="9602eca9-aa93-4cb9-a2bb-5ff25a4dddcb" data-file-name="app/dashboard/students/page.tsx">
            <div className="relative" data-unique-id="9cf1a85e-457b-48ce-bcfc-cfb974a88ad1" data-file-name="app/dashboard/students/page.tsx">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} data-unique-id="e183b770-5bd6-4543-a56b-b502e568e6d5" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
                <option value="all" data-unique-id="61019c5b-9008-46cd-8554-998e2ed8dfec" data-file-name="app/dashboard/students/page.tsx"><span className="editable-text" data-unique-id="594f587f-ea40-405c-b6ff-17c365cd272f" data-file-name="app/dashboard/students/page.tsx">Semua Kelas</span></option>
                {classes.map(className => <option key={className} value={className} data-is-mapped="true" data-unique-id="70a9a7ce-3d03-465c-a2bd-bc74ffc83955" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true"><span className="editable-text" data-is-mapped="true" data-unique-id="e97b4990-2a62-4688-899d-741b982c63e2" data-file-name="app/dashboard/students/page.tsx">
                    </span>{className}
                  </option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Students Grid */}
      {filteredStudents.length > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 md:gap-6" data-unique-id="0c6f5688-2fbf-4807-a7d1-3ec37fcea39d" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
          {filteredStudents.map((student, index) => {
        // Create an array of gradient backgrounds
        const gradients = ["bg-gradient-to-r from-blue-50 to-indigo-100", "bg-gradient-to-r from-green-50 to-emerald-100", "bg-gradient-to-r from-purple-50 to-violet-100", "bg-gradient-to-r from-pink-50 to-rose-100", "bg-gradient-to-r from-yellow-50 to-amber-100", "bg-gradient-to-r from-cyan-50 to-sky-100"];

        // Select a gradient based on the index
        const gradientClass = gradients[index % gradients.length];
        return <div key={student.id} className={`${gradientClass} rounded-xl shadow-sm overflow-hidden`} data-is-mapped="true" data-unique-id="019d1b91-185e-4a3f-9111-adc491f82fd0" data-file-name="app/dashboard/students/page.tsx">
                <div className="p-4" data-is-mapped="true" data-unique-id="8f464c4c-f068-4f85-ba62-4b217752dea7" data-file-name="app/dashboard/students/page.tsx">
                  <div data-is-mapped="true" data-unique-id="10d19d88-1fcd-421d-981f-fcb5d9e8ea45" data-file-name="app/dashboard/students/page.tsx">
                    <h3 className="font-semibold text-sm" data-is-mapped="true" data-unique-id="e9db9a42-7966-4229-9c76-73c3b41bfee9" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">{student.name}</h3>
                    <p className="text-gray-500 text-xs" data-is-mapped="true" data-unique-id="b2f0cbbe-3f43-4dde-b12e-4efe9de8e748" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true"><span className="editable-text" data-is-mapped="true" data-unique-id="49b64ab6-6d68-4446-a15c-4396019ae3fe" data-file-name="app/dashboard/students/page.tsx">NISN: </span>{student.nisn}</p>
                    <div className="flex items-center mt-1" data-is-mapped="true" data-unique-id="ec2e597b-cba6-42df-b49a-5cd832166006" data-file-name="app/dashboard/students/page.tsx">
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded" data-is-mapped="true" data-unique-id="1c8af96e-cb06-4ba0-8005-c718c725cb60" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true"><span className="editable-text" data-is-mapped="true" data-unique-id="d66d62c6-8f7a-4e36-bfff-7a0cf050bbb4" data-file-name="app/dashboard/students/page.tsx">
                        Kelas </span>{student.class}
                      </span>
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded ml-2" data-is-mapped="true" data-unique-id="3449b3d6-f249-483f-afd1-b42d16937913" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
                        {student.gender === "male" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3" data-is-mapped="true" data-unique-id="9944d0ff-2989-4e62-988a-ad2e5c3baac0" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
                    <Link href={`/dashboard/students/${student.id}`} className="p-1.5 text-blue-600 rounded hover:bg-blue-100 hover:bg-opacity-20" title="Detail Siswa" data-is-mapped="true" data-unique-id="7ce66672-333a-4eae-86e3-1a81468828bb" data-file-name="app/dashboard/students/page.tsx">
                      <ExternalLink size={16} data-unique-id="e5c13620-6b1a-4a2d-af52-5d719f6b8278" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true" />
                    </Link>
                    <Link href={`/dashboard/students/edit/${student.id}`} className="p-1.5 text-green-600 rounded hover:bg-green-100 hover:bg-opacity-20" title="Edit Data Siswa" data-is-mapped="true" data-unique-id="0b7bb5c3-4375-4c80-8a55-1be86058fa1f" data-file-name="app/dashboard/students/page.tsx">
                      <Edit size={16} data-unique-id="37b30a6b-a5a5-4d1f-9d9e-d70af4a31eea" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true" />
                    </Link>
                    {userRole === 'admin' && <button onClick={() => openDeleteDialog(student.id)} className="p-1.5 text-red-600 rounded hover:bg-red-100 hover:bg-opacity-20" title="Hapus Siswa" data-is-mapped="true" data-unique-id="c517caa7-0ab7-4fc9-8119-e8708bb56bb9" data-file-name="app/dashboard/students/page.tsx">
                        <Trash2 size={16} data-unique-id="a995a157-c3ab-4c69-bead-a8dc86cc3920" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true" />
                      </button>}
                  </div>
                </div>
              </div>;
      })}
        </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="daa57a51-2e9e-45c2-ab33-42e4604acde0" data-file-name="app/dashboard/students/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="31ef2ebd-8de9-4d4c-aa93-ebc4bfe80af0" data-file-name="app/dashboard/students/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="74f46f9a-0556-4c18-93b8-3270aa008f76" data-file-name="app/dashboard/students/page.tsx">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4" data-unique-id="1dacfb40-de67-40f7-a9e4-a581a3d17636" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
              {searchQuery || selectedClass !== "all" ? "Tidak ada siswa yang sesuai dengan pencarian atau filter" : "Belum ada data."}
            </p>
            <Link href="/dashboard/students/add" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors" data-unique-id="2e7e1f9e-b006-4a4c-90dd-d70a243da2e6" data-file-name="app/dashboard/students/page.tsx"><span className="editable-text" data-unique-id="180e4df7-1403-4946-bdcf-7d3070a7db82" data-file-name="app/dashboard/students/page.tsx">
              Tambah Data Siswa
            </span></Link>
          </div>
        </div>}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog isOpen={deleteDialogOpen} title="Konfirmasi Hapus Data" message="Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan." confirmLabel="Hapus" cancelLabel="Batal" confirmColor="bg-red-500 hover:bg-red-600" onConfirm={() => studentToDelete && handleDeleteStudent(studentToDelete)} onCancel={() => setDeleteDialogOpen(false)} icon={<AlertTriangle size={20} className="text-red-500" />} />
    </div>;
}
