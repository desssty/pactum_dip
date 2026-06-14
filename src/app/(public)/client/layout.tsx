import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { ClientSidebar } from "@/components/client/client-sidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) redirect("/login");
  if (session.role !== "CLIENT") redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
