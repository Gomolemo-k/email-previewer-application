-- Migration number: 0006
-- Description: Add cancellation tracking fields to payment table

ALTER TABLE payment 
ADD COLUMN canceled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN cancel_reason TEXT;