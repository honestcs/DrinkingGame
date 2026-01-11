<template>
  <div class="most-likely">
    <div class="header">
      <button class="back-btn" @click="router.push('/')">← 返回</button>
      <h1>👇 谁最不可能 👇</h1>
    </div>

    <div class="card-container">
      <div class="question-card" :class="{ 'animating': isAnimating }">
        <div class="icon">🤔</div>
        <div class="question-text">{{ currentQuestion }}</div>
      </div>
    </div>

    <div class="controls">
      <button class="next-btn" @click="nextQuestion" :disabled="isAnimating">
        下一题 🎲
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questions } from '../data/mostLikely.js'

const router = useRouter()
const currentQuestion = ref('')
const isAnimating = ref(false)

const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
}

const nextQuestion = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  
  // 简单的淡出淡入效果模拟
  setTimeout(() => {
    currentQuestion.value = getRandomQuestion()
    // 稍微延迟移除动画类，以便触发CSS动画
    setTimeout(() => {
      isAnimating.value = false
    }, 50)
  }, 200)
}

onMounted(() => {
  currentQuestion.value = getRandomQuestion()
})
</script>

<style scoped>
.most-likely {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
  color: white;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  backdrop-filter: blur(5px);
  position: absolute;
  left: 0;
  z-index: 10;
}

h1 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.question-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 20px;
  width: 100%;
  max-width: 350px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.question-card.animating {
  transform: scale(0.9) opacity(0.5);
  filter: blur(2px);
}

.icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.question-text {
  font-size: 1.5rem;
  line-height: 1.6;
  font-weight: bold;
}

.controls {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.next-btn {
  background: #ff6b6b;
  border: none;
  color: white;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
  transition: transform 0.1s, box-shadow 0.1s;
}

.next-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 5px rgba(255, 107, 107, 0.4);
}

.next-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
