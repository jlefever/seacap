import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import _ from "lodash";
// import "@tensorflow/tfjs-backend-webgl";

function argmin(eles: number[]) {
    // TODO: Consider many equal mins
    return _.indexOf(eles, _.min(eles));
}

function toNum(tensor: tf.Tensor<tf.Rank>): number {
    return tensor.bufferSync().get(0);
}

type Vec = tf.Tensor1D;

type Mean = Vec;

type KMeans = Mean[];

type Cluster = Vec[];

type KClusters = Cluster[];

type Init = (observations: Vec[], k: number) => KMeans;

type Dist = (a: Vec, b: Vec) => number;

function indexFor(dist: Dist, means: KMeans, vec: Vec) {
    return argmin(means.map(m => dist(m, vec)));
}

function assign(dist: Dist, means: KMeans, curr: KClusters): [KClusters, boolean] {
    const next = means.map(_ => new Array<Vec>());

    let modified = false;

    curr.forEach((cluster, clusterIndex) => {
        cluster.forEach(vec => {
            const index = indexFor(dist, means, vec);

            if (index != clusterIndex) {
                modified = true;
            }

            next[index].push(vec);
        });
    });

    return [next, modified];
}

function mean(cluster: Cluster): Mean {
    return tf.div(tf.addN(cluster), tf.scalar(cluster.length));
}

function update(clusters: KClusters): KMeans {
    return clusters.map(c => mean(c));
}

export function kmeans(observations: Vec[], k: number, dist: Dist = squaredEuclideanDistance, init: Init = forgyInit): KClusters {
    let means = init(observations, k);
    let clusters = [observations];

    while (1) {
        let [next, modified] = assign(dist, means, clusters);
        if (!modified) break;
        clusters = next;
        means = update(clusters);
    }

    return clusters;
}

function forgyInit(observations: Vec[], k: number): KMeans {
    return _.take(_.shuffle(observations), k);
}

function squaredEuclideanDistance(a: Vec, b: Vec) {
    const difference = tf.sub(a, b);
    return toNum(tf.dot(difference, difference));
}

function printClusters(clusters: KClusters) {
    clusters.forEach((cluster, i) => {
        console.log(`Cluster ${i}`);
        cluster.forEach(v => v.print());
    });
}

export function testKmeans() {
    const a = tf.tensor1d([1.1, 1.1]);
    const b = tf.tensor1d([1.4, 1.4]);
    const c = tf.tensor1d([3.1, 3.1]);
    const d = tf.tensor1d([3.4, 3.4]);

    const clusters = kmeans([a, c, b, d], 2);
    printClusters(clusters);
}