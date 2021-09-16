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

type KMeans = readonly Mean[];

type Samples = readonly Vec[];

type Cluster = readonly number[];

type KClusters = readonly Cluster[];

type Init = (observations: readonly Vec[], k: number) => KMeans;

type Dist = (a: Vec, b: Vec) => number;

function indexFor(dist: Dist, means: KMeans, vec: Vec) {
    return argmin(means.map(m => dist(m, vec)));
}

function assign(dist: Dist, samples: Samples, means: KMeans, curr: KClusters): [KClusters, boolean] {
    const next = means.map(_ => new Array<number>());

    let modified = false;

    curr.forEach((cluster, clusterIndex) => {
        cluster.forEach(vecIndex => {
            const vec = samples[vecIndex];
            const nextClusterIndex = indexFor(dist, means, vec);

            if (nextClusterIndex != clusterIndex) {
                modified = true;
            }

            next[nextClusterIndex].push(vecIndex);
        });
    });

    return [next, modified];
}

function mean(samples: Samples, cluster: Cluster): Mean {
    return tf.div(tf.addN(cluster.map(c => samples[c])), tf.scalar(cluster.length));
}

function update(samples: Samples, clusters: KClusters): KMeans {
    return clusters.map(c => mean(samples, c));
}

export function kmeans(samples: Samples, k: number, dist: Dist = squaredEuclideanDistance, init: Init = forgyInit): KClusters {
    let means = init(samples, k);
    let clusters = [Array.from(Array(samples.length).keys())];

    while (1) {
        let [next, modified] = assign(dist, samples, means, clusters);
        if (!modified) break;
        // @ts-ignore
        clusters = next;
        means = update(samples, next);
    }

    return clusters;
}

function forgyInit(samples: Samples, k: number): KMeans {
    return _.take(_.shuffle(samples), k);
}

function squaredEuclideanDistance(a: Vec, b: Vec) {
    const difference = tf.sub(a, b);
    return toNum(tf.dot(difference, difference));
}

// function toString(cluster: Cluster) {
//     return `[${cluster.join(",")}]`;
// }

// function printClusters(clusters: KClusters) {
//     clusters.forEach((cluster, i) => {
//         console.log(`Cluster ${i}: ${toString(cluster)}`);
//     });
// }

export function testKmeans() {
    const a = tf.tensor1d([1.1, 1.1]);
    const b = tf.tensor1d([1.4, 1.4]);
    const c = tf.tensor1d([3.1, 3.1]);
    const d = tf.tensor1d([3.4, 3.4]);

    const clusters = kmeans([a, c, b, d], 2);
    console.log(clusters);
}