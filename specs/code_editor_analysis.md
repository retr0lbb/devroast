# Análise de Arquitetura: Code Block Formatter (Paste-and-View)

Com base nos novos requisitos fornecidos, o cenário mudou: o componente não necessita ser um "Editor de Código" completo com funcionalidades de IDE. O fluxo principal simplificou: **o usuário apenas cola o texto do código e visualiza o mesmo formatado.**

**Requisitos e Ferramentas Definidos:**
- **Comportamento:** Sem ferramentas ricas de edição; foco total em colar e renderizar.
- **[Shiki](https://shikijs.github.io/shiki/):** Para o *Syntax Highlighting* (Realce de sintaxe) e colorização final exata. (Já suportado no projeto com o tema `vesper`).
- **[Highlight.js](https://highlightjs.org/):** Utilizado primariamente como o motor heurístico preditivo para **detectar automaticamente a linguagem** do código inserido (`hljs.highlightAuto`).

Abaixo, detalhamos as opções de arquitetura viáveis para integrar estas ferramentas no React/Next.js:

---

## 1. Abordagem "Modos de Visualização" (Edit Mode vs Preview Mode) *[MAIS INDICADA]*
Nesta abordagem, a interface intercala dois estados distintos:
1. **Modo Edição (Inicial):** Um elemento monocromático e simples (ex: `textarea` do Tailwind) focado apenas em receber o input (digitação curta ou _paste_).
2. **Modo Preview (Formatado):** Assim que o código é colado (detectado por _onPaste_ ou por um temporizador _debounce_), o elemento de input é ocultado e cede o exato espaço em tela para a estrutura rica gerada pelo `shiki`. Um "clique" sobre o código pode retornar ao modo de edição para correções.

- **Prós:** 
  - Evita gargalos críticos da assincronia inerente ao `shiki` (que demora milissegundos convertendo strings longas em ASTs/HTML).
  - Controle exato de UX/UI sem necessitar manipulações complicadas no DOM.
  - Perfeitamente alinhado com o requisito "colar o código e ver formatado".
- **Contras:** 
  - Durante o breve momento em que a pessoa estiver digitando manualmente, o código aparecerá sem colorização.

## 2. Abordagem "Textarea Transparente" (Falso Editor)
Aqui recriamos uma ilusão de edição ao vivo. Um `<textarea>` invisível (com `color: transparent` e `caret-color: var(--color-white)`) sobrepõe perfeitamente o HTML do componente `shiki`. 

- **Prós:** 
  - Mantém a experiência de "estar editando com as cores ativas" ao fundo.
- **Contras:** 
  - Requer alinhamento de pixels incrivelmente preciso (fonts, line-heights, letter-spacing e paddings devem ser milimétricos entre o `<textarea>` e o `<pre><code>`).
  - Sincronizar as barras de rolagem (Scroll synchronization) de dois componentes (o input escondido em cima e o renderizado embaixo) frequentemente causa quebras visuais (bugs) em diferentes sistemas operacionais.
  - Por conta do Shiki rodar assincronamente e na thread principal, entradas de texto muito sucessivas e rápidas causam atrasos perceptíveis ("flickering" das palavras coloridas não acompanhando as bordas selecionadas transparentes).

## 3. ContentEditable
Um espaço onde a div inteira recebe a flag nativa do HTML `contenteditable="true"`, formatando o HTML interno a todo o instante com as spans de _tokens_ colorizadas do Shiki.

- **Prós:** Elimina a necessidade de elementos sobrepostos.
- **Contras:** Mexer com a posição do "cursor do mouse (Caret)" dentro de uma tag que tem dezenas de filhos atualizando a cada milissegundo pelo React causa perda do cursor no final da linha constantemente (é o formato com a engenharia mais cara e frágil no ecosistema React aberto).

---

## 🛠️ Resolução do Sistema de Autodetecção (Highlight.js + Shiki)

A mágica no momento em que o usuário **colar** (Paste) rodará a seguinte pipeline baseada nas bibliotecas exigidas:

1. **Captura:** O Listener reage recuperando o termo colado (ex: const `snippet`).
2. **Adivinhação de Linguagem (Highlight.js):** 
   ```typescript
   // O highlightAuto tenta parsear o texto e retorna a linguagem que obteve a maior confiabilidade (Relevância).
   const detection = hljs.highlightAuto(snippet);
   const resolvedLang = detection.language || "text"; // ex: 'js', 'py'
   ```
3. **Mapeamento para Shiki:** Como a nomenclatura ocasionalmente diverge, é montado um mapa interno relacionando as siglas do `highlight.js` validando de encontro aos bundlers aceitos no `shiki`.
4. **Colorização e Render (Shiki):**
   ```tsx
   // Geração estática do bloco ou executado via Server Action
   const htmlCode = await shiki.codeToHtml(snippet, {
     lang: mappedLanguage,
     theme: 'vesper'
   });
   ```

---

## ✅ TODOs (Plano de Implementação Prático)

- [ ] Aprovar com o time focar na Abordagem de **Modos de Visualização** (#1) para simplificar e garantir altíssima performance.
- [ ] Instalar da biblioteca isolada base de detecção: `@types/highlight.js` e `highlight.js` no `package.json`.
- [ ] Construir o Componente client-side `CodeBlockWrapper.tsx` contendo o estado do string do código de entrada.
- [ ] Definir evento de `onPaste` ou usar _callback_ de tempo limite pós-mudança (Debounce) não bloqueante para acionar:
  1. Extração `highlightAuto(...)`.
  2. Acionamento da API/Hook do `shiki` gerando a marcação colorida final.
- [ ] Estilizar a "janela externa" que englobará esse input contendo a numeração estática das linhas `1..N` mapeada a partir de contagem explícita de `\n` inseridos.
