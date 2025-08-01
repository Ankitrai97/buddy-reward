-- Update profiles table to store structured payment details
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS bank_details,
ADD COLUMN payment_method TEXT CHECK (payment_method IN ('zelle', 'paypal', 'bank_transfer')),
ADD COLUMN payment_details JSONB;

-- Add comment to explain the payment_details structure
COMMENT ON COLUMN public.profiles.payment_details IS 'Stores payment details based on payment_method: 
- zelle: {"email_or_phone": "value"}
- paypal: {"email": "value"} 
- bank_transfer: {"full_name": "value", "bank_name": "value", "account_number": "value", "routing_number": "value"}';