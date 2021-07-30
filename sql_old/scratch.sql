WITH struct_dependents AS (
	SELECT
		CD.src,
		CAST(COUNT(*) AS INT) AS dependents,
		sort(int_union_agg(CD.dep_ids)) AS dep_ids
	FROM get_fl_cdeps2('{call,use}') CD
	WHERE CD.dep_count > 0
	GROUP BY CD.src
	HAVING COUNT(*) >= 2
),
hist_dependents AS (
	SELECT
		CD.src,
		CAST(COUNT(*) AS INT) AS changing_dependents,
		sort(int_union_agg(CD.dep_ids)) AS changing_dep_ids,
		sort(int_union_agg(CD.commit_ids)) AS commit_ids,
		sort(int_union_agg(CD.change_ids)) AS change_ids
	FROM get_fl_cdeps2('{call,use}') CD
	WHERE CD.dep_count > 0 AND CD.cochange >= 2
	GROUP BY CD.src
	HAVING COUNT(*) >= 2
),
unstable_interfaces AS (
	SELECT src FROM struct_dependents
	INTERSECT
	SELECT src FROM hist_dependents
)
SELECT
	UIF.src AS unstable_interface,
	SD.dependents AS fl_dependents,
	HD.changing_dependents AS fl_changing_dependents,
	count_uif_aligned_pairs(HD.changing_dep_ids, '{call,use}') AS aligned_pairs,
	count_dep_pairs(HD.changing_dep_ids, '{call,use}') AS total_pairs,
	CAST(count_uif_aligned_pairs(HD.changing_dep_ids, '{call,use}') AS DECIMAL)
		/ count_dep_pairs(HD.changing_dep_ids, '{call,use}') AS alignment
-- 	SD.dep_ids,
-- 	HD.changing_dep_ids,
-- 	HD.commit_ids,
-- 	HD.change_ids
FROM unstable_interfaces UIF
LEFT JOIN struct_dependents SD ON SD.src = UIF.src
LEFT JOIN hist_dependents HD ON HD.src = UIF.src
ORDER BY dependents DESC

-------

DROP FUNCTION count_uif_aligned_pairs

CREATE FUNCTION count_uif_aligned_pairs(changing_dep_ids INT[], dep_kinds TEXT[]) RETURNS INT AS
$$
SELECT COUNT(*)
FROM get_cdeps(dep_kinds) CD
WHERE CD.dep_ids && changing_dep_ids
AND CD.cochange > 0
$$
LANGUAGE SQL IMMUTABLE;

DROP FUNCTION count_dep_pairs

CREATE FUNCTION count_dep_pairs(a_dep_ids INT[], dep_kinds TEXT[]) RETURNS INT AS
$$
SELECT COUNT(*)
FROM get_cdeps(dep_kinds) CD
WHERE CD.dep_ids && a_dep_ids
$$
LANGUAGE SQL IMMUTABLE;
