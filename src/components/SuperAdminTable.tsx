"use client";

import React, { useState, useEffect } from "react";
import { Users, Eye, EyeOff, Calendar, Settings, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
interface SchoolAccount {
  id: string;
  adminName: string;
  email: string;
  schoolName: string;
  isActive: boolean;
  expiryType: "1_day" | "1_week" | "1_month" | "forever";
  expiryDate: Date | null;
  createdAt: Date;
}
export default function SuperAdminTable() {
  const [accounts, setAccounts] = useState<SchoolAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  useEffect(() => {
    fetchSchoolAccounts();
  }, []);
  const fetchSchoolAccounts = async () => {
    try {
      setLoading(true);

      // Force auth token refresh before making requests
      const {
        auth
      } = await import('@/lib/firebase');
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        console.log('Token refreshed for user:', auth.currentUser.email);
      }

      // Fetch all schools and users data
      const {
        collection,
        getDocs,
        query,
        where
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');

      // Get all schools
      const schoolsRef = collection(db, "schools");
      const schoolsSnapshot = await getDocs(schoolsRef);

      // Get all admin users
      const usersRef = collection(db, "users");
      const adminsQuery = query(usersRef, where("role", "==", "admin"));
      const adminsSnapshot = await getDocs(adminsQuery);
      const schoolData = new Map();
      schoolsSnapshot.forEach(doc => {
        const data = doc.data();
        schoolData.set(doc.id, {
          id: doc.id,
          name: data.name || "Nama Sekolah",
          ...data
        });
      });
      const accountsList: SchoolAccount[] = [];
      adminsSnapshot.forEach(doc => {
        const userData = doc.data();
        const school = schoolData.get(userData.schoolId);
        if (school) {
          accountsList.push({
            id: doc.id,
            adminName: userData.name || "Admin",
            email: userData.email || "",
            schoolName: school.name,
            isActive: userData.isActive !== false,
            // Default to true if not set
            expiryType: userData.expiryType || "1_month",
            expiryDate: userData.expiryDate ? userData.expiryDate.toDate() : null,
            createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date()
          });
        }
      });
      setAccounts(accountsList);
    } catch (error: any) {
      console.error("Error fetching school accounts:", error);
      if (error.code === 'permission-denied') {
        toast.error("Akses ditolak. Periksa Firebase Security Rules untuk collection schools dan users.");
      } else if (error.code === 'unavailable') {
        toast.error("Service Firebase tidak tersedia. Coba lagi nanti.");
      } else {
        toast.error(`Gagal memuat data akun sekolah: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };
  const toggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      setActionLoading(accountId);

      // Force auth token refresh before write operation
      const {
        auth
      } = await import('@/lib/firebase');
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
      const {
        doc,
        updateDoc,
        serverTimestamp
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      console.log(`Attempting to update user ${accountId} status to ${!currentStatus}`);
      await updateDoc(doc(db, "users", accountId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.email || 'system'
      });
      setAccounts(prev => prev.map(account => account.id === accountId ? {
        ...account,
        isActive: !currentStatus
      } : account));
      const statusText = !currentStatus ? 'diaktifkan' : 'dinonaktifkan';
      toast.success(`Akun berhasil ${statusText}. ${!currentStatus ? 'Pengguna dapat login kembali.' : 'Pengguna tidak dapat login lagi.'}`);
      console.log(`Successfully updated user ${accountId} status`);
    } catch (error: any) {
      console.error("Error updating account status:", error);
      if (error.code === 'permission-denied') {
        toast.error("Akses ditolak. Pastikan Anda memiliki izin untuk mengubah status akun.");
      } else if (error.code === 'not-found') {
        toast.error("Akun tidak ditemukan dalam database.");
      } else {
        toast.error(`Gagal mengubah status akun: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setActionLoading(null);
    }
  };
  const updateExpiryType = async (accountId: string, expiryType: SchoolAccount['expiryType']) => {
    try {
      setActionLoading(accountId);

      // Force auth token refresh before write operation
      const {
        auth
      } = await import('@/lib/firebase');
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
      const {
        doc,
        updateDoc,
        serverTimestamp,
        Timestamp
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      console.log(`Attempting to update user ${accountId} expiry to ${expiryType}`);
      let expiryDate = null;
      const now = new Date();
      switch (expiryType) {
        case "1_day":
          expiryDate = Timestamp.fromDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
          break;
        case "1_week":
          expiryDate = Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
          break;
        case "1_month":
          expiryDate = Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
          break;
        case "forever":
          expiryDate = null;
          break;
      }
      await updateDoc(doc(db, "users", accountId), {
        expiryType,
        expiryDate,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.email || 'system'
      });
      setAccounts(prev => prev.map(account => account.id === accountId ? {
        ...account,
        expiryType,
        expiryDate: expiryDate?.toDate() || null
      } : account));
      toast.success("Masa berlaku berhasil diperbarui");
      console.log(`Successfully updated user ${accountId} expiry`);
    } catch (error: any) {
      console.error("Error updating expiry:", error);
      if (error.code === 'permission-denied') {
        toast.error("Akses ditolak. Pastikan Anda memiliki izin untuk mengubah masa berlaku.");
      } else if (error.code === 'not-found') {
        toast.error("Akun tidak ditemukan dalam database.");
      } else {
        toast.error(`Gagal memperbarui masa berlaku: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setActionLoading(null);
    }
  };
  const getExpiryLabel = (type: SchoolAccount['expiryType']) => {
    switch (type) {
      case "1_day":
        return "1 Hari";
      case "1_week":
        return "1 Minggu";
      case "1_month":
        return "1 Bulan";
      case "forever":
        return "Selamanya";
      default:
        return "1 Bulan";
    }
  };
  const getExpiryStatus = (account: SchoolAccount) => {
    if (account.expiryType === "forever") return "active";
    if (!account.expiryDate) return "unknown";
    const now = new Date();
    const timeDiff = account.expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return "expired";
    if (daysLeft <= 3) return "warning";
    return "active";
  };
  if (loading) {
    return 
         
    <div className="bg-white rounded-xl shadow-sm p-6" data-unique-id="6c7951d7-68bc-4d0e-92e7-8fe0032c8205" data-file-name="components/SuperAdminTable.tsx">
        <div className="animate-pulse" data-unique-id="f4f91f56-7e28-4def-aa43-19c49ceba610" data-file-name="components/SuperAdminTable.tsx">
          <div className="h-6 bg-gray-200 rounded mb-4" data-unique-id="821f4bee-9045-453e-9fa6-5d533f16ca56" data-file-name="components/SuperAdminTable.tsx"></div>
          <div className="space-y-3" data-unique-id="30a15c21-7466-4cb1-8c27-3cea19b3bd45" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" data-unique-id="ec3662af-0af6-4376-9af7-a1df63453da5" data-file-name="components/SuperAdminTable.tsx"></div>)}
          </div>
        </div>
      </div>;
  }


 
      
  
  return 
    
   {/* Info Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200" data-unique-id="c36ae77d-aa3c-487a-bcf9-aa26c1262854" data-file-name="components/SuperAdminTable.tsx">
        <div className="flex items-center justify-between text-sm text-gray-600" data-unique-id="0d3d62c1-d119-411f-a363-1610ca7564ee" data-file-name="components/SuperAdminTable.tsx">
          <div className="flex items-center space-x-4" data-unique-id="c84b6faf-88a3-4af8-9cba-5cbec2af51d7" data-file-name="components/SuperAdminTable.tsx">
            <div className="flex items-center space-x-1" data-unique-id="bb273a0e-421e-4571-aed7-07967886372a" data-file-name="components/SuperAdminTable.tsx">
              <Eye className="h-4 w-4 text-green-500" />
              <span data-unique-id="a0188a21-08d9-44ea-a206-e94d79919bb7" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="8e0ccff2-08e8-445a-bc2b-526f7a9aa4b7" data-file-name="components/SuperAdminTable.tsx"></span></span>
            </div>
            <div className="flex items-center space-x-1" data-unique-id="16f84299-db4a-4a19-a6cb-26823fb1474b" data-file-name="components/SuperAdminTable.tsx">
              <EyeOff className="h-4 w-4 text-red-500" />
              <span data-unique-id="bffb3ded-3bfc-4344-ad49-815946c9202a" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="0dcb9b48-2417-42d4-81ea-7040f7bd2546" data-file-name="components/SuperAdminTable.tsx"></span></span>
            </div>
          </div>
          <div className="text-gray-400" data-unique-id="62d9a391-a473-491c-b8c5-6225222a7aa7" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="7b2f0a5d-6453-4c6f-b916-fac8ddef67b2" data-file-name="components/SuperAdminTable.tsx">
            Total: </span>{accounts.length}<span className="editable-text" data-unique-id="dcb44138-ee53-4dfa-8daa-6448b73253c5" data-file-name="components/SuperAdminTable.tsx"> akun - Aktif: </span>{accounts.filter(a => a.isActive).length}<span className="editable-text" data-unique-id="0e262b66-ddb7-4758-ae1c-9a4651edf286" data-file-name="components/SuperAdminTable.tsx"> - Nonaktif: </span>{accounts.filter(a => !a.isActive).length}
          </div>
        </div>
      </div>
    
    
    


  
  
  
  
  
  
  
  <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="0a82fbbf-82cb-418d-86b5-55178ddd0779" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4" data-unique-id="4a3cefb0-3709-42bb-9a69-a4f8409847c1" data-file-name="components/SuperAdminTable.tsx">
        <div className="flex items-center justify-between" data-unique-id="bbc5507c-0f80-435b-8f96-bea86b7f8f0e" data-file-name="components/SuperAdminTable.tsx">
          <div className="flex items-center space-x-3" data-unique-id="0df2b52d-4d30-4316-8128-117c42d5b6d1" data-file-name="components/SuperAdminTable.tsx">
            <Users className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white" data-unique-id="3ea6f939-112c-41c7-b6cf-e77b6ff6c9f4" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="6b06f1b4-f630-4e61-b8e0-ac1090a1dcdd" data-file-name="components/SuperAdminTable.tsx">Manajemen Akun</span></h2>
          </div>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium" data-unique-id="c12384b5-7901-41d6-9f29-f971f4e42475" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
            {accounts.length}<span className="editable-text" data-unique-id="7860792a-27a2-4b1b-9eaa-b1f056141c76" data-file-name="components/SuperAdminTable.tsx"> Akun
          </span></span>
        </div>
      </div>

      <div className="overflow-x-auto" data-unique-id="9d5bcf18-2594-4d12-81b7-b94ab544220f" data-file-name="components/SuperAdminTable.tsx">
        <table className="w-full" data-unique-id="06e72a4a-8f51-4327-b27d-ba3128913669" data-file-name="components/SuperAdminTable.tsx">
          <thead className="bg-gray-50" data-unique-id="f599cbdb-588e-44b7-9bef-45097f6e9456" data-file-name="components/SuperAdminTable.tsx">
            <tr data-unique-id="e5d20f58-6b6e-4bd5-b390-a8a842463b3c" data-file-name="components/SuperAdminTable.tsx">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider" data-unique-id="5ac010b4-f4e6-4f6d-bfdd-72709222dd65" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="c1f281e2-9c1b-430f-994f-453844329a16" data-file-name="components/SuperAdminTable.tsx">No</span></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider" data-unique-id="d543bc69-4078-408a-adf8-19082eb75e9e" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="1689b077-6d60-4c52-8131-a08dcc498e4f" data-file-name="components/SuperAdminTable.tsx">Nama Admin</span></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider" data-unique-id="7536831a-e9a8-48c0-9326-abcd1c317930" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="a755030d-2894-4012-ab3c-78925a09efba" data-file-name="components/SuperAdminTable.tsx">Email</span></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider" data-unique-id="9247916d-da18-4237-adb0-81ac5de54817" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="922fd62d-233f-4cb3-81c5-dccc3b5bacf4" data-file-name="components/SuperAdminTable.tsx">Nama Sekolah</span></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider" data-unique-id="d9053f3b-115e-484b-85b8-37a45f2faf12" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="694ee908-8f08-44ef-871f-96fc80251054" data-file-name="components/SuperAdminTable.tsx">Status</span></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider" data-unique-id="6c118641-5c8d-46c8-ae4d-bd1e87ab63f0" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="d848588e-a009-4dd0-962a-b1fc344067ac" data-file-name="components/SuperAdminTable.tsx">Masa Berlaku</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-unique-id="e5a01635-12c0-4f25-8324-49248d744aa0" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
            {accounts.length > 0 ? accounts.map((account, index) => {
            const expiryStatus = getExpiryStatus(account);
            const isActionLoading = actionLoading === account.id;
            return <motion.tr key={account.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }} className="hover:bg-gray-50" data-unique-id="06769f6e-001a-4aa0-b231-3f5aec288a25" data-file-name="components/SuperAdminTable.tsx">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-unique-id="890c1553-44ca-4397-92b6-06fe1f9eb8bf" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" data-unique-id="ed5f6ffc-d340-4dd9-98ae-25e69b975ed1" data-file-name="components/SuperAdminTable.tsx">
                    <div className="flex items-center" data-unique-id="b16c33e8-8fb4-4b77-bbec-e00e017d4a72" data-file-name="components/SuperAdminTable.tsx">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-medium" data-unique-id="518df61f-fb43-41ca-8d17-9ddbd0b8da3a" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                        {account.adminName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4" data-unique-id="45efc6c2-085a-4042-994f-2db1376617d4" data-file-name="components/SuperAdminTable.tsx">
                        <div className="text-sm font-medium text-gray-900" data-unique-id="eaa99bea-35aa-48f5-bff8-fdaa48e2f825" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">{account.adminName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="0a19b8af-c825-4b5b-b609-91ea5ebaa1cb" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-unique-id="d6e28d0b-12f0-454b-a7ff-6a9fbba3619c" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                    {account.schoolName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" data-unique-id="cfd1596d-8ac3-47f4-aab7-38de4258f726" data-file-name="components/SuperAdminTable.tsx">
                    <button onClick={() => toggleAccountStatus(account.id, account.isActive)} disabled={isActionLoading} className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${account.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'} ${isActionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} data-unique-id="3b714b47-4930-456d-af0f-a3f2c2ba2221" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                      {isActionLoading ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" data-unique-id="36eee893-a90c-4733-9191-2039e4b5b391" data-file-name="components/SuperAdminTable.tsx" /> : account.isActive ? <Eye className="h-4 w-4" data-unique-id="556a720a-dead-4141-9fc0-94c12473ae71" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true" /> : <EyeOff className="h-4 w-4" data-unique-id="29ad1d93-e137-4404-98da-df5f8db83712" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true" />}
                      <span data-unique-id="9d015ba1-6379-4097-b2c2-2c99c52280f9" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">{account.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" data-unique-id="9852957a-0662-4673-9a29-f52ce05afaba" data-file-name="components/SuperAdminTable.tsx">
                    <div className="space-y-2" data-unique-id="4e790cde-754e-456f-9c5e-980ae6d345ec" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                      <select value={account.expiryType} onChange={e => updateExpiryType(account.id, e.target.value as SchoolAccount['expiryType'])} disabled={isActionLoading} className={`text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-primary focus:border-primary ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`} data-unique-id="38b3ba38-4e26-4ffc-9647-e2f4410aa72f" data-file-name="components/SuperAdminTable.tsx">
                        <option value="1_day" data-unique-id="8649bed7-e8ad-482c-a700-07e7f06d8e64" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="fa8d5333-3522-4f62-ba1b-afed0df17550" data-file-name="components/SuperAdminTable.tsx">1 Hari</span></option>
                        <option value="1_week" data-unique-id="7b49f972-ca83-4530-939a-eba8bed63915" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="190f2184-c02f-40da-b5ff-6dbc00b8d921" data-file-name="components/SuperAdminTable.tsx">1 Minggu</span></option>
                        <option value="1_month" data-unique-id="46e9f316-1c4a-4a4d-ad9c-fb6137460e2f" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="51206a4b-4362-43ab-90fc-2d9f40338b8a" data-file-name="components/SuperAdminTable.tsx">1 Bulan</span></option>
                        <option value="forever" data-unique-id="c72f9305-52fb-40bb-9f57-ee2707c62116" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="9a6c8b69-24ad-40ed-a5c2-90b5934c11be" data-file-name="components/SuperAdminTable.tsx">Selamanya</span></option>
                      </select>
                      
                      {account.expiryDate && account.expiryType !== "forever" && <div className={`text-xs px-2 py-1 rounded-full text-center ${expiryStatus === 'expired' ? 'bg-red-100 text-red-800' : expiryStatus === 'warning' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`} data-unique-id="53b92f76-793f-4eb3-b076-c22575ddd4da" data-file-name="components/SuperAdminTable.tsx" data-dynamic-text="true">
                          {expiryStatus === 'expired' ? 'Berakhir' : `${Math.ceil((account.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} hari lagi`}
                        </div>}
                      
                      {account.expiryType === "forever" && <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-center" data-unique-id="877bb3e5-920e-4656-8f1e-c1c90a0d1c3f" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="62b94a99-a045-49f1-a70e-0e71e7e9cbc1" data-file-name="components/SuperAdminTable.tsx">
                          Tidak Terbatas
                        </span></div>}
                    </div>
                  </td>
                </motion.tr>;
          }) : <tr data-unique-id="a6e9d415-013b-412f-b0ac-3f5dc6506c09" data-file-name="components/SuperAdminTable.tsx">
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500" data-unique-id="d1532838-00a7-4af5-90c0-c2ff9fed9454" data-file-name="components/SuperAdminTable.tsx">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium" data-unique-id="a146d349-17ec-478a-b7ed-2616f7d247e8" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="31e9951c-1339-4773-ad18-bca26896f99b" data-file-name="components/SuperAdminTable.tsx">Belum ada akun sekolah</span></p>
                  <p className="text-sm" data-unique-id="f309b202-e1c2-4d5a-a206-c2a22449fc2b" data-file-name="components/SuperAdminTable.tsx"><span className="editable-text" data-unique-id="675f6ff0-d06d-4e09-a7c8-8a4cb5982771" data-file-name="components/SuperAdminTable.tsx">Akun sekolah akan muncul disini setelah admin mendaftar</span></p>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
      
   
    </div>;
}
