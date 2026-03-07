const { performance } = require('perf_hooks');

const layers = [];
for (let i = 0; i < 10000; i++) {
  layers.push({ type: i === 9999 ? 'image' : 'other' });
}

function test1() {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const lastImageLayer = [...layers].reverse().find((layer) => layer.type === 'image');
  }
  return performance.now() - start;
}

function test2() {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const lastImageLayer = layers.findLast((layer) => layer.type === 'image');
  }
  return performance.now() - start;
}

console.log('Baseline (copy + reverse):', test1(), 'ms');
console.log('Optimized (findLast):', test2(), 'ms');
