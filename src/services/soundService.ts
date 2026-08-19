import { StorageService } from './storageService';

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.isMuted = StorageService.getMuted();
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    StorageService.setMuted(muted);
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Âm thanh gõ quân cờ xuống bàn (tiếng gỗ / đá đanh và tự nhiên)
   */
  public playStoneSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Biến thiên tần số ngẫu nhiên nhẹ để mỗi lần gõ cờ đều sinh động
    const pitchOffset = (Math.random() - 0.5) * 60;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650 + pitchOffset, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Âm thanh chiến thắng
   */
  public playWinSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const now = ctx.currentTime + index * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /**
   * Âm thanh thất bại
   */
  public playLossSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [440, 370, 311, 261]; // A4, F#4, Eb4, C4
    notes.forEach((freq, index) => {
      const now = ctx.currentTime + index * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  /**
   * Âm thanh thăng cấp Level AI
   */
  public playLevelUpSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const chords = [
      [440, 554.37, 659.25], // A major
      [587.33, 739.99, 880], // D major
    ];

    chords.forEach((chord, chordIdx) => {
      chord.forEach(freq => {
        const now = ctx.currentTime + chordIdx * 0.22;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      });
    });
  }

  /**
   * Âm thanh click nút giao diện
   */
  public playClickSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Âm thanh bong bóng thoại pop-up khi Bot phát biểu
   */
  public playPopSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Âm thanh gõ chữ thoại hoạt hình 8-bit (Gibberish chatter blip)
   */
  public playVoiceBlip(mood: string = 'smug'): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const voiceConfigMap: Record<string, { base: number; variance: number; type: OscillatorType }> = {
      rage: { base: 180, variance: 50, type: 'sawtooth' },
      angry: { base: 180, variance: 50, type: 'sawtooth' },
      laugh: { base: 580, variance: 120, type: 'sine' },
      clown: { base: 580, variance: 120, type: 'sine' },
      party: { base: 580, variance: 120, type: 'sine' },
      shocked: { base: 320, variance: 80, type: 'sawtooth' },
      mindblown: { base: 320, variance: 80, type: 'sawtooth' },
      sleepy: { base: 220, variance: 30, type: 'sine' },
      bored: { base: 220, variance: 30, type: 'sine' },
    };

    const cfg = voiceConfigMap[mood] || { base: 390, variance: 90, type: 'triangle' };
    const baseFreq = cfg.base + Math.random() * cfg.variance;
    const waveType: OscillatorType = cfg.type;

    osc.type = waveType;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.035);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundService = new SoundService();

