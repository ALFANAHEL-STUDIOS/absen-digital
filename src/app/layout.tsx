import ErrorBoundaryClient from "@/components/ConfirmDialog";
import "@/styles/globals.css";
import React from "react";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import AuthProvider from "@/app/providers";
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};
export const metadata: Metadata = {
  title: {
    default: "ABSENSI DIGITAL - Siswa Dengan QR Code",
    template: "%s - ABSENSI DIGITAL - Siswa Dengan QR Code"
  },
  description: "Sistem Absensi Digital Modern dengan QR Code yang menghubungkan sekolah dan orang tua secara real-time dengan notifikasi Telegram. Pantau kehadiran siswa dengan mudah menggunakan teknologi QR Code dan dapatkan notifikasi langsung ke Telegram.",
  applicationName: "ABSENSI DIGITAL - Siswa Dengan QR Code",
  keywords: ["absensi", "qr code", "sekolah", "siswa", "telegram", "notifikasi", "pendidikan", "kehadiran", "absensi digital"],
  authors: [{
    name: "ABSENSI DIGITAL - Siswa Dengan QR Code Team"
  }],
  creator: "ABSENSI DIGITAL - Siswa Dengan QR Code Team",
  publisher: "ABSENSI DIGITAL - Siswa Dengan QR Code Team",
  icons: {
    icon: [{
      url: "https://cdn.kibrispdr.org/data/824/qr-code-icon-png-41.png",
      sizes: "16x16",
      type: "image/png"
    }, {
      url: "https://cdn.kibrispdr.org/data/824/qr-code-icon-png-41.png",
      sizes: "32x32",
      type: "image/png"
    }, {
      url: "https://icons.iconarchive.com/icons/martz90/circle/256/qr-code-icon.png",
      sizes: "48x48",
      type: "image/x-icon"
    }],
    apple: [{
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png"
    }]
  },
  manifest: "https://cdn.medcom.id/dynamic/content/2022/06/09/1436288/BlGKjpqYCI.jpg?w=1024",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ABSENSI DIGITAL - Siswa Dengan QR Code"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://cdn.medcom.id/dynamic/content/2022/06/09/1436288/BlGKjpqYCI.jpg?w=1024",
    title: "ABSENSI DIGITAL - Siswa Dengan QR Code",
    description: "Sistem Absensi Digital Modern dengan QR Code yang menghubungkan sekolah dan orang tua secara real-time dengan notifikasi Telegram.",
    siteName: "ABSENSI DIGITAL - Siswa Dengan QR Code",
    images: [{
      url: "https://cdn.medcom.id/dynamic/content/2022/06/09/1436288/BlGKjpqYCI.jpg?w=1024",
      width: 1200,
      height: 630,
      alt: "ABSENSI DIGITAL - Siswa Dengan QR Code"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ABSENSI DIGITAL - Siswa Dengan QR Code",
    description: "Sistem Absensi Digital Modern dengan QR Code yang menghubungkan sekolah dan orang tua secara real-time dengan notifikasi Telegram.",
    images: ["https://cdn.medcom.id/dynamic/content/2022/06/09/1436288/BlGKjpqYCI.jpg?w=1024"]
  }
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="id" className={`${GeistSans.variable} scroll-smooth`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>;
}
