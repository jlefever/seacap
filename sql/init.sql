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

CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES entities (id),
    repo_id INT REFERENCES repos (id) NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    UNIQUE (parent_id, repo_id, name, kind)
    -- TODO: Somehow ensure repo_id == parent.repo_id at the database-level
    -- TODO: Somehow ennsure parent_id is null iff kind = 'file'
);

CREATE TABLE changes (
    id SERIAL PRIMARY KEY,
    commit_id INT REFERENCES commits (id) NOT NULL,
    entity_id INT REFERENCES entities (id) NOT NULL,
    churn INT NOT NULL,
    UNIQUE (commit_id, entity_id)
    -- TODO: action (ex: Added, Modified, Deleted)
    -- TODO: Somehow ensure commit.repo_id == entity.repo_id at the database-level
);

-- CREATE TABLE change_details (
--     id SERIAL PRIMARY KEY,
--     change_id INT REFERENCES changes (id) NOT NULL,
--     note TEXT NOT NULL
-- );

CREATE TABLE deps (
    id SERIAL PRIMARY KEY,
    src_id INT REFERENCES entities (id) NOT NULL,
    dst_id INT REFERENCES entities (id) NOT NULL,
    kind TEXT NOT NULL,
    weight INT NOT NULL,
    UNIQUE (src_id, dst_id, kind),
    CHECK (weight > 0)
);

-- CREATE FUNCTION ancestory(entity_id INT) RETURNS SETOF entities AS
-- $$
-- WITH RECURSIVE ancestory AS (
-- 	SELECT id, parent_id, repo_id, name, kind
-- 	FROM entities WHERE id = entity_id
-- 	UNION ALL
-- 	SELECT P.id, P.parent_id, P.repo_id, P.name, P.kind
-- 	FROM ancestory C, entities P WHERE C.parent_id = P.id
-- )
-- SELECT id, parent_id, repo_id, name, kind FROM ancestorygetTagId
-- $$
-- LANGUAGE SQL;

CREATE FUNCTION filename(entity_id INT) RETURNS TEXT AS
$$
WITH RECURSIVE ancestory AS (
	SELECT id, parent_id, repo_id, name, kind
	FROM entities WHERE id = entity_id
	UNION ALL
	SELECT P.id, P.parent_id, P.repo_id, P.name, P.kind
	FROM ancestory C, entities P WHERE C.parent_id = P.id
)
SELECT name FROM ancestory
WHERE parent_id IS NULL
$$
LANGUAGE SQL;


-- CREATE TABLE change_sets (
--     id SERIAL PRIMARY KEY
-- );

-- CREATE TABLE change_set_members (
--     id SERIAL PRIMARY KEY,
--     set_id INT REFERENCES change_sets (id) NOT NULL,
--     change_id INT REFERENCES changes (id) NOT NULL,
--     UNIQUE (set_id, change_id)
-- );

-- CREATE TABLE dep_sets (
--     id SERIAL PRIMARY KEY
-- );

-- CREATE TABLE dep_set_members (
--     id SERIAL PRIMARY KEY,
--     set_id INT REFERENCES dep_sets (id) NOT NULL,
--     dep_id INT REFERENCES deps (id) NOT NULL,
--     UNIQUE (set_id, dep_id)
-- );

-- CREATE TABLE antipatterns (
--     id SERIAL PRIMARY KEY,
--     name TEXT NOT NULL,
--     center_id INT REFERENCES paths (id) NOT NULL,
--     dep_set_id INT REFERENCES dep_sets (id) NOT NULL,
--     change_set_id INT REFERENCES dep_sets (id) NOT NULL
-- );