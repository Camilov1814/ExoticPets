Arquitectura distribuida.

#### Base de datos
**Poner:**
- HTTP
- ALL ICMP - IPv4
- MySQL Aurora

**Comandos:**
sudo su
cd ..
cd ..
apt-get update
apt-get upgrade
apt-get install mysql-server
mysql -u root -p
show databases;
use mysql;
show tables;
-- describe user;
select user, host from user;
CREATE USER prueba@'%' IDENTIFIED BY 'prueba';
CREATE DATABASE prueba;
GRANT ALL PRIVILEGES ON prueba.* TO prueba@'%';
use prueba;
show tables;

vamos a esta ruta /etc/mysql/mysql.conf.d# nano mysqld.cnf y ponemos 0.0.0.0 en bind address

#### Back
**Poner:**
- HTTP

Instalar php y php-mysql
sudo su
cd ..
cd ..
apt-get update
apt-get upgrade
apt-get install php
apt-get install php-mysql

Luego vamos a la ruta /var/www/html y creamos el archivo .php

#### Front
**Poner:**
- HTTP

sudo su
cd ..
cd ..
apt-get update
apt-get upgrade

apt-get install apache2

