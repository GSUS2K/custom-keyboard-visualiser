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

const COMMON_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"
];

const generateQuote = (wordCount: number) => {
  let q = [];
  for(let i=0; i<wordCount; i++) {
    q.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]);
  }
  return q.join(' ');
}

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
  const [preset, setPreset] = useState('keychron_q1');

  // TypeRacer Game State
  const [wordCountTarget, setWordCountTarget] = useState(20);
  const [quote, setQuote] = useState(generateQuote(20));
  const [typed, setTyped] = useState('');
  const typedRef = useRef('');
  const [gameActive, setGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const startTime = useRef<number | null>(null);
  const reactiveHueRef = useRef(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Operation Mode
  const [operationMode, setOperationMode] = useState<'race' | 'sandbox'>('race');
  const [sandboxText, setSandboxText] = useState('');
  
  // Stats
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sandboxCursorRef = useRef<HTMLSpanElement>(null);

  // UI
  const [showSettings, setShowSettings] = useState(true);
  const [rgbMode, setRgbMode] = useState('theme');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showKeycaps, setShowKeycaps] = useState(true);
  const [viewAngle, setViewAngle] = useState<'3d' | 'flat'>('3d');
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [particles, setParticles] = useState<{id: number, char: string, x: number}[]>([]);

  useEffect(() => {
    typedRef.current = operationMode === 'race' ? typed : sandboxText;
  }, [typed, sandboxText, operationMode]);

  useEffect(() => {
    if (operationMode === 'sandbox' && sandboxCursorRef.current) {
      sandboxCursorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [sandboxText, operationMode]);

  const startNewGame = useCallback((targetWords: number = wordCountTarget) => {
    setWordCountTarget(targetWords);
    setQuote(generateQuote(targetWords));
    setTyped('');
    setSandboxText('');
    typedRef.current = '';
    setGameActive(false);
    setGameFinished(false);
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setTimeElapsed(0);
    startTime.current = null;
  }, [wordCountTarget]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Quick restart shortcut
    if (gameFinished && e.key === 'Enter') {
      startNewGame();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) {
      setActiveKeys(prev => new Set(prev).add(e.code));
      return;
    }

    if (soundEnabled) {
      playTypingSound(switchType);
    }
    
    if (particlesEnabled && e.key.length === 1) {
      const newParticle = { id: Date.now() + Math.random(), char: e.key, x: Math.random() * 80 + 10 }; // 10% to 90%
      setParticles(prev => {
        const next = [...prev, newParticle];
        if (next.length > 20) return next.slice(next.length - 20);
        return next;
      });
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    }
    
    if (rgbMode === 'reactive') {
      reactiveHueRef.current = (reactiveHueRef.current + 35) % 360;
      document.documentElement.style.setProperty('--reactive-hue', `${reactiveHueRef.current}deg`);
    }

    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(e.code);
      return next;
    });

    if (gameFinished && operationMode === 'race') return;

    if (operationMode === 'sandbox') {
      setSandboxText(prev => {
        let nextText = prev;
        if (e.key === 'Backspace') {
          nextText = prev.slice(0, -1);
        } else if (e.key === 'Enter') {
          nextText = prev + '\n';
        } else if (e.key.length === 1) {
          if (!gameActive && prev.length === 0) {
            setGameActive(true);
            startTime.current = Date.now();
          }
          nextText = prev + e.key;
        }

        if (startTime.current) {
          const elapsedMinutes = (Date.now() - startTime.current) / 60000;
          if (elapsedMinutes > 0) {
            setCpm(Math.round(nextText.length / elapsedMinutes));
            setWpm(Math.round((nextText.length / 5) / elapsedMinutes));
          }
        }
        
        return nextText;
      });
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
        // Prevent typing beyond the length of the quote
        if (prev.length < quote.length) {
          nextTyped = prev + e.key;
        }
      }

      // Update instantaneous accuracy
      let correct = 0;
      for (let i = 0; i < nextTyped.length; i++) {
        if (nextTyped[i] === quote[i]) correct++;
      }
      setAccuracy(nextTyped.length > 0 ? Math.round((correct / nextTyped.length) * 100) : 100);

      // Instant WPM/CPM Update
      if (startTime.current) {
        const elapsedMinutes = (Date.now() - startTime.current) / 60000;
        if (elapsedMinutes > 0) {
          setCpm(Math.round(nextTyped.length / elapsedMinutes));
          setWpm(Math.round((nextTyped.length / 5) / elapsedMinutes));
        }
      }

      // Check completion
      if (nextTyped.length === quote.length) {
        setGameActive(false);
        setGameFinished(true);
      }

      return nextTyped;
    });

  }, [switchType, gameActive, gameFinished, quote, startNewGame, soundEnabled, particlesEnabled, operationMode, rgbMode]);

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

  useEffect(() => {
    document.body.className = `theme-${theme} rgb-${rgbMode} ${!showKeycaps ? 'hide-keycaps' : ''}`;
  }, [theme, rgbMode, showKeycaps]);

  useEffect(() => {
    let interval: any;
    if (gameActive) {
      interval = setInterval(() => {
        if (!startTime.current) return;
        const elapsedSeconds = (Date.now() - startTime.current) / 1000;
        setTimeElapsed(Math.floor(elapsedSeconds));
        
        const elapsedMinutes = elapsedSeconds / 60;
        if (elapsedMinutes > 0) {
          const currentCpm = Math.round(typedRef.current.length / elapsedMinutes);
          const currentWpm = Math.round((typedRef.current.length / 5) / elapsedMinutes);
          setCpm(currentCpm);
          setWpm(currentWpm);
        }
      }, 200); // 5 times a second for smooth timer and wpm drop
    }
    return () => clearInterval(interval);
  }, [gameActive]);

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
        // Center around 128, multiply amplitude by 4x for dramatic visual
        let v = dataArray[i];
        v = ((v - 128) * 4) + 128;
        // Clamp to 0-255
        if (v < 0) v = 0;
        if (v > 255) v = 255;
        
        const normalizedV = v / 128.0;
        const y = normalizedV * canvas.height / 2;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [theme]);

  const handleManualPress = (code: string) => {
    const charMap: Record<string, string> = { Space: ' ', Enter: 'Enter', Backspace: 'Backspace' };
    let key = charMap[code];
    
    if (!key) {
      if (code.startsWith('Key')) key = code.replace('Key', '').toLowerCase();
      else if (code.startsWith('Digit')) key = code.replace('Digit', '');
      else key = code; // Fallback
    }

    window.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true }));
    
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key, code, bubbles: true }));
    }, 100);
  };

  const renderTextWords = () => {
    return quote.split('').map((char, index) => {
      let className = 'typeracer-char';
      if (index < typed.length) {
        className += typed[index] === char ? ' correct' : ' incorrect';
      } else if (index === typed.length && !gameFinished) {
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
      {particles.map(p => (
        <div key={p.id} className="typing-particle" style={{ left: `${p.x}vw` }}>
          {p.char}
        </div>
      ))}
      <div className="main-column">
        <div className="header">
          <div className="title">
            <h1>Mechanical Keyboard Studio</h1>
            <p>The ultimate custom acoustic and visual layout simulator</p>
          </div>
        </div>

        <div className="dashboard">
          <div className="stat-box">
            <span className="stat-value">{timeElapsed}s</span>
            <span className="stat-label">Time</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{wpm}</span>
            <span className="stat-label">WPM</span>
          </div>
          <div className="stat-box visualizer-box">
            <canvas ref={canvasRef} width="200" height="40" className="visualizer"></canvas>
            <span className="stat-label">Acoustic Waveform</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{cpm}</span>
            <span className="stat-label">CPM</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        {operationMode === 'race' ? (
          <div className={`typeracer-container ${gameFinished ? 'finished' : ''}`}>
            <div className="typeracer-header">
              <div className="game-modes">
                <button className={wordCountTarget === 10 ? 'active' : ''} onClick={(e) => { startNewGame(10); e.currentTarget.blur(); }}>10</button>
                <button className={wordCountTarget === 20 ? 'active' : ''} onClick={(e) => { startNewGame(20); e.currentTarget.blur(); }}>20</button>
                <button className={wordCountTarget === 50 ? 'active' : ''} onClick={(e) => { startNewGame(50); e.currentTarget.blur(); }}>50</button>
                <button className={wordCountTarget === 100 ? 'active' : ''} onClick={(e) => { startNewGame(100); e.currentTarget.blur(); }}>100</button>
              </div>
              <button className="restart-btn" onClick={(e) => { startNewGame(); e.currentTarget.blur(); }} title="Restart Test">↻</button>
            </div>
            
            <div className="typeracer-viewport">
              <div className="typeracer-text" style={{ transform: `translateX(calc(${typed.length} * -1ch))` }}>
                {renderTextWords()}
              </div>
            </div>
            
            {gameFinished && (
              <div className="typeracer-finish">
                Test Completed! Press <strong>Enter</strong> or click Restart to try again.
              </div>
            )}
          </div>
        ) : (
          <div className="sandbox-container">
            <div className="sandbox-header">
              <div className="sandbox-title">📝 Freeplay Sandbox</div>
              <button className="restart-btn" onClick={(e) => { setSandboxText(''); setGameActive(false); setWpm(0); setCpm(0); setTimeElapsed(0); startTime.current = null; e.currentTarget.blur(); }} title="Clear Text">↻ Clear</button>
            </div>
            <div className="sandbox-viewport">
              <div className="sandbox-text">
                {sandboxText || <span className="sandbox-placeholder">Start typing freely...</span>}
                <span className="sandbox-cursor" ref={sandboxCursorRef}></span>
              </div>
            </div>
          </div>
        )}
        
        <div className={`keyboard-chassis ${viewAngle === 'flat' ? 'flat-view' : ''}`}>
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

      <button 
        className={`settings-toggle-btn ${showSettings ? 'open' : ''}`} 
        onClick={(e) => { setShowSettings(!showSettings); e.currentTarget.blur(); }}
        title="Toggle Studio Settings"
      >
        ⚙️
      </button>

      <div className={`sidebar controls-wrapper ${showSettings ? '' : 'hidden'}`}>
        <div className="sidebar-header">
          <h2>Studio Settings</h2>
          <button className="close-btn" onClick={(e) => { setShowSettings(false); e.currentTarget.blur(); }}>✕</button>
        </div>
        
        <div className="control-group">
          <label>Global Features</label>
          <div className="game-modes toggle-grid" style={{ width: '100%', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '8px' }}>
            <button style={{flex: '1 1 40%'}} className={soundEnabled ? 'active' : ''} onClick={(e) => { setSoundEnabled(!soundEnabled); e.currentTarget.blur(); }}>🔊 Sound</button>
            <button style={{flex: '1 1 40%'}} className={particlesEnabled ? 'active' : ''} onClick={(e) => { setParticlesEnabled(!particlesEnabled); e.currentTarget.blur(); }}>✨ Particles</button>
            <button style={{flex: '1 1 40%'}} className={showKeycaps ? 'active' : ''} onClick={(e) => { setShowKeycaps(!showKeycaps); e.currentTarget.blur(); }}>⌨️ Keycaps</button>
            <button style={{flex: '1 1 40%'}} className={viewAngle === '3d' ? 'active' : ''} onClick={(e) => { setViewAngle(viewAngle === '3d' ? 'flat' : '3d'); e.currentTarget.blur(); }}>📐 3D View</button>
          </div>
        </div>

        <div className="control-group">
          <label>Operation Mode</label>
          <div className="game-modes" style={{ width: '100%', marginBottom: '0.5rem' }}>
            <button style={{flex: 1}} className={operationMode === 'race' ? 'active' : ''} onClick={(e) => { setOperationMode('race'); e.currentTarget.blur(); }}>🏁 Race</button>
            <button style={{flex: 1}} className={operationMode === 'sandbox' ? 'active' : ''} onClick={(e) => { setOperationMode('sandbox'); e.currentTarget.blur(); }}>📝 Sandbox</button>
          </div>
        </div>

        <div className="control-group">
          <label>RGB Lighting</label>
          <select value={rgbMode} onChange={e => { setRgbMode(e.target.value); e.target.blur(); }}>
            <option value="theme">Theme Default</option>
            <option value="rainbow">Rainbow Wave</option>
            <option value="breathe">Breathing Pulse</option>
            <option value="reactive">Reactive Typing</option>
          </select>
        </div>

        <div className="control-group">
          <label>Real Keyboard Models</label>
          <select value={preset} onChange={e => { setPreset(e.target.value); e.target.blur(); }} style={{ borderColor: 'var(--accent-color)' }}>
            <option value="custom">-- Custom Build --</option>
            <option value="wooting">Wooting 60HE (Linear)</option>
            <option value="hhkb">HHKB Professional (Topre)</option>
            <option value="keychron_q1">Keychron Q1 (Tactile)</option>
            <option value="cyberboard">Angry Miao Cyberboard (Heavy Tactile)</option>
            <option value="planck">Planck EZ Ortholinear (Clicky)</option>
          </select>
        </div>

        <div className="control-group">
          <label>Layout Size</label>
          <select value={keyboardType} onChange={e => { setKeyboardType(e.target.value); setPreset('custom'); e.target.blur(); }}>
            <option value="40">40% (Planck Ortho)</option>
            <option value="60">60% (Standard)</option>
            <option value="65">65% (Tofu65 Style)</option>
            <option value="75">75% (AULA F75 Exploded)</option>
          </select>
        </div>
        <div className="control-group">
          <label>Switch Acoustic Profile</label>
          <select value={switchType} onChange={e => { setSwitchType(e.target.value); setPreset('custom'); e.target.blur(); }}>
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
          <select value={profile} onChange={e => { setProfile(e.target.value); setPreset('custom'); e.target.blur(); }}>
            <option value="cherry">Cherry (Sculpted)</option>
            <option value="xda">XDA (Flat, Square)</option>
            <option value="sa">SA (Tall, Spherical)</option>
          </select>
        </div>
        <div className="control-group">
          <label>Color Theme</label>
          <select value={theme} onChange={e => { setTheme(e.target.value); setPreset('custom'); e.target.blur(); }}>
            <option value="default">Dark Glass</option>
            <option value="retro">Retro Beige 1984</option>
            <option value="cyberpunk">Cyberpunk Neon</option>
            <option value="vaporwave">Vaporwave Synth</option>
            <option value="matcha">Matcha Green</option>
            <option value="dracula">Dracula (Dark)</option>
            <option value="arctic">Arctic Ice (Light)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
