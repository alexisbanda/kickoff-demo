#!/bin/sh
# Crea la base de datos de test además de la base principal que ya crea
# la imagen oficial a partir de POSTGRES_DB (turnos).
# Se ejecuta solo la primera vez que se inicializa el volumen de datos.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
    SELECT 'CREATE DATABASE turnos_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'turnos_test')\gexec
SQL
