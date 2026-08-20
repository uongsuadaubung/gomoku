# 🎓 TÀI LIỆU TOÀN DIỆN VỀ HỆ THỐNG GIA SƯ GOMO (TUTOR SYSTEM)

---

## 📌 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

**Chế Độ Gia Sư (Tutor Mode / Học Viện Ca-Rô)** là tính năng huấn luyện cờ thông minh với người bạn đồng hành **Gia Sư Gomo** theo sát từng nước đi của bạn trong ván đấu.

### Mục tiêu cốt lõi:
1. **Hướng dẫn chiến thuật theo thời gian thực (Real-time Mentoring)**: Phân tích bàn cờ ở độ sâu AI tối ưu và đưa ra gợi ý, cảnh báo trước khi người chơi đặt quân.
2. **Chấm điểm & Giải thích sau nước đi (Post-move Feedback)**: Nhận diện thành tích chiến thuật của người chơi (tạo hàng 4, mở thế 3, gài bẫy đôi 4-3/3-3, cứu nguy khẩn cấp) và đưa ra phản hồi mang tính giáo dục sâu sắc.
3. **Hiệu năng 60 FPS tuyệt đối**: Tách rời toàn bộ thuật toán tính toán nặng sang **Web Worker ngầm**, giữ cho luồng giao diện (Main UI Thread) luôn mượt mà.

---

## 🏗️ 2. KIẾN TRÚC HỆ THỐNG & ĐA LUỒNG (ARCHITECTURE & THREADING)

Hệ thống Gia sư được xây dựng theo mô hình **Đa luồng phản ứng (Reactive Multi-threaded Model)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MAIN THREAD (GIAO DIỆN UI)                        │
│                                                                             │
│   ┌────────────────────┐      ┌─────────────────┐     ┌─────────────────┐   │
│   │ TutorCompanion.tsx │ ◄──► │  tutorSlice.ts  │ ◄─► │TutorStrategy.ts │   │
│   │ (Avatar & Speech)  │      │ (Reactive State)│     │(Strategy Pattern│   │
│   └────────────────────┘      └────────┬────────┘     └─────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────┘
                                         │ PostMessage (requestId)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEDICATED WORKER (tutor.worker.ts)                       │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ TutorEngine.analyzePreMove (AI Level 12 - Minimax + VCF + VCT)      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Các thành phần chính:

| File / Module | Trách nhiệm |
| :--- | :--- |
| **`src/workers/tutor.worker.ts`** | Web Worker chạy độc lập tính toán thuật toán Cấp 12 của Gia sư ở luồng ngầm. |
| **`src/game/tutorEngine.ts`** | Bộ não phân tích: Xử lý Pre-move, Post-move, nhận diện 13 hình thái thế cờ Gomoku. |
| **`src/game/strategies/TutorStrategy.ts`** | Quản lý vòng đời chế độ Gia sư (onGameStart, onPlayerTurnStart, onPlayerMove, onUndo, onGameOver). |
| **`src/store/slices/tutorSlice.ts`** | Quản lý Reactive Signals: `tutorAnalysis`, `tutorFeedback`, `tutorSpeech`, `tutorMood`, `selectedOpponentLevel`. |
| **`src/components/TutorCompanion.tsx`** | Giao diện Gia sư: Khung thoại Typewriter sinh động, Avatar biểu cảm, huy hiệu đe dọa. |
| **`src/data/tutor/dialogues.ts`** | Kho từ điển hội thoại phong phú phân loại theo từng tình huống cờ thực tế. |

---

## 🔄 3. QUY TRÌNH HOẠT ĐỘNG 2 GIAI ĐOẠN (DUAL-PHASE PIPELINE)

Mỗi nước cờ của người chơi được xử lý qua quy trình 2 giai đoạn khép kín:

```
[Bắt đầu lượt đi của Bạn]
          │
          ▼
【 GIAI ĐOẠN 1: Pre-Move Analysis 】 ──► Gia sư gợi ý & cảnh báo
          │
          ▼
[Bạn đặt quân xuống bàn cờ]
          │
          ▼
【 GIAI ĐOẠN 2: Post-Move Evaluation 】 ──► Chấm điểm & Vinh danh / Nhận xét bài học
```

---

### 3.1. GIAI ĐOẠN 1: PHÂN TÍCH TRƯỚC KHI ĐI (`analyzePreMove`)

Mỗi khi đến lượt của người chơi, Gia sư thực hiện chuỗi phân tích:

1. **Kiểm tra nhanh Nước đầu tiên**:
   - Nếu bàn cờ trống rỗng $\rightarrow$ Đề xuất ngay ô trung tâm `H8` (`0ms`).
2. **Kiểm tra Sát cục 1 nước ($O(1)$)**:
   - Nếu người chơi có nước thắng 5 ngay $\rightarrow$ `threatLevel = 'winning'`, tạo gợi ý dứt điểm (`PRE_WIN_IN_ONE`).
3. **Kiểm tra Nguy hiểm khẩn cấp ($O(1)$)**:
   - Nếu đối thủ có nước 5 ở lượt sau $\rightarrow$ `threatLevel = 'danger'`, phát báo động đỏ bắt buộc phải chặn (`PRE_CRITICAL_THREAT`).
4. **Duyệt AI Cấp 12 (Thần Cờ)**:
   - Tìm ra **Nước cờ vàng** hoàn hảo nhất qua Minimax Depth 6 + Bảng băm Zobrist.
5. **Nhận diện hình thái chiến thuật**:
   - **Sát cục liên hoàn VCF**: Nhận diện chuỗi nước 4 liên tiếp (`PRE_VCF_TACTIC`).
   - **Đòn bẫy đôi 4-3 / 3-3 (Fork)**: Nhận diện nước gài thế đôi hiểm hóc (`PRE_FORK_TACTIC`).
   - **Đối thủ có 3 mở**: Cảnh báo ngòi nổ tấn công của địch (`PRE_ENEMY_OPEN_THREE`).
   - **Phát triển trung cuộc**: Đề xuất mở rộng liên kết mạng lưới quân (`PRE_DEVELOPMENT_NEUTRAL`).

---

### 3.2. GIAI ĐOẠN 2: ĐÁNH GIÁ SAU KHI ĐI (`evaluatePostMove`)

Ngay khi người chơi vừa hạ cờ, Gia sư đối chiếu nước đi thực tế và chấm điểm theo **Ma trận 14 tình huống**:

| STT | Tình huống nước cờ | Xếp loại (`quality`) | Sự kiện (`TutorPostMoveEvent`) | Phản ứng của Gia sư |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Đi nước 5 kết liễu trận đấu | 🌟 `brilliant` | `POST_WINNING_MOVE` | Khen ngợi tuyệt tác dứt điểm hoàn hảo |
| **2** | Đi đúng 100% Nước cờ vàng của AI | 🌟 `brilliant` | `POST_BRILLIANT_MOVE` | Đánh giá 10/10, nhãn quan Đại Kiện Tướng |
| **3** | Tạo thế 4 mở (Thông 2 đầu) | 🌟 `brilliant` | `POST_CREATE_OPEN_FOUR` | Vinh danh thế cờ hủy diệt chắc chắn thắng |
| **4** | Tạo đòn bẫy đôi 4-3 hoặc 3-3 | 🌟 `brilliant` | `POST_BRILLIANT_FORK` | Khen ngợi đòn phối hợp bẫy kép đỉnh cao |
| **5** | Hóa giải nước 4 nguy kịch của đối thủ | 🌟 `brilliant` | `POST_DEFUSED_CRITICAL_THREAT` | Khen ngợi sự điềm tĩnh cứu nguy chuẩn xác |
| **6** | Tạo hàng 4 ép đối thủ chống đỡ | 👍 `good` | `POST_CREATE_FOUR` | Khích lệ đòn tấn công chủ động dồn ép địch |
| **7** | Tạo thế 3 mở thoáng đãng | 👍 `good` | `POST_CREATE_OPEN_THREE` | Khen ngợi mở hướng công linh hoạt |
| **8** | Chặn đứng thế 3 mở của đối thủ | 👍 `good` | `POST_BLOCKED_OPEN_THREE` | Khen ngợi nhãn quan phòng thủ kịp thời |
| **9** | Đi nước khá / có ý đồ chiến lược tốt | 👍 `good` | `POST_GOOD_MOVE_COMPARISON` | So sánh nhẹ với nước cờ vàng của AI |
| **10** | Bỏ lỡ cơ hội thắng ngay 1 nước | ❌ `missed_win` | `POST_MISSED_WIN_IN_ONE` | Nhắc nhở tiếc nuối và chỉ ra ô thắng |
| **11** | Bỏ lỡ cơ hội tạo đòn bẫy 4-3 / VCF | ⚠️ `missed_fork` | `POST_MISSED_FORK_OR_VCF` | Hướng dẫn cách tạo bẫy dứt điểm |
| **12** | Bỏ lọt nước 4 của đối thủ (Blunder) | 🚨 `blunder` | `POST_IGNORED_CRITICAL_THREAT` | Cảnh báo nguy hiểm khẩn cấp tử huyệt |
| **13** | Bỏ lọt thế 3 mở của đối thủ | 🚨 `blunder` | `POST_IGNORED_OPEN_THREE` | Nhắc nhở không được trao quyền chủ động |
| **14** | Đánh quá xa trung tâm (Bị động) | 🐢 `passive` | `POST_PASSIVE_MOVE` | Khuyên nên tập trung lực lượng ở điểm nóng |

---

### 3.3. GIAI ĐOẠN 3: PHÂN TÍCH Ý ĐỒ ĐỐI THỦ (`evaluateBotMove`)

Ngay khi Bot hoàn tất nước đi, Gia sư tiến hành phân tích ý đồ chiến thuật và hướng dẫn người chơi phương án đối phó:

| STT | Tình huống nước đi của Bot | Sự kiện (`TutorBotMoveEvent`) | Ý đồ & Lời khuyên Gia sư |
| :---: | :--- | :--- | :--- |
| **1** | Bot đi nước 5 dứt điểm | `BOT_WINNING_FIVE` | Phân tích sơ hở phòng ngự và bài học rút kinh nghiệm |
| **2** | Bot chặn nước 5 thắng của bạn | `BOT_BLOCK_WIN` | Khen ngợi thế công dồn ép, khuyên tiếp tục mở hướng công mới |
| **3** | Bot tạo thế 4 mở (2 đầu) | `BOT_CREATE_OPEN_FOUR` | Cảnh báo đòn kết liễu không thể đỡ, phân tích cách phòng bị |
| **4** | Bot gài bẫy đôi 4-3/3-3 | `BOT_FORK_ATTACK` | Phân tích đòn 2 mang, hướng dẫn phản công nhanh hoặc chặn điểm giao |
| **5** | Bot tạo hàng 4 ép đỡ | `BOT_CREATE_FOUR_PRESSURE` | Cảnh báo nguy cơ tức thời, chỉ định ô chặn bắt buộc |
| **6** | Bot dựng thế 3 mở | `BOT_CREATE_OPEN_THREE` | Nhắc nhở ngòi nổ tấn công, khuyên chặn đầu hoặc giật tiên |
| **7** | Bot chặn hàng 3 mở của bạn | `BOT_BLOCK_PLAYER_THREE` | Phân tích đòn cản phá, gợi ý xoay trục sang cánh đối diện |
| **8** | Khai cuộc kiểm soát tâm | `BOT_OPENING_CONTROL` | Phân tích kiểm soát không gian và cự ly quân mở màn |
| **9** | Mở rộng liên kết mạng lưới | `BOT_EXPAND_CONNECTION` | Cảnh báo các bước nhảy cờ cách ô và đường phối hợp tầm xa |
| **10** | Bố trí thế trận linh hoạt | `BOT_POSITIONAL_DEVELOPMENT` | Phân tích thăm dò cờ thế và điều chỉnh vị trí cơ động |

---

## 🎭 4. TÂM TRẠNG & GIAO DIỆN HỘI THOẠI (MOOD & DIALOGUE SYSTEM)

### 4.1. Các trạng thái biểu cảm của Gia sư (`tutorMood`):

* **`calm` (Điềm tĩnh / Quan sát)**: Mặc định trong các nước đi phát triển trung cuộc.
* **`thinking` (Đang suy nghĩ)**: Khi Worker đang giải bài toán sâu ở luồng ngầm.
* **`excited` (Phấn khích)**: Khi người chơi hoặc Gia sư tìm ra đòn sát cục dứt điểm.
* **`danger` (Báo động đỏ)**: Khi đối thủ có nước 4 hoặc đòn hiểm đe dọa.
* **`proud` (Tự hào / Vinh quang)**: Khi người chơi đi nước cờ vàng (`brilliant`), phá bẫy hoặc thắng trận.

### 4.2. Trải nghiệm tương tác trên giao diện:
* **Hiệu ứng chữ chạy Typewriter**: Từng ký tự xuất hiện mượt mà theo nhịp nói chuyện tự nhiên.
* **Hiệu ứng âm thanh Blip**: Phát âm thanh gõ nhẹ nhàng khi chữ hiển thị.
* **Giao diện 2 cột hội thoại song song**: Phân tích trực tiếp nước cờ của người chơi và giải mã ý đồ của Bot một cách tự nhiên, trực quan.

---

## 🛡️ 5. CƠ CHẾ BẢO VỆ & KHÁNG LỖI (FAULT TOLERANCE & RESILIENCY)

1. **Kháng xung đột nước đi nhanh (Request Cancellation & Invalidation)**:
   - Sử dụng `requestId` tăng dần. Khi người chơi đánh liên tục hoặc Undo, các kết quả tính toán cũ từ Worker trả về muộn hơn sẽ tự động bị bỏ qua, không bao giờ ghi đè lên lượt cờ mới.
2. **Tự phục hồi khi Pre-analysis là `null`**:
   - Nếu người chơi hạ quân cực nhanh trước khi Worker trả về `preAnalysis`, hàm `evaluatePostMove` tự động phân tích hình thái tức thì trên bàn cờ ($O(1)$) để đưa ra xếp loại chính xác 100%.
3. **Hỗ trợ đầy đủ Undo / Redo**:
   - Khi người chơi bấm "Đi lại (Undo)", `TutorStrategy.onUndo` kích hoạt câu thoại động viên và tự động phân tích lại thế cờ vừa khôi phục.
4. **Hỗ trợ công bằng cả 2 phe (Đen đi trước & Trắng đi sau)**:
   - Mọi thuật toán `isFourOrFive`, `isOpenFour`, `isOpenThree`, `isFourThreeFork`, `isDoubleThree` đều nhận tham số `playerColor` linh hoạt.

---

## 🧪 6. KIỂM THỬ & CHẤT LƯỢNG (TESTING & VERIFICATION)

Hệ thống được bảo vệ bởi bộ kiểm thử tự động toàn diện trong `test/strategyLifecycle.test.ts`:
* Kiểm thử kích hoạt đúng câu thoại mở màn và kết thúc ván đấu.
* Kiểm thử phân tích Pre-move và Post-move trên bàn cờ đa dạng.
* Kiểm thử tính đa hình và lifecycle hooks của `TutorStrategy`.
* Toàn bộ **40/40 Unit Tests** luôn được duy trì trạng thái **100% Pass**.

---

*Tài liệu này được tạo tự động nhằm chuẩn hóa kiến trúc và phục vụ việc bảo trì, nâng cấp tính năng trong tương lai.*
