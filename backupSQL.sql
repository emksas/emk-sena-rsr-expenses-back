CREATE DATABASE  IF NOT EXISTS `emk` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `emk`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: emk
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `idconfiguracion` int NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `tipo` varchar(45) DEFAULT NULL,
  `estado` tinyint DEFAULT NULL,
  `valor` varchar(45) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `usuario_cedula` int NOT NULL,
  PRIMARY KEY (`idconfiguracion`,`usuario_cedula`),
  KEY `fk_configuracion_usuario1_idx` (`usuario_cedula`),
  CONSTRAINT `fk_configuracion_usuario1` FOREIGN KEY (`usuario_cedula`) REFERENCES `usuario` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentacontable`
--

DROP TABLE IF EXISTS `cuentacontable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentacontable` (
  `id` int NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `usuario_cedula` int NOT NULL,
  PRIMARY KEY (`id`,`usuario_cedula`),
  KEY `fk_cuentaContable_usuario1_idx` (`usuario_cedula`),
  CONSTRAINT `fk_cuentaContable_usuario1` FOREIGN KEY (`usuario_cedula`) REFERENCES `usuario` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentacontable`
--

LOCK TABLES `cuentacontable` WRITE;
/*!40000 ALTER TABLE `cuentacontable` DISABLE KEYS */;
INSERT INTO `cuentacontable` VALUES (1,'servicios basicos',1032459533);
/*!40000 ALTER TABLE `cuentacontable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egreso`
--

DROP TABLE IF EXISTS `egreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egreso` (
  `idegreso` int NOT NULL AUTO_INCREMENT,
  `valor` double DEFAULT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `idPlanificacion` int NOT NULL,
  `cuentaContable_id` int NOT NULL,
  PRIMARY KEY (`idegreso`,`idPlanificacion`,`cuentaContable_id`),
  KEY `fk_egreso_planificacionFinanciera1_idx` (`idPlanificacion`),
  KEY `fk_egreso_cuentaContable1_idx` (`cuentaContable_id`),
  CONSTRAINT `fk_egreso_cuentaContable1` FOREIGN KEY (`cuentaContable_id`) REFERENCES `cuentacontable` (`id`),
  CONSTRAINT `fk_egreso_planificacionFinanciera1` FOREIGN KEY (`idPlanificacion`) REFERENCES `planificacionfinanciera` (`idplanificacionFinanciera`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egreso`
--

LOCK TABLES `egreso` WRITE;
/*!40000 ALTER TABLE `egreso` DISABLE KEYS */;
INSERT INTO `egreso` VALUES (1,5000,'rappi galletas','pay','2025-08-09 17:36:19',1,1),(2,5000,'rappi galletas','pay','2025-08-09 17:52:09',1,1);
/*!40000 ALTER TABLE `egreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingreso`
--

DROP TABLE IF EXISTS `ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingreso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `valor` double DEFAULT NULL,
  `fuente` varchar(45) DEFAULT NULL,
  `categoria` varchar(45) DEFAULT NULL,
  `metodoDePago` varchar(45) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `referencia` varchar(45) DEFAULT NULL,
  `planificacionFinanciera_idplanificacionFinanciera` int NOT NULL,
  `cuentaContable_id` int NOT NULL,
  PRIMARY KEY (`id`,`planificacionFinanciera_idplanificacionFinanciera`,`cuentaContable_id`),
  KEY `fk_ingreso_planificacionFinanciera1_idx` (`planificacionFinanciera_idplanificacionFinanciera`),
  KEY `fk_ingreso_cuentaContable1_idx` (`cuentaContable_id`),
  CONSTRAINT `fk_ingreso_cuentaContable1` FOREIGN KEY (`cuentaContable_id`) REFERENCES `cuentacontable` (`id`),
  CONSTRAINT `fk_ingreso_planificacionFinanciera1` FOREIGN KEY (`planificacionFinanciera_idplanificacionFinanciera`) REFERENCES `planificacionfinanciera` (`idplanificacionFinanciera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingreso`
--

LOCK TABLES `ingreso` WRITE;
/*!40000 ALTER TABLE `ingreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planificacionfinanciera`
--

DROP TABLE IF EXISTS `planificacionfinanciera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planificacionfinanciera` (
  `idplanificacionFinanciera` int NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `nombreDelPlan` varchar(45) DEFAULT NULL,
  `usuario_cedula` int NOT NULL,
  `valorProyectado` float DEFAULT NULL,
  `fechaProyectada` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `proyectoPersonal` tinyint DEFAULT NULL,
  PRIMARY KEY (`idplanificacionFinanciera`,`usuario_cedula`),
  KEY `fk_planificacionFinanciera_usuario1_idx` (`usuario_cedula`),
  CONSTRAINT `fk_planificacionFinanciera_usuario1` FOREIGN KEY (`usuario_cedula`) REFERENCES `usuario` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planificacionfinanciera`
--

LOCK TABLES `planificacionfinanciera` WRITE;
/*!40000 ALTER TABLE `planificacionfinanciera` DISABLE KEYS */;
INSERT INTO `planificacionfinanciera` VALUES (1,'prueba','prueba',1032459533,50000,'2025-08-09 16:48:00',1);
/*!40000 ALTER TABLE `planificacionfinanciera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipousuario`
--

DROP TABLE IF EXISTS `tipousuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipousuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipousuario`
--

LOCK TABLES `tipousuario` WRITE;
/*!40000 ALTER TABLE `tipousuario` DISABLE KEYS */;
INSERT INTO `tipousuario` VALUES (1,'personal');
/*!40000 ALTER TABLE `tipousuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `cedula` int NOT NULL,
  `cargo` varchar(45) DEFAULT NULL,
  `telefono` int DEFAULT NULL,
  `correo` varchar(45) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `contrasena` varchar(45) DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `genero` varchar(45) DEFAULT NULL,
  `pagaRetencionEnLaFuente` tinyint DEFAULT NULL,
  `tipoUsuario_id` int NOT NULL,
  PRIMARY KEY (`cedula`,`tipoUsuario_id`),
  KEY `fk_usuario_tipoUsuario1_idx` (`tipoUsuario_id`),
  CONSTRAINT `fk_usuario_tipoUsuario1` FOREIGN KEY (`tipoUsuario_id`) REFERENCES `tipousuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1032459533,'prueba',111,'ramsessr@outlook.com','pruena','prueba','2025-08-09 16:46:13','M',1,1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-09 14:46:40
