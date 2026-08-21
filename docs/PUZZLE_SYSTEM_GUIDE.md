# 📖 TÀI LIỆU TOÀN TẬP: HỆ THỐNG HẠT GIỐNG (SEEDS), THUẬT TOÁN TẠO THẾ CỜ & CÁC CHẾ ĐỘ CHƠI GOMOKU

> **Tài liệu kỹ thuật chi tiết về cấu trúc hạt giống (Tactical Seeds), thuật toán sinh bản đồ cờ thế ngẫu nhiên (Procedural Puzzle Generator), cơ chế kiểm định AI Solver và phân cấp các chế độ chơi trong GoMockU.**

---

## 📑 MỤC LỤC
1. [Tổng Quan Kiến Trúc Hệ Thống](#1-tổng-quan-kiến-trúc-hệ-thống)
2. [Kho Hạt Giống Chiến Thuật (Tactical Seeds Taxonomy)](#2-kho-hạt-giống-chiến-thuật-tactical-seeds-taxonomy)
   - [2.1. Thể loại VCF (Victory by Continuous Fours - 1⭐ đến 7⭐)](#21-thể-loại-vcf-victory-by-continuous-fours---1-đến-7)
   - [2.2. Thể loại VCT (Victory by Continuous Threats - 1⭐ đến 3⭐)](#22-thể-loại-vct-victory-by-continuous-threats---1-đến-3)
   - [2.3. Thể loại DEFENSE (Phòng Thủ & Phản Kích - 1⭐ đến 3⭐)](#23-thể-loại-defense-phòng-thủ--phản-kích---1-đến-3)
3. [Quy Trình & Thuật Toán Sinh Thế Cờ (Procedural Generation Pipeline)](#3-quy-trình--thuật-toán-sinh-thế-cờ-procedural-generation-pipeline)
   - [3.1. Pipeline 5 Bước Sinh Bản Đồ](#31-pipeline-5-bước-sinh-bản-đồ)
   - [3.2. Nhóm Đối Xứng D4 (Dihedral Group Transformations)](#32-nhóm-đối-xứng-d4-dihedral-group-transformations)
   - [3.3. Hệ Thống 42 Mẫu Giao Tranh Thực Chiến (Skirmish Noise)](#33-hệ-thống-42-mẫu-giao-tranh-thực-chiến-skirmish-noise)
   - [3.4. Tùy Chỉnh Mật Độ Quân (Density Options)](#34-tùy-chỉnh-mật-độ-quân-density-options)
4. [Cơ Chế Kiểm Định AI Solver & Vùng Gợi Ý (AI Validator & Hints)](#4-cơ-chế-kiểm-định-ai-solver--vùng-gợi-ý-ai-validator--hints)
5. [Quy Tắc 3 Bước Hiệu Chỉnh Hạt Giống Mới (Seed Calibration Formula)](#5-quy-tắc-3-bước-hiệu-chỉnh-hạt-giống-mới-seed-calibration-formula)
6. [Tổng Quan Các Chế Độ Chơi (Game Modes)](#6-tổng-quan-các-chế-độ-chơi-game-modes)
   - [6.1. Chế Độ Giải Đố Thế Cờ (Tactical Puzzle Mode)](#61-chế-độ-giải-đố-thế-cờ-tactical-puzzle-mode)
   - [6.2. Chế Độ Chiến Dịch Vượt Cấp (Campaign Mode - 8 Bậc)](#62-chế-độ-chiến-dịch-vượt-cấp-campaign-mode---8-bậc)
   - [6.3. Chế Độ Tùy Chỉnh (Custom Match Mode)](#63-chế-độ-tùy-chỉnh-custom-match-mode)
7. [Hướng Dẫn Chạy Test Tự Động (Automated Testing Guide)](#7-hướng-dẫn-chạy-test-tự-động-automated-testing-guide)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống cờ thế của game được thiết kế theo mô hình **Hạt Nhân Chiến Thuật Tạo Sinh (Procedural Kernel Generator)**:
Thay vì tải về danh sách vài chục bài tập tĩnh khiến người chơi nhanh thuộc lòng, game sử dụng các **khung hạt giống chuẩn thi đấu quốc tế (Skeletons)** làm lõi, sau đó kết hợp phép biến đổi hình học không gian và giao tranh ngẫu nhiên để sinh ra **hàng triệu thế cờ độc nhất vô nhị** mà vẫn đảm bảo tính chặt chẽ 100%.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KHO HẠT GIỐNG CHUẨN (SEEDS)                     │
│  - VCF Pools (1–7⭐)       - VCT Pools (1–3⭐)      - DEFENSE Pools    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BỘ ĐIỀU BIẾN TẠO SINH (GENERATOR)                    │
│  1. Chọn ngẫu nhiên hạt giống lõi theo số sao & thể loại              │
│  2. Áp dụng 8 phép biến đổi đối xứng D4 (Xoay 90/180/270°, Lật gương)  │
│  3. Dịch chuyển ngẫu nhiên tọa độ trên bàn cờ 15x15                    │
│  4. Rải cụm giao tranh trung cuộc (42 Skirmish Templates)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BỘ TRỌNG TÀI & KIỂM ĐỊNH (AI SOLVER)                 │
│  - Quét đệ quy VCF / VCT: Xác nhận đúng số nước giải mục tiêu          │
│  - Bộ lọc an toàn: Chặn thế cờ lỗi hoặc đối thủ có đòn phản cướp tiên  │
│  - Trích xuất lời giải (solutionMoves) & Vùng gợi ý (hints.zone)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   GIAO DIỆN & TRẢI NGHIỆM ĐỐI KHÁNG THỰC               │
│  - Thả vào giữa trận chiến thuật: Thắng trong đúng K nước tối ưu       │
│  - Nếu đi chệch: Bot Level 8 (Thần Cờ) lập tức phản công đối kháng     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. KHO HẠT GIỐNG CHIẾN THUẬT (TACTICAL SEEDS TAXONOMY)

Toàn bộ hạt giống được lưu trữ dưới dạng tọa độ tương đối `{ r, c, player }` xoay quanh gốc trung tâm `(0, 0)`.

### 2.1. Thể loại VCF (Victory by Continuous Fours - 1⭐ đến 7⭐)
*File: [`src/game/puzzles/skeletons/vcfSkeletons.ts`](../src/game/puzzles/skeletons/vcfSkeletons.ts)*

VCF là chuỗi nước cờ trong đó người tấn công (Đen) liên tục tạo ra các **nước 4 (Four)**, buộc đối thủ (Trắng) phải đỡ vào đúng ô chặn duy nhất ở mọi lượt cho đến khi đạt 5 quân liên tiếp.

- **⭐ 1 Sao (1 nước Four $\to$ Thắng ngay)**:
  - `Đòn 4 nhảy ngang (Jump Four Hori)`: `{0,-3}, {0,-2}, {0,-1}, (0,0), {0,1}`
  - `Đòn 4 liền dọc (Straight Four Vert)`: `{-3,0}, {-1,0}, {0,0}, {1,0}`
  - `Đòn 4 chéo chính & chéo phụ`: Bố cục đối xứng qua tâm.
- **⭐⭐ 2 Sao (2 nước Four liên tiếp)**:
  - `Ngang $\to$ Dọc (L-Hook)`: Đòn móc chữ L kinh điển.
  - `Ngang $\to$ Chéo chính / Chéo phụ`: Bẻ góc tấn công 45°/135°.
  - `Song Tứ Chữ Thập & Chéo (Double Four 4-4)`: Tạo đồng thời 2 nước Four, Trắng chỉ đỡ được 1 đầu và thua ở đầu còn lại.
  - `Khóa Mép Bàn Cờ (Edge Pinning VCF)`: Tận dụng biên bàn cờ làm bức tường triệt tiêu lối thoát của đối thủ.
  - `Cầu Nối Song Tứ Tầm Xa (Long-Range Bridge Double Four)`: Nối 2 cụm quân phân tán xa nhau thành đòn Song Tứ.
- **⭐⭐⭐ 3 Sao (3 nước Four liên tiếp)**:
  - `Đòn Tam Giác (Triangle Anchor)`: Tấn công 3 đỉnh tam giác.
  - `Đòn Z-Cascade (Zigzag)`: Chuỗi Four ziczac chuyển hướng liên tục.
  - `Sát Cục Bậc Thang (Staircase Cascade)`: Leo dọc bàn cờ theo từng bậc.
- **⭐⭐⭐⭐ 4 Sao (4 nước Four liên tiếp)**:
  - `Đòn Vòng Lặp Xoắn Ốc (Square Loop / Spiral Cascade)`: 4 góc bao vây đối thủ.
- **⭐⭐⭐⭐⭐ 5 Sao đến 7 Sao (5 đến 7 nước Four liên tiếp)**:
  - `Thất Tinh Bắc Đẩu (Seven-Star Cascade)`: Chuỗi sát cục đỉnh cao giải đấu, bao quát toàn bộ bàn cờ.

---

### 2.2. Thể loại VCT (Victory by Continuous Threats - 1⭐ đến 3⭐)
*File: [`src/game/puzzles/skeletons/vctSkeletons.ts`](../src/game/puzzles/skeletons/vctSkeletons.ts)*

VCT là chuỗi tấn công phối hợp sử dụng cả **nước 3 mở (Open Three)** và **nước 4 (Four)** để ép đối thủ chống đỡ cho đến khi sập bẫy sát cục không thể hóa giải.

- **⭐ 1 Sao (Bẫy đôi kết liễu trong 1 nước)**:
  - `Bẫy Đôi 4-3 Chữ L (Four-Three L-Fork)`: 1 nhánh tạo 4 cờ ép chặn, 1 nhánh mở 3 cờ hai đầu.
  - `Bẫy Đôi 4-3 Chữ T (T-Cross Fork)` & `Chữ Thập (Cross Fork)`.
  - `Bẫy Đôi 4-3 Chéo Phụ (Anti-Diagonal 4-3)`.
  - `Song Tam Chữ V (V-Shape Double Three)`: Tạo 2 nhánh 3 mở hai đầu đồng thời.
  - `Bẫy 4-3 Ép Sát Mép (Edge Pinning 4-3)`: Khống chế đối thủ sát biên bàn cờ.
- **⭐⭐ 2 Sao (2 nước VCT)**:
  - `Four $\to$ Bẫy 4-3`: Nước 1 đánh Four ép Trắng đỡ $\to$ Nước 2 bung đòn Bẫy 4-3 kết liễu.
  - `Dọa dọc $\to$ Bẫy 4-3 ngang`.
- **⭐⭐⭐ 3 Sao (3 nước VCT)**:
  - `Four $\to$ Three $\to$ Bẫy 4-3 Fork`: Chuỗi đe dọa 3 tầng liên hoàn chuẩn Tsume-Renju.

---

### 2.3. Thể loại DEFENSE (Phòng Thủ & Phản Kích - 1⭐ đến 3⭐)
*File: [`src/game/puzzles/skeletons/defenseSkeletons.ts`](../src/game/puzzles/skeletons/defenseSkeletons.ts)*

Bối cảnh: **Đối thủ (Trắng) đang nắm sẵn cơ hội thắng ngay ở nước kế tiếp** (Trắng có nước 3 mở hoặc nước 4 nhảy cóc). Bạn phải tìm **điểm giao cắt vàng (Interception Point)**:
1. 🛑 **Bịt kín 100% hướng thắng của đối thủ**.
2. ⚔️ **Đồng thời kích hoạt chuỗi sát cục phản công**.

- **⭐ 1 Sao (Thủ & Phản Công 1 Nước)**:
  - `Def-1A`: Trắng dọa 3 mở ngang $\to$ Đen chặn tại giao điểm, tạo Bẫy 4-3 dọc & chéo.
  - `Def-1B`: Trắng dọa nước 4 nhảy $\to$ Đen chặn lỗ hổng, ghép đủ 5 quân Đen thắng ngay.
  - `Def-1C`: Trắng dọa đường chéo $\to$ Đen chặn đầu chéo, mở Bẫy 4-3 chữ thập.
  - `Def-1D`: Trắng dọa đường dọc $\to$ Đen chặn đầu dọc, mở Bẫy 4-3 chéo phụ.
  - `Def-1E`: Trắng dọa nước 4 nhảy $\to$ Đen chặn và kích hoạt Bẫy 4-3 thắng ngay.
- **⭐⭐ 2 Sao (Chuỗi Thủ & Phản Công Đa Tầng 2 Nước)**:
  - `Def-2A`: Trắng dọa 4 chéo $\to$ Nước 1: Đen chặn tạo 4 ngang ép Trắng $\to$ Nước 2: Đen dứt điểm 5 dọc.
  - `Def-2B`: Trắng dọa 4 dọc $\to$ Nước 1: Đen chặn tạo 4 chéo ép Trắng $\to$ Nước 2: Đen dứt điểm 5 ngang.

---

## 3. QUY TRÌNH & THUẬT TOÁN SINH THẾ CỜ (PROCEDURAL GENERATION PIPELINE)

*File thực thi chính: [`src/game/puzzles/generators/tacticalGenerator.ts`](../src/game/puzzles/generators/tacticalGenerator.ts)*

### 3.1. Pipeline 5 Bước Sinh Bản Đồ

```text
Input: { stars: 1..7, type?: 'VCF'|'VCT'|'DEFENSE', density?: 'sparse'|'normal'|'dense' }
  │
  ├─► 1. LỰA CHỌN POOL HẠT GIỐNG:
  │      Xác định thể loại và lấy danh sách hạt giống tương ứng với số sao.
  │
  ├─► 2. BIẾN ĐỔI HÌNH HỌC KHÔNG GIAN D4:
  │      Chọn 1 trong 8 phép quay/lật ngẫu nhiên -> Dịch tâm về vùng trung tâm (6..8, 6..8).
  │
  ├─► 3. RẢI GIAO TRANH TRUNG CUỘC (SKIRMISH NOISE):
  │      - Đặt các cụm quân cản định hướng (Proximity Stones).
  │      - Chọn ngẫu nhiên 1 trong 42 mẫu Skirmish Templates.
  │      - Thêm các quân cờ nền ngẫu nhiên theo mật độ density.
  │
  ├─► 4. KIỂM ĐỊNH AI SOLVER (VALIDATION LOOP - Lặp tối đa 100 lần):
  │      - Chạy getVCFSolutionTrace hoặc getVCTSolutionTrace.
  │      - Kiểm tra tính độc đạo: Đúng số sao, không có nước đi tắt, không bị cờ cụt.
  │      - Đảm bảo an toàn: Đối thủ không có sẵn 4 mở hay 5 quân (với VCF/VCT).
  │
  └─► 5. ĐÓNG GÓI SCENARIO HOÀN CHỈNH:
         Tạo lịch sử nước đi ban đầu (initialMoveHistory), vùng gợi ý (hints.zone), 
         nước giải tối ưu (solutionMoves) và tên kiếm hiệp tương ứng.
```

---

### 3.2. Nhóm Đối Xứng D4 (Dihedral Group Transformations)
*File: [`src/game/puzzles/utils/symmetry.ts`](../src/game/puzzles/utils/symmetry.ts)*

Mỗi hạt giống $(r, c)$ được chuyển đổi qua 8 trạng thái đẳng cấu hình học:
1. **Nguyên bản (Identity)**: $(r, c)$
2. **Xoay 90° theo chiều kim đồng hồ**: $(-c, r)$
3. **Xoay 180°**: $(-r, -c)$
4. **Xoay 270°**: $(c, -r)$
5. **Lật ngang (Horizontal Flip)**: $(r, -c)$
6. **Lật dọc (Vertical Flip)**: $(-r, c)$
7. **Lật qua đường chéo chính (Main Diagonal)**: $(c, r)$
8. **Lật qua đường chéo phụ (Anti Diagonal)**: $(-c, -r)$

---

### 3.3. Hệ Thống 42 Mẫu Giao Tranh Thực Chiến (Skirmish Noise)
*File: [`src/game/puzzles/templates/skirmishes.ts`](../src/game/puzzles/templates/skirmishes.ts)*

Bao gồm 42 cụm thế cờ trung cuộc và khai cuộc thực tế đã trung hòa (Settled skirmishes):
- Nhóm 1: Cụm giao tranh góc bàn cờ (Corner Skirmishes).
- Nhóm 2: Cụm tranh chấp biên & cạnh (Border Formations).
- Nhóm 3: Các thế cờ đôi công giằng co trung tâm (Midgame Clashes).
- Nhóm 4: Cụm cờ phân tán xa vùng chiến sự (Peripheral Stones).

---

### 3.4. Tùy Chỉnh Mật Độ Quân (Density Options)
Tham số `density` kiểm soát số lượng quân cờ trang trí xung quanh thế cờ chính:
- **`sparse` (Thưa thớt - ~20 đến 35 quân)**: Thế cờ gọn gàng, tập trung tối đa vào cấu trúc chiến thuật chính.
- **`normal` (Tiêu chuẩn - ~40 đến 55 quân)**: Tái hiện bàn cờ trung cuộc chân thực, cân bằng giữa thẩm mỹ và độ rõ ràng.
- **`dense` (Dày đặc - ~60 đến 75 quân)**: Bàn cờ chiến sự căng thẳng, đòi hỏi người chơi có khả năng bao quát và lọc nhiễu tốt.

---

## 4. CƠ CHẾ KIỂM ĐỊNH AI SOLVER & VÙNG GỢI Ý

*File: [`src/game/puzzles/utils/validator.ts`](../src/game/puzzles/utils/validator.ts)*

- **Kiểm định nước giải (`getVCFSolutionTrace` / `getVCTSolutionTrace`)**:
  - AI Solver chạy thuật toán Minimax đệ quy tìm kiếm đường thắng tối ưu.
  - Thế cờ chỉ được chấp thuận khi `trace.success === true` và `trace.moves === targetStars`.
- **Hệ thống Gợi ý Thông minh (`hints`)**:
  - `hints.firstMove`: Tọa độ chính xác của nước đi đầu tiên `{ row, col }`.
  - `hints.zone`: Vùng hình chữ nhật bounding box chứa toàn bộ đòn đánh giúp người chơi tập trung quan sát mà không làm lộ ngay nước đi chính xác.
  - `solutionMoves`: Danh sách toàn bộ chuỗi nước đi mẫu của cả Đen và Trắng.

---

## 5. QUY TẮC 3 BƯỚC HIỆU CHỈNH HẠT GIỐNG MỚI (SEED CALIBRATION FORMULA)

Khi bổ sung bất kỳ hạt giống nào từ sách cờ thế vào hệ thống, áp dụng công thức 3 bước sau để đảm bảo test đạt 100%:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: KHÓA ĐỘC ĐẠO CỬA THẮNG ĐỐI THỦ (Với DEFENSE)                   │
│ - Trắng có 3 quân: Đặt 1 quân Trắng chặn sẵn ở 1 đầu xa.               │
│ - Đảm bảo Trắng chỉ còn DUY NHẤT 1 cửa thắng để Đen chặn.             │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 2: GIỮ THOÁNG 2 ĐẦU CỦA NƯỚC 3 ĐEN (Open Three)                   │
│ - Giữ khoảng trống tối thiểu 2 ô ở cả 2 đầu của nhánh 3 quân Đen.     │
│ - Tuyệt đối không đặt quân Trắng cản quá sát (<= 1 ô).                 │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 3: KHÓA 1 ĐẦU NƯỚC 4 ĐEN ĐỂ ÉP ĐỐI THỦ ĐỠ                        │
│ - Nhánh 4 quân của Đen chỉ để trống 1 ô duy nhất cho Trắng nhảy vào đỡ.│
│ - Đối thủ buộc phải đỡ -> Bạn bung đòn nước 3 mở ở lượt kế để thắng.  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. TỔNG QUAN CÁC CHẾ ĐỘ CHƠI (GAME MODES)

Hệ thống GoMockU cung cấp 3 chế độ chơi chính:

```
┌────────────────────────────────────────────────────────────────────────┐
│                             GOMOCKU MODES                              │
├──────────────────────┬─────────────────────────┬───────────────────────┤
│  🧩 PUZZLE MODE      │  ⚔️ CAMPAIGN MODE       │  ⚙️ CUSTOM MATCH      │
│  (Giải Đố Giữa Trận) │  (Chiến Dịch Vượt Cấp)  │  (Đấu Tùy Chỉnh)      │
└──────────────────────┴─────────────────────────┴───────────────────────┘
```

### 6.1. Chế Độ Giải Đố Thế Cờ (Tactical Puzzle Mode)
- **Cơ chế**: Người chơi chọn độ khó (1⭐ đến 7⭐), hệ thống sinh thế cờ giữa trận ngẫu nhiên.
- **Trải nghiệm**:
  - Nếu đi đúng: Sát cục Bot Level 8 trong đúng số nước tối ưu.
  - Nếu đi sai: Trận đấu không dừng lại, Bot Level 8 lập tức phản công đối kháng thực tế.

### 6.2. Chế Độ Chiến Dịch Vượt Cấp (Campaign Mode - 8 Bậc)
Người chơi bắt đầu từ bàn cờ trống, đối đầu với AI qua 8 cấp bậc thăng tiến:
1. **Level 1 - Tập Đánh (Beginner)**: AI đi cờ ngây thơ, nhiều sơ hở.
2. **Level 2 - Nhập Môn (Novice)**: Bắt đầu chú ý các nước cờ nguy hiểm.
3. **Level 3 - Tập Sự (Apprentice)**: Nắm vững luật cơ bản, ưu tiên tấn công trực diện.
4. **Level 4 - Nghiệp Dư (Casual)**: Biết phán đoán và chủ động phong tỏa nước 3 mở.
5. **Level 5 - Cao Thủ (Adept)**: Biết giăng bẫy đôi 3-3, 4-3 hiểm hóc.
6. **Level 6 - Kiện Tướng (Master)**: Phòng thủ phản công chuẩn xác từ xa.
7. **Level 7 - Đại Kiện Tướng (Grandmaster)**: Kích hoạt VCF Solver độ sâu 10 nước, bao quát toàn cục.
8. **Level 8 - Thần Cờ (Unbeatable God)**: Kích hoạt VCF Solver độ sâu 16 nước + Minimax 6 tầng + Zobrist Hash, tính toán không sơ hở.

### 6.3. Chế Độ Tùy Chỉnh (Custom Match Mode)
- Tự do chọn phe (Cầm quân Đen đi trước hoặc quân Trắng đi sau).
- Tự do chọn cấp độ Bot (Level 1 đến 8).
- Tùy chỉnh kích thước bàn cờ, thời gian suy nghĩ và chế độ gợi ý.

---

## 7. HƯỚNG DẪN CHẠY TEST TỰ ĐỘNG (AUTOMATED TESTING GUIDE)

Bộ kiểm thử được viết bằng `bun:test` tại file [`test/seeds.test.ts`](../test/seeds.test.ts).

### Lệnh Chạy Test:

```bash
# Chạy toàn bộ test suites của dự án
bun test

# Hoặc chạy chuyên biệt bộ kiểm định hạt giống & bộ sinh cờ thế
bun run test:seeds
```

### Nội Dung Được Kiểm Tra Tự Động:
- ✅ 100% hạt giống VCF (1⭐ đến 7⭐) đạt đúng số nước giải VCF.
- ✅ 100% hạt giống VCT (1⭐ đến 3⭐) đạt đúng số nước giải VCT.
- ✅ 100% hạt giống DEFENSE (1⭐) khóa đòn thành công và kết liễu trong 1 nước.
- ✅ Động cơ sinh thế cờ `generateTacticalScenario` hoạt động hoàn hảo trên mọi cấu hình sao, thể loại và mật độ quân.
