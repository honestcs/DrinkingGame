<template>
  <div class="tod-container">
    <router-link to="/" class="btn-back">←</router-link>
    
    <div class="header">
      <div class="icon">❤️</div>
      <h1>真心话大冒险</h1>
    </div>

    <div class="game-area">
      <!-- 模式选择 -->
      <div class="mode-selector">
        <button 
          :class="['mode-btn', currentMode === 'truth' ? 'active truth' : '']"
          @click="setMode('truth')"
        >
          真心话
        </button>
        <button 
          :class="['mode-btn', currentMode === 'dare' ? 'active dare' : '']"
          @click="setMode('dare')"
        >
          大冒险
        </button>
      </div>

      <!-- 难度选择 -->
      <div class="difficulty-selector">
        <span class="label">难度：</span>
        <button 
          v-for="diff in difficulties" 
          :key="diff.key"
          :class="['diff-btn', currentDifficulty === diff.key ? 'active' : '']"
          @click="setDifficulty(diff.key)"
        >
          {{ diff.label }}
        </button>
      </div>

      <!-- 结果展示卡片 -->
      <div class="result-card" :class="[currentMode, isAnimating ? 'animating' : '']">
        <div class="card-content">
          <p v-if="!currentContent" class="placeholder-text">
            选择模式和难度<br>点击抽取开始
          </p>
          <p v-else class="content-text">{{ currentContent }}</p>
        </div>
      </div>

      <!-- 抽取按钮 -->
      <button class="btn-draw" @click="draw" :disabled="isAnimating">
        {{ isAnimating ? '抽取中...' : '✨ 抽取 ✨' }}
      </button>

      <!-- 提示信息 -->
      <p class="hint">
        当前题库：{{ currentModeText }} - {{ currentDifficultyText }}
        <br>
        <small style="opacity: 0.6;">(可在 src/data/truthOrDare.js 中添加更多题目)</small>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { truthOrDareData } from '../data/truthOrDare';

const currentMode = ref('truth'); // 'truth' or 'dare'
const currentDifficulty = ref('easy'); // 'easy', 'medium', 'hard'
const currentContent = ref('');
const isAnimating = ref(false);

const difficulties = [
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '普通' },
  { key: 'hard', label: '困难' }
];

const currentModeText = computed(() => currentMode.value === 'truth' ? '真心话' : '大冒险');
const currentDifficultyText = computed(() => {
  const diff = difficulties.find(d => d.key === currentDifficulty.value);
  return diff ? diff.label : '';
});

const setMode = (mode) => {
  currentMode.value = mode;
  currentContent.value = ''; // Clear result on mode change
};

const setDifficulty = (diff) => {
  currentDifficulty.value = diff;
};

const draw = () => {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  
  // Simple animation effect
  let count = 0;
  const maxCount = 10;
  const interval = setInterval(() => {
    // Show random temporary text during animation
    const pool = truthOrDareData[currentMode.value][currentDifficulty.value];
    const randomIndex = Math.floor(Math.random() * pool.length);
    currentContent.value = pool[randomIndex];
    
    count++;
    if (count >= maxCount) {
      clearInterval(interval);
      isAnimating.value = false;
    }
  }, 50);
};
</script>

<style scoped>
.tod-container {
  min-height: 100vh;
  background: radial-gradient(circle at 50% 30%, #2b102b, #201020 60%, #1a0b1a 100%);
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
}

.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  z-index: 10;
}

.header {
  margin-top: 40px;
  text-align: center;
  margin-bottom: 30px;
}

.header .icon {
  font-size: 48px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(255, 105, 180, 0.5));
}

h1 {
  margin: 0;
  font-size: 28px;
  background: linear-gradient(to right, #ff9a9e, #fecfef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-area {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-selector {
  display: flex;
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  padding: 4px;
}

.mode-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.mode-btn.active {
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.mode-btn.active.truth {
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  color: #880e4f;
}

.mode-btn.active.dare {
  background: linear-gradient(135deg, #a18cd1, #fbc2eb);
  color: #4a148c;
}

.difficulty-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.diff-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.diff-btn.active {
  background: rgba(255,255,255,0.9);
  color: #333;
  font-weight: bold;
  transform: scale(1.05);
}

.result-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transition: all 0.3s;
}

.result-card.truth {
  border-color: rgba(255, 154, 158, 0.3);
  box-shadow: 0 0 20px rgba(255, 154, 158, 0.1);
}

.result-card.dare {
  border-color: rgba(161, 140, 209, 0.3);
  box-shadow: 0 0 20px rgba(161, 140, 209, 0.1);
}

.content-text {
  font-size: 22px;
  line-height: 1.5;
  font-weight: bold;
}

.placeholder-text {
  color: rgba(255,255,255,0.4);
  font-size: 16px;
  line-height: 1.6;
}

.btn-draw {
  background: linear-gradient(to right, #ffecd2 0%, #fcb69f 100%);
  border: none;
  padding: 16px;
  border-radius: 50px;
  color: #d32f2f;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 100, 100, 0.4);
  transition: transform 0.1s;
}

.btn-draw:active {
  transform: scale(0.96);
}

.btn-draw:disabled {
  opacity: 0.7;
  cursor: wait;
}

.hint {
  text-align: center;
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  margin-top: 20px;
}
</style>
