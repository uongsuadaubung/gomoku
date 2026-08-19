# 🧩 ĐẶC TẢ THIẾT KẾ CHẾ ĐỘ THẾ CỜ GIỮA TRẬN (TACTICAL PUZZLE SCENARIO SPECIFICATION)
> **Tài liệu thiết kế kiến trúc thuật toán, cơ chế sinh thế cờ ngẫu nhiên (1–5 nước) và trải nghiệm đối kháng tự nhiên liền mạch với Bot Level 8 100% Offline cho GoMockU.**

---

## 🎯 1. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ MỚI

### 1.1. Triết Lý Trải Nghiệm: "Thả Vào Chiến Trường - Đánh Đến Cùng"
Thay vì bắt người chơi vào một khuôn khổ giải đố cứng nhắc (đi sai là hiện bảng đỏ ép dừng lại), chế độ **Thế Cờ Giữa Trận** đem lại trải nghiệm đối kháng tự nhiên, kịch tính và liền mạch:

- **Khởi đầu từ Điểm Nóng Chiến Thuật (Tactical Midgame Scenario):** Người chơi được thả ngay vào một thế cờ giữa trận có sẵn từ 6–14 quân. Tại vị trí này, người chơi **đang nắm thế chủ động và có cơ hội thắng trong đúng 1 đến 5 nước (Mate in 1–5)**.
- **Trận Đấu Tiếp Diễn Tự Nhiên (Non-Intrusive & Fluid Gameplay):**
  - **Nếu người chơi nhìn ra đòn hiểm:** Thực hiện đúng chuỗi nước đi $\rightarrow$ Kết liễu Bot Level 8 nhanh gọn trong 1–5 nước!
  - **Nếu người chơi bỏ lỡ hoặc đi sai:** Ván cờ **KHÔNG dừng lại đột ngột**. Bot Level 8 lập tức chớp thời cơ hóa giải, phản công gắt gao. Người chơi tiếp tục chiến đấu để xem mình có thể xoay chuyển tình thế hay sẽ bị Thần Cờ vùi dập!
- **Kết Thúc Tự Nhiên (Natural Game Over):** Ván cờ chỉ dừng lại khi có một bên đạt 5 quân liên tiếp (hoặc hòa). Sau đó, người chơi chỉ cần bấm **"Thế Cờ Mới"** để tạo tiếp một bản đồ ngẫu nhiên khác.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │      TACTICAL PUZZLE SCENARIO (1–5 MOVES ADVANTAGE)     │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
         ┌───────────────────────────────┬───────┴───────────────────────┬───────────────────────────────┐
         ▼                               ▼                               ▼                               ▼
  【 🎲 MAP NGẪU NHIÊN 】         【 ⚡ THẾ TRẬN TỰ NHIÊN 】       【 🤖 BOT LEVEL 8 】            【 📊 ĐÁNH GIÁ KẾT QUẢ 】
Sinh thế cờ có đường thắng       Đánh liên tục không ngắt quãng  Phản xạ chặn đòn hoặc           So sánh số nước thực tế
1–5 sao không trùng lặp          Người chơi tự do sáng tạo       phản công nếu người chơi hở     với số nước tối ưu ban đầu
```

---

## 🌟 2. PHÂN CẤP ĐỘ KHÓ 5 BẬC (1 ĐẾN 5 SAO)

Mỗi thế cờ khởi đầu sẽ có một cơ hội sát cục ẩn giấu tương ứng với số sao:

| Cấp độ | Tên gọi | Nước thắng lý tưởng | Diễn biến nếu đi chuẩn | Diễn biến nếu bỏ lỡ nước tối ưu |
| :---: | :---: | :---: | :--- | :--- |
| **⭐ 1 Sao** | **Nhập Môn** | **1 nước** | Đi đúng ô tạo 4-3/3-3 $\rightarrow$ Thắng ngay ở nước đầu tiên. | Bỏ lỡ $\rightarrow$ Bot lập tức nhảy vào bịt ô hiểm và cướp lại thế trận. |
| **⭐⭐ 2 Sao** | **Tân Thủ** | **2 nước** | Đánh 1 nước 4 ép Bot đỡ $\rightarrow$ Bung đòn thứ 2 kết liễu. | Đi chệch $\rightarrow$ Bot gỡ thế và bắt đầu dàn trận tấn công. |
| **⭐⭐⭐ 3 Sao** | **Chiến Thuật** | **3 nước** | Chuỗi 3 nước ép Bot liên tục chống đỡ cho đến khi thắng. | Lỡ nhịp $\rightarrow$ Thế cờ chuyển thành cuộc chiến giằng co. |
| **⭐⭐⭐⭐ 4 Sao** | **Cao Thủ** | **4 nước** | Chuỗi VCF 4 nước bẻ hướng tấn công linh hoạt. | Đi sai 1 nước $\rightarrow$ Bot Level 8 lật ngược thế cờ. |
| **⭐⭐⭐⭐⭐ 5 Sao** | **Đại Kiện Tướng** | **5 nước** | Chuỗi sát cục đỉnh cao 5 nước liên hoàn. | Thử thách cực hạn: nếu không sát cục chuẩn, Bot Level 8 sẽ trừng phạt ngay! |

---

## ⚙️ 3. KIẾN TRÚC THUẬT TOÁN SINH THẾ CỜ (PROCEDURAL GENERATOR)

### 3.1. Quy Trình Tự Động Sinh Bản Đồ Thế Cờ:
1. **Khởi tạo cụm cờ hạt giống (Seed Generation):** 
   - Đặt ngẫu nhiên một cụm cờ từ 6 đến 12 quân ở khu vực trung tâm bàn cờ theo các thế công quen thuộc.
2. **Quét tìm đòn thắng bằng VCF Solver (`vcf.ts`):**
   - Quét xem bàn cờ vừa tạo có tồn tại chuỗi thắng trong **đúng từ 1 đến 5 nước** hay không.
   - Xác định độ khó (số sao) của map dựa trên số nước thắng tìm được.
3. **Đảm bảo tính công bằng:**
   - Kiểm tra chắc chắn rằng Bot chưa có sẵn chuỗi 4 mở hoặc 5 quân thắng trước người chơi.
4. **Chống trùng lặp tuyệt đối:**
   - Sử dụng mã băm `zobrist.ts` kết hợp **8 phép biến đổi không gian (Xoay 90°/180°/270° & Lật gương)** để mỗi lần bấm "Thế Cờ Mới" là một trải nghiệm hoàn toàn mới lạ.

---

## 🤖 4. CƠ CHẾ VẬN HÀNH CỦA BOT LEVEL 8 TRONG THẾ CỜ

Vì ván cờ diễn ra tự nhiên như một trận đấu thực thụ:

```
                            Người chơi đánh một nước
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
【 Người chơi đánh NƯỚC 4 】                             【 Người chơi đánh NƯỚC KHÁC 】
            │                                                     │
   Bot bắt buộc phải đỡ                                   Bot Level 8 dùng toàn bộ sức mạnh
   vào đúng ô chặn duy nhất                               (Minimax Depth 6 + VCF) để tính
   (Phản hồi nhanh < 100ms)                               nước phản công hoặc cướp quyền tiên thủ
```

- **Khi người chơi đi đúng chuỗi dồn ép (đánh nước 4):**
  - Bot bắt buộc phải chọn đúng ô chặn duy nhất để sống sót.
  - Phản hồi cực nhanh (< 100ms) để người chơi cảm nhận được nhịp dồn ép dồn dập.
- **Khi người chơi đi nước khác (không tạo đe dọa trực tiếp):**
  - Engine AI Level 8 (độ sâu Minimax 6 tầng) lập tức tính toán nước đi mạnh nhất để phản công, trừng phạt sơ hở của người chơi.
  - Ván cờ tiếp tục cho đến khi có người thắng 5 quân hoặc kín bàn cờ.

---

## 📊 5. TỔNG KẾT & ĐÁNH GIÁ SAU TRẬN (POST-SCENARIO REVIEW)

Khi ván cờ kết thúc tự nhiên, Banner thông báo sẽ hiển thị đánh giá thông minh:

- **Kịch bản 1: Người chơi thắng chuẩn xác trong $K$ nước tối ưu**
  - 🏆 *"Xuất sắc! Bạn đã tìm ra đúng lời giải sát cục {K} nước của Thế cờ {K} sao!"*
  - Kèm hiệu ứng pháo hoa rực rỡ và Bot cay cú thừa nhận: *"Chết tiệt, nhìn ra đòn hiểm nhanh đấy!"*
- **Kịch bản 2: Người chơi thắng nhưng mất nhiều nước hơn (lỡ nhịp nhưng vẫn thắng)**
  - 🎯 *"Bạn đã chiến thắng sau {actual_moves} nước cờ! (Mẹo: Thế cờ này từng có nước sát cục trong chỉ {optimal_moves} nước)"*.
- **Kịch bản 3: Người chơi bị Bot Level 8 lật ngược thế cờ và thua**
  - 💥 *"Bị Thần Cờ lật kèo! Bạn đã bỏ lỡ cơ hội kết liễu trong {optimal_moves} nước ban đầu."*
  - Bot Level 8 đắc thắng: *"Cầm thế thắng trên tay mà vẫn để tôi lật kèo được, bái phục danh hài!"*

---

## 💻 6. GIAO DIỆN & ĐIỀU KHIỂN ĐƠN GIẢN, TINH GỌN

Bàn cờ thế cờ vẫn giữ nguyên sự mượt mà và trực quan của bàn cờ chính:
- **Huy hiệu thế cờ:** Hiển thị số sao (ví dụ: `⭐ ⭐ ⭐ Thế cờ 3 nước`) để người chơi biết mục tiêu.
- **Nút "Thế Cờ Mới" (New Scenario):** Bấm phát là tạo ngay một bàn cờ ngẫu nhiên khác bất cứ lúc nào.
- **Nút "Chơi Lại Từ Đầu Thế Cờ Này" (Restart Scenario):** Cho phép đặt lại bàn cờ về đúng trạng thái ban đầu của thế cờ để người chơi thử tìm lại cách giải tối ưu nếu vừa bị Bot lật kèo.

---

## 📌 7. KẾT LUẬN

Thiết kế này mang lại:
1. **Sự tự do tuyệt đối:** Người chơi không bị ức chế bởi các thông báo lỗi hay cắt ngang trải nghiệm.
2. **Kịch tính cao:** Cảm giác cầm thế công nhưng đối đầu với Bot Level 8 cực kỳ hồi hộp – chỉ cần sơ sẩy một nước là bị lật kèo ngay.
3. **Thuật toán đơn giản & mượt mà:** Chỉ cần tập trung tạo ra thế cờ ban đầu chuẩn xác, toàn bộ diễn biến sau đó tận dụng hoàn hảo hệ thống sẵn có của GoMockU!
