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
    template: "%s - ABSEN DIGITAL"
  },
  description: "Sistem Absensi Digital dengan fitur Scan QR Code yang menghubungkan sekolah dan orang tua secara real-time dengan notifikasi Telegram. Pantau kehadiran siswa dengan mudah menggunakan teknologi QR Code.",
  applicationName: "ABSENSI DIGITAL - Absensi Siswa Dengan QR Code",
  keywords: ["absensi", "qr code", "sekolah", "siswa", "telegram", "notifikasi", "pendidikan", "kehadiran", "absensi digital"],
  authors: [{
    name: "ABSENSI DIGITAL ALFANAHEL"
  }],
  creator: "ABSENSI DIGITAL ALFANAHEL",
  publisher: "ABSENSI DIGITAL ALFANAHEL",
  icons: {
    icon: [{
      url: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png"
    }, {
      url: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    }, {
      url: "/favicon.ico",
      sizes: "48x48",
      type: "image/x-icon"
    }],
    apple: [{
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png"
    }]
  },
  manifest: "/site.webmanifest",
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
    url: "https://absendigital.com/",
    title: "ABSENSI DIGITAL - Siswa Dengan QR Code",
    description: "Sistem Absensi Digital dengan fitur Scan QR Code yang menghubungkan sekolah dan orang tua secara real-time dengan notifikasi Telegram.",
    siteName: "ABSENSI DIGITAL - Siswa Dengan QR CodeL",
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
    description: "Sistem Absensi Digital dengan fitur Scan QR Code yang menghubungkan sekolah dan orang tua secara real-time dengan notifikasi Telegram.",
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
