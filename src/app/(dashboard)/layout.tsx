import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar />
      <div className="lg:pl-60 transition-all duration-200">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
