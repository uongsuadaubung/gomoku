export type TauntEvent =
  | 'BOT_WIN'
  | 'PLAYER_RESIGN'
  | 'PLAYER_UNDO'
  | 'BLUNDER_MOVE'
  | 'BOT_TRAP'
  | 'IDLE_THINKING'
  | 'IDLE_IN_GAME'
  | 'IDLE_PRE_GAME'
  | 'IDLE_AFTER_LOSS'
  | 'GAME_START'
  | 'PLAYER_GOOD_MOVE'
  | 'POKE_BOT'
  | 'SWAP_SIDE_BOT_FIRST'
  | 'SWAP_SIDE_PLAYER_FIRST'
  | 'FAST_MOVE_TAUNT'
  | 'BOT_BLOCK_THREAT'
  | 'THEME_CHANGE'
  | 'SOUND_MUTE'
  | 'SOUND_UNMUTE'
  | 'STREAK_LOSS'
  | 'BREAK_LOSS_STREAK'
  | 'CORNER_MOVE'
  | 'TOGGLE_STEP_NUMBERS'
  | 'OPEN_STATS'
  | 'CHANGE_BOT_LEVEL_DOWN'
  | 'CHANGE_BOT_LEVEL_UP'
  | 'TAB_BLUR'
  | 'TAB_FOCUS'
  | 'OPEN_RULES'
  | 'CLICK_OCCUPIED_CELL'
  | 'CENTER_MOVE'
  | 'LONG_GAME'
  | 'GAME_DRAW'
  | 'RESET_STATS'
  | 'BOARD_STYLE_CHANGE'
  | 'CLICK_BEFORE_START'
  | 'LEVEL_UP_ALERT'
  | 'PLAYER_WIN'
  | 'MULTI_UNDO'
  | 'SUPER_SLOW_MOVE'
  | 'RUSH_MOVE'
  | 'PLAYER_STREAK_WIN'
  | 'OPEN_BOT_MODAL'
  | 'SPAM_POKE_BOT';

export type BotMood =
  | 'smug'        // 😏 Cười khẩy đắc thắng
  | 'laugh'       // 🤣 Cười ngả nghiêng
  | 'clown'       // 🤡 Mặt hề (Blunder, tự hủy, bấm ẩu)
  | 'cool'        // 😎 Ngầu đét (Khai cuộc, bot tiên thủ, tăng độ khó)
  | 'evil'        // 😈 Ác quỷ mưu mô (Gài bẫy sát cục)
  | 'angry'       // 😤 Bực mình phì khói
  | 'rage'        // 🤬 Nổi trận lôi đình (Bị chọc poke bot)
  | 'bored'       // 🥱 Ngáp ngủ (Nghĩ lâu, ván cờ dài)
  | 'sleepy'      // 😴 Ngủ khò khò (AFK sâu)
  | 'shocked'     // 😳 Bất ngờ mở to mắt
  | 'mindblown'   // 🤯 Choáng váng nổ đầu (Ngắt chuỗi)
  | 'thinking'    // 🤔 Đăm chiêu suy nghĩ
  | 'disdain'     // 😒 Khinh bỉ liếc xéo (Undo, dạt góc, hạ cấp, reset)
  | 'salute'      // 🫡 Chào tiễn biệt (Người chơi đầu hàng)
  | 'relieved'    // 😅 Cười trừ toát mồ hôi (Hòa cờ)
  | 'detective'   // 🧐 Kính lúp soi xét (Xem luật, xem thống kê, đổi theme)
  | 'party'       // 🥳 Ăn mừng tưng bừng (Level up)
  | 'shush';      // 🤫 Suỵt im lặng (Mute âm thanh)

export interface TauntItem {
  text: string;
  mood: BotMood;
}
