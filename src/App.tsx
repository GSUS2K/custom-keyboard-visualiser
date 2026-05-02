import { useState, useEffect, useCallback } from 'react';
import './index.css';

// Reusable Audio Context to avoid limits and leaks
let audioCtx: AudioContext | null = null;

const createPluckedNoise = (t: number, duration: number, freq: number) => {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * duration; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.01));
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.2;

  noise.connect(filter);
  filter.connect(audioCtx.destination);
  noise.start(t);
  noise.stop(t + duration);
}

const playTypingSound = (switchType: string) => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const t = audioCtx.currentTime;
  
  // Randomize pitch and intensity slightly for human realism
  const pitchVar = 1 + (Math.random() * 0.1 - 0.05); 
  const gainVar = 1 + (Math.random() * 0.2 - 0.1);

  if (switchType === 'linear') {
    // Linear (Gateron Milky Yellow) - Deep Creamy Thock
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(30 * pitchVar, t + 0.05);
    
    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.linearRampToValueAtTime(1.8 * gainVar, t + 0.003);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    
    // Bottom out sharp transient
    createPluckedNoise(t, 0.05, 800 * pitchVar);
    // Case reverb
    createPluckedNoise(t, 0.1, 200 * pitchVar);

    osc.start(t); osc.stop(t + 0.08);

  } else if (switchType === 'tactile') {
    // Tactile (Holy Panda) - Sharp clack with a bump
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(50 * pitchVar, t + 0.04);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.2 * gainVar, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    
    osc.connect(gain); gain.connect(audioCtx.destination);

    // Initial tactile bump friction
    createPluckedNoise(t, 0.03, 1500 * pitchVar);
    // Bottom out clack
    createPluckedNoise(t + 0.01, 0.06, 600 * pitchVar);

    osc.start(t); osc.stop(t + 0.06);

  } else {
    // Clicky (Cherry MX Blue) - Sharp click jacket snap
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2500 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(800 * pitchVar, t + 0.01);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5 * gainVar, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
    
    osc.connect(gain); gain.connect(audioCtx.destination);

    // Body thud
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(150 * pitchVar, t);
    osc2.frequency.exponentialRampToValueAtTime(60 * pitchVar, t + 0.04);
    
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(1.0 * gainVar, t + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc2.connect(gain2); gain2.connect(audioCtx.destination);

    createPluckedNoise(t, 0.03, 3000 * pitchVar);

    osc.start(t); osc.stop(t + 0.02);
    osc2.start(t); osc2.stop(t + 0.05);
  }
};

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

function Keyboard65({ activeKeys, onManualPress }: any) {
  return (
    <div className="keyboard-grid" style={{ gridTemplateColumns: 'repeat(64, 1fr)', width: '850px' }}>
      {/* Row 1 */}
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

      {/* Row 2 */}
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

      {/* Row 3 */}
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

      {/* Row 4 */}
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

      {/* Row 5 */}
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

// ... other keyboards (60%, TKL) can be added as needed, omitting here for brevity 
// but using the user's previously requested functionality
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

function App() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [keyboardType, setKeyboardType] = useState('65');
  const [switchType, setSwitchType] = useState('linear');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    playTypingSound(switchType);
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(e.code);
      return next;
    });
  }, [switchType]);

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

  return (
    <div className="app-container">
      <div className="header">
        <div className="title">
          <h1>Mechanical Keyboard Visualizer</h1>
          <p>Interactive layout and precise acoustic modeling simulator</p>
        </div>
        
        <div className="controls">
          <div className="control-group">
            <label>Layout Model</label>
            <select value={keyboardType} onChange={e => setKeyboardType(e.target.value)}>
              <option value="60">60% (Wooting 60HE Style)</option>
              <option value="65">65% (Tofu65 Style)</option>
              <option value="75">75% (EPOMAKER x AULA F75 Style)</option>
            </select>
          </div>
          <div className="control-group">
            <label>Switch Acoustic Profile</label>
            <select value={switchType} onChange={e => setSwitchType(e.target.value)}>
              <option value="linear">Gateron Milky Yellow (Deep Creamy Thock)</option>
              <option value="tactile">Holy Panda (Sharp Clack + Bump)</option>
              <option value="clicky">Cherry MX Blue (High-Pitch Click Jacket)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="keyboard-chassis">
        <div className="status-leds">
          <div className={`led ${activeKeys.has('CapsLock') ? 'active' : ''}`} title="Caps Lock"></div>
          {keyboardType !== '60' && <div className="led active" title="Battery"></div>}
          {keyboardType !== '60' && <div className="led active" title="Connection"></div>}
        </div>

        {keyboardType === '60' && <Keyboard60 activeKeys={activeKeys} onManualPress={handleManualPress} />}
        {keyboardType === '65' && <Keyboard65 activeKeys={activeKeys} onManualPress={handleManualPress} />}
        {keyboardType === '75' && <Keyboard75 activeKeys={activeKeys} onManualPress={handleManualPress} />}
      </div>
    </div>
  );
}

export default App;
