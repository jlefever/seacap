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

CREATE TABLE antipatterns (
    id SERIAL PRIMARY KEY,
    kind TEXT NOT NULL,
    center TEXT
);

CREATE TABLE contrib_deps (
    id SERIAL PRIMARY KEY,
    antipattern_id INT REFERENCES antipatterns (id) NOT NULL,
    dep_id INT REFERENCES deps (id) NOT NULL,
    UNIQUE (antipattern_id, dep_id)
);

CREATE TABLE contrib_changes (
    id SERIAL PRIMARY KEY,
    antipattern_id INT REFERENCES antipatterns (id) NOT NULL,
    change_id INT REFERENCES changes (id) NOT NULL,
    UNIQUE (antipattern_id, change_id)
);

CREATE FUNCTION ancestory(entity_id INT) RETURNS SETOF entities AS
$$
WITH RECURSIVE ancestory AS (
	SELECT id, parent_id, repo_id, name, kind
	FROM entities WHERE id = entity_id
	UNION ALL
	SELECT P.id, P.parent_id, P.repo_id, P.name, P.kind
	FROM ancestory C, entities P WHERE C.parent_id = P.id
)
SELECT id, parent_id, repo_id, name, kind FROM ancestorygetTagId
$$
LANGUAGE SQL;

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

CREATE FUNCTION dep_kinds() RETURNS TABLE (
	dep_kind TEXT,
	source_kind TEXT,
	target_kind TEXT,
	frequency BIGINT
) AS $$
SELECT
	D.kind as dep_kind,
	SE.kind as source_kind,
	TE.kind as target_kind,
	COUNT(*) as frequency
FROM deps D
LEFT JOIN entities  SE ON D.source_id = SE.id
LEFT JOIN entities  TE ON D.target_id = TE.id
GROUP BY SE.kind, TE.kind, D.kind
ORDER BY dep_kind, source_kind, target_kind
$$
LANGUAGE SQL;

-- -- File-level dependencies
-- DROP TABLE IF EXISTS fl_deps;
-- SELECT
-- 	filename(SE.id) AS src,
-- 	filename(TE.id) AS dst,
-- 	D.kind,
-- 	SUM(D.weight) AS weight
-- INTO TEMP fl_deps
-- FROM deps D
-- LEFT JOIN entities SE ON D.source_id = SE.id
-- LEFT JOIN entities TE ON D.target_id = TE.id
-- WHERE filename(SE.id) <> filename(TE.id)
-- GROUP BY src, dst, D.kind
-- ORDER BY src;

-- -- File-level changes
-- DROP TABLE IF EXISTS fl_changes;
-- SELECT commit_id, filename(entity_id)
-- INTO fl_changes
-- FROM changes
-- GROUP BY commit_id, filename;

-- -- File-level cochanges
-- DROP TABLE IF EXISTS fl_cochanges;
-- SELECT
-- 	A.filename AS a,
-- 	B.filename AS b,
-- 	COUNT(*) AS cochange
-- INTO TEMP fl_cochanges
-- FROM fl_changes A
-- INNER JOIN fl_changes B ON A.commit_id = B.commit_id
-- WHERE A.filename <> B.filename
-- GROUP BY A.filename, B.filename
-- ORDER BY cochange DESC;

-- -- File-level unstable interfaces
-- SELECT
-- 	D.src,
-- 	COUNT(D.dst)
-- -- 	D.kind,
-- -- 	D.weight,
-- -- 	C.a,
-- -- 	C.b,
-- -- 	C.cochange
-- FROM fl_deps D
-- INNER JOIN fl_cochanges C
-- ON D.src = C.a AND D.dst = C.b
-- WHERE C.cochange > 1
-- GROUP BY D.src
-- ORDER BY count DESC

-- -- File-level unstable clients
-- SELECT
-- 	COUNT(D.src),
-- 	D.dst
-- -- 	D.kind,
-- -- 	D.weight,
-- -- 	C.a,
-- -- 	C.b,
-- -- 	C.cochange
-- FROM fl_deps D
-- INNER JOIN fl_cochanges C
-- ON D.src = C.a AND D.dst = C.b
-- WHERE C.cochange > 1
-- GROUP BY D.dst
-- ORDER BY count DESC

-- -- types of dependencies
-- SELECT
-- 	D.kind as dep_kind,
-- 	SE.kind as source_kind,
-- 	TE.kind as target_kind,
-- 	COUNT(*) as frequency
-- FROM deps D
-- LEFT JOIN entities  SE ON D.source_id = SE.id
-- LEFT JOIN entities  TE ON D.target_id = TE.id
-- GROUP BY SE.kind, TE.kind, D.kind
-- ORDER BY dep_kind, source_kind, target_kind
