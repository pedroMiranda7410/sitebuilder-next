import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirect: false });
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8f8f7" }}>
      <AdminSidebar
        userEmail={session.user.email ?? ""}
        userName={session.user.name ?? ""}
        signOutAction={handleSignOut}
      />
      {/* Mobile header spacer */}
      <div className="fixed top-0 left-0 right-0 h-14 z-20 md:hidden" style={{ backgroundColor: "#f8f8f7" }} />
      <main className="flex-1 min-h-screen ml-0 md:ml-16 lg:ml-60 pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
