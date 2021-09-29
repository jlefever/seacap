import itertools as it
import random
from typing import Dict, List, Optional
from collections import defaultdict

from flask import Flask, request
from sklearn.cluster import KMeans

import model
import clustering
import numpy as np

app = Flask(__name__)


def parse_sets(body) -> Dict[str, model.DataSet]:
    datasets = dict()
    for index, set in enumerate(body["sets"]):
        set["index"] = index
        dataset = model.DataSet(**set)
        if dataset.name in datasets:
            raise RuntimeError()
        datasets[dataset.name] = dataset
    return datasets


def parse_relations(body) -> List[model.Relation]:
    for r in body["relations"]:
        triplets = map(lambda t: model.Triplet(*t), r["triplets"])
        yield model.Relation(r["rows"], r["cols"], list(triplets))


def parse_request(body) -> model.Request:
    return model.Request(parse_sets(body), list(parse_relations(body)))


def verify_request(req: model.Request) -> Optional[str]:
    # Ensure sets are valid
    valid_chars = "1234567890abcdefghijklmnopqrstuvwxyz_"
    for dataset in req.sets.values():
        if any(map(lambda c: c not in valid_chars, dataset.name)):
            return "set names may only use the characters '{}'".format(valid_chars)
        if dataset.size < 1:
            return "set '{}' must have at least one element".format(dataset.name)
        if dataset.num_clusters < 1:
            return "set '{}' must have at least one cluster".format(dataset.name)
        if dataset.num_clusters > dataset.size:
            return "set '{}' must have more elements than clusters".format(dataset.name)

    # Ensure relations are valid
    rel_history = set()
    set_history = set()
    for rel in req.relations:
        # Ensure relations are unique
        rel_key_a = "{},{}".format(rel.rows, rel.cols)
        rel_key_b = "{},{}".format(rel.cols, rel.rows)
        if rel_key_a in rel_history or rel_key_b in rel_history:
            return "relation ({}) defined more than once".format(rel_key_a)
        rel_history.add(rel_key_a)
        rel_history.add(rel_key_b)
        set_history.add(rel.rows)
        set_history.add(rel.cols)

        # Ensure there are no self-relations
        if rel.rows == rel.cols:
            return "relation ({}) is self-relation"

        # Ensure relations refer to defined sets
        undefined_set_msg = "relation ({}) uses undefined set '{}'"
        if rel.rows not in req.sets:
            return undefined_set_msg.format(rel_key_a, rel.rows)
        if rel.cols not in req.sets:
            return undefined_set_msg.format(rel_key_a, rel.cols)

        # Ensure triplets are valid
        n_rows = req.sets[rel.rows].size
        n_cols = req.sets[rel.cols].size
        t_history = set()
        for triplet in rel.triplets:
            # Ensure triplets are unique
            t_key = "{},{}".format(triplet.row, triplet.col)
            duplicate_msg = "relation ({}) defined cell ({}) more than once"
            if t_key in t_history:
                return duplicate_msg.format(rel_key_a, t_key)
            t_history.add(t_key)

            # Ensure rows and cols are in bounds
            oob_msg = "the {} of cell ({}) in relation ({}) is out of bounds"
            if triplet.row < 0 or triplet.row >= n_rows:
                return oob_msg.format("row", t_key, rel_key_a)
            if triplet.col < 0 or triplet.col >= n_cols:
                return oob_msg.format("col", t_key, rel_key_a)

    # Ensure all sets are used
    for dataset_name in req.sets:
        if dataset_name not in set_history:
            return "set '{}' is unused".format(dataset_name)
    return None


def rand_custer(req: model.Request) -> model.Response:
    clusters = []
    base_seed = random.random()

    def key_fn(i: int):
        random.seed(base_seed + i)
        return random.randint(1, s.num_clusters)

    for s in req.sets.values():
        indices = list(range(s.size))
        indices = sorted(indices, key=key_fn)
        for k, g in it.groupby(indices, key=key_fn):
            cluster = model.Cluster(s.name, k, list(g), [])
            clusters.append(cluster)

    return model.Response(clusters)


def to_cluster_dtos(set_name: str, indicator: np.ndarray, relations):
    for i in range(indicator.shape[1]):
        indices = np.flatnonzero(indicator[:, i]).tolist()
        assocs = to_assoc_dtos(set_name, i, relations)
        yield model.Cluster(set_name, i + 1, indices, assocs)
        

def to_assoc_dtos(set_name: str, cluster_idx: int, relations):
    assocs = list()
    rels = relations[set_name]
    for set, A in rels.items():
        print("hello")
        for i, score in enumerate(A[cluster_idx].tolist()[0]):
            assocs.append(model.AssocCluster(set, i + 1, score))
    return assocs


@app.route("/clustering/src", methods=["POST"])
def src_clustering():
    req = parse_request(request.json)
    error_msg = verify_request(req)
    if error_msg:
        return error_msg, 400
    relations = clustering.get_relations(req)
    indicators = clustering.cluster(req.sets, relations)

    # Calculate association matrices
    indicators_d = dict()
    for i, name in enumerate(req.sets.keys()):
        ind = clustering.normalize(clustering.discretize(indicators[i]))
        indicators_d[name] = ind

    assocs = clustering.get_associations(indicators_d, relations)

    clusters = []
    for i, set in enumerate(req.sets):
        dtos = to_cluster_dtos(set, indicators_d[set], assocs)
        clusters.extend(dtos)
    return model.Response(clusters)._asdict()
