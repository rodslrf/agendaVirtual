import {
  boolean,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

export const tarefas = mysqlTable("tarefas", {
  id: int("id").primaryKey().autoincrement(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  notas: text("notas"),
  status: mysqlEnum("status", ["aberta", "feita", "apagada"]).notNull().default("aberta"),
  prioridade: mysqlEnum("prioridade", ["normal", "importante", "urgente"])
    .notNull()
    .default("normal"),
  venceEm: datetime("vence_em", { mode: "date", fsp: 0 }),
  silencioAte: datetime("silencio_ate", { mode: "date", fsp: 0 }),
  criadaEm: datetime("criada_em", { mode: "date", fsp: 0 }).notNull(),
  atualizadaEm: datetime("atualizada_em", { mode: "date", fsp: 0 }).notNull(),
  concluidaEm: datetime("concluida_em", { mode: "date", fsp: 0 }),
})

export const tarefaEtapas = mysqlTable("tarefa_etapas", {
  id: int("id").primaryKey().autoincrement(),
  tarefaId: int("tarefa_id")
    .notNull()
    .references(() => tarefas.id, { onDelete: "cascade" }),
  ordem: int("ordem").notNull(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  feita: boolean("feita").notNull().default(false),
})

export const compromissos = mysqlTable("compromissos", {
  id: int("id").primaryKey().autoincrement(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  notas: text("notas"),
  comecaEm: datetime("comeca_em", { mode: "date", fsp: 0 }).notNull(),
  duracaoMinutos: int("duracao_minutos").notNull(),
  duracaoValor: int("duracao_valor").notNull().default(60),
  duracaoUnidade: mysqlEnum("duracao_unidade", ["minuto", "hora", "dia", "semana"])
    .notNull()
    .default("minuto"),
  status: mysqlEnum("status", ["marcado", "feito", "cancelado", "apagada"])
    .notNull()
    .default("marcado"),
  silencioAte: datetime("silencio_ate", { mode: "date", fsp: 0 }),
  repeticao: mysqlEnum("repeticao", [
    "nenhuma",
    "diaria",
    "cada_15_dias",
    "semanal",
    "mensal",
    "anual",
  ])
    .notNull()
    .default("nenhuma"),
  repeteAte: datetime("repete_ate", { mode: "date", fsp: 0 }),
  tarefaOrigemId: int("tarefa_origem_id"),
  criadaEm: datetime("criada_em", { mode: "date", fsp: 0 }).notNull(),
  atualizadaEm: datetime("atualizada_em", { mode: "date", fsp: 0 }).notNull(),
})

export const compromissoExcecoes = mysqlTable(
  "compromisso_excecoes",
  {
    id: int("id").primaryKey().autoincrement(),
    compromissoId: int("compromisso_id")
      .notNull()
      .references(() => compromissos.id),
    dia: varchar("dia", { length: 10 }).notNull(),
  },
  (tabela) => [uniqueIndex("excecao_dia").on(tabela.compromissoId, tabela.dia)],
)

export const alertSettings = mysqlTable("alert_settings", {
  id: int("id").primaryKey(),
  antecedenciasMinutos: varchar("antecedencias_minutos", { length: 100 }).notNull(),
  urgenteRepetirMinutos: int("urgente_repetir_minutos").notNull(),
  aproximacaoRepetirMinutos: int("aproximacao_repetir_minutos").notNull(),
  som: boolean("som").notNull().default(true),
  expedienteInicio: varchar("expediente_inicio", { length: 5 }).notNull().default("08:00"),
  expedienteFim: varchar("expediente_fim", { length: 5 }).notNull().default("18:00"),
})

export const notificacoes = mysqlTable(
  "notificacoes",
  {
    id: int("id").primaryKey().autoincrement(),
    tipo: mysqlEnum("tipo", ["urgente", "prazo"]).notNull(),
    alvoTipo: mysqlEnum("alvo_tipo", ["tarefa", "compromisso"]).notNull(),
    alvoId: int("alvo_id").notNull(),
    marcoMinutos: int("marco_minutos"),
    disparadaEm: datetime("disparada_em", { mode: "date", fsp: 0 }).notNull(),
    acusadaEm: datetime("acusada_em", { mode: "date", fsp: 0 }),
  },
  (tabela) => [index("notificacoes_alvo").on(tabela.alvoTipo, tabela.alvoId, tabela.tipo)],
)

export const pushSubscriptions = mysqlTable(
  "push_subscriptions",
  {
    id: int("id").primaryKey().autoincrement(),
    endpoint: varchar("endpoint", { length: 760 }).notNull(),
    p256dh: varchar("p256dh", { length: 255 }).notNull(),
    auth: varchar("auth", { length: 255 }).notNull(),
    criadaEm: datetime("criada_em", { mode: "date", fsp: 0 }).notNull(),
  },
  (tabela) => [uniqueIndex("push_endpoint").on(tabela.endpoint)],
)
