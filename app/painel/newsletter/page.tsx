import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NewsletterClient } from "@/components/painel/newsletter-client";

export default async function NewsletterPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  const subscribers = tenantId
    ? await prisma.newsletterSubscriber.findMany({
        where: { tenantId, active: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const serialized = subscribers.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return <NewsletterClient subscribers={serialized} />;
}
