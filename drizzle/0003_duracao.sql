ALTER TABLE `compromissos` ADD `duracao_valor` int NOT NULL DEFAULT 60;
--> statement-breakpoint
ALTER TABLE `compromissos` ADD `duracao_unidade` enum('minuto','hora','dia','semana') NOT NULL DEFAULT 'minuto';
--> statement-breakpoint
UPDATE `compromissos` SET `duracao_valor` = `duracao_minutos`, `duracao_unidade` = 'minuto';
