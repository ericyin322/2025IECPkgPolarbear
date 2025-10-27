import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";


export class HandGesture {
    private recognizer: GestureRecognizer | null = null;
    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private buffer: number[] = [];


    constructor(videoId: string, canvasId: string) {
        this.video = document.getElementById(videoId) as HTMLVideoElement;
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
    }
    async init() {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            // 指向 @mediapipe/tasks-vision 之 wasm 路徑（Vite 會從 node_modules 供應）
            // 也可複製到 public 再改為 '/wasm' 路徑。
            'node_modules/@mediapipe/tasks-vision/wasm'
        )
        this.recognizer = await GestureRecognizer.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
            },
            numHands: 2,
            runningMode: "VIDEO"
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        this.video.srcObject = stream
        await this.video.play()
        this.loop();
    }
    private loop = () => {
        requestAnimationFrame(this.loop);
        if (!this.recognizer) return;
        const result = this.recognizer.recognizeForVideo(this.video, performance.now());
        if (result.landmarks && result.landmarks[0]) {
            const gesture = this.classifyGesture(result.landmarks[0]);
            this.buffer.push(gesture);
            if (this.buffer.length > 12) this.buffer.shift();
        }

        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    };
    private classifyGesture(landmarks: any): number {
        // 簡單判斷指頭數量
        // 這裡應根據關節角度做更精確判斷，為示範用
        const fingers = [8, 12, 16];
        let count = 0;
        for (const idx of fingers) {
            const tip = landmarks[idx];
            const base = landmarks[idx - 2];
            if (tip.y < base.y) count++;
        }
        return count; // 0~3
    }


    getStableGesture(): number {
        const mode = this.buffer.sort((a, b) =>
            this.buffer.filter(v => v === a).length - this.buffer.filter(v => v === b).length
        ).pop();
        const confidence = this.buffer.filter(x => x === mode && x !== 0).length / this.buffer.length;
        return confidence > 0.7 ? mode || 0 : 0;
    }
}