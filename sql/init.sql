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

CREATE TABLE contrib_commits (
    id SERIAL PRIMARY KEY,
    antipattern_id INT REFERENCES antipatterns (id) NOT NULL,
    commit_id INT REFERENCES commits (id) NOT NULL,
    UNIQUE (antipattern_id, commit_id)
);

------

CREATE EXTENSION intarray;

CREATE FUNCTION int_union(x INT[], y INT[]) RETURNS INT[] AS
$$
SELECT x | y;
$$
LANGUAGE SQL IMMUTABLE;

CREATE AGGREGATE int_union_agg(INT[]) (
	SFUNC = int_union,
	STYPE = INT[],
	INITCOND = '{}'
);

CREATE PROCEDURE create_filenames_table() AS
$$
SELECT id, filename(id)
INTO TEMP TABLE filenames
FROM entities;
$$
LANGUAGE SQL;

------


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
LANGUAGE SQL IMMUTABLE;

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
LANGUAGE SQL IMMUTABLE;

CREATE TYPE fl_dep AS (src TEXT, tgt TEXT, dep_count INT, dep_kinds_csv TEXT);
CREATE TYPE fl_change AS (commit_id INT, filename TEXT);
CREATE TYPE fl_cochange AS (x TEXT, y TEXT, cochange INT);
CREATE TYPE fl_cdep AS (src TEXT, tgt TEXT, dep_count INT, cochange INT);

CREATE TYPE dep AS (source_id INT, target_id INT, dep_count INT, dep_ids INT[]);
CREATE TYPE cocommit AS (x_id INT, y_id INT, cochange INT, commit_ids INT[], change_ids INT[]);
CREATE TYPE cdep AS (source_id INT, target_id INT, dep_count INT, cochange INT, dep_ids INT[], commit_ids INT[], change_ids INT[]);
CREATE TYPE fl_cdep2 AS (src TEXT, tgt TEXT, dep_count INT, cochange INT, dep_ids INT[], commit_ids INT[], change_ids INT[]);

CREATE FUNCTION get_fl_deps(dep_kinds TEXT[]) RETURNS SETOF fl_dep AS
$$
SELECT
    filename(D.source_id) AS src,
    filename(D.target_id) AS tgt,
    CAST(SUM(D.weight) AS INT) AS dep_count,
    STRING_AGG(D.kind, ',' ORDER BY D.kind) AS dep_kinds_csv
FROM deps D
WHERE filename(D.source_id) <> filename(D.target_id)
AND   D.kind = ANY(dep_kinds)
GROUP BY src, tgt
ORDER BY src, tgt;
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_deps(dep_kinds TEXT[]) RETURNS SETOF dep AS
$$
SELECT
	D.source_id,
	D.target_id,
	CAST(SUM(D.weight) AS INT) AS dep_count,
	sort(ARRAY_AGG(D.id)) AS dep_ids
FROM deps D
WHERE D.kind = ANY(dep_kinds)
GROUP BY D.source_id, D.target_id
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_fl_changes() RETURNS SETOF fl_change AS
$$
SELECT commit_id, filename(entity_id)
FROM changes
GROUP BY commit_id, filename
ORDER BY commit_id, filename;
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_fl_cochanges() RETURNS SETOF fl_cochange AS
$$
SELECT
    X.filename AS x,
    Y.filename AS y,
    CAST(COUNT(*) AS INT) AS cochange
FROM get_fl_changes() X
JOIN get_fl_changes() Y ON X.commit_id = Y.commit_id
WHERE X.filename <> Y.filename
GROUP BY X.filename, Y.filename
ORDER BY cochange DESC;
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_cocommits() RETURNS SETOF cocommit AS
$$
SELECT
    X.entity_id AS x_id,
    Y.entity_id AS y_id,
    CAST(COUNT(*) AS INT) AS cochange,
	sort(ARRAY_AGG(X.id)) AS commit_ids,
	sort(array_cat(ARRAY_AGG(X.id), ARRAY_AGG(Y.id))) AS change_ids
FROM changes X
JOIN changes Y ON X.commit_id = Y.commit_id
WHERE X.entity_id <> Y.entity_id
GROUP BY X.entity_id, Y.entity_id
ORDER BY cochange DESC;
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_fl_cdeps(dep_kinds TEXT[]) RETURNS SETOF fl_cdep AS
$$
SELECT
    COALESCE(D.src, CO.x) AS src,
    COALESCE(D.tgt, CO.y) AS tgt,
    COALESCE(D.dep_count, 0) AS dep_count,
    COALESCE(CO.cochange, 0) AS cochange
FROM get_fl_deps(dep_kinds) D
FULL OUTER JOIN get_fl_cochanges() CO
ON D.src = CO.x AND D.tgt = CO.y;
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_cdeps(dep_kinds TEXT[]) RETURNS SETOF cdep AS
$$
SELECT
    COALESCE(D.source_id, CO.x_id) AS source_id,
    COALESCE(D.target_id, CO.y_id) AS target_id,
    COALESCE(D.dep_count, 0) AS dep_count,
    COALESCE(CO.cochange, 0) AS cochange,
    COALESCE(D.dep_ids, '{}') AS dep_ids,
	COALESCE(CO.commit_ids, '{}') AS commit_ids,
	COALESCE(CO.change_ids, '{}') AS change_ids
FROM get_deps('{call,use}') D
FULL OUTER JOIN get_cocommits() CO
ON D.source_id = CO.x_id AND D.target_id = CO.y_id
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_fl_uifs(struct_impact INT, hist_impact INT, min_cochange INT, dep_kinds TEXT[])
RETURNS TABLE (unstable_interface TEXT) AS
$$
SELECT D.src
FROM get_fl_cdeps(dep_kinds) D
WHERE D.dep_count > 0
GROUP BY D.src
HAVING COUNT(*) >= struct_impact
INTERSECT
SELECT D.src
FROM get_fl_cdeps(dep_kinds) D
WHERE D.dep_count > 0 AND D.cochange >= min_cochange
GROUP BY D.src
HAVING COUNT(*) >= hist_impact
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_fl_mvps(min_cochange INT, dep_kinds TEXT[])
RETURNS TABLE (x TEXT, y TEXT, cochange INT) AS
$$
SELECT
    src AS x,
    tgt AS y,
    cochange
FROM get_fl_cdeps(dep_kinds)
WHERE dep_count = 0 AND cochange >= min_cochange
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_mvps(min_cochange INT, dep_kinds TEXT[])
RETURNS TABLE (x TEXT, y TEXT, cochange INT, commit_ids INT[]) AS
$$
SELECT
    SFN.filename AS x,
    TFN.filename AS y,
    icount(int_union_agg(CD.commit_ids)) AS cochange,
    sort(int_union_agg(CD.commit_ids)) AS commit_ids
FROM get_cdeps(dep_kinds) CD
LEFT JOIN filenames SFN ON CD.source_id = SFN.id
LEFT JOIN filenames TFN ON CD.target_id = TFN.id
WHERE dep_count = 0 AND SFN.filename <> TFN.filename
GROUP BY SFN.filename, TFN.filename
HAVING icount(int_union_agg(CD.commit_ids)) >= min_cochange
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION is_mvp_aligned(x_filename TEXT, y_filename TEXT) RETURNS BOOLEAN AS
$$
SELECT COUNT(*) > 0
	-- CO.x_id,
	-- XE.name AS x_name,
	-- XE.kind AS x_kind,
	-- CO.y_id,
	-- YE.name AS y_name,
	-- YE.kind AS y_kind,
	-- CO.cochange,
	-- CO.commit_ids
FROM get_cocommits() CO
LEFT JOIN entities XE ON XE.id = CO.x_id
LEFT JOIN entities YE ON YE.id = CO.y_id
WHERE filename(x_id) = x_filename
AND   filename(y_id) = y_filename
AND   XE.kind = 'method' AND YE.kind = 'method'
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION get_all_dep_kinds() RETURNS TEXT[] AS
$$
SELECT ARRAY_AGG(Q.kind)
FROM (SELECT DISTINCT kind FROM deps ORDER BY kind) Q;
$$
LANGUAGE SQL IMMUTABLE;

CREATE USER guest PASSWORD 'icse2022' CREATEDB;
GRANT SELECT ON repos,commits,entities,changes,change_details,deps,antipatterns,contrib_deps,contrib_commits TO guest;
GRANT REFERENCES ON repos,commits,entities,changes,change_details,deps,antipatterns,contrib_deps,contrib_commits TO guest;
GRANT EXECUTE ON FUNCTION dep_kinds, filename, get_fl_deps, get_fl_changes, get_fl_cochanges, get_fl_cdeps, get_fl_uifs, get_fl_mvps, get_all_dep_kinds TO guest;
GRANT CREATE ON DATABASE postgres TO guest;
GRANT TEMP ON DATABASE postgres TO guest;
GRANT CONNECT ON DATABASE postgres TO guest;
