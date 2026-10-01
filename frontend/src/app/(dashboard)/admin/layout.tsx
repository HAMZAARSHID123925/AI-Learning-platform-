'use client';
import StaffLayout from '@/components/staff/StaffLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffLayout 
      roleLabel="Admin"
      nav={[
        { label: 'Overview', to: '/admin', icon: 'home', end: true },
        { label: 'Courses', to: '/admin/courses', icon: 'book' },
        { label: 'Teachers', to: '/admin/teachers', icon: 'users' },
        { label: 'Students', to: '/admin/students', icon: 'graduation-cap' }
      ]}
    >
      {children}
    </StaffLayout>
  );
}
