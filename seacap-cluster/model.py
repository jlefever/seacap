from typing import Dict, List, NamedTuple


class DataSet(NamedTuple):
    index: int
    name: str
    size: int
    num_clusters: int


class Triplet(NamedTuple):
    row: int
    col: int
    value: float


class Relation(NamedTuple):
    rows: str
    cols: str
    triplets: List[Triplet]


class Request(NamedTuple):
    sets: Dict[str, DataSet]
    relations: List[Relation]


class AssocCluster(NamedTuple):
    set: str
    cluster: int
    score: float


class Cluster(NamedTuple):
    set: str
    cluster: int
    indices: List[int]
    associations: List[AssocCluster]


class Response(NamedTuple):
    clusters: List[Cluster]