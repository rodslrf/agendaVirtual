CREATE TABLE `alert_settings` (
	`id` int NOT NULL,
	`antecedencias_minutos` varchar(100) NOT NULL,
	`urgente_repetir_minutos` int NOT NULL,
	`aproximacao_repetir_minutos` int NOT NULL,
	`som` boolean NOT NULL DEFAULT true,
	CONSTRAINT `alert_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compromissos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(200) NOT NULL,
	`notas` text,
	`comeca_em` datetime(0) NOT NULL,
	`duracao_minutos` int NOT NULL,
	`status` enum('marcado','feito','cancelado') NOT NULL DEFAULT 'marcado',
	`silencio_ate` datetime(0),
	`criada_em` datetime(0) NOT NULL,
	`atualizada_em` datetime(0) NOT NULL,
	CONSTRAINT `compromissos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('urgente','prazo') NOT NULL,
	`alvo_tipo` enum('tarefa','compromisso') NOT NULL,
	`alvo_id` int NOT NULL,
	`marco_minutos` int,
	`disparada_em` datetime(0) NOT NULL,
	`acusada_em` datetime(0),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpoint` varchar(512) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`criada_em` datetime(0) NOT NULL,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_endpoint` UNIQUE(`endpoint`)
);
--> statement-breakpoint
CREATE TABLE `tarefa_etapas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tarefa_id` int NOT NULL,
	`ordem` int NOT NULL,
	`titulo` varchar(200) NOT NULL,
	`feita` boolean NOT NULL DEFAULT false,
	CONSTRAINT `tarefa_etapas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tarefas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(200) NOT NULL,
	`notas` text,
	`status` enum('aberta','feita') NOT NULL DEFAULT 'aberta',
	`urgente` boolean NOT NULL DEFAULT false,
	`vence_em` datetime(0),
	`silencio_ate` datetime(0),
	`criada_em` datetime(0) NOT NULL,
	`atualizada_em` datetime(0) NOT NULL,
	`concluida_em` datetime(0),
	CONSTRAINT `tarefas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tarefa_etapas` ADD CONSTRAINT `tarefa_etapas_tarefa_id_tarefas_id_fk` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notificacoes_alvo` ON `notificacoes` (`alvo_tipo`,`alvo_id`,`tipo`);