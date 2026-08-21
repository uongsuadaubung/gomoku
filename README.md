# 🎯 GoMockU

<div align="center">

> **Tựa game cờ Carô (Gomoku) hiện đại với AI đối kháng độc mồm, phân tích chiến thuật thời gian thực & hệ thống nhập môn chuyên sâu.**

[![SolidJS](https://img.shields.io/badge/SolidJS-1.9-blue.svg?logo=solid)](https://www.solidjs.com/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8-646cff.svg?logo=vite)](https://vite.dev/)
[![Bun](https://img.shields.io/badge/Bun-v1.4-fbf0df.svg?logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 💡 Ý Nghĩa Tên Gọi `GoMockU`

Cái tên **`GoMockU`** là một phép **chơi chữ đa tầng (Wordplay)** giữa ngôn ngữ cờ quốc tế và phong cách đối kháng châm biếm:

1. **Đồng âm quốc tế (Phonetics)**:
   * Phát âm: **Go - Mock - U** (/ɡoʊˈmɑːkuː/) $\equiv$ **Gomoku** (Tên gọi quốc tế chính thống của bộ môn cờ Carô).
2. **Cú pháp chơi chữ tiếng Anh (The Wordplay)**:
   * **`Go`**: Vừa là bộ môn cờ chiến thuật, vừa mang nghĩa *"Đi nước cờ"*.
   * **`Mock`**: Động từ mang nghĩa *"Cà khịa, châm chọc, chế giễu đối thủ"*.
   * **`U`** *(viết tắt của **You**)*: Chính là Bạn — người chơi đang ngồi trước bàn cờ.
3. **Thông điệp cốt lõi**:
   * **"Go Mock You"** $\rightarrow$ *"Mỗi khi bạn đi một nước cờ, Bot sẽ cà khịa bạn một câu!"*

---

## 🌟 Tính Năng Nổi Bật

### 1. 🎮 6 Chế Độ Chơi Đa Dạng & Phong Phú
* 🏆 **Chiến Dịch (Campaign Mode)**: Thử thách leo tháp đánh bại **Thập Nhị Đại Tông Sư (12 cấp độ Bot)** từ Vỡ Lòng đến Độc Cô Cầu Bại.
* ⚔️ **Tự Chọn Đối Thủ (Custom Game)**: Tự do chọn bất kỳ cấp độ Bot nào để tập luyện, tùy chỉnh phe cầm quân Đen (đi trước) hoặc Trắng (đi sau).
* ⚡ **Cờ Chớp Sinh Tử (Blitz Mode)**: Giới hạn thời gian siêu tốc (5s / 10s / 15s mỗi nước). Cấm Undo, thua hoặc cháy giờ lập tức reset chuỗi sinh tử về Cấp 1!
* 🎓 **Học Viện Gia Sư (Tutor Mode)**: Đồng hành cùng **Gia sư Gomo** — Nhận phân tích chất lượng nước đi thời gian thực (Best, Good, Inaccuracy, Blunder) và nhận xét tổng kết sau ván đấu.
* 🧩 **Giải Đố Thế Cờ (Tactical Puzzles)**: Thử tài giải sát cục VCF/VCT với hệ thống độ khó từ 1⭐ đến 7⭐ được tạo tự động từ kho hạt giống chiến thuật.
* 📘 **Nhập Môn & Thao Dượt (Master Guide & Sandbox)**: Giáo trình 9 Chương & 42 Bài học tương tác kết hợp Bàn cờ Sandbox với **Radar Chiến Thuật (Tactical Radar)** và bản đồ nhiệt kiểm soát ô cờ.

### 2. 🤖 Thập Nhị Đại Tông Sư (12 Cấp Độ AI Đối Kháng)
Mỗi đối thủ sở hữu Avatar độc quyền, tính cách và kho câu thoại cà khịa phong phú:

| Cấp | Danh Xưng | Tính Cách & Phong Cách |
| :---: | :--- | :--- |
| **Lv 1** | **Bé Tập Chơi** | Ngây ngô, đánh ngẫu nhiên, hay tự thua nhưng rất tự tin. |
| **Lv 2** | **Tân Binh** | Bắt đầu biết nhìn nước 3, thích gáy sớm. |
| **Lv 3** | **Kỳ Thủ Phố** | Đánh cờ vỉa hè, chuyên dùng đòn tâm lý châm chọc. |
| **Lv 4** | **Trưởng Câu Lạc Bộ** | Bài bản, biết chặn nước 4 và chủ động tạo thế 3 mở. |
| **Lv 5** | **Cao Thủ Học Viện** | Bắt đầu biết giải chuỗi sát cục VCF 2-4 nước. |
| **Lv 6** | **Kiện Tướng Trẻ** | Thành thạo đòn bẫy kép 4-3, phản công sắc bén. |
| **Lv 7** | **Đại Sư Tỉnh Thành** | Khả năng tính toán sâu 4-ply, kiểm soát trung tâm chắc chắn. |
| **Lv 8** | **Vô Địch Quốc Gia** | Tìm chuỗi sát cục VCF sâu 8 nước, không mắc sai lầm cơ bản. |
| **Lv 9** | **Đại Kiện Tướng Quốc Tế** | Kết hợp VCF 12 nước và VCT 6 nước, dồn ép liên tục. |
| **Lv 10** | **Kỳ Thánh Đương Đại** | Khả năng vét cạn nhánh đe dọa cực nhanh, phong tỏa toàn diện. |
| **Lv 11** | **Huyền Thoại Bất Tử** | Thao túng thế trận, bẫy cấm Renju đỉnh cao. |
| **Lv 12** | **Độc Cô Cầu Bại (AI Tối Thượng)** | VCF 16 nước, VCT 10 nước, Minimax Depth 6-8, gần như bất khả chiến bại. |

---

## 🛠️ Công Nghệ & Kiến Trúc Kỹ Thuật (Tech Stack)

* **Giao Diện & Trạng Thái**: [SolidJS](https://www.solidjs.com/) (Fine-Grained Reactivity), Modular Store Slices.
* **Tạo Kiểu & Hoạt Họa**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first engine), Canvas Confetti, Lucide Icons.
* **Động Cơ AI (Engine)**:
  * Thuật toán Minimax kết hợp cắt tỉa Alpha-Beta & Iterative Deepening.
  * Bộ giải sát cục cưỡng bức chuyên dụng: **VCF Solver** và **VCT Solver**.
  * Bảng băm hoán vị **Zobrist Transposition Table** (150,000 entries).
  * Chạy đa luồng độc lập trên **Web Worker** (`ai.worker.ts`) không block UI.
* **Hệ Thống Âm Thanh (Audio)**: Tổng hợp sóng âm thanh thuần qua **Web Audio API** (Procedural Synthesis).
* **Môi Trường & Công Cụ**: [Bun](https://bun.sh/), [Vite v8](https://vite.dev/), TypeScript Strict Mode.

---

## 🚀 Cài Đặt & Khởi Chạy (Getting Started)

### 1. Yêu Cầu Môi Trường
* [Bun](https://bun.sh/) $\ge$ 1.2 (Khuyến nghị) hoặc Node.js $\ge$ 20.

### 2. Cài Đặt & Chạy Ứng Dụng
```bash
# Cài đặt các gói phụ thuộc
bun install

# Chạy máy chủ phát triển (Dev Server)
bun run dev

# Kiểm tra kiểu dữ liệu TypeScript
bun run check

# Chạy toàn bộ bộ kiểm thử Unit Tests (103+ tests)
bun test

# Build ứng dụng cho môi trường Production
bun run build
```

### 3. Bộ Lệnh CLI Bảo Trì & Thống Kê
```bash
# Kiểm tra trùng lặp và ngữ cảnh câu thoại cà khịa
bun run verify:taunts

# Thống kê phân bổ câu thoại theo 45 sự kiện
bun run taunts:stats

# Kiểm định chất lượng hạt giống thế cờ VCF/VCT (1⭐ - 7⭐)
bun run test:seeds
```

---

## 📚 Danh Mục Tài Liệu Kỹ Thuật (Documentation Index)

Toàn bộ tài liệu thiết kế và đặc tả kỹ thuật chi tiết được lưu trữ trong thư mục [`docs/`](./docs):

| Tài Liệu | Nội Dung Chính |
| :--- | :--- |
| 📘 **[GUIDE_AND_SANDBOX_GUIDE.md](./docs/GUIDE_AND_SANDBOX_GUIDE.md)** | Chi tiết giáo trình 9 Chương (42 bài học) & Bàn cờ Sandbox với Radar chiến thuật. |
| 🏗️ **[ARCHITECTURE_AND_STRATEGY.md](./docs/ARCHITECTURE_AND_STRATEGY.md)** | Kiến trúc Strategy Pattern, Vòng đời trận đấu (Lifecycle Hooks) & Store Slices. |
| 🧠 **[AI_ENGINE_GUIDE.md](./docs/AI_ENGINE_GUIDE.md)** | Động cơ AI, Decision Pipeline 4 tầng, VCF/VCT Solvers và Zobrist Hashing. |
| ⚡ **[BLITZ_MODE_GUIDE.md](./docs/BLITZ_MODE_GUIDE.md)** | Luật chơi, cơ chế đếm giờ và chu kỳ sinh tử của Chế độ Cờ Chớp. |
| 🎓 **[TUTOR_SYSTEM_GUIDE.md](./docs/TUTOR_SYSTEM_GUIDE.md)** | Hệ thống Gia sư Gomo, đánh giá chất lượng nước đi và phân tích sau trận. |
| 🧩 **[PUZZLE_SYSTEM_GUIDE.md](./docs/PUZZLE_SYSTEM_GUIDE.md)** | Hệ thống tạo thế cờ tự động, hạt giống chiến thuật 1⭐ - 7⭐. |
| 🧩 **[PUZZLE_MODE_DESIGN.md](./docs/PUZZLE_MODE_DESIGN.md)** | Thiết kế trải nghiệm người dùng và cơ chế gợi ý chế độ Giải Đố. |
| 🗣️ **[TAUNT_EVENTS.md](./docs/TAUNT_EVENTS.md)** | Danh mục 45 sự kiện thoại cà khịa, độ ưu tiên, mood và điều kiện kích hoạt. |
| 🤖 **[BOT_PERSONA_DESIGN.md](./docs/BOT_PERSONA_DESIGN.md)** | Thiết kế 12 Bot Persona, tính cách đối thủ và phong cách hội thoại. |
| 📊 **[BOT_PERFORMANCE_AND_SCALING_REPORT.md](./docs/BOT_PERFORMANCE_AND_SCALING_REPORT.md)** | Báo cáo benchmark hiệu năng và đo lường thời gian phản hồi của 12 cấp độ Bot. |

---

<div align="center">

Được phát triển với niềm đam mê dành cho bộ môn cờ Carô & Trí tuệ Nhân tạo.

</div>
