import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <AdminTopbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="lg:ml-64 pt-16 p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
