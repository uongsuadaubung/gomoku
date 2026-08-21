export type TauntEvent =
  // 1. Gameplay (48 sự kiện)
  | 'BOT_WIN'
  | 'PLAYER_WIN'
  | 'PLAYER_WIN_WITH_UNDO'
  | 'WIN_RIGHT_AFTER_UNDO'
  | 'BOT_WIN_LEADING_SCORE'
  | 'MISSED_WINNING_MOVE'
  | 'BLOCK_WRONG_END'
  | 'BLOCK_AND_COUNTER_FOUR'
  | 'TURTLE_DEFENSE'
  | 'ISOLATED_FAR_MOVE'
  | 'ACCIDENTAL_SELF_BLOCK'
  | 'DEAD_FOUR_BLOCKED'
  | 'SURRENDER_ON_THREAT'
  | 'SURRENDER_AFTER_LONG_THINKING'
  | 'FORK_ATTACK_DEFENSE_FAIL'
  | 'CLOSE_COMBAT_HUG'
  | 'SPLIT_BOARD_EXPEDITION'
  | 'TRIANGLE_FORMATION'
  | 'CLEAN_SWEEP_DOMINATION'
  | 'IRON_CURTAIN_WIN'
  | 'PLAYER_RESIGN'
  | 'TIMEOUT_LOSS'
  | 'PLAYER_UNDO'
  | 'BLUNDER_MOVE'
  | 'BOT_TRAP'
  | 'FAST_MOVE_TAUNT'
  | 'BOT_BLOCK_THREAT'
  | 'CORNER_MOVE'
  | 'CENTER_MOVE'
  | 'LONG_GAME'
  | 'GAME_DRAW'
  | 'PLAYER_STREAK_WIN'
  | 'REVENGE_WIN_AFTER_LOSS_STREAK'
  | 'CONSECUTIVE_SPEED_LOSSES'
  | 'SYMMETRY_BREAK_SURPRISE'
  | 'RUSH_MOVE'
  | 'EDGE_WALK_MOVE'
  | 'DOUBLE_THREE_TRAP'
  | 'COMEBACK_WIN'
  | 'NO_UNDO_WIN'
  | 'SPEED_WIN_QUICK'
  | 'CLUTCH_100_STONES'
  | 'COPYCAT_MOVE'
  | 'JUMP_THREE_TRAP'
  | 'OVERCONFIDENT_BLIND_ATTACK'
  | 'BOX_SURROUND_CENTER'
  | 'FULL_DIAGONAL_HIGHWAY'
  | 'CONSECUTIVE_DRAWS'
  | 'GOD_LEVEL_VICTORY'
  | 'FOUR_THREE_DOUBLE_ATTACK'
  | 'OPEN_FOUR_BLUNDER'
  | 'REPEATED_UNDO_SAME_MOVE'
  | 'DIAGONAL_CROSS_FORMATION'
  | 'TIT_FOR_TAT_DRAWS'
  | 'T_SHAPE_FORMATION'
  | 'ZIGZAG_LIGHTNING'
  | 'DOUBLE_DEAD_FOUR'
  | 'CORNER_DEATH_TRAP'
  | 'CHECKERBOARD_WEAVE'
  | 'OVERTHINKING_BLUNDER'
  | 'ONE_MINUTE_BULLET_WIN'
  | 'UNLUCKY_THIRTEEN_MOVES'
  | 'SPEED_REVENGE_FAIL'

  // 2. Idle (7 sự kiện)
  | 'STARE_AT_WIN_LINE'
  | 'IDLE_THINKING'
  | 'IDLE_IN_GAME'
  | 'IDLE_PRE_GAME'
  | 'IDLE_AFTER_LOSS'
  | 'IDLE_AFTER_WIN'
  | 'SUPER_SLOW_MOVE'

  // 3. Interaction (38 sự kiện)
  | 'HOVER_UNDO_HESITATION'
  | 'RESIGN_WHILE_AI_THINKING'
  | 'CLICK_OWN_STONE'
  | 'CLICK_AFTER_WIN'
  | 'MOUSE_LEAVE_VIEWPORT'
  | 'IMMEDIATE_REVENGE_CLICK'
  | 'UNDO_BEFORE_AI_MOVES'
  | 'KEYBOARD_SMASH_SPAM'
  | 'RIGHT_CLICK_INSPECT'
  | 'WINDOW_RESIZE_PANIC'
  | 'DRAG_SELECT_PANIC'
  | 'GAME_START'
  | 'START_AFTER_WIN'
  | 'START_AFTER_LOSS'
  | 'PLAYER_GOOD_MOVE'
  | 'HESITATION_DANCE'
  | 'RAGE_DOWNGRADE_AFTER_LOSS'
  | 'POKE_BOT'
  | 'SWAP_SIDE_BOT_FIRST'
  | 'SWAP_SIDE_PLAYER_FIRST'
  | 'STREAK_LOSS'
  | 'BREAK_LOSS_STREAK'
  | 'LEVEL_UP_ALERT'
  | 'CLICK_BEFORE_START'
  | 'MULTI_UNDO'
  | 'SPAM_POKE_BOT'
  | 'CLICK_AFTER_GAME_OVER'
  | 'LONG_HOVER_CELL'
  | 'MARATHON_SERIES'
  | 'MOUSE_JIGGLE_PANIC'
  | 'CTRL_Z_SHORTCUT_ATTEMPT'
  | 'DOUBLE_CLICK_STONE'
  | 'DEVTOOLS_INSPECT_HACK'
  | 'WHEEL_ZOOM_ATTEMPT'
  | 'COPY_TAUNT_TEXT'
  | 'SCREENSHOT_ATTEMPT'
  | 'QUICK_MULTI_CELL_CLICKS'
  | 'SPACEBAR_SMASH'

  // 4. System & UI (29 sự kiện)
  | 'RAPID_THEME_CYCLING'
  | 'SWITCH_BOARD_STYLE_MID_GAME'
  | 'SOUND_SPAM_TOGGLE'
  | 'DESPERATE_THEME_SWAP'
  | 'THEME_CHANGE'
  | 'BOARD_STYLE_CHANGE'
  | 'SOUND_MUTE'
  | 'SOUND_UNMUTE'
  | 'TOGGLE_STEP_NUMBERS'
  | 'OPEN_STATS'
  | 'CHANGE_BOT_LEVEL_DOWN'
  | 'CHANGE_BOT_LEVEL_UP'
  | 'TAB_BLUR'
  | 'TAB_FOCUS'
  | 'CLICK_OCCUPIED_CELL'
  | 'RESET_STATS'
  | 'OPEN_BOT_MODAL'
  | 'LATE_NIGHT_PLAY'
  | 'EARLY_MORNING_COFFEE'
  | 'LUNCH_BREAK_RUSH'
  | 'WEEKEND_CHILL'
  | 'RAGE_QUIT_F5_RELOAD'
  | 'MONDAY_BLUES'
  | 'TGIF_FRIDAY_AFTERNOON'
  | 'AFTERNOON_FOOD_COMA'
  | 'MIDNIGHT_BATTERY_LOW'
  | 'PERFECT_CENTURY_GAMES'
  | 'WIN_RATE_DROP_BELOW_50';

export type BotMood =
  | 'disdain'     // 😒 Khinh bỉ / Phủ nhận đối thủ (Người chơi thắng ăn may, đi nước hay do rùa, dùng Undo, dạt mép biên, hạ cấp)
  | 'smug'        // 😏 Cười khẩy đắc thắng / Gáy bẩn (Bot thắng, dẫn điểm, người chơi đầu hàng, F5 reload, chụp ảnh màn hình)
  | 'laugh'       // 🤣 Cười ngả nghiêng chế giễu (Người chơi thua chuỗi, thua nhanh, bỏ lỡ 4 mở, 100 ván ăn hành)
  | 'clown'       // 🤡 Coi đối thủ là gánh xiếc (Blunder tự hủy, bắt chước máy móc, xếp cờ tam giác/chữ T)
  | 'detective'   // 🧐 Kính lúp bắt thóp (F12 devtools, xem luật, xem thống kê, đổi theme, zoom bàn cờ)
  | 'bored'       // 🥱 Chê bai đối thủ nhàm chán (Thủ rùa bò, ván cờ 100 quân, ngâm cờ quá lâu, hòa liên tiếp)
  | 'sleepy'      // 😴 Buồn ngủ / Khinh thường (AFK, chuột rời màn hình, cày đêm muộn, trưa buồn ngủ)
  | 'thinking'    // 🤔 Đăm chiêu phân tích (Hover ngập ngừng, dệt so le, quây tâm)
  | 'evil'        // 😈 Ác quỷ mưu mô (Bẫy 4-3 sát cục, bẫy 3 nhảy cóc, góc tử thần)
  | 'lightning'   // ⚡ Gáy về tốc độ hủy diệt (Đánh vội, 1 phút bullet, thắng chớp nhoáng, zic-zắc)
  | 'cool'        // 😎 Ngầu đét chấp đối thủ (Khai cuộc, cao tốc đường chéo, tăng độ khó)
  | 'panic'       // 😱 Cà khịa sự hoảng loạn của đối thủ (Kéo rê chuột, lắc chuột, resize màn hình, click loạn)
  | 'chill'       // ☕ Thảnh thơi vừa uống cà phê vừa bán hành (Sáng sớm, nghỉ trưa, đầu tuần, cuối tuần)
  | 'rage'        // 🤬 Nổi đóa bật lại (Đập phím, spam phím cách, spam chọc bot, spam loa)
  | 'party'       // 🥳 Ăn mừng thành tích của bot (Level up, marathon 10 ván, chiều thứ 6)
  | 'angry'       // 😤 Bực dọc (Chọc nhẹ bot, rời tab)
  | 'shush';      // 🤫 Suỵt im lặng (Mute âm thanh)

export interface TauntItem {
  text: string;
  mood: BotMood;
}

export interface TauntDefinition {
  event: TauntEvent;
  mood: BotMood;
  texts: string[];
}
