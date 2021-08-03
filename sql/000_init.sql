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

CREATE EXTENSION pgcrypto;