# Integração tRPC com Next.js Server Components

Esta spec define a arquitetura para integrar o **tRPC** com **TanStack React Query** no nosso projeto Next.js App Router, garantindo tipagem de ponta-a-ponta e suporte nativo a React Server Components (RSC).

## Análise

Para utilizar tRPC efetivamente no Next.js App Router (onde componentes são Server Components por padrão), precisamos de uma configuração híbrida:
- **Server Components:** Devem poder invocar procedures do tRPC diretamente no backend sem realizar requisições HTTP (chamadas diretas à função via `createCaller`), ou realizar *prefetching* e desidratação (dehydration) para repassar o estado ao cliente.
- **Client Components:** Consomem as procedures tradicionalmente via hooks do React Query (`useQuery`, `useMutation`), beneficiando-se do cache no navegador.

**Abordagem Escolhida:**
Seguindo a documentação oficial (`@trpc/tanstack-react-query/server-components`), criaremos módulos dedicados na pasta `src/trpc/` para separar a lógica do servidor, cliente e Query Client.

## Plano de Implementação

### 1. Dependências
As ferramentas base para essa stack (além do React Query):
```bash
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query@latest superjson client-only server-only
```
*(Nota: `superjson` é essencial para serializar objetos complexos como `Date` ou `Map` entre Server e Client components de forma transparente).*

### 2. Estrutura de Arquitetos (`src/trpc/`)

- **`src/trpc/init.ts` (Core)**
  - Inicializa o contexto base (`createTRPCContext`), recebendo headers ou sessão.
  - Inicializa o objeto do tRPC (`initTRPC.create()`) configurando o `superjson`.
  - Exporta os helpers: `createTRPCRouter`, `baseProcedure`.

- **`src/trpc/routers/_app.ts` (Router Principal)**
  - Centraliza todas as rotas da nossa API (ex: `roasts`, `leaderboard`).
  - Exporta o tipo `AppRouter` crucial para a inferência no frontend.

- **`src/trpc/query-client.ts` (Fábrica do React Query)**
  - Exporta `makeQueryClient()` configurado nativamente.
  - Configurado com `defaultShouldDehydrateQuery` para suportar RSC transportando promises não finalizadas.

- **`src/trpc/client.tsx` (Client-side Hooks & Provider)**
  - Cria o proxy de hooks: `createTRPCContext<AppRouter>()`.
  - Componente `TRPCReactProvider` instanciando Singleton seguro do `QueryClient` e `httpBatchLink`.
  - Este provider deve envelopar os `{children}` no `src/app/layout.tsx`.

- **`src/trpc/server.ts` (Server-side Caller)**
  - Utiliza `server-only` para garantir segurança.
  - Cria um proxy com `createTRPCOptionsProxy` injetando o contexto do Request atual para prefetching.
  - Cria e exporta um `caller` direto via `appRouter.createCaller()` para *data fetching* cru e direto nos Server Components (ex: buscar Roasts sem cache do React Query acoplado ao client).

### 3. API Route
- **`src/app/api/trpc/[trpc]/route.ts`**
  - O App Router adapter oficial: `fetchRequestHandler`.

## Fluxos de Uso Propostos

**Fetching no Cliente (Ex: Botão de Roast interativo)**
```tsx
'use client'
import { useTRPC } from '@/trpc/client';

export function CodeSubmit() {
  const { trpc } = useTRPC();
  const mutation = trpc.roasts.create.useMutation();
  // ...
}
```

**Fetching no Servidor (Ex: Leaderboard Page Estática/Cacheada)**
```tsx
import { caller } from '@/trpc/server';

export default async function LeaderboardPage() {
  const topRoasts = await caller.roasts.getTop();
  // Server-side fetching direto e tipado, zero HTTP overhead local.
}
```

## TODOs

- [ ] Aproximar permissão para instalação das dependências citadas.
- [ ] Criar e espelhar os 5 arquivos internos da arquitetura em `src/trpc/`.
- [ ] Criar a rota Handler em `src/app/api/trpc/...`.
- [ ] Envolver o `layout.tsx` com o `TRPCReactProvider`.
- [ ] Criar uma procedure `hello` básica estilo ping-pong para refatorarmos confirmando comunicação End-to-End.
