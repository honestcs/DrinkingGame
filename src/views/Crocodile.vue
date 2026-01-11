<template>
  <div class="croc-page">
    <header class="topbar">
      <h1>🦷 咬手鳄鱼</h1>
      <button class="reset" @click="resetRound">重开一局</button>
    </header>
    <div class="stage" :class="[{ closed: isClosed }, { slam: isClosed && closeStyle==='slam' }]">
      <div class="croc-face">
        <div class="eyes">
          <div class="eye"></div>
          <div class="eye"></div>
        </div>
        <div class="nose"></div>
        <div class="mouth">
          <div class="teeth">
            <button
              v-for="(tooth, i) in teeth"
              :key="i"
              class="tooth"
              :class="{ down: tooth.down, disabled: isClosed }"
              @click="onToothClick(i)"
              :disabled="tooth.down || isClosed"
            />
          </div>
          <div class="tongue"></div>
        </div>
      </div>
    </div>

    <div class="controls">
      <label class="opt">
        陷阱牙数量
        <select v-model.number="trapCount" @change="resetRound">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </label>
      <label class="opt">
        开合动画
        <select v-model="closeStyle" @change="resetRound">
          <option value="snap">快速合嘴</option>
          <option value="slam">重击合嘴</option>
        </select>
      </label>
      <button class="reset secondary" @click="resetRound">洗牙齿</button>
    </div>

    <div v-if="bitten" class="modal">
      <div class="dialog">
        <h2>你被咬了！</h2>
        <p>下一个玩家喝一杯或接受惩罚</p>
        <button @click="resetRound">再来一局</button>
      </div>
    </div>

    <div class="history-panel">
      <strong>最近战况</strong>
      <div class="history-list">
        <div v-for="(h, idx) in history" :key="idx" class="history-item">
          <div>{{ new Date(h.t).toLocaleTimeString() }}</div>
          <div>结果：{{ h.result === 'bitten' ? '被咬' : (h.result === 'safe' ? '安全通关' : '重置') }}</div>
          <div>陷阱牙：{{ h.traps.join(',') }}</div>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref } from 'vue'

const TOTAL_TEETH = 12
const trapCount = ref(1)
const closeStyle = ref('snap')
const teeth = ref(Array.from({ length: TOTAL_TEETH }, () => ({ down: false })))
const traps = ref(new Set())
const isClosed = ref(false)
const bitten = ref(false)
let audioCtx
const history = ref([])

const pickTraps = (count) => {
  const set = new Set()
  while (set.size < count) {
    set.add(Math.floor(Math.random() * TOTAL_TEETH))
  }
  return set
}

const resetRound = () => {
  // 如果上一轮结束，写入历史
  if (bitten.value || teeth.value.filter(t=>t.down).length > 0) {
    const safeCount = TOTAL_TEETH - traps.value.size
    const downSafe = teeth.value.filter(t => t.down).length
    recordHistory(bitten.value ? 'bitten' : (downSafe === safeCount ? 'safe' : 'reset'))
  }
  teeth.value = Array.from({ length: TOTAL_TEETH }, () => ({ down: false }))
  traps.value = pickTraps(trapCount.value)
  isClosed.value = false
  bitten.value = false
}

const recordHistory = (result) => {
  const item = {
    t: Date.now(),
    result,
    traps: Array.from(traps.value)
  }
  history.value.unshift(item)
  history.value = history.value.slice(0, 10)
  try {
    localStorage.setItem('crocHistory', JSON.stringify(history.value))
  } catch {}
}
const restoreHistory = () => {
  try {
    const raw = localStorage.getItem('crocHistory')
    if (raw) history.value = JSON.parse(raw)
  } catch {}
}

const ensureAudio = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (Ctx) audioCtx = new Ctx()
  }
}
const playClickSound = () => {
  ensureAudio()
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.value = 900
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.09)
}
const playBiteSound = () => {
  ensureAudio()
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(120, audioCtx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.06)
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.2)
}

const onToothClick = (index) => {
  if (traps.value.has(index)) {
    bitten.value = true
    isClosed.value = true
    playBiteSound()
    // 轻微震动反馈（兼容性最佳实践）
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 80])
    }
  } else {
    teeth.value[index].down = true
    playClickSound()
    // 所有安全牙被按下且未被咬，给予轻提示
    const safeCount = TOTAL_TEETH - traps.value.size
    const downSafe = teeth.value.filter(t => t.down).length
    if (downSafe === safeCount && !bitten.value) {
      recordHistory('safe')
      // 可改为自定义提示，这里使用轻震动
      if (navigator.vibrate) {
        navigator.vibrate(30)
      }
    }
  }
}

resetRound()
restoreHistory()
</script>

<style scoped>
.croc-page {
  min-height: 100vh;
  background: radial-gradient(60% 60% at 50% 10%, #2a2a3a 0%, #141422 60%, #0d0d17 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}
.topbar {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.topbar h1 {
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  margin: 0;
}
.reset {
  background: #ff4d4f;
  border: none;
  color: #fff;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
}
.reset.secondary {
  background: #3e8ef7;
}

.stage {
  width: min(520px, 90vw);
  aspect-ratio: 3/4;
  margin: 10px 0 12px;
  position: relative;
  transition: transform 180ms ease;
}
.stage.closed {
  animation: mouth-close 260ms ease forwards;
}
.stage.slam {
  animation: mouth-slam 300ms cubic-bezier(.2,.7,.15,1.3) forwards;
}
@keyframes mouth-close {
  0% { transform: scaleY(1) }
  100% { transform: scaleY(0.65) translateY(4%) }
}
@keyframes mouth-slam {
  0% { transform: scaleY(1) }
  40% { transform: scaleY(0.55) translateY(3%) }
  70% { transform: scaleY(0.7) translateY(5%) }
  100% { transform: scaleY(0.62) translateY(4%) }
}

.croc-face {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  box-shadow: 0 0 40px rgba(92, 255, 125, 0.15), inset 0 0 20px rgba(0,0,0,0.5);
  background: linear-gradient(180deg, #67c667 0%, #4aa54a 35%, #2f7e2f 100%);
  padding: 12px;
}
.eyes {
  display: flex;
  justify-content: space-between;
  padding: 0 10%;
}
.eye {
  width: 20%;
  aspect-ratio: 1/1;
  background: radial-gradient(circle at 60% 50%, #fff 0%, #fce7c8 45%, #e4b96b 46%, #c77b2b 60%, #3a2a18 61%, #111 75%);
  border-radius: 50% 50% 40% 40%;
  box-shadow: 0 4px 0 rgba(0,0,0,0.4);
}
.nose {
  width: 60%;
  height: 6%;
  margin: 4% auto 2%;
  background: radial-gradient(60% 60% at 50% 50%, #2d572d 0%, #134513 55%, #0c2f0c 100%);
  border-radius: 20px;
}
.mouth {
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: 6%;
  top: 26%;
  background: #1a0f0f;
  border-radius: 0 0 28px 28px;
  box-shadow: inset 0 -8px 0 #f5e9b0, inset 0 8px 0 #f5e9b0;
  overflow: hidden;
}
.tongue {
  position: absolute;
  left: 16%;
  right: 16%;
  bottom: 4%;
  top: 40%;
  background: radial-gradient(50% 60% at 50% 70%, #f78080 0%, #e45555 55%, #973333 100%);
  border-radius: 40% 40% 48% 48%;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4));
}
.teeth {
  position: absolute;
  inset: 10% 12% auto 12%;
  top: 6%;
  height: 72%;
}
.tooth {
  position: absolute;
  width: 15%;
  aspect-ratio: 3/4;
  background: radial-gradient(60% 60% at 50% 50%, #fff 0%, #f8f8f8 60%, #d9d9d9 100%);
  border-radius: 50% 50% 60% 60%;
  border: 2px solid rgba(0,0,0,0.25);
  box-shadow: 0 4px 0 rgba(0,0,0,0.3);
  transition: transform 120ms ease, opacity 200ms ease;
}
.tooth.down {
  transform: translateY(46%);
  opacity: 0.85;
}
.tooth.disabled {
  pointer-events: none;
}
/* 12 颗牙布局：左右各 6 颗，从上到下均匀分布 */
/* 左侧 */
.tooth:nth-child(1) { left: 0%; top: 2%; }
.tooth:nth-child(2) { left: 0%; top: 17%; }
.tooth:nth-child(3) { left: 0%; top: 32%; }
.tooth:nth-child(4) { left: 0%; top: 47%; }
.tooth:nth-child(5) { left: 0%; top: 62%; }
.tooth:nth-child(6) { left: 0%; top: 77%; }
/* 右侧 */
.tooth:nth-child(7)  { right: 0%; top: 2%; }
.tooth:nth-child(8)  { right: 0%; top: 17%; }
.tooth:nth-child(9)  { right: 0%; top: 32%; }
.tooth:nth-child(10) { right: 0%; top: 47%; }
.tooth:nth-child(11) { right: 0%; top: 62%; }
.tooth:nth-child(12) { right: 0%; top: 77%; }

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 900px;
}
.opt {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 6px 10px;
  border-radius: 10px;
}
.opt select {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 6px;
  padding: 4px 6px;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}
.dialog {
  width: min(360px, 86vw);
  background: #121212;
  border: 1px solid #ff6b6b;
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 0 24px rgba(255, 107, 107, 0.3);
}
.dialog h2 {
  margin: 0 0 10px;
}
.dialog button {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  background: #ff6b6b;
  color: #fff;
  font-weight: 700;
}

/* 简易历史面板 */
.history-panel {
  width: 100%;
  max-width: 900px;
  margin-top: 8px;
  padding: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
}
.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}
.history-item {
  padding: 6px 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  font-size: 12px;
}
</style>
