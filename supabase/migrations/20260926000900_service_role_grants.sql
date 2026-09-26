-- The service role (server-side only, never shipped to the browser) bypasses RLS but still
-- needs table privileges, because this project does not auto-grant new tables.
-- Used by the keep-alive job and admin tasks; not by the frontend.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
