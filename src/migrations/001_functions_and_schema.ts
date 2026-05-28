import { PoolClient } from 'pg';

export const name = '001_functions_and_schema';

export async function up(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION attach_updated_at(tbl TEXT)
    RETURNS VOID AS $$
    BEGIN
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
            tbl, tbl
        );
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL          PRIMARY KEY,
        name        VARCHAR(150)    NOT NULL,
        name_km     VARCHAR(255)    NOT NULL,
        slug        VARCHAR(150)    NOT NULL UNIQUE,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('categories')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS authors (
        id          SERIAL          PRIMARY KEY,
        name        VARCHAR(150)    NOT NULL,
        name_km     VARCHAR(255)    NOT NULL,
        img_url     VARCHAR(500)    DEFAULT NULL,
        bio         TEXT            DEFAULT NULL,
        bio_km      TEXT            DEFAULT NULL,
        email       VARCHAR(255)    DEFAULT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('authors')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS monks (
        id          SERIAL          PRIMARY KEY,
        name        VARCHAR(150)    NOT NULL,
        name_km     VARCHAR(255)    NOT NULL,
        title       VARCHAR(100)    NOT NULL,
        title_km    VARCHAR(255)    NOT NULL,
        img_url     VARCHAR(500)    DEFAULT NULL,
        join_year   SMALLINT        NOT NULL,
        left_year   SMALLINT        DEFAULT NULL,
        bio         TEXT            DEFAULT NULL,
        bio_km      TEXT            DEFAULT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('monks')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS activities (
        id              SERIAL          PRIMARY KEY,
        category_id     INTEGER         REFERENCES categories (id) ON DELETE SET NULL,
        title           VARCHAR(255)    NOT NULL,
        title_km        VARCHAR(500)    NOT NULL,
        description     TEXT            DEFAULT NULL,
        description_km  TEXT            DEFAULT NULL,
        img_url         VARCHAR(500)    DEFAULT NULL,
        video_url       VARCHAR(500)    DEFAULT NULL,
        event_year      SMALLINT        NOT NULL,
        created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('activities')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS activity_photos (
        id          SERIAL          PRIMARY KEY,
        activity_id INTEGER         NOT NULL REFERENCES activities (id) ON DELETE CASCADE,
        img_url     VARCHAR(500)    NOT NULL,
        sort_order  SMALLINT        NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS articles (
        id              SERIAL          PRIMARY KEY,
        category_id     INTEGER         REFERENCES categories (id) ON DELETE SET NULL,
        author_id       INTEGER         REFERENCES authors (id) ON DELETE SET NULL,
        title           VARCHAR(255)    DEFAULT NULL,
        title_km        VARCHAR(500)    NOT NULL,
        excerpt         TEXT            DEFAULT NULL,
        excerpt_km      TEXT            DEFAULT NULL,
        content         TEXT            DEFAULT NULL,
        content_km      TEXT            DEFAULT NULL,
        img_url         VARCHAR(500)    DEFAULT NULL,
        video_url       VARCHAR(500)    DEFAULT NULL,
        published_date  DATE            DEFAULT NULL,
        read_time       VARCHAR(50)     DEFAULT NULL,
        read_time_km    VARCHAR(100)    DEFAULT NULL,
        created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('articles')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS temple_history (
        id              SERIAL          PRIMARY KEY,
        history_year    SMALLINT        NOT NULL,
        title_en        VARCHAR(255)    DEFAULT NULL,
        title_km        VARCHAR(500)    DEFAULT NULL,
        description_en  TEXT            DEFAULT NULL,
        description_km  TEXT            DEFAULT NULL,
        sort_order      SMALLINT        NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('temple_history')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS header_nav (
        id          SERIAL          PRIMARY KEY,
        label       VARCHAR(100)    NOT NULL,
        label_km    VARCHAR(200)    NOT NULL,
        path        VARCHAR(255)    NOT NULL,
        sort_order  SMALLINT        NOT NULL DEFAULT 0,
        is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('header_nav')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS footer_sections (
        id          SERIAL          PRIMARY KEY,
        title       VARCHAR(150)    NOT NULL,
        title_km    VARCHAR(255)    NOT NULL,
        sort_order  SMALLINT        NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('footer_sections')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS footer_links (
        id          SERIAL          PRIMARY KEY,
        section_id  INTEGER         NOT NULL REFERENCES footer_sections (id) ON DELETE CASCADE,
        label       VARCHAR(255)    NOT NULL,
        label_km    VARCHAR(500)    NOT NULL,
        url         VARCHAR(500)    NOT NULL,
        icon        VARCHAR(100)    DEFAULT NULL,
        sort_order  SMALLINT        NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('footer_links')`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS contact_info (
        id          SERIAL          PRIMARY KEY,
        info_key    VARCHAR(100)    NOT NULL UNIQUE,
        value_en    VARCHAR(500)    DEFAULT NULL,
        value_km    VARCHAR(500)    DEFAULT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`SELECT attach_updated_at('contact_info')`);

  // ── Views ────────────────────────────────────────────────────
  await client.query(`
    CREATE OR REPLACE VIEW v_active_monks AS
    SELECT id, name, name_km, title, title_km, img_url, join_year, bio, bio_km
    FROM monks
    WHERE left_year IS NULL
    ORDER BY join_year ASC;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_articles AS
    SELECT
        a.id,
        a.title,
        a.title_km,
        a.excerpt,
        a.excerpt_km,
        a.img_url,
        a.video_url,
        a.published_date,
        a.read_time,
        a.read_time_km,
        c.name        AS category,
        c.name_km     AS category_km,
        c.slug        AS category_slug,
        au.name       AS author,
        au.name_km    AS author_km,
        au.img_url    AS author_img_url
    FROM articles a
    LEFT JOIN categories c  ON c.id  = a.category_id
    LEFT JOIN authors    au ON au.id = a.author_id
    ORDER BY a.published_date DESC NULLS LAST;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_activities AS
    SELECT
        ac.id,
        ac.title,
        ac.title_km,
        ac.description,
        ac.description_km,
        ac.img_url,
        ac.video_url,
        ac.event_year,
        c.name      AS category,
        c.name_km   AS category_km,
        c.slug      AS category_slug
    FROM activities ac
    LEFT JOIN categories c ON c.id = ac.category_id
    ORDER BY ac.event_year DESC, ac.id DESC;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_footer AS
    SELECT
        fs.id         AS section_id,
        fs.title      AS section_title,
        fs.title_km   AS section_title_km,
        fs.sort_order AS section_order,
        fl.id         AS link_id,
        fl.label,
        fl.label_km,
        fl.url,
        fl.icon,
        fl.sort_order AS link_order
    FROM footer_sections fs
    LEFT JOIN footer_links fl ON fl.section_id = fs.id
    ORDER BY fs.sort_order, fl.sort_order;
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query(`DROP VIEW IF EXISTS v_footer;`);
  await client.query(`DROP VIEW IF EXISTS v_activities;`);
  await client.query(`DROP VIEW IF EXISTS v_articles;`);
  await client.query(`DROP VIEW IF EXISTS v_active_monks;`);
  await client.query(`DROP TABLE IF EXISTS contact_info CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS footer_links CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS footer_sections CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS header_nav CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS temple_history CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS articles CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS activity_photos CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS activities CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS monks CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS authors CASCADE;`);
  await client.query(`DROP TABLE IF EXISTS categories CASCADE;`);
  await client.query(`DROP FUNCTION IF EXISTS attach_updated_at CASCADE;`);
  await client.query(`DROP FUNCTION IF EXISTS set_updated_at CASCADE;`);
}
