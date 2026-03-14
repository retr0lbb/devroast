# Plano de Banco de Dados: DevRoast

Este documento detalha o planejamento do banco de dados para a aplicação **DevRoast**, com base no design fornecido, utilizando PostgreSQL provisionado via Docker Compose e Drizzle como ORM.

## 1. Análise do Design e Entidades
Analisando as telas fornecidas no design JSON (`Screen 1 - Code Input` e `Screen 2 - Roast Results`), extraímos os seguintes requisitos de dados:

- **Submissão de Código:** O usuário envia um texto (código), com ou sem a opção *roast mode* ativada.
- **Resultado do Roast:** Depois de processado (provavelmente por IA), gera-se:
  - Uma nota (ex: `3.5/10`)
  - Um veredito / selo (ex: `needs_serious_help`)
  - Um texto de análise / xingamento (ex: `"this code looks like it was written during a power outage... in 2005."`)
  - Metadados detectados (linguagem, quantidade de linhas).
- **Leaderboard (Shame Board):** Uma listagem com os piores códigos. Exibe: Posição (Rank), Score, trecho do Código e Linguagem.

### Entidade Principal: `roasts` (ou `submissions`)
Armazena tanto os dados de entrada quanto o resultado do processamento da IA para a exibição na Leaderboard e página de resultados.

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | `uuid` (PK) | Identificador único do roast, ideal para rotas de compartilhamento (ex: `/roast/123e4567...`). |
| `code_snippet` | `text` | O código original inserido pelo usuário. |
| `language` | `varchar(50)` | Linguagem detectada (ex: `javascript`, `sql`, `typescript`, `python`). |
| `lines_count` | `integer` | Quantidade de linhas computadas antes/durante o roast. |
| `is_roast_mode` | `boolean` | Flag marcando se a submissão usou *roast mode* (sarcasmo máximo). |
| `score` | `numeric(3, 1)` | Nota do código. De 0.0 a 10.0. Ex: `1.2`, `4.5`. |
| `verdict` | `varchar(100)` | Título/badge de julgamento (ex: `needs_serious_help`). |
| `roast_summary` | `text` | A citação principal da análise (o texto da "patada"). |
| `created_at` | `timestamp` | Data de criação. Necessário para ordenar ou expirar se necessário. |

---

## 2. Configuração do Docker Compose

Para o ambiente de desenvolvimento local, planejamos subir uma instância do PostgreSQL versão 16.

**Sugestão de arquivo `docker-compose.yml` (raiz do projeto):**

```yaml
version: '3.8'

services:
  database:
    image: postgres:16-alpine
    container_name: devroast_db
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root
      POSTGRES_DB: devroast
    ports:
      - "5432:5432"
    volumes:
      - devroast_pgdata:/var/lib/postgresql/data

volumes:
  devroast_pgdata:
```

Ao rodar `docker compose up -d`, a string de conexão para o arquivo `.env.local` ficará:
`DATABASE_URL="postgres://root:root@localhost:5432/devroast"`

---

## 3. Planejamento do Drizzle ORM

O Drizzle fornecerá a camada tipada e o controle completo via *Next.js Server Actions* (ou rotas de API).

### Scripts de Setup e Pacotes Necessários
```bash
# Dependências de execução
pnpm add drizzle-orm postgres 

# Dependências de desenvolvimento e migração
pnpm add -D drizzle-kit tsx @types/pg
```

### Arquivo de Configuração (`drizzle.config.ts`)
```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
```

### Schema Principal (`src/db/schema.ts`)
Definição da tabela mapeando para os dados exigidos pela UI.

```typescript
import { pgTable, uuid, text, varchar, integer, boolean, numeric, timestamp } from 'drizzle-orm/pg-core';

export const roasts = pgTable('roasts', {
  id: uuid('id').defaultRandom().primaryKey(),
  codeSnippet: text('code_snippet').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  linesCount: integer('lines_count').notNull(),
  isRoastMode: boolean('is_roast_mode').default(false).notNull(),
  
  // Campos resultantes da IA
  score: numeric('score', { precision: 3, scale: 1 }).notNull(),
  verdict: varchar('verdict', { length: 100 }), // ex: needs_serious_help
  roastSummary: text('roast_summary').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 4. Estratégia de Acesso a Dados no Next.js App Router

Com a arquitetura App Router solicitada pelas regras do projeto (`Next.js 16` e `React Compiler`), o fluxo ocorrerá em Server Components e Server Actions.

1. **Client (Screen 1):** O usuário preenche o `CodeEditor`, o estado do _toggle_ de veredito é capturado, e um `action` aciona um endpoint/função de servidor repassando os dados.
2. **Server Action / Route Handler:**
   - Realiza integração com a IA (OpenAI, Gemini, ou outra LLM) para gerar o *roast*, o *score*, e o *verdict*.
   - Utiliza a conexão do Drizzle configurada (`src/db/index.ts` instanciando o `postgres`) para inserir a nova linha na tabela `roasts`.
   - Retorna o `ID` inserido ou faz _redirect_ para `/roast/[id]`.
3. **Página de Resultados / Leaderboard (Screen 2):**
   - Na respectiva `page.tsx`, o Server Component usa o Drizzle para realizar a busca de leitura (`db.select().from(roasts).where(eq(roasts.id, params.id))`).
   - Leaderboard exibe `db.select().from(roasts).orderBy(asc(roasts.score)).limit(10)` para encontrar "os piores classificados por vergonha" exibidos no design (`Score 1.2`, `1.8`, etc).

---
*Nenhuma alteração de código foi realizada, este é estritamente o plano de integração para seguir com a arquitetura definida no design em JSON.*
