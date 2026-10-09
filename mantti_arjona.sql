-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-10-2026 a las 00:54:29
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mantti_arjona`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dependencias`
--

CREATE TABLE `dependencias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `responsable` varchar(120) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `dependencias`
--

INSERT INTO `dependencias` (`id`, `nombre`, `responsable`, `correo`, `telefono`, `created_at`) VALUES
(1, 'Hacienda', 'Maria Perez', 'hacienda@arjona-bolivar.gov.co', '(605) 123 4567', '2026-09-22 21:47:16'),
(2, 'Planeacion', 'Carlos Diaz', 'planeacion@arjona-bolivar.gov.co', '(605) 123 4568', '2026-09-22 21:47:16'),
(3, 'Talento Humano', 'Ana Gomez', 'talento@arjona-bolivar.gov.co', '(605) 123 4569', '2026-09-22 21:47:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_equipos`
--

CREATE TABLE `documentos_equipos` (
  `id` int(11) NOT NULL,
  `equipo_codigo` varchar(60) NOT NULL,
  `nombre_archivo` varchar(180) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `tamano` int(11) NOT NULL DEFAULT 0,
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos`
--

CREATE TABLE `equipos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(60) NOT NULL,
  `tipo` varchar(80) NOT NULL,
  `marca` varchar(80) NOT NULL,
  `modelo` varchar(120) NOT NULL,
  `serial` varchar(120) NOT NULL,
  `numero_interno` varchar(80) NOT NULL,
  `dependencia` varchar(120) NOT NULL,
  `responsable` varchar(120) NOT NULL,
  `ubicacion` varchar(200) NOT NULL,
  `estado` varchar(60) NOT NULL DEFAULT 'Operativo',
  `procesador` varchar(120) DEFAULT NULL,
  `ram` varchar(60) DEFAULT NULL,
  `disco` varchar(60) DEFAULT NULL,
  `sistema_operativo` varchar(80) DEFAULT NULL,
  `office` varchar(80) DEFAULT NULL,
  `programas` varchar(220) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `equipos`
--

INSERT INTO `equipos` (`id`, `codigo`, `tipo`, `marca`, `modelo`, `serial`, `numero_interno`, `dependencia`, `responsable`, `ubicacion`, `estado`, `procesador`, `ram`, `disco`, `sistema_operativo`, `office`, `programas`, `observaciones`, `created_at`) VALUES
(1, 'PC-ARJ-014', 'PC escritorio', 'HP', 'ProDesk 600 G4', 'MXC9123456', 'INV-2023-0456', 'Hacienda', 'Maria Perez', 'Oficina 203, Piso 2', 'Operativo', 'Intel Core i5-8500', '8 GB DDR4', 'SSD 256 GB', 'Windows 11 Pro', 'Office 2019', 'SIIGO, ORFEO', NULL, '2026-09-22 21:48:40'),
(2, 'PC-ARJ-063', 'PC escritorio', 'Dell', 'OptiPlex 3080', 'DL3080012', 'INV-2023-0512', 'Planeacion', 'Carlos Diaz', 'Oficina 104, Piso 1', 'Operativo', 'Intel Core i5-10500', '8 GB DDR4', 'SSD 512 GB', 'Windows 11 Pro', 'Office 365', 'ORFEO, Excel avanzado', NULL, '2026-09-22 21:48:40'),
(3, 'PC-ARJ-022', 'PC escritorio', 'Lenovo', 'ThinkCentre M720', 'LN2022008', 'INV-2022-0189', 'Talento Humano', 'Ana Gomez', 'Oficina 115, Piso 1', 'En reparación', 'Intel Core i3-9100', '4 GB DDR4', 'HDD 500 GB', 'Windows 10 Pro', 'Office 2016', 'ORFEO', 'Equipo lento, se recomienda cambio a SSD', '2026-09-22 21:48:40'),
(19, 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', 'Realizó', '2026-09-23 22:41:32'),
(20, '8CC22223M', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-2', 'SIN-INV-2', 'Sin dependencia', 'Por asignar', '8CC22223M', 'Operativo', NULL, NULL, NULL, '8CC22223M', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(21, '8CC22223HZ', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-3', 'SIN-INV-3', 'Sin dependencia', 'Por asignar', '8CC22223HZ', 'Operativo', NULL, NULL, NULL, '8CC22223HZ', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(22, 'DQT1W12', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-4', 'SIN-INV-4', 'Sin dependencia', 'Por asignar', 'DQT1W12', 'Operativo', NULL, NULL, NULL, 'DQT1W12', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(23, '8CC22223MY', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-5', 'SIN-INV-5', 'Sin dependencia', 'Por asignar', '8CC22223MY', 'Operativo', NULL, NULL, NULL, '8CC22223MY', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(24, 'F3D2N63', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-6', 'SIN-INV-6', 'Sin dependencia', 'Por asignar', 'F3D2N63', 'Operativo', NULL, NULL, NULL, 'F3D2N63', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(25, '8CC22223BZ', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-7', 'SIN-INV-7', 'Sin dependencia', 'Por asignar', '8CC22223BZ', 'Operativo', NULL, NULL, NULL, '8CC22223BZ', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(26, '2992319240', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-8', 'SIN-INV-8', 'Sin dependencia', 'Por asignar', '2992319240', 'Operativo', NULL, NULL, NULL, '2992319240', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(27, '93Z3MP2', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-9', 'SIN-INV-9', 'Sin dependencia', 'Por asignar', '93Z3MP2', 'Operativo', NULL, NULL, NULL, '93Z3MP2', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(28, '8CC6500ZT4', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-10', 'SIN-INV-10', 'Sin dependencia', 'Por asignar', '8CC6500ZT4', 'Operativo', NULL, NULL, NULL, '8CC6500ZT4', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(29, '8CC7020VDF', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-15', 'SIN-INV-15', 'Sin dependencia', 'Por asignar', '8CC7020VDF', 'Operativo', NULL, NULL, NULL, '8CC7020VDF', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(30, '8CC22223NB', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-12', 'SIN-INV-12', 'Sin dependencia', 'Por asignar', '8CC22223NB', 'Operativo', NULL, NULL, NULL, '8CC22223NB', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(31, 'MLX42712T4', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-13', 'SIN-INV-13', 'Sin dependencia', 'Por asignar', 'MLX42712T4', 'Operativo', NULL, NULL, NULL, 'MLX42712T4', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(32, '8CC22223MS', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-14', 'SIN-INV-14', 'Sin dependencia', 'Por asignar', '8CC22223MS', 'Operativo', NULL, NULL, NULL, '8CC22223MS', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(34, '2579W52', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-16', 'SIN-INV-16', 'Sin dependencia', 'Por asignar', '2579W52', 'Operativo', NULL, NULL, NULL, '2579W52', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(35, '8CC22223N9', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-17', 'SIN-INV-17', 'Sin dependencia', 'Por asignar', '8CC22223N9', 'Operativo', NULL, NULL, NULL, '8CC22223N9', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(36, 'MLX425101F', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-18', 'SIN-INV-18', 'Sin dependencia', 'Por asignar', 'MLX425101F', 'Operativo', NULL, NULL, NULL, 'MLX425101F', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(37, '5CM31908M2', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-19', 'SIN-INV-19', 'Sin dependencia', 'Por asignar', '5CM31908M2', 'Operativo', NULL, NULL, NULL, '5CM31908M2', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(38, '5CM4120BK1', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-20', 'SIN-INV-20', 'Sin dependencia', 'Por asignar', '5CM4120BK1', 'Operativo', NULL, NULL, NULL, '5CM4120BK1', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(39, 'MP26ST2H', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-21', 'SIN-INV-21', 'Sin dependencia', 'Por asignar', 'MP26ST2H', 'Operativo', NULL, NULL, NULL, 'MP26ST2H', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(40, 'MPLVW462', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-22', 'SIN-INV-22', 'Sin dependencia', 'Por asignar', 'MPLVW462', 'Operativo', NULL, NULL, NULL, 'MPLVW462', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(41, 'MPLVW4FS', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-23', 'SIN-INV-23', 'Sin dependencia', 'Por asignar', 'MPLVW4FS', 'Operativo', NULL, NULL, NULL, 'MPLVW4FS', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(42, '8CC3493859', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-24', 'SIN-INV-24', 'Sin dependencia', 'Por asignar', '8CC3493859', 'Operativo', NULL, NULL, NULL, '8CC3493859', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(43, '8CC3493880', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-25', 'SIN-INV-25', 'Sin dependencia', 'Por asignar', '8CC3493880', 'Operativo', NULL, NULL, NULL, '8CC3493880', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(44, '300SN65641', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-26', 'SIN-INV-26', 'Sin dependencia', 'Por asignar', '300SN65641', 'Operativo', NULL, NULL, NULL, '300SN65641', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(45, 'X8Q2121294', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-27', 'SIN-INV-27', 'Sin dependencia', 'Por asignar', 'X8Q2121294', 'Operativo', NULL, NULL, NULL, 'X8Q2121294', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(46, '8CQ4250528', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-28', 'SIN-INV-28', 'Sin dependencia', 'Por asignar', '8CQ4250528', 'Operativo', NULL, NULL, NULL, '8CQ4250528', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(47, '8CQ42504CS', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-29', 'SIN-INV-29', 'Sin dependencia', 'Por asignar', '8CQ42504CS', 'Operativo', NULL, NULL, NULL, '8CQ42504CS', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(48, '8CQ42504TF', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-30', 'SIN-INV-30', 'Sin dependencia', 'Por asignar', '8CQ42504TF', 'Operativo', NULL, NULL, NULL, '8CQ42504TF', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(49, '8CQ50907SY', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-31', 'SIN-INV-31', 'Sin dependencia', 'Por asignar', '8CQ50907SY', 'Operativo', NULL, NULL, NULL, '8CQ50907SY', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(50, '8CQ50907T9', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-32', 'SIN-INV-32', 'Sin dependencia', 'Por asignar', '8CQ50907T9', 'Operativo', NULL, NULL, NULL, '8CQ50907T9', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(51, '8CQ50907HR', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-33', 'SIN-INV-33', 'Sin dependencia', 'Por asignar', '8CQ50907HR', 'Operativo', NULL, NULL, NULL, '8CQ50907HR', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(52, '8CQ50907NT', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-34', 'SIN-INV-34', 'Sin dependencia', 'Por asignar', '8CQ50907NT', 'Operativo', NULL, NULL, NULL, '8CQ50907NT', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(53, '8CQ50907PL', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-35', 'SIN-INV-35', 'Sin dependencia', 'Por asignar', '8CQ50907PL', 'Operativo', NULL, NULL, NULL, '8CQ50907PL', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(54, '8CQ50907HY', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-36', 'SIN-INV-36', 'Sin dependencia', 'Por asignar', '8CQ50907HY', 'Operativo', NULL, NULL, NULL, '8CQ50907HY', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(55, '8CQ50907L1', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-37', 'SIN-INV-37', 'Sin dependencia', 'Por asignar', '8CQ50907L1', 'Operativo', NULL, NULL, NULL, '8CQ50907L1', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(56, '8CQ50907PH', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-38', 'SIN-INV-38', 'Sin dependencia', 'Por asignar', '8CQ50907PH', 'Operativo', NULL, NULL, NULL, '8CQ50907PH', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(57, '8CQ50907T2', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-39', 'SIN-INV-39', 'Sin dependencia', 'Por asignar', '8CQ50907T2', 'Operativo', NULL, NULL, NULL, '8CQ50907T2', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(58, '8CQ50907TG', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-40', 'SIN-INV-40', 'Sin dependencia', 'Por asignar', '8CQ50907TG', 'Operativo', NULL, NULL, NULL, '8CQ50907TG', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(59, '8CQ50907PS', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-41', 'SIN-INV-41', 'Sin dependencia', 'Por asignar', '8CQ50907PS', 'Operativo', NULL, NULL, NULL, '8CQ50907PS', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(60, '8CQ50907HG', 'Equipo', 'Sin marca', 'Sin modelo', 'SIN-SERIAL-42', 'SIN-INV-42', 'Sin dependencia', 'Por asignar', '8CQ50907HG', 'Operativo', NULL, NULL, NULL, '8CQ50907HG', NULL, NULL, NULL, '2026-09-23 22:41:32'),
(61, '1', 'Equipo', 'Epson', 'L3250', '1', '1', 'Inspección', 'Por asignar', 'Centro de convivencia', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(62, '2', 'Equipo', 'HP', 'Laserjet pro MFP M130w', '2', '2', 'Familias en Acción', 'Por asignar', 'Centro de convivencia', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(63, '3', 'Equipo', 'HP', 'laserjet P1102w', '3', '3', 'Enlace de VICTIMAS', 'Por asignar', 'Centro de convivencia', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(64, '4', 'Equipo', 'Epson', 'L3250', '4', '4', 'Comisaria de Familia', 'Por asignar', 'Centro Civico', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(65, '5', 'Equipo', 'HP', 'laserjet P1102w', '5', '5', 'Comisaria de Familia', 'Por asignar', 'Centro Civico', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(66, '6', 'Equipo', 'HP', 'laserjet HP P1102w', '6', '6', 'Adulto Mayor', 'Por asignar', 'Centro Civico', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(67, '7', 'Equipo', 'epson', 'M200', '7', '7', 'Biblioteca', 'Por asignar', 'Centro Civico', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(68, '8', 'Equipo', 'epson', 'multifuncional L575', '8', '8', 'Secretaria de Salud', 'Por asignar', 'Salud 2do piso', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(69, '9', 'Equipo', 'Epson', 'multifuncional L395', '9', '9', 'Secretaria de Salud', 'Por asignar', 'Salud 1er piso', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(70, '10', 'Equipo', 'HP', 'Laserjet pro MFP M130w', '10', '10', 'Secretaria de Salud', 'Por asignar', 'Salud 1er piso', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(71, '11', 'Equipo', 'RICOH', 'RICOH', '11', '11', 'Archivo', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Fotocopiadora', '2026-09-23 22:41:42'),
(72, '12', 'Equipo', 'HP', 'Laserjet M1132', '12', '12', 'Contabilidad', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(73, '13', 'Equipo', 'PANTUM', 'Laser P2509W', '13', '13', 'Presupuesto', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora laser', '2026-09-23 22:41:42'),
(74, '14', 'Equipo', 'Epson', 'Multifuncional L575', '14', '14', 'Hacienda', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(75, '15', 'Equipo', 'HP', 'Laser MFP 135W', '15', '15', 'Recaudo', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-23 22:41:42'),
(76, '16', 'Equipo', 'Epson', 'L380', '16', '16', 'Talento Humano', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora Multifuncional', '2026-09-23 22:41:42'),
(77, '17', 'Equipo', 'Epson', 'L3250', '17', '17', 'Secretaria de Gobierno', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora Multifuncional', '2026-09-23 22:41:42'),
(78, '18', 'Equipo', 'Epson', 'L3250', '18', '18', 'planeacion', 'Por asignar', 'Centro de convivencia', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(79, '19', 'Equipo', 'Epson', 'L3250', '19', '19', 'Secretaria de Despcho', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora Multifuncional', '2026-09-23 22:41:42'),
(80, '20', 'Equipo', 'HP', 'laserjet P1102w', '20', '20', 'control Interno', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42'),
(81, '21', 'Equipo', 'Epson', 'L3250', '21', '21', 'Juridica', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora Multifuncional', '2026-09-23 22:41:42'),
(82, '22', 'Equipo', 'PANTUM', 'Laser P2509W', '22', '22', 'Juridica', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora laser', '2026-09-23 22:41:42'),
(83, '23', 'Equipo', 'HP', 'Laserjet Pro MFP M127fn', '23', '23', 'Juridica', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora laser Multifuncional', '2026-09-23 22:41:42'),
(84, '24', 'Equipo', 'Epson', 'L5290', '24', '24', 'Umata', 'Por asignar', 'Palacio Municipal', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora Multifuncional', '2026-09-23 22:41:42'),
(85, '25', 'Equipo', 'Epson', 'L575', '25', '25', 'IMACAR', 'Por asignar', 'Centro Civico', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora Multifuncional', '2026-09-23 22:41:42'),
(86, '26', 'Equipo', 'HP', 'laserjet P1102w', '26', '26', 'Instituto de deporte', 'Por asignar', 'Centro de convivencia', 'Operativo', NULL, NULL, NULL, NULL, NULL, NULL, 'Impresora', '2026-09-23 22:41:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_equipos`
--

CREATE TABLE `historial_equipos` (
  `id` int(11) NOT NULL,
  `equipo_codigo` varchar(60) NOT NULL,
  `accion` varchar(80) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `historial_equipos`
--

INSERT INTO `historial_equipos` (`id`, `equipo_codigo`, `accion`, `descripcion`, `usuario_id`, `created_at`) VALUES
(1, 'PC-ARJ-014', 'Registro inicial', 'Equipo importado desde el inventario institucional', 1, '2026-09-22 22:24:14'),
(2, 'PC-ARJ-022', 'Registro inicial', 'Equipo importado desde el inventario institucional', 1, '2026-09-22 22:24:14'),
(3, 'PC-ARJ-063', 'Registro inicial', 'Equipo importado desde el inventario institucional', 1, '2026-09-22 22:24:14'),
(4, 'PC-ARJ-063', 'Orden actualizada', 'La orden OT-2026-00127 cambió a En proceso', 1, '2026-09-22 22:28:25'),
(5, 'PC-ARJ-063', 'Orden actualizada', 'La orden OT-2026-00127 cambió a En proceso', 1, '2026-09-22 22:33:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_trabajo`
--

CREATE TABLE `ordenes_trabajo` (
  `id` int(11) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `equipo_codigo` varchar(60) NOT NULL,
  `tipo` varchar(60) NOT NULL,
  `prioridad` varchar(30) NOT NULL,
  `solicitante` varchar(120) NOT NULL,
  `dependencia_solicitante` varchar(120) NOT NULL,
  `tecnico` varchar(120) NOT NULL,
  `falla` text NOT NULL,
  `diagnostico_inicial` text DEFAULT NULL,
  `actividades` text DEFAULT NULL,
  `repuestos` text DEFAULT NULL,
  `horas` decimal(6,2) DEFAULT 0.00,
  `costo` decimal(12,2) DEFAULT 0.00,
  `diagnostico_final` text DEFAULT NULL,
  `estado_equipo_cierre` varchar(60) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_solicitud` date NOT NULL,
  `fecha_programada` date NOT NULL,
  `fecha_cierre` date DEFAULT NULL,
  `estado` varchar(40) NOT NULL DEFAULT 'Programado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ordenes_trabajo`
--

INSERT INTO `ordenes_trabajo` (`id`, `codigo`, `equipo_codigo`, `tipo`, `prioridad`, `solicitante`, `dependencia_solicitante`, `tecnico`, `falla`, `diagnostico_inicial`, `actividades`, `repuestos`, `horas`, `costo`, `diagnostico_final`, `estado_equipo_cierre`, `observaciones`, `fecha_solicitud`, `fecha_programada`, `fecha_cierre`, `estado`, `created_at`) VALUES
(1, 'OT-2026-00128', 'PC-ARJ-014', 'Correctivo', 'Alta', 'Maria Perez', 'Hacienda', 'C. Mart??nez', 'El equipo se apaga de manera intermitente y presenta lentitud', 'Pendiente diagn??stico final', 'Limpieza interna, revisi??n de temperaturas, pruebas de estabilidad', '', 2.50, 0.00, NULL, NULL, 'Se recomienda monitoreo por 1 semana', '2026-08-27', '2026-08-27', NULL, 'En proceso', '2026-09-22 21:52:59'),
(2, 'OT-2026-00127', 'PC-ARJ-063', 'Preventivo', 'Media', 'Carlos Diaz', 'Planeacion', 'J. Rodr??guez', 'Mantenimiento preventivo semestral programado', 'Mantenimiento preventivo programado semestre 2-2026', '', '', 0.00, 0.00, '', NULL, '', '2026-08-26', '2026-08-28', NULL, 'En proceso', '2026-09-22 21:52:59'),
(3, 'OT-2026-00126', 'PC-ARJ-022', 'Preventivo', 'Baja', 'Ana Gomez', 'Talento Humano', 'J. Rodr??guez', 'Mantenimiento preventivo semestral', 'Mantenimiento preventivo programado', 'Limpieza interna y externa, actualizaci??n SO, revisi??n de antivirus', 'Sin repuestos', 1.50, 0.00, NULL, NULL, 'Se deja programada cotizaci??n de SSD', '2026-08-20', '2026-08-20', NULL, 'Cerrado', '2026-09-22 21:52:59'),
(13, 'OT-2026-00004', 'PC-ARJ-022', 'Correctivo', 'Media', 'Usuario actual', 'Talento Humano', 'Jairo Jose Simancas Cogollo', 'qwq', 'wq', NULL, NULL, 0.00, 0.00, NULL, NULL, NULL, '2026-09-23', '2026-09-23', NULL, 'Programado', '2026-09-23 18:49:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preventivos`
--

CREATE TABLE `preventivos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `equipo_codigo` varchar(60) NOT NULL,
  `dependencia` varchar(120) NOT NULL,
  `frecuencia` varchar(30) NOT NULL,
  `ultimo_mantenimiento` date DEFAULT NULL,
  `proximo_mantenimiento` date NOT NULL,
  `tecnico` varchar(120) NOT NULL,
  `actividades` text NOT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` varchar(40) NOT NULL DEFAULT 'Programado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `preventivos`
--

INSERT INTO `preventivos` (`id`, `codigo`, `equipo_codigo`, `dependencia`, `frecuencia`, `ultimo_mantenimiento`, `proximo_mantenimiento`, `tecnico`, `actividades`, `observaciones`, `estado`, `created_at`) VALUES
(1, 'PR-001', 'PC-ARJ-014', 'Hacienda', 'Semestral', '2026-02-10', '2026-08-10', 'J. Rodr??guez', 'Limpieza interna y externa, actualizaci??n SO y antivirus, revisi??n de disco y RAM', '', 'Programado', '2026-09-22 21:52:59'),
(2, 'PR-002', 'PC-ARJ-063', 'Planeacion', 'Semestral', '2026-02-15', '2026-08-15', 'C. Mart??nez', 'Limpieza interna y externa, actualizaci??n SO y antivirus, revisi??n de disco y RAM', '', 'Programado', '2026-09-22 21:52:59'),
(3, 'PR-003', 'PC-ARJ-022', 'Talento Humano', 'Semestral', '2026-02-20', '2026-08-20', 'J. Rodr??guez', 'Limpieza interna y externa, actualizaci??n SO, revisi??n de antivirus', 'Se recomienda cambio a SSD para mejorar rendimiento', 'Realizado', '2026-09-22 21:52:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuestos`
--

CREATE TABLE `repuestos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(40) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `unidad` varchar(30) NOT NULL,
  `costo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `proveedor` varchar(120) NOT NULL,
  `existencia` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnicos`
--

CREATE TABLE `tecnicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `cargo` varchar(120) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tecnicos`
--

INSERT INTO `tecnicos` (`id`, `nombre`, `cargo`, `correo`, `telefono`, `activo`, `created_at`) VALUES
(1, 'J. Rodr??guez', 'T??cnico TI', 'ti1@arjona-bolivar.gov.co', '310 111 2233', 1, '2026-09-22 21:47:16'),
(2, 'C. Mart??nez', 'T??cnico TI', 'ti2@arjona-bolivar.gov.co', '310 222 3344', 1, '2026-09-22 21:47:16'),
(3, 'L. G??mez', 'T??cnico TI', 'ti3@arjona-bolivar.gov.co', '310 333 4455', 1, '2026-09-22 21:47:16'),
(10, 'J. Rodr├¡guez', 'T├®cnico TI', 'ti1@arjona-bolivar.gov.co', '310 111 2233', 1, '2026-09-22 21:53:52'),
(11, 'C. Mart├¡nez', 'T├®cnico TI', 'ti2@arjona-bolivar.gov.co', '310 222 3344', 1, '2026-09-22 21:53:52'),
(12, 'L. G├│mez', 'T├®cnico TI', 'ti3@arjona-bolivar.gov.co', '310 333 4455', 1, '2026-09-22 21:53:52'),
(19, 'J. Rodríguez', 'Técnico TI', 'ti1@arjona-bolivar.gov.co', '310 111 2233', 1, '2026-09-23 22:35:25'),
(20, 'C. Martínez', 'Técnico TI', 'ti2@arjona-bolivar.gov.co', '310 222 3344', 1, '2026-09-23 22:35:25'),
(21, 'L. Gómez', 'Técnico TI', 'ti3@arjona-bolivar.gov.co', '310 333 4455', 1, '2026-09-23 22:35:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `nombre_completo` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('administrador','tecnico','supervisor','director') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `nombre_completo`, `password_hash`, `rol`, `activo`, `created_at`) VALUES
(1, 'admin', 'Admin TIC', '$2y$10$fJtTVh7h9mD0EPlBhWsTQerV05nHaJ7xVx8Ehln2DGCsZixbWoK.S', 'administrador', 1, '2026-09-22 21:47:16'),
(2, 'tecnico', 'J. Rodr??guez', '$2y$10$Ak1ocDCN0gKvyYiGqhbx4uJzng7WK9.ka87KsmKOnVwMPe3OdTJeO', 'tecnico', 1, '2026-09-22 21:47:16'),
(3, 'supervisor', 'Supervisor TI', '$2y$10$CZmi5Dv/gpRSUZ1x0e1ZS.yCwTJSxXEAyf8EFNxJI/uMkM7Y9B9Sm', 'supervisor', 1, '2026-09-22 21:47:16'),
(4, 'director', 'Director de TI', '$2y$10$WDKo8OMiDEzax7GSVMpNfOl2yhBUXNP7rdWpDjqJoZLIo0T5TqptK', 'director', 1, '2026-09-22 21:47:16');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `dependencias`
--
ALTER TABLE `dependencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `documentos_equipos`
--
ALTER TABLE `documentos_equipos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_documentos_equipo` (`equipo_codigo`),
  ADD KEY `fk_documento_usuario` (`usuario_id`);

--
-- Indices de la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `historial_equipos`
--
ALTER TABLE `historial_equipos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_historial_equipo` (`equipo_codigo`),
  ADD KEY `fk_historial_usuario` (`usuario_id`);

--
-- Indices de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `preventivos`
--
ALTER TABLE `preventivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `repuestos`
--
ALTER TABLE `repuestos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `dependencias`
--
ALTER TABLE `dependencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `documentos_equipos`
--
ALTER TABLE `documentos_equipos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipos`
--
ALTER TABLE `equipos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT de la tabla `historial_equipos`
--
ALTER TABLE `historial_equipos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `preventivos`
--
ALTER TABLE `preventivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `repuestos`
--
ALTER TABLE `repuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `documentos_equipos`
--
ALTER TABLE `documentos_equipos`
  ADD CONSTRAINT `fk_documento_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `historial_equipos`
--
ALTER TABLE `historial_equipos`
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
