# Ecossistema Top Max

Sistema de gestão com agentes especializados. Todos leem e escrevem no mesmo
banco (Supabase), e o painel admin mostra tudo. A regra: **os agentes operam,
você vende**. Eles só te chamam nas exceções.

```
 Site (cotação + chat) ──┐
 Instagram (fase 5) ─────┼──► LEADS ──► PEDIDOS ──► ARMAZÉM ──► EXPEDIÇÃO
 WhatsApp (fase 6) ──────┘                 │
                                            └──► GERENTE (relatórios + melhorias)
```

## Status

| Fase | Entrega | Status |
|---|---|---|
| 1 | Pedidos: kanban, fases, histórico, pedidos travados | ✅ Pronto (falta rodar SQL) |
| 1 | Cotação no site: cliente monta a cotação com produtos do catálogo | ✅ Pronto (falta rodar SQL) |
| 2 | Agente de Atendimento no site (chat com IA) | ✅ Pronto (falta SQL + chave de IA) |
| 3 | Agente de Armazém (estoque, endereçamento, leitura de invoice) | ⏳ Próximo |
| 4 | Agente Gerente (resumo diário, relatórios semanal/mensal/anual) | ⏳ |
| 5 | Agente de Conteúdo Instagram | ⏳ |
| 6 | Agente WhatsApp (quando houver o chip) | ⏳ |

## O que você precisa fazer (uma vez só)

### 1. Rodar os SQL no Supabase (5 minutos)
Supabase → SQL Editor → cole e execute **nesta ordem**:

1. `supabase/migrations/create_orders.sql`
2. `supabase/migrations/create_quote_requests.sql`
3. `supabase/migrations/create_chat_messages.sql`

### 2. Criar ao menos uma chave de IA gratuita (10 minutos)
Com mais de uma chave, o sistema troca sozinho de provedor se um falhar.

| Provedor | Onde criar | Variável |
|---|---|---|
| NVIDIA | build.nvidia.com → Settings → API Keys | `NVIDIA_API_KEY` |
| Google Gemini | aistudio.google.com → Get API key | `GEMINI_API_KEY` |
| Groq | console.groq.com → API Keys | `GROQ_API_KEY` |

Coloque as chaves em **dois lugares** (nunca mande por chat nem commite):
- `.env.local`, para rodar no computador
- Vercel → Project → Settings → Environment Variables, para o site publicado

> Planos gratuitos têm limites e podem mudar. O Gemini gratuito pode usar os
> dados para treinar modelos. Por isso o chat não pede dado sensível.

### 3. Publicar
Revisar e fazer merge da branch `fase-1-pedidos` na `main`. A Vercel publica sozinha.

## Como funciona

### Pedidos (`/admin/pedidos`)
- Fases: Lead → Cotação enviada → Negociação → Aprovado → Pagamento confirmado → Separação → Expedido → Entregue (+ Cancelado).
- Cada mudança de fase fica gravada em `order_events`. Isso alimenta os relatórios.
- **Pedido travado:** ficou na fase além do prazo (ex.: cotação sem resposta há 3 dias). Os prazos ficam em `src/lib/orders.ts`.
- No CRM, o botão **Criar pedido** transforma um lead em pedido.

### Cotação no site
- O cliente clica em **Adicionar à cotação** nos produtos, informa as quantidades e o contato.
- A função `submit_quote_request` cria **lead + pedido + itens** de uma vez, com validação e limite anti-abuso.
- O pedido aparece no kanban na fase **Lead**, com origem `site_cotacao`.

### Agente de Atendimento (chat do site)
- O conhecimento vem do banco: produtos publicados, empresa, processo e mercados. Atualizou no painel, o agente já sabe (cache de 5 minutos).
- Regras: nunca inventa preço, prazo ou estoque. Sempre conduz para a cotação ou para captar o contato.
- Produtos citados na conversa viram botões "Adicionar à cotação".
- Sem IA disponível, oferece o formulário de contato e o WhatsApp. O cliente nunca fica sem saída.
- Conversas ficam em `chat_messages`, e os contatos viram leads com origem `site_chat`.
- Código: `src/lib/ai.ts` (provedores), `src/lib/sales-agent.ts` (conhecimento e regras), `src/app/api/chat/route.ts`.
