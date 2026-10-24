/* VokabelGo — Worker ASR: Whisper chạy ngay trong trình duyệt (transformers.js).
   Giao thức:
     -> { type: 'transcribe', audio: Float32Array (16kHz mono), model }
     <- { type: 'progress', status, file, progress }   (tiến độ tải mô hình)
     <- { type: 'result', chunks: [{ timestamp: [s, e], text }] }
     <- { type: 'error', message }
   Âm thanh KHÔNG rời khỏi thiết bị — worker chỉ tải MÔ HÌNH từ CDN/HuggingFace. */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js';

env.allowLocalModels = false;
let transcriber = null;
let loadedModel = '';

async function getTranscriber(model) {
  if (transcriber && loadedModel === model) return transcriber;
  transcriber = null; loadedModel = '';
  const device = (typeof navigator !== 'undefined' && 'gpu' in navigator) ? 'webgpu' : 'wasm';
  transcriber = await pipeline('automatic-speech-recognition', model, {
    dtype: 'q8', device,
    progress_callback: p => {
      if (p && p.status === 'progress') {
        self.postMessage({ type: 'progress', status: p.status, file: p.file || '', progress: Math.round(p.progress || 0) });
      }
    }
  });
  loadedModel = model;
  return transcriber;
}

self.onmessage = async e => {
  const msg = e.data || {};
  if (msg.type !== 'transcribe') return;
  try {
    const asr = await getTranscriber(msg.model);
    self.postMessage({ type: 'progress', status: 'running', file: '', progress: -1 });
    const out = await asr(msg.audio, {
      language: 'de', task: 'transcribe',
      return_timestamps: true, chunk_length_s: 30, stride_length_s: 5
    });
    const chunks = (out.chunks || []).map(c => ({
      timestamp: [c.timestamp[0] || 0, c.timestamp[1] == null ? (c.timestamp[0] || 0) + 2 : c.timestamp[1]],
      text: (c.text || '').trim()
    })).filter(c => c.text);
    self.postMessage({ type: 'result', chunks });
  } catch (err) {
    self.postMessage({ type: 'error', message: (err && err.message) || 'ASR thất bại' });
  }
};
