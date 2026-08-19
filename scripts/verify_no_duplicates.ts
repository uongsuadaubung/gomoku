import { TAUNT_DATABASE, TAUNT_REGISTRY } from '../src/data/taunts';
import type { TauntEvent } from '../src/data/taunts/types';

// =========================================================================
// 1. CHUẨN HÓA VĂN BẢN & ĐỘ TƯƠNG ĐỒNG JACCARD (NGỮ NGHĨA)
// =========================================================================
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

// =========================================================================
// 2. BỘ LỌC TỪ NGỮ MÁY MÓC & QUÁ TRỊNH TRỌNG / XÃ GIAO HIỀN LÀNH
// =========================================================================
const UNNATURAL_PATTERNS = [
  { regex: /\b(người dùng)\b/i, desc: 'Dùng từ "người dùng" (cần xưng "bạn")' },
  { regex: /\b(quý khách)\b/i, desc: 'Dùng từ "quý khách" (quá thương mại)' },
  { regex: /\b(chúng tôi)\b/i, desc: 'Dùng từ "chúng tôi" (cần xưng "tôi")' },
  { regex: /\b(thuật toán|mã nguồn|database|source code|chương trình|phần mềm|ứng dụng|code|bug|cpu|ram)\b/i, desc: 'Dùng thuật ngữ máy tính khô khan' },
  { regex: /\b(bot|gomoku ai)\b/i, desc: 'Tự nhận mình là Bot' },
  { regex: /\bAI\b/, desc: 'Tự nhận mình là AI' },
  { regex: /\b(tư duy)\b/i, desc: 'Dùng từ "tư duy" (mang tính phán xét cá nhân, cần đổi sang nước cờ / thế trận / toan tính)' },
];

const OVERLY_FORMAL_PATTERNS = [
  { regex: /\b(kính nể|kính trọng|bái phục|ngả mũ thán phục|cúi đầu thán phục)\b/i, desc: 'Quá cung kính / trịnh trọng, mất chất gáy bẩn' },
  { regex: /\b(thiên anh hùng ca|bậc đại trượng phu|phần thưởng cao quý|tấm gương sáng)\b/i, desc: 'Văn vở sách vở / sến súa, mất chất cà khịa' },
  { regex: /\b(hạnh ngộ|thanh tao|thanh tịnh|tri kỷ cờ|an nhiên|tinh khôi)\b/i, desc: 'Văn phong cổ trang / khách sáo quá mức' },
  { regex: /\b(chúc bạn có một ngày|chúc bạn một ngày|chúc bạn luôn giữ|hạnh phúc bên người thân)\b/i, desc: 'Lời chúc xã giao công sở hiền lành, thiếu chất khịa' },
  { regex: /\b(dù thắng hay thua|thắng thua không quan trọng)\b/i, desc: 'An ủi hiền lành, làm mất độ khét của gáy bẩn' },
  { regex: /\b(chia sẻ niềm vui|sẻ chia đam mê|tấm lòng vàng|lan tỏa niềm vui)\b/i, desc: 'Văn phong phong trào / sáo rỗng' },
];

// =========================================================================
// 3. BỘ TỪ ĐIỂN KIỂM TOÁN LỖI CHÍNH TẢ & LỖI GÕ BÀN PHÍM TELEX TOÀN DIỆN
// =========================================================================
const COMPREHENSIVE_SPELLING_RULES = [
  // A. Lỗi gõ Telex dính phím tiếng Việt
  { regex: /\b\w*(ơiơi|ươơ|ââ|ăă|êê|ôô|ơơ|ùù|úú|àà|áá|èè|éé|ìì|íí|òò|óó|đđ)\w*\b/i, desc: 'Lỗi gõ phím Telex lặp nguyên âm/phụ âm tiếng Việt' },

  // B. Lẫn lộn S/X
  { regex: /\bxuất xắc\b/i, correct: 'xuất sắc' },
  { regex: /\bxơ hở\b/i, correct: 'sơ hở' },
  { regex: /\bxơ xuất\b/i, correct: 'sơ suất' },
  { regex: /\bxơ sài\b/i, correct: 'sơ sài' },
  { regex: /\bchuẩn sác\b/i, correct: 'chuẩn xác' },
  { regex: /\bsắp sếp\b/i, correct: 'sắp xếp' },
  { regex: /\bxắp xếp\b/i, correct: 'sắp xếp' },
  { regex: /\bkỹ sảo\b/i, correct: 'kỹ xảo' },
  { regex: /\bxát phạt\b/i, correct: 'sát phạt' },
  { regex: /\bxáng suốt\b/i, correct: 'sáng suốt' },
  { regex: /\bxâu sắc\b/i, correct: 'sâu sắc' },
  { regex: /\bxuy nghĩ\b/i, correct: 'suy nghĩ' },
  { regex: /\bxai lầm\b/i, correct: 'sai lầm' },
  { regex: /\bxụp đổ\b/i, correct: 'sụp đổ' },
  { regex: /\bxập bẫy\b/i, correct: 'sập bẫy' },
  { regex: /\bxo tài\b/i, correct: 'so tài' },
  { regex: /\bxợ hãi\b/i, correct: 'sợ hãi' },
  { regex: /\bxiêu phàm\b/i, correct: 'siêu phàm' },

  // C. Lẫn lộn Ch/Tr
  { regex: /\bchần trừ\b/i, correct: 'chần chừ' },
  { regex: /\btrần trừ\b/i, correct: 'chần chừ' },
  { regex: /\bchầm tư\b/i, correct: 'trầm tư' },
  { regex: /\bchừng phạt\b/i, correct: 'trừng phạt' },
  { regex: /\btriến thắng\b/i, correct: 'chiến thắng' },
  { regex: /\btriêu trò\b/i, correct: 'chiêu trò' },
  { regex: /\bchận đấu\b/i, correct: 'trận đấu' },
  { regex: /\btruỗi\b/i, correct: 'chuỗi' },
  { regex: /\btrớp mắt\b/i, correct: 'chớp mắt' },
  { regex: /\bchò cười\b/i, correct: 'trò cười' },
  { regex: /\bchụ vững\b/i, correct: 'trụ vững' },
  { regex: /\bchốn chạy\b/i, correct: 'trốn chạy' },
  { regex: /\bchua trát\b/i, correct: 'chua chát' },

  // D. Lẫn lộn D/Gi/R
  { regex: /\btranh dành\b/i, correct: 'tranh giành' },
  { regex: /\bdành giật\b/i, correct: 'giành giật' },
  { regex: /\bgiử\b/i, correct: 'giữ' },
  { regex: /\bdử dìn\b/i, correct: 'giữ gìn' },
  { regex: /\bdẫy dụa\b/i, correct: 'giãy giụa' },
  { regex: /\bgiối trá\b/i, correct: 'dối trá' },
  { regex: /\bgiồn ép\b/i, correct: 'dồn ép' },
  { regex: /\brực rở\b/i, correct: 'rực rỡ' },
  { regex: /\bdực dỡ\b/i, correct: 'rực rỡ' },
  { regex: /\bdối dắm\b/i, correct: 'rối rắm' },
  { regex: /\bgiối giắm\b/i, correct: 'rối rắm' },
  { regex: /\bdèn luyện\b/i, correct: 'rèn luyện' },
  { regex: /\bdải hạn\b/i, correct: 'giải hạn' },
  { regex: /\bgiứt khoát\b/i, correct: 'dứt khoát' },

  // E. Lẫn lộn Dấu hỏi (?) và Dấu ngã (~)
  { regex: /\bngỡ ngàn\b/i, correct: 'ngỡ ngàng' },
  { regex: /\bngở ngàng\b/i, correct: 'ngỡ ngàng' },
  { regex: /\bvửng vàng\b/i, correct: 'vững vàng' },
  { regex: /\bbở ngở\b/i, correct: 'bỡ ngỡ' },
  { regex: /\bnổi sợ\b/i, correct: 'nỗi sợ' },
  { regex: /\bnổi đau\b/i, correct: 'nỗi đau' },
  { regex: /\bnổi ám ảnh\b/i, correct: 'nỗi ám ảnh' },
  { regex: /\bnổi buồn\b/i, correct: 'nỗi buồn' },
  { regex: /\bcứu vản\b/i, correct: 'cứu vãn' },
  { regex: /\bdẩn dắt\b/i, correct: 'dẫn dắt' },
  { regex: /\bsữa sai\b/i, correct: 'sửa sai' },
  { regex: /\bkết liểu\b/i, correct: 'kết liễu' },
  { regex: /\btự mản\b/i, correct: 'tự mãn' },
  { regex: /\bsụp đỗ\b/i, correct: 'sụp đổ' },
  { regex: /\bmảnh liệt\b/i, correct: 'mãnh liệt' },
  { regex: /\bngẩm nghỉ\b/i, correct: 'ngẫm nghĩ' },
  { regex: /\bhối hã\b/i, correct: 'hối hả' },

  // F. Lẫn lộn N/NG, T/C, L/N
  { regex: /\bnghiệt ngả\b/i, correct: 'nghiệt ngã' },
  { regex: /\bngơ ngát\b/i, correct: 'ngơ ngác' },
  { regex: /\blúng tún\b/i, correct: 'lúng túng' },
  { regex: /\bbấc lực\b/i, correct: 'bất lực' },
  { regex: /\btâm phụt\b/i, correct: 'tâm phục' },
  { regex: /\bchết tiệc\b/i, correct: 'chết tiệt' },
  { regex: /\bnhụt trí\b/i, correct: 'nhụt chí' },
];

// =========================================================================
// 4. TỪ KHÓA CÀ KHỊA & GÁY BẨN CHUYÊN SÂU THEO TỪNG NGỮ CẢNH
// =========================================================================
const GENERAL_BANTER_KEYWORDS = [
  'cay', 'gáy', 'ngáo', 'troll', 'hành', 'sấp mặt', 'lật kèo', 'nộp mạng',
  'ảo tưởng', 'quê', 'non', 'toang', 'hẹo', 'lụi', 'hú hồn', 'bẻ gãy',
  'mơ', 'vênh', 'đắc ý', 'tự mãn', 'tội nghiệp', 'ngây thơ', 'cháy máy',
  'lì đòn', 'mỏi tay', 'run', 'lúng túng', 'bối rối', 'ấm ức', 'mất ngủ',
  'tổ tiên', 'cười một mình', 'lấy le', 'trùm', 'hạ hỏa', 'vẹo cột sống',
  'chớp mắt', 'hên', 'cúng', 'ăn may', 'bắt bài', 'bẫy', 'sập bẫy',
  'tự hủy', 'hề hước', 'diễn hài', 'mù mắt', 'đi vào lòng đất', 'con gà',
  'khóc', 'cười', 'nước mắt', 'bó tay', 'chịu bạn', 'chán', 'ngáp', 'ngủ',
  'chọc', 'run tay', 'do dự', 'ngập ngừng', 'phong thủy', 'né', 'sợ',
  'đứng hình', 'bóp', 'phế', 'uống trà', 'hoa mắt', 'trắng đêm', 'cú đêm',
  'thâu đêm', 'tập thể dục', 'kết liễu', 'dồn ép', 'hạ gục', 'mù quáng',
  'bế tắc', 'tuyệt vọng', 'phục thù', 'gỡ gạc', 'ngon thì', 'dám', 'cứ tự nhiên',
  'ăn cơm', 'cơm trưa', 'chan nước mắt', 'nuốt không trôi', 'sáng sớm', 'cuối tuần',
  'cà phê', 'ngủ gật', 'deadline', 'mất mặt', 'muối mặt', 'bẽ bàng', 'đỡ đạn',
  'song tứ', 'tứ tử', 'ngã ba', 'chữ t', 'tia chớp', 'zic-zắc', 'góc chết',
  'so le', 'đan len', '13', 'xui xẻo', 'bản án', 'nghĩ lâu', 'ngâm cờ', 'chớp nhoáng',
  'đáy xã hội', 'bại trận', 'bại tướng', 'cửa thắng', 'buông xuôi', 'xả giận', 'thất bại',
  'bất lực', 'cứu', 'phao', 'rời tab', 'đóng tab', 'chuồn', 'hoảng loạn', 'đau lòng',
  'sát phạt', 'phá nát', 'cú sốc', 'quyết tâm', 'tiếc', 'ngầu', 'rối rắm', 'nghịch ngợm',
  'vô nghĩa', 'bất an', 'nôn nóng', 'sụp đổ', 'bất phân',
];

const EVENT_CONTEXT_KEYWORDS: Partial<Record<TauntEvent, string[]>> = {
  CLICK_OCCUPIED_CELL: ['mắt', 'nhìn', 'đè', 'chồng', 'cướp', 'kính', 'chủ', 'chen', 'nhầm', 'ô', 'chiếm'],
  BLUNDER_MOVE: ['tự hủy', 'ngáo', 'diễn hài', 'mù', 'biếu', 'quà', 'lòng đất', 'mổ thóc', 'dâng', 'hề'],
  IDLE_THINKING: ['ngâm', 'lâu', 'thời gian', 'râu', 'ngủ', 'đơ', 'não', 'đông cứng', 'trà', 'đợi', 'chờ'],
  IDLE_IN_GAME: ['ngâm', 'lâu', 'thời gian', 'nồi cơm', 'ngủ', 'đơ', 'não', 'chờ', 'đợi', 'bất động'],
  SUPER_SLOW_MOVE: ['rùa', 'chậm', 'sên', 'thế kỷ', 'ngâm', 'lâu', 'mọc râu', 'ngủ gật', 'chờ'],
  LATE_NIGHT_PLAY: ['đêm', 'khuya', 'sáng', 'ngủ', 'cú đêm', 'trằn trọc', 'canh', 'mất ngủ', 'ấm ức'],
  PLAYER_UNDO: ['đi lại', 'hối', 'lùi', 'undo', 'quay lại', 'xóa', 'sửa', 'thể dục', 'ngón tay'],
  MULTI_UNDO: ['đi lại', 'hối', 'lùi', 'liên tục', 'undo', 'tập thể dục', 'ngón tay', 'mòn'],
  BOT_WIN: ['thua', 'thắng', 'cay', 'gáy', 'an ủi', 'khóc', 'tiễn', 'bảng vàng', 'đẳng cấp'],
  STREAK_LOSS: ['chuỗi', 'thua', 'cúp', 'lì đòn', 'kỷ lục', 'liên tiếp', 'ăn hành', 'giải hạn'],
  SPEED_WIN_QUICK: ['chớp mắt', 'nhanh', 'thần tốc', 'sấm sét', 'vội', '10 nước', 'kỷ lục'],
  PLAYER_WIN_WITH_UNDO: ['undo', 'lần', 'cứu', 'hối', 'lùi', 'phao', 'bấm', 'vênh', 'thời gian'],
  BOT_WIN_LEADING_SCORE: ['tỷ số', 'điểm', 'dẫn trước', 'khoảng cách', 'thắng', 'bảng', 'đẳng cấp'],
  MISSED_WINNING_MOVE: ['bỏ lỡ', 'thắng', 'cơm', 'miệng', 'mù', 'vũ trụ', 'cúp', 'nhường', 'tấu hài', 'né'],
  BLOCK_WRONG_END: ['bịt', 'chặn', 'đầu', 'cửa', 'nhầm', 'mở toang', 'nối 4', 'thắng', 'hài hước'],
  TURTLE_DEFENSE: ['boongke', 'rùa', 'rụt cổ', 'thủ', 'quây', 'bê tông', 'bu', 'sợ', 'chống bom', 'khối'],
  ISOLATED_FAR_MOVE: ['đảo hoang', 'du lịch', 'xa', 'lạc', 'cô đơn', 'hoàng hôn', 'cắm cờ', 'vũ trụ', 'dưỡng sinh'],
  HESITATION_DANCE: ['rê chuột', 'múa quạt', 'múa', 'kiến bò', 'chảo lửa', 'do dự', 'ngập ngừng', 'run', 'phong thủy', 'hoảng loạn'],
  RAGE_DOWNGRADE_AFTER_LOSS: ['hạ cấp', 'cấp 1', 'bắt nạt', 'mầm non', 'cay cú', 'tự ái', 'chạy trốn', 'sợ', 'yếu đuối'],
  DESPERATE_THEME_SWAP: ['theme', 'màu', 'bàn cờ', 'phong thủy', 'vận đen', 'thay áo', 'gỗ', 'ngọc', 'cyber', 'xả xui'],
  ACCIDENTAL_SELF_BLOCK: ['tự chặn', 'tự bóp', 'đồng đội', 'đường sống', 'khóc thét', 'bịt', 'phá', 'tự hủy'],
  DEAD_FOUR_BLOCKED: ['4 quân', 'bịt kín', '2 đầu', 'khúc gỗ', 'cụt', 'chết', 'bất lực', 'vô dụng'],
  SURRENDER_ON_THREAT: ['đầu hàng', 'rút kiếm', 'quỳ gối', 'xin tha', 'tháo chạy', 'bẫy', 'chạy trốn', 'sợ'],
  STARE_AT_WIN_LINE: ['ngắm', '5 quân', 'đứng hình', 'bất động', 'đường line', 'chiêm ngưỡng', 'tượng', 'sáng rực'],
  IMMEDIATE_REVENGE_CLICK: ['bấm ván mới', 'nhanh', 'mắt cay', 'phục thù', 'máu nóng', 'tái đấu', 'nóng vội'],
  UNDO_BEFORE_AI_MOVES: ['undo', 'rút', 'đặt xuống', 'giật mình', 'hối hận', 'tay nhanh', 'than hồng', 'chớp mắt'],
  SOUND_SPAM_TOGGLE: ['âm thanh', 'loa', 'dj', 'quẩy', 'bật tắt', 'nút', 'mute', 'spam'],
  FORK_ATTACK_DEFENSE_FAIL: ['nĩa đôi', 'bẫy 4-3', 'chặn nhầm', 'tử huyệt', 'hoa mắt', 'toang', 'hai đầu', 'giao điểm'],
  CLOSE_COMBAT_HUG: ['ôm sát', 'bám đuôi', 'đỉa', 'dính', 'sát sạt', 'yêu', 'theo đuôi', 'kèm'],
  SPLIT_BOARD_EXPEDITION: ['bán cầu', 'chi nhánh', 'xa xôi', 'thám hiểm', 'hai đầu', 'đối diện', 'du lịch', 'vũ trụ'],
  TRIANGLE_FORMATION: ['tam giác', 'cờ vây', 'vây đất', 'nhầm game', 'khoanh vùng', '3 quân', 'bo góc'],
  CLEAN_SWEEP_DOMINATION: ['nuốt trọn', 'áp đảo', 'không kịp thở', 'out trình', 'đỉnh', 'hack', 'bất khả chiến bại', 'sốc'],
  IRON_CURTAIN_WIN: ['bê tông', 'cốt thép', 'lì đòn', 'tử thủ', 'phòng ngự', 'kiên trì', 'hết pin', 'dai'],  LUNCH_BREAK_RUSH: ['cơm trưa', 'nghỉ trưa', 'chan nước mắt', 'nghẹn', 'hành', 'công sở', 'nuốt không trôi', 'nộp mạng'],
  EARLY_MORNING_COFFEE: ['cà phê', 'sáng sớm', 'mở bát', 'tỉnh ngủ', 'ngái ngủ', 'ăn hành', 'ngã ngựa', 'đắng'],
  WEEKEND_CHILL: ['cuối tuần', 'thứ bảy', 'chủ nhật', 'rảnh rỗi', 'marathon', 'người yêu', 'ăn hành', 'guinness'],
  T_SHAPE_FORMATION: ['chữ t', 'ngã ba', 'biển báo', 'giao thông', 'vuông góc', 'hai nhánh', 'cột cờ'],
  ZIGZAG_LIGHTNING: ['zic-zắc', 'tia chớp', 'uốn lượn', 'con rắn', 'mê cung', 'sấm sét', 'lượn lách'],
  DOUBLE_DEAD_FOUR: ['song tứ', 'tứ tử', 'bịt kín', '4 đầu', 'chết cứng', 'khúc gỗ', 'vô vọng'],
  CORNER_DEATH_TRAP: ['góc chết', 'góc tường', '3x3', 'nhốt', 'cá nằm trên thớt', 'dồn ép', 'chân tường'],
  CHECKERBOARD_WEAVE: ['so le', 'đan len', 'xen kẽ', 'bàn cờ vua', 'dệt vải', 'cài răng lược', 'hoa văn'],
  OVERTHINKING_BLUNDER: ['vắt óc', 'nghĩ lâu', 'ngâm cờ', 'đi vào lòng đất', 'quá tải', 'tự bóp', 'gia cát lượng'],
  ONE_MINUTE_BULLET_WIN: ['1 phút', 'chưa đầy 1 phút', '60 giây', 'tốc độ ánh sáng', 'mì ăn liền', 'chớp nhoáng'],
  UNLUCKY_THIRTEEN_MOVES: ['13', 'nước thứ 13', 'con số 13', 'xui xẻo', 'oan nghiệt', 'bản án', 'lời nguyền'],
  SPEED_REVENGE_FAIL: ['phục thù', '1 giây', 'tái đấu', 'tức thì', 'rửa hận', 'nộp mạng', 'gấp đôi'],
  WIN_RATE_DROP_BELOW_50: ['tỷ lệ thắng', 'winrate', '50%', 'thủng đáy', 'tụt dốc', 'cắm mỏ', 'rơi tự do', 'bại tướng', 'biểu đồ', 'phong độ', 'sụt giảm', 'gãy cánh', 'cổ phiếu', 'ngân hàng'],
  PERFECT_CENTURY_GAMES: ['100', 'thế kỷ', 'tròn', 'cột mốc', 'kỷ lục', 'chịu đòn', 'bền bỉ', 'khách hàng', 'lì lợm'],
  MONDAY_BLUES: ['thứ hai', 'đầu tuần', 'tuần mới', 'sáng sớm', 'cà phê', 'trừ lương', 'họp', 'u ám'],
  TGIF_FRIDAY_AFTERNOON: ['thứ sáu', 'tan làm', 'cuối tuần', 'cuối ngày', 'quẩy', 'bia', 'hạ màn', 'nhậu', 'về sớm', 'công sở', 'tuần làm việc'],
  AFTERNOON_FOOD_COMA: ['căng da bụng', 'chùng da mắt', 'buồn ngủ', 'mộng du', 'gà gật', 'lim dim', 'bữa trưa', 'uể oải'],
  MIDNIGHT_BATTERY_LOW: ['3h sáng', '2h sáng', 'nửa đêm', 'cú đêm', 'pin', 'thâm mắt', 'gấu trúc', 'mất ngủ'],
  POKE_BOT: ['chọc', 'bấm', 'avatar', 'mặt', 'ngứa', 'cù', 'đụng', 'chạm', 'tay chân'],
  SPAM_POKE_BOT: ['spam', 'chọc liên tục', 'bấm lia lịa', 'nát chuột', 'cuồng', 'dừng lại'],
  THEME_CHANGE: ['theme', 'màu', 'giao diện', 'gỗ', 'giấy', 'ngọc', 'cyber', 'slate', 'phong thủy', 'áo mới', 'bàn cờ', 'màu sắc', 'phông nền'],
  BOARD_STYLE_CHANGE: ['chế độ', 'giữa ô', 'giao điểm', 'đường kẻ', 'bàn cờ'],
  SOUND_MUTE: ['tắt tiếng', 'mute', 'im lặng', 'điếc', 'âm thanh', 'loa', 'ồn ào'],
  SOUND_UNMUTE: ['bật tiếng', 'unmute', 'âm thanh', 'loa', 'nghe', 'nhạc'],
  TOGGLE_STEP_NUMBERS: ['số thứ tự', 'bật số', 'tắt số', 'đếm', 'bước đi', 'nước đi', 'đánh số', 'dãy số', 'con số', 'số bước', 'bảng cửu chương', 'số 0', 'hiển thị số'],
  OPEN_STATS: ['thống kê', 'tỷ lệ thắng', 'bảng vàng', 'thành tích', 'soi', 'xem lại'],
  RESET_STATS: ['reset', 'xóa', 'về 0', 'tẩy trắng', 'làm lại từ đầu', 'quên đi'],
  OPEN_RULES: ['luật', 'đọc luật', 'sách', '5 quân', 'phạm quy', 'học luật', 'cấp tốc'],
  OPEN_BOT_MODAL: ['cấp độ', 'level', 'độ khó', 'bot', 'thông tin', 'nghiên cứu', 'soi'],
  CHANGE_BOT_LEVEL_UP: ['tăng cấp', 'tăng độ khó', 'thử thách', 'mạnh hơn', 'tự tin', 'liều'],
  CHANGE_BOT_LEVEL_DOWN: ['hạ cấp', 'giảm độ khó', 'sợ', 'dễ hơn', 'bắt nạt', 'yếu'],
  TAB_BLUR: ['chuyển tab', 'bỏ rơi', 'trốn', 'lướt web', 'tab khác', 'quay lại'],
  TAB_FOCUS: ['quay lại', 'trở lại', 'tiếp tục', 'sẵn sàng', 'tab này', 'tra cứu', 'thực tế', 'thực tại', 'chatgpt', 'hướng dẫn', 'thực chiến', 'cứu vãn', 'sống sót', 'chiêu mới', 'rửa mặt', 'gia đình', 'trợ giúp', 'học lỏm', 'bàn đấu', 'đáp án', 'bàn cờ'],
  GAME_START: ['bắt đầu', 'khai cuộc', 'trận đấu', 'vào trận', 'so tài', 'chiến'],
  PLAYER_GOOD_MOVE: ['nước hay', 'đẹp mắt', 'sắc bén', 'nguy hiểm', 'bất ngờ', 'phản công'],
  BREAK_LOSS_STREAK: ['ngắt chuỗi', 'thắng lại', 'ăn may', 'hên', 'thoát nạn', 'rùa'],
  LEVEL_UP_ALERT: ['thăng cấp', 'lên cấp', 'mở khóa', 'đẳng cấp', 'chúc mừng'],
  CLICK_BEFORE_START: ['chưa bấm', 'bắt đầu', 'vội vàng', 'hấp tấp', 'nhấp chuột'],
  CLICK_AFTER_GAME_OVER: ['hết trận', 'ván mới', 'kết thúc', 'bấm chi', 'thua rồi'],
  LONG_HOVER_CELL: ['ngắm', 'hover', 'rê chuột', 'do dự', 'đắn đo', 'soi'],
  MARATHON_SERIES: ['10 ván', 'marathon', 'kiên trì', 'cày cuốc', 'liên tục'],
  GOD_LEVEL_VICTORY: ['thần thánh', 'level 5', 'cao nhất', 'thắng bot', 'xuất thần'],
  GAME_DRAW: ['hòa', 'bất phân', 'kịch tính', 'hết ô', 'bắt tay'],
  CONSECUTIVE_DRAWS: ['hòa liên tiếp', '2 ván hòa', 'cù cưa', 'ngang tài'],
  TIT_FOR_TAT_DRAWS: ['3 ván hòa', 'thi gan', 'bất phân thắng bại', 'dây dưa'],
  PLAYER_RESIGN: ['đầu hàng', 'nhận thua', 'buông kiếm', 'xin hàng', 'chào thua'],
  COMEBACK_WIN: ['lội ngược dòng', 'lật kèo', 'thần kỳ', 'thoát hiểm', 'ngược dòng'],
  NO_UNDO_WIN: ['quân tử', 'không undo', 'sạch sẽ', 'thực lực', 'chính trực'],
  CLUTCH_100_STONES: ['100 quân', 'kỷ lục', 'kín bàn', 'căng thẳng', 'dày đặc'],
  COPYCAT_MOVE: ['bắt chước', 'sao chép', 'đối xứng', 'copy', 'gương'],
  BOX_SURROUND_CENTER: ['hộp', 'bao vây', 'khung', 'vây bắt', 'trung tâm'],
  FULL_DIAGONAL_HIGHWAY: ['đường chéo', 'cao tốc', 'xuyên bàn', 'nối dài', 'dài thượt'],
  DIAGONAL_CROSS_FORMATION: ['chữ x', 'giao nhau', 'đường chéo', 'tâm', 'chữ thập chéo'],
  FOUR_THREE_DOUBLE_ATTACK: ['4-3', 'tứ tam', 'đòn kép', 'hai đầu', 'sát cục'],
  OPEN_FOUR_BLUNDER: ['4 mở', 'hai đầu', 'bỏ sót', 'mù', 'thua'],
  CENTER_MOVE: ['thiên nguyên', 'trung tâm', '7,7', 'khai cuộc', 'giữa bàn'],
  CORNER_MOVE: ['góc', 'dạt góc', '0,0', '14,14', 'biên'],
  EDGE_WALK_MOVE: ['mép', 'dạt biên', 'mép bàn', 'ngoài rìa', 'bờ tường'],
  DOUBLE_THREE_TRAP: ['3-3', 'tam tam', 'bẫy đôi', 'hai mũi', 'tấn công'],
  JUMP_THREE_TRAP: ['nhảy 3', 'nhảy cách', 'cách quãng', 'hiểm', 'bẫy'],
  FAST_MOVE_TAUNT: ['quá nhanh', 'chưa nghĩ', 'vội', 'hấp tấp', 'bấm bừa'],
  RUSH_MOVE: ['thần tốc', 'chớp nhoáng', 'nhanh như chớp', 'không suy nghĩ'],
  LONG_GAME: ['40 nước', 'kéo dài', 'dai dẳng', 'căng thẳng', 'mệt mỏi'],
  BOT_BLOCK_THREAT: ['chặn đứng', 'bịt', 'phòng thủ', 'bẻ gãy', 'dập tắt'],
  BOT_TRAP: ['bẫy', 'sát cục', 'vcf', 'tử thần', 'không đỡ nổi'],
  SWAP_SIDE_BOT_FIRST: ['nhường đi trước', 'quân trắng', 'bot đi trước', 'tự tin'],
  SWAP_SIDE_PLAYER_FIRST: ['quân đen', 'đi trước', 'tiên thủ', 'giành quyền'],
  CTRL_Z_SHORTCUT_ATTEMPT: ['ctrl+z', 'phím tắt', 'undo', 'lùi lại', 'nhanh tay'],
  DEVTOOLS_INSPECT_HACK: ['f12', 'devtools', 'inspect', 'mã nguồn', 'soi code'],
  SCREENSHOT_ATTEMPT: ['chụp màn hình', 'printscreen', 'lưu kỷ niệm', 'khoe', 'bằng chứng'],
  SPACEBAR_SMASH: ['spacebar', 'đập phím', 'dấu cách', 'sốt ruột', 'gõ mạnh'],
  WHEEL_ZOOM_ATTEMPT: ['cuộn chuột', 'zoom', 'phóng to', 'thu nhỏ', 'con lăn'],
  DOUBLE_CLICK_STONE: ['nhấp đúp', 'double click', 'hai lần', 'quân cờ', 'bấm mạnh'],
  RAGE_QUIT_F5_RELOAD: ['f5', 'reload', 'tải lại', 'rage quit', 'trốn chạy', 'thua'],
  COPY_TAUNT_TEXT: ['copy', 'sao chép', 'bôi đen', 'lời thoại', 'câu gáy', 'học thuộc'],
  HOVER_UNDO_HESITATION: ['rê chuột', 'ngập ngừng', 'undo', 'do dự', 'rút tay', 'xấu hổ', 'đấu tranh', 'đi lại'],
  RESIGN_WHILE_AI_THINKING: ['đầu hàng', 'đang tính', 'suy nghĩ', 'kết liễu', 'vội vàng', 'sát cục', 'tiết kiệm'],
  CLICK_OWN_STONE: ['quân cờ', 'chính mình', 'nhấc quân', 'cờ tướng', 'bấm nhầm', 'quân mình', 'vô thức'],
  MOUSE_LEAVE_VIEWPORT: ['buông chuột', 'ngả lưng', 'màn hình', 'khoanh tay', 'rời khỏi', 'đại kiện tướng', 'uống nước'],
  RAPID_THEME_CYCLING: ['thời trang', 'thử theme', 'đổi màu', 'gỗ', 'giấy', 'ngọc', 'cyber', 'slate', 'liên tục'],
  SWITCH_BOARD_STYLE_MID_GAME: ['đổi chế độ', 'giữa ô', 'giao điểm', 'đường kẻ', 'hoa mắt', 'giữa trận', 'bàn cờ'],
};

const RHETORICAL_QUESTION_REGEX = /(à|hả|chứ|hay gì|sao|đúng không|phải không|nhỉ|cơ à|thế à|đâu|sao nổi)\s*\?*$/i;

const SASSY_PARTICLES = [
  'cơ đấy', 'đấy nhé', 'đấy', 'nhé', 'nha', 'thôi', 'ghê', 'lắm đấy',
  'xem nào', 'nhỉ', 'nhá', 'nhen', 'nào', 'chứ gì', 'hay sao', 'kìa',
  'ủa alo', 'ơ kìa', 'ôi trời', 'trời ơi', 'buồn cười', 'hả dạ',
];

const SARCASTIC_PATTERNS = [
  /tưởng.*(ai dè|mà|hóa ra|thế nào)/i,
  /chưa kịp.*đã/i,
  /thắng.*(có một ván|mà|vài ván)/i,
  /đánh.*(như|kiểu)/i,
  /ngắm.*(mãi|có)/i,
  /rê chuột.*(mãi|nãy giờ)/i,
];

// =========================================================================
// 5. THUẬT TOÁN ĐO ĐỘ CÀ KHỊA & PHÂN TẦNG SÁT THƯƠNG (SPICINESS)
// =========================================================================
interface SentenceAnalysis {
  line: string;
  score: number;
  spiceLevel: 1 | 2 | 3;
}

function analyzeSentenceBanter(line: string, eventName: TauntEvent): SentenceAnalysis {
  let score = 0;
  const lower = line.toLowerCase();

  // A. Điểm từ vựng khịa chung
  let generalHits = 0;
  for (const kw of GENERAL_BANTER_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) {
      generalHits++;
      score += 1.5;
      if (generalHits >= 3) break;
    }
  }

  // B. Điểm ngữ cảnh riêng biệt của sự kiện (Context Match)
  const contextList = EVENT_CONTEXT_KEYWORDS[eventName];
  if (contextList) {
    for (const ckw of contextList) {
      if (lower.includes(ckw)) {
        score += 1.0;
        break;
      }
    }
  }

  // C. Câu hỏi tu từ châm chọc
  if (RHETORICAL_QUESTION_REGEX.test(line)) {
    score += 1.2;
  }

  // D. Trợ từ cảm thán / đuôi khịa
  for (const part of SASSY_PARTICLES) {
    if (lower.includes(part)) {
      score += 0.8;
      break;
    }
  }

  // E. Mẫu so sánh châm biếm
  for (const pat of SARCASTIC_PATTERNS) {
    if (pat.test(lower)) {
      score += 1.2;
      break;
    }
  }

  // F. Dấu biểu cảm
  if (line.includes('!') || line.includes('?')) {
    score += 0.5;
  }

  const finalScore = Math.round(score * 10) / 10;
  let spiceLevel: 1 | 2 | 3 = 1;
  if (finalScore >= 3.5) {
    spiceLevel = 3;
  } else if (finalScore >= 2.0) {
    spiceLevel = 2;
  } else {
    spiceLevel = 1;
  }

  return { line, score: finalScore, spiceLevel };
}

// =========================================================================
// 6. THUẬT TOÁN PHÁT HIỆN LẶP KHUÔN MẪU CÂU (CLICHÉ / FORMULAIC DENSITY)
// =========================================================================
function extractStarterPrefix(line: string): string {
  return line.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase();
}

function checkPatternDiversity(lines: string[]): { prefix: string; percentage: number } | null {
  const starterCounts: Record<string, number> = {};
  for (const line of lines) {
    const starter = extractStarterPrefix(line);
    starterCounts[starter] = (starterCounts[starter] || 0) + 1;
  }

  for (const [prefix, count] of Object.entries(starterCounts)) {
    const ratio = count / lines.length;
    if (ratio > 0.20 && count >= 10) {
      return { prefix, percentage: Math.round(ratio * 100) };
    }
  }
  return null;
}

// =========================================================================
// 7. TIẾN TRÌNH KIỂM TOÁN CHÍNH TOÀN BỘ KHO THOẠI
// =========================================================================
const MIN_SENTENCES_REQUIRED = 120;

let totalSentences = 0;
let exactDuplicatesCount = 0;
let nearDuplicatesCount = 0;
let unnaturalWordCount = 0;
let overlyFormalCount = 0;
let spellingErrorCount = 0;
let underThresholdCount = 0;
let blandSentencesCount = 0;
let templateClichéCount = 0;
let totalBanterScore = 0;

let spice1Count = 0;
let spice2Count = 0;
let spice3Count = 0;

const issuesReport: string[] = [];

console.log('\n========================================================================================');
console.log('🛡️  TIẾN TRÌNH KIỂM TOÁN NÂNG CAO CHẤT LƯỢNG KHO THOẠI (ADVANCED TAUNT AUDITOR)');
console.log('========================================================================================\n');

for (const [categoryName, lines] of Object.entries(TAUNT_DATABASE)) {
  const eventName = categoryName as TauntEvent;
  totalSentences += lines.length;

  // A. Kiểm tra số lượng tối thiểu >= 100 câu
  if (!lines || lines.length < MIN_SENTENCES_REQUIRED) {
    underThresholdCount++;
    const currentCount = lines ? lines.length : 0;
    issuesReport.push(
      `🔴 [DƯỚI ĐỊNH MỨC TỐI THIỂU] [${eventName}]: Hiện chỉ có ${currentCount} câu (Yêu cầu tối thiểu ${MIN_SENTENCES_REQUIRED} câu, thiếu ${MIN_SENTENCES_REQUIRED - currentCount} câu)`
    );
  }

  // B. Kiểm tra mật độ lặp khuôn mẫu câu (Pattern Diversity)
  const patternIssue = checkPatternDiversity(lines);
  if (patternIssue) {
    templateClichéCount++;
    issuesReport.push(
      `⚠️ [Lặp khuôn mẫu câu (${patternIssue.percentage}%)] [${eventName}]: Quá nhiều câu bắt đầu bằng "${patternIssue.prefix}..."`
    );
  }

  // C. Kiểm tra trùng lặp & phong cách & chính tả & chỉ số cà khịa
  const exactSet = new Set<string>();
  for (const line of lines) {
    // 1. Trùng chính xác 100%
    if (exactSet.has(line)) {
      exactDuplicatesCount++;
      issuesReport.push(`🔴 [Trùng chính xác 100%] [${eventName}]: "${line}"`);
    }
    exactSet.add(line);

    // 2. Từ ngữ xưng hô máy móc
    for (const pat of UNNATURAL_PATTERNS) {
      if (pat.regex.test(line)) {
        unnaturalWordCount++;
        issuesReport.push(`⚠️ [Xưng hô máy móc: ${pat.desc}] [${eventName}]: "${line}"`);
      }
    }

    // 3. Từ ngữ quá trịnh trọng / sách vở / sến súa / lời chúc xã giao
    for (const formal of OVERLY_FORMAL_PATTERNS) {
      if (formal.regex.test(line)) {
        overlyFormalCount++;
        issuesReport.push(`⚠️ [Quá trịnh trọng / Sến: ${formal.desc}] [${eventName}]: "${line}"`);
      }
    }

    // 4. Lỗi chính tả tiếng Việt & Lỗi gõ Telex chuyên sâu
    for (const spell of COMPREHENSIVE_SPELLING_RULES) {
      if (spell.regex.test(line)) {
        spellingErrorCount++;
        const hint = spell.correct ? `Nên đổi -> ${spell.correct}` : (spell.desc || 'Lỗi chính tả');
        issuesReport.push(`⚠️ [Lỗi chính tả (${hint})] [${eventName}]: "${line}"`);
      }
    }

    // 5. Đánh giá Chỉ số Cà khịa (Banter Score & Spiciness)
    const analysis = analyzeSentenceBanter(line, eventName);
    totalBanterScore += analysis.score;

    if (analysis.spiceLevel === 3) spice3Count++;
    else if (analysis.spiceLevel === 2) spice2Count++;
    else spice1Count++;

    if (analysis.score <= 0.0) {
      blandSentencesCount++;
      issuesReport.push(
        `⚠️ [Thiếu chất Cà khịa (Điểm: ${analysis.score}⭐)] [${eventName}]: "${line}"`
      );
    }
  }

  // D. Kiểm tra trùng lặp na ná (> 75% tương đồng từ vựng)
  const wordSets: { raw: string; set: Set<string> }[] = [];
  for (const line of lines) {
    const set = normalizeWords(line);
    for (const existing of wordSets) {
      const sim = jaccardSimilarity(set, existing.set);
      if (sim >= 0.75) {
        nearDuplicatesCount++;
        issuesReport.push(
          `⚠️ [Trùng na ná (${Math.round(sim * 100)}%)] [${eventName}]\n   1: "${line}"\n   2: "${existing.raw}"`
        );
        break;
      }
    }
    wordSets.push({ raw: line, set });
  }
}

const avgBanterScore = (totalBanterScore / totalSentences).toFixed(2);

console.log('========================================================================================');
console.log('📊 KẾT QUẢ KIỂM TOÁN NÂNG CAO TOÀN DIỆN:');
console.log('========================================================================================');
console.log(`- 🌟 Tổng số sự kiện đã quét        : ${Object.keys(TAUNT_DATABASE).length} sự kiện`);
console.log(`- 🔥 Tổng số câu thoại đã quét      : ${totalSentences.toLocaleString()} câu`);
console.log(`- 🎯 Sự kiện dưới ${MIN_SENTENCES_REQUIRED} câu           : ${underThresholdCount} sự kiện`);
console.log(`- 🌶️  Chỉ số Cà khịa trung bình      : ${avgBanterScore} / 5.0 ⭐`);
console.log(`  ├─ 🌶️🌶️🌶️ Gáy khét lẹt (Level 3)  : ${spice3Count.toLocaleString()} câu (${((spice3Count / totalSentences) * 100).toFixed(1)}%)`);
console.log(`  ├─ 🌶️🌶️ Cà khịa sâu cay (Level 2) : ${spice2Count.toLocaleString()} câu (${((spice2Count / totalSentences) * 100).toFixed(1)}%)`);
console.log(`  └─ 🌶️  Hóm hỉnh, trêu đùa (Level 1): ${spice1Count.toLocaleString()} câu (${((spice1Count / totalSentences) * 100).toFixed(1)}%)`);
console.log(`- 🚫 Số câu trùng lặp chính xác (100%): ${exactDuplicatesCount}`);
console.log(`- 🚫 Số câu trùng lặp na ná (>= 75%) : ${nearDuplicatesCount}`);
console.log(`- 🚫 Cảnh báo lặp khuôn mẫu câu (>20%): ${templateClichéCount}`);
console.log(`- 🚫 Số câu xưng hô máy móc / Robot  : ${unnaturalWordCount}`);
console.log(`- 🚫 Số câu quá trịnh trọng / Sến súa: ${overlyFormalCount}`);
console.log(`- 🚫 Số câu nhạt nhẽo / Thiếu khịa   : ${blandSentencesCount}`);
console.log(`- 🚫 Số câu phát hiện lỗi chính tả   : ${spellingErrorCount}`);
console.log('========================================================================================\n');

if (issuesReport.length > 0) {
  console.error('❌ PHÁT HIỆN CÁC VẤN ĐỀ CẦN XỬ LÝ:');
  console.error(issuesReport.join('\n\n'));
  process.exit(1);
} else {
  console.log('✅ HOÀN HẢO! 100% CÂU THOẠI ĐẠT CHUẨN TỰ NHIÊN, KHÔNG LỖI CHÍNH TẢ, KHÔNG LẶP KHUÔN MẪU VÀ ĐẠT ĐỘ GÁY BẨN / CÀ KHỊA TỐI ĐA!');
}
