-- MySQL dump 10.11
--
-- Host: localhost    Database: screenwerk
-- ------------------------------------------------------
-- Server version	5.0.45-Debian_1ubuntu3.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `sw_aspects`
--

LOCK TABLES `sw_aspects` WRITE;
/*!40000 ALTER TABLE `sw_aspects` DISABLE KEYS */;
INSERT INTO `sw_aspects` VALUES (7,'1.33','TV 4:3','A standard television set; roughly equivalent to 4:3.'),(9,'1.37','35mm','Referred to as the academy aspect ratio. The standard for films shot before the mid-1950s. 35mm film.'),(10,'1.66','Wide TV','A bit wider than a standard TV, but not by much.'),(11,'1.78','HDTV 16:9','The dimensions of a widescreen television set'),(12,'1.85','Widescreen movie','Popular aspect ratio for many movies.'),(13,'2.35','Ultra widescreen movie','Ultra widescreen movie');
/*!40000 ALTER TABLE `sw_aspects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2008-03-03 22:15:50
