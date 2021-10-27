import json
import enum
from collections import defaultdict
from dataclasses import dataclass
from timeit import default_timer as timer
from typing import Any, Dict, List, Tuple

import flask
import numpy as np
import scipy.sparse
import scipy.sparse.linalg
import scipy.stats
import sklearn.cluster
from marshmallow import Schema, fields, post_load
from marshmallow.exceptions import ValidationError
from marshmallow.validate import Range


@dataclass
class IndexSet:
    name: str
    size: int


class IndexSetSchema(Schema):
    name = fields.Str(required=True)
    size = fields.Int(
        strict=True,
        required=True,
        validate=[Range(min=1, error="size must be greater than 0")],
    )

    class Meta:
        ordered = True

    @post_load
    def make_index_set(self, data, **kwargs):
        return IndexSet(**data)


Triple = Tuple[int, int, float]


@dataclass
class Matrix:
    row_set_name: str
    col_set_name: str
    triples: List[Triple]

    def to_ndarray(self, n_rows: int, n_cols: int):
        shape = (n_rows, n_cols)
        rows = list(map(lambda t: t[0], self.triples))
        cols = list(map(lambda t: t[1], self.triples))
        data = list(map(lambda t: t[2], self.triples))
        return scipy.sparse.coo_matrix((data, (rows, cols)), shape=shape).todense()


class MatrixSchema(Schema):
    row_set_name = fields.Str(required=True, data_key="rows")
    col_set_name = fields.Str(required=True, data_key="cols")
    triples = fields.List(
        fields.Tuple((fields.Int(), fields.Int(), fields.Float())), requried=True
    )

    class Meta:
        ordered = True

    @post_load
    def make_matrix(self, data, **kwargs):
        return Matrix(**data)


IndexSetDict = Dict[str, IndexSet]
MatrixDict = Dict[str, Dict[str, np.ndarray]]


@dataclass
class HeteroGraph:
    index_sets: List[IndexSet]
    matrices: List[Matrix]

    def __init__(self, index_sets: List[IndexSet], matrices: List[Matrix]):
        self.index_sets = index_sets
        self.matrices = matrices
        self._index_set_dict: IndexSetDict = self._make_index_set_dict(index_sets)
        self._matrix_dict: MatrixDict = self._make_matrix_dict(matrices)

    def _make_index_set_dict(self, index_sets: List[IndexSet]) -> IndexSetDict:
        return {s.name: s for s in index_sets}

    def _make_matrix_dict(self, matrices: List[Matrix]) -> MatrixDict:
        matrix_dict = defaultdict(dict)
        for matrix in matrices:
            row_name = matrix.row_set_name
            col_name = matrix.col_set_name
            n_rows = self._index_set_dict[row_name].size
            n_cols = self._index_set_dict[col_name].size
            arr = matrix.to_ndarray(n_rows, n_cols)
            matrix_dict[row_name][col_name] = arr
            matrix_dict[col_name][row_name] = np.transpose(arr)
        return matrix_dict

    def get_index_set(self, name: str) -> IndexSet:
        return self._index_set_dict[name]

    def get_index_set_by_idx(self, idx: int) -> IndexSet:
        return self.index_sets[idx]

    def get_matrix(self, rows: str, cols: str) -> np.ndarray:
        return self._matrix_dict[rows][cols]

    def get_matrix_by_idx(self, rows: int, cols: int) -> np.ndarray:
        row_name = self.get_index_set_by_idx(rows).name
        col_name = self.get_index_set_by_idx(cols).name
        return self.get_matrix(row_name, col_name)

    def has_matrix(self, rows: str, cols: str) -> bool:
        if rows not in self._matrix_dict:
            return False
        return cols in self._matrix_dict[rows]

    def has_matrix_by_idx(self, rows: int, cols: int) -> bool:
        row_name = self.get_index_set_by_idx(rows).name
        col_name = self.get_index_set_by_idx(cols).name
        return self.has_matrix(row_name, col_name)


class HeteroGraphSchema(Schema):
    index_sets = fields.List(
        fields.Nested(IndexSetSchema), required=True, data_key="indexSets"
    )
    matrices = fields.List(fields.Nested(MatrixSchema), required=True)

    class Meta:
        ordered = True

    @post_load
    def make_hetero_graph(self, data, **kwargs):
        return HeteroGraph(**data)


@dataclass
class SpectralOptions:
    num_clusters: int
    normalized: bool


class SpectralOptionsSchema(Schema):
    num_clusters = fields.Int(
        required=True,
        validate=[Range(min=1, error="numClusters must be greater than 0")],
        data_key="numClusters",
    )
    normalized = fields.Bool(required=True)

    class Meta:
        ordered = True

    @post_load
    def make_spectral_options(self, data, **kwargs):
        return SpectralOptions(**data)


@dataclass
class SpectralClusterReq:
    options: SpectralOptions
    graph: HeteroGraph


class SpectralClusterReqSchema(Schema):
    options = fields.Nested(SpectralOptionsSchema)
    graph = fields.Nested(HeteroGraphSchema)

    class Meta:
        ordered = True

    @post_load
    def make_spectral_cluster_req(self, data, **kwargs):
        return SpectralClusterReq(**data)


@dataclass
class SrOptions:
    num_clusters: Dict[str, int]

    def get_num_clusters(self, index_set_name: str) -> int:
        return self.num_clusters[index_set_name]


class SrOptionsSchema(Schema):
    num_clusters = fields.Dict(
        fields.Str(), fields.Int(), required=True, data_key="numClusters"
    )

    class Meta:
        ordered = True

    @post_load
    def make_sr_options(self, data, **kwargs):
        return SrOptions(**data)


@dataclass
class SrClusterReq:
    options: SrOptions
    graph: HeteroGraph


class SrClusterReqSchema(Schema):
    options = fields.Nested(SrOptionsSchema)
    graph = fields.Nested(HeteroGraphSchema)

    class Meta:
        ordered = True

    @post_load
    def make_sr_cluster_req(self, data, **kwargs):
        return SrClusterReq(**data)


@dataclass
class Cluster:
    index_set_name: str
    cluster: int
    indices: List[int]


class ClusterSchema(Schema):
    index_set_name = fields.Str(data_key="set")
    cluster = fields.Int()
    indices = fields.List(fields.Int())

    class Meta:
        ordered = True


@dataclass
class ClusterRes:
    clusters: List[Cluster]
    iterations: int
    elapsed: float


class ClusterResSchema(Schema):
    clusters = fields.List(fields.Nested(ClusterSchema))
    iterations = fields.Int()
    elapsed = fields.Float()

    class Meta:
        ordered = True


def onehot(length: int, index: int):
    v = np.zeros(length)
    v[index] = 1
    return v


def to_adjacency_mat(graph: HeteroGraph) -> np.ndarray:
    blocks = list()
    for i_set in graph.index_sets:
        row_blocks = list()
        for j_set in graph.index_sets:
            if graph.has_matrix(i_set.name, j_set.name):
                matrix = graph.get_matrix(i_set.name, j_set.name)
                row_blocks.append(matrix)
            else:
                row_blocks.append(np.zeros((i_set.size, j_set.size)))
        blocks.append(row_blocks)
    return np.block(blocks)


def to_degree_mat(adj: np.ndarray) -> np.ndarray:
    degrees = list()
    for i in range(adj.shape[0]):
        degrees.append(np.sum(adj[i]))
    return np.diag(degrees)


def to_local_index(graph: HeteroGraph, i) -> Tuple[IndexSet, int]:
    running = 0
    for index_set in graph.index_sets:
        if i >= running and i < running + index_set.size:
            local_i = i - running
            return (index_set, local_i)
        running += index_set.size
    raise ValueError()


def to_local_indices(
    graph: HeteroGraph, index_set: IndexSet, indices: List[int]
) -> List[int]:
    local_indices = list()
    for i in indices:
        index_set_b, local_i = to_local_index(graph, i)
        if index_set_b != index_set:
            continue
        local_indices.append(local_i)
    return local_indices


class SpectralAlgorithm:
    def cluster(self, graph: HeteroGraph, opts: SpectralOptions) -> ClusterRes:
        start = timer()
        k = opts.num_clusters
        W = to_adjacency_mat(graph)
        D = to_degree_mat(W)
        L = D - W
        print(L)
        M = np.copy(D) if opts.normalized else None
        # Possible exception if M != None and M is not positive-definite
        # AKA (in this case) has any zeros on the diagonal
        # This happens when that index is not involved in any relations
        # In practice, I don't think our application sends data like this
        _, eigenvectors = scipy.sparse.linalg.eigsh(L, M=M, k=k, which="LM")
        print(eigenvectors)
        kmeans = sklearn.cluster.KMeans(n_clusters=k, random_state=0).fit(eigenvectors)
        indicator = np.vstack(list(map(lambda c: onehot(k, c), kmeans.labels_)))
        print(indicator)
        clusters = []
        for cluster_i in range(indicator.shape[1]):
            indices = np.flatnonzero(indicator[:, cluster_i]).tolist()
            for index_set in graph.index_sets:
                local_indices = to_local_indices(graph, index_set, indices)
                clusters.append(Cluster(index_set.name, cluster_i + 1, local_indices))
        elapsed = timer() - start
        return ClusterRes(clusters, -1, elapsed)


class SrAlgorithm:
    def cluster(self, graph: HeteroGraph, opts: SrOptions) -> ClusterRes:
        Cs = self._init_Cs(graph, opts)
        n_sets = len(graph.index_sets)
        prev_eigenvalues = [0 for _ in range(n_sets)]
        errors = [1 for _ in range(n_sets)]
        iterations = 0
        start = timer()
        for _ in range(500):
            for p in range(n_sets):
                M = self._calc_M(graph, Cs, p)

                # Calculate the top k eigenvalues and eigenvectors
                num_cluster = Cs[p].shape[1]
                eigenvalues, eigenvectors = scipy.sparse.linalg.eigsh(
                    M, k=num_cluster, which="LM"
                )

                # Calculate the "error"
                errors[p] = np.amax(np.abs(prev_eigenvalues[p] - eigenvalues))

                # Update for next iteration
                prev_eigenvalues[p] = eigenvalues
                Cs[p] = eigenvectors
            iterations += 1
            if all(map(lambda x: x < 1e-8, errors)):
                break
        elapsed = timer() - start
        clusters = self._to_clusters(graph, Cs)
        return ClusterRes(clusters, iterations, elapsed)

    def _init_Cs(self, graph: HeteroGraph, opts: SrOptions) -> List[np.ndarray]:
        Cs = list()
        for index_set in graph.index_sets:
            n = index_set.size
            k = opts.get_num_clusters(index_set.name)
            Cs.append(scipy.stats.ortho_group.rvs(n)[:, :k])
        return Cs

    def _calc_M(self, graph: HeteroGraph, Cs: List[np.ndarray], p: int) -> np.ndarray:
        summands = []
        for j in range(len(graph.index_sets)):
            if p == j:
                continue
            if not graph.has_matrix_by_idx(p, j):
                continue
            R = graph.get_matrix_by_idx(p, j)
            RC = np.matmul(R, Cs[j])
            summands.append(np.matmul(RC, RC.T))
        return np.add.reduce(summands)

    def _discretize(self, C: np.ndarray) -> np.ndarray:
        k = C.shape[1]
        kmeans = sklearn.cluster.KMeans(n_clusters=k, random_state=0).fit(C)
        return np.vstack(list(map(lambda c: onehot(k, c), kmeans.labels_)))

    def _to_clusters(self, graph: HeteroGraph, Cs: List[np.ndarray]) -> ClusterRes:
        clusters = list()
        for idx, index_set in enumerate(graph.index_sets):
            C = self._discretize(Cs[idx])
            for i in range(C.shape[1]):
                indices = np.flatnonzero(C[:, i]).tolist()
                cluster = Cluster(index_set.name, i + 1, indices)
                clusters.append(cluster)
        return clusters


app = flask.Flask(__name__)


@app.route("/clustering/spectral", methods=["POST"])
def handle_spectral() -> Any:
    data = flask.request.json
    try:
        req: SpectralClusterReq = SpectralClusterReqSchema().load(data)
        res = SpectralAlgorithm().cluster(req.graph, req.options)
        return ClusterResSchema().dump(res), 200
    except ValidationError as e:
        return e.messages, 400


@app.route("/clustering/src", methods=["POST"])
def handle_src() -> Any:
    data = flask.request.json
    try:
        req: SrClusterReq = SrClusterReqSchema().load(data)
        res = SrAlgorithm().cluster(req.graph, req.options)
        return ClusterResSchema().dump(res), 200
    except ValidationError as e:
        return e.messages, 400
