-- Migration: Limit premium plan to 3 properties
-- Description: Changes premium plan property_limit from 10 to 3

UPDATE subscription_plans
SET property_limit = 3
WHERE name = 'premium';
