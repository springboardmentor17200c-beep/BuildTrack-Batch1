-- =========================================================
-- BuildTrack Database Setup
-- Construction Project Management & Site Monitoring Platform
-- Database: PostgreSQL
-- =========================================================

-- Create the schema if it does not already exist
CREATE SCHEMA IF NOT EXISTS buildtrack;

-- Set the default schema for the current session
SET search_path TO buildtrack;

-- Verify the active schema
SHOW search_path;