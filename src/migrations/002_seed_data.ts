import { PoolClient } from 'pg';

export const name = '002_seed_data';

export async function up(client: PoolClient): Promise<void> {
  // ── Categories ───────────────────────────────────────────────
  await client.query(`
    INSERT INTO categories (id, name, name_km, slug) VALUES
    (1, 'Read the Tripitaka', 'អានព្រះត្រៃបិដក', 'read-tripitaka'),
    (2, 'Festival',           'ពិធីបុណ្យ',        'festival'),
    (3, 'Ceremony',           'ពិធីការ',           'ceremony'),
    (4, 'Charity',            'សប្បុរសធម៌',        'charity'),
    (5, 'Dharma',             'ព្រះធម៌',           'dharma')
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))`);

  // ── Authors ──────────────────────────────────────────────────
  await client.query(`
    INSERT INTO authors (id, name, name_km, img_url, bio, bio_km, email) VALUES
    (1, 'Wat Phnom Penh Tmei', 'វត្តភ្នំពេញថ្មី',
        '/assets/authors/temple.jpg',
        'Official account of Wat Phnom Penh Tmei temple.',
        'គណនីផ្លូវការ នៃវត្តភ្នំពេញថ្មី',
        'namyou854@gmail.com'),
    (2, 'Khy ChhaiYa', 'សាមណេរ ឃី ឆៃយ៉ា',
        '/assets/monks/khy-chhaiya.jpg',
        'Samner Khy Chaiya is studying at the National Technical Training Institute, majoring in civil engineering.',
        'សាមណេរ ឃី ឆៃយ៉ា កំពុងសិក្សានៅ National Technical Training Institute មុខជំនាញ សំណង់ស៊ីវិល',
        NULL)
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors))`);

  // ── Monks ────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO monks (id, name, name_km, title, title_km, img_url, join_year, left_year, bio, bio_km) VALUES
    (1,  'Master You YiHak',    'ព្រះអង្គគ្រូសាសនវង្ស យូ យីហាក់',  'CEO',     'ប្រធានសង្ឃ', '/assets/monks/yu-yihak.jpg',      2017, NULL,
        'Chief Buddhist Monk and spiritual leader of Wat Phnom Penh Tmei',
        'ប្រធានសង្ឃ និងជាអ្នកដឹកនាំខាងសាសនា នៃវត្តភ្នំពេញថ្មី'),
    (2,  'Tol SokMean',         'តុល សុខមាន',                        'Bhikkhu', 'ភិក្ខុ', '/assets/monks/tol-sokmean.jpg',    2019, NULL,
        'Bhikku Tol SokMean is the temple planner and is responsible for the temple construction project.',
        'ភិក្ខុ តុល សុខមាន ជាអ្នកគូសប្លង់វត្ត និងជាអ្នកទទួលខុសត្រូវលើគម្រោងកសាងសង់វត្ត'),
    (3,  'Von Bunny',           'ភិក្ខុ វ៉ុន ប៊ុន្នី',              'Bhikkhu', 'ភិក្ខុ', '/assets/monks/von-bunny.jpg',      2021, NULL,
        'Bhikku Von Bunny is the head monk responsible for temple operations',
        'ភិក្ខុ​ វ៉ុន ប៊ុន្ន ជាអ្នកដឹកនាំការងារនៅក្នុងវត្តទាំងមូល'),
    (4,  'Phai Phally',         'ភិក្ខុ ផៃ ផល្លី',                  'Bhikkhu', 'ភិក្ខុ', '/assets/monks/phai-phally.jpg',    2018, 2019, '', ''),
    (5,  'Yan Bunthoeun',       'សាមណេរ យ៉ាន់ ប៊ុនធឿន',            'Samner',  'សាមណេរ', '/assets/monks/yan-bunthoeun.jpg',  2020, 2025, '', ''),
    (6,  'Phal Phai',           'ភិក្ខុ ផល​ ផៃ',                    'Bhikkhu', 'ភិក្ខុ', '/assets/monks/phal-phai.jpg',      2021, 2025,
        'Bhikku Phal Phai studying at Build Bright University, majoring in Information and Technology (IT).',
        'ភិក្ខុ ផល ផៃ បានបញ្ចប់ការសិក្សានៅសកលវិទ្យាល័យបៀលប្រាយ មុខជំនាញ ព័ត៌មាននិង បច្ចេកវិទ្យា(អាយធី) ។'),
    (7,  'Art Sengorn',         'ភិក្ខុ អាត សេងអ៊ាន់',              'Bhikkhu', 'ភិក្ខុ', '/assets/monks/art-sengorn.jpg',    2022, 2025,
        'Bhikku Art Sengorn studying Electrical Engineering at National Technical Training Institute.',
        'ភិក្ខុ អាត សេងអ៊ាន់ កំពុងសិក្សានៅមុខជំនាញ អគ្គីសនីនៅ National Technical Training Institute ។'),
    (8,  'Sok Leng',            'ភិក្ខុ សុខ ឡេង',                   'Bhikkhu', 'ភិក្ខុ', '/assets/monks/sok-leng.jpg',       2022, NULL,
        'Bhikku Sok Leng studying at Build Bright University, majoring in Information and Technology (IT)',
        'ភិក្ខុ សុខ ឡេង កំពុងសិក្សានៅសកលវិទ្យាល័យ បៀលប្រាយ មុខជំនាញ ព័ត៌មាននិង បច្ចេកវិទ្យា(អាយធី)'),
    (9,  'Pheng ChhunmengTong', 'ភិក្ខុ ផេង ឈុនម៉េងតុង',           'Bhikkhu', 'ភិក្ខុ', '/assets/monks/pheng-mengtong.jpg', 2024, NULL,
        'Bhikku Pheng ChunmengTong studying at Build Bright University, majoring in Information and Technology (IT)',
        'ភិក្ខុ ផេង ឈុនម៉េងតុង កំពុងសិក្សានៅសកលវិទ្យាល័យ បៀលប្រាយ មុខជំនាញ ការផ្សព្វផ្សាយ (IT)'),
    (10, 'Den San',             'ភិក្ខុ ដែន សាន',                    'Bhikkhu', 'ភិក្ខុ', '/assets/monks/den-san.jpg',        2023, NULL,
        'Bhikku Den San studying at Build Bright University, majoring in Information and Technology (IT)',
        'ភិក្ខុ ដែន សាន់ កំពុងសិក្សានៅសកលវិទ្យាល័យ បៀលប្រាយ មុខជំនាញ ការផ្សព្វផ្សាយ (IT)'),
    (11, 'Nam You',             'សាមណេរ ណាំ យ៉ូ',                   'Samner',  'សាមណេរ', '/assets/monks/nam-you.jpg',        2023, NULL,
        'Samner Nam You studying at Build Bright University, majoring in Information and Technology (IT)',
        'សាមណេរ ណាំ យ៉ូ កំពុងសិក្សានៅសកលវិទ្យាល័យ បៀលប្រាយ មុខជំនាញ ព័ត៌មាននិង បច្ចេកវិទ្យា(អាយធី)'),
    (12, 'Khy ChhaiYa',        'សាមណេរ ឃី ឆៃយ៉ា',                 'Samner',  'សាមណេរ', '/assets/monks/khy-chhaiya.jpg',    2023, NULL,
        'Samner Khy Chaiya is studying at the National Technical Training Institute, majoring in civil engineering.',
        'សាមណេរ ឃី ឆៃយ៉ា កំពុងសិក្សានៅ National Technical Training Institute មុខជំនាញ សំណង់ស៊ីវិល'),
    (13, 'Hong SeangMey',       'សាមណេរ ហុង សៀងមុី',                'Samner',  'សាមណេរ', '/assets/monks/hong-seangmey.jpg',  2026, NULL, '', ''),
    (14, 'Lee Manut',           'សាមណេរ លី ម៉ានុត',                 'Samner',  'សាមណេរ', '/assets/monks/lee-manut.jpg',      2025, NULL, '', '')
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('monks_id_seq', (SELECT MAX(id) FROM monks))`);

  // ── Activities ───────────────────────────────────────────────
  await client.query(`
    INSERT INTO activities (id, category_id, title, title_km, description, description_km, img_url, video_url, event_year) VALUES
    (1, 2, 'Kathena Festival',
        'កឋិនទាន',
        'Please accept the Angkathana Maha Samaki Festival at Wat Phnom Thmey. Sunday, October 12, 2025.',
        'សូមអនុមោទនា ពិធីបុណ្យអង្គកឋិនទានមហាសាមគ្គី វត្តភ្នំពេញថ្មី ថ្ងៃអាទិត្យ ៥រោច ខែអស្សុជ ឆ្នាំម្សាញ់ សប្តស័ក ពុទ្ធសករាជ ២៥៦៩ ត្រូវនឹងថ្ងៃទី១២ ខែតុលា ឆ្នាំ២០២៥ ។',
        '/assets/activities/kathina-main.jpg', NULL, 2025),
    (2, 3, 'Blessing ceremony and spreading kindness',
        'ពិធីក្រង់ពិលី និងផ្សាយមេត្តាធម៌',
        'Sunday, 5th of the month of Ashoka, Buddhist Era 2569, corresponding to October 12, 2025.',
        'ថ្ងៃអាទិត្យ ៥រោច ខែអស្សុជ ឆ្នាំម្សាញ់ សប្តស័ក ពុទ្ធសករាជ ២៥៦៩ ត្រូវនឹងថ្ងៃទី១២ ខែតុលា ឆ្នាំ២០២៥ ។',
        '/assets/activities/mahabali-main.jpg', 'https://www.facebook.com/share/v/17SAmw2aMU/', 2025),
    (3, 2, 'Visak Bochea Festival',
        'ពិធី​បុណ្យ​វិសាខ​បូជា',
        'Sunday, May 11, 2025. Lunar: 15 Koeut, month of Vesak, Buddhist era 2568.',
        'ថ្ងៃអាទិត្យ ១៥កើត ខែពិសាខ ឆ្នាំម្សាញ់ សប្តស័ក ពុទ្ធសករាជ ២៥៦៨ ត្រូវនឹងថ្ងៃទី១១ ខែឧសភា ឆ្នាំ២០២៥ ។',
        '/assets/activities/visak-bochea-main.jpg', 'https://www.facebook.com/share/v/17SAmw2aMU/', 2025),
    (4, 2, 'Meak Bochea Festival',
        'បុណ្យមាឃ បូជា',
        'Wednesday, February 12, 2025. Lunar: 15 Koeut, month of Meak, Buddhist era 2568.',
        'ថ្ងៃពុធ ១៥កើត ខែមាឃ ឆ្នាំរោង ឆស័ក ពុទ្ធសករាជ ២៥៦៨ ត្រូវនឹងថ្ងៃទី១២ ខែកុម្ភៈ ឆ្នាំ២០២៥ ។',
        '/assets/activities/meak-bochea-main.jpg', 'https://www.facebook.com/share/v/17SAmw2aMU/', 2025),
    (5, 4, 'Charity',
        'សប្បុរសធម៌',
        'The best charity is to keep the mind pure. 150 alms for grandparents. Friday, April 24, 2026.',
        'ធ្វើទានដែលប្រសើរបំផុត គឺរក្សាចិត្តឲ្យស្អាតបរិសុទ្ធ ទេយ្យទានសម្រាប់តា យាយ ចំនួន១៥០ ថ្ងៃសុក្រ ៨កើត ខែពិសាខ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៦៩ ។',
        '/assets/activities/charity-main.jpg', 'https://www.facebook.com/reel/950014307651801', 2026),
    (6, 3, 'Buddha image ceremony',
        'ពិធីសិតនូវព្រះពុទ្ធរូប',
        'Ceremony of installing the Buddha image made of metal, Wat Phnom Thmei. Sunday, December 15, 2024.',
        'ពិធីសិតនូវព្រះពុទ្ធរូប សាងឡើងអំពីរលោហៈ វត្តភ្នំពេញថ្មី ថ្ងៃអាទិត្យ ១៥កើត ពេញបូណ៌មី ខែមិគសិរ ព.ស.២៥៦៨ ។',
        '/assets/activities/almsbowl-meakbochea-main.jpg', NULL, 2024),
    (7, 2, 'Kathena Festival 2024',
        'កឋិនទាន ២០២៤',
        'Please accept the Angkathana Maha Samaki Festival at Wat Phnom Thmey, 2024.',
        'សូមអនុមោទនា ពិធីបុណ្យអង្គកឋិនទានមហាសាមគ្គី វត្តភ្នំពេញថ្មី ២០២៤ ។',
        '/assets/activities/kathen24-main.jpg', NULL, 2024),
    (8, 2, 'Samak Silver Flower Festival',
        'បុណ្យផ្កាប្រាក់សាមគ្គី',
        'Please accept the Samak Silver Flower Festival at Wat Phnom Thmey, 2025.',
        'សូមអនុមោទនា ពិធីបុណ្យផ្កាប្រាក់សាមគ្គី វត្តភ្នំពេញថ្មី ២០២៥ ។',
        '/assets/activities/samak-silver-flower-main.jpg', NULL, 2025)
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('activities_id_seq', (SELECT MAX(id) FROM activities))`);

  // ── Articles ─────────────────────────────────────────────────
  await client.query(`
    INSERT INTO articles
        (id, category_id, author_id, title, title_km, excerpt, excerpt_km,
         content, content_km, img_url, video_url, published_date, read_time, read_time_km)
    VALUES
    (1, 1, 2,
        '',
        'វេរញ្ជកណ្ឌ ភាគទី ១',
        'Please enjoy the Preah Tri Pitak study program (every day of the week). Broadcast from Wat Phnom Thmey, reading by Samner Khy Chaiya (Video Part 2). January 18, 2026.',
        'សូមអនុមោទនា កម្មវិធីសិក្សាព្រះត្រៃបិដក (រៀងរាល់ថ្ងៃសីល) ផ្សាយចេញពីវត្តភ្នំពេញថ្មី ការអានដោយ៖ សាមណេរ ឃី ឆៃយ៉ា (វីដេអូភាគ០២) ថ្ងៃទី១៨ ខែមករា ឆ្នាំ២០២៦',
        '', '',
        '/assets/articles/chhaiya.jpg',
        'https://www.youtube.com/embed/gb1maap0k7g',
        '2025-12-15', '5 min read', 'អាន ៥ នាទី')
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles))`);

  // ── Temple History ───────────────────────────────────────────
  await client.query(`
    INSERT INTO temple_history (id, history_year, title_en, title_km, description_en, description_km, sort_order) VALUES
    (1, 2017, 'Foundation', 'ការចាប់ផ្តើមកសាងវត្តភ្នំពេញថ្មី',
        'Monk Vong You Yihak Sovannsarro was appointed to reside at the Buddhist Monastery on Friday, May 5, 2017.',
        'ព្រះចៅអធិការ បានចាត់តាំង ព្រះគ្រូសាសនាវង្ស យូ យីហាក់ ឲ្យមកគង់នៅ នាថ្ងៃ សុក្រ ១០កើត ខែពិសាខ ព.ស ២៥៦០ ត្រូវនឹង ថ្ងៃទី០៥ ខែ ឧសភា ឆ្នាំ២០១៧។',
        1),
    (2, 2018, 'Growth', 'ការលូតលាស់',
        'Appointed Preah Sasanvong Yu Yihak as the head monk of the New Phnom Penh Buddhist School, August 3, 2018.',
        'ប្រការ១ : ត្រូវបានតែងតាំង ព្រះគ្រូសាសនវង្ស យូ យីហាក់ ជាប្រធានសង្ឃ ថ្ងៃទី ០៣ ខែ សីហា ឆ្នាំ២០១៨ ហត្ថលេខាដោយ សម្ដេចព្រះសាក្យមុនី រ័ត្ន សារឿន',
        2),
    (3, 2019, 'First shelter', 'ការសង់ស្ថានីយ៍ដំបូង',
        'Two monks and their relatives built a hut made of iron and cement, with two rooms and one bathroom, for the monks to temporarily stay in.',
        'ព្រះសង្ឃ២អង្គ និងញាតិញោមមានការកសាងកុដិ ធ្វើអំពីដែក និងស៊ីម៉ង ដែលមាន បន្ទប់២ និងបន្ទប់ទឹក១ សម្រាប់ព្រះសង្ឃគង់ស្នាក់នៅបណ្តោះអាសន្ន។',
        3),
    (4, 2020, 'New building construction', 'ការសាងសង់អាគារថ្មី',
        'New building: 6.5m wide, 27m long, 5m high. Includes common area, 1 living room, 3 bathrooms, 1 kitchen.',
        'ចាំផ្តើមគម្រោងកសាងអាគារ ទទឹង៦ម៉ែត្រកន្លះ បណ្ដោយ ២៧ម៉ែត្រ កម្ពស់៥ម៉ែត្រ ដែលមានមុខងារ លំហបើប្រាស់រួម បន្ទប់ស្នាក់នៅ១ បន្ទប់ទឹក៣ ចង្ក្រានបាយ១ ។',
        4),
    (5, 2022, '2022 – 2025 Expansion', 'ការពង្រីក ២០២២ – ២០២៥',
        'Continue building interconnected buildings: 10m wide, 15.6m long, 2 stories. Supports 12 monks and 12 students.',
        'បន្តការកសាងអាគារភ្ជាប់គ្នា ទទឹង១០ម៉ែត្រ បណ្តោយ ១៥ម៉ែត្រ៦តឹក កម្ពស់២ជាន់ ដែលបច្ចុប្បន្ន អាចទ្រទ្រង់ព្រះសង្ឃ១២អង្គ និងនិស្សិត១២នាក់។',
        5)
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('temple_history_id_seq', (SELECT MAX(id) FROM temple_history))`);

  // ── Header Navigation ────────────────────────────────────────
  await client.query(`
    INSERT INTO header_nav (id, label, label_km, path, sort_order, is_active) VALUES
    (1, 'Home',       'ទំព័រដើម',                                        '/',           1, TRUE),
    (2, 'About',      'អំពីយើង',                                          '/about',      2, TRUE),
    (3, 'Structure',  'ចំនួនព្រះសង្ឃដែលគង់នៅ វត្តភ្នំពេញថ្មី',           '/structure',  3, TRUE),
    (4, 'Activities', 'សកម្មភាពនានា',                                     '/activities', 4, TRUE),
    (5, 'Dharma',     'ស្តាប់ព្រះធម៌',                                    '/dharma',     5, TRUE),
    (6, 'Article',    'អត្ថបទ',                                            '/article',    6, TRUE),
    (7, 'Purpose',    'គោលបំណង',                                          '/purpose',    7, TRUE),
    (8, 'Founder',    'អ្នកដឹកនាំកសាង',                                   '/founder',    8, TRUE),
    (9, 'Contact',    'ទាក់ទងយើង',                                        '/contact',    9, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('header_nav_id_seq', (SELECT MAX(id) FROM header_nav))`);

  // ── Footer Sections ──────────────────────────────────────────
  await client.query(`
    INSERT INTO footer_sections (id, title, title_km, sort_order) VALUES
    (1, 'About',        'អំពីវត្ត',        1),
    (2, 'Quick Links',  'តំណភ្ជាប់រហ័ស',  2),
    (3, 'Social Media', 'បណ្តាញសង្គម',     3),
    (4, 'Contact',      'ទំនាក់ទំនង',       4)
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.query(`SELECT setval('footer_sections_id_seq', (SELECT MAX(id) FROM footer_sections))`);

  // ── Footer Links ─────────────────────────────────────────────
  await client.query(`
    INSERT INTO footer_links (section_id, label, label_km, url, icon, sort_order) VALUES
    (1, 'Wat Phnom Penh Tmei is a Buddhist monastery in Sen Sok, Phnom Penh. Founded in 2017.',
        'វត្តភ្នំពេញថ្មីជាវត្តព្រះពុទ្ធសាសនា ស្ថិតនៅខណ្ឌសែនសុខ រាជធានីភ្នំពេញ បង្កើតឡើងក្នុងឆ្នាំ២០១៧។',
        '#', NULL, 1),
    (2, 'Home',       'ទំព័រដើម',    '/',           NULL, 1),
    (2, 'About',      'អំពីយើង',     '/about',      NULL, 2),
    (2, 'Activities', 'សកម្មភាព',    '/activities', NULL, 3),
    (2, 'Article',    'អត្ថបទ',       '/article',    NULL, 4),
    (2, 'Dharma',     'ព្រះធម៌',      '/dharma',     NULL, 5),
    (2, 'Contact',    'ទាក់ទងយើង',   '/contact',    NULL, 6),
    (3, 'Facebook', 'ហ្វេសប៊ុក', 'https://www.facebook.com/watphnompehntmei',  'facebook', 1),
    (3, 'YouTube',  'យូធូប',      'https://www.youtube.com/@watphnompehntmei', 'youtube',  2),
    (3, 'TikTok',   'ទិចថក',      'https://www.tiktok.com/@watphnompehntmei',  'tiktok',   3),
    (4, 'Str 1982, Phnom Penh Tmei, Sen Sok, Phnom Penh', 'ផ្លូវ ១៩៨២ ភ្នំពេញថ្មី ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ', '#',                          'map-pin', 1),
    (4, '+855 96 456 3693',                                '+855 96 456 3693',                                       'tel:+85596456369',           'phone',   2),
    (4, 'namyou854@gmail.com',                             'namyou854@gmail.com',                                    'mailto:namyou854@gmail.com', 'mail',    3);
  `);

  // ── Contact Info ─────────────────────────────────────────────
  await client.query(`
    INSERT INTO contact_info (info_key, value_en, value_km) VALUES
    ('address',        'Str 1982, Phnom Penh Tmei, Sen Sok, Phnom Penh, Cambodia', 'ផ្លូវ ១៩៨២ ភ្នំពេញថ្មី ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ'),
    ('phone',          '096 4563 693',                                               '096 4563 693'),
    ('email',          'namyou854@gmail.com',                                        'namyou854@gmail.com'),
    ('bank_name',      'ABA Bank',                                                   'ធនាគារ ABA'),
    ('account_name',   'Wat Phnom Penh Tmei',                                        'វត្តភ្នំពេញថ្មី'),
    ('account_number', '000 123 456 789',                                            '000 123 456 789'),
    ('facebook_url',   'https://www.facebook.com/watphnompehntmei',                  'https://www.facebook.com/watphnompehntmei'),
    ('youtube_url',    'https://www.youtube.com/@watphnompehntmei',                  'https://www.youtube.com/@watphnompehntmei')
    ON CONFLICT (info_key) DO NOTHING;
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query(`DELETE FROM contact_info;`);
  await client.query(`DELETE FROM footer_links;`);
  await client.query(`DELETE FROM footer_sections;`);
  await client.query(`DELETE FROM header_nav;`);
  await client.query(`DELETE FROM temple_history;`);
  await client.query(`DELETE FROM articles;`);
  await client.query(`DELETE FROM activity_photos;`);
  await client.query(`DELETE FROM activities;`);
  await client.query(`DELETE FROM monks;`);
  await client.query(`DELETE FROM authors;`);
  await client.query(`DELETE FROM categories;`);
}
