export type TauntEvent =
  // 1. Gameplay (30 sự kiện)
  | 'BOT_WIN'
  | 'PLAYER_WIN'
  | 'PLAYER_WIN_WITH_UNDO'
  | 'BOT_WIN_LEADING_SCORE'
  | 'MISSED_WINNING_MOVE'
  | 'BLOCK_WRONG_END'
  | 'TURTLE_DEFENSE'
  | 'ISOLATED_FAR_MOVE'
  | 'ACCIDENTAL_SELF_BLOCK'
  | 'DEAD_FOUR_BLOCKED'
  | 'SURRENDER_ON_THREAT'
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
  | 'RUSH_MOVE'
  | 'EDGE_WALK_MOVE'
  | 'DOUBLE_THREE_TRAP'
  | 'COMEBACK_WIN'
  | 'NO_UNDO_WIN'
  | 'SPEED_WIN_QUICK'
  | 'CLUTCH_100_STONES'
  | 'COPYCAT_MOVE'

  // 2. Idle (6 sự kiện)
  | 'STARE_AT_WIN_LINE'
  | 'IDLE_THINKING'
  | 'IDLE_IN_GAME'
  | 'IDLE_PRE_GAME'
  | 'IDLE_AFTER_LOSS'
  | 'SUPER_SLOW_MOVE'

  // 3. Interaction (18 sự kiện)
  | 'IMMEDIATE_REVENGE_CLICK'
  | 'UNDO_BEFORE_AI_MOVES'
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

  // 4. System & UI (17 sự kiện)
  | 'SOUND_SPAM_TOGGLE'
  | 'DESPERATE_THEME_SWAP'
  | 'THEME_CHANGE'
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
  | 'BOARD_STYLE_CHANGE'
  | 'OPEN_BOT_MODAL'
  | 'LATE_NIGHT_PLAY';

export type BotMood =
  | 'smug'        // 😏 Cười khẩy đắc thắng
  | 'laugh'       // 🤣 Cười ngả nghiêng
  | 'clown'       // 🤡 Mặt hề (Blunder, tự hủy, bấm ẩu, bắt chước)
  | 'cool'        // 😎 Ngầu đét (Khai cuộc, bot tiên thủ, tăng độ khó)
  | 'evil'        // 😈 Ác quỷ mưu mô (Gài bẫy sát cục)
  | 'angry'       // 😤 Bực mình phì khói
  | 'rage'        // 🤬 Nổi trận lôi đình (Bị chọc poke bot, spam nút)
  | 'bored'       // 🥱 Ngáp ngủ (Nghĩ lâu, ván cờ dài 100 quân)
  | 'sleepy'      // 😴 Ngủ khò khò (AFK sâu, cày đêm khuya)
  | 'shocked'     // 😳 Bất ngờ mở to mắt (Bẫy đôi 3-3, nước đi tốt)
  | 'mindblown'   // 🤯 Choáng váng nổ đầu (Lội ngược dòng, ngắt chuỗi)
  | 'thinking'    // 🤔 Đăm chiêu suy nghĩ (Hover ngập ngừng)
  | 'disdain'     // 😒 Khinh bỉ liếc xéo (Undo, dạt góc, dạt mép viền, hạ cấp)
  | 'salute'      // 🫡 Chào tiễn biệt (Người chơi đầu hàng, thắng no-undo)
  | 'relieved'    // 😅 Cười trừ toát mồ hôi (Hòa cờ)
  | 'detective'   // 🧐 Kính lúp soi xét (Xem luật, xem thống kê, đổi theme)
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
