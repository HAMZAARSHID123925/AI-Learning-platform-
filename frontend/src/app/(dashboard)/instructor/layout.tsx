'use client';
import StaffLayout from '@/components/staff/StaffLayout';
import { HomeIcon, VideoIcon } from 'lucide-react';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  // In a real app we'd get the assigned courses here to build the nav dynamically
  // For now, we'll keep it static or use placeholder
  const nav = [
    { label: 'Dashboard', to: '/instructor', icon: HomeIcon, end: true },
    { label: 'Live classes', to: '/instructor/classes', icon: VideoIcon },
    // A secondary list for "My courses" would be handled within StaffLayout or here
  ];

  return (
    <StaffLayout 
      roleLabel="Teacher"
      nav={nav}
    >
      {children}
    </StaffLayout>
  );
}
