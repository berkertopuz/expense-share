import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main id="main-content" className="lg:ml-64 p-4 lg:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
