import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { PainelSidebar } from "@/components/painel/sidebar";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const tenant = session.user.tenantId
    ? await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
    : null;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8f8f7" }}>
      <PainelSidebar
        tenantName={tenant?.name ?? "Meu Site"}
        tenantSlug={tenant?.slug ?? ""}
        tenantPrimaryColor={tenant?.themePrimaryColor ?? "#000000"}
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
        signOutAction={handleSignOut}
      />
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
