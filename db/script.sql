DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NULL,
  `email` varchar(100) NOT NULL DEFAULT '',
  `profile_pic` varchar(100) NULL,
  `contact_number` varchar(15) NULL,
  `password` varchar(100) NULL,
  `role_id` tinyint(1) ,
  `is_active` tinyint(1) DEFAULT '0',
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;


-- ALTER TABLE `distributor_purchases` ADD `is_active` INT NOT NULL DEFAULT '0' AFTER `created_at`;


-- Run ==>> sudo mysql  db_dev < script.sql