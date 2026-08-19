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

  // 2. Idle (6 sự kiện)
  | 'STARE_AT_WIN_LINE'
  | 'IDLE_THINKING'
  | 'IDLE_IN_GAME'
  | 'IDLE_PRE_GAME'
  | 'IDLE_AFTER_LOSS'
  | 'SUPER_SLOW_MOVE'

  // 3. Interaction (35 sự kiện)
  | 'HOVER_UNDO_HESITATION'
  | 'RESIGN_WHILE_AI_THINKING'
  | 'CLICK_OWN_STONE'
  | 'MOUSE_LEAVE_VIEWPORT'
  | 'IMMEDIATE_REVENGE_CLICK'
  | 'UNDO_BEFORE_AI_MOVES'
  | 'KEYBOARD_SMASH_SPAM'
  | 'RIGHT_CLICK_INSPECT'
  | 'WINDOW_RESIZE_PANIC'
  | 'DRAG_SELECT_PANIC'
  | 'GAME_START'
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
  | 'OPEN_RULES'
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
  | 'smug'        // 😏 Cười khẩy đắc thắng
  | 'laugh'       // 🤣 Cười ngả nghiêng
  | 'clown'       // 🤡 Mặt hề (Blunder, tự hủy, bấm ẩu, bắt chước)
  | 'cool'        // 😎 Ngầu đét (Khai cuộc, bot tiên thủ, tăng độ khó)
  | 'evil'        // 😈 Ác quỷ mưu mô (Gài bẫy sát cục)
  | 'angry'       // 😤 Bực mình phì khói
  | 'rage'        // 🤬 Nổi trận lôi đình (Bị chọc poke bot, spam nút, đập phím)
  | 'bored'       // 🥱 Ngáp ngủ (Nghĩ lâu, ván cờ 100 quân, đổ bê tông)
  | 'sleepy'      // 😴 Ngủ khò khò (AFK sâu, cày đêm khuya)
  | 'shocked'     // 😳 Bất ngờ mở to mắt (Bẫy đôi 3-3, nước đi tốt, clean sweep)
  | 'mindblown'   // 🤯 Choáng váng nổ đầu (Lội ngược dòng, ngắt chuỗi)
  | 'thinking'    // 🤔 Đăm chiêu suy nghĩ (Hover ngập ngừng)
  | 'disdain'     // 😒 Khinh bỉ liếc xéo (Undo, dạt góc, dạt mép viền, hạ cấp, bám đuôi)
  | 'salute'      // 🫡 Chào tiễn biệt (Người chơi đầu hàng, thắng no-undo)
  | 'relieved'    // 😅 Cười trừ toát mồ hôi (Hòa cờ)
  | 'detective'   // 🧐 Kính lúp soi xét (Xem luật, xem thống kê, đổi theme, inspect)
  | 'party'       // 🥳 Ăn mừng tưng bừng (Level up, marathon 10 ván)
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
