-- Fictional content (build plan §4.9 and rule 8).
-- Every person here is invented. Any resemblance to real people is coincidental.
-- Mentors are demo peer/career mentors, NOT therapists, and are labelled as fictional in the UI
-- (mentors.is_fictional is enforced true by a check constraint).

-- ---------------------------------------------------------------------------------------------
-- Demo mentors (12), spread across all 8 divisions
-- Expertise values are codes translated by the UI.
-- ---------------------------------------------------------------------------------------------
insert into public.mentors (name, avatar_seed, expertise, languages, bio_en, bio_bn, division, rating) values
  ('Farhana Akter', 'farhana-akter', '{career_planning,bcs}', '{bn,en}',
   'Demo mentor. Helps graduates compare government and private career paths and plan a realistic study routine for competitive exams.',
   'ডেমো মেন্টর। স্নাতকদের সরকারি ও বেসরকারি ক্যারিয়ারের পথ তুলনা করতে এবং প্রতিযোগিতামূলক পরীক্ষার জন্য বাস্তবসম্মত পড়ার রুটিন সাজাতে সাহায্য করেন।',
   'dhaka', 4.9),
  ('Imran Hossain', 'imran-hossain', '{software,freelancing}', '{bn,en}',
   'Demo mentor. Talks through first steps into software jobs and freelancing: portfolios, practice projects and finding your first client.',
   'ডেমো মেন্টর। সফটওয়্যার চাকরি ও ফ্রিল্যান্সিংয়ে প্রথম পদক্ষেপ নিয়ে কথা বলেন: পোর্টফোলিও, অনুশীলনের প্রজেক্ট আর প্রথম ক্লায়েন্ট খোঁজা।',
   'dhaka', 4.8),
  ('Nusrat Jahan Mim', 'nusrat-jahan-mim', '{exam_stress,study_skills}', '{bn}',
   'Demo mentor. Shares study techniques and simple routines for staying steady during SSC, HSC and university exams.',
   'ডেমো মেন্টর। এসএসসি, এইচএসসি ও বিশ্ববিদ্যালয়ের পরীক্ষার সময় স্থির থাকার জন্য পড়ার কৌশল আর সহজ রুটিন শেয়ার করেন।',
   'chattogram', 4.9),
  ('Rakibul Islam', 'rakibul-islam', '{banking,career_planning}', '{bn,en}',
   'Demo mentor. Explains how banking careers usually start and how to prepare for written tests and interviews.',
   'ডেমো মেন্টর। ব্যাংকিং ক্যারিয়ার সাধারণত কীভাবে শুরু হয় এবং লিখিত পরীক্ষা ও ইন্টারভিউয়ের জন্য কীভাবে প্রস্তুতি নিতে হয়, তা বুঝিয়ে বলেন।',
   'rajshahi', 4.7),
  ('Sadia Chowdhury', 'sadia-chowdhury', '{family,relationships}', '{bn,en}',
   'Demo mentor. Helps you prepare for difficult conversations with family about studies, career and marriage expectations.',
   'ডেমো মেন্টর। পড়াশোনা, ক্যারিয়ার ও বিয়ে নিয়ে পরিবারের প্রত্যাশা বিষয়ে কঠিন আলাপের প্রস্তুতি নিতে সাহায্য করেন।',
   'sylhet', 4.8),
  ('Tanvir Ahmed', 'tanvir-ahmed', '{entrepreneurship}', '{bn,en}',
   'Demo mentor. Walks through testing a small business idea cheaply before investing savings.',
   'ডেমো মেন্টর। সঞ্চয় বিনিয়োগের আগে কম খরচে ছোট ব্যবসার আইডিয়া যাচাই করার ধাপগুলো দেখিয়ে দেন।',
   'khulna', 4.6),
  ('Maliha Sultana', 'maliha-sultana', '{mindfulness,sleep}', '{bn}',
   'Demo mentor. Guides simple breathing, sleep and wind-down habits for busy students.',
   'ডেমো মেন্টর। ব্যস্ত শিক্ষার্থীদের জন্য সহজ শ্বাস-প্রশ্বাস, ঘুম আর দিনশেষে মন শান্ত করার অভ্যাস শেখান।',
   'barishal', 4.9),
  ('Arif Mahmud', 'arif-mahmud', '{admission,study_skills}', '{bn}',
   'Demo mentor. Helps HSC students plan university admission preparation without burning out.',
   'ডেমো মেন্টর। এইচএসসি শিক্ষার্থীদের ক্লান্ত না হয়ে বিশ্ববিদ্যালয় ভর্তির প্রস্তুতি পরিকল্পনা করতে সাহায্য করেন।',
   'rangpur', 4.7),
  ('Jannatul Ferdous', 'jannatul-ferdous', '{ngo,career_planning}', '{bn,en}',
   'Demo mentor. Shares how people typically start in NGO and development work, from volunteering to field roles.',
   'ডেমো মেন্টর। স্বেচ্ছাসেবা থেকে মাঠপর্যায়ের কাজ পর্যন্ত, এনজিও ও উন্নয়ন খাতে সাধারণত কীভাবে শুরু করা হয় তা শেয়ার করেন।',
   'mymensingh', 4.8),
  ('Shakil Rahman', 'shakil-rahman', '{rmg,career_planning}', '{bn}',
   'Demo mentor. Talks about career paths in the garments and textile industry, including merchandising and supply chain.',
   'ডেমো মেন্টর। মার্চেন্ডাইজিং ও সাপ্লাই চেইনসহ পোশাক ও টেক্সটাইল শিল্পের ক্যারিয়ার নিয়ে কথা বলেন।',
   'chattogram', 4.6),
  ('Tasnim Haque', 'tasnim-haque', '{confidence,interviews}', '{bn,en}',
   'Demo mentor. Helps you practise interviews, polish your CV and speak up with more confidence.',
   'ডেমো মেন্টর। ইন্টারভিউ অনুশীলন, সিভি গোছানো আর আরও আত্মবিশ্বাস নিয়ে কথা বলতে সাহায্য করেন।',
   'dhaka', 4.9),
  ('Mehedi Hasan', 'mehedi-hasan', '{habits,digital_wellbeing}', '{bn,en}',
   'Demo mentor. Helps you build small daily habits and a healthier relationship with your phone.',
   'ডেমো মেন্টর। ছোট ছোট দৈনন্দিন অভ্যাস গড়তে এবং ফোনের সঙ্গে আরও স্বাস্থ্যকর সম্পর্ক তৈরি করতে সাহায্য করেন।',
   'sylhet', 4.7)
on conflict (name) do update
  set expertise = excluded.expertise, languages = excluded.languages, bio_en = excluded.bio_en,
      bio_bn = excluded.bio_bn, division = excluded.division, rating = excluded.rating;

-- About three weeks of future evening slots for every demo mentor.
select private.ensure_mentor_slots(21);

-- ---------------------------------------------------------------------------------------------
-- Journal prompts (20), bilingual
-- ---------------------------------------------------------------------------------------------
insert into public.journal_prompts (text_en, text_bn, category) values
  ('What is one small thing that went well today?', 'আজ ছোট্ট কোন বিষয়টা ভালো গেছে?', 'gratitude'),
  ('Who made your day a little easier recently, and how?', 'সম্প্রতি কে আপনার দিনটা একটু সহজ করে দিয়েছে, কীভাবে?', 'gratitude'),
  ('Name three things around you right now that you are thankful for.', 'এই মুহূর্তে আপনার চারপাশের এমন তিনটি জিনিসের নাম লিখুন, যেগুলোর জন্য আপনি কৃতজ্ঞ।', 'gratitude'),
  ('What is taking up most of your mind today? Write it down without judging it.', 'আজ আপনার মন সবচেয়ে বেশি কী নিয়ে ব্যস্ত? বিচার না করে লিখে ফেলুন।', 'reflection'),
  ('What did you learn about yourself this week?', 'এই সপ্তাহে নিজের সম্পর্কে নতুন কী জানলেন?', 'reflection'),
  ('Describe a moment today when you felt calm, even briefly.', 'আজ এমন একটি মুহূর্তের কথা লিখুন, যখন অল্প সময়ের জন্য হলেও শান্ত লেগেছে।', 'reflection'),
  ('If a close friend were in your situation, what would you tell them?', 'আপনার কাছের কোনো বন্ধু এই পরিস্থিতিতে থাকলে, তাকে আপনি কী বলতেন?', 'reflection'),
  ('What is worrying you most about your exams or work right now?', 'এই মুহূর্তে পরীক্ষা বা কাজ নিয়ে সবচেয়ে বেশি কী দুশ্চিন্তা হচ্ছে?', 'stress'),
  ('Which part of this worry can you control, and which part can you let go?', 'এই দুশ্চিন্তার কোন অংশ আপনার নিয়ন্ত্রণে, আর কোন অংশ ছেড়ে দেওয়া যায়?', 'stress'),
  ('Where do you feel stress in your body? What might help it relax?', 'শরীরের কোথায় চাপ অনুভব করছেন? কী করলে সেটা একটু হালকা হতে পারে?', 'stress'),
  ('What is one thing you can take off your plate this week?', 'এই সপ্তাহে কাজের তালিকা থেকে কোন একটি জিনিস বাদ দিতে পারেন?', 'stress'),
  ('What is one small goal you want to reach by the end of this week?', 'এই সপ্তাহের শেষে কোন একটি ছোট লক্ষ্যে পৌঁছাতে চান?', 'goals'),
  ('Imagine yourself one year from now. What would you thank yourself for?', 'নিজেকে এক বছর পরের অবস্থায় কল্পনা করুন। তখন কোন কাজের জন্য নিজেকে ধন্যবাদ দেবেন?', 'goals'),
  ('What is the next tiny step towards something that matters to you?', 'আপনার কাছে গুরুত্বপূর্ণ কোনো কিছুর দিকে পরের ছোট্ট পদক্ষেপটি কী?', 'goals'),
  ('Is there a conversation you have been avoiding? What would you like to say?', 'এমন কোনো আলাপ কি এড়িয়ে যাচ্ছেন? আপনি আসলে কী বলতে চান?', 'relationships'),
  ('Who do you feel most yourself around? What makes that person easy to be with?', 'কার সঙ্গে থাকলে সবচেয়ে বেশি নিজের মতো থাকতে পারেন? তার সঙ্গ সহজ লাগে কেন?', 'relationships'),
  ('Write a short message of thanks to someone, even if you never send it.', 'কাউকে ধন্যবাদ জানিয়ে একটি ছোট বার্তা লিখুন, পাঠান বা না পাঠান।', 'relationships'),
  ('How did you take care of yourself today? How could you tomorrow?', 'আজ কীভাবে নিজের যত্ন নিয়েছেন? কাল কীভাবে নিতে পারেন?', 'self_care'),
  ('What helps you recharge when you feel tired: people, quiet, movement or something else?', 'ক্লান্ত লাগলে কী আপনাকে আবার চাঙ্গা করে: মানুষ, নীরবতা, হাঁটাচলা, নাকি অন্য কিছু?', 'self_care'),
  ('Write down one kind thing you can say to yourself tonight.', 'আজ রাতে নিজেকে বলার মতো একটি সদয় কথা লিখে রাখুন।', 'self_care')
on conflict (text_en) do update set text_bn = excluded.text_bn, category = excluded.category;

-- ---------------------------------------------------------------------------------------------
-- Community "voices" (40 posts) + supportive replies. Authorless (user_id null), fictional
-- aliases, spread over the past month. Topics: exams, admission, family, career, traffic,
-- hostel life, stress, sleep, friendship, motivation.
-- ---------------------------------------------------------------------------------------------
insert into public.posts (user_id, alias_display, body, tags, is_anonymous, like_count, created_at) values
  (null, 'Calm Shapla 42', 'HSC results are coming soon and I can''t focus on anything else. How do you all handle the waiting?', '{exams,stress}', true, 18, now() - interval '2 hours'),
  (null, 'Brave Doel 17', 'Dhaka traffic ate 3 hours of my day again. I started listening to lectures on the bus and it helps a little. Any other tips?', '{traffic}', true, 34, now() - interval '5 hours'),
  (null, 'Kind Kadam 63', 'বাসা থেকে চাপ দিচ্ছে ইঞ্জিনিয়ারিং পড়তে, কিন্তু আমার আগ্রহ ডিজাইনে। কীভাবে বোঝাব বুঝতে পারছি না।', '{family,career}', true, 41, now() - interval '9 hours'),
  (null, 'Hopeful River 28', 'Finally finished my CV using the template here. Applying for internships next week. Wish me luck!', '{career,motivation}', true, 56, now() - interval '14 hours'),
  (null, 'Quiet Nouka 51', 'First month in the hall. The food is bad, the WiFi is worse, but my roommates are kind. Small wins.', '{hostel,friendship}', true, 27, now() - interval '20 hours'),
  (null, 'Steady Banyan 35', 'Anyone else studying for BCS while working full time? How do you find the energy after office?', '{career,exams}', true, 22, now() - interval '1 day 3 hours'),
  (null, 'Warm Borsha 19', 'রাত ২টার আগে ঘুম আসে না, সকালে ক্লাসে মাথা কাজ করে না। কেউ কি এই অভ্যাস বদলাতে পেরেছেন?', '{sleep}', true, 30, now() - interval '1 day 8 hours'),
  (null, 'Bright Ghuri 74', 'Today I told my parents I want to take a gap year to prepare properly for admission. They listened. I did not expect that.', '{family,admission}', true, 63, now() - interval '1 day 16 hours'),
  (null, 'Curious Hilsa 46', 'Freelancing tip I wish I knew earlier: start with small gigs to build reviews, even if the pay is low.', '{career}', true, 38, now() - interval '2 days 2 hours'),
  (null, 'Gentle Mango 12', 'Feeling like everyone around me has their life figured out except me. Is it just me?', '{stress,motivation}', true, 71, now() - interval '2 days 11 hours'),
  (null, 'Clever Tiger 88', 'Made a group study plan with friends for the admission test. We meet at the library three evenings a week. Accountability works!', '{admission,friendship}', true, 29, now() - interval '3 days'),
  (null, 'Cheerful Kathal 23', 'মেসের বাজার ভাগাভাগি নিয়ে রুমমেটদের সঙ্গে ঝামেলা হচ্ছে। শান্তভাবে কথা বলার উপায় কী?', '{hostel}', true, 15, now() - interval '3 days 9 hours'),
  (null, 'Calm River 57', 'Did a 5-minute breathing exercise before my viva today. Hands still shook, but my voice didn''t. Progress.', '{exams,stress}', true, 47, now() - interval '3 days 20 hours'),
  (null, 'Brave Shapla 31', 'My cousin got into a medical college and now every family gathering is about comparing us. How do you deal with comparison?', '{family,stress}', true, 52, now() - interval '4 days 6 hours'),
  (null, 'Kind Nouka 69', 'Job hunting for 6 months now. 40 applications, 3 interviews, no offer yet. Trying not to lose hope.', '{career,motivation}', true, 58, now() - interval '4 days 18 hours'),
  (null, 'Hopeful Kadam 14', 'বৃষ্টির দিনে জ্যামে আটকে থেকে ক্লাস মিস হলো। মনটা খারাপ, কিন্তু অন্তত বাসায় গিয়ে একটা চা খাব।', '{traffic}', true, 24, now() - interval '5 days 4 hours'),
  (null, 'Quiet Tiger 40', 'Anyone else feel lonely even when surrounded by people at university?', '{friendship,stress}', true, 66, now() - interval '5 days 15 hours'),
  (null, 'Steady Doel 83', 'Started walking 20 minutes every morning before class. Two weeks in and I actually feel less anxious.', '{motivation,sleep}', true, 44, now() - interval '6 days 2 hours'),
  (null, 'Warm Ghuri 26', 'I failed one course this semester. Telling my parents was harder than the exam. They were upset but we talked it through.', '{exams,family}', true, 49, now() - interval '6 days 14 hours'),
  (null, 'Bright Hilsa 58', 'এইচএসসির পর কোন বিষয়ে পড়ব, ঠিক করতে পারছি না। আপনারা কীভাবে সিদ্ধান্ত নিয়েছিলেন?', '{admission,career}', true, 37, now() - interval '7 days 3 hours'),
  (null, 'Curious Banyan 11', 'Tip for hostel life: a cheap desk lamp and earplugs changed my study nights completely.', '{hostel}', true, 31, now() - interval '7 days 19 hours'),
  (null, 'Gentle Borsha 92', 'My first salary came in today. Bought sweets for my family. Small joy, big smile.', '{career,motivation}', true, 81, now() - interval '8 days 7 hours'),
  (null, 'Clever Mango 37', 'How do you say no to relatives who keep asking "when are you getting married?" without being rude?', '{family}', true, 45, now() - interval '9 days'),
  (null, 'Cheerful Shapla 65', 'Pomodoro method has been a game changer for my exam prep. 25 minutes study, 5 minutes break. Try it!', '{exams,motivation}', true, 39, now() - interval '9 days 16 hours'),
  (null, 'Calm Kathal 20', 'মাঝে মাঝে মনে হয় পড়াশোনা করে কী হবে, চাকরি তো পাওয়া কঠিন। এই চিন্তা থেকে বের হব কীভাবে?', '{career,stress}', true, 53, now() - interval '10 days 5 hours'),
  (null, 'Brave River 77', 'Moved to Dhaka from Rangpur for my job. Everything is so fast here. Does it get easier?', '{career,friendship}', true, 42, now() - interval '11 days'),
  (null, 'Kind Ghuri 48', 'Spent the evening with my grandmother today, no phone. Felt more rested than any holiday.', '{motivation}', true, 36, now() - interval '11 days 18 hours'),
  (null, 'Hopeful Tiger 33', 'Admission test in two weeks. My mock test scores are going down, not up. Should I change my strategy?', '{admission,exams}', true, 28, now() - interval '12 days 8 hours'),
  (null, 'Quiet Shapla 59', 'রুমমেট অনেক রাত পর্যন্ত আলো জ্বালিয়ে রাখে, আমার ঘুম হয় না। কীভাবে বলব যাতে সম্পর্ক খারাপ না হয়?', '{hostel,sleep}', true, 19, now() - interval '13 days'),
  (null, 'Steady Kathal 16', 'Reminder to myself and anyone who needs it: rest is not laziness.', '{motivation}', true, 94, now() - interval '13 days 20 hours'),
  (null, 'Warm Hilsa 72', 'My presentation went well today! Practised in front of the mirror five times. Thanks to whoever suggested that here.', '{career,motivation}', true, 50, now() - interval '14 days 9 hours'),
  (null, 'Bright Kadam 44', 'I want to switch from business studies to computer science. Is it too late at 22?', '{career,admission}', true, 40, now() - interval '15 days 6 hours'),
  (null, 'Curious Borsha 29', 'বন্ধুরা সবাই বাইরে পড়তে চলে যাচ্ছে, আমি দেশে থাকছি। একটু একা লাগছে।', '{friendship}', true, 47, now() - interval '16 days'),
  (null, 'Gentle Nouka 85', 'Found a quiet corner at the public library near my place. Studying there is so much better than at home.', '{exams}', true, 21, now() - interval '17 days 11 hours'),
  (null, 'Clever Doel 61', 'Does anyone else get headaches from studying on the phone all day? Trying to print notes now.', '{exams,sleep}', true, 18, now() - interval '18 days 4 hours'),
  (null, 'Cheerful River 38', 'My parents finally agreed that I can do a part-time job alongside university. Feeling trusted for the first time.', '{family,career}', true, 57, now() - interval '19 days 13 hours'),
  (null, 'Calm Ghuri 25', 'ভাইভার আগে প্রচণ্ড নার্ভাস লাগে। আপনারা কীভাবে মাথা ঠান্ডা রাখেন?', '{exams,stress}', true, 33, now() - interval '21 days'),
  (null, 'Brave Kathal 90', 'Started keeping a gratitude list in the journal here. Three things a day. It is harder than it sounds, but it helps.', '{motivation}', true, 46, now() - interval '23 days 7 hours'),
  (null, 'Kind Banyan 54', 'Commute tip: I leave 30 minutes earlier and read at a tea stall near office instead of sitting in peak traffic.', '{traffic}', true, 35, now() - interval '25 days'),
  (null, 'Hopeful Mango 67', 'Six months ago I could not speak in class. Today I asked a question in front of 80 people. Small steps really add up.', '{motivation,friendship}', true, 88, now() - interval '28 days')
on conflict (body) where user_id is null do nothing;

-- Supportive replies on a few posts (the comment_count trigger keeps counts in sync).
insert into public.comments (post_id, user_id, alias_display, body, is_anonymous, created_at)
select p.id, null, c.alias, c.body, true, p.created_at + c.after
from (values
  ('HSC results are coming soon and I can''t focus on anything else. How do you all handle the waiting?', 'Steady Kadam 21', 'Plan something small for each day until results. It gave my mind somewhere else to go.', interval '40 minutes'),
  ('HSC results are coming soon and I can''t focus on anything else. How do you all handle the waiting?', 'Warm Tiger 52', 'অপেক্ষাটাই সবচেয়ে কঠিন। যা-ই হোক, এটা শুধু একটা ধাপ, পুরো জীবন না।', interval '1 hour'),
  ('Dhaka traffic ate 3 hours of my day again. I started listening to lectures on the bus and it helps a little. Any other tips?', 'Curious Shapla 13', 'Podcasts in Bangla are great for this. Also offline downloads so you do not burn data.', interval '1 hour'),
  ('Feeling like everyone around me has their life figured out except me. Is it just me?', 'Gentle Hilsa 39', 'Definitely not just you. Most people are figuring it out as they go, they just do not post about it.', interval '30 minutes'),
  ('Feeling like everyone around me has their life figured out except me. Is it just me?', 'Bright Nouka 70', 'Social media shows highlights, not the whole story. You are doing better than you think.', interval '2 hours'),
  ('Job hunting for 6 months now. 40 applications, 3 interviews, no offer yet. Trying not to lose hope.', 'Clever Borsha 86', 'Three interviews means your CV is working. Keep going, and ask interviewers for feedback when you can.', interval '3 hours'),
  ('Job hunting for 6 months now. 40 applications, 3 interviews, no offer yet. Trying not to lose hope.', 'Calm Doel 27', 'Took me 8 months. It happens. Take breaks so it does not eat you up.', interval '5 hours'),
  ('Anyone else feel lonely even when surrounded by people at university?', 'Kind River 18', 'Yes. Joining a small club helped me more than big friend groups.', interval '1 hour'),
  ('Anyone else feel lonely even when surrounded by people at university?', 'Quiet Kathal 64', 'একই অনুভূতি। একজন-দুজন কাছের মানুষ খুঁজে পাওয়াটাই আসল।', interval '4 hours'),
  ('I failed one course this semester. Telling my parents was harder than the exam. They were upset but we talked it through.', 'Hopeful Ghuri 45', 'That took courage. One course does not define you.', interval '2 hours'),
  ('Reminder to myself and anyone who needs it: rest is not laziness.', 'Steady Mango 32', 'Needed this today. Thank you.', interval '20 minutes'),
  ('I want to switch from business studies to computer science. Is it too late at 22?', 'Warm Kadam 79', 'Not too late at all. Many people start coding in their late 20s. Try a free course first to see if you enjoy it.', interval '2 hours'),
  ('বাসা থেকে চাপ দিচ্ছে ইঞ্জিনিয়ারিং পড়তে, কিন্তু আমার আগ্রহ ডিজাইনে। কীভাবে বোঝাব বুঝতে পারছি না।', 'Brave Banyan 56', 'ডিজাইনে ক্যারিয়ারের বাস্তব উদাহরণ আর আয়ের তথ্য দেখিয়ে কথা বলুন। অনেক সময় বাবা-মা অনিশ্চয়তা নিয়েই বেশি চিন্তিত থাকেন।', interval '3 hours'),
  ('How do you say no to relatives who keep asking "when are you getting married?" without being rude?', 'Cheerful Tiger 41', 'I just smile and say "when the time is right, you will be the first to know". Works every time.', interval '1 hour')
) as c(post_body, alias, body, after)
join public.posts p on p.body = c.post_body and p.user_id is null
on conflict (post_id, body) where user_id is null do nothing;
