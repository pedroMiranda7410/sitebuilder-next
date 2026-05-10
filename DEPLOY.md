# Deploy na Vercel

## Pré-requisitos

- Conta na Vercel (vercel.com)
- Projeto no Supabase com banco criado
- Repositório no GitHub

---

## Passo 1 — Subir para o GitHub

```bash
git push -u origin main
```

---

## Passo 2 — Criar projeto na Vercel

1. Acesse vercel.com → **Add New → Project**
2. Importe o repositório do GitHub
3. Framework: **Next.js** (detectado automaticamente)
4. Build Command: deixar padrão (usa o `vercel.json`)

---

## Passo 3 — Variáveis de ambiente na Vercel

Adicione em **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL do pooler do Supabase (porta **6543** com `?pgbouncer=true`) |
| `DIRECT_URL` | URL direta do Supabase (porta **5432**, usada para migrations) |
| `NEXTAUTH_SECRET` | Gere com: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://SEU-PROJETO.vercel.app` |

> **Atenção:** As duas URLs do Supabase ficam em **Project → Settings → Database → Connection string**.
> Use "Transaction mode" (porta 6543) para `DATABASE_URL` e "Session mode" / Direct (porta 5432) para `DIRECT_URL`.

---

## Passo 4 — Rodar seed em produção

Após o primeiro deploy bem-sucedido, no terminal local:

```bash
DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." npx prisma db seed
```

Substitua pelas URLs diretas do Supabase (porta 5432).

---

## Passo 5 — Domínio customizado (opcional)

Vercel → seu projeto → **Settings → Domains → Add domain**

Após adicionar o domínio, atualize a variável `NEXTAUTH_URL` para o novo domínio e faça um novo deploy.

---

## Verificação final

| Endpoint | Esperado |
|---|---|
| `/api/health` | `{ "status": "ok" }` |
| `/login` | Página de login carrega |
| `/api/site/andreia` | JSON completo do site da Andreia |

---

## Troubleshooting

**Build falha com erro de Prisma**
Certifique-se que `DATABASE_URL` e `DIRECT_URL` estão configuradas na Vercel antes do deploy.

**`NEXTAUTH_SECRET` não configurado**
O NextAuth recusa autenticações sem essa variável em produção. Gere com `openssl rand -base64 32`.

**Migrations não rodaram**
O `vercel.json` inclui `prisma migrate deploy` no build command — rode o deploy novamente após configurar `DIRECT_URL`.
