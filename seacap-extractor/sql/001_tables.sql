CREATE TABLE repos (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    git_url TEXT UNIQUE NOT NULL,
    github_url TEXT UNIQUE NOT NULL,
    lead_ref TEXT UNIQUE NOT NULL
);

CREATE TABLE commits (
    id SERIAL PRIMARY KEY,
    repo_id INT REFERENCES repos (id) NOT NULL,
    sha1 CHAR(40) NOT NULL
);

CREATE TYPE lineno_range AS (a INT, b INT);

CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES entities (id),
    repo_id INT REFERENCES repos (id) NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    linenos lineno_range,
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

CREATE FUNCTION insert_file(in_filename TEXT, in_repo_id INT) RETURNS INT AS
$$
DECLARE
	entity_id INT;
BEGIN
	SELECT id INTO entity_id FROM entities E
	WHERE
		E.parent_id IS NULL AND
		E.name = in_filename AND
		E.kind = 'file' AND
		E.repo_id = in_repo_id;
	IF NOT FOUND THEN
		INSERT INTO entities (repo_id, name, kind)
		VALUES (in_repo_id, in_filename, 'file')
		RETURNING id INTO entity_id;
	END IF;
	RETURN entity_id;
END;
$$
LANGUAGE plpgsql;

CREATE FUNCTION insert_child_entity(in_parent_id INT, in_kind TEXT, in_name TEXT, in_repo_id INT) RETURNS INT AS
$$
DECLARE
	entity_id INT;
BEGIN
	SELECT id INTO entity_id FROM entities E
	WHERE
		E.parent_id = in_parent_id AND
		E.name = in_name AND
		E.kind = in_kind AND
		E.repo_id = in_repo_id;
	IF NOT FOUND THEN
		INSERT INTO entities (repo_id, parent_id, name, kind)
		VALUES (in_repo_id, in_parent_id, in_name, in_kind)
		RETURNING id INTO entity_id;
	END IF;
	RETURN entity_id;
END;
$$
LANGUAGE plpgsql;


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