class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0]; // 첫 번째 입력 채널
        if (input.length > 0) {
            const channelData = input[0];
            // RMS 계산 예시 (볼륨 감지)
            let sum = 0;
            for (let i = 0; i < channelData.length; i++) {
                sum += channelData[i] * channelData[i];
            }
            const rms = Math.sqrt(sum / channelData.length);
            if(rms > 0.001) {
                this.port.postMessage(channelData, [channelData.buffer]);
            }
        }

        return true; // 계속 처리
    }
}

registerProcessor('audio-processor', AudioProcessor);
