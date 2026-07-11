# BuildTrack Database

This directory contains all SQL scripts required to set up the PostgreSQL database for the **BuildTrack – Construction Project Management & Site Monitoring Platform**.

## Files

### `database_setup.sql`

Creates the `buildtrack` schema and sets it as the active schema.

### `database_schema.sql`

Creates all database tables, primary keys, foreign keys, constraints, and relationships.

### `sample_data.sql`

Inserts sample records required for development and testing, including default roles, a sample company, and sample users.

---

## Prerequisites

Before running the database scripts, ensure that:

- PostgreSQL is installed.
- A PostgreSQL server is running.
- You have permission to create schemas and tables.

---

## Database Setup

Run the SQL scripts in the following order:

1. Execute `database_setup.sql`.
2. Execute `database_schema.sql`.
3. Execute `sample_data.sql`.

After completing these steps, the BuildTrack database will be ready for development and testing.

---

## Sample Accounts

The sample data includes predefined user accounts for different roles:

- Administrator
- Project Manager
- Site Engineer
- Worker
- Client

These accounts are intended only for development and testing purposes.

> **Note:** Passwords are stored as BCrypt hashes. Use the password configured by the backend team when testing authentication.

---

## Database Information

- Database Management System: PostgreSQL
- Schema Name: `buildtrack`
- Project: BuildTrack – Construction Project Management & Site Monitoring Platform
- Version: 1.0

---

## Implemented Modules

The current database implementation includes:

- User Management
- Company Management
- Role-Based Access Control (RBAC)
- Project Management
- Workforce Management
- Site Monitoring
- Resource Management
- Material & Inventory Management
- Procurement Management
- Budget & Cost Management
- Notification Management

---

## Notes

- Execute the SQL scripts only in the specified order.
- The sample data is intended for development and testing only.
- The database schema follows normalization principles and uses foreign key constraints to maintain data integrity.
- Additional modules and tables can be incorporated in future versions without requiring major changes to the existing schema.

---

**BuildTrack Database**
Version 1.0
