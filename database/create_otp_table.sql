-- =========================================================
-- BuildTrack OTP Verifications Table Creation
-- Database: PostgreSQL
-- Schema: buildtrack
-- =========================================================

SET search_path TO buildtrack;

CREATE TABLE IF NOT EXISTS otp_verifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index on email and verification token for fast queries
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_token ON otp_verifications(verification_token);
