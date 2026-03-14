# Specs — Guia de Especificações

Specs são documentos de planejamento criados **antes** da implementação de uma nova feature.

## Formato

```markdown
# [Título da Feature/Análise]

Parágrafo curto descrevendo o problema e o objetivo.

## Análise

Contexto técnico, opções consideradas (com prós/contras), e decisão tomada.

## Plano de Implementação

Detalhes técnicos: schemas, componentes, fluxo de dados, snippets de código relevantes.

## TODOs

- [ ] Lista de tarefas concretas para implementação
```

## Regras

- **Idioma:** Português
- **Naming:** `snake_case.md` (ex: `database_plan.md`, `code_editor_analysis.md`)
- **Escopo:** Um arquivo por feature ou decisão arquitetural
- **Código:** Incluir snippets quando ajudar a ilustrar a solução proposta
- **Sem implementação:** Specs são planos, não código final
