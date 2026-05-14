-- Active: 1778720030525@@127.0.0.1@3306
CREATE TABLE subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active', -- 'active' ou 'unsubscribed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);