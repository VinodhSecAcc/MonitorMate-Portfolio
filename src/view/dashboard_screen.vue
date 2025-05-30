<template>
  <div class="dashboard">
    <navigation_bar />
    <br />
    <br />
    <br />
 <br />
    <br />
    <br />
    <div class="dashboard-main">
      <!-- Profile Section -->
      <div class="profile-container">
        <img :src="userProfilePic" alt="Profile" class="user-pic" @click="openProfilePopup" />
        <div class="user-info">
          <h1 class="welcome-text">Welcome, {{ username }}</h1>
          <p class="greeting">Hope you're having a great day!</p>
        </div>
        
        <!-- Clock Section -->
        <div class="clock-container">
          <div class="date-display">{{ currentDate }}</div>
          <div class="time-display">{{ currentTime }}</div>
          <div class="day-display">{{ currentDay }}</div>
        </div>
      </div>

      <!-- Image Carousel -->
      <div class="box-container">
        <div class="carousel-header">
          <h2>Gallery</h2>
        </div>
        <div class="carousel-container">
          <transition name="slide-fade" mode="out-in">
            <img 
              :src="images[currentImageIndex]" 
              class="carousel-image" 
              :key="currentImageIndex" 
              @click="openPopup(images[currentImageIndex])"
            />
          </transition>
          
          <!-- Navigation Arrows -->
          <button class="nav-arrow nav-arrow-left" @click="previousImage">
            <span>‹</span>
          </button>
          <button class="nav-arrow nav-arrow-right" @click="nextImage">
            <span>›</span>
          </button>
        </div>

        <!-- Dots Indicator -->
        <div class="dots-container">
          <span
            v-for="(image, index) in images"
            :key="index"
            class="dot"
            :class="{ active: index === currentImageIndex }"
            @click="goToImage(index)"
          ></span>
        </div>
      </div>
    </div>

    <!-- Image Popup -->
    <div v-if="showPopup" class="popup-overlay" @click="closePopup">
      <div class="popup-content" @click.stop>
        <button class="close-button" @click="closePopup">&times;</button>
        <img :src="popupImage" class="popup-image" />
      </div>
    </div>

    <!-- Profile Picture Popup -->
    <div v-if="showProfilePopup" class="popup-overlay" @click="closeProfilePopup">
      <div class="popup-content profile-popup-content" @click.stop>
        <button class="close-button" @click="closeProfilePopup">&times;</button>
        <img :src="userProfilePic" class="profile-popup-image" />
        <div class="profile-popup-info">
          <h2>{{ username }}</h2>
          <p>Profile Picture</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import navigation_bar from '@/components/navigation_bar.vue';
import { DashboardViewModel } from '@/viewmodel/dashboard_viewmodel';
import { useHead } from '@vueuse/head';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  components: {
    navigation_bar
  },
  setup() {
    useHead({
      title: 'Home - MonitorMate',
      meta: [{ name: 'description', content: 'This is a sample description' }]
    });

    const { userProfilePic, username } = DashboardViewModel();

    // Clock logic
    const currentTime = ref('');
    const currentDate = ref('');
    const currentDay = ref('');
    let clockInterval;

    const updateClock = () => {
      const now = new Date();
      
      // Format time (12-hour format)
      const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      };
      currentTime.value = now.toLocaleTimeString('en-US', timeOptions);
      
      // Format date
      const dateOptions = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      };
      currentDate.value = now.toLocaleDateString('en-US', dateOptions);
      
      // Format day
      const dayOptions = { weekday: 'long' };
      currentDay.value = now.toLocaleDateString('en-US', dayOptions);
    };

    // Image carousel logic
    const images = [
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png')
    ];
    
    const currentImageIndex = ref(0);
    let carouselInterval;

    const nextImage = () => {
      currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
    };

    const previousImage = () => {
      currentImageIndex.value = currentImageIndex.value === 0 
        ? images.length - 1 
        : currentImageIndex.value - 1;
    };

    const goToImage = (index) => {
      currentImageIndex.value = index;
    };

    onMounted(() => {
      // Start clock
      updateClock();
      clockInterval = setInterval(updateClock, 1000);
      
      // Start carousel
      carouselInterval = setInterval(nextImage, 4000);
    });

    onUnmounted(() => {
      if (clockInterval) clearInterval(clockInterval);
      if (carouselInterval) clearInterval(carouselInterval);
    });

    // Popup logic
    const showPopup = ref(false);
    const popupImage = ref('');
    const showProfilePopup = ref(false);

    const openPopup = (image) => {
      popupImage.value = image;
      showPopup.value = true;
    };

    const closePopup = () => {
      showPopup.value = false;
    };

    const openProfilePopup = () => {
      showProfilePopup.value = true;
    };

    const closeProfilePopup = () => {
      showProfilePopup.value = false;
    };

    return { 
      userProfilePic, 
      username, 
      images, 
      currentImageIndex, 
      showPopup, 
      popupImage, 
      openPopup, 
      closePopup,
      showProfilePopup,
      openProfilePopup,
      closeProfilePopup,
      nextImage,
      previousImage,
      goToImage,
      currentTime,
      currentDate,
      currentDay
    };
  }
};
</script>

<style scoped>
/* General Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%) !important;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%) !important;
}

.dashboard {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
}

/* Dashboard Layout */
.dashboard-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 25px;
  padding: 20px;
  justify-content: flex-start;
  padding-top: 50px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%);
}

/* Profile Container */
.profile-container {
  width: 80%;
  max-width: 900px;
  height: 150px;
  background: rgba(40, 40, 40, 0.95);
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(46, 204, 113, 0.2);
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.user-pic {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #2ecc71;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-pic:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.5);
}

.user-info {
  display: flex;
  flex-direction: column;
  color: white;
  text-align: left;
  flex: 1;
  margin-left: 30px;
}

.welcome-text {
  color: #2ecc71;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.greeting {
  font-size: 16px;
  color: #d1d5db;
  opacity: 0.9;
}

/* Clock Container */
.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(46, 204, 113, 0.1);
  padding: 20px;
  border-radius: 15px;
  border: 1px solid #2ecc71;
  min-width: 200px;
}

.time-display {
  font-size: 24px;
  font-weight: bold;
  color: #2ecc71;
  text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
  margin-bottom: 5px;
}

.date-display {
  font-size: 14px;
  color: #d1d5db;
  margin-bottom: 5px;
}

.day-display {
  font-size: 16px;
  color: #2ecc71;
  font-weight: 600;
}

/* Box Container (for carousel) */
.box-container {
  width: 80%;
  max-width: 900px;
  background: rgba(40, 40, 40, 0.95);
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(46, 204, 113, 0.2);
  position: relative;
}

.carousel-header {
  text-align: center;
  margin-bottom: 15px;
}

.carousel-header h2 {
  color: #2ecc71;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Carousel */
.carousel-container {
  width: 100%;
  height: 220px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.3);
}

.carousel-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.02);
}

/* Navigation Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(46, 204, 113, 0.8);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-arrow:hover {
  background: #2ecc71;
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow span {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.nav-arrow-left {
  left: 15px;
}

.nav-arrow-right {
  right: 15px;
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.6s ease;
}
.slide-fade-leave-active {
  transition: all 0.6s ease;
}
.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* Dots Indicator */
.dots-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: rgba(107, 114, 128, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.dot:hover {
  background-color: rgba(46, 204, 113, 0.7);
  transform: scale(1.2);
}

.dot.active {
  background-color: #2ecc71;
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
  border-color: #2ecc71;
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.popup-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.close-button {
  position: absolute;
  top: -15px;
  right: -15px;
  background: #2ecc71;
  border: none;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
}

.close-button:hover {
  background: #27ae60;
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    height: auto;
    gap: 20px;
    text-align: center;
  }
  
  .user-info {
    margin-left: 0;
    text-align: center;
  }
  
  .clock-container {
    min-width: auto;
  }
  
  .nav-arrow {
    display: none;
  }
}
</style>