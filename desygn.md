# Design System --- Outlook Calendar Lilac Edition

> **Objetivo:** especificar a interface de um calendário inspirado no
> Microsoft Outlook, com foco na visualização de semana útil (segunda a
> sexta) e identidade visual lilás baseada na cor `#A47DAB`.
>
> **Diretriz central:** preservar a estrutura, a hierarquia e os padrões
> de interação familiares do Outlook, usando o lilás como cor de
> identidade e destaque --- não como cor dominante de todas as
> superfícies.

---

## 1. Princípios de design

1.  **Familiaridade:** a organização da interface deve remeter ao
    Outlook Calendar: barra superior, navegação lateral, controles de
    calendário, cabeçalho dos dias e grade de horários.
2.  **Baixo ruído visual:** superfícies majoritariamente brancas ou
    neutras; cores fortes ficam reservadas para ações, seleção e
    indicadores.
3.  **Hierarquia clara:** distinguir navegação, datas, horários, eventos
    e estados interativos.
4.  **Consistência:** componentes equivalentes devem compartilhar
    tokens, espaçamentos, bordas e comportamentos.
5.  **Legibilidade:** não reduzir textos essenciais a tamanhos
    excessivamente pequenos. Informações secundárias podem ser
    discretas, mas devem continuar legíveis.
6.  **Interação previsível:** botões, menus, eventos e controles devem
    apresentar estados de hover, foco, pressionado, selecionado e
    desabilitado quando aplicável.
7.  **Acessibilidade:** toda ação deve ser utilizável por teclado e
    possuir nome acessível; cores não devem ser o único meio de
    transmitir informação.
8.  **Responsividade:** adaptar a quantidade de dias exibidos e a
    navegação em telas menores, sem comprimir cinco colunas até
    comprometer a leitura.

---

## 2. Design tokens

Os tokens abaixo são a fonte única de verdade para cores, tipografia,
espaçamento, dimensões e elevação. Evitar valores avulsos nos
componentes quando houver um token equivalente.

### 2.1. Cores

#### Marca e ações

---

Token Valor Uso

---

`--color-brand` `#A47DAB` Identidade lilás,
detalhes de marca e
elementos decorativos

`--color-primary` `#855F8C` Ações primárias com
texto branco e estados
ativos

`--color-primary-hover` `#764F7E` Hover de ações
primárias

`--color-primary-pressed` `#684371` Estado pressionado

`--color-primary-subtle` `#F3ECF5` Hover suave, seleção
discreta e fundos
auxiliares

`--color-primary-selected` `#E9DCEE` Seleção de item ou data

`--color-primary-border` `#CDB8D2` Bordas de seleção e
realces

---

#### Superfícies e texto

---

Token Valor Uso

---

`--color-background` `#FFFFFF` Fundo principal

`--color-surface` `#FFFFFF` Grade, cartões e
popovers

`--color-sidebar` `#FAF8FB` Fundo da barra lateral

`--color-surface-hover` `#F7F4F8` Hover de linhas e itens
neutros

`--color-text-primary` `#29242B` Títulos e conteúdo
principal

`--color-text-secondary` `#5F5662` Texto auxiliar e
detalhes

`--color-text-muted` `#716873` Rótulos secundários e
datas fora do mês

`--color-text-disabled` `#9A929D` Conteúdo desabilitado

`--color-border` `#E5E1E7` Bordas e divisores
principais

`--color-border-subtle` `#F1EEF3` Divisores de baixa
ênfase

---

#### Calendário e eventos

---

Token Valor Uso

---

`--calendar-grid-line` `#E5E1E7` Linhas de hora cheia

`--calendar-grid-line-subtle` `#F1EEF3` Linhas intermediárias

`--calendar-today-bg` `#F8F2FA` Realce quase
imperceptível da coluna
de hoje

`--calendar-event-bg` `#EDE3F1` Fundo padrão de evento
lilás

`--calendar-event-border` `#8E6596` Borda lateral do evento
padrão

`--calendar-event-text` `#332738` Texto de evento

`--calendar-event-hover` `#E5D6EB` Hover de evento

`--calendar-event-selected` `#DCC8E3` Evento selecionado

`--calendar-current-time` `#D84C7A` Linha e ponto do
horário atual

---

#### Cores semânticas de calendário

As cores por calendário devem ser configuráveis. A cor identifica o
calendário, enquanto o fundo do evento deve ser claro o suficiente para
preservar a leitura.

Token de exemplo Valor Uso

---

`--calendar-color-lilac` `#A47DAB` Calendário pessoal
`--calendar-color-blue` `#4778B8` Trabalho
`--calendar-color-green` `#4F8A70` Pessoal/compromissos
`--calendar-color-orange` `#C47A3D` Lembretes ou categorias
`--calendar-color-red` `#B95C67` Categoria definida pelo usuário

Não atribuir significado fixo a uma cor sem uma legenda ou configuração
visível. Não depender exclusivamente da cor para distinguir calendários.

### 2.2. Contraste

- Texto normal deve atingir contraste mínimo de **4,5:1** com o fundo.
- Texto grande deve atingir contraste mínimo de **3:1**.
- Componentes gráficos essenciais e indicadores de foco devem atingir
  contraste mínimo de **3:1** em relação às cores adjacentes.
- Validar os pares reais de cor durante a implementação. Não presumir
  que `--color-brand` com branco atende aos requisitos de texto
  pequeno.
- Usar `--color-primary` ou outro tom validado para botões com texto
  branco.
- O lilás `#A47DAB` pode ser usado em superfícies, bordas e elementos
  de marca, desde que o texto sobre ele tenha contraste suficiente.

### 2.3. Tipografia

Priorizar Segoe UI, para manter proximidade com o ambiente Microsoft.
Usar fontes de fallback caso não esteja disponível.

```css
font-family:
  "Segoe UI",
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
```

---

Token Valor Uso

---

`--font-size-xs` `11px` Metadados compactos;
evitar para conteúdo
essencial

`--font-size-sm` `12px` Horários, rótulos e
detalhes de evento

`--font-size-md` `14px` Texto de interface e
navegação

`--font-size-lg` `16px` Botões, menus e
títulos de popover

`--font-size-xl` `20px` Título do mês e ano

`--font-size-2xl` `24px` Datas ou títulos em
destaque

---

Pesos: - `400`: texto padrão. - `500`: rótulos e controles. - `600`:
títulos e nomes de eventos. - `700`: reservar para ênfase pontual.

Usar alturas de linha adequadas, em geral entre `1.35` e `1.5` para
texto de interface.

### 2.4. Espaçamento

Usar uma escala baseada em múltiplos de 4px.

Token Valor

---

`--space-1` `4px`
`--space-2` `8px`
`--space-3` `12px`
`--space-4` `16px`
`--space-5` `20px`
`--space-6` `24px`
`--space-8` `32px`

### 2.5. Raios, bordas e sombras

---

Token Valor Uso

---

`--radius-sm` `4px` Botões compactos e
cartões

`--radius-md` `6px` Menus e campos

`--radius-lg` `8px` Popovers e diálogos

`--radius-pill` `999px` Botões em formato
pílula, quando
apropriado

`--shadow-popover` `0 8px 24px rgba(41, 36, 43, 0.14)` Menus, popovers e
diálogos

`--shadow-drag` `0 8px 20px rgba(41, 36, 43, 0.20)` Evento durante arraste

---

Usar sombras com moderação. A hierarquia deve vir principalmente de
espaçamento, bordas e contraste.

### 2.6. Dimensões do calendário

```css
--app-bar-height: 48px;
--calendar-toolbar-height: 56px;
--calendar-day-header-height: 72px;
--calendar-time-column-width: 64px;
--calendar-hour-height: 60px;
--calendar-event-gap: 2px;
--calendar-snap-minutes: 15;
--sidebar-width: 260px;
--sidebar-width-collapsed: 0px;
```

A altura de uma hora deve poder ser ajustada para acomodar densidades
diferentes de agenda. Não fixar a altura de eventos de forma
independente da escala da grade.

---

## 3. Estrutura geral da aplicação

A aplicação ocupa a área disponível da janela e evita rolagem global
desnecessária. A barra superior permanece fixa; a navegação lateral e a
área do calendário devem controlar suas próprias rolagens.

```css
.app {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-body {
  min-height: 0;
  flex: 1;
  display: flex;
}
```

### 3.1. Barra superior (Top App Bar)

**Altura:** `48px`\
**Fundo:** `--color-surface`\
**Borda inferior:** `1px solid var(--color-border)`\
**Texto e ícones:** `--color-text-primary`

A barra deve ter aparência neutra, próxima à organização do Outlook. O
lilás aparece nos estados ativos e nos detalhes da marca, em vez de
preencher obrigatoriamente toda a barra.

Elementos, da esquerda para a direita:

1.  Botão do inicializador de aplicativos ou menu.
2.  Marca/nome "Outlook" ou nome definido para o projeto.
3.  Campo de pesquisa.
4.  Ações de aplicativos, notificações, configurações e ajuda, se
    implementadas.
5.  Avatar ou menu do usuário, se houver autenticação.

Regras: - Alinhar verticalmente os elementos. - Manter espaçamento
consistente. - Campo de busca com altura aproximada de `32px`, borda
neutra e foco lilás. - Ícones com área clicável recomendada de pelo
menos `36 × 36px`. - Cada ícone deve ter tooltip e nome acessível. - Não
exibir ações sem funcionalidade real. Se uma ação ainda não estiver
implementada, ocultá-la ou apresentá-la claramente como indisponível. -
Em telas estreitas, reduzir ou recolher o campo de busca antes de
comprimir os controles.

### 3.2. Sidebar (navegação lateral)

**Largura desktop:** `260px`\
**Fundo:** `--color-sidebar`\
**Borda direita:** `1px solid var(--color-border)`

A sidebar deve conter:

1.  Botão "Novo evento".
2.  Mini-calendário mensal.
3.  Lista de calendários.
4.  Ação para adicionar ou gerenciar calendários, se disponível.

#### Botão "Novo evento"

- Largura disponível, respeitando `16px` de margem lateral.
- Altura aproximada de `40px`.
- Ícone de adição à esquerda.
- Fundo `--color-primary`.
- Texto branco com contraste validado.
- Raio entre `6px` e `999px`, conforme o estilo adotado no restante da
  interface.
- Hover: `--color-primary-hover`.
- Pressionado: `--color-primary-pressed`.
- Foco de teclado claramente visível.

Ao clicar, abrir o formulário de criação de evento. O botão não deve ser
apenas decorativo.

#### Mini-calendário

- Exibir o mês atual e controles para navegar entre meses.
- Grade de sete colunas, começando pelo dia da semana definido pela
  configuração regional.
- Cabeçalhos dos dias curtos e legíveis.
- Dia atual destacado com `--color-primary`.
- Data selecionada destacada com `--color-primary-selected`.
- Dias do mês anterior/próximo em tom secundário.
- Ao selecionar uma data, atualizar a data ou o intervalo visível na
  área principal.
- O mini-calendário deve permanecer sincronizado com a navegação da
  grade principal.

#### Lista de calendários

- Seção com título "Meus calendários" ou equivalente.
- Cada calendário possui controle de visibilidade, nome e indicador de
  cor.
- Usar uma cor por calendário, configurável pelo usuário.
- A ativação/desativação de um calendário deve mostrar ou ocultar seus
  eventos sem remover os dados.
- Estados de hover, foco e seleção devem ser visíveis.
- Não usar apenas uma checkbox lilás para todos os calendários: o
  indicador de cor deve corresponder ao calendário.
- Se houver muitos calendários, permitir rolagem interna da lista.

### 3.3. Área principal

A área principal ocupa o espaço restante.

```css
.calendar-main {
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}
```

A área principal contém: 1. Barra de ferramentas do calendário. 2.
Cabeçalho dos dias. 3. Faixa de eventos de dia inteiro, quando houver. 4. Grade de horários com rolagem vertical.

A barra de ferramentas e o cabeçalho dos dias permanecem visíveis
enquanto a grade de horários rola.

---

## 4. Barra de ferramentas do calendário

**Altura de referência:** `56px`\
**Padding horizontal:** `24px` em desktop

Elementos:

- Botão "Hoje".
- Navegação para período anterior e próximo.
- Título do período, por exemplo "28 de setembro -- 2 de outubro de
  2026".
- Seletor de visualização, como "Dia", "Semana de trabalho", "Semana"
  e "Mês", conforme as funcionalidades implementadas.
- Ações adicionais apenas quando realmente disponíveis.

Comportamento: - "Hoje" retorna ao período que contém a data atual. - As
setas avançam ou retrocedem conforme a visualização selecionada. - O
título deve refletir o intervalo real exibido. - O seletor deve indicar
visualmente a opção atual. - Em telas estreitas, permitir que o título
quebre ou seja abreviado sem sobrepor os controles.

Botões neutros: - Fundo transparente ou branco. - Borda
`1px solid var(--color-border)`. - Hover `--color-surface-hover`. - Foco
com indicador visível.

---

## 5. Cabeçalho dos dias

O cabeçalho permanece fixo acima da grade durante a rolagem vertical.

### 5.1. Layout

- Coluna de horários à esquerda, com largura
  `--calendar-time-column-width`.
- Cinco colunas de mesma largura para segunda a sexta na visualização
  "Semana de trabalho".
- Cada coluna deve alinhar exatamente com sua coluna de eventos.
- Separadores verticais discretos.

### 5.2. Conteúdo de cada dia

Exibir: - Nome abreviado do dia da semana. - Número do dia. -
Opcionalmente, mês quando necessário para esclarecer a mudança de mês.

Exemplo:

```text
       SEG       TER       QUA       QUI       SEX
        28        29        30         1         2
```

Estilo: - Dia da semana: `--font-size-sm`, peso `500`, cor
`--color-text-muted`. - Número: `--font-size-2xl`, peso `400`, cor
`--color-text-primary`. - Espaçamento vertical compacto e consistente.

### 5.3. Estado de hoje

- O número do dia atual recebe um círculo de aproximadamente
  `32 × 32px`.
- Fundo `--color-primary`.
- Texto branco, após validação de contraste.
- A coluna correspondente pode usar `--calendar-today-bg`, de forma
  quase imperceptível.
- A indicação de hoje não deve depender apenas da cor: o número e o
  contexto do cabeçalho também precisam permanecer claros.

### 5.4. Data selecionada

Distinguir a data selecionada de "hoje". A seleção pode usar fundo lilás
claro e contorno, sem substituir o indicador de data atual.

---

## 6. Faixa de eventos de dia inteiro

A faixa de eventos de dia inteiro fica entre o cabeçalho dos dias e a
grade horária.

Requisitos: - Ter uma área própria, alinhada às colunas dos dias. -
Exibir eventos que ocupam o dia inteiro. - Permitir eventos que
atravessam vários dias. - Representar eventos de vários dias como uma
barra contínua, quando possível. - Se houver mais eventos do que espaço
vertical disponível, mostrar um controle como "+3 mais" que permita
visualizar os demais. - Não misturar eventos de dia inteiro com eventos
que possuem horários. - A faixa pode crescer conforme a quantidade de
eventos, mas deve evitar deslocamentos inesperados durante a interação.

---

## 7. Grade de horários

### 7.1. Área rolável

Somente a área de horários deve rolar verticalmente. O cabeçalho dos
dias e a barra de ferramentas permanecem fixos.

A grade deve: - Usar a mesma largura de coluna do cabeçalho. - Permitir
rolagem vertical suave. - Começar e terminar nos horários definidos para
a visualização ou configuração do usuário. - Posicionar inicialmente a
rolagem próximo ao início do expediente ou ao horário atual, conforme a
experiência desejada.

### 7.2. Eixo de horários

- Largura: `--calendar-time-column-width`.
- Texto alinhado à direita.
- Padding à direita de `8px`.
- Fonte `--font-size-sm`.
- Cor `--color-text-secondary`.
- Rótulos alinhados à linha correspondente.

Formato de horário conforme a configuração regional, por exemplo `09:00`
ou `9 AM`.

### 7.3. Linhas horizontais

Hora cheia:

```css
border-top: 1px solid var(--calendar-grid-line);
```

Intervalo intermediário:

```css
border-top: 1px solid var(--calendar-grid-line-subtle);
```

- Preferir linhas sólidas e discretas.
- Não usar tracejado como padrão.
- Linhas de grade devem ficar visualmente atrás dos eventos.
- Evitar bordas tão escuras que concorram com os cartões.

### 7.4. Colunas dos dias

- Cinco colunas de largura igual na visualização desktop de semana
  útil.
- Divisores verticais de `1px solid var(--color-border)`.
- As colunas devem manter alinhamento com cabeçalho e faixa de dia
  inteiro.
- A coluna de hoje pode receber o realce sutil definido nos tokens.

### 7.5. Criação de evento pela grade

- Clique ou ativação por teclado em um intervalo vazio inicia a
  criação de evento com data e hora preenchidas.
- A posição vertical determina o horário inicial.
- O horário deve ser ajustado ao intervalo de encaixe definido por
  `--calendar-snap-minutes`.
- O comportamento deve ser consistente entre mouse, toque e teclado.
- Se a criação por arraste estiver habilitada, ela não pode impedir a
  seleção normal ou o uso por teclado.

---

## 8. Indicador do horário atual

O indicador só aparece na coluna correspondente ao dia atual e quando o
horário atual estiver dentro do intervalo de horas exibido.

Estilo: - Linha horizontal de `2px`. - Cor `--calendar-current-time`. -
Ponto de aproximadamente `8 × 8px` no início da linha. - Camada acima da
grade e abaixo de menus/popovers. - Não deve cobrir de forma excessiva o
conteúdo dos eventos.

Comportamento: - Calcular a posição usando o horário local e a escala da
grade. - Atualizar a posição periodicamente, no mínimo uma vez por
minuto. - Recalcular ao mudar o dia, fuso horário, escala de horas ou
tamanho da grade. - Não assumir que todos os dias têm a mesma duração em
situações de mudança de horário de verão. - Se o horário atual estiver
fora da faixa exibida, ocultar a linha.

---

## 9. Cartões de eventos

### 9.1. Aparência padrão

```css
.calendar-event {
  background: var(--calendar-event-bg);
  color: var(--calendar-event-text);
  border-left: 3px solid var(--calendar-event-border);
  border-radius: var(--radius-sm);
  padding: 4px 6px;
}
```

- Margem interna compacta.
- Separação visual entre eventos adjacentes.
- Título com peso `600`.
- Horário e detalhes em texto secundário.
- O cartão deve continuar legível em alturas pequenas.
- A cor lateral deve corresponder ao calendário ou categoria, quando
  aplicável.

### 9.2. Posicionamento

A posição vertical deriva do horário inicial, e a altura deriva da
duração.

Conceitualmente:

```text
top = (minutos_desde_o_início_da_grade / minutos_por_hora)
      * altura_da_hora

height = (duração_em_minutos / 60) * altura_da_hora
```

A implementação deve considerar o offset do cabeçalho e da faixa de dia
inteiro. Não incluir esses offsets duas vezes.

Regras: - A largura depende da quantidade de eventos simultâneos. -
Manter um pequeno espaço entre cartões. - Garantir que eventos curtos
ainda possam ser selecionados e abertos. - Se o conteúdo não couber,
truncar com reticências e disponibilizar os detalhes ao abrir o
evento. - Não usar altura mínima que faça o evento parecer durar mais do
que realmente dura.

### 9.3. Conteúdo

Quando houver espaço, mostrar: 1. Título. 2. Horário de início e
término. 3. Local ou informação de reunião, se relevante.

Em eventos pequenos, priorizar o título e omitir detalhes secundários. O
conteúdo completo permanece disponível no popover ou formulário.

### 9.4. Estados visuais

- **Padrão:** fundo claro do calendário e borda lateral colorida.
- **Hover:** fundo ligeiramente mais forte.
- **Selecionado:** fundo destacado e contorno visível.
- **Arrastando:** cartão original com opacidade reduzida;
  representação arrastável com sombra.
- **Conflito:** não depender apenas de uma cor de alerta; apresentar
  horários e posição sem ambiguidade.
- **Cancelado**, se aplicável: estilo distinguível, como texto riscado
  e rótulo explícito.

### 9.5. Eventos sobrepostos

Eventos com intervalos que se cruzam no mesmo dia devem ser posicionados
lado a lado, sem ocultar completamente um ao outro.

Regras: 1. Identificar grupos de eventos cujos intervalos de tempo se
sobrepõem. 2. Determinar quantas colunas são necessárias para cada
grupo. 3. Distribuir a largura disponível entre os eventos conflitantes. 4. Manter uma separação visual pequena, por exemplo `2px`. 5. Alinhar
corretamente o início e o fim de cada evento à escala temporal. 6.
Preservar uma largura mínima utilizável quando possível. 7. Quando
muitos eventos coincidirem, priorizar que todos possam ser selecionados
e consultados, mesmo que alguns títulos precisem ser truncados.

Exemplo conceitual:

```text
10:00  ┌────────────┬────────────┐
       │ Reunião    │ Planejamento│
       │ 10:00      │ 10:15       │
11:00  └────────────┴────────────┘
```

Não posicionar eventos sobrepostos com base apenas na ordem em que
chegam da API. A distribuição deve ser determinística.

### 9.6. Eventos de vários dias

- Eventos que atravessam dias devem aparecer na faixa de dia inteiro
  quando forem definidos como eventos de dia inteiro.
- Eventos com horários que atravessam a meia-noite devem ser
  representados corretamente em cada dia afetado.
- Preservar a relação entre as partes visuais do mesmo evento.
- Não duplicar o evento no armazenamento; a divisão é apenas de
  apresentação.

---

## 10. Interações

### 10.1. Hover e foco

- Hover em um intervalo vazio pode aplicar `rgba(164, 125, 171, 0.05)`
  ou `--color-primary-subtle`.
- O cursor deve refletir a ação disponível.
- O foco de teclado deve ser sempre visível.
- Não depender exclusivamente de hover, pois ele não existe em telas
  sensíveis ao toque.

### 10.2. Arrastar e soltar eventos

Quando o recurso estiver implementado:

- O evento pode ser movido para outro horário ou dia.
- Durante o arraste, reduzir a opacidade do original.
- Mostrar uma prévia da posição de destino.
- Aplicar encaixe em intervalos de `--calendar-snap-minutes`.
- Atualizar a data/hora somente após a confirmação do movimento.
- Se a operação for cancelada, restaurar a posição original.
- Impedir que um evento seja solto fora de uma área válida sem
  feedback.
- Exibir feedback visual durante a operação.
- Em dispositivos de toque, evitar iniciar arraste com qualquer toque
  breve; usar um gesto deliberado.

### 10.3. Redimensionamento

- Permitir ajustar início e término por alças nas bordas superior e
  inferior, se essa funcionalidade estiver habilitada.
- A área interativa deve ser suficientemente grande para mouse e
  toque.
- Atualizar a prévia durante o arraste.
- Aplicar o intervalo de encaixe definido.
- Impedir duração negativa ou término anterior ao início.
- Disponibilizar uma alternativa acessível para editar horários por
  formulário.

### 10.4. Popover de evento

Ao selecionar um evento, abrir um popover próximo ao cartão,
reposicionando-o quando não houver espaço suficiente.

Conteúdo possível: - Título. - Data e horário. - Local. - Calendário
associado. - Descrição. - Participantes, se houver suporte. - Ações
"Editar", "Excluir" e "Participar", apenas quando aplicáveis.

Estilo: - Fundo branco. - Borda sutil. - Raio `8px`. - Sombra
`--shadow-popover`. - Animação curta e discreta, respeitando a
preferência por movimento reduzido. - O popover deve permanecer dentro
da área visível e não ficar cortado por contêineres com
`overflow: hidden`.

Comportamento: - Fechar com `Esc`. - Fechar ao clicar fora, sem
descartar alterações não salvas. - Gerenciar foco ao abrir e fechar. - A
ação de excluir deve pedir confirmação quando a operação não puder ser
desfeita facilmente.

### 10.5. Criar e editar evento

O formulário deve oferecer, conforme o escopo do produto: - Título. -
Data. - Hora de início e término. - Opção "Dia inteiro". - Calendário. -
Local. - Descrição. - Recorrência. - Lembrete. - Participantes ou link
de reunião, se suportados.

Validações: - Título obrigatório, se essa for a regra do produto. -
Término posterior ao início. - Datas e horários válidos. - Mensagens de
erro próximas ao campo correspondente. - Preservar os dados digitados se
ocorrer um erro ao salvar. - Indicar estados de carregamento, sucesso e
falha. - Não mostrar sucesso antes de a operação de persistência ser
confirmada.

### 10.6. Teclado

Definir e documentar os atalhos implementados. No mínimo: - `Tab` e
`Shift+Tab`: navegar entre controles. - `Enter` ou `Espaço`: ativar o
controle focado. - `Esc`: fechar popover ou menu. - Setas: navegar em
componentes que implementem navegação por grade.

Os atalhos não devem interceptar a digitação em campos de texto.
Informar os atalhos em uma área de ajuda, se houver.

---

## 11. Estados de carregamento, erro e vazio

### 11.1. Carregamento

- Usar indicadores discretos ou skeletons proporcionais ao conteúdo.
- Evitar substituir toda a tela por um spinner quando apenas os
  eventos estão carregando.
- Preservar a estrutura da grade durante o carregamento, quando
  possível.

### 11.2. Sem eventos

- Manter a grade de horários normalmente visível.
- Não exibir uma ilustração grande no centro da tela.
- Pode haver uma mensagem discreta, como "Nenhum evento neste
  período", sem bloquear a criação de eventos.
- O botão "Novo evento" continua disponível.

### 11.3. Erro

- Exibir uma mensagem compreensível e uma ação de tentar novamente
  quando apropriado.
- Não apagar eventos já carregados por causa de uma falha temporária.
- Diferenciar falha de carregamento, falha ao salvar e falta de
  conexão.
- Não simular eventos salvos ou uma conexão bem-sucedida.

### 11.4. Estado desabilitado

- Controles desabilitados devem ter aparência distinta.
- Não usar apenas redução de opacidade se isso prejudicar o contraste.
- Explicar o motivo quando a indisponibilidade não for óbvia.

---

## 12. Responsividade

Os pontos de quebra são referências e devem ser ajustados conforme o
layout real.

### 12.1. Desktop --- `1200px` ou mais

- Sidebar visível, com largura aproximada de `260px`.
- Visualização de cinco dias.
- Toolbar em uma linha.
- Grade com coluna de horários e cinco colunas de dias.

### 12.2. Tablet --- `768px` a `1199px`

- Sidebar recolhível ou fechada por padrão, conforme a largura
  disponível.
- Manter a visualização de cinco dias se as colunas continuarem
  legíveis.
- Caso contrário, oferecer visualização de três dias ou um dia.
- Reduzir padding horizontal da toolbar.
- Evitar que controles se sobreponham.

### 12.3. Mobile --- menos de `768px`

- Sidebar substituída por painel lateral ou menu sobreposto.
- Preferir visualização de um dia ou três dias.
- Navegação de período acessível por botões anterior/próximo.
- Manter o eixo de horários legível.
- Usar áreas de toque confortáveis.
- Popovers podem virar uma folha inferior (bottom sheet) ou diálogo
  adaptado à tela.
- Não tentar comprimir cinco colunas em uma tela estreita.
- Evitar rolagem horizontal da página inteira; se a grade usar rolagem
  horizontal, ela deve ser localizada e previsível.

---

## 13. Acessibilidade

### 13.1. Foco

Todos os elementos interativos devem ter foco visível.

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

Validar contraste do anel de foco contra o fundo e contra os componentes
adjacentes.

### 13.2. Semântica

- Usar elementos HTML semânticos sempre que possível.
- Aplicar `role="grid"` somente se a grade implementar de fato o
  padrão de interação de teclado correspondente.
- Linhas e células devem ter nomes acessíveis claros quando forem
  interativas.
- Eventos devem ser controles focáveis e anunciar título, data e
  horário.
- Botões apenas com ícone precisam de `aria-label` ou nome acessível
  equivalente.
- Campos devem ter rótulos associados.
- Menus e diálogos devem comunicar seus estados e gerenciar foco.

Exemplo de nome acessível para evento:

```text
Reunião de design, segunda-feira, 28 de setembro,
das 14:00 às 15:00.
```

### 13.3. Movimento

- Respeitar `prefers-reduced-motion`.
- Evitar animações longas ou essenciais para compreender o estado.
- Não usar movimento para comunicar informação sem alternativa visual.

### 13.4. Cor

- Cor não deve ser o único indicador de seleção, categoria, erro ou
  estado.
- Garantir contraste de texto e controles.
- Testar a interface em escala de cinza e com ferramentas de
  acessibilidade.

---

## 14. Regras de implementação

1.  **Fonte única de dados:** eventos e calendários devem vir do estado
    real da aplicação ou da API; não simular persistência.
2.  **Fuso horário:** armazenar e exibir datas/horários de forma
    consistente, considerando o fuso configurado.
3.  **Datas locais:** evitar erros de um dia causados por conversões
    indevidas entre UTC e horário local.
4.  **Intervalos:** definir claramente se o término de um evento é
    exclusivo ou inclusivo e manter essa regra em toda a aplicação.
5.  **Eventos recorrentes:** se suportados, definir como exceções e
    alterações de ocorrência são representadas.
6.  **Sobreposição:** o algoritmo de layout deve ser determinístico e
    testado com eventos simultâneos.
7.  **Redimensionamento:** recalcular posições quando a janela, a escala
    ou a faixa horária mudar.
8.  **Rolagem:** cabeçalho e grade devem permanecer alinhados durante
    rolagem e redimensionamento.
9.  **Persistência:** só apresentar confirmação de salvamento depois da
    resposta de sucesso da camada de dados.
10. **Falhas:** tratar erros de rede e validação sem perder os dados do
    formulário.
11. **Componentização:** separar, no mínimo, barra superior, sidebar,
    toolbar, cabeçalho, grade, cartão de evento, popover e formulário.
12. **Tokens:** centralizar valores visuais em variáveis CSS ou no
    sistema de tema adotado.
13. **Estados:** implementar hover, foco, selecionado, carregando, erro
    e desabilitado de maneira consistente.
14. **Performance:** evitar recalcular o layout de todos os eventos a
    cada atualização de minuto; atualizar apenas o indicador de horário
    atual quando possível.
15. **Testes:** validar eventos curtos, longos, simultâneos, de dia
    inteiro, atravessando a meia-noite e em mudanças de período.

---

## 15. Critérios de aceitação visual e funcional

A implementação pode ser considerada alinhada a esta especificação
quando:

- [ ] A estrutura geral remete ao Outlook Calendar.
- [ ] A interface usa branco e neutros como superfícies predominantes.
- [ ] O lilás é usado de forma consistente como identidade e destaque.
- [ ] Textos, botões e estados de foco atendem aos requisitos de
      contraste.
- [ ] A sidebar e o mini-calendário permanecem sincronizados com a
      grade principal.
- [ ] A navegação entre períodos atualiza corretamente o título e os
      dias.
- [ ] O cabeçalho permanece alinhado à grade durante a rolagem.
- [ ] O indicador de horário atual aparece na posição correta.
- [ ] Eventos comuns, curtos, longos e sobrepostos são exibidos
      corretamente.
- [ ] Eventos de dia inteiro e de vários dias têm uma representação
      própria.
- [ ] Criar, editar e excluir eventos apresenta estados reais de
      carregamento e resultado.
- [ ] A interface funciona com teclado e possui foco visível.
- [ ] Em telas pequenas, a visualização se adapta sem tornar os
      eventos ilegíveis.
- [ ] Estados vazios, erros e carregamento não quebram o layout.
- [ ] Nenhum botão ou ícone aparenta funcionar sem possuir uma ação
      implementada.

---

## 16. Direção visual final

**Resultado desejado:** uma interface reconhecível como um calendário de
produtividade no estilo Outlook, com estrutura neutra, grade discreta e
eventos fáceis de distinguir. O lilás `#A47DAB` funciona como assinatura
visual, enquanto tons mais escuros são usados para ações que exigem
texto contrastante.

A hierarquia de cor deve seguir esta lógica:

- **Neutros:** estrutura, superfícies e leitura.
- **Lilás:** marca, seleção e ações principais.
- **Cores dos calendários:** identificação de grupos de eventos.
- **Rosa/magenta:** indicador de horário atual.
- **Estados semânticos:** cores específicas acompanhadas de texto ou
  ícones, nunca apenas cor.

O objetivo não é colorir cada componente, mas preservar a familiaridade
do Outlook e aplicar uma identidade lilás consistente, legível e
funcional.
