ALTER TABLE `compromissos` ADD `tarefa_origem_id` int;--> statement-breakpoint
ALTER TABLE `alert_settings` ADD `expediente_inicio` varchar(5) NOT NULL DEFAULT '08:00';--> statement-breakpoint
ALTER TABLE `alert_settings` ADD `expediente_fim` varchar(5) NOT NULL DEFAULT '18:00';
