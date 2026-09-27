ALTER TABLE `compromissos` ADD `repeticao` enum('nenhuma','diaria','cada_15_dias','semanal','mensal','anual') NOT NULL DEFAULT 'nenhuma';
--> statement-breakpoint
ALTER TABLE `compromissos` ADD `repete_ate` datetime;
