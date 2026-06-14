import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "LAWYER") redirect("/lawyer/dashboard");
    redirect("/client");
  }

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
