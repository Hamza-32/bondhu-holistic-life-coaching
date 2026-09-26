# Data sources

Every factual Bangladeshi data point in Bondhu is listed here with its source and the date it was checked: statistics, helplines, organisations, practitioners, institutions, geography and dates.

- **Per-entry evidence.** Each dataset lives in [`supabase/data/`](../supabase/data/) as JSON. Every entry has its `source_url` and a verbatim `evidence` quote. `npm run db:seed:build` generates `supabase/seed/01–03_*.sql` from these files, and only entries marked `VERIFIED` are seeded.
- **Curated edits** (Bangla translations of verified text, normalised hours, removed fields) are in [`supabase/data/overrides.json`](../supabase/data/overrides.json).
- **Fictional content** (demo mentors, community posts, journal prompts) is in `supabase/seed/04_fictional.sql` and contains no real people.

**Rules**

- Prefer primary sources: government `.gov.bd` portals, WHO, UGC, and the organisation's own site. News reports are used only as a labelled secondary source.
- Quote figures exactly as the source states them.
- Anything that cannot be verified is left out of the seed and listed under [Unverified](#unverified--to-do).
- Re-check helplines and practitioner listings before each release, because numbers, hours and staff change.

---

## Mental health statistics

| Figure                                                  | Value                                                        | Used in                     |
| ------------------------------------------------------- | ------------------------------------------------------------ | --------------------------- |
| Adults (18–99) with a mental disorder                   | 16.8%                                                        | Landing page, Stats section |
| Children (7–17) with a mental disorder                  | 13.6%                                                        | Landing page, Stats section |
| Adults with a mental disorder not receiving treatment   | 92.3%                                                        | Landing page, Stats section |
| Children with a mental disorder not receiving treatment | 94.5%                                                        | Not shown yet               |
| Sample                                                  | 7,270 adults, 2,246 children; data collected April–June 2019 | Not shown yet               |

- **Source:** National Mental Health Survey, Bangladesh 2019, carried out by the National Institute of Mental Health (NIMH) with technical support from WHO. Initial findings released by the Ministry of Health and Family Welfare. WHO Bangladesh news release, 27 November 2019. <https://www.who.int/bangladesh/news/detail/27-11-2019-minister-of-health-releases-first-findings-of-national-mental-health-survey>
- **Verbatim:** "the prevalence of mental health disorders is 16.8% among the adults aged 18–99 years and 13.6% for children aged 7–17 years" and "92.3% of adults and 94.5% of children diagnosed with mental disorders do not get treatment for their condition."
- **Checked:** 2026-09-26. The raw page HTML was checked directly as well as through a summary fetch.
- **Caveats:**
  - These are _initial_ findings. A later WHO report ([WHO Special Initiative for Mental Health, Bangladesh country report, 2020](https://www.who.int/docs/default-source/mental-health/special-initiative/who-special-initiative-country-report---bangladesh---2020.pdf?sfvrsn=c2122a0e_2)) quotes 18.7% of adults and 12.6% of children for the same survey, but it repeats the 92.3% treatment gap.
  - We cite the WHO Bangladesh release because it is the primary announcement and gives all four figures together. The landing page labels them "initial findings".
  - The survey's provisional fact-sheet PDF on who.int now returns 404.

## Emergency and helplines

Checked 2026-09-26. Only verified entries are seeded. Hours are stored normalised (e.g. `24/7`, `10:00–22:00`).

| Number         | Service                                                              | Hours                         | Toll-free | Source                                                                             |
| -------------- | -------------------------------------------------------------------- | ----------------------------- | --------- | ---------------------------------------------------------------------------------- |
| 999            | National Emergency Service 999                                       | 24 hours a day, 7 days a week | yes       | <https://telecom-police.portal.gov.bd/pages/static-pages/695e3b0cc4774958d7b72321> |
| 109            | National Helpline Centre for Violence Against Women and Children 109 | 24 hours                      | yes       | <https://dwa.gov.bd/site/page/d2f28455-6c23-4d74-9c89-ff377be01dc2/->              |
| 1098           | Child Helpline 1098                                                  | 24 hours (day and night)      | yes       | <https://dss.gov.bd/pages/static-pages/6922e007933eb65569e2519a>                   |
| 333            | National Helpline 333                                                | 24x7, 365 days                | no        | <https://bangladesh.gov.bd/site/page/79d371f2-4530-437a-982f-16c7c0a2ecad>         |
| 16263          | Shastho Batayon 16263 (Health Call Centre)                           | 24 hours                      | no        | <https://16263.dghs.gov.bd/>                                                       |
| +8801776632344 | Moner Bondhu Helpline                                                | 24/7 (as stated on the site)  | no        | <https://monerbondhu.com/>                                                         |
| 09606119900    | SHOJON tele mental health service (SAJIDA Foundation)                | 10 am to 10 pm                | no        | <https://shojon.sajida.org/>                                                       |
| 09678678778    | Vent by Mindspace                                                    | 6 PM to 6 AM                  | no        | <https://mindspacebd.com/>                                                         |

Notes:

- **999** covers police, fire service and ambulance. It is run by Bangladesh Police under the Ministry of Home Affairs (launched 12 Dec 2017). 999.gov.bd loads its content with JavaScript and had an expired TLS certificate, so the police portal is the source.
- **333** is not toll-free: bangladesh.gov.bd lists 60 paisa/min. The long code 09666789333 works from landlines and abroad.
- **16263** is a general health line. The official page does not mention mental-health counselling, so the app must not present it as one.
- **109** was verified on dwa.gov.bd, because mspvaw.gov.bd did not resolve.

### Kaan Pete Roi: excluded (`TODO: VERIFY`)

- The bare domain `kaanpeteroi.org` redirects to an unrelated site, which served a gambling page on 2026-09-26. The domain looks compromised or lapsed. **Never link it.**
- The old page `kaanpeteroi.org/helpline-service/`, LifeLine International, findahelpline and The Daily Star (May 2024) agree on **09612119911, 3 PM–3 AM daily**.
- Befrienders Worldwide lists different mobile numbers as 24/7, one of them malformed.
- The organisation's own Facebook page is behind a login wall.
- **To include it:** a person must confirm the number and hours on a source Kaan Pete Roi controls (its Facebook page, or by contacting it).

## Mental-health organisations (`support_organizations`)

Checked 2026-09-26. Verified entries only.

| Organisation                                                                      | Kind              | Source                                                                            |
| --------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| National Institute of Mental Health (NIMH), Dhaka                                 | government        | <https://nimh.gov.bd/contact.php>                                                 |
| Pabna Mental Hospital                                                             | hospital          | <https://mentalhospital.pabna.gov.bd/pages/static-pages/697ff42335ce18e1c06dca58> |
| Department of Psychiatry, Bangladesh Medical University (BMU, formerly BSMMU)     | hospital          | <https://www.bmu.ac.bd/about>                                                     |
| National Trauma Counseling Centre (NTCC)                                          | government        | <https://mowca.gov.bd/pages/static-pages/694032a235ce18e1c055fb4c>                |
| Moner Bondhu                                                                      | ngo               | <https://monerbondhu.com/>                                                        |
| SAJIDA Foundation - SHOJON tele mental health and Sajida Trauma Counseling Centre | ngo               | <https://www.sajida.org/sajidas-approach/fostering-equity/mental-health/>         |
| Mindspace (Vent crisis hotline)                                                   | ngo               | <https://mindspacebd.com/>                                                        |
| NSU Counseling & Wellbeing Center, North South University                         | university        | <https://www.northsouth.edu/resources/cwc.html>                                   |
| Bangladesh Clinical Psychology Society (BCPS)                                     | professional_body | <https://bcps.org.bd/>                                                            |

Not included (could not be verified from an official, reachable page): University of Dhaka Clinical Psychology / Nasirullah Psychotherapy Unit (its site says "Coming Soon"), BRAC University Counseling and Wellness Centre (HTTP 403), Innovation for Wellbeing Foundation (site unreachable), BRAC NGO counselling (not open to the public), Talk Hope and Alapon (listed only on a third-party site).

## Practitioner directory (`practitioners`)

Allowed by the [build plan rule 8 amendment](./BUILD_PLAN.md) (project owner, 2026-09-26). Conditions:

- Real professionals who **publicly offer appointments** on an official page: a hospital consultant profile, or an established counselling organisation's profile.
- Only published professional details are stored. **No photos, personal phone numbers, emails, fees or addresses.**
- The app's button opens the professional's own `booking_url`. **Bondhu never books** and shows "Not affiliated with Bondhu".
- Aggregator and SEO doctor-listing sites are never used as sources.

Checked 2026-09-26. Every booking URL returned HTTP 200 on that date.

| Name                                        | Title                                                    | Organisation                                                           | City       | Source (official page)                                                       |
| ------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Dr. Farzana Rahman                          | Consultant in Psychiatry                                 | Evercare Hospital Dhaka                                                | Dhaka      | <https://www.evercarebd.com/en/dhaka/doctors/dr-farzana-rahman-psychiatry>   |
| Dr. Nigar Sultana                           | Consultant in Psychiatry                                 | Evercare Hospital Dhaka                                                | Dhaka      | <https://www.evercarebd.com/en/dhaka/doctors/dr-nigar-sultana>               |
| Ms. Alya Fardous Azad                       | Senior Counsellor, Counselling Centre                    | Evercare Hospital Dhaka                                                | Dhaka      | <https://www.evercarebd.com/en/dhaka/doctors/ms-alya-fardous-azad>           |
| Mrs. Sharmin Haque                          | Clinical Psychologist                                    | Square Hospitals Ltd.                                                  | Dhaka      | <https://www.squarehospital.com/doctors/19>                                  |
| Prof. Dr. (Brig Gen) AHM Kazi Mostofa Kamal | Consultant, Psychiatry                                   | Square Hospitals Ltd.                                                  | Dhaka      | <https://www.squarehospital.com/doctors/285>                                 |
| Prof. Dr. Brig. Gen. Md. Azizul Islam       | Senior Consultant, Psychiatry                            | Square Hospitals Ltd.                                                  | Dhaka      | <https://www.squarehospital.com/doctors/150>                                 |
| Prof. Md. Waziul Alam Chowdhury             | Senior Consultant - Psychiatry                           | Square Hospitals Ltd.                                                  | Dhaka      | <https://www.squarehospital.com/doctors/139>                                 |
| Moslema Afruzzahan                          | Clinical Psychologist                                    | Moner Bondhu                                                           | Dhaka      | <https://monerbondhu.com/counsellors/moslema>                                |
| Md. Bariul Islam                            | Clinical Psychologist                                    | Moner Bondhu                                                           | Dhaka      | <https://monerbondhu.com/counsellors/md-bariul-islam>                        |
| Ahsan Bin Arefin                            | Clinical Psychologist                                    | Moner Bondhu                                                           | Dhaka      | <https://monerbondhu.com/counsellors/ahsan-bin-arefin>                       |
| Nabila Afroz                                | Senior Psychosocial Counselor                            | Moner Bondhu                                                           | Dhaka      | <https://monerbondhu.com/counsellors/nabila-afroz>                           |
| Dr. Shaafi Raaisul Mahmood                  | Attending Consultant Psychiatrist                        | Evercare Hospital Chattogram                                           | Chattogram | <https://www.evercarebd.com/en/chattogram/doctors/dr-shaafi-raaisul-mahmood> |
| Nazmun Nahar Swarna                         | Counselling Psychologist                                 | Evercare Hospital Chattogram (Counselling Center)                      | Chattogram | <https://www.evercarebd.com/en/chattogram/doctors/nazmun-nahar-swarna>       |
| Dr. Arafat Azim                             | Consultant (Psychiatry & Mental Health)                  | Ibn Sina Diagnostic & Consultation Center, Chattogram (Ibn Sina Trust) | Chattogram | <https://ibnsinatrust.com/view_departmentwiseDoctor.php?id=588>              |
| Dr. Md. Mubin Uddin                         | Assistant Professor (Psychiatry)                         | Ibn Sina Hospital Sylhet Limited                                       | Sylhet     | <https://ibnsinahospitalsylhet.com.bd/consultant-details.php?id=128>         |
| Dr. Samsul Haque Chowdhury                  | Associate Professor, SOMCH                               | Ibn Sina Hospital Sylhet Limited                                       | Sylhet     | <https://ibnsinahospitalsylhet.com.bd/consultant-details.php?id=66>          |
| Dr. Shafiqur Rahman                         | Professor and Head of the Department (Psychiatry), SWMCH | Ibn Sina Hospital Sylhet Limited                                       | Sylhet     | <https://ibnsinahospitalsylhet.com.bd/consultant-details.php?id=69>          |
| Sadia Arifin Runa                           | Psychologist & Psychotherapist                           | Ibn Sina Hospital Sylhet Limited                                       | Sylhet     | <https://ibnsinahospitalsylhet.com.bd/consultant-details.php?id=1405>        |
| Dr. M M Rana                                | Consultant (Psychiatric Specialist)                      | Ibn Sina Diagnostic & Consultation Center, Rajshahi (Ibn Sina Trust)   | Rajshahi   | <https://ibnsinatrust.com/view_departmentwiseDoctor.php?id=703>              |
| Dr. Md. Shamiul Alam                        | Assistant Professor (Psychiatric Specialist)             | Ibn Sina Diagnostic & Consultation Center, Rajshahi (Ibn Sina Trust)   | Rajshahi   | <https://ibnsinatrust.com/view_departmentwiseDoctor.php?id=703>              |

Booking differs by source:

- **Evercare and Square** have online appointment-request forms.
- **Moner Bondhu** profiles have a slot-booking widget.
- **Ibn Sina** pages list chamber times and ask patients to call the hospital. For those entries `booking_url` is the official schedule page.

"In person" for hospital entries is implied by the setting. Titles are shown exactly as published: some Sylhet entries show teaching posts (e.g. "Associate Professor, SOMCH").

**Removal and corrections:** anyone listed can ask to be updated or removed. Re-verify every entry before each release, and set `is_active = false` for anyone who no longer appears on their official page.

**Related directory (not copied):** the Bangladesh Clinical Psychology Society publishes member lists at <https://bcps.org.bd/?page_id=370>. They include personal emails, so they are not copied into the app.

## Geography

### Divisions (8)

Official English spellings (post-2018: Chattogram, Barishal) and Bangla names, in the order the National Portal lists them.

| English    | Bangla    |
| ---------- | --------- |
| Dhaka      | ঢাকা      |
| Khulna     | খুলনা     |
| Chattogram | চট্টগ্রাম |
| Rajshahi   | রাজশাহী   |
| Sylhet     | সিলেট     |
| Rangpur    | রংপুর     |
| Mymensingh | ময়মনসিংহ |
| Barishal   | বরিশাল    |

- **Source:** Bangladesh National Portal division list, English and Bangla versions: <https://bangladesh.gov.bd/views/division-list>
- **Spelling change:** decided by the National Implementation Committee for Administrative Reorganisation, April 2018 (reported by Prothom Alo English: <https://en.prothomalo.com/bangladesh/English-spelling-of-5-districts-changed>).
- **Checked:** 2026-09-26
- **Used in:** `supabase/seed.sql` (`divisions`), onboarding division picker.

### Districts (64)

- **All 64 districts**, with the current official English spellings and Bangla names, are in [`supabase/data/districts.json`](../supabase/data/districts.json). Per division: Dhaka 13, Chattogram 11, Khulna 10, Rajshahi 8, Rangpur 8, Barishal 6, Sylhet 4, Mymensingh 4.
- **Official spellings:** post-2018 forms such as Chattogram, Cumilla, Jashore, Bogura and Barishal, plus Jhalakathi, Kishoreganj, Moulvibazar, Netrokona and Chapainawabganj.
- **Judgement calls:** Cox's Bazar (the portal title says "Coxsbazar", its body text "Cox's Bazar") and Khagrachari (the domain uses "Khagrachhari").
- **Checked:** 2026-09-26. The Mymensingh division portal was down (HTTP 503), so its districts come from the two national lists.

Sources:

- <https://dhakadiv.gov.bd/ajax/get/office-level/626a41e552093d4768e64b13/offices?office_type_id=6915c8c02d68425160fc40ef&loc_id=<division_id>&loc_type=loc_division_id>: Bangladesh National Portal (portal.gov.bd platform, served from dhakadiv.gov.bd) district-portal directory, queried once per division (8 calls). Returns each official district portal with English title (e.g. "Jashore District"), Bangla title and domain. Primary source for name_en, name_bn and division; 64 districts total.
- <https://dhakadiv.gov.bd/ajax/get/division/list>: National Portal geo API: 8 divisions with BBS codes and Mongo IDs (English titles still use old spellings Barisal/Chittagong).
- <https://dhakadiv.gov.bd/ajax/get/district/<division_id>/list>: National Portal geo API district list per division with BBS district codes: independently confirms the same 64 districts and the same division assignment (6/11/13/10/8/8/4/4). Uses older English spellings (Chittagong, Comilla, Jessore, Bogra, Barisal, Jhalokati, Kishoregonj, Maulvibazar, Netrakona, Chapai Nababganj).
- <https://dhakadiv.gov.bd/>: Dhaka Division portal menu lists the Deputy Commissioner offices of its 13 districts (Bangla).
- <https://khulnadiv.gov.bd/>: Khulna Division portal menu lists the Deputy Commissioner offices of its 10 districts (Bangla), incl. jashore.gov.bd.
- <https://chittagongdiv.gov.bd/>: English page title "Chattogram Division" (cookie lang=en).
- <https://barisaldiv.gov.bd/>: English page title "Barishal Division" (cookie lang=en).
- <https://coxsbazar.gov.bd/>: District portal: page title "Coxsbazar District", but body text also writes "Cox's Bazar".
- <https://khagrachhari.gov.bd/>: District portal: page title "Khagrachari District"; domain and some text use "Khagrachhari".
- <https://jhalakathi.gov.bd/>: District portal English title "Jhalakathi District".
- <https://netrokona.gov.bd/>: District portal English title "Netrokona District" (also checked moulvibazar, chapainawabganj, kishoreganj, munshiganj, lakshmipur, barishal portal titles; all match the directory).

## Universities (44)

22 public and 22 private, covering all 8 divisions. The full list with per-entry UGC source URLs is in [`supabase/data/universities.json`](../supabase/data/universities.json). Checked 2026-09-26.

- **Names** follow UGC spelling. **Bangla names** appear only where the university's own site shows them word for word (10 entries); the rest are empty rather than translated.
- **Rename:** Bangabandhu Sheikh Mujib Medical University is now **Bangladesh Medical University** (gazette of 16 April 2025).
- **Websites:** IUB, USTC and AIUB use websites that differ from UGC's listed ones (redirects, or dead domains), recorded as the working URL.

Sources:

- <http://ugc-universities.gov.bd/>: UGC 'List of Public Universities' (61 entries, footer (c) 2025-2026): confirms public status, current names, listed websites
- <http://www.ugc-universities.gov.bd/private-universities>: UGC 'List of Private Universities' (117 entries): confirms private status and websites
- <http://www.ugc-universities.gov.bd/university-detail/{id}>: UGC per-university detail pages: campus address used for city/division (id in each source_url)
- <https://www.tbsnews.net/bangladesh/health/gazette-published-renaming-bsmmu-bangladesh-medical-university-1117446>: BSMMU renamed Bangladesh Medical University by gazette, 16 April 2025
- <(each university's website, as in 'website')>: Homepage fetched 2026-09-26: HTTP status, <title>, verbatim Bangla name where present

## Calendar

National days and exam dates for 2026. Official = a government notification or education-board document. Secondary = a national newspaper report (used only for university admission dates, because the DU portal was down). The two "observed" Eid rows only confirm the gazette dates and are not seeded.

| Event                                                                       | Date(s)                            | Source type | Source                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shaheed Dibosh and International Mother Language Day                        | 2026-02-21                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Independence and National Day                                               | 2026-03-26                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Pohela Boishakh (Bangla New Year)                                           | 2026-04-14                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Victory Day                                                                 | 2026-12-16                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Eid-ul-Fitr                                                                 | 2026-03-21                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Eid-ul-Fitr (observed, moon-sighting decision)                              | 2026-03-21                         | secondary   | <https://www.thedailystar.net/news/bangladesh/news/bangladesh-celebrate-eid-ul-fitr-march-21-4132701>                                                                                                                                                                                                                                                                                                                                     |
| Eid-ul-Adha                                                                 | 2026-05-28                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Eid-ul-Adha (observed, moon-sighting decision)                              | 2026-05-28                         | secondary   | <https://www.thedailystar.net/news/bangladesh/news/zilhajj-moon-sighted-eid-ul-azha-bangladesh-may-28-4178621>                                                                                                                                                                                                                                                                                                                            |
| Buddha Purnima (Boishakhi Purnima)                                          | 2026-05-01                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Durga Puja (Bijoya Dashami)                                                 | 2026-10-21                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| Christmas Day                                                               | 2026-12-25                         | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mopa/2024/12/209c6283d9234a0fa8f1f30b90068b57.pdf>                                                                                                                                                                                                                                                                                         |
| SSC and equivalent examinations 2026 (written/theory, 9 general boards)     | 2026-04-21 to 2026-05-20           | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-shed/2026/3/0a90c5c0-0e0a-4db3-afaa-c65f612468df.pdf>                                                                                                                                                                                                                                                                                      |
| SSC 2026 practical examinations                                             | 2026-06-07 to 2026-06-14           | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-shed/2026/3/0a90c5c0-0e0a-4db3-afaa-c65f612468df.pdf>                                                                                                                                                                                                                                                                                      |
| HSC and equivalent examinations 2026 (written, general boards)              | 2026-07-02 to 2026-08-08           | official    | <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-shed/2026/5/911610b2-0545-4632-92c8-70110fa2c265.pdf>                                                                                                                                                                                                                                                                                      |
| HSC 2026 postponed papers, Chattogram board (flood make-up exams)           | 2026-08-20 to 2026-09-09           | official    | <https://web.bise-ctg.gov.bd/asset/uploads/notice/1785827682_ti.pdf>                                                                                                                                                                                                                                                                                                                                                                      |
| SSC 2027 test (pre-selection) examinations in schools, Dhaka board          | 2026-10-15 to 2026-11-15 (approx.) | official    | <https://dhakaeducationboard.gov.bd/data/20260901162431229155.pdf>                                                                                                                                                                                                                                                                                                                                                                        |
| University of Dhaka admission tests 2025-26 session                         | 2025-11-28 to 2025-12-27           | secondary   | <https://www.dhakatribune.com/bangladesh/education/393890/du-admission-tests-for-2025-26-to-begin-nov-28>                                                                                                                                                                                                                                                                                                                                 |
| University of Dhaka admission tests 2026-27 session                         | 2026-12-05 to 2026-12-26           | secondary   | <https://bangla.dhakatribune.com/education/106911/%E0%A6%A2%E0%A6%BE%E0%A6%95%E0%A6%BE-%E0%A6%AC%E0%A6%BF%E0%A6%B6%E0%A7%8D%E0%A6%AC%E0%A6%AC%E0%A6%BF%E0%A6%A6%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A7%9F%E0%A7%87-%E0%A6%AD%E0%A6%B0%E0%A7%8D%E0%A6%A4%E0%A6%BF%E0%A6%B0-%E0%A6%86%E0%A6%AC%E0%A7%87%E0%A6%A6%E0%A6%A8-%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81-%E0%A6%A8%E0%A6%AD%E0%A7%87%E0%A6%AE%E0%A7%8D%E0%A6%AC%E0%A6%B0%E0%A7%87> |
| Public university admission test season 2026-27 (DU, RU, JnU, CU, KU, MIST) | 2026-12-05 to 2027-02-08 (approx.) | secondary   | <https://www.channelionline.com/7-universities-including-du-announce-admission-test-dates/>                                                                                                                                                                                                                                                                                                                                               |

- **Moon sighting:** Eid dates depend on the moon. In 2026 the moon-sighting committee's decisions matched the gazette.
- **2027 holidays:** no official 2027 list exists yet (the 2026 list came out in November 2025). Check again in November 2026 before adding 2027 dates.
- **SSC and HSC 2027:** exam dates have **not** been announced.

## Resources and career facts

Deferred by the project owner (2026-09-26). The `resources` and `career_paths` tables exist but are **not seeded yet**, so no unverified links or career claims ship. To add them, put verified entries in `supabase/data/resources.json` and `supabase/data/careers.json`, then run `npm run db:seed:build`; the generator picks them up automatically.

---

## Unverified / to do

| Item                                               | Status                                                     |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Kaan Pete Roi number and hours                     | `TODO: VERIFY`. Not seeded. See above                      |
| 2027 public holidays                               | Official list not yet published (expected November 2026)   |
| SSC/HSC 2027 exam dates                            | Not announced yet                                          |
| University of Dhaka admission dates                | Secondary sources only (official portal down when checked) |
| Chattogram board HSC make-up notice of 18 Aug 2026 | Not read                                                   |
| Madrasah and technical board exam timetables       | Not checked                                                |
