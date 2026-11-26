-- Security advisor fixes.
alter function public.make_plain(text) set search_path = public, extensions;
alter function public.lexeme_set_plain() set search_path = public, extensions;
-- Trigger-only functions should not be callable over the API.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.protect_profile_role() from anon, authenticated, public;
-- is_admin() and can_review() stay executable: RLS policies call them, and they only reveal the caller's own role.
