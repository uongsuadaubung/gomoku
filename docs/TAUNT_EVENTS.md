# 📜 TÀI LIỆU KHO THOẠI & SỰ KIỆN CÀ KHỊA (GOMOKU TAUNTS SPECIFICATION)

Tài liệu này định nghĩa chi tiết toàn bộ các sự kiện tương tác (`TauntEvent`), hệ thống biểu cảm (`BotMood`), và kho thoại tiếng Việt lầy lội / cà khịa / gáy bẩn được tích hợp trong trò chơi Cờ Caro Gomoku AI.

---

## 📊 TỔNG QUAN & THỐNG KÊ

- **Tổng số sự kiện**: `71 sự kiện`
- **Tổng số câu thoại**: Đang cập nhật ($\ge 100$ câu mỗi sự kiện, 0 trùng lặp, chuẩn phong cách lầy lội / cà khịa / gáy bẩn)
- **Số loại cảm xúc (`BotMood`)**: `18 biểu cảm`
- **Kiến trúc dữ liệu**: Mỗi sự kiện được đóng gói trong một file riêng biệt theo chuẩn `TauntDefinition` (`event`, `mood`, `texts`).
- **Thuật toán lựa chọn**: $O(1)$ Zero-Heap Allocation, tránh lặp lại câu thoại vừa nói trước đó.

---

## 🎭 BẢNG GIẢI NGHĨA 18 CẢM XÚC BOT (BOT MOODS)

| Mood | Emoji | Tên biểu cảm | Ý nghĩa ngữ cảnh |
|---|:---:|---|---|
| `smug` | 😏 | Cười khẩy | Đắc thắng, bắt bài, tự tin chiếm thế thượng phong, ngắm đường thắng |
| `laugh` | 🤣 | Cười ngả nghiêng | Thắng trận, người chơi thua chuỗi dài, bịt nhầm đầu, tái đấu vội vàng |
| `clown` | 🤡 | Mặt hề | Nước đi ngáo (blunder), bỏ lỡ nước thắng, đi lạc đảo hoang, tự bóp |
| `cool` | 😎 | Ngầu đét | Khai cuộc tự tin, bot đi trước, tăng độ khó |
| `evil` | 😈 | Ác quỷ | Giăng bẫy sát cục hiểm hóc, khóa chặt thế cờ |
| `angry` | 😤 | Bực mình | Người chơi chuyển tab bỏ mặc, không tôn trọng ván cờ |
| `rage` | 🤬 | Nổi giận | Bị người chơi click chọc (poke) liên tục hoặc spam nút âm thanh |
| `bored` | 🥱 | Ngáp ngủ | Người chơi suy nghĩ quá lâu, xây boongke co cụm, ván cờ 100 quân |
| `sleepy` | 😴 | Buồn ngủ | Người chơi AFK lâu, chơi cờ lúc nửa đêm khuya |
| `shocked` | 😳 | Bất ngờ | Người chơi đi nước cờ hay, gài bẫy đôi 3-3 / 4-3 |
| `mindblown` | 🤯 | Nổ đầu | Người chơi ngắt chuỗi thua, thắng chuỗi dài, lội ngược dòng |
| `thinking` | 🤔 | Đăm chiêu | Người chơi rê chuột do dự ngắm ô quá lâu, múa quạt hoang mang |
| `disdain` | 😒 | Khinh bỉ | Người chơi xin đi lại (undo), dạt góc, dạt mép, hạ cấp bot |
| `salute` | 🫡 | Chào tiễn biệt | Người chơi nhận thua đầu hàng, thắng quân tử không undo |
| `relieved` | 😅 | Toát mồ hôi | Kết quả hòa cờ sau trận đấu nghẹt thở |
| `detective` | 🧐 | Soi xét | Người chơi mở xem bảng thống kê, xem luật, đổi theme |
| `party` | 🥳 | Ăn mừng | Thăng cấp AI, người chơi marathon 10 ván liên tục |
| `shush` | 🤫 | Im lặng | Người chơi bấm tắt âm thanh trò chơi |

---

## ⚔️ NHÓM 1: DIỄN BIẾN TRẬN ĐẤU (GAMEPLAY - 30 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 1 | `BOT_WIN` | `laugh` 🤣 | Bot giành chiến thắng chung cuộc ván cờ. | [botWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botWin.ts) |
| 2 | `PLAYER_WIN` | `shocked` 😳 | Người chơi giành chiến thắng đơn lẻ thông thường. | [playerWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerWin.ts) |
| 3 | `PLAYER_WIN_WITH_UNDO` | `clown` 🤡 | Người chơi thắng nhưng đã lạm dụng nút Undo $\ge 1$ lần trong ván. | [playerWinWithUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerWinWithUndo.ts) |
| 4 | `BOT_WIN_LEADING_SCORE` | `smug` 😏 | Bot thắng và gáy về tỷ số áp đảo trước người chơi ($\ge 2$ ván thắng). | [botWinLeadingScore.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botWinLeadingScore.ts) |
| 5 | `MISSED_WINNING_MOVE` | `clown` 🤡 | Người chơi bỏ lỡ nước cờ thắng mười mươi (có nước 4 mở mà không đánh). | [missedWinningMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/missedWinningMove.ts) |
| 6 | `BLOCK_WRONG_END` | `laugh` 🤣 | Bot có nước 3 mở 2 đầu, người chơi chỉ chặn 1 đầu và đầu kia vẫn toang. | [blockWrongEnd.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blockWrongEnd.ts) |
| 7 | `TURTLE_DEFENSE` | `bored` 🥱 | Người chơi co cụm tử thủ boongke, chỉ quây tròn ôm sát quân của Bot. | [turtleDefense.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/turtleDefense.ts) |
| 8 | `ISOLATED_FAR_MOVE` | `clown` 🤡 | Người chơi đặt quân cờ tít xa cụm giao tranh chính $> 5$ ô (đi đảo hoang). | [isolatedFarMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/isolatedFarMove.ts) |
| 9 | `ACCIDENTAL_SELF_BLOCK` | `clown` 🤡 | Người chơi đặt quân cờ vô tình tự chặn mất đầu phát triển của nhánh mình. | [accidentalSelfBlock.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/accidentalSelfBlock.ts) |
| 10 | `DEAD_FOUR_BLOCKED` | `laugh` 🤣 | Người chơi nối được 4 quân nhưng đã bị Bot chặn kín cả 2 đầu từ trước. | [deadFourBlocked.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/deadFourBlocked.ts) |
| 11 | `SURRENDER_ON_THREAT` | `smug` 😏 | Người chơi bấm nút Đầu hàng ngay khi Bot vừa giăng ra thế bẫy 3 mở / 4 mở. | [surrenderOnThreat.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/surrenderOnThreat.ts) |
| 12 | `PLAYER_STREAK_WIN` | `mindblown` 🤯 | Người chơi thắng liên tiếp từ 2 ván trở lên. | [playerStreakWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerStreakWin.ts) |
| 13 | `GAME_DRAW` | `relieved` 😅 | Bàn cờ hết ô trống hoặc hai bên không thể phân định thắng thua. | [gameDraw.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/gameDraw.ts) |
| 14 | `PLAYER_RESIGN` | `salute` 🫡 | Người chơi bấm nút "Đầu hàng" (Nhận thua). | [playerResign.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerResign.ts) |
| 15 | `PLAYER_UNDO` | `disdain` 😒 | Người chơi bấm nút "Đi lại" (Undo) 1 lần. | [playerUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/playerUndo.ts) |
| 16 | `BLUNDER_MOVE` | `clown` 🤡 | Người chơi đi nước ngáo, bỏ sót nước 4 hoặc 3 mở của Bot. | [blunderMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/blunderMove.ts) |
| 17 | `BOT_TRAP` | `evil` 😈 | Bot vừa gài bẫy sát cục VCF hoặc tạo nước 4 mở. | [botTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botTrap.ts) |
| 18 | `BOT_BLOCK_THREAT` | `smug` 😏 | Bot vừa chặn đứng nước cờ 4 hoặc 3 nguy hiểm của Người chơi. | [botBlockThreat.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/botBlockThreat.ts) |
| 19 | `DOUBLE_THREE_TRAP` | `shocked` 😳 | Người chơi gài thành công thế bẫy đôi 3-3 hoặc 4-3 hiểm hóc. | [doubleThreeTrap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/doubleThreeTrap.ts) |
| 20 | `COMEBACK_WIN` | `mindblown` 🤯 | Người chơi lật kèo thắng khi Bot từng đạt $\ge 80\%$ tỷ lệ thắng. | [comebackWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/comebackWin.ts) |
| 21 | `NO_UNDO_WIN` | `salute` 🫡 | Người chơi thắng trận mà không dùng Undo một lần nào. | [noUndoWin.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/noUndoWin.ts) |
| 22 | `SPEED_WIN_QUICK` | `clown` 🤡 | Ván cờ kết liễu siêu tốc trong vòng $\le 10$ nước đi. | [speedWinQuick.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/speedWinQuick.ts) |
| 23 | `FAST_MOVE_TAUNT` | `clown` 🤡 | Người chơi đặt quân cờ quá vội vã ($< 800\text{ms}$). | [fastMoveTaunt.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/fastMoveTaunt.ts) |
| 24 | `RUSH_MOVE` | `clown` 🤡 | Người chơi đánh cực nhanh không suy nghĩ ($< 450\text{ms}$). | [rushMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/rushMove.ts) |
| 25 | `CENTER_MOVE` | `smug` 😏 | Người chơi đánh nước mở màn vào tâm Thiên Nguyên `(7, 7)`. | [centerMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/centerMove.ts) |
| 26 | `CORNER_MOVE` | `disdain` 😒 | Người chơi đánh cờ vào 4 góc bàn cờ `(0,0)`, `(0,14)`, `(14,0)`, `(14,14)`. | [cornerMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/cornerMove.ts) |
| 27 | `EDGE_WALK_MOVE` | `disdain` 😒 | Người chơi đánh dạt hẳn ra hàng/cột 0 hoặc 14 trong 25 nước đầu. | [edgeWalkMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/edgeWalkMove.ts) |
| 28 | `COPYCAT_MOVE` | `clown` 🤡 | Người chơi đánh đối xứng tâm hoặc đối xứng trục sao chép Bot. | [copycatMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/copycatMove.ts) |
| 29 | `LONG_GAME` | `bored` 🥱 | Ván cờ kéo dài đến nước thứ 40 mà chưa ngã ngũ. | [longGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/longGame.ts) |
| 30 | `CLUTCH_100_STONES` | `bored` 🥱 | Trận đấu nghẹt thở kéo dài chạm mốc 100 quân cờ. | [clutch100Stones.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/gameplay/clutch100Stones.ts) |

---

## ⏳ NHÓM 2: TRẠNG THÁI CHỜ / AFK (IDLE - 6 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 31 | `STARE_AT_WIN_LINE` | `smug` 😏 | Người chơi ngồi ngắm đường thắng 5 quân của Bot bất động $> 8$ giây. | [stareAtWinLine.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/stareAtWinLine.ts) |
| 32 | `IDLE_THINKING` | `bored` 🥱 | Người chơi suy nghĩ ngâm cờ quá 10–15 giây đến lượt mình. | [idleThinking.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleThinking.ts) |
| 33 | `IDLE_IN_GAME` | `sleepy` 😴 | Người chơi hoàn toàn không tương tác bàn cờ trong 30–45 giây. | [idleInGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleInGame.ts) |
| 34 | `IDLE_PRE_GAME` | `smug` 😏 | Người chơi ở màn hình chờ mở ván mới mà chưa bấm Bắt đầu. | [idlePreGame.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idlePreGame.ts) |
| 35 | `IDLE_AFTER_LOSS` | `smug` 😏 | Người chơi vừa thua trận nhưng ngồi ngẩn người không bấm chơi tiếp. | [idleAfterLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/idleAfterLoss.ts) |
| 36 | `SUPER_SLOW_MOVE` | `sleepy` 😴 | Người chơi ngâm cờ siêu lâu ($> 25$ giây) mới hạ được một quân. | [superSlowMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/idle/superSlowMove.ts) |

---

## 💬 NHÓM 3: TƯƠNG TÁC NGƯỜI CHƠI (INTERACTION - 18 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 37 | `IMMEDIATE_REVENGE_CLICK` | `laugh` 🤣 | Người chơi bấm nút Ván Mới cực nhanh ($< 600\text{ms}$) ngay sau khi thua. | [immediateRevengeClick.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/immediateRevengeClick.ts) |
| 38 | `UNDO_BEFORE_AI_MOVES` | `clown` 🤡 | Người chơi vừa đặt quân xong đã bấm Undo ngay lập tức ($< 300\text{ms}$). | [undoBeforeAiMoves.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/undoBeforeAiMoves.ts) |
| 39 | `GAME_START` | `cool` 😎 | Bắt đầu một ván đấu mới (ban ngày/buổi tối). | [gameStart.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/gameStart.ts) |
| 40 | `PLAYER_GOOD_MOVE` | `shocked` 😳 | Người chơi tạo được một thế cờ 4 chuẩn bị thắng. | [playerGoodMove.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/playerGoodMove.ts) |
| 41 | `HESITATION_DANCE` | `thinking` 🤔 | Người chơi rê chuột hover loạn xạ 6–8 ô trong 2s không dám hạ quân. | [hesitationDance.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/hesitationDance.ts) |
| 42 | `RAGE_DOWNGRADE_AFTER_LOSS` | `clown` 🤡 | Người chơi vừa thua cấp cao liền mở menu hạ độ khó xuống cấp thấp. | [rageDowngradeAfterLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/rageDowngradeAfterLoss.ts) |
| 43 | `POKE_BOT` | `rage` 🤬 | Người chơi nhấp chuột chọc vào nhân vật Bot. | [pokeBot.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/pokeBot.ts) |
| 44 | `SPAM_POKE_BOT` | `rage` 🤬 | Người chơi click spam liên tục $\ge 5$ lần vào nhân vật Bot. | [spamPokeBot.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/spamPokeBot.ts) |
| 45 | `SWAP_SIDE_BOT_FIRST` | `cool` 😎 | Người chơi đổi sang quân Trắng (nhường Bot đi Tiên). | [swapSideBotFirst.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/swapSideBotFirst.ts) |
| 46 | `SWAP_SIDE_PLAYER_FIRST` | `smug` 😏 | Người chơi chọn cầm quân Đen (đi Tiên trước). | [swapSidePlayerFirst.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/swapSidePlayerFirst.ts) |
| 47 | `STREAK_LOSS` | `laugh` 🤣 | Người chơi đang trong chuỗi thua đậm ($\ge 3$ trận liên tiếp). | [streakLoss.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/streakLoss.ts) |
| 48 | `BREAK_LOSS_STREAK` | `mindblown` 🤯 | Người chơi giải tỏa áp lực, ngắt được chuỗi thua dài dằng dặc. | [breakLossStreak.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/breakLossStreak.ts) |
| 49 | `LEVEL_UP_ALERT` | `party` 🥳 | Người chơi tích lũy đủ số trận thắng để thăng cấp AI lên tầng mới. | [levelUpAlert.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/levelUpAlert.ts) |
| 50 | `CLICK_BEFORE_START` | `clown` 🤡 | Người chơi bấm loạn xạ vào bàn cờ khi ván cờ chưa bắt đầu. | [clickBeforeStart.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickBeforeStart.ts) |
| 51 | `CLICK_AFTER_GAME_OVER` | `clown` 🤡 | Người chơi cố ấn vào bàn cờ khi ván cờ đã phân định xong. | [clickAfterGameOver.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/clickAfterGameOver.ts) |
| 52 | `MULTI_UNDO` | `disdain` 😒 | Người chơi lạm dụng bấm nút Undo $\ge 3$ lần trong 10 giây. | [multiUndo.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/multiUndo.ts) |
| 53 | `LONG_HOVER_CELL` | `thinking` 🤔 | Người chơi rê chuột do dự tại 1 ô trống quá 3.5 giây không bấm. | [longHoverCell.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/longHoverCell.ts) |
| 54 | `MARATHON_SERIES` | `party` 🥳 | Người chơi thi đấu kiên cường liên tục $\ge 10$ ván trong 1 phiên. | [marathonSeries.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/interaction/marathonSeries.ts) |

---

## ⚙️ NHÓM 4: HỆ THỐNG & CÀI ĐẶT UI (SYSTEM - 17 SỰ KIỆN)

| STT | Mã Sự Kiện (`TauntEvent`) | Mood | Thời điểm & Điều kiện kích hoạt | Tệp mã nguồn tham chiếu |
|:---:|---|:---:|---|---|
| 55 | `SOUND_SPAM_TOGGLE` | `rage` 🤬 | Người chơi bấm nút Âm thanh (Mute/Unmute) liên tục $\ge 4$ lần trong 3s. | [soundSpamToggle.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundSpamToggle.ts) |
| 56 | `DESPERATE_THEME_SWAP` | `laugh` 🤣 | Người chơi đang thua đậm ($\ge 3$ ván) liên tục đổi theme cầu may. | [desperateThemeSwap.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/desperateThemeSwap.ts) |
| 57 | `THEME_CHANGE` | `detective` 🧐 | Người chơi đổi giao diện màu bàn cờ (Wood, Paper, Cyber, Slate, Jade). | [themeChange.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/themeChange.ts) |
| 58 | `BOARD_STYLE_CHANGE` | `detective` 🧐 | Người chơi đổi chế độ cờ (Giao điểm đường kẻ $\leftrightarrow$ Nằm giữa ô). | [boardStyleChange.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/boardStyleChange.ts) |
| 59 | `SOUND_MUTE` | `shush` 🤫 | Người chơi bấm nút tắt toàn bộ âm thanh trò chơi. | [soundMute.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundMute.ts) |
| 60 | `SOUND_UNMUTE` | `smug` 😏 | Người chơi bấm bật lại âm thanh trò chơi. | [soundUnmute.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/soundUnmute.ts) |
| 61 | `TOGGLE_STEP_NUMBERS` | `detective` 🧐 | Người chơi bật/tắt hiển thị số thứ tự nước đi trên quân cờ. | [toggleStepNumbers.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/toggleStepNumbers.ts) |
| 62 | `OPEN_STATS` | `detective` 🧐 | Người chơi mở cửa sổ xem bảng thành tích và tỷ lệ thắng. | [openStats.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openStats.ts) |
| 63 | `RESET_STATS` | `disdain` 😒 | Người chơi bấm nút xóa sạch toàn bộ lịch sử đấu về 0. | [resetStats.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/resetStats.ts) |
| 64 | `OPEN_RULES` | `detective` 🧐 | Người chơi mở cửa sổ xem luật chơi cờ caro Gomoku. | [openRules.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openRules.ts) |
| 65 | `OPEN_BOT_MODAL` | `detective` 🧐 | Người chơi mở xem bảng thông tin cấp độ của Bot. | [openBotModal.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/openBotModal.ts) |
| 66 | `CHANGE_BOT_LEVEL_UP` | `cool` 😎 | Người chơi chủ động chỉnh tăng độ khó của Bot lên cấp cao hơn. | [changeBotLevelUp.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/changeBotLevelUp.ts) |
| 67 | `CHANGE_BOT_LEVEL_DOWN` | `disdain` 😒 | Người chơi hạ độ khó của Bot xuống cấp dễ hơn. | [changeBotLevelDown.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/changeBotLevelDown.ts) |
| 68 | `CLICK_OCCUPIED_CELL` | `clown` 🤡 | Người chơi bấm nhầm vào ô cờ đã có quân đóng sẵn. | [clickOccupiedCell.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/clickOccupiedCell.ts) |
| 69 | `TAB_BLUR` | `angry` 😤 | Người chơi chuyển sang tab trình duyệt khác, bỏ rơi ván cờ. | [tabBlur.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tabBlur.ts) |
| 70 | `TAB_FOCUS` | `smug` 😏 | Người chơi quay trở lại tab game sau khi chuyển đi. | [tabFocus.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/tabFocus.ts) |
| 71 | `LATE_NIGHT_PLAY` | `sleepy` 😴 | Người chơi bắt đầu ván cờ vào khung giờ đêm khuya (00:00 – 04:59 AM). | [lateNightPlay.ts](file:///c:/Users/kien.hm/Desktop/gomoku/src/data/taunts/system/lateNightPlay.ts) |

---

## 🚀 HƯỚNG DẪN SỬ DỤNG BỘ CÔNG CỤ CLI

Dự án cung cấp các lệnh CLI cực kỳ tiện lợi được tích hợp sẵn trong [package.json](file:///c:/Users/kien.hm/Desktop/gomoku/package.json):

### 1. Báo cáo thống kê toàn diện kho thoại
```bash
bun run taunts:stats
```

### 2. Đọc toàn bộ câu thoại theo từng sự kiện
```bash
# Xem danh sách 71 sự kiện & thống kê số câu
bun run taunts:read --list

# Đọc toàn bộ câu thoại của một sự kiện bất kỳ (không phân biệt hoa/thường)
bun run taunts:read BOT_WIN
bun run taunts:read immediate_revenge_click
bun run taunts:read dead_four_blocked
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
