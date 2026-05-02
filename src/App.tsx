import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';

// Reusable Audio Context and Analyser
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const createPluckedNoise = (t: number, duration: number, freq: number, q: number = 1.2) => {
  if (!audioCtx || !analyser) return;
  const bufferSize = audioCtx.sampleRate * duration; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * (duration * 0.2)));
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;

  noise.connect(filter);
  filter.connect(analyser);
  noise.start(t);
  noise.stop(t + duration);
}

const playTypingSound = (switchType: string) => {
  initAudio();
  if (!audioCtx || !analyser) return;

  const t = audioCtx.currentTime;
  const pitchVar = 1 + (Math.random() * 0.08 - 0.04); 
  const gainVar = 1 + (Math.random() * 0.2 - 0.1);

  if (switchType === 'linear') {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(30 * pitchVar, t + 0.05);
    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.linearRampToValueAtTime(1.8 * gainVar, t + 0.003);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(oscGain); oscGain.connect(analyser);
    
    createPluckedNoise(t, 0.05, 800 * pitchVar);
    createPluckedNoise(t, 0.1, 200 * pitchVar, 0.5);

    osc.start(t); osc.stop(t + 0.08);

  } else if (switchType === 'tactile') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(50 * pitchVar, t + 0.04);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.2 * gainVar, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain); gain.connect(analyser);

    createPluckedNoise(t, 0.03, 1500 * pitchVar);
    createPluckedNoise(t + 0.01, 0.06, 600 * pitchVar);

    osc.start(t); osc.stop(t + 0.06);

  } else if (switchType === 'clicky') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2500 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(800 * pitchVar, t + 0.01);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5 * gainVar, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
    osc.connect(gain); gain.connect(analyser);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(150 * pitchVar, t);
    osc2.frequency.exponentialRampToValueAtTime(60 * pitchVar, t + 0.04);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(1.0 * gainVar, t + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc2.connect(gain2); gain2.connect(analyser);

    createPluckedNoise(t, 0.03, 3000 * pitchVar);

    osc.start(t); osc.stop(t + 0.02);
    osc2.start(t); osc2.stop(t + 0.05);

  } else if (switchType === 'topre') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(40 * pitchVar, t + 0.06);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.5 * gainVar, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain); gain.connect(analyser);

    createPluckedNoise(t, 0.08, 300 * pitchVar, 0.8);
    createPluckedNoise(t + 0.01, 0.05, 120 * pitchVar, 0.5);

    osc.start(t); osc.stop(t + 0.1);

  } else if (switchType === 'silent') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(50 * pitchVar, t + 0.03);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6 * gainVar, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(gain); gain.connect(analyser);

    createPluckedNoise(t, 0.03, 400 * pitchVar, 2.0);

    osc.start(t); osc.stop(t + 0.04);

  } else if (switchType === 'heavy_tactile') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(40 * pitchVar, t + 0.05);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.0 * gainVar, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
    osc.connect(gain); gain.connect(analyser);

    createPluckedNoise(t, 0.04, 1800 * pitchVar, 0.8);
    createPluckedNoise(t, 0.08, 400 * pitchVar, 1.5);

    osc.start(t); osc.stop(t + 0.07);
  }
};

const QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "Mechanical keyboards provide a superior tactile typing experience.",
  "Customizing your acoustic profile can significantly alter your workflow.",
  "A journey of a thousand miles begins with a single keystroke.",
  "Building a custom keyboard is both an art and a science.",
  "To be or not to be, that is the thocky question.",
  "Typing fast requires rhythm, accuracy, and the perfect switch."
];

const Key = ({ label, subLabel, span = 4, className = '', keyCode, activeKeys, onManualPress }: any) => {
  const isPressed = activeKeys.has(keyCode);
  return (
    <div 
      className={`key ${className} ${isPressed ? 'active' : ''}`}
      style={{ gridColumn: `span ${span}` }}
      onMouseDown={() => onManualPress(keyCode)}
    >
      {label}
      {subLabel && <div className="sub-label">{subLabel}</div>}
    </div>
  );
};

const Gap = ({ span = 1 }) => <div style={{ gridColumn: `span ${span}`, visibility: 'hidden' }} />;

function Keyboard40({ activeKeys, onManualPress }: any) {
  return (
    <div className="keyboard-grid" style={{ gridTemplateColumns: 'repeat(48, 1fr)', width: '600px' }}>
      <Key label="Tab" keyCode="Tab" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="Q" keyCode="KeyQ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="W" keyCode="KeyW" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="E" keyCode="KeyE" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="R" keyCode="KeyR" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="T" keyCode="KeyT" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Y" keyCode="KeyY" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="U" keyCode="KeyU" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="I" keyCode="KeyI" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="O" keyCode="KeyO" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="P" keyCode="KeyP" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Bksp" keyCode="Backspace" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />

      <Key label="Esc" keyCode="Escape" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="A" keyCode="KeyA" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="S" keyCode="KeyS" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="D" keyCode="KeyD" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F" keyCode="KeyF" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="G" keyCode="KeyG" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="H" keyCode="KeyH" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="J" keyCode="KeyJ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="K" keyCode="KeyK" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="L" keyCode="KeyL" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=";" subLabel=":" keyCode="Semicolon" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Enter" keyCode="Enter" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />

      <Key label="Shift" keyCode="ShiftLeft" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="Z" keyCode="KeyZ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="X" keyCode="KeyX" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="C" keyCode="KeyC" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="V" keyCode="KeyV" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="B" keyCode="KeyB" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="N" keyCode="KeyN" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="M" keyCode="KeyM" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="," subLabel="<" keyCode="Comma" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="." subLabel=">" keyCode="Period" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="/" subLabel="?" keyCode="Slash" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Shift" keyCode="ShiftRight" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />

      <Key label="Ctrl" keyCode="ControlLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Win" keyCode="MetaLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Lower" keyCode="Fn" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="" keyCode="Space" span={8} activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Raise" keyCode="AltRight" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="Left" keyCode="ArrowLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Down" keyCode="ArrowDown" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Up" keyCode="ArrowUp" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Right" keyCode="ArrowRight" activeKeys={activeKeys} onManualPress={onManualPress} />
    </div>
  );
}

function Keyboard60({ activeKeys, onManualPress }: any) {
  return (
    <div className="keyboard-grid" style={{ gridTemplateColumns: 'repeat(60, 1fr)', width: '800px' }}>
      <Key label="Esc" keyCode="Escape" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="!" subLabel="1" keyCode="Digit1" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="@" subLabel="2" keyCode="Digit2" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="#" subLabel="3" keyCode="Digit3" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="$" subLabel="4" keyCode="Digit4" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="%" subLabel="5" keyCode="Digit5" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="^" subLabel="6" keyCode="Digit6" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&" subLabel="7" keyCode="Digit7" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="*" subLabel="8" keyCode="Digit8" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="(" subLabel="9" keyCode="Digit9" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=")" subLabel="0" keyCode="Digit0" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="_" subLabel="-" keyCode="Minus" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="+" subLabel="=" keyCode="Equal" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Backspace" keyCode="Backspace" span={8} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Tab" keyCode="Tab" span={6} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Q" keyCode="KeyQ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="W" keyCode="KeyW" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="E" keyCode="KeyE" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="R" keyCode="KeyR" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="T" keyCode="KeyT" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Y" keyCode="KeyY" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="U" keyCode="KeyU" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="I" keyCode="KeyI" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="O" keyCode="KeyO" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="P" keyCode="KeyP" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="{" subLabel="[" keyCode="BracketLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="}" subLabel="]" keyCode="BracketRight" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="|" subLabel="\" keyCode="Backslash" span={6} activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Caps" keyCode="CapsLock" span={7} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="A" keyCode="KeyA" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="S" keyCode="KeyS" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="D" keyCode="KeyD" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F" keyCode="KeyF" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="G" keyCode="KeyG" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="H" keyCode="KeyH" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="J" keyCode="KeyJ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="K" keyCode="KeyK" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="L" keyCode="KeyL" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=":" subLabel=";" keyCode="Semicolon" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&quot;" subLabel="'" keyCode="Quote" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Enter" keyCode="Enter" span={9} className="accent bottom" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Shift" keyCode="ShiftLeft" span={9} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Z" keyCode="KeyZ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="X" keyCode="KeyX" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="C" keyCode="KeyC" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="V" keyCode="KeyV" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="B" keyCode="KeyB" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="N" keyCode="KeyN" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="M" keyCode="KeyM" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&lt;" subLabel="," keyCode="Comma" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&gt;" subLabel="." keyCode="Period" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="?" subLabel="/" keyCode="Slash" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Shift" keyCode="ShiftRight" span={11} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Ctrl" keyCode="ControlLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Win" keyCode="MetaLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="" keyCode="Space" span={25} activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltRight" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Win" keyCode="MetaRight" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Menu" keyCode="ContextMenu" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Ctrl" keyCode="ControlRight" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
    </div>
  );
}

function Keyboard65({ activeKeys, onManualPress }: any) {
  return (
    <div className="keyboard-grid" style={{ gridTemplateColumns: 'repeat(64, 1fr)', width: '850px' }}>
      <Key label="Esc" keyCode="Escape" activeKeys={activeKeys} onManualPress={onManualPress} className="accent" />
      <Key label="!" subLabel="1" keyCode="Digit1" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="@" subLabel="2" keyCode="Digit2" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="#" subLabel="3" keyCode="Digit3" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="$" subLabel="4" keyCode="Digit4" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="%" subLabel="5" keyCode="Digit5" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="^" subLabel="6" keyCode="Digit6" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&" subLabel="7" keyCode="Digit7" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="*" subLabel="8" keyCode="Digit8" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="(" subLabel="9" keyCode="Digit9" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=")" subLabel="0" keyCode="Digit0" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="_" subLabel="-" keyCode="Minus" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="+" subLabel="=" keyCode="Equal" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Backspace" keyCode="Backspace" span={8} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="~" subLabel="`" keyCode="Backquote" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Tab" keyCode="Tab" span={6} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Q" keyCode="KeyQ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="W" keyCode="KeyW" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="E" keyCode="KeyE" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="R" keyCode="KeyR" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="T" keyCode="KeyT" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Y" keyCode="KeyY" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="U" keyCode="KeyU" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="I" keyCode="KeyI" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="O" keyCode="KeyO" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="P" keyCode="KeyP" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="{" subLabel="[" keyCode="BracketLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="}" subLabel="]" keyCode="BracketRight" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="|" subLabel="\" keyCode="Backslash" span={6} activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Del" keyCode="Delete" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Caps" keyCode="CapsLock" span={7} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="A" keyCode="KeyA" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="S" keyCode="KeyS" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="D" keyCode="KeyD" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F" keyCode="KeyF" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="G" keyCode="KeyG" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="H" keyCode="KeyH" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="J" keyCode="KeyJ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="K" keyCode="KeyK" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="L" keyCode="KeyL" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=":" subLabel=";" keyCode="Semicolon" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&quot;" subLabel="'" keyCode="Quote" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Enter" keyCode="Enter" span={9} className="accent bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="PgUp" keyCode="PageUp" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Shift" keyCode="ShiftLeft" span={9} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Z" keyCode="KeyZ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="X" keyCode="KeyX" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="C" keyCode="KeyC" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="V" keyCode="KeyV" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="B" keyCode="KeyB" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="N" keyCode="KeyN" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="M" keyCode="KeyM" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&lt;" subLabel="," keyCode="Comma" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&gt;" subLabel="." keyCode="Period" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="?" subLabel="/" keyCode="Slash" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Shift" keyCode="ShiftRight" span={7} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="↑" keyCode="ArrowUp" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="PgDn" keyCode="PageDown" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Ctrl" keyCode="ControlLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Win" keyCode="MetaLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="" keyCode="Space" span={25} activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltRight" span={4} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Fn" keyCode="Fn" span={4} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Ctrl" keyCode="ControlRight" span={4} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="←" keyCode="ArrowLeft" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="↓" keyCode="ArrowDown" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="→" keyCode="ArrowRight" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
    </div>
  );
}

function Keyboard75({ activeKeys, onManualPress }: any) {
  return (
    <div className="keyboard-grid" style={{ gridTemplateColumns: 'repeat(65, 1fr)', width: '900px' }}>
      <Key label="Esc" keyCode="Escape" span={4} className="accent" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="F1" keyCode="F1" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F2" keyCode="F2" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F3" keyCode="F3" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F4" keyCode="F4" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="F5" keyCode="F5" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F6" keyCode="F6" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F7" keyCode="F7" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F8" keyCode="F8" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="F9" keyCode="F9" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F10" keyCode="F10" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F11" keyCode="F11" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F12" keyCode="F12" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="Del" keyCode="Delete" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <div className="knob-container" style={{ gridColumn: 'span 4' }}>
        <div className={`knob ${activeKeys.has('Knob') ? 'active' : ''}`} onMouseDown={() => onManualPress('Knob')}></div>
      </div>

      <Key label="~" subLabel="`" keyCode="Backquote" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="!" subLabel="1" keyCode="Digit1" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="@" subLabel="2" keyCode="Digit2" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="#" subLabel="3" keyCode="Digit3" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="$" subLabel="4" keyCode="Digit4" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="%" subLabel="5" keyCode="Digit5" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="^" subLabel="6" keyCode="Digit6" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&" subLabel="7" keyCode="Digit7" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="*" subLabel="8" keyCode="Digit8" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="(" subLabel="9" keyCode="Digit9" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=")" subLabel="0" keyCode="Digit0" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="_" subLabel="-" keyCode="Minus" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="+" subLabel="=" keyCode="Equal" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Backspace" keyCode="Backspace" span={8} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="Home" keyCode="Home" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Tab" keyCode="Tab" span={6} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Q" keyCode="KeyQ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="W" keyCode="KeyW" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="E" keyCode="KeyE" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="R" keyCode="KeyR" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="T" keyCode="KeyT" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Y" keyCode="KeyY" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="U" keyCode="KeyU" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="I" keyCode="KeyI" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="O" keyCode="KeyO" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="P" keyCode="KeyP" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="{" subLabel="[" keyCode="BracketLeft" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="}" subLabel="]" keyCode="BracketRight" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="|" subLabel="\" keyCode="Backslash" span={6} activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="PgUp" keyCode="PageUp" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Caps" keyCode="CapsLock" span={7} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="A" keyCode="KeyA" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="S" keyCode="KeyS" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="D" keyCode="KeyD" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="F" keyCode="KeyF" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="G" keyCode="KeyG" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="H" keyCode="KeyH" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="J" keyCode="KeyJ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="K" keyCode="KeyK" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="L" keyCode="KeyL" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label=":" subLabel=";" keyCode="Semicolon" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&quot;" subLabel="'" keyCode="Quote" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Enter" keyCode="Enter" span={9} className="accent bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="PgDn" keyCode="PageDown" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Shift" keyCode="ShiftLeft" span={9} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Z" keyCode="KeyZ" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="X" keyCode="KeyX" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="C" keyCode="KeyC" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="V" keyCode="KeyV" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="B" keyCode="KeyB" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="N" keyCode="KeyN" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="M" keyCode="KeyM" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&lt;" subLabel="," keyCode="Comma" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="&gt;" subLabel="." keyCode="Period" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="?" subLabel="/" keyCode="Slash" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Shift" keyCode="ShiftRight" span={7} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="↑" keyCode="ArrowUp" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="End" keyCode="End" activeKeys={activeKeys} onManualPress={onManualPress} />

      <Key label="Ctrl" keyCode="ControlLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Win" keyCode="MetaLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltLeft" span={5} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="" keyCode="Space" span={25} activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Alt" keyCode="AltRight" span={4} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Fn" keyCode="Fn" span={4} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="Ctrl" keyCode="ControlRight" span={4} className="bottom" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Gap span={1} />
      <Key label="←" keyCode="ArrowLeft" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="↓" keyCode="ArrowDown" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
      <Key label="→" keyCode="ArrowRight" className="center" activeKeys={activeKeys} onManualPress={onManualPress} />
    </div>
  );
}

function App() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [keyboardType, setKeyboardType] = useState('65');
  const [switchType, setSwitchType] = useState('linear');
  const [theme, setTheme] = useState('default');
  const [profile, setProfile] = useState('cherry');
  const [preset, setPreset] = useState('custom');

  // TypeRacer Game State
  const [quote, setQuote] = useState(QUOTES[0]);
  const [typed, setTyped] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const startTime = useRef<number | null>(null);
  
  // Stats
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startNewGame = useCallback(() => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
    setTyped('');
    setGameActive(false);
    setGameFinished(false);
    setWpm(0);
    setAccuracy(100);
    startTime.current = null;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    
    // Ignore meta/ctrl key chords so we don't type shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) {
      setActiveKeys(prev => new Set(prev).add(e.code));
      return;
    }

    playTypingSound(switchType);
    
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(e.code);
      return next;
    });

    if (gameFinished) {
      if (e.key === 'Enter') startNewGame();
      return;
    }

    // TypeRacer Logic
    setTyped(prev => {
      let nextTyped = prev;
      
      if (e.key === 'Backspace') {
        nextTyped = prev.slice(0, -1);
      } else if (e.key.length === 1) { // Printable characters
        if (!gameActive && prev.length === 0) {
          setGameActive(true);
          startTime.current = Date.now();
        }
        nextTyped = prev + e.key;
      }

      // Check completion
      if (nextTyped === quote) {
        setGameActive(false);
        setGameFinished(true);
      }

      return nextTyped;
    });

  }, [switchType, gameActive, gameFinished, quote, startNewGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Handle Preset changes
  useEffect(() => {
    if (preset === 'wooting') {
      setKeyboardType('60'); setSwitchType('linear'); setProfile('cherry'); setTheme('default');
    } else if (preset === 'hhkb') {
      setKeyboardType('60'); setSwitchType('topre'); setProfile('cherry'); setTheme('retro');
    } else if (preset === 'keychron_q1') {
      setKeyboardType('75'); setSwitchType('tactile'); setProfile('cherry'); setTheme('default');
    } else if (preset === 'cyberboard') {
      setKeyboardType('75'); setSwitchType('heavy_tactile'); setProfile('xda'); setTheme('cyberpunk');
    } else if (preset === 'planck') {
      setKeyboardType('40'); setSwitchType('clicky'); setProfile('sa'); setTheme('vaporwave');
    }
  }, [preset]);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // WPM & Accuracy Calculator
  useEffect(() => {
    let interval: any;
    if (gameActive && startTime.current) {
      interval = setInterval(() => {
        const elapsedMinutes = (Date.now() - startTime.current!) / 60000;
        if (elapsedMinutes > 0) {
          // Calculate WPM: (characters typed / 5) / minutes
          const currentWpm = Math.round((typed.length / 5) / elapsedMinutes);
          setWpm(currentWpm);
          
          // Calculate Accuracy
          let correct = 0;
          for (let i = 0; i < typed.length; i++) {
            if (typed[i] === quote[i]) correct++;
          }
          setAccuracy(typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [gameActive, typed, quote]);

  // Audio Visualizer Loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!analyser) return;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      const strokeColor = getComputedStyle(document.body).getPropertyValue('--accent-color') || '#fca311';
      ctx.strokeStyle = strokeColor.trim();
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [theme]);

  const handleManualPress = (code: string) => {
    playTypingSound(switchType);
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }, 100);
  };

  // Render TypeRacer text
  const renderText = () => {
    return quote.split('').map((char, index) => {
      let className = 'typeracer-char';
      if (index < typed.length) {
        className += typed[index] === char ? ' correct' : ' incorrect';
      } else if (index === typed.length) {
        className += ' cursor';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className={`app-container profile-${profile}`}>
      <div className="header">
        <div className="title">
          <h1>Mechanical Keyboard Studio</h1>
          <p>The ultimate custom acoustic and visual layout simulator</p>
        </div>

        {/* Real-time statistics and visualizer widget */}
        <div className="dashboard">
          <div className="stat-box">
            <span className="stat-value">{wpm}</span>
            <span className="stat-label">WPM</span>
          </div>
          <div className="stat-box visualizer-box">
            <canvas ref={canvasRef} width="200" height="40" className="visualizer"></canvas>
            <span className="stat-label">Acoustic Waveform</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        <div className="typeracer-container">
          <div className="typeracer-text">
            {renderText()}
          </div>
          {gameFinished && (
            <div className="typeracer-finish">
              Test Completed! Press <strong>Enter</strong> to restart.
            </div>
          )}
        </div>
        
        <div className="controls-wrapper">
          <div className="control-group">
            <label>Real Keyboard Models</label>
            <select value={preset} onChange={e => setPreset(e.target.value)} style={{ borderColor: 'var(--accent-color)' }}>
              <option value="custom">-- Custom Build --</option>
              <option value="wooting">Wooting 60HE (Linear)</option>
              <option value="hhkb">HHKB Professional (Topre)</option>
              <option value="keychron_q1">Keychron Q1 (Tactile)</option>
              <option value="cyberboard">Angry Miao Cyberboard (Heavy Tactile)</option>
              <option value="planck">Planck EZ Ortholinear (Clicky)</option>
            </select>
          </div>

          <div className="control-divider"></div>

          <div className="control-group">
            <label>Layout Size</label>
            <select value={keyboardType} onChange={e => { setKeyboardType(e.target.value); setPreset('custom'); }}>
              <option value="40">40% (Planck Ortho)</option>
              <option value="60">60% (Standard)</option>
              <option value="65">65% (Tofu65 Style)</option>
              <option value="75">75% (AULA F75 Exploded)</option>
            </select>
          </div>
          <div className="control-group">
            <label>Switch Acoustic Profile</label>
            <select value={switchType} onChange={e => { setSwitchType(e.target.value); setPreset('custom'); }}>
              <option value="linear">Gateron Milky Yellow (Deep Creamy Thock)</option>
              <option value="tactile">Holy Panda (Sharp Clack + Bump)</option>
              <option value="clicky">Cherry MX Blue (High-Pitch Click Jacket)</option>
              <option value="topre">Topre (Deep Electro-capacitive Thwomp)</option>
              <option value="silent">Silent Alpaca (Muted Linear)</option>
              <option value="heavy_tactile">Boba U4T (Massive Bump, Thocky)</option>
            </select>
          </div>
          <div className="control-group">
            <label>Keycap Profile</label>
            <select value={profile} onChange={e => { setProfile(e.target.value); setPreset('custom'); }}>
              <option value="cherry">Cherry (Sculpted)</option>
              <option value="xda">XDA (Flat, Square)</option>
              <option value="sa">SA (Tall, Spherical)</option>
            </select>
          </div>
          <div className="control-group">
            <label>Color Theme</label>
            <select value={theme} onChange={e => { setTheme(e.target.value); setPreset('custom'); }}>
              <option value="default">Dark Glass</option>
              <option value="retro">Retro Beige 1984</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="vaporwave">Vaporwave Synth</option>
            </select>
          </div>
        </div>
      </div>

      <div className="keyboard-chassis">
        <div className="status-leds">
          <div className={`led ${activeKeys.has('CapsLock') ? 'active' : ''}`} title="Caps Lock"></div>
          {keyboardType !== '40' && <div className="led active" title="Battery"></div>}
          {keyboardType !== '40' && <div className="led active" title="Connection"></div>}
        </div>

        {keyboardType === '40' && <Keyboard40 activeKeys={activeKeys} onManualPress={handleManualPress} />}
        {keyboardType === '60' && <Keyboard60 activeKeys={activeKeys} onManualPress={handleManualPress} />}
        {keyboardType === '65' && <Keyboard65 activeKeys={activeKeys} onManualPress={handleManualPress} />}
        {keyboardType === '75' && <Keyboard75 activeKeys={activeKeys} onManualPress={handleManualPress} />}
      </div>
    </div>
  );
}

export default App;
