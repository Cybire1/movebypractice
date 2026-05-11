class AudioRecorderWorklet extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;

        const channel = input[0];
        for (let i = 0; i < channel.length; i++) {
            this.buffer[this.bufferIndex++] = channel[i];

            if (this.bufferIndex === this.bufferSize) {
                this.flush();
            }
        }
        return true;
    }

    flush() {
        // Send the buffer to the main thread
        this.port.postMessage(this.buffer);
        this.bufferIndex = 0;
    }
}

registerProcessor('audio-recorder-worklet', AudioRecorderWorklet);
