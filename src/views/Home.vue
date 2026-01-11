<template>
  <div class="home">
    <h1>🍸 酒桌小游戏 🎲</h1>
    <div class="game-grid">
      <div class="game-card revolver" @click="goTo('Revolver')">
        <div class="icon">🔫</div>
        <h2>左轮手枪</h2>
        <p>俄罗斯轮盘赌模拟器</p>
      </div>
      
      <!-- Placeholders for future games -->
      <div class="game-card dice" @click="goTo('Dice')">
        <div class="icon">🎲</div>
        <h2>摇骰子</h2>
        <p>多人聚会必备</p>
      </div>
      
      <div class="game-card tod" @click="goTo('TruthOrDare')">
        <div class="icon">❤️</div>
        <h2>真心话大冒险</h2>
        <p>经典聚会游戏</p>
      </div>

      <div class="game-card most-likely" @click="goTo('MostLikely')">
        <div class="icon">👇</div>
        <h2>谁最不可能</h2>
        <p>互相指认，票多者罚</p>
      </div>

      <div class="game-card never-have-i-ever" @click="goTo('NeverHaveIEver')">
        <div class="icon">🤫</div>
        <h2>我有你没有</h2>
        <p>有的举手，独自社死</p>
      </div>
      
      <!-- <div class="game-card crocodile" @click="goTo('Crocodile')">
        <div class="icon">🐊</div>
        <h2>咬手鳄鱼</h2>
        <p>点牙齿，可能被咬</p>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goTo = (name) => {
  if (name === 'Dice') {
    const url = `${import.meta.env.BASE_URL}dice.html`
    window.location.href = url
  } else {
    router.push({ name })
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* Safe area for mobile devices */
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  color: white;
  box-sizing: border-box;
}

h1 {
  margin-bottom: 30px;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  text-align: center;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 800px;
  padding: 0 15px;
  box-sizing: border-box;
}

@media (min-width: 600px) {
  .game-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

.game-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1; /* Make cards square-ish */
}

.game-card:active {
  transform: scale(0.95);
}

.game-card.revolver {
  background: linear-gradient(135deg, #2c3e50, #000000);
  border: 1px solid #e74c3c;
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.3);
}

.game-card.dice {
  background: linear-gradient(135deg, #16a085, #2c3e50);
  border: 1px solid #1abc9c;
  box-shadow: 0 0 15px rgba(26, 188, 156, 0.3);
}

.game-card.tod {
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  border: 1px solid #ff6b6b;
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
  color: #880e4f;
}
.game-card.tod p {
  color: #880e4f;
}

.game-card.most-likely {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border: 1px solid #00f2fe;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
  color: #01579b;
}
.game-card.most-likely p {
  color: #01579b;
}

.game-card.never-have-i-ever {
  background: linear-gradient(135deg, #43cea2, #185a9d);
  border: 1px solid #43cea2;
  box-shadow: 0 0 15px rgba(67, 206, 162, 0.3);
  color: #e0f2f1;
}
.game-card.never-have-i-ever p {
  color: #e0f2f1;
}

.game-card.crocodile {
  background: linear-gradient(135deg, #2f1847, #0b0d1b);
  border: 1px solid #7b5cff;
  box-shadow: 0 0 15px rgba(123, 92, 255, 0.35);
}

.game-card.placeholder {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  font-size: clamp(2.5rem, 8vw, 4rem);
  margin-bottom: 15px;
}

h2 {
  margin: 0 0 5px;
  font-size: clamp(1rem, 4vw, 1.3rem);
}

p {
  font-size: 0.8rem;
  opacity: 0.8;
  margin: 0;
}
</style>
