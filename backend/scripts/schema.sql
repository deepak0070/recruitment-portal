-- Database Initialization Script for Recruitment Portal
CREATE DATABASE IF NOT EXISTS recruitment_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recruitment_portal;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'candidate') NOT NULL DEFAULT 'candidate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    salary_range VARCHAR(100) NULL,
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_created_by (created_by),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_job_type (job_type)
) ENGINE=InnoDB;

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    resume_path VARCHAR(255) NOT NULL,
    cover_note TEXT NULL,
    status ENUM('applied', 'shortlisted', 'interview', 'offered', 'rejected') NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_user (job_id, user_id),
    INDEX idx_applications_job_id (job_id),
    INDEX idx_applications_user_id (user_id),
    INDEX idx_applications_status (status)
) ENGINE=InnoDB;
