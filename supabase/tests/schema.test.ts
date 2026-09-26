import { beforeAll, describe, expect, it } from 'vitest';
import { asAnon, asUser, createDb, errMsg, one, signUp, toError, type Db } from './db';

let db: Db;

beforeAll(async () => {
  db = await createDb();
});

async function profileOf(id: string) {
  return one<{
    display_name: string;
    anonymous_alias: string;
    xp: number;
    level: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
  }>(db, 'select * from public.profiles where id = $1', [id]);
}

/** Insert a mentor with one future slot (as superuser, like the seed). Returns the slot id. */
async function createSlot(hoursFromNow = 24) {
  const mentor = await one<{ id: string }>(
    db,
    `insert into public.mentors (name, avatar_seed, bio_en, bio_bn) values ('Demo Mentor', 'seed', 'bio', 'বায়ো') returning id`,
  );
  const slot = await one<{ id: string }>(
    db,
    `insert into public.mentor_slots (mentor_id, starts_at, ends_at)
     values ($1, now() + make_interval(hours => $2), now() + make_interval(hours => $2 + 1)) returning id`,
    [mentor.id, hoursFromNow],
  );
  return slot.id;
}

describe('signup', () => {
  it('creates a profile with a name from metadata and a unique anonymous alias', async () => {
    const a = await signUp(db, 'a@example.com', { display_name: 'Ayesha', locale: 'bn' });
    const b = await signUp(db, 'rafi@example.com');
    const pa = await one<{ display_name: string; locale: string; anonymous_alias: string }>(
      db,
      'select display_name, locale, anonymous_alias from public.profiles where id = $1',
      [a],
    );
    const pb = await profileOf(b);

    expect(pa.display_name).toBe('Ayesha');
    expect(pa.locale).toBe('bn');
    expect(pb.display_name).toBe('rafi'); // falls back to the email name
    expect(pa.anonymous_alias).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ \d+$/);
    expect(pa.anonymous_alias).not.toBe(pb.anonymous_alias);
    expect(pb.xp).toBe(0);
  });
});

describe('row level security', () => {
  let alice: string;
  let bob: string;

  beforeAll(async () => {
    alice = await signUp(db, 'alice@example.com', { display_name: 'Alice' });
    bob = await signUp(db, 'bob@example.com', { display_name: 'Bob' });
    await asUser(db, alice, async () => {
      await db.query(`insert into public.journal_entries (body) values ('my private thoughts')`);
      await db.query(`insert into public.mood_entries (score) values (2)`);
    });
  });

  it('keeps journal entries and moods private to their owner', async () => {
    const own = await asUser(db, alice, () => db.query('select body from public.journal_entries'));
    expect(own.rows).toHaveLength(1);

    const otherJournal = await asUser(db, bob, () =>
      db.query('select id from public.journal_entries'),
    );
    const otherMood = await asUser(db, bob, () => db.query('select id from public.mood_entries'));
    expect(otherJournal.rows).toHaveLength(0);
    expect(otherMood.rows).toHaveLength(0);

    const anon = await asAnon(db, () =>
      db.query('select * from public.journal_entries').catch(toError),
    );
    expect(anon).toBeInstanceOf(Error); // anon has no privilege at all
  });

  it('does not let users write journal entries for someone else', async () => {
    const result = await asUser(db, bob, () =>
      db
        .query(`insert into public.journal_entries (user_id, body) values ($1, 'forged')`, [alice])
        .catch(toError),
    );
    expect(result).toBeInstanceOf(Error);
  });

  it('lets users read only their own profile', async () => {
    const rows = await asUser(db, bob, () => db.query('select id from public.profiles'));
    expect(rows.rows).toEqual([{ id: bob }]);
  });

  it('lets users edit personal fields but never XP, level or streak', async () => {
    await asUser(db, bob, () =>
      db.query(
        `update public.profiles set display_name = 'Bobby', division = 'sylhet' where id = $1`,
        [bob],
      ),
    );
    expect((await profileOf(bob)).display_name).toBe('Bobby');

    const cheat = await asUser(db, bob, () =>
      db.query(`update public.profiles set xp = 999999 where id = $1`, [bob]).catch(toError),
    );
    expect(cheat).toBeInstanceOf(Error);
    expect(errMsg(cheat)).toMatch(/permission denied/);
  });

  it('does not expose internal XP functions to clients', async () => {
    const result = await asUser(db, bob, () =>
      db.query(`select private.award_xp($1, 1000, 'cheat')`, [bob]).catch(toError),
    );
    expect(result).toBeInstanceOf(Error);
  });
});

describe('bookings', () => {
  it('prevents double booking and frees the slot on cancellation', async () => {
    const u1 = await signUp(db, 'u1@example.com');
    const u2 = await signUp(db, 'u2@example.com');
    const slot = await createSlot();

    const booking = await asUser(db, u1, () =>
      one<{ id: string; status: string }>(db, 'select * from public.book_slot($1, $2)', [
        slot,
        'career advice',
      ]),
    );
    expect(booking.status).toBe('upcoming');

    const second = await asUser(db, u2, () =>
      db.query('select * from public.book_slot($1)', [slot]).catch(toError),
    );
    expect(errMsg(second)).toMatch(/slot_unavailable/);

    await asUser(db, u1, () => db.query('select * from public.cancel_booking($1)', [booking.id]));
    const rebooked = await asUser(db, u2, () =>
      one<{ status: string }>(db, 'select * from public.book_slot($1)', [slot]),
    );
    expect(rebooked.status).toBe('upcoming');
  });

  it('enforces one active booking per slot even without the function (unique index)', async () => {
    const u = await signUp(db, 'u3@example.com');
    const slot = await createSlot();
    const mentor = await one<{ mentor_id: string }>(
      db,
      'select mentor_id from public.mentor_slots where id = $1',
      [slot],
    );
    await db.query(
      'insert into public.bookings (user_id, mentor_id, slot_id) values ($1, $2, $3)',
      [u, mentor.mentor_id, slot],
    );
    await expect(
      db.query('insert into public.bookings (user_id, mentor_id, slot_id) values ($1, $2, $3)', [
        u,
        mentor.mentor_id,
        slot,
      ]),
    ).rejects.toThrow(/bookings_one_active_per_slot/);
  });

  it('rejects past slots and direct inserts by clients', async () => {
    const u = await signUp(db, 'u4@example.com');
    const past = await createSlot(-2);
    const result = await asUser(db, u, () =>
      db.query('select * from public.book_slot($1)', [past]).catch(toError),
    );
    expect(errMsg(result)).toMatch(/slot_in_past/);

    const future = await createSlot();
    const direct = await asUser(db, u, () =>
      db
        .query(
          'insert into public.bookings (user_id, mentor_id, slot_id) select $1, mentor_id, id from public.mentor_slots where id = $2',
          [u, future],
        )
        .catch(toError),
    );
    expect(direct).toBeInstanceOf(Error);
  });
});

describe('XP, streaks and quests', () => {
  it('awards XP for activity, completes the check-in quest and starts a streak', async () => {
    const u = await signUp(db, 'xp@example.com');
    await asUser(db, u, () => db.query('insert into public.mood_entries (score) values (4)'));

    const p = await profileOf(u);
    // 10 daily check-in + 10 mood + 50 "morning_checkin" quest
    expect(p.xp).toBe(70);
    expect(p.current_streak).toBe(1);
    expect(p.longest_streak).toBe(1);
  });

  it('caps repeated activity XP per day so it cannot be farmed', async () => {
    const u = await signUp(db, 'farm@example.com');
    await asUser(db, u, async () => {
      for (let i = 0; i < 6; i++)
        await db.query('insert into public.mood_entries (score) values (3)');
    });
    const events = await one<{ n: number }>(
      db,
      `select count(*)::int as n from public.xp_events where user_id = $1 and reason = 'activity:mood'`,
      [u],
    );
    expect(events.n).toBe(3);
    // 10 check-in + 3 × 10 mood + 50 quest (once)
    expect((await profileOf(u)).xp).toBe(90);
  });

  it('continues a streak from yesterday and restarts (without penalty) after a gap', async () => {
    const u = await signUp(db, 'streak@example.com');
    await db.query(
      `update public.profiles set current_streak = 4, longest_streak = 6,
         last_active_date = private.dhaka_today() - 1 where id = $1`,
      [u],
    );
    await asUser(db, u, () => db.query(`insert into public.journal_entries (body) values ('hi')`));
    let p = await profileOf(u);
    expect(p.current_streak).toBe(5);
    expect(p.longest_streak).toBe(6);

    await db.query(
      `update public.profiles set last_active_date = private.dhaka_today() - 3 where id = $1`,
      [u],
    );
    await asUser(db, u, () =>
      db.query(`insert into public.journal_entries (body) values ('back again')`),
    );
    p = await profileOf(u);
    expect(p.current_streak).toBe(1);
    expect(p.longest_streak).toBe(6);
  });

  it('levels up every 500 XP', async () => {
    const levels = await db.query<{ l: number }>(
      'select private.level_for_xp(x) as l from unnest(array[0, 499, 500, 1250]) as x',
    );
    expect(levels.rows.map((r) => r.l)).toEqual([1, 1, 2, 3]);
  });

  it('only allows manual quests through complete_quest(), once per day', async () => {
    const u = await signUp(db, 'quest@example.com');
    const first = await asUser(db, u, () =>
      one<{ completed: boolean }>(db, `select * from public.complete_quest('read_article')`),
    );
    const again = await asUser(db, u, () =>
      one<{ completed: boolean }>(db, `select * from public.complete_quest('read_article')`),
    );
    expect(first.completed).toBe(true);
    expect(again.completed).toBe(false);

    const auto = await asUser(db, u, () =>
      db.query(`select * from public.complete_quest('morning_checkin')`).catch(toError),
    );
    expect(errMsg(auto)).toMatch(/quest_not_found/);

    const quests = await asUser(db, u, () =>
      db.query<{ code: string; completed: boolean }>(
        'select code, completed from public.get_my_quests()',
      ),
    );
    expect(quests.rows.find((q) => q.code === 'read_article')?.completed).toBe(true);
  });
});

describe('community', () => {
  let author: string;
  let reader: string;
  let postId: string;

  beforeAll(async () => {
    author = await signUp(db, 'author@example.com', { display_name: 'Real Name' });
    reader = await signUp(db, 'reader@example.com');
    await asUser(db, author, () =>
      db.query(`insert into public.posts (body, tags) values ('Exam stress is real', '{exams}')`),
    );
    postId = (
      await one<{ id: string }>(db, 'select id from public.posts where user_id = $1', [author])
    ).id;
  });

  it('posts under the anonymous alias by default and never reveals the author', async () => {
    const alias = (await profileOf(author)).anonymous_alias;
    const feed = await asUser(db, reader, () =>
      db.query<{ alias_display: string; is_mine: boolean }>('select * from public.get_feed()'),
    );
    const post = feed.rows.find((r) => r.alias_display === alias);
    expect(post).toBeDefined();
    expect(post?.alias_display).not.toContain('Real Name');
    expect(post?.is_mine).toBe(false);

    const leak = await asUser(db, reader, () =>
      db.query('select user_id from public.posts').catch(toError),
    );
    expect(errMsg(leak)).toMatch(/permission denied/);
  });

  it('ignores client-supplied counters and authors', async () => {
    const forged = await asUser(db, reader, () =>
      db.query(`insert into public.posts (body, like_count) values ('x', 999)`).catch(toError),
    );
    expect(errMsg(forged)).toMatch(/permission denied/);
  });

  it('keeps like and comment counts in sync', async () => {
    await asUser(db, reader, async () => {
      await db.query('insert into public.post_likes (post_id) values ($1)', [postId]);
      await db.query(`insert into public.comments (post_id, body) values ($1, 'You got this')`, [
        postId,
      ]);
    });
    let post = await one<{ like_count: number; comment_count: number }>(
      db,
      'select * from public.posts where id = $1',
      [postId],
    );
    expect(post.like_count).toBe(1);
    expect(post.comment_count).toBe(1);

    const feed = await asUser(db, reader, () =>
      db.query<{ id: string; liked_by_me: boolean }>(
        'select id, liked_by_me from public.get_feed()',
      ),
    );
    expect(feed.rows.find((r) => r.id === postId)?.liked_by_me).toBe(true);

    await asUser(db, reader, () =>
      db.query('delete from public.post_likes where post_id = $1', [postId]),
    );
    post = await one(db, 'select * from public.posts where id = $1', [postId]);
    expect(post.like_count).toBe(0);
  });

  it('auto-hides a post after 3 distinct reports, but the author still sees it', async () => {
    const reporters = await Promise.all(
      ['r1', 'r2', 'r3'].map((n) => signUp(db, `${n}@example.com`)),
    );
    for (const r of reporters) {
      await asUser(db, r, () =>
        db.query(`insert into public.reports (post_id, reason) values ($1, 'spam')`, [postId]),
      );
    }

    const hidden = await one<{ is_hidden: boolean }>(
      db,
      'select is_hidden from public.posts where id = $1',
      [postId],
    );
    expect(hidden.is_hidden).toBe(true);

    const readerFeed = await asUser(db, reader, () =>
      db.query<{ id: string }>('select id from public.get_feed()'),
    );
    expect(readerFeed.rows.some((r) => r.id === postId)).toBe(false);

    const authorFeed = await asUser(db, author, () =>
      db.query<{ id: string; is_hidden: boolean }>('select id, is_hidden from public.get_feed()'),
    );
    expect(authorFeed.rows.find((r) => r.id === postId)?.is_hidden).toBe(true);

    const duplicate = await asUser(db, reporters[0], () =>
      db
        .query(`insert into public.reports (post_id, reason) values ($1, 'spam')`, [postId])
        .catch(toError),
    );
    expect(duplicate).toBeInstanceOf(Error);
  });

  it('requires sign-in to read the feed', async () => {
    const result = await asAnon(db, () =>
      db.query('select * from public.get_feed()').catch(toError),
    );
    expect(result).toBeInstanceOf(Error);
  });
});

describe('reference data', () => {
  it('is readable when signed out and not writable', async () => {
    const divisions = await asAnon(db, () =>
      db.query<{ name_bn: string }>('select name_bn from public.divisions'),
    );
    expect(divisions.rows).toHaveLength(8);
    expect(divisions.rows.map((r) => r.name_bn)).toContain('ঢাকা');

    const write = await asAnon(db, () =>
      db
        .query(`insert into public.divisions (slug, name_en, name_bn) values ('x', 'X', 'এক্স')`)
        .catch(toError),
    );
    expect(write).toBeInstanceOf(Error);
  });
});
