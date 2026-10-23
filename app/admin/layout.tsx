import React from 'react';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
