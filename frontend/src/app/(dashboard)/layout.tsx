export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B1221] text-slate-200">
      {children}
    </div>
  );
}
