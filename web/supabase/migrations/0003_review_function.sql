-- One call for every review decision. Checks the caller may review that language,
-- updates the item, writes the audit row, and for an approved Fix-the-AI task
-- publishes the corrected sentence and its recording.
create or replace function public.review_item(p_type text, p_id uuid, p_decision public.item_status, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_lang text;
  v_contrib uuid;
  v_task record;
  v_sentence uuid;
begin
  if p_decision = 'pending' then raise exception 'decision must be approved or rejected'; end if;

  if p_type = 'lexeme' then
    select language, contributor_id into v_lang, v_contrib from lexemes where id = p_id;
  elsif p_type = 'media' then
    select language, contributor_id into v_lang, v_contrib from media where id = p_id;
  elsif p_type = 'sentence' then
    select language, contributor_id into v_lang, v_contrib from sentences where id = p_id;
  elsif p_type = 'task' then
    select * into v_task from tasks where id = p_id;
    v_lang := v_task.target_language; v_contrib := v_task.claimed_by;
  else
    raise exception 'unknown item type %', p_type;
  end if;

  if v_lang is null then raise exception 'item not found'; end if;
  if not public.can_review(v_lang) then raise exception 'not a reviewer for %', v_lang; end if;
  if v_contrib = auth.uid() and not public.is_admin() then raise exception 'you cannot review your own work'; end if;

  if p_type = 'lexeme' then
    update lexemes set status = p_decision, reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note where id = p_id;
  elsif p_type = 'media' then
    update media set status = p_decision, reviewed_by = auth.uid(), reviewed_at = now() where id = p_id;
  elsif p_type = 'sentence' then
    update sentences set status = p_decision, reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note where id = p_id;
  else
    update tasks set status = p_decision::text, reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note where id = p_id;
    if p_decision = 'approved' then
      insert into sentences (concept_id, language, text, english, source, status, contributor_id, reviewed_by, reviewed_at)
      values (v_task.concept_id, v_task.target_language, v_task.corrected_text, v_task.source_text, 'contributor', 'approved', v_task.claimed_by, auth.uid(), now())
      returning id into v_sentence;
      if v_task.audio_media_id is not null then
        update media set status = 'approved', sentence_id = v_sentence, reviewed_by = auth.uid(), reviewed_at = now() where id = v_task.audio_media_id;
      end if;
    elsif v_task.audio_media_id is not null then
      update media set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now() where id = v_task.audio_media_id;
    end if;
  end if;

  insert into reviews (item_type, item_id, language, contributor_id, reviewer_id, decision, note)
  values (p_type, p_id, v_lang, v_contrib, auth.uid(), p_decision, p_note);
end $$;

revoke execute on function public.review_item(text, uuid, public.item_status, text) from anon, public;
grant execute on function public.review_item(text, uuid, public.item_status, text) to authenticated;

-- Send a task back to the pool (reviewer asks for a redo, or contributor gives up).
create or replace function public.release_task(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update tasks set status = 'open', claimed_by = null, claimed_at = null
  where id = p_id and status = 'claimed' and (claimed_by = auth.uid() or public.can_review(target_language));
end $$;
revoke execute on function public.release_task(uuid) from anon, public;
grant execute on function public.release_task(uuid) to authenticated;
