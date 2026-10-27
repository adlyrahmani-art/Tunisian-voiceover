/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/\s+/g, '');
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function isWav(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  return bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70; // "RIFF"
}

export function pcmToWavBlob(pcmData: Int16Array, sampleRate = 24000, numChannels = 1): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.byteLength;

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  return new Blob([header, pcmData], { type: 'audio/wav' });
}

export async function processAudioResponse(
  base64Data: string,
  ctx: AudioContext
): Promise<{ buffer: AudioBuffer; blob: Blob; url: string }> {
  const bytes = base64ToUint8Array(base64Data);

  let blob: Blob;
  let audioBuffer: AudioBuffer;

  if (isWav(bytes)) {
    blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    // Use copy of array buffer for decoding to prevent detaching
    const copyBuffer = bytes.buffer.slice(0) as ArrayBuffer;
    audioBuffer = await ctx.decodeAudioData(copyBuffer);
  } else {
    // Treat as raw 16-bit PCM 24kHz
    // Ensure 2-byte alignment
    let alignedBytes = bytes;
    if (bytes.byteOffset % 2 !== 0) {
      alignedBytes = new Uint8Array(bytes.length);
      alignedBytes.set(bytes);
    }
    const int16 = new Int16Array(
      alignedBytes.buffer,
      alignedBytes.byteOffset,
      Math.floor(alignedBytes.byteLength / 2)
    );
    blob = pcmToWavBlob(int16, 24000, 1);

    const frameCount = int16.length;
    audioBuffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = int16[i] / 32768.0;
    }
  }

  const url = URL.createObjectURL(blob);
  return { buffer: audioBuffer, blob, url };
}
