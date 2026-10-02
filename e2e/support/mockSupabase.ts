/**
 * A tiny in-browser fake of the Supabase REST API, so the signed-in app can be exercised in E2E
 * without a real project. Covers the tables and RPCs the pages read, and accepts writes.
 */
import type { Page, Route } from '@playwright/test';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const HOUR = 3600_000;
const DAY = 24 * HOUR;

export const fixtures = {
  profile: {
    id: USER_ID,
    display_name: 'Nadia',
    anonymous_alias: 'Calm Shapla 42',
    avatar_seed: 'nadia',
    division: 'dhaka',
    university_id: null,
    locale: 'en',
    goals: ['stress'],
    xp: 620,
    level: 2,
    current_streak: 3,
    longest_streak: 6,
    last_active_date: new Date(now).toISOString().slice(0, 10),
    onboarding_done: true,
    is_demo: false,
    created_at: iso(10 * DAY),
    updated_at: iso(DAY),
  },
  quests: [
    {
      id: 'q1',
      code: 'morning_checkin',
      title_en: 'Check in with your mood',
      title_bn: 'আজকের মুড লিখে রাখুন',
      xp_reward: 50,
      type: 'daily',
      completion: 'auto',
      completed: true,
    },
    {
      id: 'q2',
      code: 'read_article',
      title_en: 'Read one self-care article',
      title_bn: 'নিজের যত্ন নিয়ে একটি লেখা পড়ুন',
      xp_reward: 30,
      type: 'daily',
      completion: 'manual',
      completed: false,
    },
    {
      id: 'q3',
      code: 'community_support',
      title_en: 'Share or support someone in the Adda',
      title_bn: 'আড্ডায় কিছু শেয়ার করুন',
      xp_reward: 150,
      type: 'weekly',
      completion: 'auto',
      completed: false,
    },
  ],
  mood_entries: [0, 1, 2, 4, 5].map((d, i) => ({
    id: `m${i}`,
    score: [4, 3, 5, 2, 4][i],
    emotion_tags: i === 0 ? ['calm', 'grateful'] : [],
    note: i === 0 ? 'Good walk this morning.' : null,
    created_at: iso(d * DAY + HOUR),
  })),
  journal_entries: [
    {
      id: 'j1',
      user_id: USER_ID,
      title: 'Exam week',
      body: 'Felt nervous but prepared.',
      prompt_id: null,
      mood_score: 3,
      created_at: iso(DAY),
      updated_at: iso(DAY),
    },
  ],
  journal_prompts: [
    {
      id: 'p1',
      text_en: 'What is one small thing that went well today?',
      text_bn: 'আজ ছোট্ট কোন বিষয়টা ভালো গেছে?',
      category: 'gratitude',
    },
  ],
  divisions: [
    { slug: 'dhaka', name_en: 'Dhaka', name_bn: 'ঢাকা', sort_order: 1 },
    { slug: 'sylhet', name_en: 'Sylhet', name_bn: 'সিলেট', sort_order: 5 },
  ],
  mentors: [
    {
      id: 'mentor1',
      name: 'Farhana Akter',
      avatar_seed: 'farhana-akter',
      expertise: ['career_planning', 'bcs'],
      languages: ['bn', 'en'],
      bio_en: 'Demo mentor. Helps graduates plan careers.',
      bio_bn: 'ডেমো মেন্টর।',
      division: 'dhaka',
      rating: 4.9,
      is_active: true,
      is_fictional: true,
      mentor_slots: [
        {
          id: 's1',
          starts_at: new Date(now + 2 * DAY).toISOString(),
          ends_at: new Date(now + 2 * DAY + 45 * 60_000).toISOString(),
        },
        {
          id: 's2',
          starts_at: new Date(now + 3 * DAY).toISOString(),
          ends_at: new Date(now + 3 * DAY + 45 * 60_000).toISOString(),
        },
      ],
    },
  ],
  bookings: [],
  practitioners: [
    {
      id: 'pr1',
      full_name: 'Dr. Example Person',
      title: 'Consultant, Psychiatry',
      profession: 'psychiatrist',
      credentials: 'MBBS, FCPS (Psychiatry)',
      organization: 'Example Hospital',
      specialties: ['Anxiety', 'Depression'],
      languages: [],
      division_slug: 'dhaka',
      city: 'Dhaka',
      modes: ['in_person'],
      booking_url: 'https://example.org/book',
      profile_url: 'https://example.org/profile',
      source_url: 'https://example.org/profile',
      verified_at: '2026-09-26',
      is_active: true,
    },
  ],
  feed: [
    {
      id: 'post1',
      alias_display: 'Brave Doel 17',
      body: 'Dhaka traffic ate 3 hours of my day again.',
      tags: ['traffic'],
      is_anonymous: true,
      like_count: 34,
      comment_count: 1,
      created_at: iso(5 * HOUR),
      is_mine: false,
      liked_by_me: false,
      is_hidden: false,
    },
    {
      id: 'post2',
      alias_display: 'Calm Shapla 42',
      body: 'Finally finished my CV.',
      tags: ['career'],
      is_anonymous: true,
      like_count: 2,
      comment_count: 0,
      created_at: iso(DAY),
      is_mine: true,
      liked_by_me: true,
      is_hidden: false,
    },
  ],
  comments: [
    {
      id: 'c1',
      post_id: 'post1',
      alias_display: 'Curious Shapla 13',
      body: 'Podcasts help!',
      created_at: iso(4 * HOUR),
      is_mine: false,
    },
  ],
  helplines: [
    {
      id: 'h1',
      name: 'National Emergency Service',
      number: '999',
      description_en: 'Emergency police, fire and ambulance.',
      description_bn: 'জরুরি সেবা।',
      hours: '24/7',
      category: 'emergency',
      is_toll_free: true,
      source_url: 'https://example.org/999',
      verified_at: '2026-09-26',
      sort_order: 1,
    },
    {
      id: 'h2',
      name: 'Moner Bondhu Helpline',
      number: '+8801776632344',
      description_en: 'Mental health organisation helpline.',
      description_bn: 'হেল্পলাইন।',
      hours: '24/7',
      category: 'emotional_support',
      is_toll_free: false,
      source_url: 'https://example.org/mb',
      verified_at: '2026-09-26',
      sort_order: 2,
    },
  ],
  support_organizations: [
    {
      id: 'o1',
      name_en: 'National Institute of Mental Health (NIMH), Dhaka',
      name_bn: 'জাতীয় মানসিক স্বাস্থ্য ইনস্টিটিউট',
      kind: 'government',
      services: [],
      description_en: 'Government national mental health institute.',
      description_bn: 'সরকারি ইনস্টিটিউট।',
      division_slug: 'dhaka',
      city: 'Dhaka',
      address: null,
      phone: '+88 02-22337409',
      website: 'https://nimh.gov.bd/',
      is_free: null,
      source_url: 'https://nimh.gov.bd/contact.php',
      verified_at: '2026-09-26',
    },
  ],
};

function session() {
  const expiresAt = Math.floor(now / 1000) + 3600;
  return {
    access_token: 'e2e-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: 'e2e-refresh-token',
    user: {
      id: USER_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'nadia@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: iso(10 * DAY),
    },
  };
}

async function fulfill(route: Route, body: unknown, single: boolean) {
  const value: unknown = single && Array.isArray(body) ? ((body as unknown[])[0] ?? null) : body;
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(value),
  });
}

/** Sign in a fake user and serve fixture data for every REST/RPC call. */
export async function mockSignedInApp(page: Page) {
  // Vercel supplies these scripts in hosting, but Vite's local preview does not. Stub only
  // the provider assets so delayed telemetry cannot create unrelated 404s in app journeys.
  await page.route(/\/_vercel\/(insights|speed-insights)\/script\.js(?:\?.*)?$/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );

  await page.addInitScript((s) => {
    localStorage.setItem('bondhu-auth', JSON.stringify(s));
  }, session());

  // Realtime: accept the socket but never answer, so the page doesn't log connection errors.
  await page.routeWebSocket(/realtime/, () => undefined);

  await page.route(/\/(rest|auth)\/v1\//, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const accept = request.headers().accept as string | undefined;
    const single = (accept ?? '').includes('vnd.pgrst.object');
    const method = request.method();

    if (url.pathname.startsWith('/auth/v1/')) {
      await fulfill(
        route,
        method === 'POST' && url.pathname.endsWith('/logout') ? {} : session().user,
        false,
      );
      return;
    }

    const name = url.pathname.replace('/rest/v1/', '');
    if (method !== 'GET' && method !== 'HEAD' && !name.startsWith('rpc/')) {
      // Writes: echo back something plausible.
      const body = request.postDataJSON() as Record<string, unknown> | null;
      await fulfill(
        route,
        [
          {
            id: 'new-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...body,
          },
        ],
        single,
      );
      return;
    }

    const table: Record<string, unknown> = {
      profiles: [fixtures.profile],
      mood_entries: fixtures.mood_entries,
      journal_entries: fixtures.journal_entries,
      journal_prompts: fixtures.journal_prompts,
      divisions: fixtures.divisions,
      universities: [],
      mentors: fixtures.mentors,
      bookings: fixtures.bookings,
      practitioners: fixtures.practitioners,
      helplines: fixtures.helplines,
      support_organizations: fixtures.support_organizations,
      resources: [],
      resumes: [],
      'rpc/get_my_quests': fixtures.quests,
      'rpc/get_feed': fixtures.feed,
      'rpc/get_comments': fixtures.comments,
      'rpc/export_my_data': { format: 'bondhu-export-v1', profile: { display_name: 'Nadia' } },
      'rpc/get_leaderboard': [{ rank: 1, alias: 'Calm Koel', score: 12, is_me: true }],
    };
    await fulfill(route, name in table ? table[name] : name.startsWith('rpc/') ? null : [], single);
  });
}
