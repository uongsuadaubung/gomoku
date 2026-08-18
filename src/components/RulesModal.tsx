import { Component, Show } from 'solid-js';
import { X, BookOpen, CheckCircle, Zap, Lightbulb } from 'lucide-solid';
import { GameStore } from '../store/gameStore';
import { ModalBotTaunt } from './ModalBotTaunt';

interface RulesModalProps {
  store: GameStore;
}

export const RulesModal: Component<RulesModalProps> = props => {
  const { store } = props;

  return (
    <Show when={store.showRulesModal()}>
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 class="text-lg font-black text-white">Hướng Dẫn & Luật Chơi</h2>
                <p class="text-xs text-slate-400">Luật chơi Gomoku 15x15</p>
              </div>
            </div>

            <button
              onClick={() => store.setShowRulesModal(false)}
              class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div class="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed flex-1">
            {/* Lời thoại của Bot */}
            <ModalBotTaunt store={store} />
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h3 class="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <CheckCircle size={16} /> 1. Mục Tiêu Trận Đấu
              </h3>
              <p>
                Hai bên lần lượt đặt từng quân cờ vào các giao điểm trống trên bàn cờ 15x15. Người đầu tiên xếp được <strong>chuỗi 5 quân liên tiếp</strong> (ngang, dọc hoặc chéo) không bị ngắt quãng sẽ <strong>chiến thắng ngay lập tức</strong>.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 class="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
                <Zap size={16} /> 2. Các Đòn Tấn Công Quyết Định
              </h3>
              <ul class="space-y-2 list-disc list-inside">
                <li>
                  <strong class="text-white">4 Mở 2 đầu (_XXXX_):</strong> Không thể bị đối thủ hóa giải vì họ chỉ chặn được 1 đầu, đầu còn lại bạn sẽ đánh để đạt 5 quân.
                </li>
                <li>
                  <strong class="text-white">3 Mở 2 đầu (_XXX_):</strong> Chuẩn bị biến thành 4 mở. Đối thủ bắt buộc phải nhảy vào chặn 1 trong 2 đầu.
                </li>
                <li>
                  <strong class="text-white">Thế đôi 3-3 hoặc 4-3:</strong> Đặt 1 quân cờ tạo ra đồng thời 2 đường công. Đối thủ chỉ có thể chặn 1 đường, đường kia bạn sẽ thắng!
                </li>
              </ul>
            </div>

            <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h3 class="text-sm font-bold text-emerald-400 mb-2">
                3. Chiến Lược Đấu Với Bot
              </h3>
              <p>
                - Ở những cấp độ đầu, đối thủ sẽ chơi cởi mở và để lộ một số khoảng trống bẫy 3-3.<br/>
                - Khi bạn thắng nhiều hơn, đối thủ sẽ mở rộng tầm nhìn chiến thuật và liên tục tạo các chuỗi tấn công cưỡng bức. Hãy luôn duy trì quyền Tiên Thủ (chủ động tấn công) để không bị rơi vào thế thủ!
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <h3 class="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Lightbulb size={16} /> 4. Mẹo Chiến Thuật Bỏ Túi
              </h3>
              <ul class="space-y-1.5 list-disc list-inside text-slate-300">
                <li>
                  <strong class="text-white">Chiếm trung tâm sớm:</strong> Hạ quân gần ô Thiên Nguyên (7, 7) ở khai cuộc để kiểm soát tối đa các đường ngang, dọc và chéo.
                </li>
                <li>
                  <strong class="text-white">Cảnh giác đòn hiểm:</strong> Luôn chú ý các nước tạo <strong class="text-sky-300">3 mở</strong> và <strong class="text-amber-300">bẫy đôi 4-3, 3-3</strong> của đối thủ khi cấp độ nâng cao.
                </li>
                <li>
                  <strong class="text-white">Phòng ngự chủ động:</strong> Đừng chỉ chặn khi đối phương đã có 3 quân; hãy chặn các hướng phát triển tiềm năng ngay từ khi họ có 2 quân mở.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
