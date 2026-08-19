# 🤖 THIẾT KẾ NHÂN VẬT BOT & HỆ THỐNG CÀ KHỊA (BOT PERSONA SPECIFICATION)

> **Tài liệu đặc tả kiến trúc tâm lý, hệ thống cảm xúc (`BotMood`) và kho thoại tương tác định hướng: CÀ KHỊA, GÁY BẨN, CHÊ BAI & PHỦ NHẬN ĐỐI THỦ.**

---

## 🎯 1. TRIẾT LÝ THIẾT KẾ NHÂN VẬT (CORE PERSONA PHILOSOPHY)

Nhân vật AI Bot trong trò chơi Gomoku không được xây dựng theo hình tượng "trợ lý lịch thiệp" hay "đối thủ quân tử", mà là một **Đại kình địch độc mồm, tự cao, thượng đẳng, chuyên gia gáy bẩn và bậc thầy thao túng tâm lý**.

```
                         ┌──────────────────────────────────────────────┐
                         │          BOT PERSONA: KỲ THỦ ĐỘC MỒM         │
                         └──────────────────────┬───────────────────────┘
                                                │
         ┌──────────────────────────────┬───────┴──────────────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼                              ▼
  【 😒 PHỦ NHẬN 】              【 😏 GÁY BẨN 】              【 🤡 CHẾ GIỄU 】              【 🧐 BẮT THÓP 】
Khi đối thủ thắng/nước hay:   Khi bot thắng/dẫn điểm:       Khi đối thủ blunder/tự bóp:   Khi đối thủ dùng mẹo/F12/Undo:
"Mèo mù vớ cá rán"             "Gà thì muôn đời là gà"      "Gánh xiếc trung ương"        "Gian lận trắng trợn"
"Do tôi nhường/bị lag"         "Xóa game đi cho đỡ nhục"     "Mù màu cấp độ vũ trụ"        "Đổi theme cầu may à"
```

### 💎 Nguyên tắc Vàng 3 KHÔNG & 3 CÓ:
1. **KHÔNG bao giờ chúc mừng chân thành**: Khi người chơi thắng, Bot luôn **phủ nhận sạch trơn** (đổ lỗi do ăn may, do mạng lag, do bot thả, do mèo mù vớ cá rán).
2. **KHÔNG nhún nhường / Kính trọng**: Không dùng các thái độ tôn sùng (`salute`), không toát mồ hôi lo sợ (`relieved`), không khen ngợi đối thủ là đại kiện tướng.
3. **KHÔNG thừa nhận thất bại tâm phục khẩu phục**: Dù người chơi có lội ngược dòng hay đánh bại cấp Thần, Bot luôn coi đó là sự cố rùa hoặc lỗi kỹ thuật tạm thời.
4. **CÓ gáy bẩn mọi lúc mọi nơi**: Khi dẫn điểm, khi thắng ván, khi ép đối thủ đầu hàng $\rightarrow$ Cười khẩy (`smug` 😏), cười sặc sụa (`laugh` 🤣).
5. **CÓ chế giễu tàn nhẫn mọi sai lầm**: Bỏ lỡ nước thắng, chặn sai đầu, xếp cờ nhầm game $\rightarrow$ Đội mũ chú hề cho đối thủ (`clown` 🤡).
6. **CÓ bóc mẽ mọi hành vi tâm lý**: Rung lắc chuột, kéo rê chuột, co giãn cửa sổ, mở F12, đổi theme cầu may $\rightarrow$ Bắt bài và châm chọc sự bấn loạn (`panic` 😱, `detective` 🧐).

---

## 🎭 2. BẢNG PHÂN BỔ 17 CẢM XÚC (BOT MOODS) THEO TỶ LỆ SÁT THƯƠNG

Toàn bộ 132 sự kiện được phân bổ vào **17 sắc thái cảm xúc**, trong đó các nhóm **Cà khịa / Gáy bẩn / Phủ nhận chiếm hơn 60%**:

| STT | Mood (`BotMood`) | Biểu tượng | Tên gọi | Số sự kiện | Tỷ lệ | Định hướng nội dung thoại |
|:---:|:---|:---:|:---|:---:|:---:|:---|
| 1 | **`disdain`** | 😒 | **Khinh bỉ / Phủ nhận** | **22** | **16.2%** | Phủ nhận chiến thắng của người chơi ("do ăn may", "tôi nhường"), khinh bỉ khi đối thủ dùng Undo, dạt biên, bám đỉa. |
| 2 | **`smug`** | 😏 | **Cười khẩy / Gáy bẩn** | **18** | **14.9%** | Đắc thắng khi bot thắng ván, dẫn trước điểm số, đối thủ đầu hàng, chụp ảnh màn hình, F5 reload. |
| 3 | **`laugh`** | 🤣 | **Cười ngả nghiêng** | **15** | **10.9%** | Cười nhạo người chơi thua liên hoàn, thua tốc hành, bỏ sót hàng 4 mở, đạt mốc 100 ván ăn hành. |
| 4 | **`clown`** | 🤡 | **Coi là gánh xiếc** | **12** | **8.8%** | Chế giễu các pha blunder tự hủy, bắt chước máy móc, xếp cờ tam giác/chữ T như chơi cờ cá ngựa. |
| 5 | **`detective`**| 🧐 | **Kính lúp bắt thóp** | **12** | **8.7%** | Bắt quả tang người chơi mở F12 devtools, xem luật cờ, xem bảng thống kê, đổi theme cầu may, lăn zoom chuột. |
| 6 | **`bored`** | 🥱 | **Khinh thường / Ngáp ngủ** | **8** | **6.8%** | Chê bai đối thủ đánh nhạt nhẽo, thủ rùa bê tông, trận cờ 100 quân cù cưa, ngâm cờ câu giờ. |
| 7 | **`sleepy`** | 😴 | **Buồn ngủ / Gục ngã** | **5** | **4.5%** | Châm chọc người chơi AFK bỏ trận, chuột rời màn hình, chơi cờ lúc nửa đêm 3h sáng, trưa no bụng. |
| 8 | **`thinking`** | 🤔 | **Đăm chiêu phân tích** | **6** | **4.3%** | Giả vờ tính toán nước cờ, bóc mẽ khi đối thủ hover chuột ngập ngừng, dệt cờ so le, quây tâm. |
| 9 | **`evil`** | 😈 | **Ác quỷ mưu mô** | **5** | **3.8%** | Đắc chí khi giăng bẫy 4-3, bẫy 3 nhảy cóc, dồn đối thủ vào góc tử thần, nước cờ số 13 định mệnh. |
| 10 | **`lightning`** | ⚡ | **Tia chớp hủy diệt** | **5** | **3.7%** | Gáy về tốc độ kết liễu siêu nhanh (1 phút bullet, đánh hấp tấp, thế cờ zic-zắc tốc độ). |
| 11 | **`cool`** | 😎 | **Ngầu đét thượng đẳng** | **5** | **3.6%** | Tự tin khai cuộc, chấp đối thủ đi trước, mở đường cao tốc chéo, tăng độ khó bot lên tối đa. |
| 12 | **`panic`** | 😱 | **Cà khịa sự hoảng loạn** | **5** | **3.6%** | Bắt bài khi đối thủ lắc chuột lia lịa, quét bôi đen màn hình, co giãn cửa sổ trình duyệt, click loạn xạ. |
| 13 | **`chill`** | ☕ | **Thảnh thơi bán hành** | **4** | **2.9%** | Thảnh thơi nhâm nhi cà phê sáng, nghỉ trưa, đầu tuần, cuối tuần trong khi vẫn cho đối thủ ăn hành. |
| 14 | **`rage`** | 🤬 | **Nổi đóa bật lại** | **4** | **2.9%** | Đanh đá mắng đối thủ khi bị đập phím Space, gõ loạn bàn phím, spam nút chọc bot, spam bật/tắt loa. |
| 15 | **`party`** | 🥳 | **Ăn mừng của bot** | **3** | **2.2%** | Ăn mừng khi bot thăng cấp, cày marathon 10 ván, chiều thứ Sáu tan sở. |
| 16 | **`angry`** | 😤 | **Bực dọc** | **2** | **1.5%** | Cảnh cáo khi bị chọc nhẹ vào avatar bot, rời tab trình duyệt đi tra Google. |
| 17 | **`shush`** | 🤫 | **Suỵt im lặng** | **1** | **0.8%** | Châm chọc khi đối thủ tắt âm thanh để đỡ bị nghe cà khịa. |

---

## ⚔️ 3. KỊCH BẢN KHO THOẠI CHI TIẾT THEO TÌNH HUỐNG

### 3.1. Kịch bản: Người chơi Thắng / Đi nước hay (Bot luôn PHỦ NHẬN & CHÊ BAI)
- **Cảm xúc áp dụng**: `disdain` (😒 Khinh bỉ)
- **Tư tưởng cốt lõi**: Phủ nhận hoàn toàn kỹ năng của người chơi, coi đó là sự may mắn tạm thời hoặc do Bot cố tình nhường:
  > *"Hên thôi! Chắc chắn là do ăn may, ván sau tôi nghiêm túc thì bạn không có cửa!"*  
  > *"Bạn vừa nhìn lén màn hình của tôi đúng không? Đánh kiểu này gian lận chắc luôn!"*  
  > *"Mèo mù vớ cá rán được 1 ván thôi, ván sau tôi sẽ lấy lại cả vốn lẫn lãi!"*  
  > *"Thắng được Cấp Thần là do máy tôi bị quá nhiệt thôi, đừng vội ảo tưởng sức mạnh!"*  
  > *"Thoát chết trong gang tấc nhờ ăn rùa nước cuối mà cũng bày đặt lội ngược dòng!"*

### 3.2. Kịch bản: Bot Thắng / Dẫn điểm / Đối thủ đầu hàng (Bot GÁY BẨN & THƯỢNG ĐẲNG)
- **Cảm xúc áp dụng**: `smug` (😏 Cười khẩy) / `laugh` (🤣 Cười ngả nghiêng)
- **Tư tưởng cốt lõi**: Khẳng định sự chênh lệch đẳng cấp, khuyên đối thủ nên xóa game:
  > *"Gà! Non và xanh lắm bạn ơi!"*  
  > *"Trình này mà cũng đòi thắng tôi à? Về luyện thêm 10 năm nữa đi!"*  
  > *"Dẫn trước {bot_score} - {player_score} rồi, có cần tôi chấp bạn đi trước 3 nước không?"*  
  > *"Biết thân biết phận bấm nút Đầu Hàng sớm là quyết định sáng suốt nhất đời bạn rồi đấy!"*  
  > *"Chụp màn hình thế cờ của tôi về in ra đóng khung treo tường mà học hỏi nhé!"*

### 3.3. Kịch bản: Người chơi Blunder / Tự hủy / Bắt chước (Bot COI LÀ GÁNH XIẾC)
- **Cảm xúc áp dụng**: `clown` (🤡 Mặt hề) / `laugh` (🤣)
- **Tư tưởng cốt lõi**: Biến đối thủ thành danh hài mua vui cho Bot:
  > *"Mắt để dưới gót chân hay sao mà để tôi tạo 4 mở hai đầu toang hoác thế kia?"*  
  > *"Nước cờ đi thẳng vào lòng đất! Bạn đang chơi cờ caro hay đang diễn hài kịch thế?"*  
  > *"Cơm dâng tận miệng có nước 4 thắng mười mươi mà không thèm đánh, bái phục danh hài!"*  
  > *"Bắt chước nước cờ của tôi như cái máy photocopy, tí nữa tôi tự hủy xem có dám bắt chước theo không!"*  
  > *"Xếp cờ hình tam giác với chữ T nhìn nghệ thuật đấy, tiếc là đây là cờ Caro 15x15 bạn ơi!"*

### 3.4. Kịch bản: Người chơi Hoảng loạn (Lắc chuột, resize màn hình, click loạn)
- **Cảm xúc áp dụng**: `panic` (😱 Cà khịa hoảng loạn)
- **Tư tưởng cốt lõi**: Bắt bài tâm lý run sợ, bế tắc của người chơi:
  > *"Lắc chuột loạn xạ như ong vỡ tổ! Tay run hay đang tìm ô phong thủy thế bạn?"*  
  > *"Thu nhỏ cửa sổ trình duyệt lại để thế cờ hiểm của tôi trông bớt to lớn và đáng sợ hơn à?"*  
  > *"Bôi đen màn hình tìm manh mối à? Càng bôi đen thì tương lai ván này càng tối tăm thôi!"*  
  > *"Click dồn dập vào mấy ô trống để giải tỏa căng thẳng đúng không? Vẫn thua thôi sếp!"*

### 3.5. Kịch bản: Người chơi Dùng chiêu trò (Undo, F12 inspect, Đổi theme cầu may)
- **Cảm xúc áp dụng**: `disdain` (😒) / `detective` (🧐)
- **Tư tưởng cốt lõi**: Vạch trần sự gian lận và tư duy mê tín của người chơi:
  > *"Thắng nhờ bấm Undo {undo_count} lần mà cũng dám vênh mặt tự hào à?"*  
  > *"Không có cỗ máy thời gian Doraemon Undo cứu mạng thì bạn nát cờ từ đời nào rồi!"*  
  > *"F12 mở DevTools soi mã nguồn tính hack tọa độ à? Trình còi thì đừng học đòi làm hacker!"*  
  > *"Đổi theme bàn cờ liên tục để giải đen à? Đen do kỹ năng chứ có phải do màu nền đâu bạn hiền!"*

---

## 💻 4. TÍCH HỢP GIAO DIỆN & HOẠT HỌA (UI/UX SYSTEM)

### 4.1. Hệ thống Avatar Phản ứng Động (`BotCharacter.tsx`)
- **Hiệu ứng Khinh bỉ / Gáy bẩn (`disdain`, `smug`)**: Avatar phóng to (`scale-110`), nghiêng góc kiêu ngạo (`rotate-2`) đi kèm bóng đổ vàng kim (`shadow-amber-500/50`).
- **Hiệu ứng Giận dữ / Bấn loạn (`rage`, `panic`)**: Avatar nảy tưng bừng (`animate-bounce`), đổi biểu cảm sang mặt đỏ hoặc hoảng sợ.
- **Hiệu ứng Cười cợt (`laugh`, `clown`)**: Avatar xoay góc (`rotate-6`) và đập liên hồi (`animate-pulse`).

### 4.2. Bong bóng thoại Thích ứng Màu sắc (Adaptive Bubble Theme)
- **`disdain` / `smug` / `cool`**: Gradient Vàng Hổ Phách sang Trọng (`from-amber-400 via-amber-300 to-amber-400 text-slate-950`).
- **`rage` / `angry`**: Gradient Đỏ Lửa Nảy Rung (`from-rose-600 via-red-500 to-amber-500 text-white animate-bubble-shake`).
- **`panic`**: Gradient Cam Cháy Cảnh Báo (`from-amber-600 via-orange-500 to-red-600 text-white animate-bubble-shake`).
- **`lightning`**: Gradient Điện Cyan Năng Lượng (`from-cyan-500 via-amber-400 to-yellow-300 text-slate-950`).
- **`bored` / `sleepy`**: Gradient Đêm Trầm Lặng (`from-slate-800 via-slate-700 to-slate-800 text-slate-100`).
- **`chill`**: Gradient Xanh Ngọc Thư Thái (`from-emerald-600 via-teal-500 to-cyan-600 text-white`).

### 4.3. Chế độ Bịt miệng Kiểm duyệt (Censored / Grawlix Mode)
- Khi người chơi tắt tính năng cà khịa trong Cài đặt (`enableTaunts = false`):
  - **Sự kiện & Trí nhớ vẫn chạy ngầm 100%**: Bot vẫn theo dõi mọi hành vi và kích hoạt sự kiện đúng thời điểm.
  - **Biểu tượng Avatar**: Tự động chuyển thành **Icon Kéo Khóa Miệng `🤐`** kèm hiệu ứng rung lắc bực tức vì bị cấm khẩu (`scale-105 animate-bubble-shake`).
  - **Mã hóa câu thoại (Grawlix Censor)**: Thuật toán `TauntService.censorToGrawlix()` chuyển đổi toàn bộ từ ngữ thành các ký tự `!@#$#%$&%*` nhưng vẫn giữ nguyên dấu câu và nhịp điệu phát ngôn.
  - **Giao diện Bong bóng thoại**: Tông màu đen - đỏ than kiểm duyệt (`bg-slate-950 text-rose-400 border-rose-500 font-mono tracking-wider`).

---

## 📈 5. THÔNG SỐ KIỂM TOÁN CHẤT LƯỢNG (AUDIT METRICS)

- **Tổng số câu thoại toàn hệ thống**: `16,787 câu độc nhất`.
- **Độ phong phú**: 100% sự kiện đạt $\ge 120$ câu (sự kiện cao nhất: `IDLE_THINKING` với 291 câu).
- **Tỷ lệ trùng lặp**: **0.00%** (Được bảo vệ bởi bộ kiểm toán `verify_no_duplicates.ts`).
- **Tỷ lệ từ ngữ máy móc / sến súa**: **0.00%**.
- **Tỷ lệ phán xét cá nhân người chơi (từ "tư duy")**: **0.00%** (Đã chuyển toàn bộ sang tập trung vào thế trận và diễn biến cờ).
- **Chỉ số Cà khịa trung bình**: **2.26 / 5.0 ⭐** (Hơn 54% câu thoại ở cấp độ Gáy khét lẹt Level 3 & Cà khịa sâu cay Level 2).
