
import { Blizzard } from './blizzard'
// import { HandGesture } from "./gesture";
import { questions } from "./data/questions";
import { MusicPlayer } from './musicPlayer';
export class GameEngine {
  private qusuiEl: any;
  private scoreEl: any;
  private statusEl: any;
  private timeEl: any;
  private hintEl: any;
  private overlayEl: any;
  private startBtn: any;
  private summaryEl: any;
  private blizzard: Blizzard
  private Game: any;
  private musicPlayer: MusicPlayer;
  // private gesture: HandGesture;
  constructor() {
    // ----- UI -----
    this.qusuiEl = document.getElementById("ui-qus")!;
    this.scoreEl = document.getElementById('score');
    this.statusEl = document.getElementById('status');
    this.timeEl = document.getElementById('time');
    this.hintEl = document.getElementById('hint');
    this.overlayEl = document.getElementById('overlay');
    this.startBtn = document.getElementById('startBtn');
    this.summaryEl = document.getElementById('summary');
    this.blizzard = new Blizzard();
    this.musicPlayer = new MusicPlayer({
      volume: 0.8,
      loop: false,
      autoplay: true,   // 載入就播放
    });
    // this.blizzard.init();
    // ----- Game State Machine -----
    this.Game = {
      state: 'ready', // 'walking'|'encounter'|'window'|'resolve'|'ended'
      score: 0,
      currentQuestion: 0,
      currentAnswer: 0,
      successTarget: 5,
      walkDuration: 1.5,
      windowDuration: 5.0,
      timer: 0,
      totalStart: 0,
      windowOpen: false,
      keyHandled: false,
      lastTime: performance.now()
    };
    // this.gesture = new HandGesture("input_video", "output_canvas");
  }

  init() {

    // await this.gesture.init();
    // Resize handler
    window.addEventListener('resize', () => {
      this.blizzard.camera.aspect = window.innerWidth / window.innerHeight;
      this.blizzard.camera.updateProjectionMatrix();
      this.blizzard.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Key handling
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (this.Game.windowOpen && !this.Game.keyHandled) {
          this.Game.keyHandled = true;
          this.resolveEncounter(true);
        }
        e.preventDefault();
      }
    }, { passive: false });

    this.startBtn.addEventListener('click', () => {
      this.resetGame();
      this.startGame();
    });

    this.resetGame();
    this.animate();
  }

  setMsg(txt: any) { this.statusEl.textContent = txt; }
  setScore(n: any) { this.scoreEl.textContent = String(n); }
  showHint(show: any) { this.hintEl.classList.toggle('show', !!show); this.hintEl.classList.toggle('show', false); }

  resetGame() {
    this.Game.state = 'ready';
    this.Game.score = 0; this.setScore(this.Game.score);
    this.Game.timer = 0; this.timeEl.textContent = '0.0s';
    this.Game.windowOpen = false; this.Game.keyHandled = false;
    this.showHint(false);
    this.setMsg('等待開始');
    this.blizzard.bear.group.position.set(0, 0, 0);
    this.blizzard.bear.group.rotation.set(0, 0, 0);
    this.blizzard.bear.setMode('idle');
    if (this.blizzard.currentSeal) {
      this.blizzard.scene.remove(this.blizzard.currentSeal.group);
      this.blizzard.currentSeal = null;
    }
    if (this.blizzard.santa != null) this.blizzard.santa.model.position.set(0, -1000, 0);
    if (this.blizzard.oiiaioooooiai_cat != null) this.blizzard.oiiaioooooiai_cat.model.position.set(0, -1000, 0);
    if (this.blizzard.fox != null) this.blizzard.fox.model.position.set(0, -1000, 0);
    this.blizzard.controls.target.set(0, 2, 0);
    this.blizzard.controls.update();
    this.qusuiEl.style.display = 'none';

  }

  async startGame() {
    this.summaryEl.style.display = 'none';
    this.overlayEl.style.display = 'none';
    this.Game.totalStart = performance.now();
    this.transitionToWalking();
    await this.musicPlayer.load(`${import.meta.env.BASE_URL}Tiburtina - Schwartzy.mp3`);  // 若被瀏覽器阻擋，請在使用者點擊後再呼叫
    this.musicPlayer.resume()
  }

  transitionToWalking() {
    this.Game.state = 'walking';
    this.Game.timer = 0;
    this.setMsg('漫步中…');
    this.blizzard.bear.setMode('walk');
    // point forward to +X direction always
    this.blizzard.bear.group.rotation.y = 0;
  }

  openEncounterWindow() {
    this.Game.state = 'window'; this.Game.timer = 0; this.Game.windowOpen = true; this.Game.keyHandled = false;
    this.setMsg('遇到海豹！');
    this.blizzard.bear.setMode('ambush');
    this.blizzard.currentSeal.setMode('alert');
    this.showHint(true);
    this.renderQuestion();
  }
  private renderQuestion() {
    let self = this;
    const q = questions[this.Game.currentQuestion];
    this.qusuiEl.style.display = 'block';

    const qDiv = document.getElementById("question")!;
    const optDiv = document.getElementById("options")!;
    qDiv.innerText = `第 ${this.Game.currentQuestion + 1} 題：${q.stem}`;
    optDiv.innerHTML = "";
    q.options.forEach((opt, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "option";
      el.innerText = `${i + 1}. ${opt}`;
      el.addEventListener("click", () => {
        // const opts = document.querySelectorAll(".option");
        // opts.forEach(el => el.classList.remove("active"));
        // e.target.classList.add("active");
        self.Game.currentAnswer = i;
        // console.log(self.Game.currentAnswer )
        self.Game.keyHandled = true;

        const correct = i === q.answerIndex;
        if (correct) self.resolveEncounter(true);
        else self.resolveEncounter(false);

      })
      optDiv.appendChild(el);
    });



  }

  resolveEncounter(success: any) {
    this.Game.state = 'resolve'; this.Game.timer = 0; this.Game.windowOpen = false;
    this.showHint(false);
    this.Game.currentQuestion++;
    this.qusuiEl.style.display = 'none'
    if (success) {
      this.Game.score++; this.setScore(this.Game.score);
      this.setMsg('捕獲成功！');
      this.blizzard.bear.setMode('success');
      this.blizzard.currentSeal.setMode('caught');

      let bx = this.blizzard.bear.group.position.x;
      let bz = this.blizzard.bear.group.position.z;
      // this.blizzard.santa.model.position.set(bx - 10 + Math.random() * 20, 0, bz - 10 + Math.random() * 20);
      if (this.Game.score == 2) {
        this.blizzard.fox.model.position.set(bx + 10, 2, bz + 5 - Math.random() * 30)
      }
      if (this.Game.score == 3) {
        this.blizzard.oiiaioooooiai_cat.model.position.set(bx + 10, 0, bz + 5 - Math.random() * 30)
      }
      if (this.Game.score == 4) {
        this.blizzard.santa.model.position.set(bx + 10, 0, bz + 5 - Math.random() * 30)
      }


    } else {
      this.setMsg('失敗！海豹逃走了…');
      this.blizzard.bear.setMode('fail');
      this.blizzard.currentSeal.setMode('escape');
    }
  }

  maybeEnd() {
    if (this.Game.score >= this.Game.successTarget) {
      this.Game.state = 'ended';
      const totalMs = performance.now() - this.Game.totalStart;
      const sec = (totalMs / 1000).toFixed(2);
      this.overlayEl.style.display = 'flex';
      this.summaryEl.style.display = 'block';
      this.summaryEl.textContent = `恭喜！你捕獲了 5 隻海豹。總時間：${sec} 秒。`;
      this.setMsg('遊戲結束');
      this.resetGame();
    } else {
      this.transitionToWalking();
    }
  }

  // ----- Animation / Game Loop -----
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // console.log(this.gesture.getStableGesture())
    const now = performance.now();
    const dt = Math.min(0.033, (now - this.Game.lastTime) / 1000);
    this.Game.lastTime = now;

    this.blizzard.controls.update();
    if (this.blizzard.santa != null) this.blizzard.santa.mixer.update(dt);
    if (this.blizzard.taryk != null) this.blizzard.taryk.mixer.update(dt);
    if (this.blizzard.fox != null) this.blizzard.fox.mixer.update(dt);
    if (this.blizzard.bird_orange != null) this.blizzard.bird_orange.mixer.update(dt);
    if (this.blizzard.oiiaioooooiai_cat != null) this.blizzard.oiiaioooooiai_cat.mixer.update(dt);
    // Update animals
    this.blizzard.bear.update(dt);
    if (this.blizzard.currentSeal) this.blizzard.currentSeal.update(dt);
    this.blizzard.penguins.forEach((penguin: { update: (arg0: number) => void; }) => {penguin.update(dt) });
    // Update time display during active play
    if (['walking', 'encounter', 'window', 'resolve'].includes(this.Game.state)) {
      const elapsed = (now - this.Game.totalStart) / 1000;
      this.timeEl.textContent = `${elapsed.toFixed(1)}s`;
    }

    // State machine tick
    this.Game.timer += dt;
    switch (this.Game.state) {
      case 'walking': {
        // move bear forward
        const dx = this.blizzard.bear.state.speed * dt;
        this.blizzard.bear.group.position.x += dx;
        this.blizzard.camera.position.x += dx * 1; // follow a bit
        this.blizzard.controls.target.x += dx * 1;
        // after walkDuration, spawn a seal and prep encounter
        if (this.Game.timer >= this.Game.walkDuration) {
          this.blizzard.spawnSealAhead();
          this.Game.state = 'encounter'; this.Game.timer = 0; this.setMsg('靠近目標…');
        }
        break;
      }
      case 'encounter': {
        // walk closer until within range
        const targetX = this.blizzard.currentSeal.group.position.x - 4;
        const dx = Math.min(this.blizzard.bear.state.speed * dt, Math.max(0, targetX - this.blizzard.bear.group.position.x));
        this.blizzard.bear.group.position.x += dx;
        this.blizzard.camera.position.x += dx * 1; this.blizzard.controls.target.x += dx * 1;
        if (Math.abs(this.blizzard.bear.group.position.x - targetX) < 0.05) {
          this.openEncounterWindow();
        }
        break;
      }
      case 'window': {
        // wait for input up to windowDuration
        if (this.Game.timer >= this.Game.windowDuration) {
          if (!this.Game.keyHandled) this.resolveEncounter(false);
        }
        break;
      }
      case 'resolve': {
        // play out animation for a short time then proceed
        if (this.Game.timer >= 1.8) {
          if (this.blizzard.currentSeal) {
            // remove seal if out of view or caught
            if (this.blizzard.currentSeal.state.mode === 'escape' && this.blizzard.currentSeal.group.position.x < this.blizzard.bear.group.position.x - 4) {
              this.blizzard.scene.remove(this.blizzard.currentSeal.group);
              this.blizzard.currentSeal = null;
            } else if (this.blizzard.currentSeal.state.mode === 'caught') {
              this.blizzard.scene.remove(this.blizzard.currentSeal.group);
              this.blizzard.currentSeal = null;
            } else if (this.blizzard.currentSeal.state.mode === 'escape') {
              // force remove after 2s
              this.blizzard.scene.remove(this.blizzard.currentSeal.group); this.blizzard.currentSeal = null;
            }
          }
          this.maybeEnd();
        }
        break;
      }
      case 'ended':
      case 'ready':
      default: break;
    }

    this.blizzard.renderer.render(this.blizzard.scene, this.blizzard.camera);
  }


}