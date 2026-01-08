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
      
      <div class="game-card placeholder">
        <div class="icon">❤️</div>
        <h2>真心话大冒险</h2>
        <p>敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goTo = (name) => {
  if (name === 'Dice') {
    // Correctly handle public path for dice.html
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL 
      : import.meta.env.BASE_URL + '/'
    const url = `${window.location.origin}${baseUrl}dice.html`
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
  /* Adjust min-width to allow 2 columns on slightly smaller screens if needed, 
     but 140px is a good balance */
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 800px;
  padding: 0 10px;
  box-sizing: border-box;
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

/* Small screen optimization */
@media (max-width: 350px) {
  .game-grid {
    grid-template-columns: 1fr;
  }
}
</style>
