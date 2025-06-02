"use client";

import React, { useState, useEffect } from "react";
import { Bell, Save, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export default function AnnouncementForm() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    isActive: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const {
        collection,
        getDocs,
        orderBy,
        query
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      const announcementsRef = collection(db, "announcements");
      const q = query(announcementsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const announcementsList: Announcement[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        announcementsList.push({
          id: doc.id,
          title: data.title || "",
          message: data.message || "",
          isActive: data.isActive !== false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
        });
      });
      setAnnouncements(announcementsList);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Gagal memuat pengumuman");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Judul dan pesan pengumuman harus diisi");
      return;
    }
    try {
      setSaving(true);
      const {
        collection,
        addDoc,
        doc,
        updateDoc,
        serverTimestamp
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      if (editingId) {
        // Update existing announcement
        await updateDoc(doc(db, "announcements", editingId), {
          title: formData.title,
          message: formData.message,
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        });
        setAnnouncements(prev => prev.map(ann => ann.id === editingId ? {
          ...ann,
          ...formData,
          updatedAt: new Date()
        } : ann));
        toast.success("Pengumuman berhasil diperbarui");
        setEditingId(null);
      } else {
        // Create new announcement
        const docRef = await addDoc(collection(db, "announcements"), {
          title: formData.title,
          message: formData.message,
          isActive: formData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        const newAnnouncement: Announcement = {
          id: docRef.id,
          title: formData.title,
          message: formData.message,
          isActive: formData.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        toast.success("Pengumuman berhasil ditambahkan");
      }

      // Reset form
      setFormData({
        title: "",
        message: "",
        isActive: true
      });
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Gagal menyimpan pengumuman");
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      isActive: announcement.isActive
    });
    setEditingId(announcement.id);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      const {
        doc,
        deleteDoc
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      toast.success("Pengumuman berhasil dihapus");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Gagal menghapus pengumuman");
    }
  };
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const {
        doc,
        updateDoc
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      await updateDoc(doc(db, "announcements", id), {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      setAnnouncements(prev => prev.map(ann => ann.id === id ? {
        ...ann,
        isActive: !currentStatus
      } : ann));
      toast.success(`Pengumuman berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      console.error("Error toggling announcement status:", error);
      toast.error("Gagal mengubah status pengumuman");
    }
  };
  return <div className="space-y-6" data-unique-id="c71dd06f-f8c5-42f1-8185-4845f1b91f78" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="5f66853a-4828-4ab7-b0fc-badf859a2868" data-file-name="components/AnnouncementForm.tsx">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4" data-unique-id="30f38a6b-1923-4dbb-95ae-cfe6432733ee" data-file-name="components/AnnouncementForm.tsx">
          <div className="flex items-center space-x-3" data-unique-id="3d68de48-54c3-42e9-bb68-4e7f13332324" data-file-name="components/AnnouncementForm.tsx">
            <Bell className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white" data-unique-id="eb24b52c-b7e6-483d-a1f9-d42f936e6523" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
              {editingId ? "Edit Pengumuman" : "Buat Pengumuman"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-unique-id="634dac86-fc6e-43c6-8953-8619c607d981" data-file-name="components/AnnouncementForm.tsx">
          <div data-unique-id="764ece0a-52f5-4a47-a833-09cf7febc23e" data-file-name="components/AnnouncementForm.tsx">
            <label className="block text-sm font-medium text-gray-700 mb-2" data-unique-id="68f976d3-fb77-4f3f-9798-3e981e38da9b" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="8f24f298-4555-4c7e-bd8e-421597e6d411" data-file-name="components/AnnouncementForm.tsx">
              Judul Pengumuman
            </span></label>
            <input type="text" value={formData.title} onChange={e => setFormData(prev => ({
            ...prev,
            title: e.target.value
          }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Masukkan judul pengumuman..." required data-unique-id="fc3811f3-a1e2-4ad5-a399-a340948461e3" data-file-name="components/AnnouncementForm.tsx" />
          </div>

          <div data-unique-id="3f3621ed-18b7-4998-8651-c3727f0cf119" data-file-name="components/AnnouncementForm.tsx">
            <label className="block text-sm font-medium text-gray-700 mb-2" data-unique-id="aacc63e1-6fff-4130-9eb4-b42bbf52cd0c" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="281a49bf-068a-4a4f-9a6b-d720088acecc" data-file-name="components/AnnouncementForm.tsx">
              Pesan Pengumuman
            </span></label>
            <textarea value={formData.message} onChange={e => setFormData(prev => ({
            ...prev,
            message: e.target.value
          }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Masukkan pesan pengumuman..." required data-unique-id="f312bb7d-8571-4c80-a964-8cea29fdf4f4" data-file-name="components/AnnouncementForm.tsx" />
          </div>

          <div className="flex items-center" data-unique-id="45b87f8c-af54-45b2-a9bd-ba4ff9f493b2" data-file-name="components/AnnouncementForm.tsx">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData(prev => ({
            ...prev,
            isActive: e.target.checked
          }))} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" data-unique-id="afb9f5c4-0af4-43b4-b630-dbd45c5ca8ab" data-file-name="components/AnnouncementForm.tsx" />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700" data-unique-id="21595e52-4d4d-4c1b-b01d-a6324d1ea72a" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="59014410-27c6-4c8a-b6d2-8932fa763174" data-file-name="components/AnnouncementForm.tsx">
              Aktifkan pengumuman
            </span></label>
          </div>

          <div className="flex space-x-3" data-unique-id="e127e42f-5a1b-4b83-9ba1-ed909d9077dc" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" data-unique-id="81185eb9-ec4f-4e6c-8014-86117ac73ba2" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" data-unique-id="f60ea551-157b-494b-a445-98f286512903" data-file-name="components/AnnouncementForm.tsx"></div> : <Save className="h-4 w-4" />}
              <span data-unique-id="70f025e9-4ca6-4209-977f-67b1cecedb0d" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">{saving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}</span>
            </button>
            
            {editingId && <button type="button" onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              message: "",
              isActive: true
            });
          }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" data-unique-id="35cacbaf-300d-4da3-8320-625b5b6359bd" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="10ae9cbb-77aa-4faa-a3bd-fa1532615d7c" data-file-name="components/AnnouncementForm.tsx">
                Batal
              </span></button>}
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="8f025ccc-da74-497c-89b4-97362f8d6923" data-file-name="components/AnnouncementForm.tsx">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4" data-unique-id="7840b758-df15-471d-8598-89bd5adab473" data-file-name="components/AnnouncementForm.tsx">
          <h3 className="text-lg font-semibold text-white" data-unique-id="6662b6b1-a199-478b-9c22-343dacd5726a" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="0dcfbef0-c048-4ac1-a75c-12d2c69489b0" data-file-name="components/AnnouncementForm.tsx">Daftar Pengumuman</span></h3>
        </div>

        <div className="divide-y divide-gray-200" data-unique-id="8ad75e3f-42e2-4ed5-be47-7f71aba80bd9" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
          {loading ? <div className="p-6" data-unique-id="c5d3af40-404b-4a00-b52e-1f46cf0d7afb" data-file-name="components/AnnouncementForm.tsx">
              <div className="animate-pulse space-y-4" data-unique-id="8bef9649-cfce-4579-9cb7-9119e8a8c159" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded" data-unique-id="5ae96d04-8b74-437a-b121-81c255d4aeb6" data-file-name="components/AnnouncementForm.tsx"></div>)}
              </div>
            </div> : announcements.length > 0 ? announcements.map((announcement, index) => <motion.div key={announcement.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="p-6 hover:bg-gray-50" data-unique-id="b0c70b36-dae3-4d13-be68-a81c2747a1ba" data-file-name="components/AnnouncementForm.tsx">
                <div className="flex items-start justify-between" data-unique-id="d6b2d71a-d372-4618-92c0-35be46c1ace6" data-file-name="components/AnnouncementForm.tsx">
                  <div className="flex-1" data-unique-id="05606344-44e1-4088-aa1f-2f7c5267131a" data-file-name="components/AnnouncementForm.tsx">
                    <div className="flex items-center space-x-2 mb-2" data-unique-id="9eb9f555-d548-40a1-b845-75ac634d48f6" data-file-name="components/AnnouncementForm.tsx">
                      <h4 className="font-medium text-gray-900" data-unique-id="d00d8538-ce1d-4d91-92d8-eda7a4d231c9" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">{announcement.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`} data-unique-id="d0597fac-f728-4b70-85d3-541c0d9dcb39" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">
                        {announcement.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2" data-unique-id="0fdfbb78-bb01-4cda-8b81-ce0286cf6cf7" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true">{announcement.message}</p>
                    <p className="text-xs text-gray-400" data-unique-id="d9571295-ad88-42b3-a76b-edc39a4e994d" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="4cee38ff-689b-4cfc-b893-b21fa9e8c53b" data-file-name="components/AnnouncementForm.tsx">
                      Dibuat: </span>{announcement.createdAt.toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4" data-unique-id="4b0cc5f1-01ad-4daa-8dfd-1606beb23f9f" data-file-name="components/AnnouncementForm.tsx">
                    <button onClick={() => toggleStatus(announcement.id, announcement.isActive)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={announcement.isActive ? "Nonaktifkan" : "Aktifkan"} data-unique-id="b29c3818-47e6-44ad-bc61-203e7e10a27e" data-file-name="components/AnnouncementForm.tsx">
                      <Bell className="h-4 w-4" data-unique-id="47a28fa8-f1a0-4b8e-8c89-323377e9adb9" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true" />
                    </button>
                    <button onClick={() => handleEdit(announcement)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit" data-unique-id="d59be3c4-dfc8-4f7f-aa60-495b7845852f" data-file-name="components/AnnouncementForm.tsx">
                      <Edit className="h-4 w-4" data-unique-id="1573d985-15c2-4e9e-9e98-338d56743071" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true" />
                    </button>
                    <button onClick={() => handleDelete(announcement.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus" data-unique-id="7a9c108f-5b42-46fd-942a-d7e7b0ef4fc8" data-file-name="components/AnnouncementForm.tsx">
                      <Trash2 className="h-4 w-4" data-unique-id="642cf177-a0b9-4a91-932e-7d9e92f94b24" data-file-name="components/AnnouncementForm.tsx" data-dynamic-text="true" />
                    </button>
                  </div>
                </div>
              </motion.div>) : <div className="p-12 text-center text-gray-500" data-unique-id="25d1414c-433f-4415-b929-adb3209ce04b" data-file-name="components/AnnouncementForm.tsx">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium" data-unique-id="220121f7-600a-40d4-b6f6-47f63d1add58" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="776bbbc6-d910-4a7b-a9c6-71e90e8665ae" data-file-name="components/AnnouncementForm.tsx">Belum ada pengumuman</span></p>
              <p className="text-sm" data-unique-id="df4751bf-ca17-49fc-854a-8f2dcc5fb6bc" data-file-name="components/AnnouncementForm.tsx"><span className="editable-text" data-unique-id="84122d65-72b6-4fd7-b226-be5646e492a7" data-file-name="components/AnnouncementForm.tsx">Buat pengumuman pertama menggunakan form di atas</span></p>
            </div>}
        </div>
      </div>
    </div>;
}