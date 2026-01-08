<template>
  <div class="revolver-game">
    <div class="header">
      <button class="back-btn" @click="router.back()">← 返回</button>
      <h2>左轮手枪 🔫</h2>
    </div>

    <!-- VIEW 1: LOADING / CYLINDER VIEW -->
    <div class="game-area cylinder-view" v-if="!isAiming">
      <!-- Pointer -->
      <div class="pointer">▼</div>

      <!-- Cylinder -->
      <div 
        class="cylinder" 
        :style="{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)` : 'transform 0.3s' }"
      >
        <div 
          v-for="(chamber, index) in chambers" 
          :key="index" 
          class="chamber"
          :class="{ 'has-bullet': chamber }"
          :style="{ transform: `rotate(${index * 60}deg) translateY(calc(var(--cylinder-size) * -0.32))` }"
          @click="toggleBullet(index)"
        >
          <div class="bullet-visual" v-if="chamber && !hideBullets"></div>
        </div>
        
        <!-- Center hub -->
        <div class="center-hub"></div>
      </div>

      <div class="status-message">
        {{ statusText }}
      </div>
    </div>

    <!-- VIEW 2: AIMING / GUN VIEW -->
    <div class="game-area gun-view" v-else>
      <div class="gun-container" :class="{ 'recoil-anim': isFiring, 'click-anim': isClicking }">
        <!-- Muzzle Flash -->
        <div class="muzzle-flash" v-if="showFlash"></div>
        
        <!-- Image Revolver -->
        <img src="@/assets/images/revolver.png" alt="Revolver" class="gun-img" />
      </div>
      
      <div class="status-message">
        {{ statusText }}
      </div>
    </div>

    <div class="controls">
      <!-- Loading Mode Controls -->
      <template v-if="!isAiming">
        <div class="top-controls">
          <button @click="loadRandom" :disabled="isSpinning">随机装弹</button>
          <button @click="resetChambers" :disabled="isSpinning">清空弹巢</button>
        </div>

        <div class="main-action">
          <button 
            class="action-btn spin-btn" 
            @click="spinCylinder"
            :disabled="bulletCount === 0 || isSpinning"
          >
            {{ isSpinning ? '旋转中...' : '旋转弹巢' }}
          </button>
        </div>
      </template>

      <!-- Aiming Mode Controls -->
      <template v-else>
        <div class="top-controls">
           <button @click="openCylinder" :disabled="isFiring">⟲ 打开弹巢</button>
           <button @click="startRespin" :disabled="isFiring">↻ 旋转弹巢</button>
        </div>
        
        <div class="main-action">
          <button 
            class="action-btn fire-btn" 
            @click="fire"
            :disabled="isFiring"
          >
            开火!
          </button>
        </div>
      </template>
    </div>

    <!-- Modal for Result -->
    <div v-if="showResultModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content">
        <h1>💥 BANG! 💥</h1>
        <p>你中弹了！</p>
        <p class="punishment">🍺 罚酒一杯 🍺</p>
        <button @click="closeModal">再来一局</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Game State
const chambers = ref([false, false, false, false, false, false]) 
const currentChamberIndex = ref(0) 
const rotation = ref(0) 
const isSpinning = ref(false)
const spinDuration = ref(2) 
const isAiming = ref(false) // New state: Aiming mode vs Loading mode
const hideBullets = ref(false) 
const statusText = ref('请装填子弹...')
const lastResult = ref('')
const showResultModal = ref(false)

// Animation States
const isFiring = ref(false)
const isClicking = ref(false)
const isHammerStriking = ref(false)
const showFlash = ref(false)

// Audio Context
let audioCtx = null

onMounted(() => {
  document.addEventListener('click', initAudio, { once: true })
})

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
}

const playSound = (type) => {
  if (!audioCtx) return
  
  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  
  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  
  if (type === 'click') {
    osc.type = 'square'
    osc.frequency.setValueAtTime(800, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05)
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.05)
  } else if (type === 'bang') {
    // Better BANG sound
    // Low frequency punch
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5)
    
    // Noise buffer for texture
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 sec
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
    noiseGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.start()
    noise.start()
    osc.stop(audioCtx.currentTime + 0.5)
    noise.stop(audioCtx.currentTime + 0.5)
  } else if (type === 'spin') {
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(200, audioCtx.currentTime)
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.5)
  }
}

// Logic
const bulletCount = computed(() => chambers.value.filter(c => c).length)

const toggleBullet = (index) => {
  if (isAiming.value) return 
  chambers.value[index] = !chambers.value[index]
  updateStatus()
}

const loadRandom = () => {
  chambers.value = [false, false, false, false, false, false]
  const randomIndex = Math.floor(Math.random() * 6)
  chambers.value[randomIndex] = true
  updateStatus()
}

const resetChambers = () => {
  chambers.value = [false, false, false, false, false, false]
  hideBullets.value = false
  statusText.value = '弹巢已清空'
  lastResult.value = ''
  isAiming.value = false
}

const updateStatus = () => {
  if (isAiming.value) {
    statusText.value = '准备射击...'
  } else {
    statusText.value = `已装填 ${bulletCount.value} 发子弹`
  }
}

const spinCylinder = () => {
  if (bulletCount.value === 0) return
  
  isSpinning.value = true
  statusText.value = '旋转中...'
  playSound('spin')
  
  const randomSteps = 24 + Math.floor(Math.random() * 12)
  const stepAngle = 60
  const totalRotationToAdd = randomSteps * stepAngle
  const targetRotation = rotation.value + totalRotationToAdd
  
  rotation.value = targetRotation
  
  setTimeout(() => {
    isSpinning.value = false
    hideBullets.value = true
    
    // Calculate index
    const normalizedRot = (targetRotation % 360 + 360) % 360
    const calculatedIndex = (6 - Math.round(normalizedRot / 60)) % 6
    currentChamberIndex.value = calculatedIndex
    
    // Auto switch to Aiming Mode
    isAiming.value = true
    statusText.value = '准备就绪！'
  }, spinDuration.value * 1000)
}

const openCylinder = () => {
  isAiming.value = false
  statusText.value = '查看弹巢'
}

const startRespin = () => {
  // Switch back to cylinder view
  isAiming.value = false
  // Give Vue a tick to render the cylinder before spinning so animation plays
  setTimeout(() => {
    spinCylinder()
  }, 50)
}

const fire = () => {
  if (isFiring.value || isClicking.value) return
  
  // Animate Hammer & Trigger
  isHammerStriking.value = true
  setTimeout(() => isHammerStriking.value = false, 200)

  // Logic delay slightly for hammer hit
  setTimeout(() => {
    const isHit = chambers.value[currentChamberIndex.value]
    
    if (isHit) {
      // BANG
      playSound('bang')
      isFiring.value = true
      showFlash.value = true
      lastResult.value = 'BANG!'
      statusText.value = 'BANG!!!'
      
      setTimeout(() => {
        showResultModal.value = true
        showFlash.value = false
        isFiring.value = false
        hideBullets.value = false // Reveal on death
      }, 500)
      
    } else {
      // Click
      playSound('click')
      isClicking.value = true
      lastResult.value = 'Click'
      statusText.value = '咔哒... 安全'
      
      // Rotate cylinder logical index (no visual rotation in gun view usually, or slight twitch)
      currentChamberIndex.value = (currentChamberIndex.value + 1) % 6
      
      setTimeout(() => {
        isClicking.value = false
      }, 200)
    }
  }, 100) // Delay for hammer strike
}

const closeModal = () => {
  showResultModal.value = false
  isAiming.value = false // Go back to loading
  resetChambers()
}
</script>

<style scoped>
.revolver-game {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: white;
  overflow: hidden;
  --cylinder-size: min(80vmin, 400px);
  --chamber-size: calc(var(--cylinder-size) * 0.24);
  --bullet-size: calc(var(--chamber-size) * 0.76);
}

.header {
  padding: 15px;
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 1rem;
  cursor: pointer;
  padding: 5px 10px;
}

.header h2 {
  margin: 0 auto;
  font-size: 1.2rem;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Cylinder View Styles (Reused) */
.pointer {
  position: absolute;
  top: 10%;
  font-size: 2rem;
  color: red;
  z-index: 10;
  text-shadow: 0 0 10px red;
}

.cylinder {
  width: var(--cylinder-size);
  height: var(--cylinder-size);
  border-radius: 50%;
  background: radial-gradient(circle, #444 20%, #222 60%, #111 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.8);
  border: 5px solid #333;
  max-width: 95vw;
  max-height: 95vw;
}

.chamber {
  position: absolute;
  width: var(--chamber-size);
  height: var(--chamber-size);
  border-radius: 50%;
  background: #000;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bullet-visual {
  width: var(--bullet-size);
  height: var(--bullet-size);
  border-radius: 50%;
  background: radial-gradient(circle, #f1c40f 40%, #d35400 100%);
  box-shadow: 0 0 5px #f1c40f;
  position: relative;
}

.bullet-visual::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background: #bdc3c7;
  border: 1px solid #7f8c8d;
}

.center-hub {
  width: calc(var(--cylinder-size) * 0.2);
  height: calc(var(--cylinder-size) * 0.2);
  border-radius: 50%;
  background: #555;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  z-index: 5;
}

/* Gun View Styles */
.gun-container {
  width: 100%;
  max-width: 600px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.gun-img {
  width: 100%;
  height: auto;
  max-height: 50vh;
  filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5));
  object-fit: contain;
}

.muzzle-flash {
  position: absolute;
  top: 25%;
  left: -5%; /* Adjusted for image positioning - might need tuning based on actual image */
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #fff, #ffeb3b, #ff5722, transparent);
  border-radius: 50%;
  z-index: 20;
  opacity: 0.8;
  filter: blur(5px);
  animation: flash-anim 0.1s ease-out;
  transform-origin: center;
}

/* Animations */
@keyframes flash-anim {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.recoil-anim .gun-img {
  animation: recoil 0.2s cubic-bezier(0.1, 0.5, 0.1, 1);
}

@keyframes recoil {
  0% { transform: rotate(0deg) translateX(0); }
  10% { transform: rotate(-15deg) translateX(-20px); }
  100% { transform: rotate(0deg) translateX(0); }
}

.click-anim .gun-img {
  animation: twitch 0.1s linear;
}

@keyframes twitch {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
}

/* Removed SVG specific animations (hammer-strike, trigger-pull) as they don't apply to img */


.status-message {
  margin-top: 5vh;
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-weight: bold;
  height: 30px;
  text-align: center;
  width: 100%;
}

.controls {
  padding: 3vh 5vw;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4));
  display: flex;
  flex-direction: column;
  gap: 2vh;
  flex-shrink: 0;
  padding-bottom: max(3vh, env(safe-area-inset-bottom));
  width: 100%;
  box-sizing: border-box;
}

.top-controls {
  display: flex;
  justify-content: space-around;
  gap: 3vw;
}

.top-controls button {
  padding: 1.5vh 0;
  border-radius: 50px;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  flex: 1;
  font-size: clamp(0.9rem, 3.5vw, 1.2rem);
  font-weight: 600;
  white-space: nowrap;
  backdrop-filter: blur(5px);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.top-controls button:active {
  background: rgba(255,255,255,0.2);
  transform: scale(0.95);
}

.top-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.main-action {
  display: flex;
  justify-content: center;
  width: 100%;
}

.action-btn {
  width: 100%;
  padding: 2.5vh 0;
  border-radius: 15px;
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.spin-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 0.8vh 0 #1c5980, 0 1vh 2vh rgba(0,0,0,0.4);
}

.spin-btn:active {
  transform: translateY(0.8vh);
  box-shadow: 0 0 0 #1c5980, inset 0 0 10px rgba(0,0,0,0.4);
}

.spin-btn:disabled {
  background: #7f8c8d;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
}

.fire-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  box-shadow: 0 0.8vh 0 #922b21, 0 1vh 2vh rgba(192, 57, 43, 0.4);
  animation: pulse-glow 2s infinite;
}

.fire-btn:active {
  transform: translateY(0.8vh);
  box-shadow: 0 0 0 #922b21, inset 0 0 10px rgba(0,0,0,0.4);
  animation: none;
}

@keyframes pulse-glow {
  0% { transform: scale(1); box-shadow: 0 0.8vh 0 #922b21, 0 0 0 rgba(231, 76, 60, 0.7); }
  50% { transform: scale(1.02); box-shadow: 0 0.8vh 0 #922b21, 0 0 20px rgba(231, 76, 60, 0.7); }
  100% { transform: scale(1); box-shadow: 0 0.8vh 0 #922b21, 0 0 0 rgba(231, 76, 60, 0); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(192, 57, 43, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: flash 0.5s;
}

.modal-content {
  background: white;
  color: #c0392b;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
  width: 80%;
  max-width: 400px;
}

.punishment {
  font-size: 1.5rem;
  margin: 20px 0;
  font-weight: bold;
}

.modal-content button {
  margin-top: 10px;
  padding: 10px 30px;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  width: 100%;
}

@keyframes flash {
  0% { opacity: 0; }
  10% { opacity: 1; background: white; }
  100% { opacity: 1; background: rgba(192, 57, 43, 0.9); }
}

@media (max-height: 600px) {
  .revolver-game {
    --cylinder-size: min(70vmin, 300px);
  }
  .status-message {
    margin-top: 10px;
  }
  .controls {
    padding: 10px;
  }
}
</style>
