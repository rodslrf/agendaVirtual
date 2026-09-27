ALTER TABLE `tarefas` ADD `prioridade` enum('normal','importante','urgente') NOT NULL DEFAULT 'normal';
--> statement-breakpoint
UPDATE `tarefas` SET `prioridade` = 'urgente' WHERE `urgente` = 1;
--> statement-breakpoint
ALTER TABLE `tarefas` MODIFY `status` enum('aberta','feita','apagada') NOT NULL DEFAULT 'aberta';
--> statement-breakpoint
ALTER TABLE `compromissos` MODIFY `status` enum('marcado','feito','cancelado','apagada') NOT NULL DEFAULT 'marcado';
--> statement-breakpoint
CREATE TABLE `compromisso_excecoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compromisso_id` int NOT NULL,
  `dia` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `excecao_dia` (`compromisso_id`,`dia`),
  CONSTRAINT `compromisso_excecoes_compromisso_id` FOREIGN KEY (`compromisso_id`) REFERENCES `compromissos` (`id`)
);
