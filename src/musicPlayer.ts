// music-player.ts
export type MusicPlayerOptions = {
  /** 初始音量，0~1（預設 1） */
  volume?: number;
  /** 是否初始就循環（預設 false） */
  loop?: boolean;
  /** 載入新歌曲時是否自動播放（預設 true） */
  autoplay?: boolean;
  /** audio preload（預設 'auto'） */
  preload?: 'none' | 'metadata' | 'auto';
  /** volumeUp/Down 的單步增減（預設 0.1） */
  step?: number;
  /** 當載入超過多久仍無法播放就放棄（毫秒，預設 8000） */
  loadTimeoutMs?: number;
};

type LoadResult = {
  /** 媒體總長度（秒） */
  duration: number | null;
  /** 解析到的實際來源（可能被瀏覽器轉換） */
  src: string;
};

export class MusicPlayer {
  private audio: HTMLAudioElement;
  private defaultAutoplay: boolean;
  private defaultStep: number;
  private loadTimeoutMs: number;

  /** 目前來源（你最後一次 load/change 的 src） */
  public currentSrc: string | null = null;

  constructor(opts: MusicPlayerOptions = {}) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('MusicPlayer 需要在瀏覽器環境執行。');
    }

    this.audio = new Audio();
    this.audio.preload = opts.preload ?? 'auto';
    this.audio.loop = !!opts.loop;
    this.audio.volume = this.clamp(opts.volume ?? 1, 0, 1);
    this.defaultAutoplay = opts.autoplay ?? true;
    this.defaultStep = opts.step ?? 0.1;
    this.loadTimeoutMs = opts.loadTimeoutMs ?? 8000;

    // 避免 Safari 在未使用者互動下自動播放被阻擋時丟出未捕捉的拒絕
    this.audio.addEventListener('play', () => {
      // no-op; 僅確保事件鏈存在
    });
  }

  /** 載入一首歌（mp3 路徑/URL）。預設載入完成後自動播放。 */
  async load(src: string, autoplay: boolean = this.defaultAutoplay): Promise<LoadResult> {
    this.teardownSourceListeners();
    this.audio.src = src;
    this.currentSrc = src;

    const { duration } = await this.waitUntilCanPlay(this.loadTimeoutMs);

    if (autoplay) {
      await this.safePlay();
    }
    return { duration, src: this.audio.currentSrc || src };
  }

  /** 同 load；語意化別名 */
  async changeTrack(src: string, autoplay: boolean = this.defaultAutoplay): Promise<LoadResult> {
    return this.load(src, autoplay);
  }

  /** 開始播放（或從當前時間繼續播放） */
  async play(): Promise<void> {
    await this.safePlay();
  }

  /** 暫停播放（保留當前時間位置） */
  pause(): void {
    this.audio.pause();
  }

  /** 停止播放並把時間歸零 */
  stop(): void {
    this.audio.pause();
    // 對於某些瀏覽器，將 currentTime 設為 0 可能需先檢查是否已載入
    try {
      this.audio.currentTime = 0;
    } catch {
      // 若尚未載入完成，忽略
    }
  }

  /** 從暫停位置恢復播放（若已停止則從 0 開始） */
  async resume(): Promise<void> {
    await this.safePlay();
  }

  /** 設定是否循環播放 */
  setLoop(loop: boolean): void {
    this.audio.loop = loop;
  }

  /** 切換循環播放 */
  toggleLoop(): boolean {
    this.audio.loop = !this.audio.loop;
    return this.audio.loop;
  }

  /** 設定音量（0~1） */
  setVolume(v: number): number {
    this.audio.volume = this.clamp(v, 0, 1);
    return this.audio.volume;
  }

  /** 增加音量（預設 step=0.1，可自訂） */
  volumeUp(step: number = this.defaultStep): number {
    return this.setVolume(this.audio.volume + Math.abs(step));
  }

  /** 降低音量（預設 step=0.1，可自訂） */
  volumeDown(step: number = this.defaultStep): number {
    return this.setVolume(this.audio.volume - Math.abs(step));
  }

  /** 靜音或取消靜音 */
  setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  toggleMuted(): boolean {
    this.audio.muted = !this.audio.muted;
    return this.audio.muted;
  }

  /** 取得目前是否正在播放中 */
  get isPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended;
  }

  /** 目前播放時間（秒） */
  get currentTime(): number {
    return this.audio.currentTime;
  }

  /** 設定目前播放時間（秒） */
  set currentTimeSec(sec: number) {
    this.audio.currentTime = this.clamp(sec, 0, Number.isFinite(this.audio.duration) ? this.audio.duration : sec);
  }

  /** 曲目總長度（秒；未載入完成時可能為 NaN 或 Infinity，這裡回傳 null） */
  get duration(): number | null {
    return Number.isFinite(this.audio.duration) ? this.audio.duration : null;
  }

  /** 釋放資源（可選） */
  dispose(): void {
    this.teardownSourceListeners();
    this.audio.pause();
    // 停止下載
    this.audio.removeAttribute('src');
    // 觸發重新載入以清掉 buffer
    try {
      this.audio.load();
    } catch {
      // ignore
    }
  }

  // ------------------ private helpers ------------------

  private clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  }

  private waitUntilCanPlay(timeoutMs: number): Promise<{ duration: number | null }> {
    return new Promise((resolve, reject) => {
      let done = false;
      const onReady = () => {
        if (done) return;
        done = true;
        cleanup();
        const d = Number.isFinite(this.audio.duration) ? this.audio.duration : null;
        resolve({ duration: d });
      };
      const onError = () => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error(`音訊載入失敗：${this.audio.error?.message ?? 'unknown error'}`));
      };
      const cleanup = () => {
        this.audio.removeEventListener('loadedmetadata', onReady);
        this.audio.removeEventListener('loadeddata', onReady);
        this.audio.removeEventListener('canplay', onReady);
        this.audio.removeEventListener('canplaythrough', onReady);
        this.audio.removeEventListener('error', onError);
      };

      const t = window.setTimeout(() => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error(`音訊載入逾時（>${timeoutMs}ms）`));
      }, timeoutMs);

      const finalize = (fn: () => void) => () => {
        window.clearTimeout(t);
        fn();
      };

      this.audio.addEventListener('loadedmetadata', finalize(onReady), { once: true });
      this.audio.addEventListener('loadeddata', finalize(onReady), { once: true });
      this.audio.addEventListener('canplay', finalize(onReady), { once: true });
      this.audio.addEventListener('canplaythrough', finalize(onReady), { once: true });
      this.audio.addEventListener('error', finalize(onError), { once: true });
    });
  }

  private async safePlay(): Promise<void> {
    try {
      await this.audio.play();
    } catch (err: any) {
      // 若被瀏覽器的自動播放政策阻擋（需使用者互動），直接拋出可讀訊息
      if (err?.name === 'NotAllowedError') {
        // throw new Error('播放被瀏覽器阻擋：請在使用者互動（例如點擊）之後再呼叫 play/resume。');
      }
      throw err;
    }
  }

  private teardownSourceListeners(): void {
    // 若未來你有加自訂事件監聽，可集中清理；目前無需特別處理
  }
}
