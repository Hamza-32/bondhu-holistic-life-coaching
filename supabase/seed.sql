-- Seed data.
--
-- Rules (docs/BUILD_PLAN.md §4 and docs/DATA_SOURCES.md):
--   * Real reference data only from verified sources, each listed in docs/DATA_SOURCES.md.
--   * People are always fictional.
-- Phase 2 seeds only what the app needs to function. Phase 3 adds districts, universities,
-- helplines, organisations, careers, resources, calendar, mentors, posts and prompts.
--
-- Idempotent: safe to run more than once.

-- Divisions: Bangladesh National Portal, https://bangladesh.gov.bd/views/division-list (checked 2026-09-26)
insert into public.divisions (slug, name_en, name_bn, sort_order) values
  ('dhaka', 'Dhaka', 'ঢাকা', 1),
  ('khulna', 'Khulna', 'খুলনা', 2),
  ('chattogram', 'Chattogram', 'চট্টগ্রাম', 3),
  ('rajshahi', 'Rajshahi', 'রাজশাহী', 4),
  ('sylhet', 'Sylhet', 'সিলেট', 5),
  ('rangpur', 'Rangpur', 'রংপুর', 6),
  ('mymensingh', 'Mymensingh', 'ময়মনসিংহ', 7),
  ('barishal', 'Barishal', 'বরিশাল', 8)
on conflict (slug) do update
  set name_en = excluded.name_en, name_bn = excluded.name_bn, sort_order = excluded.sort_order;

-- Quests referenced by private.record_activity(). XP values carried over from the MVP.
insert into public.quests (code, title_en, title_bn, xp_reward, type, completion, sort_order) values
  ('morning_checkin', 'Check in with your mood', 'আজকের মুড লিখে রাখুন', 50, 'daily', 'auto', 1),
  ('breathing_478', 'Do a breathing exercise', 'একটি শ্বাস-প্রশ্বাসের অনুশীলন করুন', 100, 'daily', 'auto', 2),
  ('read_article', 'Read one self-care article', 'নিজের যত্ন নিয়ে একটি লেখা পড়ুন', 30, 'daily', 'manual', 3),
  ('write_journal', 'Write in your journal', 'জার্নালে কিছু লিখুন', 40, 'daily', 'auto', 4),
  ('community_support', 'Share or support someone in the Adda', 'আড্ডায় কিছু শেয়ার করুন বা কাউকে সাহস দিন', 150, 'weekly', 'auto', 1)
on conflict (code) do update
  set title_en = excluded.title_en, title_bn = excluded.title_bn, xp_reward = excluded.xp_reward,
      type = excluded.type, completion = excluded.completion, sort_order = excluded.sort_order;
