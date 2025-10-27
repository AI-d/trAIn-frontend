class AudioProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this.accumulated = [];     // 샘플 누적 버퍼
        this.sampleRate = sampleRate; // 48000
        this.targetSamples = Math.floor(this.sampleRate * 0.02); // 20ms = 960 samples
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]; // 첫 번째 입력 채널

        if (input.length > 0) {
            const channelData = input[0];

            this.accumulated.push(...channelData);

            // RMS 계산 예시 (볼륨 감지)
            let sum = 0;
            for (let i = 0; i < channelData.length; i++) {
                sum += channelData[i] * channelData[i];
            }
            const rms = Math.sqrt(sum / channelData.length);
            /*if(rms > 0.001) {
                const copyData = new Float32Array(channelData);
                this.port.postMessage(copyData, [copyData.buffer]);
            }*/
            if (this.accumulated.length >= this.targetSamples) {
                const chunk = new Float32Array(this.accumulated.slice(0, this.targetSamples));
                this.port.postMessage(chunk, [chunk.buffer]);
                this.accumulated = this.accumulated.slice(this.targetSamples);
            }
        }

        return true; // 계속 처리
    }
}

registerProcessor('audio-processor', AudioProcessor);
