"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, Settings, Bell, Shield, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import SuperAdminTable from "@/components/SuperAdminTable";
import AnnouncementForm from "@/components/AnnouncementForm";
export default function AlfanahelSuperAdmin() {
  const {
    user,
    userRole
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if user has super admin access
  useEffect(() => {
    const checkSuperAdminAccess = () => {
      // Only specific emails can access this page
      const superAdminEmails = ["lehan.virtual@gmail.com", "alfanahel@gmail.com", "admin@alfanahel.com"];
      if (!user || !superAdminEmails.includes(user.email || "")) {
        toast.error("Akses ditolak. Anda tidak memiliki izin Super Admin.");
        router.push("/dashboard");
        return;
      }
      setLoading(false);
    };
    if (user !== null) {
      checkSuperAdminAccess();
    }
  }, [user, router]);
  if (loading) {
    return <div className="flex justify-center items-center h-screen" data-unique-id="bf4d3821-09dd-4311-a695-e2ea6eced458" data-file-name="app/dashboard/alfanahel/page.tsx">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-unique-id="22faf79a-d42d-4d8f-b65f-5c7c34a6f992" data-file-name="app/dashboard/alfanahel/page.tsx"></div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20 md:pb-6" data-unique-id="f65dff60-7953-4ff8-b5ef-6ea2c3d6c9f6" data-file-name="app/dashboard/alfanahel/page.tsx" data-dynamic-text="true">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm" data-unique-id="5868d721-a253-493b-ba01-d844490fdb70" data-file-name="app/dashboard/alfanahel/page.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-unique-id="637065ab-b1e2-4f71-8f38-d63c6f1f656f" data-file-name="app/dashboard/alfanahel/page.tsx">
          <div className="flex items-center justify-between" data-unique-id="b236863d-7842-49e4-aab0-4baae9077e88" data-file-name="app/dashboard/alfanahel/page.tsx">
            <div className="flex items-center space-x-3" data-unique-id="47cee088-baa3-4580-946c-aafc7e9e377b" data-file-name="app/dashboard/alfanahel/page.tsx">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg" data-unique-id="fffa3189-deb6-4ae5-ba62-19cfe8b41c4d" data-file-name="app/dashboard/alfanahel/page.tsx">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div data-unique-id="18e82650-8e8e-4b33-bad7-bcc0f3d6b613" data-file-name="app/dashboard/alfanahel/page.tsx">
                <h1 className="text-3xl font-bold text-gray-900" data-unique-id="bdbe8089-0289-43ba-81c0-aaf157f4f973" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="13b4209f-34d0-42aa-bb2d-1ed08fc6b890" data-file-name="app/dashboard/alfanahel/page.tsx">Super Admin</span></h1>
                <p className="text-gray-600 mt-1" data-unique-id="6d10ecc6-a182-4df7-adf6-0fe84a52c635" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="fb4accce-bd49-414b-94f2-04d915c1a4d3" data-file-name="app/dashboard/alfanahel/page.tsx">Panel kontrol manajemen akun</span></p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-lg border border-green-200" data-unique-id="2ed4b65d-246e-49d6-b9b4-414dc39f0df7" data-file-name="app/dashboard/alfanahel/page.tsx">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" data-unique-id="b7827d89-3a74-4618-a64b-b77d9e510355" data-file-name="app/dashboard/alfanahel/page.tsx"></div>
              <span className="text-green-700 font-medium" data-unique-id="4addf7f3-a304-422f-8ad0-e2ed7752e841" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="4b1ed6fa-d0b4-49c7-b021-78a33f65ae46" data-file-name="app/dashboard/alfanahel/page.tsx">Sistem Aktif</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1 py-8" data-unique-id="a7f76e05-f77e-4928-90da-cbe6a3dd0667" data-file-name="app/dashboard/alfanahel/page.tsx" data-dynamic-text="true">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-unique-id="6c5b64f1-6fe5-4c00-9ee0-200a02c2998a" data-file-name="app/dashboard/alfanahel/page.tsx">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg" data-unique-id="087f5c72-7af7-4e7d-a740-e9c4192d0044" data-file-name="app/dashboard/alfanahel/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="8cb32d07-903e-4244-bd9e-92392aaccff6" data-file-name="app/dashboard/alfanahel/page.tsx">
              <div data-unique-id="efe7346a-b494-41ed-9c2a-8133fe5ae53a" data-file-name="app/dashboard/alfanahel/page.tsx">
                <p className="text-blue-100 text-sm font-medium" data-unique-id="23f079cf-9818-4908-a60f-a91d2bda632e" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="87a9cd92-1a82-410e-aa0d-a209e5ba9543" data-file-name="app/dashboard/alfanahel/page.tsx">Total Sekolah</span></p>
                <p className="text-3xl font-bold" data-unique-id="6a253f8c-6191-402e-9d2a-e4440f12b96d" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="7ce4b2fc-1f46-4448-88dc-a7316fe2b2a8" data-file-name="app/dashboard/alfanahel/page.tsx">0</span></p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg" data-unique-id="5edac8cf-fcb6-49d5-ac11-9047a63dbbb9" data-file-name="app/dashboard/alfanahel/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="badf5772-9982-432a-8535-c75e5e3c5223" data-file-name="app/dashboard/alfanahel/page.tsx">
              <div data-unique-id="256e0e73-db2a-4c66-a040-f2bc54df8272" data-file-name="app/dashboard/alfanahel/page.tsx">
                <p className="text-green-100 text-sm font-medium" data-unique-id="670f591e-80e9-4797-862f-7e36b3907d4d" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="e7b010ab-ea5c-4c1c-b960-d338a5dd21d3" data-file-name="app/dashboard/alfanahel/page.tsx">Akun Aktif</span></p>
                <p className="text-3xl font-bold" data-unique-id="6364244f-f6ae-4f5f-a25e-33dbd9da6544" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="b2de3401-4a84-4bc3-b489-5e869cefdffa" data-file-name="app/dashboard/alfanahel/page.tsx">0</span></p>
              </div>
              <Calendar className="h-10 w-10 text-green-200" data-unique-id="60f6dbd9-abd9-4ec6-8748-5611aed4a75e" data-file-name="app/dashboard/alfanahel/page.tsx" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg" data-unique-id="13023e23-ab66-4067-b4f3-21406289865e" data-file-name="app/dashboard/alfanahel/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="dc8ed8de-901e-4080-8ee0-59a71f4e20c7" data-file-name="app/dashboard/alfanahel/page.tsx">
              <div data-unique-id="7e92866c-b35d-48ea-852c-fb612098d522" data-file-name="app/dashboard/alfanahel/page.tsx">
                <p className="text-orange-100 text-sm font-medium" data-unique-id="1c7a3f03-01a4-4c15-82af-61bb35ca5788" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="1a0ce6a2-3750-4da1-b46b-8d907cfaf61c" data-file-name="app/dashboard/alfanahel/page.tsx">Akan Nonaktif</span></p>
                <p className="text-3xl font-bold" data-unique-id="48910224-5262-4444-a37d-6de560774cf2" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="aeda99a3-ed9b-4b22-8f9f-18c0b56f991b" data-file-name="app/dashboard/alfanahel/page.tsx">0</span></p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg" data-unique-id="63c0d6e9-2cfb-4ff0-88d2-4a836cc7b0d4" data-file-name="app/dashboard/alfanahel/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="aff95766-e9d1-437c-abdc-b8aebc5facab" data-file-name="app/dashboard/alfanahel/page.tsx">
              <div data-unique-id="9ce4b382-dd90-4eb4-b807-af7b7dfcd270" data-file-name="app/dashboard/alfanahel/page.tsx">
                <p className="text-purple-100 text-sm font-medium" data-unique-id="3748d8fb-7c5d-49c0-82fe-3baf9ae24724" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="f66468f4-3512-4f78-a9c5-172443158d46" data-file-name="app/dashboard/alfanahel/page.tsx">Pengumuman</span></p>
                <p className="text-3xl font-bold" data-unique-id="1006801e-251f-47f8-b5e6-b5ae274aee50" data-file-name="app/dashboard/alfanahel/page.tsx"><span className="editable-text" data-unique-id="c78c76d1-6f94-40c5-be0e-77f39304cf07" data-file-name="app/dashboard/alfanahel/page.tsx">1</span></p>
              </div>
              <Bell className="h-10 w-10 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-unique-id="e5ae74cc-e39a-4a4b-8098-defcdc9aa70e" data-file-name="app/dashboard/alfanahel/page.tsx" data-dynamic-text="true">
          {/* School Accounts Table */}
          <div className="lg:col-span-2" data-unique-id="240224ce-a65e-4f91-a652-799bec37348b" data-file-name="app/dashboard/alfanahel/page.tsx">
            <SuperAdminTable />
          </div>
          
          {/* Announcement Form */}
          <div className="lg:col-span-1" data-unique-id="6d222b0a-2c73-4a24-8744-3d2cef20cd7f" data-file-name="app/dashboard/alfanahel/page.tsx">
            <AnnouncementForm />
          </div>
        </div>
      </div>
    </div>;
}
