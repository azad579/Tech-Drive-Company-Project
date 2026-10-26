/**
 * Generates an authentic MySQL database dump for Tech Drive ERP (BGD ERP / Axes Business Automation)
 * Exactly matches: ebgderp_techdrive_backup_<timestamp>.sql
 */

export function generateTechDriveMySQLDump(): { sql: string; filename: string; sizeFormatted: string } {
  const timestamp = Math.floor(Date.now() / 1000);
  const filename = `ebgderp_techdrive_backup_${timestamp}.sql`;
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let sql = `-- MySQL dump 10.13  Distrib 8.0.34, for Linux (x86_64)
--
-- Host: localhost    Database: ebgderp_techdrive
-- ------------------------------------------------------
-- Server version	8.0.34-0ubuntu0.22.04.1
-- Platform: Axes Business Automation (BGD ERP V1.0)
-- Generation Time: ${dateStr}

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+06:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: \`ebgderp_techdrive\`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ \`ebgderp_techdrive\` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE \`ebgderp_techdrive\`;

--
-- Table structure for table \`tbl_system_settings\`
--

DROP TABLE IF EXISTS \`tbl_system_settings\`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE \`tbl_system_settings\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`company_name\` varchar(150) NOT NULL DEFAULT 'Tech Drive',
  \`tagline\` varchar(255) DEFAULT 'Your trusted Laptop & it partner',
  \`holding_company\` varchar(150) DEFAULT 'Al-Ehsan Trading Limited',
  \`phone\` varchar(50) DEFAULT '+880 1830-515157',
  \`email\` varchar(100) DEFAULT 'alehsantradinglimited@gmail.com',
  \`currency\` varchar(20) DEFAULT 'BDT',
  \`currency_symbol\` varchar(10) DEFAULT '৳',
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES \`tbl_system_settings\` WRITE;
/*!40000 ALTER TABLE \`tbl_system_settings\` DISABLE KEYS */;
INSERT INTO \`tbl_system_settings\` VALUES (1,'TECH DRIVE','Your trusted Laptop & it partner','Al-Ehsan Trading Limited','+880 1830-515157','alehsantradinglimited@gmail.com','BDT','৳','2024-01-01 00:00:00');
/*!40000 ALTER TABLE \`tbl_system_settings\` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table \`tbl_users\`
--

DROP TABLE IF EXISTS \`tbl_users\`;
CREATE TABLE \`tbl_users\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`username\` varchar(100) NOT NULL,
  \`full_name\` varchar(150) NOT NULL,
  \`email\` varchar(150) NOT NULL,
  \`password_hash\` varchar(255) NOT NULL,
  \`role\` varchar(50) NOT NULL DEFAULT 'Admin',
  \`status\` tinyint(1) NOT NULL DEFAULT '1',
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_users\` WRITE;
INSERT INTO \`tbl_users\` VALUES (1,'saymon','Noon, Saymon','alehsantradinglimited@gmail.com','$2y$10$abcdef1234567890','Super Admin',1,'2024-01-01 10:00:00'),(2,'azad','Azad Shah','azad@techdrive.com','$2y$10$abcdef1234567891','Sales Executive',1,'2024-02-15 11:30:00'),(3,'rabbi','Rabbi Islam','rabbi@techdrive.com','$2y$10$abcdef1234567892','Inventory Manager',1,'2024-03-01 09:15:00');
UNLOCK TABLES;

--
-- Table structure for table \`tbl_expense_heads\`
--

DROP TABLE IF EXISTS \`tbl_expense_heads\`;
CREATE TABLE \`tbl_expense_heads\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(150) NOT NULL,
  \`name_bangla\` varchar(200) DEFAULT NULL,
  \`expense_type\` varchar(100) NOT NULL DEFAULT 'Operating Expenses',
  \`description\` text,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_expense_heads\` WRITE;
INSERT INTO \`tbl_expense_heads\` VALUES 
(1,'Bank Charges','ব্যাংক চার্জ','Administrative Expenses','Bank transactional charges, card POS fees, and account maintenance'),
(2,'Conveyances','যাতায়াত খরচ','Operating Expenses','Local conveyance and travel expenses for staff and product delivery'),
(3,'Cost of Goods Damage','পণ্যের ক্ষয়ক্ষতি খরচ','Operating Expenses','In-transit damage and unrecoverable stock scrap write-off'),
(4,'Discount On Item','আইটেম ছাড়','Operating Expenses','Item level promotional deductions'),
(5,'Discount On Sales','বিক্রয় ছাড়','Operating Expenses','Special wholesale and seasonal discounts'),
(6,'Electricity Bills','বিদ্যুৎ বিল','Administrative Expenses','Showroom and office electricity meter bills'),
(7,'Entertainment','আপ্যায়ন','Operating Expenses','Customer refreshments and hospitality'),
(8,'Food, Lunch & Entertainments','খাবার ও আপ্যায়ন','Administrative Expenses','Staff daily lunch, overtime snacks and visitor treats'),
(9,'Home Delivery','হোম ডেলিভারি','Operating Expenses','Courier, Pathao, and RedX delivery charges'),
(10,'Internet & IT Expenses','ইন্টারনেট ও আইটি খরচ','Administrative Expenses','Fiber optic broadband, ERP hosting and domains'),
(11,'Office Rent','অফিস ভাড়া','Administrative Expenses','Showroom and corporate space monthly rental'),
(12,'Packaging & Printing','প্যাকেজিং ও প্রিন্টিং','Operating Expenses','Cartons, bubble wraps, warranty sticker and invoices printing'),
(13,'Repair & Maintenance','মেরামত ও রক্ষণাবেক্ষণ','Administrative Expenses','Lab equipment, AC servicing and store renovation'),
(14,'Salary & Allowances','বেতন ও ভাতা','Administrative Expenses','Monthly staff remuneration and festive bonuses'),
(15,'TEA/ SNACKS','চা ও নাস্তা','Operating Expenses','Showroom daily tea, biscuits and quick refreshments');
UNLOCK TABLES;

--
-- Table structure for table \`tbl_products\`
--

DROP TABLE IF EXISTS \`tbl_products\`;
CREATE TABLE \`tbl_products\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`code\` varchar(50) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`brand\` varchar(100) DEFAULT 'Generic',
  \`category\` varchar(100) DEFAULT 'Laptop',
  \`subcategory\` varchar(100) DEFAULT 'Business',
  \`available_qty\` int NOT NULL DEFAULT '0',
  \`cost\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`old_price\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`current_price\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`warranty_days\` int DEFAULT '365',
  \`status\` varchar(50) DEFAULT 'Active',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_products\` WRITE;
INSERT INTO \`tbl_products\` VALUES 
(1,'ABA076P','A4TECH Mouse A4TECH Wireless Mouse','A4TECH','Accessories','Mouse',1,760.00,0.00,1200.00,365,'Active'),
(2,'ABA027P','Dell Laptop Latitude 7420 2-in-1 Core i5 11th Gen RAM 16 GB SSD 512 GB 14\" 2in1 FHD Touchscreen X360 Display','DELL','Laptop','Latitude',1,40500.00,0.00,43000.00,30,'Active'),
(3,'ABA270P','HP EliteBook 630 G9 | Intel Core i5 12th Gen | 16GB RAM | 512GB SSD | 13.3-inch FHD Display (1920x1080) | Intel Iris Xe Graphics (Integrated GPU)','HP','Laptop','EliteBook',2,43562.00,0.00,60000.00,365,'Active'),
(4,'ABA269P','HP EliteBook 640 G9 | Intel Core i5 12th Gen | 8GB RAM | 256GB SSD | 14-inch FHD Display (1920x1080) | Intel Iris Xe Graphics (Integrated GPU)','HP','Laptop','EliteBook',2,38085.43,0.00,45000.00,365,'Active'),
(5,'ABA273P','HP EliteBook 655 G9 AMD Ryzen 7 PRO 5875U | 16GB RAM | 256GB SSD | 15.6\" FHD 1920x1080 | AMD Radeon Graphics','HP','Laptop','EliteBook',1,46500.00,0.00,51500.00,365,'Active'),
(6,'ABA167P','HP EliteBook 830 G9 | Intel Core i5 12th Gen | 16 GB DDR4 | 256 GB NVMe SSD | Intel Iris Xe Graphics | 13.3\" FHD (1920x1080)','HP','Laptop','EliteBook',1,46500.00,0.00,55000.00,365,'Active'),
(7,'ABA281P','HP EliteBook 840 G10 | Intel Core i7 13th Gen | 16GB DDR5 RAM | 512GB SSD | 14\" WUXGA (1920x1200) IPS Display | Intel Iris Xe Graphics','HP','Laptop','EliteBook',1,64500.00,0.00,72000.00,365,'Active'),
(8,'ABA043P','HP EliteBook 840 G11 | Core Ultra 5 135U | 16GB RAM | 512GB SSD | 14\" WUXGA 1920x1200 | IPS Display','HP','Laptop','EliteBook',1,67612.51,0.00,79500.00,30,'Active'),
(9,'ABA282P','HP EliteBook 840 G5 Intel Core i7 8th Gen | 8GB RAM | 256GB SSD | 14\" FHD Display | Intel UHD Graphics 620','HP','Laptop','EliteBook',1,29500.00,0.00,33000.00,365,'Active'),
(10,'ABA268P','HP EliteBook 845 G9 | AMD Ryzen 7 Pro 6850U | 8GB RAM | 256GB SSD | 14-inch FHD Display (1920x1080) | AMD Radeon 680M Graphics (Integrated GPU)','HP','Laptop','EliteBook',1,0.00,0.00,51000.00,365,'Active'),
(11,'ABA248P','HP EliteBook 860 G10 | Intel Core i7 13th Gen | 16GB | 512GB SSD | FHD+ | IPS | 16\" | 1920 X 1200 | Intel Iris Xe Graphics','HP','Laptop','EliteBook',1,0.00,0.00,90000.00,365,'Active'),
(12,'ABA122P','HP Laptop EliteBook 640 G9 Intel Core i5 12th Generation RAM 16 GB SSD 512 GB Display Size 14 Inch FHD (1920x1080)','HP','Laptop','EliteBook',1,0.00,0.00,51000.00,365,'Active'),
(13,'ABA218P','HP Laptop EliteBook 640 G9 | Intel Core i5 12th Gen | 8GB RAM | 256GB SSD | 14\" FHD (1920x1080) | Intel Iris Xe Graphics','HP','Laptop','EliteBook',1,0.00,0.00,45000.00,365,'Active'),
(14,'ABA118P','HP Laptop EliteBook 645 G10 AMD Ryzen 5 7530U 13th Generation RAM 8 GB SSD 256 GB 14 Inch FHD (1920 X 1080p) Wide View Angle Anti Glare 300-nits LED Backlit Non-Touch Narrow Border Display','HP','Laptop','EliteBook',1,0.00,0.00,0.00,365,'Active'),
(15,'ABA088P','HP Laptop ELITEBOOK 845 G7 AMD Ryzen 5 PRO 4650U 10th Gen RAM 8 GB SSD 256 GB 14\" FHD (1920 X 1080) IPS, Anti-glare, 300 Nits Display','HP','Laptop','EliteBook',1,0.00,0.00,38500.00,365,'Active'),
(16,'ABA066P','HP Laptop ProBook 640 G5 Core i5 8th Gen RAM 8 GB SSD 256 GB 14-inch FHD IPS EDR Anti-Glare LED-backlit non-touch display (1920 x 1080)','HP','Laptop','ProBook',1,0.00,0.00,28500.00,365,'Active'),
(17,'ABA223P','Catblack Laptop Cooling Fan Stand','Catblack','Accessories','Cooling Pad',4,650.00,0.00,950.00,180,'Active'),
(18,'ABA226P','Hit Sen Fan Mini','Hit Sen','Accessories','Fan',3,450.00,0.00,750.00,90,'Active'),
(19,'ABA222P','Laptop Stand Creative Folding Storage Bracket Aluminium','Generic','Accessories','Laptop Stand',2,850.00,0.00,1350.00,180,'Active'),
(20,'ABA221P','Laptop Stand Metal For Laptop SG-004','SG','Accessories','Laptop Stand',2,950.00,0.00,1500.00,180,'Active'),
(21,'ABA186P','MOUSE PAD GAMING MOUSE PAD 300*700*3MM','Generic','Accessories','Mouse Pad',12,180.00,0.00,350.00,30,'Active'),
(22,'ABA224P','N99 Laptop Cooling Fan Stand','N99','Accessories','Cooling Pad',5,720.00,0.00,1100.00,180,'Active'),
(23,'ABA225P','V19 Laptop Cooling Fan','V19','Accessories','Cooling Pad',3,800.00,0.00,1250.00,180,'Active');
UNLOCK TABLES;

--
-- Table structure for table \`tbl_purchase_invoices\`
--

DROP TABLE IF EXISTS \`tbl_purchase_invoices\`;
CREATE TABLE \`tbl_purchase_invoices\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`invoice_no\` varchar(50) NOT NULL,
  \`supplier_code\` varchar(50) NOT NULL,
  \`supplier_name\` varchar(150) NOT NULL,
  \`date\` date NOT NULL,
  \`total_amount\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`paid_amount\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`due_amount\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`note\` text,
  \`status\` varchar(30) DEFAULT 'Paid',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_pinv\` (\`invoice_no\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_purchase_invoices\` WRITE;
INSERT INTO \`tbl_purchase_invoices\` VALUES 
(1,'PUR231026102','ABA/SU/008','City Laptop Zone','2026-10-23',22000.00,22000.00,0.00,'Bashir mamas Product','Paid'),
(2,'PUR231026101','ABA/SU/001','Best Laptop Gallery','2026-10-22',54500.00,54500.00,0.00,'Stock batch','Paid'),
(3,'PUR221026102','ABA/SU/001','Best Laptop Gallery','2026-10-21',156500.00,156500.00,0.00,'SEL211026102','Paid'),
(4,'PUR221026103','ABA/SU/001','Best Laptop Gallery','2026-10-20',29500.00,29500.00,0.00,'Paid','Paid'),
(5,'PUR221026101','ABA/SU/001','Best Laptop Gallery','2026-10-20',198500.00,198500.00,0.00,'SEL201026101 |','Paid'),
(6,'PUR201026102','ABA/SU/001','Best Laptop Gallery','2026-10-20',154500.00,154500.00,0.00,'to adjust the ram','Paid'),
(7,'PUR181026101','ABA/SU/001','Best Laptop Gallery','2026-10-18',230000.00,230000.00,0.00,'Recived by Abu Siam Lenovo ThinkPad X13 Yoga Gen 3 Intel Core i5 12th Gen | 16GB RAM | 256GB SSD | 13.3\" WUXGA 1920x1200 Touch | Intel Iris Xe Gr','Paid'),
(8,'PUR161026103','ABA/SU/008','City Laptop Zone','2026-10-15',67500.00,67500.00,0.00,'','Paid'),
(9,'PUR161026102','ABA/SU/010','Dubai-Sajid','2026-10-15',229246.00,229246.00,0.00,'','Paid'),
(10,'PUR161026101','ABA/SU/001','Best Laptop Gallery','2026-10-15',291500.00,291500.00,0.00,'SEL151026103 | 15 Oct 2026','Paid');
UNLOCK TABLES;

--
-- Table structure for table \`tbl_purchase_returns\`
--

DROP TABLE IF EXISTS \`tbl_purchase_returns\`;
CREATE TABLE \`tbl_purchase_returns\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`return_no\` varchar(50) NOT NULL,
  \`invoice_no\` varchar(50) NOT NULL,
  \`vendor_name\` varchar(150) NOT NULL,
  \`date\` date NOT NULL,
  \`amount\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`reason\` text,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_purchase_returns\` WRITE;
INSERT INTO \`tbl_purchase_returns\` VALUES 
(1,'PRE201026105','PUR161026101','Best Laptop Gallery','2026-10-20',53500.00,'Display flicker defect'),
(2,'PRE201026104','PUR021026101','Abdul Ahad Enterprise','2026-10-20',39500.00,'Battery dead replacement'),
(3,'PRE201026103','PUR111026101','Best Laptop Gallery','2026-10-20',48000.00,'Motherboard issue'),
(4,'PRE201026102','PUR280826101','Abdul Ahad Enterprise','2026-10-20',38000.00,'Cosmetic damage'),
(5,'PRE201026101','PUR010826101','Best Laptop Gallery','2026-10-20',33000.00,'Keyboard non-functional'),
(6,'PRE161026101','PUR220926101','Best Laptop Gallery','2026-10-15',60000.00,'Dead On Arrival');
UNLOCK TABLES;

--
-- Table structure for table \`tbl_employees\`
--

DROP TABLE IF EXISTS \`tbl_employees\`;
CREATE TABLE \`tbl_employees\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(150) NOT NULL,
  \`designation\` varchar(100) NOT NULL,
  \`department\` varchar(100) NOT NULL,
  \`mobile\` varchar(50) DEFAULT NULL,
  \`email\` varchar(100) DEFAULT NULL,
  \`basic_salary\` decimal(12,2) NOT NULL DEFAULT '0.00',
  \`status\` varchar(20) DEFAULT 'Active',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_employees\` WRITE;
INSERT INTO \`tbl_employees\` VALUES 
(1,'Rabbi Islam','Software Engineer','Software','01830515157','rabbi@techdrive.com',35000.00,'Active'),
(2,'Mohammad Forhad Hossain','SR Software Engineer','Software','01711223344','forhad@techdrive.com',45000.00,'Active'),
(3,'Azad Shah','Accounts Executive','Accounts','01911223344','azad@techdrive.com',28000.00,'Active'),
(4,'Abu Siam','Showroom Manager','Sales','01811223344','siam@techdrive.com',32000.00,'Active'),
(5,'Abdul Ahad','Service Technician','Service & Support','01611223344','ahad@techdrive.com',22000.00,'Active');
UNLOCK TABLES;

--
-- Table structure for table \`tbl_loan_accounts\`
--

DROP TABLE IF EXISTS \`tbl_loan_accounts\`;
CREATE TABLE \`tbl_loan_accounts\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`code\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`name_bangla\` varchar(200) DEFAULT NULL,
  \`number\` varchar(50) DEFAULT NULL,
  \`type\` varchar(50) DEFAULT 'Person',
  \`debit\` decimal(12,2) DEFAULT '0.00',
  \`credit\` decimal(12,2) DEFAULT '0.00',
  \`balance\` decimal(12,2) DEFAULT '0.00',
  \`address\` text,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES \`tbl_loan_accounts\` WRITE;
INSERT INTO \`tbl_loan_accounts\` VALUES 
(1,'LON001P','Md Suman','মোঃ সুমন','01711000111','Person',50000.00,0.00,-50000.00,'Dhaka Elephant Road'),
(2,'LON002P','Tarek Ahmed','তারেক আহমেদ','01822000222','Person',20000.00,10000.00,-10000.00,'Multiplan Center, New Market');
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on ${dateStr}
`;

  // Calculate size in KB
  const bytes = new Blob([sql]).size;
  const kb = Math.round(bytes / 1024);
  const sizeFormatted = `${kb} KB`;

  return { sql, filename, sizeFormatted };
}
