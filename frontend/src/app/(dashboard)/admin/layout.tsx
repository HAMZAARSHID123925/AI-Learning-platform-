'use client';
import StaffLayout from '@/components/staff/StaffLayout';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { HomeIcon, BookOpenIcon, UsersIcon, GraduationCapIcon } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <StaffLayout 
        roleLabel="Admin"
        nav={[
          { label: 'Overview', to: '/admin', icon: HomeIcon, end: true },
          { label: 'Courses', to: '/admin/courses', icon: BookOpenIcon },
          { label: 'Teachers', to: '/admin/teachers', icon: UsersIcon },
          { label: 'Students', to: '/admin/students', icon: GraduationCapIcon }
        ]}
      >
        {children}
      </StaffLayout>
    </RoleGuard>
  );
}
