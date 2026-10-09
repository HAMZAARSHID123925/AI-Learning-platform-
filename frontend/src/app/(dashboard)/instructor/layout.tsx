'use client';
import StaffLayout from '@/components/staff/StaffLayout';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { HomeIcon, VideoIcon } from 'lucide-react';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { label: 'Dashboard', to: '/instructor', icon: HomeIcon, end: true },
    { label: 'Live classes', to: '/instructor/classes', icon: VideoIcon },
  ];

  return (
    <RoleGuard allowedRoles={['teacher', 'admin']}>
      <StaffLayout 
        roleLabel="Teacher"
        nav={nav}
      >
        {children}
      </StaffLayout>
    </RoleGuard>
  );
}
