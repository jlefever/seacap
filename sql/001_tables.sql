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

CREATE TABLE change_details (
    id SERIAL PRIMARY KEY,
    change_id INT REFERENCES changes (id) NOT NULL,
    note TEXT NOT NULL
);

CREATE TABLE deps (
    id SERIAL PRIMARY KEY,
    source_id INT REFERENCES entities (id) NOT NULL,
    target_id INT REFERENCES entities (id) NOT NULL,
    kind TEXT NOT NULL,
    weight INT NOT NULL,
    UNIQUE (source_id, target_id, kind),
    CHECK (weight > 0)
);



-- CREATE MATERIALIZED VIEW uifs
-- SELECT CD1.src
-- FROM fl_cdeps CD1
-- WHERE CD1.dep_count > 0
-- GROUP BY CD1.src
-- HAVING COUNT(*) >= 2 -- [struct_impact]
-- INTERSECT
-- SELECT CD2.src
-- FROM fl_cdeps CD2
-- WHERE CD2.dep_count > 0 AND CD2.cochange >= 2 -- [min_cochange]
-- GROUP BY CD2.src
-- HAVING COUNT(*) >= 2; -- [hist_impact]