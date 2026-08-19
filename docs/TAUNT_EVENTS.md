# 📜 TÀI LIỆU KHO THOẠI & SỰ KIỆN CÀ KHỊA (GOMOKU TAUNTS SPECIFICATION)

Tài liệu này định nghĩa chi tiết toàn bộ các sự kiện tương tác (`TauntEvent`), hệ thống biểu cảm (`BotMood`), và kho thoại tiếng Việt lầy lội / cà khịa / gáy bẩn được tích hợp trong trò chơi Cờ Caro Gomoku AI.

---

## 📊 TỔNG QUAN & THỐNG KÊ

- **Tổng số sự kiện**: `93 sự kiện` (42 Gameplay, 6 Idle, 26 Interaction, 19 System)
- **Tổng số câu thoại**: $\ge 105$ câu mỗi sự kiện, 0 trùng lặp, chuẩn phong cách lầy lội / cà khịa / gáy bẩn
- **Số loại cảm xúc (`BotMood`)**: `18 biểu cảm`
- **Kiến trúc dữ liệu**: Mỗi sự kiện được đóng gói trong một file riêng biệt theo chuẩn `TauntDefinition` (`event`, `mood`, `texts`).
- **Thuật toán lựa chọn**: $O(1)$ Zero-Heap Allocation, tránh lặp lại câu thoại vừa nói trước đó.

---

## 🎭 BẢNG GIẢI NGHĨA 18 CẢM XÚC BOT (BOT MOODS)

| Mood | Emoji | Tên biểu cảm | Ý nghĩa ngữ cảnh |
|---|:---:|---|---|
| `smug` | 😏 | Cười khẩy | Đắc thắng, bắt bài, tự tin chiếm thế thượng phong, ngắm đường thắng |
| `laugh` | 🤣 | Cười ngả nghiêng | Thắng trận, người chơi thua chuỗi dài, bịt nhầm đầu, tái đấu vội vàng, thua tốc hành |
| `clown` | 🤡 | Mặt hề | Nước đi ngáo, bỏ lỡ nước thắng, đi lạc đảo hoang, tự bóp, ngâm lâu rồi đầu hàng |
| `cool` | 😎 | Ngầu đét | Khai cuộc tự tin, bot đi trước, tăng độ khó |
| `evil` | 😈 | Ác quỷ | Giăng bẫy sát cục hiểm hóc, khóa chặt thế cờ |
| `angry` | 😤 | Bực mình | Người chơi chuyển tab bỏ mặc, không tôn trọng ván cờ |
| `rage` | 🤬 | Nổi giận | Bị người chơi click chọc (poke) liên tục, spam nút âm thanh, đập phím |
| `bored` | 🥱 | Ngáp ngủ | Người chơi suy nghĩ quá lâu, xây boongke co cụm, ván cờ 100 quân, đổ bê tông |
| `sleepy` | 😴 | Buồn ngủ | Người chơi AFK lâu, chơi cờ lúc nửa đêm khuya, buông chuột ngả lưng |
| `shocked` | 😳 | Bất ngờ | Người chơi đi nước cờ hay, bẻ lái bất ngờ, vừa chặn vừa tạo nước 4 |
| `mindblown` | 🤯 | Nổ đầu | Người chơi ngắt chuỗi thua, thắng chuỗi dài, phục thù oanh liệt |
| `thinking` | 🤔 | Đăm chiêu | Người chơi rê chuột do dự ngắm ô quá lâu, ngập ngừng nút Undo |
| `disdain` | 😒 | Khinh bỉ | Người chơi xin đi lại (undo), dạt góc, dạt mép, hạ cấp bot, đánh ôm sát bám đuôi |
| `salute` | 🫡 | Chào tiễn biệt | Người chơi nhận thua đầu hàng, thắng quân tử không undo |
| `relieved` | 😅 | Toát mồ hôi | Kết quả hòa cờ sau trận đấu nghẹt thở |
| `detective` | 🧐 | Soi xét | Người chơi mở xem bảng thống kê, xem luật, chuột phải inspect, đổi theme |
| `party` | 🥳 | Ăn mừng | Thăng cấp AI, người chơi marathon 10 ván liên tục |
| `shush` | 🤫 | Im lặng | Người chơi bấm tắt toàn bộ âm thanh trò chơi |

---

## ⚔️ NHÓM 1: DIỄN BIẾN TRẬN ĐẤU (GAMEPLAY - 42 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 1 | `BOT_WIN` | `laugh` 🤣 | Bot giành chiến thắng chung cuộc ván cờ. | [botWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botWin.ts) |
| 2 | `PLAYER_WIN` | `shocked` 😳 | Người chơi giành chiến thắng đơn lẻ thông thường. | [playerWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerWin.ts) |
| 3 | `PLAYER_WIN_WITH_UNDO` | `clown` 🤡 | Người chơi thắng nhưng đã lạm dụng nút Undo $\ge 1$ lần trong ván. | [playerWinWithUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerWinWithUndo.ts) |
| 4 | `WIN_RIGHT_AFTER_UNDO` | `clown` 🤡 | Người chơi vừa bấm Undo 1 phát là ăn ngay nước thắng kết liễu. | [winRightAfterUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/winRightAfterUndo.ts) |
| 5 | `BOT_WIN_LEADING_SCORE` | `smug` 😏 | Bot thắng và gáy về tỷ số áp đảo trước người chơi ($\ge 2$ ván thắng). | [botWinLeadingScore.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botWinLeadingScore.ts) |
| 6 | `MISSED_WINNING_MOVE` | `clown` 🤡 | Người chơi bỏ lỡ nước cờ thắng mười mươi (có nước 4 mở mà không đánh). | [missedWinningMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/missedWinningMove.ts) |
| 7 | `BLOCK_WRONG_END` | `laugh` 🤣 | Bot có nước 3 mở 2 đầu, người chơi chỉ chặn 1 đầu và đầu kia vẫn toang. | [blockWrongEnd.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blockWrongEnd.ts) |
| 8 | `BLOCK_AND_COUNTER_FOUR` | `shocked` 😳 | Người chơi vừa chặn họng pháo của Bot vừa tạo nước 4 mở của mình. | [blockAndCounterFour.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blockAndCounterFour.ts) |
| 9 | `TURTLE_DEFENSE` | `bored` 🥱 | Người chơi co cụm tử thủ boongke, chỉ quây tròn ôm sát quân của Bot. | [turtleDefense.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/turtleDefense.ts) |
| 10 | `ISOLATED_FAR_MOVE` | `clown` 🤡 | Người chơi đặt quân cờ tít xa cụm giao tranh chính $> 5$ ô (đi đảo hoang). | [isolatedFarMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/isolatedFarMove.ts) |
| 11 | `ACCIDENTAL_SELF_BLOCK` | `clown` 🤡 | Người chơi đặt quân cờ vô tình tự chặn mất đầu phát triển của nhánh mình. | [accidentalSelfBlock.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/accidentalSelfBlock.ts) |
| 12 | `DEAD_FOUR_BLOCKED` | `laugh` 🤣 | Người chơi nối được 4 quân nhưng đã bị Bot chặn kín cả 2 đầu từ trước. | [deadFourBlocked.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/deadFourBlocked.ts) |
| 13 | `SURRENDER_ON_THREAT` | `smug` 😏 | Người chơi bấm nút Đầu hàng ngay khi Bot vừa giăng ra thế bẫy 3 mở / 4 mở. | [surrenderOnThreat.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/surrenderOnThreat.ts) |
| 14 | `SURRENDER_AFTER_LONG_THINKING` | `clown` 🤡 | Người chơi ngâm cờ $> 35$ giây suy nghĩ rồi bấm nút Đầu Hàng. | [surrenderAfterLongThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/surrenderAfterLongThinking.ts) |
| 15 | `FORK_ATTACK_DEFENSE_FAIL` | `clown` 🤡 | Bot có bẫy đôi (4-3 hoặc 3-3), người chơi cản sai hướng không vào giao điểm. | [forkAttackDefenseFail.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/forkAttackDefenseFail.ts) |
| 16 | `CLOSE_COMBAT_HUG` | `disdain` 😒 | Người chơi đánh bám riết lấy quân Bot liên tiếp 8 nước trong cự ly $\le 1$ ô. | [closeCombatHug.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/closeCombatHug.ts) |
| 17 | `SPLIT_BOARD_EXPEDITION` | `clown` 🤡 | Người chơi đánh phân mảnh 2 đầu bán cầu ($> 8$ ô) khi trung tâm đang căng. | [splitBoardExpedition.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/splitBoardExpedition.ts) |
| 18 | `TRIANGLE_FORMATION` | `clown` 🤡 | Người chơi xếp 3 quân tạo thành tam giác cụm bo góc (nhầm sang cờ vây). | [triangleFormation.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/triangleFormation.ts) |
| 19 | `CLEAN_SWEEP_DOMINATION` | `shocked` 😳 | Người chơi thắng áp đảo, không cho Bot tạo nổi bất kỳ nước 3 mở nào. | [cleanSweepDomination.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/cleanSweepDomination.ts) |
| 20 | `IRON_CURTAIN_WIN` | `bored` 🥱 | Người chơi thắng bằng lối chơi đổ bê tông lì lợm kéo dài $\ge 50$ nước. | [ironCurtainWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/ironCurtainWin.ts) |
| 21 | `PLAYER_STREAK_WIN` | `mindblown` 🤯 | Người chơi thắng liên tiếp từ 2 ván trở lên. | [playerStreakWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerStreakWin.ts) |
| 22 | `REVENGE_WIN_AFTER_LOSS_STREAK` | `mindblown` 🤯 | Người chơi phục thù thắng oanh liệt sau chuỗi $\ge 3$ trận thua trước đó. | [revengeWinAfterLossStreak.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/revengeWinAfterLossStreak.ts) |
| 23 | `CONSECUTIVE_SPEED_LOSSES` | `laugh` 🤣 | Người chơi thua 2 ván liên tiếp đều là ván thua chớp nhoáng ($< 12$ nước). | [consecutiveSpeedLosses.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/consecutiveSpeedLosses.ts) |
| 24 | `SYMMETRY_BREAK_SURPRISE` | `shocked` 😳 | Người chơi đánh đối xứng 4 nước đầu rồi bất ngờ bẻ lái tấn công. | [symmetryBreakSurprise.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/symmetryBreakSurprise.ts) |
| 25 | `GAME_DRAW` | `relieved` 😅 | Bàn cờ hết ô trống hoặc hai bên không thể phân định thắng thua. | [gameDraw.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/gameDraw.ts) |
| 26 | `PLAYER_RESIGN` | `salute` 🫡 | Người chơi bấm nút "Đầu hàng" (Nhận thua). | [playerResign.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerResign.ts) |
| 27 | `PLAYER_UNDO` | `disdain` 😒 | Người chơi bấm nút "Đi lại" (Undo) 1 lần. | [playerUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerUndo.ts) |
| 28 | `BLUNDER_MOVE` | `clown` 🤡 | Người chơi đi nước ngáo, không thèm chặn nước 4 hoặc 3 mở của Bot. | [blunderMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blunderMove.ts) |
| 29 | `BOT_TRAP` | `evil` 😈 | Bot vừa tạo được thế bẫy 4-3, 3-3 hoặc chuỗi thắng VCF không thể đỡ. | [botTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botTrap.ts) |
| 30 | `FAST_MOVE_TAUNT` | `clown` 🤡 | Người chơi đi cờ quá nhanh ($< 800\text{ms}$) không thèm suy nghĩ. | [fastMoveTaunt.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/fastMoveTaunt.ts) |
| 31 | `BOT_BLOCK_THREAT` | `smug` 😏 | Bot vừa chặn đứng nước 4 chuẩn bị thắng hoặc 3 mở nguy hiểm của Người chơi. | [botBlockThreat.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botBlockThreat.ts) |
| 32 | `CORNER_MOVE` | `disdain` 😒 | Người chơi đi cờ vào 4 góc bàn cờ (0,0), (0,14), (14,0), (14,14). | [cornerMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/cornerMove.ts) |
| 33 | `CENTER_MOVE` | `cool` 😎 | Người chơi khai cuộc ngay tại tâm Thiên Nguyên (7,7). | [centerMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/centerMove.ts) |
| 34 | `LONG_GAME` | `bored` 🥱 | Ván cờ kéo dài căng thẳng vượt qua 40 nước đi. | [longGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/longGame.ts) |
| 35 | `RUSH_MOVE` | `clown` 🤡 | Người chơi bấm cờ cực nhanh trong chớp mắt ($< 450\text{ms}$). | [rushMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/rushMove.ts) |
| 36 | `EDGE_WALK_MOVE` | `disdain` 😒 | Người chơi đặt quân dạt sát mép biên ngoài ở giai đoạn đầu trận. | [edgeWalkMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/edgeWalkMove.ts) |
| 37 | `DOUBLE_THREE_TRAP` | `shocked` 😳 | Người chơi tạo được thế bẫy đôi 3-3 hoặc 4-3 hiểm hóc. | [doubleThreeTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/doubleThreeTrap.ts) |
| 38 | `COMEBACK_WIN` | `mindblown` 🤯 | Người chơi lội ngược dòng giành chiến thắng từ thế cờ bất lợi sâu. | [comebackWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/comebackWin.ts) |
| 39 | `NO_UNDO_WIN` | `salute` 🫡 | Người chơi thắng trận sạch sẽ $\ge 14$ nước mà không cần Undo lần nào. | [noUndoWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/noUndoWin.ts) |
| 40 | `SPEED_WIN_QUICK` | `clown` 🤡 | Ván cờ ngã ngũ với tốc độ chớp nhoáng trong vòng 10 nước. | [speedWinQuick.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/speedWinQuick.ts) |
| 41 | `CLUTCH_100_STONES` | `bored` 🥱 | Trận đấu chạm mốc kỷ lục 100 quân cờ phủ kín 50% bàn đấu. | [clutch100Stones.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/clutch100Stones.ts) |
| 42 | `COPYCAT_MOVE` | `clown` 🤡 | Người chơi đánh đối xứng sao chép nguyên xi nước đi trước đó của Bot. | [copycatMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/copycatMove.ts) |

---

## ⏳ NHÓM 2: TRẠNG THÁI CHỜ / AFK (IDLE - 6 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 43 | `STARE_AT_WIN_LINE` | `smug` 😏 | Người chơi vừa thua và ngồi ngắm bất động đường 5 quân phát sáng của Bot. | [stareAtWinLine.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/stareAtWinLine.ts) |
| 44 | `IDLE_THINKING` | `bored` 🥱 | Người chơi ngâm cờ suy nghĩ quá 25 giây khi đến lượt đi. | [idleThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleThinking.ts) |
| 45 | `IDLE_IN_GAME` | `sleepy` 😴 | Người chơi treo máy AFK trong trận quá 30 giây. | [idleInGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleInGame.ts) |
| 46 | `IDLE_PRE_GAME` | `smug` 😏 | Người chơi ở sảnh chờ hoặc ván đấu mới quá lâu mà không bắt đầu. | [idlePreGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idlePreGame.ts) |
| 47 | `IDLE_AFTER_LOSS` | `smug` 😏 | Người chơi vừa bị Bot hạ gục và ngồi bất động không bấm Ván Mới. | [idleAfterLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleAfterLoss.ts) |
| 48 | `SUPER_SLOW_MOVE` | `sleepy` 😴 | Người chơi ngâm một nước cờ siêu lâu ($> 45$ giây). | [superSlowMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/superSlowMove.ts) |

---

## 💬 NHÓM 3: TƯƠNG TÁC NGƯỜI CHƠI (INTERACTION - 26 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 49 | `HOVER_UNDO_HESITATION` | `thinking` 🤔 | Người chơi rê chuột hover vào nút Undo $> 2$ giây rồi lại rút tay về. | [hoverUndoHesitation.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/hoverUndoHesitation.ts) |
| 50 | `RESIGN_WHILE_AI_THINKING` | `smug` 😏 | Người chơi bấm nút Đầu Hàng trong khi AI đang tính toán nước đi. | [resignWhileAiThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/resignWhileAiThinking.ts) |
| 51 | `CLICK_OWN_STONE` | `clown` 🤡 | Người chơi bấm chuột vào quân cờ của chính mình đang có trên bàn. | [clickOwnStone.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickOwnStone.ts) |
| 52 | `MOUSE_LEAVE_VIEWPORT` | `sleepy` 😴 | Người chơi di chuột ra ngoài màn hình $> 15$ giây khi đang ngâm cờ. | [mouseLeaveViewport.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/mouseLeaveViewport.ts) |
| 53 | `IMMEDIATE_REVENGE_CLICK` | `laugh` 🤣 | Người chơi vừa thua là bấm nút Ván Mới ngay lập tức ($< 600\text{ms}$). | [immediateRevengeClick.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/immediateRevengeClick.ts) |
| 54 | `UNDO_BEFORE_AI_MOVES` | `clown` 🤡 | Người chơi vừa hạ quân là bấm Undo liền tay ($< 350\text{ms}$). | [undoBeforeAiMoves.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/undoBeforeAiMoves.ts) |
| 55 | `KEYBOARD_SMASH_SPAM` | `rage` 🤬 | Người chơi bấm phím côm cốp liên hồi ($\ge 6$ lần / 2s) khi đang chơi cờ. | [keyboardSmashSpam.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/keyboardSmashSpam.ts) |
| 56 | `RIGHT_CLICK_INSPECT` | `detective` 🧐 | Người chơi click chuột phải / contextmenu trên bàn cờ. | [rightClickInspect.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/rightClickInspect.ts) |
| 57 | `WINDOW_RESIZE_PANIC` | `laugh` 🤣 | Người chơi co giãn / thu phóng kích thước cửa sổ trình duyệt trong trận. | [windowResizePanic.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/windowResizePanic.ts) |
| 58 | `DRAG_SELECT_PANIC` | `clown` 🤡 | Người chơi quét chuột bôi đen giao diện xung quanh bàn cờ khi bí nước. | [dragSelectPanic.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/dragSelectPanic.ts) |
| 59 | `GAME_START` | `cool` 😎 | Bắt đầu một ván cờ mới. | [gameStart.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/gameStart.ts) |
| 60 | `PLAYER_GOOD_MOVE` | `shocked` 😳 | Người chơi đánh được một nước cờ tấn công đẹp mắt hoặc tạo nước 4. | [playerGoodMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/playerGoodMove.ts) |
| 61 | `HESITATION_DANCE` | `thinking` 🤔 | Người chơi rê chuột lượn lờ qua nhiều ô liên tiếp mà không dám hạ cờ. | [hesitationDance.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/hesitationDance.ts) |
| 62 | `RAGE_DOWNGRADE_AFTER_LOSS`| `clown` 🤡 | Người chơi vừa thua cay cú liền hạ cấp độ AI xuống dễ hơn để xả giận. | [rageDowngradeAfterLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/rageDowngradeAfterLoss.ts) |
| 63 | `POKE_BOT` | `rage` 🤬 | Người chơi click chuột chọc vào Avatar / biểu cảm của Bot. | [pokeBot.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/pokeBot.ts) |
| 64 | `SWAP_SIDE_BOT_FIRST` | `cool` 😎 | Người chơi đổi sang cầm quân Trắng, nhường quyền đi trước cho Bot. | [swapSideBotFirst.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/swapSideBotFirst.ts) |
| 65 | `SWAP_SIDE_PLAYER_FIRST` | `smug` 😏 | Người chơi đổi lại cầm quân Đen để giành quyền tiên thủ đi trước. | [swapSidePlayerFirst.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/swapSidePlayerFirst.ts) |
| 66 | `STREAK_LOSS` | `laugh` 🤣 | Người chơi chìm sâu trong chuỗi thua liên tiếp ($\ge 3$ ván). | [streakLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/streakLoss.ts) |
| 67 | `BREAK_LOSS_STREAK` | `mindblown` 🤯 | Người chơi ngắt được chuỗi thua đậm bằng một ván thắng oanh liệt. | [breakLossStreak.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/breakLossStreak.ts) |
| 68 | `LEVEL_UP_ALERT` | `party` 🥳 | Người chơi tích lũy đủ số trận thắng và mở khóa cấp độ AI mới. | [levelUpAlert.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/levelUpAlert.ts) |
| 69 | `CLICK_BEFORE_START` | `clown` 🤡 | Người chơi bấm click vào ô bàn cờ khi chưa bấm bắt đầu trận đấu. | [clickBeforeStart.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickBeforeStart.ts) |
| 70 | `MULTI_UNDO` | `disdain` 😒 | Người chơi lạm dụng Undo liên tục 3 lần trong một khoảng thời gian ngắn. | [multiUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/multiUndo.ts) |
| 71 | `SPAM_POKE_BOT` | `rage` 🤬 | Người chơi click spam liên hồi vào Bot ($\ge 5$ lần trong 3 giây). | [spamPokeBot.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/spamPokeBot.ts) |
| 72 | `CLICK_AFTER_GAME_OVER` | `clown` 🤡 | Người chơi liên tục click vào ô bàn cờ sau khi ván đấu đã kết thúc. | [clickAfterGameOver.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickAfterGameOver.ts) |
| 73 | `LONG_HOVER_CELL` | `thinking` 🤔 | Người chơi đặt chuột hover ngắm 1 ô cờ duy nhất quá 5 giây. | [longHoverCell.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/longHoverCell.ts) |
| 74 | `MARATHON_SERIES` | `party` 🥳 | Người chơi kiên trì thi đấu liên tục 10 ván trong một phiên chơi. | [marathonSeries.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/marathonSeries.ts) |

---

## ⚙️ NHÓM 4: HỆ THỐNG & CÀI ĐẶT GIAO DIỆN (SYSTEM - 19 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 75 | `RAPID_THEME_CYCLING` | `detective` 🧐 | Người chơi đổi liên tục $\ge 3$ theme khác nhau trong vòng 5 giây. | [rapidThemeCycling.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/rapidThemeCycling.ts) |
| 76 | `SWITCH_BOARD_STYLE_MID_GAME` | `detective` 🧐 | Người chơi đổi chế độ bàn cờ (Giao điểm $\leftrightarrow$ Giữa ô) giữa trận. | [switchBoardStyleMidGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/switchBoardStyleMidGame.ts) |
| 77 | `SOUND_SPAM_TOGGLE` | `rage` 🤬 | Người chơi bấm nút Âm thanh (Mute/Unmute) liên tục $\ge 4$ lần trong 3s. | [soundSpamToggle.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundSpamToggle.ts) |
| 78 | `DESPERATE_THEME_SWAP` | `laugh` 🤣 | Người chơi đang thua đậm ($\ge 3$ ván) liên tục đổi theme cầu may. | [desperateThemeSwap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/desperateThemeSwap.ts) |
| 79 | `THEME_CHANGE` | `detective` 🧐 | Người chơi đổi giao diện màu bàn cờ (Wood, Paper, Cyber, Slate, Jade). | [themeChange.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/themeChange.ts) |
| 80 | `BOARD_STYLE_CHANGE` | `detective` 🧐 | Người chơi đổi chế độ cờ (Giao điểm đường kẻ $\leftrightarrow$ Nằm giữa ô). | [boardStyleChange.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/boardStyleChange.ts) |
| 81 | `SOUND_MUTE` | `shush` 🤫 | Người chơi bấm nút tắt toàn bộ âm thanh trò chơi. | [soundMute.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundMute.ts) |
| 82 | `SOUND_UNMUTE` | `smug` 😏 | Người chơi bấm bật lại âm thanh trò chơi. | [soundUnmute.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundUnmute.ts) |
| 83 | `TOGGLE_STEP_NUMBERS` | `detective` 🧐 | Người chơi bật/tắt hiển thị số thứ tự nước đi trên quân cờ. | [toggleStepNumbers.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/toggleStepNumbers.ts) |
| 84 | `OPEN_STATS` | `detective` 🧐 | Người chơi mở cửa sổ xem bảng thành tích và tỷ lệ thắng. | [openStats.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openStats.ts) |
| 85 | `RESET_STATS` | `disdain` 😒 | Người chơi bấm nút xóa sạch toàn bộ lịch sử đấu về 0. | [resetStats.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/resetStats.ts) |
| 86 | `OPEN_RULES` | `detective` 🧐 | Người chơi mở cửa sổ xem luật chơi cờ caro Gomoku. | [openRules.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openRules.ts) |
| 87 | `OPEN_BOT_MODAL` | `detective` 🧐 | Người chơi mở xem bảng thông tin cấp độ của Bot. | [openBotModal.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openBotModal.ts) |
| 88 | `CHANGE_BOT_LEVEL_UP` | `cool` 😎 | Người chơi chủ động chỉnh tăng độ khó của Bot lên cấp cao hơn. | [changeBotLevelUp.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/changeBotLevelUp.ts) |
| 89 | `CHANGE_BOT_LEVEL_DOWN` | `disdain` 😒 | Người chơi hạ độ khó của Bot xuống cấp dễ hơn. | [changeBotLevelDown.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/changeBotLevelDown.ts) |
| 90 | `CLICK_OCCUPIED_CELL` | `clown` 🤡 | Người chơi bấm nhầm vào ô cờ đã có quân đóng sẵn. | [clickOccupiedCell.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/clickOccupiedCell.ts) |
| 91 | `TAB_BLUR` | `angry` 😤 | Người chơi chuyển sang tab trình duyệt khác, bỏ rơi ván cờ. | [tabBlur.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tabBlur.ts) |
| 92 | `TAB_FOCUS` | `smug` 😏 | Người chơi quay trở lại tab game sau khi chuyển đi. | [tabFocus.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tabFocus.ts) |
| 93 | `LATE_NIGHT_PLAY` | `sleepy` 😴 | Người chơi bắt đầu ván cờ vào khung giờ đêm khuya (00:00 – 04:59 AM). | [lateNightPlay.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/lateNightPlay.ts) |

---

## 🚀 HƯỚNG DẪN SỬ DỤNG BỘ CÔNG CỤ CLI

Dự án cung cấp các lệnh CLI cực kỳ tiện lợi được tích hợp sẵn trong [package.json](file:///c:/Users/kien.hm/Desktop/gomoku/package.json):

### 1. Báo cáo thống kê toàn diện kho thoại
```bash
bun run taunts:stats
```

### 2. Đọc toàn bộ câu thoại theo từng sự kiện
```bash
# Xem danh sách 93 sự kiện & thống kê số câu
bun run taunts:read --list

# Đọc toàn bộ câu thoại của một sự kiện bất kỳ (không phân biệt hoa/thường)
bun run taunts:read BOT_WIN
bun run taunts:read surrender_after_long_thinking
bun run taunts:read block_and_counter_four
```

### 3. Thêm câu thoại mới tự động (Type-Safe 100%)
1. Mở file [scripts/append_taunts.ts](file:///c:/Users/kien.hm/Desktop/gomoku/scripts/append_taunts.ts).
2. Điền câu thoại mới vào mảng sự kiện tương ứng (mảng rỗng `[]` sẽ tự bỏ qua).
3. Chạy lệnh:
   ```bash
   bun run taunts:append
   ```

### 4. Kiểm toán chất lượng toàn bộ kho thoại
Quét kiểm tra trùng lặp $100\%$, trùng lặp từ vựng $\ge 75\%$, lỗi chính tả tiếng Việt và phong cách:
```bash
bun run taunts:verify
```
