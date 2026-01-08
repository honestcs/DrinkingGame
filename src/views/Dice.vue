<template>
  <div class="dice-game-container">
    <!-- Back Button (Top Left) -->
    <button class="back-btn" @click="router.back()">
      <span class="back-arrow">‹</span>
    </button>

    <!-- 3D Game Stage -->
    <div class="stage">
      <!-- The Base Plate -->
      <div class="plate">
        <div class="plate-inner"></div>
      </div>

      <!-- Dice Group -->
      <div class="dice-group">
        <div 
          v-for="(die, index) in dice" 
          :key="index" 
          class="die-wrapper"
          :style="die.style"
        >
          <div class="cube">
            <!-- Fixed Faces: 1=Front, 6=Back, 2=Top, 5=Bottom, 3=Right, 4=Left -->
            <!-- Face 1 (Front) - 1 Red Dot -->
            <div class="face front"><span class="dot red big"></span></div>
            
            <!-- Face 6 (Back) - 6 Blue Dots -->
            <div class="face back">
              <span class="dot blue"></span><span class="dot blue"></span>
              <span class="dot blue"></span><span class="dot blue"></span>
              <span class="dot blue"></span><span class="dot blue"></span>
            </div>
            
            <!-- Face 2 (Top) - 2 Blue Dots -->
            <div class="face top">
              <span class="dot blue"></span><span class="dot blue"></span>
            </div>
            
            <!-- Face 5 (Bottom) - 5 Blue Dots -->
            <div class="face bottom">
              <span class="dot blue"></span><span class="dot blue"></span>
              <span class="dot blue"></span><span class="dot blue"></span>
              <span class="dot blue"></span>
            </div>
            
            <!-- Face 3 (Right) - 3 Blue Dots -->
            <div class="face right">
              <span class="dot blue"></span><span class="dot blue"></span><span class="dot blue"></span>
            </div>
            
            <!-- Face 4 (Left) - 4 Red Dots -->
            <div class="face left">
              <span class="dot red"></span><span class="dot red"></span>
              <span class="dot red"></span><span class="dot red"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- The Cup -->
      <div class="cup" :class="{ 'cup-open': isOpen, 'cup-shaking': isShaking }">
        <div class="cup-body">
          <div class="cup-shield"></div>
        </div>
        <div class="cup-rim"></div>
      </div>
    </div>

    <!-- Status Text -->
    <div class="status-text">
      {{ isShaking ? '摇晃中...' : (isOpen ? `总点数: ${totalValue}` : '请点击“摇”') }}
    </div>

    <!-- Bottom Controls -->
    <div class="bottom-bar">
      <!-- History Button -->
      <button class="control-btn small-btn" @click="showHistory = true">
        <span class="icon">🔔</span>
      </button>

      <!-- Main Shake Button -->
      <button class="main-shake-btn" @click="handleMainAction" :disabled="isShaking">
        <div class="btn-inner">
          {{ isOpen ? '摇' : '开' }}
        </div>
      </button>

      <!-- Settings Button -->
      <button class="control-btn small-btn" @click="showSettings = true">
        <span class="icon">⚙️</span>
      </button>
    </div>

    <!-- Modals (History/Settings) -->
    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
      <div class="modal-content">
        <h3>历史记录</h3>
        <div class="history-list">
          <div v-for="(record, idx) in history" :key="idx" class="history-item">
            <span>{{ record.time }}</span>
            <span class="history-dice">{{ record.dice.join(', ') }}</span>
            <span>{{ record.total }}点</span>
          </div>
          <div v-if="history.length === 0" class="empty-tip">暂无记录</div>
        </div>
        <button class="close-modal" @click="showHistory = false">关闭</button>
      </div>
    </div>

    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal-content">
        <h3>设置</h3>
        <div class="setting-row">
          <label>骰子数量: {{ diceCount }}</label>
          <input type="range" min="1" max="10" v-model.number="diceCount">
        </div>
        <button class="close-modal" @click="showSettings = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const diceCount = ref(5)
const dice = ref([])
const isOpen = ref(true) // Start open
const isShaking = ref(false)
const showHistory = ref(false)
const showSettings = ref(false)
const history = ref([])

// Audio
let audioCtx = null

onMounted(() => {
  document.addEventListener('click', initAudio, { once: true })
  // Init dice
  generateDice(true)
})

watch(diceCount, () => {
  generateDice(true)
})

const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
}

const playSound = (type) => {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  
  if (type === 'shake') {
    // Simple noise
    const bufferSize = audioCtx.sampleRate * 0.1
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = audioCtx.createGain()
    noise.connect(noiseGain)
    noiseGain.connect(audioCtx.destination)
    noiseGain.gain.value = 0.5
    noise.start()
  } else if (type === 'open') {
    osc.frequency.setValueAtTime(300, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime)
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.2)
  }
}

const totalValue = computed(() => dice.value.reduce((s, d) => s + d.value, 0))

const handleMainAction = () => {
  if (isShaking.value) return

  if (isOpen.value) {
    // If open, action is "Shake"
    // 1. Close cup
    isOpen.value = false
    // 2. Wait for close anim then shake
    setTimeout(() => {
      startShaking()
    }, 400)
  } else {
    // If closed, action is "Open"
    openCup()
  }
}

const startShaking = () => {
  isShaking.value = true
  if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50])
  
  const interval = setInterval(() => playSound('shake'), 100)
  
  setTimeout(() => {
    clearInterval(interval)
    isShaking.value = false
    // Generate result while hidden
    generateDice()
    // Remain closed
  }, 1000)
}

const openCup = () => {
  isOpen.value = true
  playSound('open')
  // Save history
  history.value.unshift({
    time: new Date().toLocaleTimeString(),
    dice: dice.value.map(d => d.value),
    total: totalValue.value
  })
}

const generateDice = (init = false) => {
  const newDice = []
  const positions = []
  // Plate radius approx 100px visual
  const maxDist = 70
  
  for (let i = 0; i < diceCount.value; i++) {
    // Random value
    const val = Math.floor(Math.random() * 6) + 1
    
    // Random Position (simple collision avoidance)
    // We want dice clustered in center but not overlapping.
    // Use a physics-like packing or simple rejection sampling with bias to center.
    let x, z
    let attempts = 0
    let valid = false
    while (!valid && attempts < 100) {
      // Gaussian-like distribution for center clustering
      // Box-Muller transform or just sum of randoms
      const r1 = Math.random();
      const r2 = Math.random();
      // Distance: prefer closer to 0. 
      // Linear random gives uniform disk. We want cluster.
      // Let's use random * random * maxDist to bias heavily to center?
      // Or just standard uniform disk but small maxDist.
      
      // Let's use a dynamic radius that grows if we fail to place.
      // But simple rejection with random angle and random radius * radius (area bias) is standard for uniform.
      // For center cluster, we want linear radius? No, that biases to center.
      // Let's try:
      const angle = Math.random() * Math.PI * 2
      const radiusBias = Math.random() // 0 to 1
      const dist = radiusBias * maxDist * 0.8 // Keep within 80% of max mostly
      
      x = Math.cos(angle) * dist
      z = Math.sin(angle) * dist
      
      valid = true
      for (const p of positions) {
        const dx = p.x - x
        const dz = p.z - z
        // Min dist = dice size (30) * sqrt(2) approx + padding? 
        // 35px is safe.
        if (Math.sqrt(dx*dx + dz*dz) < 38) { 
          valid = false
          break
        }
      }
      attempts++
    }
    // Fallback: spiral placement if stuck
    if (!valid) {
       const spiralAngle = i * 1.5
       const spiralDist = 20 + i * 5
       x = Math.cos(spiralAngle) * spiralDist
       z = Math.sin(spiralAngle) * spiralDist
    }
    positions.push({x, z})
    
    // Rotation to show face
    // We want dice to lie FLAT on the plate.
    // Plate is rotated X 60deg. Dice group inherits this.
    // So "Flat" means parallel to the plate surface.
    // Our cube faces are defined such that they form a box.
    // To show a face UP, we rotate the CUBE container.
    // We also want a random spin around the vertical axis (Y axis perpendicular to plate).
    // And maybe slight tilt for realism (physics), but user asked for "Flat on base".
    // Reference image 1 vs 2: Dice are scattered, some rotated differently.
    // Key: They sit ON the plate.
    
    const rotation = getRotationForValue(val)
    
    // Position: 
    // Plate center is 0,0. 
    // Dice need to be on top of plate. 
    // Plate is at Z=0 in its local space? 
    // Actually Plate has transform-style: preserve-3d.
    // Inner plate is flat.
    // Dice group is at same level.
    // We need to lift dice up by half their height (15px) to sit ON the plate.
    // translateZ(15px) relative to the group plane.
    
    newDice.push({
      value: val,
      style: {
        transform: `translate3d(${x}px, ${z}px, 15px) ${rotation}`
      }
    })
  }
  dice.value = newDice
}

const getRotationForValue = (val) => {
  // Base rotations to bring face to Top (Z+ direction in our plate-aligned space)
  // Our faces: Front(Z+), Back(Z-), Right(X+), Left(X-), Top(Y-), Bottom(Y+) -> Wait, let's check CSS.
  // CSS: Front=Z+, Back=Z-, Right=X+, Left=X-, Top=X(90)(so Y-?), Bottom=X(-90)(so Y+?)
  // Actually Top is rotated X 90deg. Initial face is Z plane. X 90 moves Y plane to Z plane?
  // Let's stick to: We need face 'val' to point towards Z+ (Up from plate).
  
  // Mapping to bring specific face to Z+ (Up):
  const baseRotations = {
    1: 'rotateX(0deg)',    // Front is already Z+
    2: 'rotateX(-90deg)',  // Top (was Y-) -> Rotate X -90 brings Top to Z+? 
                           // Face Top definition: rotateX(90deg) translateZ(15px).
                           // This puts it at Y- (top of screen).
                           // To bring it to Front (Z+), we need to rotate X -90.
    3: 'rotateY(-90deg)',  // Right (X+) -> Rotate Y -90 brings it to Z+.
    4: 'rotateY(90deg)',   // Left (X-) -> Rotate Y 90 brings it to Z+.
    5: 'rotateX(90deg)',   // Bottom (Y+) -> Rotate X 90 brings it to Z+.
    6: 'rotateX(180deg)'   // Back (Z-) -> Rotate X 180 brings it to Z+.
  }
  
  // Random spin around Z axis (which is "Up" relative to plate surface)
  const randomSpin = Math.floor(Math.random() * 360)
  
  return `rotateZ(${randomSpin}deg) ${baseRotations[val]}`
}

// Helpers for dots
const getFaceDots = (val, faceIdx) => {
  // This logic is just to render correct number of dots for the cube face structure
  // It doesn't determine WHICH face is shown (that's rotation)
  // Standard dice faces:
  // Face 1: 1 dot
  // Face 2: 2 dots
  // ...
  return faceIdx // The face index IS the number of dots for standard layout
}

const getDotColor = (faceVal, dotIndex) => {
  // Red for 1 and 4
  if (faceVal === 1 || faceVal === 4) return 'red'
  return 'blue'
}
</script>

<style scoped>
.dice-game-container {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #0f2027, #203a43, #2c5364); /* Deep Blue/Black bg */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: sans-serif;
  color: white;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
}

/* STAGE */
.stage {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px; /* 3D Perspective */
  transform-style: preserve-3d;
}

/* PLATE */
.plate {
  position: absolute;
  width: 280px;
  height: 280px;
  /* Rotate X to make it look like a flat disk on the floor */
  transform: rotateX(60deg);
  background: #1e5799; /* Fallback */
  background: radial-gradient(ellipse at center, #2989d8 0%, #1e5799 50%, #003060 100%);
  border-radius: 50%;
  box-shadow: 
    0 10px 20px rgba(0,0,0,0.5),
    inset 0 0 10px rgba(0,0,0,0.5);
  border: 4px solid #3b9add;
  z-index: 1;
}

.plate-inner {
  position: absolute;
  top: 10px; left: 10px; right: 10px; bottom: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.1);
}

/* DICE GROUP */
.dice-group {
  position: absolute;
  width: 0; height: 0;
  /* Align with plate perspective */
  /* Plate is rotated X 60deg. 
     Dice Group is sibling to Plate. 
     It should also be rotated X 60deg to match the plane. 
     But since we render 3D cubes, we want the cubes to sit on that plane.
     The cubes themselves are 3D objects.
     If we rotate the group container, the local Z axis of the group becomes the normal to the plate.
     So placing dice at Z=15 (half height) puts them ON the plate.
  */
  transform: rotateX(60deg); 
  transform-style: preserve-3d;
  z-index: 2;
}

.die-wrapper {
  position: absolute;
  width: 30px; height: 30px;
  margin-left: -15px; margin-top: -15px;
  transform-style: preserve-3d;
  transition: transform 0.3s;
}

.cube {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  /* Cube center is at 0,0,0 of wrapper. Wrapper is at Z=15 relative to group. 
     So Cube center is 15px above plate.
     Faces are +/- 15px from center.
     Bottom face is at Cube Y+15? No.
     Faces:
     Front: Z+15
     Back: Z-15
     Right: X+15
     Left: X-15
     Top: Y-15 (if rotated X 90) -> Wait, check face defs.
     Top: rotateX(90deg) translateZ(15px).
     Bottom: rotateX(-90deg) translateZ(15px).
     
     If cube is unrotated:
     Top face is at Y = -15? No.
     RotateX(90) turns Y- axis to Z+ axis?
     CSS coords: X right, Y down, Z towards viewer.
     RotateX(90): Y+ moves to Z+, Z+ moves to Y-.
     TranslateZ(15) moves along new Z axis (old Y-).
     So Top face ends up at Y = -15.
     Bottom face (RotateX -90): Y+ moves to Z-, Z+ moves to Y+.
     TranslateZ(15) moves along new Z (old Y+).
     So Bottom face is at Y = +15.
     
     So the cube extends from Y=-15 to Y=+15.
     If we place wrapper at Z=15 (relative to plate group), and plate group is X-rotated...
     Wait, Z axis of group points "Up" (Normal to plate).
     So Wrapper is 15px "Up" from plate.
     Cube Y axis is parallel to plate surface?
     No.
     In the group's coordinate system:
     X is Right on plate.
     Y is "Down" on plate (towards viewer if flat, or down slope if tilted).
     Z is "Up" perpendicular to plate.
     
     So `translate3d(x, z, 15px)` puts wrapper center 15px above plate.
     The Cube inside wrapper:
     We want "Bottom" face to touch plate (Z=0).
     We want "Top" face to be at Z=30.
     Currently Cube Y axis is along plate Y. Z axis is along plate Z.
     Faces Front/Back are Z+/-15. So they are parallel to plate?
     No, Front/Back are in XY plane originally, moved Z.
     So Front is at Z=+15 (Top of die?), Back is at Z=-15 (Bottom of die touching plate?).
     
     If Front is Z+15 (relative to wrapper Z=15) -> Z=30 (Top).
     Back is Z-15 (relative to wrapper Z=15) -> Z=0 (Bottom).
     
     So standard CSS Cube (Front/Back on Z axis) is actually oriented with Z axis as "Depth/Height" if we view from top.
     Yes!
     So "Front" face is the "Top" visual face (highest Z).
     "Back" face is "Bottom" visual face (lowest Z).
     "Top/Bottom" faces are actually "Side" faces (along Y axis).
     
     So my previous rotation logic was:
     1 (Front) -> rotateX(0) -> Z+ (Top of die).
     2 (Top) -> rotateX(-90) -> Moves Top face to Z+?
     Face Top is originally at Y- (Side top). Rotate X -90 moves Y- to Z-. Wait.
     Rotate X -90: Y+ -> Z-, Z+ -> Y+.
     So Y- -> Z+.
     Yes!
     
     So my logic holds:
     Z axis IS the vertical axis perpendicular to the plate.
     Dice sit on plate (Z=0).
     Wrapper is at Z=15.
     Faces extend +/- 15 in Z.
     So die sits perfectly from Z=0 to Z=30.
     
     This confirms physics are correct.
  */
}

.face {
  position: absolute;
  width: 30px; height: 30px;
  background: radial-gradient(circle at 30% 30%, #ffffff, #f0f0f0);
  border-radius: 6px; /* Rounded corners */
  box-shadow: 
    inset 0 0 2px rgba(0,0,0,0.1), /* Soft inner shadow */
    inset 2px 2px 5px rgba(255,255,255,0.8), /* Highlight */
    0 0 2px rgba(0,0,0,0.1); /* Border definition */
  display: grid;
  padding: 2px;
  box-sizing: border-box;
  backface-visibility: hidden;
  border: 1px solid #e0e0e0;
}

/* Standard Cube Mapping */
/* Dice size 30px -> translate 15px */
/* Faces need to be oriented so dots look correct. 
   Ref image 1 shows standard faces:
   1 (Red Center)
   2 (Blue Diagonal)
   3 (Blue Diagonal 3)
   4 (Red Corners)
   5 (Blue Quincunx)
   6 (Blue 2x3)
   
   Standard Western Dice Layout:
   Opposite faces sum to 7.
   1 opposite 6
   2 opposite 5
   3 opposite 4
   
   If 1 is Front:
   6 is Back.
   If 2 is Top:
   5 is Bottom.
   If 3 is Right:
   4 is Left.
   
   Let's ensure CSS transforms match this.
   Front (Z+): 1
   Back (Z-): 6
   Right (X+): 3
   Left (X-): 4
   Top (Y-): 2
   Bottom (Y+): 5
   
   Our current CSS:
   Front: rotateY(0) -> Z+
   Back: rotateY(180) -> Z-
   Right: rotateY(90) -> X+
   Left: rotateY(-90) -> X-
   Top: rotateX(90) -> Y- (Standard CSS Top is usually Y- relative to screen center if rotated X 90?) 
       Actually rotateX(90) points face Up (Y-) if we consider element flow.
       Let's verify visually.
   Bottom: rotateX(-90) -> Y+
   
   So mapping:
   Front = 1 (Red)
   Back = 6 (Blue)
   Right = 3 (Blue)
   Left = 4 (Red) -> Wait, Reference says 4 is Red. Standard dice usually 1 and 4 are red in Asia? 
       Western dice usually only 1 is red (or none). 
       Asian dice (Chinese): 1 and 4 are Red.
       User Ref Image 1 shows: 1 is Red, 4 is Red. 2,3,5,6 are Blue.
       So:
       1 (Front) -> Red
       4 (Left) -> Red
       Others -> Blue
   
   This matches my `getDotColor` logic: `if (faceVal === 1 || faceVal === 4) return 'red'`.
   
   But we need to ensure the `dice-wrapper` rotation logic uses this mapping.
   My previous `baseRotations` assumed:
   1=Front, 2=Top, 3=Right, 4=Left, 5=Bottom, 6=Back.
   Let's check `baseRotations` again.
*/

.face.front  { transform: rotateY(0deg) translateZ(15px); }
.face.back   { transform: rotateY(180deg) translateZ(15px); }
.face.right  { transform: rotateY(90deg) translateZ(15px); }
.face.left   { transform: rotateY(-90deg) translateZ(15px); }
.face.top    { transform: rotateX(90deg) translateZ(15px); }
.face.bottom { transform: rotateX(-90deg) translateZ(15px); }

/* DICE GROUP */
.dice-group {
  position: absolute;
  width: 0; height: 0;
  /* Align with plate perspective */
  /* Plate is rotated X 60deg. 
     Dice Group is sibling to Plate. 
     It should also be rotated X 60deg to match the plane. 
     But since we render 3D cubes, we want the cubes to sit on that plane.
     The cubes themselves are 3D objects.
     If we rotate the group container, the local Z axis of the group becomes the normal to the plate.
     So placing dice at Z=15 (half height) puts them ON the plate.
  */
  transform: rotateX(60deg); 
  transform-style: preserve-3d;
  z-index: 2;
  transition: opacity 0.3s; /* Fade in/out */
}

/* Hide dice when cup is closed */
.stage:has(.cup:not(.cup-open)) .dice-group {
  opacity: 0;
}

/* Fallback if :has not supported (works in Chrome/Edge/Safari/Firefox now) */
/* Or use Vue binding to toggle class on stage */

/* Dots Layout (Grid 3x3) */
.face { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
.dot { 
  width: 7px; height: 7px; 
  border-radius: 50%; 
  align-self: center; justify-self: center; 
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.5); /* Inset look */
}
.dot.red { background: #d32f2f; }
.dot.blue { background: #1976d2; }

/* Dot Positions Helper - Standard Dice */
/* 1 */ .face .dot:nth-child(1):nth-last-child(1) { grid-area: 2/2; width: 12px; height: 12px; } 
/* 2 (Vertical middle column) */ .face .dot:nth-child(1):nth-last-child(2) { grid-area: 1/2; } .face .dot:nth-child(2):nth-last-child(2) { grid-area: 3/2; }
/* 3 (Diagonal from top-right to bottom-left) */ .face .dot:nth-child(1):nth-last-child(3) { grid-area: 1/3; } .face .dot:nth-child(2):nth-last-child(3) { grid-area: 2/2; } .face .dot:nth-child(3):nth-last-child(3) { grid-area: 3/1; }
/* 4 */ .face .dot:nth-child(1):nth-last-child(4) { grid-area: 1/1; } .face .dot:nth-child(2):nth-last-child(4) { grid-area: 1/3; } .face .dot:nth-child(3):nth-last-child(4) { grid-area: 3/1; } .face .dot:nth-child(4):nth-last-child(4) { grid-area: 3/3; }
/* 5 */ .face .dot:nth-child(1):nth-last-child(5) { grid-area: 1/1; } .face .dot:nth-child(2):nth-last-child(5) { grid-area: 1/3; } .face .dot:nth-child(3):nth-last-child(5) { grid-area: 2/2; } .face .dot:nth-child(4):nth-last-child(5) { grid-area: 3/1; } .face .dot:nth-child(5):nth-last-child(5) { grid-area: 3/3; }
/* 6 */ .face .dot:nth-child(1):nth-last-child(6) { grid-area: 1/1; } .face .dot:nth-child(2):nth-last-child(6) { grid-area: 1/3; } .face .dot:nth-child(3):nth-last-child(6) { grid-area: 2/1; } .face .dot:nth-child(4):nth-last-child(6) { grid-area: 2/3; } .face .dot:nth-child(5):nth-last-child(6) { grid-area: 3/1; } .face .dot:nth-child(6):nth-last-child(6) { grid-area: 3/3; }


/* CUP */
.cup {
  position: absolute;
  width: 200px;
  height: 240px;
  /* Initial Position: Hovering above plate (Open) or On Plate (Closed) */
  /* We use 2D transforms here but keep z-index high */
  z-index: 10;
  transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s;
  pointer-events: none;
  /* Center it */
  margin-top: -120px; 
}

.cup-body {
  width: 100%;
  height: 100%;
  /* Realistic Blue Cup Gradient */
  background: linear-gradient(90deg, #0d47a1, #42a5f5 30%, #1e88e5 60%, #0d47a1);
  border-radius: 10% 10% 45% 45% / 5% 5% 15% 15%; /* Tapered cylinder look */
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow: hidden;
}

/* Gold Shield Emblem */
.cup-shield {
  position: absolute;
  top: 25%;
  left: 20%;
  width: 60%;
  height: 40%;
  background: linear-gradient(135deg, #cfc09f, #ffecb3, #bcaaa4);
  clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%);
  opacity: 0.9;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
}

.cup-rim {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background: #0d47a1;
  border-radius: 50%;
  transform: scaleY(0.4);
  transform-origin: top;
  border: 1px solid #42a5f5;
  background: radial-gradient(circle, #002171, #0d47a1);
}

/* Cup States */
/* Open: Lifted UP */
.cup-open {
  transform: translateY(-200px) scale(0.9);
  opacity: 0.8;
}
/* Closed: On plate */
.cup:not(.cup-open) {
  transform: translateY(-30px); /* Adjust to sit on plate visual center */
}

.cup-shaking {
  animation: shake2D 0.1s infinite;
}

@keyframes shake2D {
  0% { transform: translateY(-30px) rotate(0deg); }
  25% { transform: translateY(-30px) rotate(3deg); }
  50% { transform: translateY(-30px) rotate(-3deg); }
  75% { transform: translateY(-30px) rotate(3deg); }
  100% { transform: translateY(-30px) rotate(0deg); }
}

/* BOTTOM BAR */
.bottom-bar {
  height: 120px;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding-bottom: 20px;
}

.control-btn {
  width: 50px; height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-shake-btn {
  width: 90px; height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff5252, #d32f2f);
  border: 4px solid #b71c1c;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
  color: white;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-shake-btn:active {
  transform: scale(0.95);
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.4);
}

.status-text {
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
  color: #81d4fa;
  text-shadow: 0 0 5px rgba(0,0,0,0.5);
}

/* Modals */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex; justify-content: center; align-items: center;
  z-index: 200;
}
.modal-content {
  background: #263238;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  color: white;
  max-height: 80vh;
  overflow-y: auto;
}
.history-item {
  display: flex; justify-content: space-between;
  border-bottom: 1px solid #37474f;
  padding: 10px 0;
}
.history-dice { color: #81d4fa; }
.close-modal {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background: #546e7a;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
</style>
