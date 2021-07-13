CREATE TABLE repos (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    git_url TEXT UNIQUE NOT NULL
);

CREATE TABLE commits (
    id SERIAL PRIMARY KEY,
    repo_id INT REFERENCES repos (id) NOT NULL,
    sha1 CHAR(40) NOT NULL
);

CREATE TABLE paths (
    id SERIAL PRIMARY KEY,
    repo_id INT REFERENCES repos (id) NOT NULL,
    name TEXT NOT NULL,
    UNIQUE (repo_id, name)
);

CREATE TABLE langs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE tag_kinds (
    id SERIAL PRIMARY KEY,
    lang_id INT REFERENCES langs (id) NOT NULL,
    letter CHAR(1) NOT NULL,
    name TEXT NOT NULL,
    detail TEXT NOT NULL
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    path_id INT REFERENCES paths (id) NOT NULL,
    parent_id INT REFERENCES tags (id),
    kind_id INT REFERENCES tag_kinds (id) NOT NULL,
    name TEXT NOT NULL,
    UNIQUE (path_id, parent_id, kind_id, name)
    -- TODO: Somehow ensure path_id == parent.path_id at the database-level
);

CREATE TABLE changes (
    id SERIAL PRIMARY KEY,
    commit_id INT REFERENCES commits (id) NOT NULL,
    tag_id INT REFERENCES tags (id) NOT NULL,
    churn INT NOT NULL,
    UNIQUE (commit_id, tag_id)
    -- TODO: action (ex: Added, Modified, Deleted)
    -- TODO: Somehow ensure commit.repo_id == tag.path.repo_id at the database-level
);

CREATE TABLE dep_kinds (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE deps (
    id SERIAL PRIMARY KEY,
    src_id INT REFERENCES tags (id) NOT NULL,
    dst_id INT REFERENCES tags (id) NOT NULL,
    kind_id INT REFERENCES dep_kinds (id) NOT NULL,
    weight INT NOT NULL
);

-- CREATE TYPE nested_tag AS (
--     path_id INT NOT NULL,
--     kind_id INT NOT NULL,
--     name TEXT NOT NULL,
--     children JSON NOT NULL
-- );

-- CREATE PROCEDURE add_path(my_repo_id INT, my_name TEXT)
-- LANGUAGE SQL
-- AS $$
-- INSERT INTO paths (repo_id, name)
-- VALUES (my_repo_id, my_name)
-- ON CONFLICT (repo_id, name) DO UPDATE

-- INSERT INTO otp.routes (otp_id, name, short_name, mode, color)
-- SELECT
--     id AS otp_id,
--     "longName" AS name,
--     "shortName" AS short_name,
--     mode,
--     color
-- FROM json_populate_recordset(null::otp.api_route_short, otp_data);
-- $$;



-- CREATE TYPE otp.api_route_short AS (
--     id TEXT,
--     "longName" TEXT,
--     "shortName" TEXT,
--     mode TEXT,
--     color TEXT
-- );

-- CREATE PROCEDURE otp.load_routes(otp_data json)
-- LANGUAGE SQL
-- AS $$
-- INSERT INTO otp.routes (otp_id, name, short_name, mode, color)
-- SELECT
--     id AS otp_id,
--     "longName" AS name,
--     "shortName" AS short_name,
--     mode,
--     color
-- FROM json_populate_recordset(null::otp.api_route_short, otp_data);
-- $$;