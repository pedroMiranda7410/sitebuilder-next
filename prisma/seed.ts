import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminHash = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: { password: adminHash },
    create: {
      name: "Administrador",
      email: "admin@admin.com",
      password: adminHash,
      role: "admin",
    },
  });
  console.log(`✓ Admin: ${admin.email}`);

  // ── Tenant Andreia ────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "andreia" },
    update: {
      name: "Andreia",
      themePrimaryColor: "#B8975A",
      themeSecondaryColor: "#3D3828",
      themeFont: "Cormorant Garamond",
      domain: "andreia.com.br",
      active: true,
    },
    create: {
      slug: "andreia",
      name: "Andreia",
      themePrimaryColor: "#B8975A",
      themeSecondaryColor: "#3D3828",
      themeFont: "Cormorant Garamond",
      domain: "andreia.com.br",
      active: true,
    },
  });
  console.log(`✓ Tenant: ${tenant.slug}`);

  // ── Client user ───────────────────────────────────────────────────────────
  const clientHash = await hashPassword("cliente123");
  const client = await prisma.user.upsert({
    where: { email: "andreia@teste.com" },
    update: { tenantId: tenant.id, password: clientHash },
    create: {
      name: "Andreia",
      email: "andreia@teste.com",
      password: clientHash,
      role: "client",
      tenantId: tenant.id,
    },
  });
  console.log(`✓ Client: ${client.email}`);

  // ── Sections ──────────────────────────────────────────────────────────────
  const sections = [
    {
      sectionKey: "hero",
      label: "Seção Principal",
      sectionType: "hero",
      position: 1,
      visible: true,
      content: {
        title: "Um Momento\nPara Você",
        subtitle: "Encontre seu caminho de volta para si mesma",
        cta_text: "Conhecer Mais",
        cta_url: "#sobre-breve",
        background_image_url:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
      },
    },
    {
      sectionKey: "sobre_breve",
      label: "Sobre Breve",
      sectionType: "text",
      position: 2,
      visible: true,
      content: {
        title: "A Cura Começa\nno Sentir",
        body: "Sou Andreia, terapeuta corporal e facilitadora de processos de transformação. Acredito que o corpo carrega toda a sabedoria de que precisamos e que, quando aprendemos a escutá-lo com presença e gentileza, o caminho de volta para nós mesmas se revela de forma natural.\n\nCom amor, cuidado e uma escuta profunda, ofereço um espaço seguro para que você possa soltar o que não é mais seu, reencontrar sua voz e reconectar com a sua essência mais verdadeira.",
        photo_url:
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
        label: "Bem-vinda",
      },
    },
    {
      sectionKey: "servicos",
      label: "Nossos Serviços",
      sectionType: "cards",
      position: 3,
      visible: true,
      content: {
        title: "O que ofereço",
        cards: [
          {
            tag: "Terapia Corporal",
            title: "Aba Amanae",
            description:
              "Uma técnica de liberação corporal profunda que trabalha com as memórias e emoções armazenadas no corpo. Por meio do toque consciente, convida à soltura e à renovação.",
            image_url:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
            cta: "Agendar sessão",
          },
          {
            tag: "Círculo Feminino",
            title: "Mulheres da Terra",
            description:
              "Um espaço sagrado de encontro e escuta entre mulheres. Juntas, reconectamos com a sabedoria feminina ancestral, com a natureza e com o poder da comunidade.",
            image_url:
              "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80",
            cta: "Participar",
          },
          {
            tag: "Sessão Presencial ou Online",
            title: "Sessão Individual",
            description:
              "Um acompanhamento personalizado, no seu tempo e no seu ritmo. Integrando escuta, presença e diferentes recursos terapêuticos para o que você precisa no momento.",
            image_url:
              "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=600&q=80",
            cta: "Conversar comigo",
          },
        ],
      },
    },
    {
      sectionKey: "citacao",
      label: "Citação",
      sectionType: "quote",
      position: 4,
      visible: true,
      content: {
        text: "O corpo não mente. Ele guarda, ele fala, ele cura quando finalmente o deixamos ser escutado.",
        author: "Andreia",
      },
    },
    {
      sectionKey: "sobre",
      label: "Sobre Mim",
      sectionType: "about",
      position: 5,
      visible: true,
      content: {
        title: "Sobre Mim",
        label: "Minha história",
        paragraphs: [
          "Há mais de dez anos caminho pelos territórios do corpo, da emoção e do feminino sagrado. Formada em Aba Amanae e facilitadora de círculos de mulheres, trago uma abordagem que honra a integralidade de quem você é — não apenas o sintoma, mas a história inteira que o seu corpo carrega.",
          "Acredito no poder da presença. Em cada sessão, ofereço um espaço de acolhimento onde o que precisa emergir pode fazê-lo em segurança, com gentileza e profundidade.",
          "Também compartilho reflexões, práticas e convites no Medium — escritas que nascem da experiência vivida e do desejo de tocar outras mulheres que estão em caminho.",
        ],
        photo_url:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80",
        cta_primary: "Agendar conversa",
        cta_secondary: "Ler no Medium",
        cta_secondary_url: "https://medium.com",
      },
    },
    {
      sectionKey: "contato",
      label: "Contato",
      sectionType: "form",
      position: 6,
      visible: true,
      content: {
        title: "Entre em Contato",
        label: "Vamos conversar",
        subtitle:
          "Se você sentiu um chamado ao ler estas palavras, confie nele. Envie uma mensagem, sem pressa, sem expectativas. Vamos ver juntas o que faz sentido para você agora.",
        fields: ["nome", "email", "mensagem"],
        email_destino: "andreia@andreia.com.br",
        social_links: [
          { label: "Instagram", url: "https://instagram.com" },
          { label: "Medium", url: "https://medium.com" },
          { label: "WhatsApp", url: "https://wa.me" },
        ],
      },
    },
  ];

  for (const s of sections) {
    await prisma.section.upsert({
      where: { tenantId_sectionKey: { tenantId: tenant.id, sectionKey: s.sectionKey } },
      update: {
        label: s.label,
        sectionType: s.sectionType,
        position: s.position,
        visible: s.visible,
        content: s.content,
      },
      create: {
        tenantId: tenant.id,
        sectionKey: s.sectionKey,
        label: s.label,
        sectionType: s.sectionType,
        position: s.position,
        visible: s.visible,
        content: s.content,
      },
    });
    console.log(`  ✓ Section: ${s.sectionKey}`);
  }

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("   Admin:  admin@admin.com / admin123");
  console.log("   Client: andreia@teste.com / cliente123");
  console.log("   API:    /api/site/andreia");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
