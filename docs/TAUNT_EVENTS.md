# 📜 TÀI LIỆU KHO THOẠI & SỰ KIỆN CÀ KHỊA (GOMOKU TAUNTS SPECIFICATION)

Tài liệu này định nghĩa chi tiết toàn bộ các sự kiện tương tác (`TauntEvent`), hệ thống biểu cảm (`BotMood`), và kho thoại tiếng Việt bựa / cà khịa sâu cay / gáy bẩn được tích hợp trong trò chơi Cờ Caro Gomoku AI.

---

## 📊 TỔNG QUAN & THỐNG KÊ HỆ THỐNG

- **Tổng số sự kiện**: `132 sự kiện` (59 Gameplay, 6 Idle, 35 Interaction, 29 System)
- **Tổng số câu thoại**: `16,787 câu` ($\ge 120$ câu mỗi sự kiện, đạt chuẩn tự nhiên, không phán xét cá nhân, 0% trùng lặp).
- **Số loại cảm xúc (`BotMood`)**: `17 biểu cảm độc mồm & cà khịa` đi kèm hoạt họa avatar và giao diện đổi màu động.
- **Kiến trúc dữ liệu**: Mỗi sự kiện được đóng gói trong một module độc lập (`TauntDefinition`), tối ưu hóa tải bộ nhớ.
- **Thuật toán lựa chọn**: $O(1)$ Zero-Heap Allocation, cơ chế ghi nhớ `lastIndexMap` chống lặp lại câu trước đó.
- **Tỷ lệ đấu nối**: `100% (132/132 sự kiện)` được tích hợp thuật toán nhận diện và kích hoạt trong trò chơi.

---

## 🎭 BẢNG GIẢI NGHĨA 17 CẢM XÚC BOT (BOT MOODS)

| Mood | Emoji | Tên biểu cảm | Định hướng cà khịa / Gáy bẩn / Phủ nhận |
|---|:---:|---|---|
| `disdain` | 😒 | Khinh bỉ / Phủ nhận | Phủ nhận chiến thắng đối thủ ("ăn may", "tôi nhường"), chê bai hối cờ, dạt biên, bám đỉa |
| `smug` | 😏 | Cười khẩy / Gáy bẩn | Bot thắng ván, dẫn điểm, ép đối thủ đầu hàng, F5 reload, chụp ảnh màn hình |
| `laugh` | 🤣 | Cười ngả nghiêng | Chế giễu đối thủ thua chuỗi, thua nhanh, bỏ sót 4 mở, 100 ván ăn hành |
| `clown` | 🤡 | Coi là gánh xiếc | Châm chọc nước đi blunder tự hủy, bắt chước máy móc, xếp cờ tam giác/chữ T |
| `detective` | 🧐 | Kính lúp bắt thóp | Bắt quả tang mở F12 devtools, xem luật cờ, xem thống kê, đổi theme cầu may |
| `bored` | 🥱 | Khinh thường / Ngáp ngủ | Chê đối thủ đánh nhạt nhẽo, thủ rùa bê tông, trận cờ 100 quân, ngâm cờ câu giờ |
| `sleepy` | 😴 | Buồn ngủ / Gục ngã | Châm chọc đối thủ AFK bỏ trận, chuột rời màn hình, chơi cờ nửa đêm 3h sáng |
| `thinking` | 🤔 | Đăm chiêu phân tích | Giả vờ tính toán, bóc mẽ khi đối thủ hover ngập ngừng, dệt cờ so le, quây tâm |
| `evil` | 😈 | Ác quỷ mưu mô | Giăng bẫy 4-3 sát cục, bẫy 3 nhảy cóc, dồn vào góc tử thần, nước 13 định mệnh |
| `lightning` | ⚡ | Tia chớp hủy diệt | Gáy về tốc độ kết liễu siêu nhanh (1 phút bullet, đánh vội, zic-zắc tốc độ) |
| `cool` | 😎 | Ngầu đét thượng đẳng | Tự tin khai cuộc, chấp đối thủ đi trước, mở cao tốc chéo, tăng độ khó tối đa |
| `panic` | 😱 | Cà khịa hoảng loạn | Bắt bài khi đối thủ lắc chuột loạn xạ, quét bôi đen, co giãn cửa sổ trình duyệt |
| `chill` | ☕ | Thảnh thơi bán hành | Thảnh thơi nhâm nhi cà phê sáng, nghỉ trưa, đầu tuần, cuối tuần trong khi bán hành |
| `rage` | 🤬 | Nổi đóa bật lại | Đanh đá mắng đối thủ khi bị đập phím Space, spam nút chọc bot, spam loa |
| `party` | 🥳 | Ăn mừng của bot | Ăn mừng khi bot thăng cấp, cày marathon 10 ván, chiều thứ Sáu tan sở |
| `angry` | 😤 | Bực dọc | Cảnh cáo khi bị chọc nhẹ avatar bot, rời tab trình duyệt đi tra Google |
| `shush` | 🤫 | Suỵt im lặng | Châm chọc khi đối thủ tắt âm thanh để đỡ bị nghe cà khịa |

---

## ⚔️ NHÓM 1: DIỄN BIẾN TRẬN ĐẤU (GAMEPLAY - 62 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 1 | `BOT_WIN` | `laugh` 🤣 | Bot giành chiến thắng chung cuộc ván cờ. | [botWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botWin.ts) |
| 2 | `PLAYER_WIN` | `shocked` 😳 | Người chơi giành chiến thắng đơn lẻ thông thường. | [playerWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerWin.ts) |
| 3 | `PLAYER_WIN_WITH_UNDO` | `clown` 🤡 | Người chơi thắng nhưng đã lạm dụng nút Undo $\ge 1$ lần trong ván. | [playerWinWithUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerWinWithUndo.ts) |
| 4 | `WIN_RIGHT_AFTER_UNDO` | `clown` 🤡 | Người chơi vừa bấm Undo 1 phát là ăn ngay nước thắng kết liễu. | [winRightAfterUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/winRightAfterUndo.ts) |
| 5 | `BOT_WIN_LEADING_SCORE` | `smug` 😏 | Bot thắng và gáy về tỷ số áp đảo trước người chơi ($\ge 2$ ván thắng). | [botWinLeadingScore.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botWinLeadingScore.ts) |
| 6 | `MISSED_WINNING_MOVE` | `clown` 🤡 | Người chơi bỏ lỡ nước cờ thắng mười mươi (có nước 4 mở mà không đánh). | [missedWinningMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/missedWinningMove.ts) |
| 7 | `FOUR_THREE_DOUBLE_ATTACK` | `evil` 😈 | Tạo thành công đòn tứ tam sát cục 4-3 (vừa tạo 4 vừa tạo 3 mở cùng lúc). | [fourThreeDoubleAttack.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/fourThreeDoubleAttack.ts) |
| 8 | `OPEN_FOUR_BLUNDER` | `clown` 🤡 | Người chơi bỏ sót nước 3 mở của đối phương, để đối phương mở 4 hai đầu. | [openFourBlunder.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/openFourBlunder.ts) |
| 9 | `BLOCK_WRONG_END` | `laugh` 🤣 | Bot có nước 3 mở 2 đầu, người chơi chỉ chặn 1 đầu và đầu kia vẫn toang. | [blockWrongEnd.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blockWrongEnd.ts) |
| 10 | `BLOCK_AND_COUNTER_FOUR` | `shocked` 😳 | Người chơi vừa chặn họng pháo của Bot vừa tạo nước 4 mở của mình. | [blockAndCounterFour.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blockAndCounterFour.ts) |
| 11 | `TURTLE_DEFENSE` | `bored` 🥱 | Người chơi co cụm tử thủ boongke, chỉ quây tròn ôm sát quân của Bot. | [turtleDefense.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/turtleDefense.ts) |
| 12 | `ISOLATED_FAR_MOVE` | `clown` 🤡 | Người chơi đặt quân cờ tít xa cụm giao tranh chính $> 5$ ô (đi đảo hoang). | [isolatedFarMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/isolatedFarMove.ts) |
| 13 | `ACCIDENTAL_SELF_BLOCK` | `clown` 🤡 | Người chơi đặt quân cờ vô tình tự chặn mất đầu phát triển của nhánh mình. | [accidentalSelfBlock.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/accidentalSelfBlock.ts) |
| 14 | `DEAD_FOUR_BLOCKED` | `laugh` 🤣 | Người chơi nối được 4 quân nhưng đã bị Bot chặn kín cả 2 đầu từ trước. | [deadFourBlocked.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/deadFourBlocked.ts) |
| 15 | `SURRENDER_ON_THREAT` | `smug` 😏 | Người chơi bấm nút Đầu hàng ngay khi Bot vừa giăng ra thế bẫy 3 mở / 4 mở. | [surrenderOnThreat.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/surrenderOnThreat.ts) |
| 16 | `SURRENDER_AFTER_LONG_THINKING` | `clown` 🤡 | Người chơi ngâm cờ $> 35$ giây suy nghĩ rồi bấm nút Đầu Hàng. | [surrenderAfterLongThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/surrenderAfterLongThinking.ts) |
| 17 | `FORK_ATTACK_DEFENSE_FAIL` | `clown` 🤡 | Bot có bẫy đôi (4-3 hoặc 3-3), người chơi cản sai hướng không vào giao điểm. | [forkAttackDefenseFail.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/forkAttackDefenseFail.ts) |
| 18 | `CLOSE_COMBAT_HUG` | `disdain` 😒 | Người chơi đánh bám riết lấy quân Bot liên tiếp 8 nước trong cự ly $\le 1$ ô. | [closeCombatHug.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/closeCombatHug.ts) |
| 19 | `SPLIT_BOARD_EXPEDITION` | `clown` 🤡 | Người chơi đánh phân mảnh 2 đầu bán cầu ($> 8$ ô) khi trung tâm đang căng. | [splitBoardExpedition.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/splitBoardExpedition.ts) |
| 20 | `TRIANGLE_FORMATION` | `clown` 🤡 | Người chơi xếp 3 quân tạo thành tam giác cụm bo góc (nhầm sang cờ vây). | [triangleFormation.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/triangleFormation.ts) |
| 21 | `DIAGONAL_CROSS_FORMATION` | `detective` 🧐 | Người chơi xếp 2 đường chéo giao nhau tạo thành hình chữ X lớn. | [diagonalCrossFormation.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/diagonalCrossFormation.ts) |
| 22 | `T_SHAPE_FORMATION` | `clown` 🤡 | Người chơi xếp 4-5 quân giao nhau tạo thành hình **chữ T** vuông góc. | [tShapeFormation.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/tShapeFormation.ts) |
| 23 | `ZIGZAG_LIGHTNING` | `cool` 😎 | Người chơi xếp chuỗi quân zic-zắc đổi hướng uốn lượn như tia chớp. | [zigzagLightning.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/zigzagLightning.ts) |
| 24 | `DOUBLE_DEAD_FOUR` | `laugh` 🤣 | Người chơi tạo được 2 hàng 4 quân nhưng **cả 2 đều bị chặn kín 2 đầu**. | [doubleDeadFour.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/doubleDeadFour.ts) |
| 25 | `CORNER_DEATH_TRAP` | `evil` 😈 | Ép đối thủ dạt vào góc chết sát góc 3x3 và tung đòn kết liễu. | [cornerDeathTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/cornerDeathTrap.ts) |
| 26 | `CHECKERBOARD_WEAVE` | `thinking` 🤔 | Đánh so le đen trắng xen kẽ liên tục $\ge 6$ nước như bàn cờ vua. | [checkerboardWeave.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/checkerboardWeave.ts) |
| 27 | `OVERTHINKING_BLUNDER` | `clown` 🤡 | Ngồi ngẫm nghĩ $> 20$ giây rồi đi ra một nước **Blunder ngáo ngơ**. | [overthinkingBlunder.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/overthinkingBlunder.ts) |
| 28 | `ONE_MINUTE_BULLET_WIN` | `bored` 🥱 | Ván cờ ngã ngũ với tổng thời gian chớp nhoáng $< 60$ giây. | [oneMinuteBulletWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/oneMinuteBulletWin.ts) |
| 29 | `UNLUCKY_THIRTEEN_MOVES` | `evil` 😈 | Người chơi thua cuộc chính xác ở **nước thứ 13** của trận đấu. | [unluckyThirteenMoves.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/unluckyThirteenMoves.ts) |
| 30 | `SPEED_REVENGE_FAIL` | `laugh` 🤣 | Tái đấu chớp nhoáng sau thua và lại thua tiếp trong vòng $\le 10$ nước. | [speedRevengeFail.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/speedRevengeFail.ts) |
| 31 | `BOX_SURROUND_CENTER` | `detective` 🧐 | Người chơi tạo khung bao vây hình hộp xung quanh trung tâm bàn cờ. | [boxSurroundCenter.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/boxSurroundCenter.ts) |
| 32 | `FULL_DIAGONAL_HIGHWAY` | `cool` 😎 | Người chơi xếp chuỗi $\ge 4$ quân nối dài trên đường chéo lớn xuyên bàn cờ. | [fullDiagonalHighway.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/fullDiagonalHighway.ts) |
| 33 | `CLEAN_SWEEP_DOMINATION` | `shocked` 😳 | Người chơi thắng áp đảo, không cho Bot tạo nổi bất kỳ nước 3 mở nào. | [cleanSweepDomination.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/cleanSweepDomination.ts) |
| 34 | `IRON_CURTAIN_WIN` | `bored` 🥱 | Người chơi thắng bằng lối chơi đổ bê tông lì lợm kéo dài $\ge 50$ nước. | [ironCurtainWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/ironCurtainWin.ts) |
| 35 | `PLAYER_STREAK_WIN` | `mindblown` 🤯 | Người chơi thắng liên tiếp từ 2 ván trở lên. | [playerStreakWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerStreakWin.ts) |
| 36 | `REVENGE_WIN_AFTER_LOSS_STREAK` | `mindblown` 🤯 | Người chơi phục thù thắng oanh liệt sau chuỗi $\ge 3$ trận thua trước đó. | [revengeWinAfterLossStreak.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/revengeWinAfterLossStreak.ts) |
| 37 | `CONSECUTIVE_SPEED_LOSSES` | `laugh` 🤣 | Người chơi thua 2 ván liên tiếp đều là ván thua chớp nhoáng ($< 12$ nước). | [consecutiveSpeedLosses.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/consecutiveSpeedLosses.ts) |
| 38 | `SYMMETRY_BREAK_SURPRISE` | `shocked` 😳 | Người chơi đánh đối xứng 4 nước đầu rồi bất ngờ bẻ lái tấn công. | [symmetryBreakSurprise.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/symmetryBreakSurprise.ts) |
| 39 | `GAME_DRAW` | `relieved` 😅 | Bàn cờ hết ô trống hoặc hai bên không thể phân định thắng thua. | [gameDraw.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/gameDraw.ts) |
| 40 | `CONSECUTIVE_DRAWS` | `bored` 🥱 | Hai bên hòa liên tiếp 2 ván cờ. | [consecutiveDraws.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/consecutiveDraws.ts) |
| 41 | `TIT_FOR_TAT_DRAWS` | `bored` 🥱 | Hai bên hòa liên tiếp 3 ván cờ cù cưa thi gan. | [titForTatDraws.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/titForTatDraws.ts) |
| 42 | `PLAYER_RESIGN` | `salute` 🫡 | Người chơi bấm nút "Đầu hàng" (Nhận thua). | [playerResign.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerResign.ts) |
| 43 | `PLAYER_UNDO` | `disdain` 😒 | Người chơi bấm nút "Đi lại" (Undo) 1 lần. | [playerUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerUndo.ts) |
| 44 | `REPEATED_UNDO_SAME_MOVE` | `laugh` 🤣 | Người chơi Undo xong lại đánh đúng vào ô vừa xóa ("về máng lợn cũ"). | [repeatedUndoSameMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/repeatedUndoSameMove.ts) |
| 45 | `BLUNDER_MOVE` | `clown` 🤡 | Người chơi đi nước ngáo, không thèm chặn nước 4 hoặc 3 mở của Bot. | [blunderMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blunderMove.ts) |
| 46 | `BOT_TRAP` | `evil` 😈 | Bot vừa tạo được thế bẫy 4-3, 3-3 hoặc chuỗi thắng VCF không thể đỡ. | [botTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botTrap.ts) |
| 47 | `FAST_MOVE_TAUNT` | `clown` 🤡 | Người chơi đi cờ quá nhanh ($< 800\text{ms}$) không thèm suy nghĩ. | [fastMoveTaunt.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/fastMoveTaunt.ts) |
| 48 | `BOT_BLOCK_THREAT` | `smug` 😏 | Bot vừa chặn đứng nước 4 chuẩn bị thắng hoặc 3 mở nguy hiểm của Người chơi. | [botBlockThreat.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botBlockThreat.ts) |
| 49 | `CORNER_MOVE` | `disdain` 😒 | Người chơi đi cờ vào 4 góc bàn cờ (0,0), (0,14), (14,0), (14,14). | [cornerMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/cornerMove.ts) |
| 50 | `CENTER_MOVE` | `cool` 😎 | Người chơi khai cuộc ngay tại tâm Thiên Nguyên (7,7). | [centerMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/centerMove.ts) |
| 51 | `LONG_GAME` | `bored` 🥱 | Ván cờ kéo dài căng thẳng vượt qua 40 nước đi. | [longGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/longGame.ts) |
| 52 | `RUSH_MOVE` | `clown` 🤡 | Người chơi bấm cờ cực nhanh trong chớp mắt ($< 450\text{ms}$). | [rushMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/rushMove.ts) |
| 53 | `EDGE_WALK_MOVE` | `disdain` 😒 | Người chơi đặt quân dạt sát mép biên ngoài ở giai đoạn đầu trận. | [edgeWalkMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/edgeWalkMove.ts) |
| 54 | `DOUBLE_THREE_TRAP` | `shocked` 😳 | Người chơi tạo được thế bẫy đôi 3-3 hoặc 4-3 hiểm hóc. | [doubleThreeTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/doubleThreeTrap.ts) |
| 55 | `JUMP_THREE_TRAP` | `shocked` 😳 | Người chơi tạo thế 3 nhảy cách (`O . O O` hoặc `O O . O`). | [jumpThreeTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/jumpThreeTrap.ts) |
| 56 | `OVERCONFIDENT_BLIND_ATTACK` | `evil` 😈 | Người chơi mải mê tấn công trong khi đối phương đã có nước 4 sát cục. | [overconfidentBlindAttack.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/overconfidentBlindAttack.ts) |
| 57 | `COMEBACK_WIN` | `mindblown` 🤯 | Người chơi lội ngược dòng giành chiến thắng từ thế cờ bất lợi sâu. | [comebackWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/comebackWin.ts) |
| 58 | `NO_UNDO_WIN` | `salute` 🫡 | Người chơi thắng trận sạch sẽ $\ge 14$ nước mà không cần Undo lần nào. | [noUndoWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/noUndoWin.ts) |
| 59 | `SPEED_WIN_QUICK` | `clown` 🤡 | Ván cờ ngã ngũ với tốc độ chớp nhoáng trong vòng 10 nước. | [speedWinQuick.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/speedWinQuick.ts) |
| 60 | `CLUTCH_100_STONES` | `bored` 🥱 | Trận đấu chạm mốc kỷ lục 100 quân cờ phủ kín gần nửa bàn đấu. | [clutch100Stones.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/clutch100Stones.ts) |
| 61 | `COPYCAT_MOVE` | `clown` 🤡 | Người chơi đánh đối xứng sao chép nguyên xi nước đi trước đó của Bot. | [copycatMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/copycatMove.ts) |
| 62 | `GOD_LEVEL_VICTORY` | `salute` 🫡 | Người chơi đánh thắng Bot ở cấp độ khó cao nhất (Level 5 - Thần Thánh). | [godLevelVictory.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/godLevelVictory.ts) |

---

## ⏳ NHÓM 2: TRẠNG THÁI CHỜ / AFK (IDLE - 6 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 63 | `STARE_AT_WIN_LINE` | `smug` 😏 | Người chơi vừa thua và ngồi ngắm bất động đường 5 quân phát sáng của Bot. | [stareAtWinLine.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/stareAtWinLine.ts) |
| 64 | `IDLE_THINKING` | `bored` 🥱 | Người chơi ngâm cờ suy nghĩ quá 25 giây khi đến lượt đi. | [idleThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleThinking.ts) |
| 65 | `IDLE_IN_GAME` | `sleepy` 😴 | Người chơi treo máy AFK trong trận quá 30 giây. | [idleInGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleInGame.ts) |
| 66 | `IDLE_PRE_GAME` | `smug` 😏 | Người chơi ở sảnh chờ hoặc ván đấu mới quá lâu mà không bắt đầu. | [idlePreGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idlePreGame.ts) |
| 67 | `IDLE_AFTER_LOSS` | `smug` 😏 | Người chơi vừa bị Bot hạ gục và ngồi bất động không bấm Ván Mới. | [idleAfterLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleAfterLoss.ts) |
| 68 | `SUPER_SLOW_MOVE` | `sleepy` 😴 | Người chơi ngâm một nước cờ siêu lâu ($> 45$ giây). | [superSlowMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/superSlowMove.ts) |

---

## 💬 NHÓM 3: TƯƠNG TÁC NGƯỜI CHƠI (INTERACTION - 35 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 69 | `HOVER_UNDO_HESITATION` | `thinking` 🤔 | Người chơi rê chuột hover vào nút Undo $> 2$ giây rồi lại rút tay về. | [hoverUndoHesitation.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/hoverUndoHesitation.ts) |
| 70 | `RESIGN_WHILE_AI_THINKING` | `smug` 😏 | Người chơi bấm nút Đầu Hàng trong khi AI đang tính toán nước đi. | [resignWhileAiThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/resignWhileAiThinking.ts) |
| 71 | `CLICK_OWN_STONE` | `clown` 🤡 | Người chơi bấm chuột vào quân cờ của chính mình đang có trên bàn. | [clickOwnStone.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickOwnStone.ts) |
| 72 | `DOUBLE_CLICK_STONE` | `clown` 🤡 | Người chơi nhấp đúp chuột (Double click) vào quân cờ trên bàn. | [doubleClickStone.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/doubleClickStone.ts) |
| 73 | `MOUSE_LEAVE_VIEWPORT` | `sleepy` 😴 | Người chơi di chuột ra ngoài màn hình $> 15$ giây khi đang ngâm cờ. | [mouseLeaveViewport.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/mouseLeaveViewport.ts) |
| 74 | `MOUSE_JIGGLE_PANIC` | `thinking` 🤔 | Người chơi lắc chuột liên hồi qua lại trong cơn bối rối tìm nước đi. | [mouseJigglePanic.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/mouseJigglePanic.ts) |
| 75 | `QUICK_MULTI_CELL_CLICKS` | `thinking` 🤔 | Người chơi click dồn dập vào $\ge 3$ ô trống khác nhau khi đang suy nghĩ. | [quickMultiCellClicks.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/quickMultiCellClicks.ts) |
| 76 | `SPACEBAR_SMASH` | `rage` 🤬 | Người chơi bấm phím Spacebar liên hồi ($\ge 3$ lần / 1.5s) khi sốt ruột. | [spacebarSmash.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/spacebarSmash.ts) |
| 77 | `COPY_TAUNT_TEXT` | `detective` 🧐 | Người chơi bôi đen chọn text hoặc copy câu thoại của Bot. | [copyTauntText.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/copyTauntText.ts) |
| 78 | `SCREENSHOT_ATTEMPT` | `shocked` 😳 | Người chơi ấn phím chụp màn hình (`PrintScreen`, `Win+Shift+S`, `Cmd+Shift+4`). | [screenshotAttempt.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/screenshotAttempt.ts) |
| 79 | `CTRL_Z_SHORTCUT_ATTEMPT` | `disdain` 😒 | Người chơi bấm phím tắt bàn phím `Ctrl+Z` để Undo. | [ctrlZShortcutAttempt.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/ctrlZShortcutAttempt.ts) |
| 80 | `DEVTOOLS_INSPECT_HACK` | `detective` 🧐 | Người chơi bấm `F12`, `Ctrl+Shift+I/J/C` mở DevTools soi mã nguồn. | [devtoolsInspectHack.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/devtoolsInspectHack.ts) |
| 81 | `WHEEL_ZOOM_ATTEMPT` | `detective` 🧐 | Người chơi cuộn con lăn chuột trên bàn cờ. | [wheelZoomAttempt.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/wheelZoomAttempt.ts) |
| 82 | `IMMEDIATE_REVENGE_CLICK` | `laugh` 🤣 | Người chơi vừa thua là bấm nút Ván Mới ngay lập tức ($< 600\text{ms}$). | [immediateRevengeClick.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/immediateRevengeClick.ts) |
| 83 | `UNDO_BEFORE_AI_MOVES` | `clown` 🤡 | Người chơi vừa hạ quân là bấm Undo liền tay ($< 350\text{ms}$). | [undoBeforeAiMoves.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/undoBeforeAiMoves.ts) |
| 84 | `KEYBOARD_SMASH_SPAM` | `rage` 🤬 | Người chơi bấm phím côm cốp liên hồi ($\ge 6$ lần / 2s) khi đang chơi cờ. | [keyboardSmashSpam.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/keyboardSmashSpam.ts) |
| 85 | `RIGHT_CLICK_INSPECT` | `detective` 🧐 | Người chơi click chuột phải / contextmenu trên bàn cờ. | [rightClickInspect.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/rightClickInspect.ts) |
| 86 | `WINDOW_RESIZE_PANIC` | `laugh` 🤣 | Người chơi co giãn / thu phóng kích thước cửa sổ trình duyệt trong trận. | [windowResizePanic.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/windowResizePanic.ts) |
| 87 | `DRAG_SELECT_PANIC` | `clown` 🤡 | Người chơi quét chuột bôi đen giao diện xung quanh bàn cờ khi bí nước. | [dragSelectPanic.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/dragSelectPanic.ts) |
| 88 | `GAME_START` | `cool` 😎 | Bắt đầu một ván cờ mới thông thường. | [gameStart.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/gameStart.ts) |
| 89 | `PLAYER_GOOD_MOVE` | `shocked` 😳 | Người chơi đánh được một nước cờ tấn công đẹp mắt hoặc tạo nước 4. | [playerGoodMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/playerGoodMove.ts) |
| 90 | `HESITATION_DANCE` | `thinking` 🤔 | Người chơi rê chuột lượn lờ qua nhiều ô liên tiếp mà không dám hạ cờ. | [hesitationDance.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/hesitationDance.ts) |
| 91 | `RAGE_DOWNGRADE_AFTER_LOSS`| `clown` 🤡 | Người chơi vừa thua cay cú liền hạ cấp độ AI xuống dễ hơn để xả giận. | [rageDowngradeAfterLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/rageDowngradeAfterLoss.ts) |
| 92 | `POKE_BOT` | `rage` 🤬 | Người chơi click chuột chọc vào Avatar / biểu cảm của Bot. | [pokeBot.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/pokeBot.ts) |
| 93 | `SWAP_SIDE_BOT_FIRST` | `cool` 😎 | Người chơi đổi sang cầm quân Trắng, nhường quyền đi trước cho Bot. | [swapSideBotFirst.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/swapSideBotFirst.ts) |
| 94 | `SWAP_SIDE_PLAYER_FIRST` | `smug` 😏 | Người chơi đổi lại cầm quân Đen để giành quyền tiên thủ đi trước. | [swapSidePlayerFirst.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/swapSidePlayerFirst.ts) |
| 95 | `STREAK_LOSS` | `laugh` 🤣 | Người chơi chìm sâu trong chuỗi thua liên tiếp ($\ge 3$ ván). | [streakLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/streakLoss.ts) |
| 96 | `BREAK_LOSS_STREAK` | `mindblown` 🤯 | Người chơi ngắt được chuỗi thua đậm (Bot cay cú bảo ăn may). | [breakLossStreak.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/breakLossStreak.ts) |
| 97 | `LEVEL_UP_ALERT` | `party` 🥳 | Người chơi tích lũy đủ số trận thắng và mở khóa cấp độ AI mới. | [levelUpAlert.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/levelUpAlert.ts) |
| 98 | `CLICK_BEFORE_START` | `clown` 🤡 | Người chơi bấm click vào ô bàn cờ khi chưa bấm bắt đầu trận đấu. | [clickBeforeStart.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickBeforeStart.ts) |
| 99 | `MULTI_UNDO` | `disdain` 😒 | Người chơi lạm dụng Undo liên tục 3 lần trong một khoảng thời gian ngắn. | [multiUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/multiUndo.ts) |
| 100 | `SPAM_POKE_BOT` | `rage` 🤬 | Người chơi click spam liên hồi vào Bot ($\ge 5$ lần trong 3 giây). | [spamPokeBot.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/spamPokeBot.ts) |
| 101 | `CLICK_AFTER_GAME_OVER` | `clown` 🤡 | Người chơi liên tục click vào ô bàn cờ sau khi ván đấu đã kết thúc. | [clickAfterGameOver.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickAfterGameOver.ts) |
| 102 | `LONG_HOVER_CELL` | `thinking` 🤔 | Người chơi đặt chuột hover ngắm 1 ô cờ duy nhất quá 5 giây. | [longHoverCell.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/longHoverCell.ts) |
| 103 | `MARATHON_SERIES` | `party` 🥳 | Người chơi kiên trì thi đấu liên tục 10 ván trong một phiên chơi. | [marathonSeries.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/marathonSeries.ts) |

---

## ⚙️ NHÓM 4: HỆ THỐNG, NGỮ CẢNH THỜI GIAN & THỐNG KÊ (SYSTEM - 29 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 104 | `MONDAY_BLUES` | `cool` 😎 | Chơi cờ vào sáng thứ Hai đầu tuần (08:00 - 10:00 AM). | [mondayBlues.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/mondayBlues.ts) |
| 105 | `TGIF_FRIDAY_AFTERNOON` | `party` 🥳 | Chơi cờ vào chiều thứ Sáu chuẩn bị tan làm (16:00 - 18:00 PM). | [tgifFridayAfternoon.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tgifFridayAfternoon.ts) |
| 106 | `AFTERNOON_FOOD_COMA` | `sleepy` 😴 | Chơi cờ vào đầu giờ chiều căng da bụng chùng da mắt (13:00 - 14:00 PM). | [afternoonFoodComa.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/afternoonFoodComa.ts) |
| 107 | `MIDNIGHT_BATTERY_LOW` | `bored` 🥱 | Chơi cờ đêm khuya cú đêm (02:00 - 05:00 AM). | [midnightBatteryLow.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/midnightBatteryLow.ts) |
| 108 | `LATE_NIGHT_PLAY` | `sleepy` 😴 | Chơi cờ vào khung giờ đêm muộn (23:00 - 01:59 AM). | [lateNightPlay.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/lateNightPlay.ts) |
| 109 | `EARLY_MORNING_COFFEE` | `cool` 😎 | Chơi cờ vào sáng sớm tinh mơ nhâm nhi cà phê (05:00 - 07:59 AM). | [earlyMorningCoffee.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/earlyMorningCoffee.ts) |
| 110 | `LUNCH_BREAK_RUSH` | `cool` 😎 | Chơi cờ tranh thủ giờ nghỉ trưa công sở (11:30 - 13:00 PM). | [lunchBreakRush.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/lunchBreakRush.ts) |
| 111 | `WEEKEND_CHILL` | `party` 🥳 | Chơi cờ vào hai ngày nghỉ cuối tuần (Thứ Bảy hoặc Chủ Nhật). | [weekendChill.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/weekendChill.ts) |
| 112 | `PERFECT_CENTURY_GAMES` | `salute` 🫡 | Người chơi đạt cột mốc tròn 100 ván đấu trong lịch sử. | [perfectCenturyGames.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/perfectCenturyGames.ts) |
| 113 | `WIN_RATE_DROP_BELOW_50` | `smug` 😏 | Tỷ lệ thắng của người chơi rơi xuống $< 50\%$ sau $\ge 20$ trận đấu. | [winRateDropBelow50.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/winRateDropBelow50.ts) |
| 114 | `RAGE_QUIT_F5_RELOAD` | `laugh` 🤣 | Người chơi F5 tải lại trang giữa chừng khi ván cờ đang diễn ra. | [rageQuitF5Reload.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/rageQuitF5Reload.ts) |
| 115 | `RAPID_THEME_CYCLING` | `detective` 🧐 | Người chơi đổi liên tục $\ge 3$ theme khác nhau trong vòng 5 giây. | [rapidThemeCycling.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/rapidThemeCycling.ts) |
| 116 | `SWITCH_BOARD_STYLE_MID_GAME` | `detective` 🧐 | Người chơi đổi chế độ bàn cờ (Giao điểm $\leftrightarrow$ Giữa ô) giữa trận. | [switchBoardStyleMidGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/switchBoardStyleMidGame.ts) |
| 117 | `SOUND_SPAM_TOGGLE` | `rage` 🤬 | Người chơi bấm nút Âm thanh (Mute/Unmute) liên tục $\ge 4$ lần trong 3s. | [soundSpamToggle.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundSpamToggle.ts) |
| 118 | `DESPERATE_THEME_SWAP` | `laugh` 🤣 | Người chơi đang thua đậm ($\ge 3$ ván) liên tục đổi theme cầu may. | [desperateThemeSwap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/desperateThemeSwap.ts) |
| 119 | `THEME_CHANGE` | `detective` 🧐 | Người chơi đổi giao diện màu bàn cờ (Wood, Paper, Cyber, Slate, Jade). | [themeChange.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/themeChange.ts) |
| 120 | `BOARD_STYLE_CHANGE` | `detective` 🧐 | Người chơi đổi chế độ cờ (Giao điểm đường kẻ $\leftrightarrow$ Nằm giữa ô). | [boardStyleChange.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/boardStyleChange.ts) |
| 121 | `SOUND_MUTE` | `shush` 🤫 | Người chơi bấm nút tắt toàn bộ âm thanh trò chơi. | [soundMute.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundMute.ts) |
| 122 | `SOUND_UNMUTE` | `smug` 😏 | Người chơi bấm bật lại âm thanh trò chơi. | [soundUnmute.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundUnmute.ts) |
| 123 | `TOGGLE_STEP_NUMBERS` | `detective` 🧐 | Người chơi bật/tắt hiển thị số thứ tự nước đi trên quân cờ. | [toggleStepNumbers.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/toggleStepNumbers.ts) |
| 124 | `OPEN_STATS` | `detective` 🧐 | Người chơi mở cửa sổ xem bảng thành tích và tỷ lệ thắng. | [openStats.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openStats.ts) |
| 125 | `RESET_STATS` | `disdain` 😒 | Người chơi bấm nút xóa sạch toàn bộ lịch sử đấu về 0. | [resetStats.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/resetStats.ts) |
| 126 | `OPEN_RULES` | `detective` 🧐 | Người chơi mở cửa sổ xem luật chơi cờ caro Gomoku. | [openRules.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openRules.ts) |
| 127 | `OPEN_BOT_MODAL` | `detective` 🧐 | Người chơi mở xem bảng thông tin cấp độ của Bot. | [openBotModal.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openBotModal.ts) |
| 128 | `CHANGE_BOT_LEVEL_UP` | `cool` 😎 | Người chơi chủ động chỉnh tăng độ khó của Bot lên cấp cao hơn. | [changeBotLevelUp.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/changeBotLevelUp.ts) |
| 129 | `CHANGE_BOT_LEVEL_DOWN` | `disdain` 😒 | Người chơi hạ độ khó của Bot xuống cấp dễ hơn. | [changeBotLevelDown.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/changeBotLevelDown.ts) |
| 130 | `CLICK_OCCUPIED_CELL` | `clown` 🤡 | Người chơi bấm nhầm vào ô cờ đã có quân đóng sẵn của đối thủ. | [clickOccupiedCell.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/clickOccupiedCell.ts) |
| 131 | `TAB_BLUR` | `angry` 😤 | Người chơi chuyển sang tab trình duyệt khác, bỏ rơi ván cờ. | [tabBlur.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tabBlur.ts) |
| 132 | `TAB_FOCUS` | `smug` 😏 | Người chơi quay trở lại tab game sau khi chuyển đi. | [tabFocus.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tabFocus.ts) |

---

## 🚀 HƯỚNG DẪN SỬ DỤNG BỘ CÔNG CỤ CLI

Dự án cung cấp các lệnh CLI cực kỳ tiện lợi được tích hợp sẵn trong [package.json](file:///c:/Users/kien.hm/Desktop/gomoku/package.json):

### 1. Báo cáo thống kê toàn diện kho thoại
```bash
bun run taunts:stats
```

### 2. Đọc toàn bộ câu thoại theo từng sự kiện
```bash
# Xem danh sách 132 sự kiện & thống kê số câu
bun run taunts:read --list

# Đọc toàn bộ câu thoại của một sự kiện bất kỳ (không phân biệt hoa/thường)
bun run taunts:read T_SHAPE_FORMATION
bun run taunts:read overthinking_blunder
bun run taunts:read unlucky_thirteen_moves
```

### 3. Thêm câu thoại mới tự động (Type-Safe 100%)
1. Mở file [scripts/append_taunts.ts](file:///c:/Users/kien.hm/Desktop/gomoku/scripts/append_taunts.ts).
2. Điền câu thoại mới vào mảng sự kiện tương ứng (mảng rỗng `[]` sẽ tự bỏ qua).
3. Chạy lệnh:
   ```bash
   bun run taunts:append
   ```

### 4. Kiểm toán chất lượng toàn bộ kho thoại
Quét kiểm tra định mức $\ge 100$ câu, trùng lặp $100\%$, trùng lặp từ vựng $\ge 75\%$, lỗi chính tả tiếng Việt và phong cách:
```bash
bun run taunts:verify
```
