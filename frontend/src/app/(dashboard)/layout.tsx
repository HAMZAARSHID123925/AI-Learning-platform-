export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 antialiased selection:bg-[#027FFF] selection:text-white">
      {children}
    </div>
  );
}
