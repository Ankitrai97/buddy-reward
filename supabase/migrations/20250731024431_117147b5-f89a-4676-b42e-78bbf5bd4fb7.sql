-- Add "Referred Connection" as the first stage in the referral_stage enum
ALTER TYPE referral_stage ADD VALUE 'Referred Connection' BEFORE 'Client Signed';

-- Update the referrals table to have a default stage value
ALTER TABLE referrals ALTER COLUMN stage SET DEFAULT 'Referred Connection';