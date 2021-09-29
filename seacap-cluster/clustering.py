import json
from collections import defaultdict
from typing import List, Tuple

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
import scipy as sp
from scipy import sparse
from scipy.sparse.linalg import eigsh
from scipy.stats import ortho_group
from sklearn.cluster import KMeans

import model


def to_matrix(triples: List[model.Triplet], shape: Tuple[int, int]):
    row = list(map(lambda t: t.row, triples))
    col = list(map(lambda t: t.col, triples))
    data = list(map(lambda t: float(t.value), triples))
    return sparse.coo_matrix((data, (row, col)), shape=shape)


def get_relations(req: model.Request):
    relations = defaultdict(dict)
    for rel in req.relations:
        shape = (req.sets[rel.rows].size, req.sets[rel.cols].size)
        matrix = to_matrix(rel.triplets, shape)
        relations[rel.rows][rel.cols] = matrix.todense()
        relations[rel.cols][rel.rows] = np.transpose(matrix).todense()
    return relations


def init_C(dataset: model.DataSet):
    return ortho_group.rvs(dataset.size)[:, : dataset.num_clusters]


def calc_M(sets, relations, indicators, p):
    summands = []
    rels = relations[sets[p]]
    for j in range(len(sets)):
        if p == j:
            continue
        RC = np.matmul(rels[sets[j]], indicators[j])
        summands.append(np.matmul(RC, RC.T))
    # for j in range(p + 1, len(sets)):
    #     R = relations[sets[p]][sets[j]]
    #     C = indicators[j]
    #     RC = np.matmul(R, C)
    #     summands.append(np.matmul(RC, RC.T))
    # for j in range(0, p):
    #     R = relations[sets[j]][sets[p]]
    #     C = indicators[j]
    #     RTC = np.matmul(R.T, C)
    #     summands.append(np.matmul(RTC, RTC.T))
    return np.add.reduce(summands)


def cluster(sets, relations):
    indicators = list(map(init_C, sets.values()))
    prev_eigenvalues = [0 for _ in range(len(sets))]
    errors = [1 for _ in range(len(sets))]
    for _ in range(500):
        for p in range(0, len(sets)):
            # Calculate M
            M = calc_M(list(sets.keys()), relations, indicators, p)

            # Calculate the top k eigenvalues and eigenvectors
            num_cluster = indicators[p].shape[1]
            eigenvalues, eigenvectors = eigsh(M, k=num_cluster, which="LM")

            # Calculate the "error"
            errors[p] = np.amax(np.abs(prev_eigenvalues[p] - eigenvalues))

            # Update for next iteration
            prev_eigenvalues[p] = eigenvalues
            indicators[p] = eigenvectors
        if all(map(lambda x: x < 1e-8, errors)):
            break
    return indicators


def onehot(length: int, index: int):
    v = np.zeros(length)
    v[index] = 1
    return v


def discretize(indicator):
    k = indicator.shape[1]
    kmeans = KMeans(n_clusters=k, random_state=0).fit(indicator)
    return np.vstack(list(map(lambda c: onehot(k, c), kmeans.labels_)))


# normalize cols
def normalize(indicator: np.ndarray):
    vigorous = np.zeros(indicator.shape)
    for i in range(indicator.shape[1]):
        count = np.sum(indicator[:, i])
        if count == 0:
            continue
        scalar = (1 / np.sqrt(count))
        vigorous[:, i] = scalar * indicator[:, i]
    return vigorous
    

def get_associations(indicators, relations):
    assocs = defaultdict(dict)
    for row_set, col_sets in relations.items():
        for col_set, R in col_sets.items():
            row_C = indicators[row_set]
            col_C = indicators[col_set]
            A = np.matmul(np.matmul(row_C.T, R), col_C)
            assocs[row_set][col_set] = A
    return assocs
