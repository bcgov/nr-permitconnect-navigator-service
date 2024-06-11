-- To be run manually against the database after the automated deployed migration has been completed
-- Execute this script in 3 separate phases

-- 1. Run first
update public.submission
set contact_first_name = (regexp_split_to_array(contact_name, E'\\s+'))[1],
contact_last_name = array_to_string((regexp_split_to_array(contact_name, E'\\s+'))[2:], ' ');

-- 2. Verify data is correct

-- 3. Run second
alter table public.submission
drop column contact_name;
