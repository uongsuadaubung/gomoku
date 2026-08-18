import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectSrc = path.resolve(__dirname, '../src/data/taunts');
const files = ['idleTaunts.ts', 'gameplayTaunts.ts', 'interactionTaunts.ts', 'systemTaunts.ts'];

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, ' ')
    .replace(/\b(nhé|nào|ạ|ơi|đi|nhá|thôi|nhỉ|nhe|ha|nha|đấy|nhĩ|vậy|lắm|thế|ghê)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeWords(s: string): Set<string> {
  const clean = normalizeText(s);
  const words = clean.split(/\s+/).filter(w => w.length > 1);
  return new Set(words);
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

let totalSentences = 0;
let exactDuplicatesCount = 0;
let nearDuplicatesCount = 0;
let botKeywordCount = 0;
const duplicateReport: string[] = [];

for (const fileName of files) {
  const filePath = path.join(projectSrc, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`Không tìm thấy file: ${filePath}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const categoryRegex = /([A-Z0-9_]+):\s*\[([\s\S]*?)\]/g;
  let match;

  while ((match = categoryRegex.exec(content)) !== null) {
    const categoryName = match[1];
    const body = match[2];

    const lines = body
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.startsWith("'") || l.startsWith('"'))
      .map((l: string) => l.replace(/^['"]|['"],?$/g, '').replace(/\\'/g, "'"));

    totalSentences += lines.length;

    // 1. Kiểm tra trùng lặp chính xác
    const exactSet = new Set<string>();
    for (const line of lines) {
      if (exactSet.has(line)) {
        exactDuplicatesCount++;
        duplicateReport.push(`[Trùng chính xác] [${categoryName}] ${line}`);
      }
      exactSet.add(line);

      // Kiểm tra từ khóa bot/gomoku ai (tránh bắt nhầm từ 'ai' tiếng Việt)
      if (/\b(bot|gomoku ai)\b/i.test(line) || /\bAI\b/.test(line)) {
        botKeywordCount++;
        duplicateReport.push(`[Từ khóa Bot/AI] [${categoryName}] ${line}`);
      }
    }

    // 2. Kiểm tra trùng lặp na ná (> 75% tương đồng từ vựng)
    const wordSets: { raw: string; set: Set<string> }[] = [];
    for (const line of lines) {
      const set = normalizeWords(line);
      for (const existing of wordSets) {
        const sim = jaccardSimilarity(set, existing.set);
        if (sim >= 0.75) {
          nearDuplicatesCount++;
          duplicateReport.push(
            `[Trùng na ná (${Math.round(sim * 100)}%)] [${categoryName}]\n  1: "${line}"\n  2: "${existing.raw}"`
          );
          break;
        }
      }
      wordSets.push({ raw: line, set });
    }
  }
}

console.log('==============================================');
console.log('📊 KẾT QUẢ KIỂM TOÁN DỮ LIỆU KHO THOẠI:');
console.log(`- Tổng số câu thoại đã quét: ${totalSentences}`);
console.log(`- Số câu trùng lặp chính xác (100%): ${exactDuplicatesCount}`);
console.log(`- Số câu trùng lặp na ná (>= 75%): ${nearDuplicatesCount}`);
console.log(`- Số câu tự nhận Bot/AI: ${botKeywordCount}`);
console.log('==============================================');

if (duplicateReport.length > 0) {
  console.log('Chi tiết các trường hợp cần xử lý:');
  console.log(duplicateReport.join('\n\n'));
  process.exit(1);
} else {
  console.log('✅ TUYỆT VỜI! 100% CÂU THOẠI ĐỀU ĐỘC NHẤT, KHÔNG TRÙNG LẶP VÀ CHUẨN XƯNG HÔ BẠN - TÔI!');
}
