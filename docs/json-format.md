# Formato JSON de Importação — sitebuilder-next

Use `POST /api/admin/import` com este JSON para criar ou atualizar um tenant completo. Todas as operações são **idempotentes** (podem ser reexecutadas sem duplicar dados).

---

## Estrutura raiz

```json
{
  "tenant": { ... },
  "user": { ... },
  "sections": [ ... ],
  "events": [ ... ],
  "newsletter_subscribers": [ ... ],
  "services": [ ... ]
}
```

---

## tenant

```json
"tenant": {
  "slug": "priscila",
  "name": "Priscila Rocha",
  "theme_primary_color": "#1a1a2e",
  "theme_secondary_color": "#e8c97a",
  "theme_font": "Cormorant Garamond",
  "logo_url": null,
  "domain": "priscila.com.br",
  "languages": ["pt", "en"],
  "default_lang": "pt"
}
```

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| slug | string | ✓ | Só letras minúsculas, números e hífens |
| name | string | ✓ | Nome de exibição |
| theme_primary_color | string | — | Hex #rrggbb, padrão `#000000` |
| theme_secondary_color | string | — | Hex #rrggbb, padrão `#ffffff` |
| theme_font | string | — | Nome da fonte Google, padrão `Inter` |
| logo_url | string\|null | — | URL completa |
| domain | string\|null | — | Domínio personalizado |
| languages | string[] | — | Ex: `["pt"]`, `["pt","en","es"]`. Padrão `["pt"]` |
| default_lang | string | — | Código do idioma padrão. Padrão `"pt"` |

---

## user (opcional)

Cria o usuário cliente se não existir.

```json
"user": {
  "name": "Priscila Rocha",
  "email": "priscila@email.com",
  "password": "senha123"
}
```

---

## sections

Array de seções do site. Cada seção pode ter `fields` (definição dos campos) e `content` (valores).

```json
"sections": [
  {
    "section_key": "hero",
    "section_type": "hero",
    "label": "Seção Principal",
    "position": 1,
    "visible": true,
    "fields": [ ... ],
    "content": { ... }
  }
]
```

| Campo | Tipo | Notas |
|-------|------|-------|
| section_key | string | Identificador único por tenant (snake_case) |
| section_type | string | Tipo visual: `hero`, `about`, `text`, `cards`, `citacao`, `form`, ou custom |
| label | string | Nome exibido no painel do cliente |
| position | number | Ordem de exibição |
| visible | boolean | Se aparece no site |
| fields | array | Definição dos campos (veja abaixo) |
| content | object | Valores dos campos |

### fields (dentro de uma seção)

```json
"fields": [
  {
    "key": "title",
    "label": "Título principal",
    "type": "text",
    "translatable": true,
    "position": 1,
    "required": true,
    "help_text": "Texto grande em destaque no topo"
  },
  {
    "key": "background_image_url",
    "label": "Imagem de fundo",
    "type": "image_url",
    "translatable": false,
    "position": 5,
    "help_text": "Cole a URL completa da imagem"
  }
]
```

| Campo | Tipo | Notas |
|-------|------|-------|
| key | string | snake_case, único por seção. Ex: `title`, `cover_image_url` |
| label | string | Nome exibido no editor |
| type | string | Veja tipos abaixo |
| translatable | boolean | Se true, content armazena `{"pt":"...","en":"..."}` |
| position | number | Ordem no editor |
| required | boolean | Marca como obrigatório |
| placeholder | string | Texto de placeholder |
| help_text | string | Texto de ajuda abaixo do campo |
| options | object | Configurações extras por tipo |

---

## Tipos de campo

| Tipo | Descrição | translatable | options |
|------|-----------|-------------|---------|
| `text` | Texto curto (1 linha) | recomendado | — |
| `textarea` | Texto longo (múltiplas linhas) | recomendado | — |
| `richtext` | Texto formatado | recomendado | — |
| `image_url` | URL de imagem com preview | não | — |
| `url` | Link/URL | não | — |
| `email` | E-mail | não | — |
| `phone` | Telefone | não | — |
| `boolean` | Sim/Não (checkbox) | não | — |
| `number` | Número | não | — |
| `date` | Data | não | — |
| `color` | Seletor de cor | não | — |
| `select` | Seleção única | não | `{"choices":["op1","op2"]}` |
| `list` | Lista de itens | sim | `{"min":1,"max":10}` |
| `cards` | Cards com subfields | sim | `{"fields":["title","text","image_url","link_url"]}` |
| `gallery` | Galeria de imagens (URLs) | não | `{"max":20}` |
| `faq` | Pares pergunta/resposta | sim | `{"max":20}` |
| `details` | Pares chave/valor | sim | `{"max":20}` |

### Regras de translatable

- Campos traduzíveis armazenam objetos: `{"pt":"valor","en":"value"}`
- Campos não traduzíveis armazenam valor direto: `"https://..."` ou `true`
- Tipos `image_url`, `url`, `email`, `phone`, `boolean`, `number`, `date`, `color`, `gallery` **nunca são traduzíveis**
- Para `list` com translatable: cada item é `{"pt":"...","en":"..."}`
- Para `faq` e `details`: cada item tem campos `question`/`answer` ou `label`/`value` que são traduzíveis

### Nomenclatura de keys

- Sempre snake_case: `cover_image_url`, `cta_text`, `social_links`
- Sem acentos, sem espaços, sem hífens
- Deve começar com letra
- Exemplos válidos: `title`, `subtitle`, `body`, `cta_url`, `cover_image_url`

---

## Exemplo completo de seção hero

```json
{
  "section_key": "hero",
  "section_type": "hero",
  "label": "Seção Principal",
  "position": 1,
  "visible": true,
  "fields": [
    { "key": "title",       "label": "Título principal",  "type": "text",      "translatable": true,  "position": 1, "required": true },
    { "key": "subtitle",    "label": "Frase de apoio",    "type": "text",      "translatable": true,  "position": 2 },
    { "key": "cta_text",    "label": "Texto do botão",    "type": "text",      "translatable": true,  "position": 3 },
    { "key": "cta_url",     "label": "Link do botão",     "type": "url",       "translatable": false, "position": 4, "help_text": "Ex: #contato ou /sobre" },
    { "key": "background_image_url", "label": "Imagem de fundo", "type": "image_url", "translatable": false, "position": 5 }
  ],
  "content": {
    "title": { "pt": "Um Momento Para Você", "en": "A Moment For You" },
    "subtitle": { "pt": "Encontre seu caminho", "en": "Find your path" },
    "cta_text": { "pt": "Conhecer Mais", "en": "Learn More" },
    "cta_url": "#contato",
    "background_image_url": "https://images.unsplash.com/photo-xxx"
  }
}
```

---

## services

```json
"services": [
  {
    "slug": "mentoria",
    "position": 1,
    "visible": true,
    "cover_image_url": "https://...",
    "fields": [
      { "key": "title",       "label": "Nome do serviço",    "type": "text",     "translatable": true,  "position": 1 },
      { "key": "tag",         "label": "Categoria",          "type": "text",     "translatable": true,  "position": 2 },
      { "key": "summary",     "label": "Resumo (card)",      "type": "textarea", "translatable": true,  "position": 3, "help_text": "Texto curto exibido no card da listagem" },
      { "key": "description", "label": "Descrição completa", "type": "textarea", "translatable": true,  "position": 4 },
      { "key": "cover_image_url", "label": "Foto de capa",  "type": "image_url","translatable": false, "position": 5 },
      { "key": "benefits",    "label": "Benefícios",         "type": "list",     "translatable": true,  "position": 6 },
      { "key": "for_whom",    "label": "Para quem é",        "type": "textarea", "translatable": true,  "position": 7 },
      { "key": "details",     "label": "Detalhes",           "type": "details",  "translatable": true,  "position": 8, "options": { "max": 10 } },
      { "key": "faq",         "label": "Perguntas frequentes","type": "faq",     "translatable": true,  "position": 9, "options": { "max": 15 } },
      { "key": "cta_text",    "label": "Texto do botão CTA", "type": "text",     "translatable": true,  "position": 10 },
      { "key": "cta_url",     "label": "Link do botão CTA",  "type": "url",      "translatable": false, "position": 11 }
    ],
    "content": {
      "title": { "pt": "Mentoria Individual", "en": "Individual Mentoring" },
      "tag": { "pt": "Desenvolvimento pessoal", "en": "Personal development" },
      "summary": { "pt": "Sessões individuais focadas no seu crescimento", "en": "Individual sessions focused on your growth" },
      "cover_image_url": "https://...",
      "cta_url": "/contato"
    }
  }
]
```

---

## events

```json
"events": [
  {
    "slug": "retiro-2025",
    "title": "Retiro de Inverno",
    "description": "Três dias de imersão...",
    "event_date": "2025-07-15T09:00:00Z",
    "location": "Sítio da Serra, MG",
    "cover_image_url": "https://...",
    "registration_open": true
  }
]
```

---

## newsletter_subscribers

```json
"newsletter_subscribers": [
  { "email": "maria@email.com", "name": "Maria Silva" }
]
```

---

## Notas

- Todos os `upsert` usam a key natural como critério de identidade — reexecutar o import atualiza os dados existentes
- Campos (`fields`) nunca são deletados pelo import — apenas criados/atualizados
- Para remover um campo, use `DELETE /api/admin/sections/{id}/fields/{fieldId}`
- O import preserva campos criados manualmente no admin que não estão no JSON
