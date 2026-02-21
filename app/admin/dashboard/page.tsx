import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function getStats() {
  const supabase = createSupabaseServerClient();

  const [projectsResult, messagesResult] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    totalProjects: projectsResult.count ?? 0,
    newMessages: messagesResult.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const stats = await getStats();

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
