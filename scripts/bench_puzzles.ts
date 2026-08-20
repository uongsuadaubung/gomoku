import { generateTacticalScenario } from '../src/game/puzzles/generators/tacticalGenerator';
import { generateFallbackScenario } from '../src/game/puzzles/generators/fallback';
import { PuzzleType, PuzzleDensity } from '../src/game/puzzles/types';

interface BenchResult {
  category: string;
  type: string;
  stars: number;
  runs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
}

function benchmarkCategory(
  type: PuzzleType,
  stars: number,
  density: PuzzleDensity = 'normal',
  iterations: number = 30
): BenchResult {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    generateTacticalScenario({ stars, type, density });
    const t1 = performance.now();
    times.push(t1 - t0);
  }

  times.sort((a, b) => a - b);
  const sum = times.reduce((acc, v) => acc + v, 0);
  const avgMs = sum / times.length;
  const minMs = times[0];
  const maxMs = times[times.length - 1];
  const p95Index = Math.min(Math.floor(times.length * 0.95), times.length - 1);
  const p95Ms = times[p95Index];

  return {
    category: `${type} ${stars}⭐ (${density})`,
    type,
    stars,
    runs: iterations,
    avgMs: Number(avgMs.toFixed(2)),
    minMs: Number(minMs.toFixed(2)),
    maxMs: Number(maxMs.toFixed(2)),
    p95Ms: Number(p95Ms.toFixed(2)),
  };
}

console.log('================================================================');
console.log('        🏁 KIỂM THỬ HIỆU NĂNG TẠO MAP (PUZZLE BENCHMARK)        ');
console.log('================================================================\n');

const results: BenchResult[] = [];

// 1. Benchmark VCF 1⭐ -> 7⭐
console.log('🔹 Đang kiểm thử VCF (1 - 7 sao)...');
for (let s = 1; s <= 7; s++) {
  results.push(benchmarkCategory('VCF', s, 'normal', 30));
}

// 2. Benchmark VCT 1⭐ -> 3⭐
console.log('🔹 Đang kiểm thử VCT (1 - 3 sao)...');
for (let s = 1; s <= 3; s++) {
  results.push(benchmarkCategory('VCT', s, 'normal', 30));
}

// 3. Benchmark DEFENSE 1⭐ -> 2⭐
console.log('🔹 Đang kiểm thử DEFENSE (1 - 2 sao)...');
for (let s = 1; s <= 2; s++) {
  results.push(benchmarkCategory('DEFENSE', s, 'normal', 30));
}

// 4. Benchmark Các Mật Độ (Sparse, Normal, Dense) cho VCF 3⭐
console.log('🔹 Đang kiểm thử mật độ quân (Sparse / Normal / Dense)...');
results.push(benchmarkCategory('VCF', 3, 'sparse', 30));
results.push(benchmarkCategory('VCF', 3, 'dense', 30));

// 5. Benchmark Fallback Scenario riêng
console.log('🔹 Đang kiểm thử Fallback Generator thuần...');
const fallbackTimes: number[] = [];
for (let i = 0; i < 50; i++) {
  const t0 = performance.now();
  generateFallbackScenario(4, 'VCF');
  const t1 = performance.now();
  fallbackTimes.push(t1 - t0);
}
fallbackTimes.sort((a, b) => a - b);
const fbAvg = fallbackTimes.reduce((a, b) => a + b, 0) / fallbackTimes.length;

console.log('\n================================================================');
console.log('                        KẾT QUẢ CHI TIẾT                        ');
console.log('================================================================');
console.table(results.map(r => ({
  'Chế độ': r.category,
  'Số mẫu': r.runs,
  'TB (ms)': `${r.avgMs} ms`,
  'Nhanh nhất': `${r.minMs} ms`,
  'P95 (ms)': `${r.p95Ms} ms`,
  'Chậm nhất': `${r.maxMs} ms`,
})));

console.log(`\n⚡ Fallback Generator (Độ khó 4⭐ VCF): Trung bình ${fbAvg.toFixed(2)} ms (Min: ${fallbackTimes[0].toFixed(2)} ms, Max: ${fallbackTimes[fallbackTimes.length - 1].toFixed(2)} ms)`);

const overallAvg = results.reduce((acc, r) => acc + r.avgMs, 0) / results.length;
console.log(`\n🚀 TỔNG KẾT: Thời gian tạo map trung bình toàn hệ thống: ${overallAvg.toFixed(2)} ms / map!`);
