import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "@/lib/services/admin-auth";
import { getAdminDashboardStats } from "@/lib/services/admin";

export default async function AdminDashboardPage() {
  try {
    await requireAuthorizedAdmin();
  } catch {
    redirect("/admin/login");
  }

  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Welcome back! Here&apos;s an overview of your portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Projects
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {stats.totalProjects}
              </p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3">
              <span className="text-2xl">💼</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                New Messages
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {stats.newMessages}
              </p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3">
              <span className="text-2xl">✉️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
