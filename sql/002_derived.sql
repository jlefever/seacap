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

CREATE FUNCTION all_dep_kinds() RETURNS TEXT[] AS
$$
SELECT ARRAY_AGG(Q.kind)
FROM (SELECT DISTINCT kind FROM deps ORDER BY kind) Q;
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION summarize_dep_kinds() RETURNS TABLE (
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

CREATE MATERIALIZED VIEW filenames AS
SELECT id AS entity_id, filename(id)
FROM entities;

CREATE FUNCTION files_of(dep_ids INT[]) RETURNS TEXT[] AS
$$
SELECT ARRAY_AGG(Q.fn) FROM (
    WITH dep_filenames AS (
        SELECT DISTINCT SFN.filename AS src, TFN.filename AS tgt
        FROM deps D
        JOIN filenames SFN ON SFN.entity_id = D.source_id
        JOIN filenames TFN ON TFN.entity_id = D.target_id
        WHERE id = ANY(dep_ids)
    )
    SELECT src AS fn FROM dep_filenames
    UNION
    SELECT tgt AS fn FROM dep_filenames
) Q
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION entities_of(dep_ids INT[]) RETURNS SETOF entities AS
$$
WITH
    req_deps AS (
        SELECT source_id, target_id
        FROM deps D
        WHERE D.id = ANY(dep_ids)
    ),
    entity_ids AS (
        SELECT source_id AS id FROM req_deps
        UNION
        SELECT target_id AS id FROM req_deps
    )
SELECT E.* FROM entities E
JOIN entity_ids ON E.id = entity_ids.id
ORDER BY E.id
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION closed_entities_of(dep_ids INT[]) RETURNS SETOF entities AS
$$
WITH RECURSIVE ids AS (SELECT id FROM entities_of(dep_ids)),
ancestory AS (
    SELECT id, parent_id, repo_id, name, kind
    FROM entities WHERE id IN (SELECT id FROM ids)
    UNION ALL
    SELECT P.id, P.parent_id, P.repo_id, P.name, P.kind
    FROM ancestory C, entities P WHERE C.parent_id = P.id
)
SELECT DISTINCT * FROM ancestory ORDER BY id
$$
LANGUAGE SQL IMMUTABLE;

CREATE FUNCTION n_files_of(dep_ids INT[]) RETURNS INT AS
$$
SELECT CARDINALITY(files_of(dep_ids))
$$
LANGUAGE SQL IMMUTABLE;

CREATE VIEW entity_digests AS
WITH RECURSIVE ancestory AS (
    SELECT id, parent_id, digest(name || ',' || kind, 'sha256')
    FROM entities WHERE parent_id IS NULL
    UNION ALL
    SELECT C.id, C.parent_id, digest(P.digest || decode(C.name || ',' || C.kind, 'escape'), 'sha256')
    FROM ancestory P, entities C WHERE C.parent_id = P.id
)
SELECT id AS entity_id, digest FROM ancestory;

CREATE MATERIALIZED VIEW cochanges AS
SELECT
    XE.repo_id,
    X.entity_id AS x_id,
    Y.entity_id AS y_id,
    CAST(COUNT(*) AS INT) AS cochange,
    sort(ARRAY_AGG(X.id)) AS commit_ids,
    sort(array_cat(ARRAY_AGG(X.id), ARRAY_AGG(Y.id))) AS change_ids
FROM changes X
JOIN changes Y ON X.commit_id = Y.commit_id
JOIN entities XE ON X.entity_id = XE.id
WHERE X.entity_id <> Y.entity_id
GROUP BY XE.repo_id, X.entity_id, Y.entity_id
ORDER BY cochange DESC;

CREATE TYPE pdep AS (
    repo_id INT,
    source_id INT,
    target_id INT,
    dep_count INT,
    dep_ids INT[]
);

CREATE FUNCTION find_pdeps(dep_kinds TEXT[]) RETURNS SETOF pdep AS
$$
SELECT
    SE.repo_id,
	D.source_id,
	D.target_id,
	CAST(SUM(D.weight) AS INT) AS dep_count,
	sort(ARRAY_AGG(D.id)) AS dep_ids
FROM deps D
LEFT JOIN entities SE ON SE.id = D.source_id
WHERE D.kind = ANY(dep_kinds)
GROUP BY SE.repo_id, D.source_id, D.target_id
$$
LANGUAGE SQL IMMUTABLE;

CREATE TYPE cdep AS (
    repo_id INT,
    source_id INT, 
    target_id INT,
    dep_count INT,
    cochange INT,
    dep_ids INT[],
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION find_cdeps(dep_kinds TEXT[]) RETURNS SETOF cdep AS
$$
SELECT
    COALESCE(PD.repo_id, CO.repo_id) AS repo_id,
    COALESCE(PD.source_id, CO.x_id) AS source_id,
    COALESCE(PD.target_id, CO.y_id) AS target_id,
    COALESCE(PD.dep_count, 0) AS dep_count,
    COALESCE(CO.cochange, 0) AS cochange,
    COALESCE(PD.dep_ids, '{}') AS dep_ids,
	COALESCE(CO.commit_ids, '{}') AS commit_ids,
	COALESCE(CO.change_ids, '{}') AS change_ids
FROM find_pdeps(dep_kinds) PD
FULL OUTER JOIN cochanges CO
ON PD.source_id = CO.x_id AND PD.target_id = CO.y_id
$$
LANGUAGE SQL IMMUTABLE;

CREATE TYPE fl_cdep AS (
    repo_id INT,
    src TEXT,
    tgt TEXT,
    dep_count INT,
    cochange INT,
    dep_ids INT[],
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION find_fl_cdeps(dep_kinds TEXT[]) RETURNS SETOF fl_cdep AS
$$
SELECT
    CD.repo_id,
	SFN.filename AS src,
	TFN.filename AS tgt,
	CAST(SUM(CD.dep_count) AS INT) AS dep_count,
	icount(int_union_agg(CD.commit_ids)) AS cochange,
	sort(int_union_agg(CD.dep_ids)) AS dep_ids,
    sort(int_union_agg(CD.commit_ids)) AS commit_ids,
	sort(int_union_agg(CD.change_ids)) AS change_ids
FROM find_cdeps(dep_kinds) CD
LEFT JOIN filenames SFN ON CD.source_id = SFN.entity_id
LEFT JOIN filenames TFN ON CD.target_id = TFN.entity_id
WHERE SFN.filename <> TFN.filename
GROUP BY CD.repo_id, SFN.filename, TFN.filename
$$
LANGUAGE SQL IMMUTABLE;

-- Fan-out and fan-in

CREATE TYPE fl_fanout AS (
    repo_id INT,
    src TEXT,
    fanout INT,
    outdep_ids INT[]
);

CREATE FUNCTION count_fl_fanout(dep_kinds TEXT[]) RETURNS SETOF fl_fanout AS
$$
SELECT
    CD.repo_id,
    CD.src,
    CAST(COUNT(*) AS INT) AS fanout,
    sort(int_union_agg(CD.dep_ids)) AS outdep_ids
FROM find_fl_cdeps(dep_kinds) CD
WHERE CD.dep_count > 0
GROUP BY CD.repo_id, CD.src
$$
LANGUAGE SQL IMMUTABLE;

CREATE TYPE fl_fanin AS (
    repo_id INT,
    tgt TEXT,
    fanin INT,
    indep_ids INT[]
);

CREATE FUNCTION count_fl_fanin(dep_kinds TEXT[]) RETURNS SETOF fl_fanin AS
$$
SELECT
    CD.repo_id,
    CD.tgt,
    CAST(COUNT(*) AS INT) AS fanin,
    sort(int_union_agg(CD.dep_ids)) AS indep_ids
FROM find_fl_cdeps(dep_kinds) CD
WHERE CD.dep_count > 0
GROUP BY CD.repo_id, CD.tgt
$$
LANGUAGE SQL IMMUTABLE;

-- Evolutionarily coupled fan-in and fan-out

CREATE TYPE fl_evo_fanout AS (
    repo_id INT,
    src TEXT,
    evo_fanout INT,
    evo_outdep_ids INT[],
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION count_fl_evo_fanout(dep_kinds TEXT[], min_cochange INT) RETURNS SETOF fl_evo_fanout AS
$$
SELECT
    CD.repo_id,
    CD.src,
    CAST(COUNT(*) AS INT) AS evo_fanout,
    sort(int_union_agg(CD.dep_ids)) AS evo_outdep_ids,
    sort(int_union_agg(CD.commit_ids)) AS commit_ids,
    sort(int_union_agg(CD.change_ids)) AS change_ids
FROM find_fl_cdeps(dep_kinds) CD
WHERE CD.dep_count > 0 AND CD.cochange >= min_cochange
GROUP BY CD.repo_id, CD.src
$$
LANGUAGE SQL IMMUTABLE;

CREATE TYPE fl_evo_fanin AS (
    repo_id INT,
    tgt TEXT,
    evo_fanin INT,
    evo_indep_ids INT[],
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION count_fl_evo_fanin(dep_kinds TEXT[], min_cochange INT) RETURNS SETOF fl_evo_fanin AS
$$
SELECT
    CD.repo_id,
    CD.tgt,
    CAST(COUNT(*) AS INT) AS evo_fanin,
    sort(int_union_agg(CD.dep_ids)) AS evo_indep_ids,
    sort(int_union_agg(CD.commit_ids)) AS commit_ids,
    sort(int_union_agg(CD.change_ids)) AS change_ids
FROM find_fl_cdeps(dep_kinds) CD
WHERE CD.dep_count > 0 AND CD.cochange >= min_cochange
GROUP BY CD.repo_id, CD.tgt
$$
LANGUAGE SQL IMMUTABLE;

CREATE TYPE uif AS (
    repo_id INT,
    tgt TEXT,
    fanin INT,
    evo_fanin INT,
    size INT,
    indep_ids INT[],
    evo_indep_ids INT[],
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION find_uifs(min_fanin INT, min_evo_fanin INT, min_cochange INT, dep_kinds TEXT[]) RETURNS SETOF uif AS
$$
WITH
    fanin AS (SELECT * FROM count_fl_fanin(dep_kinds) WHERE fanin >= min_fanin),
    evo_fanin AS (SELECT * FROM count_fl_evo_fanin(dep_kinds, min_cochange) WHERE evo_fanin >= min_evo_fanin)
SELECT
    C.repo_id,
    C.tgt,
    FI.fanin,
    EFI.evo_fanin,
    n_files_of(EFI.evo_indep_ids) AS size,
    FI.indep_ids,
    EFI.evo_indep_ids,
    EFI.commit_ids,
    EFI.change_ids
FROM (SELECT repo_id, tgt FROM fanin INTERSECT SELECT repo_id, tgt FROM evo_fanin) C
JOIN fanin FI ON C.repo_id = FI.repo_id AND C.tgt = FI.tgt
JOIN evo_fanin EFI ON C.repo_id = EFI.repo_id AND C.tgt = EFI.tgt
$$
LANGUAGE SQL IMMUTABLE;

CREATE MATERIALIZED VIEW uifs AS
SELECT ROW_NUMBER() OVER (PARTITION BY UIF.repo_id ORDER BY UIF.size DESC, UIF.tgt) AS num, *
FROM find_uifs(4, 4, 2, all_dep_kinds()) UIF
ORDER BY UIF.repo_id, num;

CREATE TYPE crs AS (
    repo_id INT,
    center TEXT,
    fanout INT,
    evo_fanout INT,
    fanin INT,
    evo_fanin INT,
    size INT,
    outdep_ids INT[],
    evo_outdep_ids INT[],
    indep_ids INT[],
    evo_indep_ids INT[],
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION find_crss(min_fanout INT, min_evo_fanout INT, min_fanin INT, min_evo_fanin INT, min_cochange INT, dep_kinds TEXT[]) RETURNS SETOF crs AS
$$
WITH
    fanout AS (SELECT * FROM count_fl_fanout(dep_kinds) WHERE fanout >= min_fanout),
    evo_fanout AS (SELECT * FROM count_fl_evo_fanout(dep_kinds, min_cochange) WHERE evo_fanout >= min_evo_fanout),
    fanin AS (SELECT * FROM count_fl_fanin(dep_kinds) WHERE fanin >= min_fanin),
    evo_fanin AS (SELECT * FROM count_fl_evo_fanin(dep_kinds, min_cochange) WHERE evo_fanin >= min_evo_fanin)
SELECT
    C.repo_id,
    C.center,
    FO.fanout,
    EFO.evo_fanout,
    FI.fanin,
    EFI.evo_fanin,
    n_files_of(int_union(EFO.evo_outdep_ids, EFI.evo_indep_ids)) AS size,
    FO.outdep_ids,
    EFO.evo_outdep_ids,
    FI.indep_ids,
    EFI.evo_indep_ids,
    sort(int_union(EFO.commit_ids, EFI.commit_ids)) AS commit_ids,
    sort(int_union(EFO.change_ids, EFI.change_ids)) AS change_ids
FROM (
    SELECT repo_id, src AS center FROM fanout
    INTERSECT
    SELECT repo_id, src AS center FROM evo_fanout
    INTERSECT
    SELECT repo_id, tgt AS center FROM fanin
    INTERSECT
    SELECT repo_id, tgt AS center FROM evo_fanin
) C
JOIN fanout FO ON C.repo_id = FO.repo_id AND C.center = FO.src
JOIN evo_fanout EFO ON C.repo_id = EFO.repo_id AND C.center = EFO.src
JOIN fanin FI ON C.repo_id = FI.repo_id AND C.center = FI.tgt
JOIN evo_fanin EFI ON C.repo_id = EFI.repo_id AND C.center = EFI.tgt
ORDER BY C.repo_id, size DESC, C.center
$$
LANGUAGE SQL IMMUTABLE;

CREATE MATERIALIZED VIEW crss AS
SELECT ROW_NUMBER() OVER (PARTITION BY CRS.repo_id ORDER BY CRS.size DESC, CRS.center) AS num, *
FROM find_crss(4, 4, 4, 4, 2, all_dep_kinds()) CRS
ORDER BY CRS.repo_id, num;

CREATE TYPE mvp AS (
    repo_id INT,
    x TEXT,
    y TEXT,
    cochange INT,
    commit_ids INT[],
    change_ids INT[]
);

CREATE FUNCTION find_mvps(min_cochange INT, dep_kinds TEXT[]) RETURNS SETOF mvp AS
$$
SELECT DISTINCT
    CD.repo_id,
    LEAST(CD.src, CD.tgt) AS x,
    GREATEST(CD.src, CD.tgt) AS y,
    CD.cochange,
    CD.commit_ids,
    CD.change_ids
FROM find_fl_cdeps(dep_kinds) CD
WHERE CD.dep_count = 0 AND CD.cochange >= min_cochange
ORDER BY CD.repo_id, CD.cochange DESC, x, y
$$
LANGUAGE SQL IMMUTABLE;

CREATE MATERIALIZED VIEW mvps AS
SELECT ROW_NUMBER() OVER (PARTITION BY MVP.repo_id ORDER BY MVP.cochange DESC, x, y) AS num, *
FROM find_mvps(2, all_dep_kinds()) MVP
ORDER BY MVP.repo_id, num;

CREATE PROCEDURE refresh_mat_views() AS
$$
REFRESH MATERIALIZED VIEW filenames;
REFRESH MATERIALIZED VIEW cochanges;
REFRESH MATERIALIZED VIEW uifs;
REFRESH MATERIALIZED VIEW crss;
REFRESH MATERIALIZED VIEW mvps;
$$
LANGUAGE SQL;

-- CREATE MATERIALIZED VIEW mvps AS
-- SELECT

-------

-- DROP FUNCTION count_uif_aligned_pairs

-- CREATE FUNCTION count_uif_aligned_pairs(changing_dep_ids INT[], dep_kinds TEXT[]) RETURNS INT AS
-- $$
-- SELECT COUNT(*)
-- FROM get_cdeps(dep_kinds) CD
-- WHERE CD.dep_ids && changing_dep_ids
-- AND CD.cochange > 0
-- $$
-- LANGUAGE SQL IMMUTABLE;

-- DROP FUNCTION count_dep_pairs

-- CREATE FUNCTION count_dep_pairs(a_dep_ids INT[], dep_kinds TEXT[]) RETURNS INT AS
-- $$
-- SELECT COUNT(*)
-- FROM get_cdeps(dep_kinds) CD
-- WHERE CD.dep_ids && a_dep_ids
-- $$
-- LANGUAGE SQL IMMUTABLE;