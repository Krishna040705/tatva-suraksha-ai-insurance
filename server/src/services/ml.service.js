function mean(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values, average) {
  if (values.length <= 1) {
    return 1;
  }

  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length;

  return Math.sqrt(variance) || 1;
}

function euclideanDistance(left, right) {
  return Math.sqrt(
    left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0),
  );
}

export function trainCentroidClassifier(samples) {
  if (!samples.length) {
    return null;
  }

  const featureKeys = Object.keys(samples[0].features);
  const featureStats = featureKeys.reduce((accumulator, key) => {
    const values = samples.map((sample) => sample.features[key]);
    const average = mean(values);

    accumulator[key] = {
      mean: average,
      stdDev: standardDeviation(values, average),
    };

    return accumulator;
  }, {});

  const normalizedSamples = samples.map((sample) => ({
    label: sample.label,
    vector: featureKeys.map((key) => {
      const stats = featureStats[key];
      return (sample.features[key] - stats.mean) / stats.stdDev;
    }),
  }));

  const labels = [...new Set(samples.map((sample) => sample.label))];
  const centroids = labels.reduce((accumulator, label) => {
    const labelVectors = normalizedSamples
      .filter((sample) => sample.label === label)
      .map((sample) => sample.vector);

    accumulator[label] = featureKeys.map((_, index) =>
      mean(labelVectors.map((vector) => vector[index])),
    );

    return accumulator;
  }, {});

  return {
    featureKeys,
    featureStats,
    centroids,
  };
}

export function predictWithCentroids(model, features) {
  const vector = model.featureKeys.map((key) => {
    const stats = model.featureStats[key];
    return (features[key] - stats.mean) / stats.stdDev;
  });

  const distances = Object.entries(model.centroids).map(([label, centroid]) => ({
    label,
    distance: euclideanDistance(vector, centroid),
  }));

  distances.sort((left, right) => left.distance - right.distance);

  const best = distances[0];
  const secondBest = distances[1] || { distance: best.distance + 1 };
  const certainty = Math.min(
    0.99,
    Math.max(0.51, secondBest.distance / (best.distance + secondBest.distance + 0.001)),
  );

  return {
    label: best.label,
    certainty,
    distances,
    normalizedVector: vector,
  };
}
