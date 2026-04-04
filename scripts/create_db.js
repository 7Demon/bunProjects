import mysql from 'mysql2/promise';
const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
await connection.query('CREATE DATABASE IF NOT EXISTS bunProjects;');
await connection.end();
console.log('Database bunProjects created or already exists.');
