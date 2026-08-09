# CFO Insights — Executive Guest Experience

Convite individual para os clientes que **Erick Pomin** escolheu pessoalmente para o CFO Insights AI Edition 2026.

| Rota | Versão |
| --- | --- |
| `/guest/[slug]` | **v3 — atual.** Fotografia real do evento, dados oficiais, recado do Erick no topo, CTA que acompanha o scroll |
| `/v2/guest/[slug]` | v2 — placas abstratas geradas por script (reprovada, mantida para comparação) |
| `/v1/guest/[slug]` | v1 — só tipografia e luz, sem imagem |

As três leem o mesmo convite e compartilham gate, credencial, aceite, estados e analytics.

Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Motion · Lenis.

```bash
npm install && npm run dev
```

---

## Painel interno — `/admin`

Rota **não linkada** em nenhuma página pública e marcada como `noindex`.

Configure a senha antes do primeiro uso:

```bash
cp .env.local.example .env.local   # e troque o valor de ADMIN_PASSWORD
```

Reinicie o servidor. Sem `ADMIN_PASSWORD` (mínimo 8 caracteres) o painel não abre e a API responde 503.

O que dá para fazer lá:

- **Cadastrar, editar e excluir convites** com os dados variáveis do convidado, da empresa, do relacionamento e do ingresso. Foto do convidado e logo da empresa são enviadas por upload; dados globais do evento e concierge usam os padrões de `lib/event.ts`.
- **Copiar link** de cada convite.
- **Enviar pelo WhatsApp**: o botão abre o WhatsApp já com o número do convidado e a mensagem pronta com o link individual — é o fluxo de "um por um" do concierge.
- Buscar por nome, empresa, link ou código.

A senha vira um cookie `httpOnly` com hash SHA-256 (a senha nunca trafega depois do login) e a comparação é em tempo constante. Toda rota `/api/admin/*` valida o cookie.

O painel grava em `data/invitations.json`. Em produção use um volume persistente ou troque as funções de [lib/invitations.server.ts](lib/invitations.server.ts) por banco.

---

## Como cadastrar um convite novo (CLI)

Alternativa ao painel, útil para carga em lote:

```bash
npm run invite -- --name "Carla Ribeiro" --company "Nexon Varejo" --tier CAMAROTE
```

Saída:

```
✓ Convite criado
  Convidado   Carla Ribeiro
  Empresa     Nexon Varejo
  Categoria   CAMAROTE (R$ 1.897)
  Guest ID    CFO-000306
  Link        /guest/carla-ribeiro-nexon
```

Opções:

| Flag | Para quê |
| --- | --- |
| `--tier` | `ARQUIBANCADA` · `MESA` · `CAMAROTE` (define o valor automaticamente) |
| `--position` | Cargo do convidado ("CFO", "Diretora Financeira") |
| `--brand` | `Solutta` · `Auditto` · `Grupo Pomin` |
| `--since` | Cliente desde ("2021") |
| `--ae` | Executivo de conta |
| `--reason` | **O texto pessoal do Erick, em primeira pessoa.** Sem isso entra um fallback elegante |
| `--expires` | Reserva até ("15/09/2026") |
| `--status` | `AVAILABLE` · `ACCEPTED` · `EXPIRED` · `CANCELLED` |
| `--slug` | Força um slug específico |
| `--gender` | `M` · `F` — "convidado/convidada", "bem-vindo/bem-vinda" |
| `--companyGender` | `M` · `F` — "do Grupo Pomin" / "da XPTO Alimentos" |
| `--whatsapp` | Número do convidado, para o concierge enviar o link |
| `--email` | E-mail do convidado (pré-preenche o formulário de aceite) |
| `--photo` | Retrato do convidado — aparece ao lado do Erick na abertura |
| `--logo` | Logo da empresa — aparece no rodapé da abertura |

**Na mão**: adicione um objeto em [data/invitations.json](data/invitations.json) seguindo o formato dos existentes. O `invite_slug` é o que vira a URL.

Em desenvolvimento o convite passa a existir na hora. Em produção, o JSON é lido no build — publicar o arquivo é o que ativa o link. Quando virar volume, troque `getInvitation` em [lib/invitations.ts](lib/invitations.ts) por consulta ao banco/CRM: nenhum componente conhece a origem do dado.

> `--reason` é o campo mais importante do cadastro. É o que transforma um convite em reconhecimento. Escreva na voz do Erick, em primeira pessoa, citando algo real da relação.

---

## Dados do evento

Tudo em [lib/event.ts](lib/event.ts), conferido contra https://www.cfoinsights.com.br em 09/08/2026.

- **Data**: 22 e 23 de setembro de 2026 · **Local**: Vibra SP
- **Claim**: "Em 2026, toda empresa tem IA. Quase nenhuma tem um CFO que sabe o que fazer com ela."
- **Números**: 1.500 participantes · +500 líderes financeiros · +15 especialistas · 2 dias
- **Trilhas**: Reforma Tributária · CFO Command Center · Treasury & Payments · Risk & Capital
- **21 palestrantes** com nome, cargo e empresa exatos
- **Ingressos**: Arquibancada Inferior R$ 497 · Mesa R$ 997 · Camarote R$ 1.897
- **Empresas de 2025** e **patrocinadores 2026** por cota

Ao atualizar qualquer um desses, confira contra o site. Nada aqui é inventado.

---

## Imagens

| Pasta | O quê |
| --- | --- |
| `public/event/` | Fotografia real do CFO Insights 2025 — usada pela v3 |
| `public/event/speakers/` | Retratos oficiais 2026 (Erick Pomin, João Paulo, Gustavo Mendes) |
| `public/event/logos/` | Logos das empresas dos palestrantes |
| `public/mock/` | Placas abstratas geradas por `npm run plates` — só a v2 usa |

Caminhos em [lib/media.ts](lib/media.ts). Para trocar uma foto, altere o `src` ali — nenhum componente muda.

[Plate.tsx](components/cfo-invite/Plate.tsx) é o único componente que toca imagem: parallax, ken burns, scrim, dessaturação e fade-in. Migrar para `next/image` é uma edição só ali.

**As fotos atuais têm 768×512 e 720×1080.** Para o hero full-bleed em telas grandes o ideal é ≥1920px de largura. Se houver originais em alta, é só substituir mantendo o nome do arquivo.

---

## Onde plugar o backend

- [lib/invitations.ts](lib/invitations.ts) → `getInvitation(slug)` e `acceptInvitation(slug, payload)`
- [app/api/guest/[slug]/accept/route.ts](app/api/guest/[slug]/accept/route.ts) → grava o aceite (hoje valida e devolve `ok`)

Contrato em [lib/types.ts](lib/types.ts). Campos novos entram como opcionais.

---

## Analytics

[lib/analytics.ts](lib/analytics.ts) empurra para `window.dataLayer`. Todo evento leva `guest_id`, `invite_tier`, `relationship_brand` e `company_id`. Nome, e-mail e telefone não vão para analytics.

`invite_page_view` · `invite_gate_opened` · `invite_experience_started` · `invite_scroll_25/50/75/100` · `erick_video_started` · `erick_video_completed` · `speaker_interaction` · `invite_accept_clicked` · `invite_accepted` · `concierge_clicked`

---

## Movimento

- **GSAP + ScrollTrigger**: abertura, scroll storytelling, pinning via `sticky` + `scrub`, parallax, reveals
- **Motion**: microinterações, hover, cartão 3D, overlay do aceite, CTA flutuante
- **Lenis**: smooth scroll sincronizado com `ScrollTrigger` pelo `gsap.ticker`

`prefers-reduced-motion` desliga Lenis, o gate cinematográfico e todo scrub — as seções sticky trocam por versões estáticas equivalentes. Nada some.

---

## Estados do convite

| Status | Comportamento |
| --- | --- |
| `AVAILABLE` | Experiência completa, CTA fixo e flutuante |
| `ACCEPTED` | Gate diz "Bem-vindo de volta", confirmação + concierge no lugar do CTA |
| `EXPIRED` | Tela própria: "Este convite não está mais reservado." |
| `CANCELLED` | Tela própria, sem detalhe técnico |
| slug inexistente | 404 com tela própria |

---

## Estrutura

```
app/
  guest/[slug]/page.tsx        v3 (atual)
  v2/guest/[slug]/page.tsx     v2
  v1/guest/[slug]/page.tsx     v1
  api/guest/[slug]/accept/     aceite (stub validado)
components/cfo-invite/         base compartilhada + Plate
components/cfo-invite/v3/      a experiência atual
components/cfo-invite/v2/      congelada
data/invitations.json          os convites
lib/                           tipos, evento, mídia, formatação, analytics, GSAP
scripts/add-invite.mjs         cadastro de convite
scripts/gen-mock-plates.mjs    placas da v2
```
