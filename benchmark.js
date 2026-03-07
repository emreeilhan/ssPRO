import { performance } from 'node:perf_hooks';

const NUM_LAYERS = 10000;
const ITERATIONS = 1000;

// Create mock layers
const layers = Array.from({ length: NUM_LAYERS }, (_, i) => ({
  type: i % 3 === 0 ? 'shape' : i % 3 === 1 ? 'text' : 'mockup',
}));

// Benchmark filter().length
function runFilter() {
  let res = 0;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    res = layers.filter((layer) => layer.type === 'shape').length + 1;
  }
  return performance.now() - start;
}

// Benchmark reduce()
function runReduce() {
  let res = 0;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    res = layers.reduce((acc, layer) => acc + (layer.type === 'shape' ? 1 : 0), 0) + 1;
  }
  return performance.now() - start;
}

// Benchmark for-loop
function runForLoop() {
  let res = 0;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    let count = 0;
    for (const layer of layers) {
      if (layer.type === 'shape') {
        count++;
      }
    }
    res = count + 1;
  }
  return performance.now() - start;
}

// Warmup
runFilter();
runReduce();
runForLoop();

const filterTime = runFilter();
const reduceTime = runReduce();
const forLoopTime = runForLoop();

console.log(`Filter + Length time: ${filterTime.toFixed(2)}ms`);
console.log(`Reduce time: ${reduceTime.toFixed(2)}ms`);
console.log(`For loop time: ${forLoopTime.toFixed(2)}ms`);
