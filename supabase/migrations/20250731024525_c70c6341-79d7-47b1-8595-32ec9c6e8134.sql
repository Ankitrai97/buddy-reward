-- Update the referrals table to have a default stage value
ALTER TABLE referrals ALTER COLUMN stage SET DEFAULT 'Referred Connection';