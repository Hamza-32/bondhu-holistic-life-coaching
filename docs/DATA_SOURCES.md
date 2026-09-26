# Data sources

Every factual Bangladeshi data point in Bondhu (statistics, helplines, institutions, geography) is listed here with its source and the date it was checked. People are always fictional (mentors, community posts), and nothing here is a real person's data.

**Rules**

- Prefer primary sources: government `.gov.bd` portals, WHO, NIMH, and the organisation's own site.
- Quote figures exactly as the source states them.
- Anything that cannot be verified is marked `TODO: VERIFY` in code and listed under [Unverified](#unverified--to-do).
- Re-check helplines before each release, because numbers and hours change.

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

### 999: National Emergency Service

- **Facts:** 999 is an emergency call centre run by Bangladesh Police under the Ministry of Home Affairs. It covers emergency police, fire service and ambulance. It is toll-free and open 24 hours a day, 7 days a week. Launched 12 December 2017.
- **Sources:**
  - Bangladesh Police Telecom portal: <https://telecom-police.portal.gov.bd/pages/static-pages/695e3b0cc4774958d7b72321> (page last updated 1 Dec 2025)
  - Khulna district portal: <https://khulna.gov.bd/pages/static-pages/69811b0ca31054345f1de1f6>
- **Verbatim (Bangla):** "৯৯৯ জরুরি সেবা বাংলাদেশ পুলিশের অধীনে পরিচালিত একটি জরুরি কল সেন্টার। এখান থেকে জরুরি পুলিশ, জরুরি ফায়ার সার্ভিস ও জরুরি এ্যাম্বুলেন্স সেবা প্রদান করা হয়।" … "সপ্তাহে ৭ দিন ২৪ ঘন্টা চালু রয়েছে এ কল সেন্টার। ৯৯৯ একটি টোল ফ্রি নাম্বার।"
- **Checked:** 2026-09-26
- **Used in:** landing page Safety section (`tel:999`), footer disclaimer.
- **Note:** 999.gov.bd loads its content with JavaScript and had an expired TLS certificate when checked, so the police portal is used as the source.

### Kaan Pete Roi (emotional support): not yet used

- **Official page:** <https://kaanpeteroi.org/helpline-service/> states "+880 9612-119911 Everyday 3:00 PM to 3:00 AM (No Holidays)". Checked 2026-09-26.
- **Why it is not shown yet:** the bare domain `kaanpeteroi.org` currently redirects to an unrelated construction-company website, and third-party listings (Befrienders Worldwide) give different mobile numbers and hours. Treat this as unconfirmed until it has been re-checked, ideally with the organisation itself. See [Unverified](#unverified--to-do).

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

---

## Unverified / to do

| Item                                  | Status                                                                                                                 | Needed for        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Kaan Pete Roi number and hours        | `TODO: VERIFY`: official page found, but the domain redirect and conflicting listings need re-checking                 | Phase 3 helplines |
| 64 districts (English and Bangla)     | Not yet collected                                                                                                      | Phase 3           |
| Universities (UGC)                    | Not yet collected                                                                                                      | Phase 3           |
| 109, 1098, 333 and other helplines    | Not yet verified (1098 child helpline seen on a district portal hotline list, not yet confirmed from a primary source) | Phase 3           |
| Mental health organisations directory | Not yet collected                                                                                                      | Phase 3           |
