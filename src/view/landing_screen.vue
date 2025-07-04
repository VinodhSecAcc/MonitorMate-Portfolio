<template>
  <div class="landing-container">
    <!-- Animated Background -->
    <div class="bg-overlay"></div>
    <div class="floating-particles">
      <div class="particle" v-for="n in 50" :key="n" :style="getParticleStyle()"></div>
    </div>
    
    <!-- Main Content -->
    <div class="content-wrapper" :class="{ 'fade-out': isExiting }">
      <!-- Logo Container -->
      <div class="logo-container" :class="{ 'animate-logo': showLogo }">
        <img src="@/assets/app_logo2.png" alt="MonitorMate Logo" class="logo" />
      </div>
      
      <!-- App Name -->
      <div class="app-name" :class="{ 'animate-text': showText }">
        <h1 class="main-title">
          <span v-for="(letter, index) in 'MonitorMate'" :key="index" 
                :style="{ animationDelay: `${index * 0.1}s` }" 
                class="letter">{{ letter }}</span>
        </h1>
        <div class="subtitle-container">
          <p class="subtitle">Smart Monitoring Solution</p>
          <div class="subtitle-line"></div>
        </div>
      </div>
      
      <!-- Loading Animation -->
      <div class="loading-section" :class="{ 'animate-loading': showLoading }">
        <div class="loading-bar">
          <div class="loading-progress" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <p class="loading-text">Initializing System...</p>
      </div>
      
      <!-- Decorative Elements -->
      <div class="deco-lines">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
        <div class="line line-3"></div>
      </div>
    </div>
    
    <!-- Navigation happens through Vue Router -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'

export default {
  name: 'LandingScreen',
  setup() {
  useHead({
      title: 'MonitorMate',
      meta: [
        { name: 'description', content: 'This is a sample description' }
      ]
    });
    const router = useRouter()
    const showLogo = ref(false)
    const showText = ref(false)
    const showLoading = ref(false)
    const loadingProgress = ref(0)
    const isExiting = ref(false)

    const getParticleStyle = () => {
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${12 + Math.random() * 8}s`
      }
    }

    onMounted(() => {
      // Animation sequence
      setTimeout(() => showLogo.value = true, 200)
      setTimeout(() => showText.value = true, 800)
      setTimeout(() => showLoading.value = true, 1500)
      
      // Loading progress animation
      const progressInterval = setInterval(() => {
        if (loadingProgress.value < 100) {
          loadingProgress.value += 2
        } else {
          clearInterval(progressInterval)
        }
      }, 80)
      
      // Exit animation and navigation
      setTimeout(() => {
        isExiting.value = true
        setTimeout(() => {
          router.push('/signin')
        }, 800)
      }, 5200)
    })

    return {
      showLogo,
      showText,
      showLoading,
      loadingProgress,
      isExiting,
      getParticleStyle
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Prevent scrolling on body and html */
html, body {
  overflow: hidden !important;
  height: 100% !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.landing-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #1a4d3a 0%, #0f0f0f 70%, #000000 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.05) 0%, transparent 50%);
  animation: backgroundPulse 4s ease-in-out infinite alternate;
}

@keyframes backgroundPulse {
  0% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00ff88;
  border-radius: 50%;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 0 10px #00ff88;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

.content-wrapper {
  text-align: center;
  z-index: 10;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-wrapper.fade-out {
  opacity: 0;
  transform: scale(0.9) translateY(-30px);
}

.logo-container {
  position: relative;
  margin-bottom: 3rem;
  transform: translateY(50px);
  opacity: 0;
  transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.logo-container.animate-logo {
  transform: translateY(0);
  opacity: 1;
}

.logo {
  width: 430px;
  height: 120px;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 25px rgba(0, 255, 136, 0.6));
  animation: logoFloat 4s ease-in-out infinite;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.app-name {
  margin-bottom: 3rem;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s ease-out 0.3s;
}

.app-name.animate-text {
  transform: translateY(0);
  opacity: 1;
}

.main-title {
  font-size: 4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00ff88 0%, #ffffff 50%, #00ff88 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textShimmer 3s ease-in-out infinite;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
}

@keyframes textShimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.letter {
  display: inline-block;
  animation: letterBounce 1s ease-out both;
}

@keyframes letterBounce {
  0% { transform: translateY(30px); opacity: 0; }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); opacity: 1; }
}

.subtitle-container {
  position: relative;
}

.subtitle {
  font-size: 1.4rem;
  color: #00ff88;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.subtitle-line {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  margin: 0 auto;
  animation: lineExpand 1s ease-out 1s both;
}

@keyframes lineExpand {
  0% { width: 0; }
  100% { width: 100px; }
}

.loading-section {
  margin-top: 4rem;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.6s ease-out;
}

.loading-section.animate-loading {
  transform: translateY(0);
  opacity: 1;
}

.loading-bar {
  width: 300px;
  height: 4px;
  background: rgba(0, 255, 136, 0.2);
  border-radius: 2px;
  margin: 0 auto 1rem;
  overflow: hidden;
  position: relative;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #ffffff, #00ff88);
  background-size: 200% 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
  animation: progressShine 1.5s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

@keyframes progressShine {
  0%, 100% { background-position: -200% 0; }
  50% { background-position: 200% 0; }
}

.loading-text {
  color: #00ff88;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1px;
  animation: textPulse 2s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.deco-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
  animation: lineMove 8s linear infinite;
}

.line-1 {
  top: 20%;
  left: -100%;
  width: 200px;
  height: 1px;
  animation-delay: 0s;
}

.line-2 {
  top: 60%;
  right: -100%;
  width: 150px;
  height: 1px;
  animation-delay: 2s;
  animation-direction: reverse;
}

.line-3 {
  top: 80%;
  left: -100%;
  width: 100px;
  height: 1px;
  animation-delay: 4s;
}

@keyframes lineMove {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(100vw + 200px)); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .logo {
    width: 120px;
    height: 120px;
  }
  
  .loading-bar {
    width: 250px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 2rem;
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .loading-bar {
    width: 200px;
  }
}
</style>