# Página de Resultados (Roast Results)

Esta funcionalidade exibe o resultado da análise de um código submetido, correspondente à "Screen 2 - Roast Results" no arquivo de design.

## Análise

A página é dividida em blocos visuais distintos que apresentam diferentes aspectos da avaliação:
1. **Hero Section:** Mostra o `ScoreRing` (nota de 0 a 10), um `Badge` com o veredito geral, o texto principal do roast ("patada") e um botão de compartilhamento.
2. **Submitted Code:** O código original que foi avaliado, renderizado com o componente `CodeBlock` já existente.
3. **Analysis Section:** Uma grade (grid) de cards detalhando problemas específicos encontrados no código. Utiliza o componente `AnalysisCard` e classifica os problemas através de `Badge` (critical, warning, good).
4. **Suggested Fix (Diff):** Uma visão comparativa mostrando como o código pode ser melhorado, utilizando o componente `DiffLine`.

Felizmente, todos os blocos base de UI (`ScoreRing`, `AnalysisCard`, `DiffLine`, `CodeBlock`, `Badge`) já existem na biblioteca de componentes (`src/components/ui`), o que simplifica a implementação, bastando compor estes componentes na página.

## Plano de Implementação

Neste momento, a página será implementada estaticamente para fins de visualização do layout, sem integração com o banco de dados (Drizzle).

### [NEW] `src/app/roast/[id]/page.tsx`

Criar a página de resultados em uma Rota Dinâmica (Dynamic Route) no Next.js App Router para simular o comportamento final onde `[id]` será o identificador da submissão. 

**Estrutura do Layout:**
- Usa padding generoso (`px-20 py-10`) e um layout vertical com gap global.
- Divisores (`border-t border-border-primary`) separam as seções de Código, Análise e Diff.

**Dados Estáticos de Exemplo (Mock):**
- **Score:** 3.5/10. Veredito: `needs_serious_help`. 
- **Resumo:** *"this code looks like it was written during a power outage... in 2005."*
- **Código Submetido:** Uma função Javascript problemática (usando `var`, loops imperativos, etc).
- **Problemas (Issues):**
  - Crítico: Uso de `var` ao invés de `const`/`let`.
  - Aviso: Padrão imperativo de repetição.
  - Bom: Nomes de variáveis claros.
  - Bom: Responsabilidade única da função.
- **Diff:** Exemplo prático do "antes" (vermelho/removido) e "depois" (verde/adicionado).

## TODOs

- [ ] Atualizar o arquivo `task.md` do projeto com as etapas desta especificação.
- [ ] Criar o arquivo de página `src/app/roast/[id]/page.tsx`.
- [ ] Implementar o layout estático utilizando os componentes da pasta `ui`.
- [ ] Verificar renderização visual acessando a página no navegador.
