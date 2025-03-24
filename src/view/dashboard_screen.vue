<template>
  <div class="dashboard">
    <navigation_bar />

    <div class="dashboard-main">
      <!-- Profile Section -->
      <div class="profile-container">
        <img :src="userProfilePic" alt="Profile" class="user-pic" />
        <div class="user-info">
          <h1 class="welcome-text">Welcome, {{ username }}</h1>
          <p class="greeting">Hope you're having a great day!</p>
        </div>
      </div>

      <!-- Image Carousel -->
      <div class="box-container">
        <div class="carousel-container">
          <transition name="fade" mode="out-in">
            <img 
              :src="images[currentImageIndex]" 
              class="carousel-image" 
              :key="currentImageIndex" 
              @click="openPopup(images[currentImageIndex])"
            />
          </transition>
        </div>

        <!-- Dots Indicator -->
        <div class="dots-container">
          <span
            v-for="(image, index) in images"
            :key="index"
            class="dot"
            :class="{ active: index === currentImageIndex }"
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
  </div>
</template>

<script>
import navigation_bar from '@/components/navigation_bar.vue';
import { DashboardViewModel } from '@/viewmodel/dashboard_viewmodel';
import { useHead } from '@vueuse/head';
import { ref, onMounted } from 'vue';

export default {
  components: {
    navigation_bar
  },
  setup() {
    useHead({
      title: 'Dashboard',
      meta: [{ name: 'description', content: 'This is a sample description' }]
    });

    const { userProfilePic, username } = DashboardViewModel();

    // Image carousel logic
    const images = [
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png'),
      require('@/assets/app_logo2.png')
    ];
    
    const currentImageIndex = ref(0);

    onMounted(() => {
      setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
      }, 3000);
    });

    // Popup logic
    const showPopup = ref(false);
    const popupImage = ref('');

    const openPopup = (image) => {
      popupImage.value = image;
      showPopup.value = true;
    };

    const closePopup = () => {
      showPopup.value = false;
    };

    return { 
      userProfilePic, 
      username, 
      images, 
      currentImageIndex, 
      showPopup, 
      popupImage, 
      openPopup, 
      closePopup 
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
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
}

/* Dashboard Layout */
.dashboard-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  gap: 40px;
}

/* Profile Container */
.profile-container {
  width: 1315px;
  height: 170px;
  background-color: #111;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: start;
  gap:35px;
  margin-top: 100px;
  transform: translateX(175px);
  border: 3px solid rgb(84, 84, 84);
}

.user-pic {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid rgb(84, 84, 84);
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  color: white;
  text-align: left;
}

.welcome-text {
  color: white;
  font-size: 32px;
  font-weight: bold;
}

.greeting {
  font-size: 20px;
  opacity: 0.8;
}

/* Box Container (for carousel) */
.box-container {
  width: 1315px;
  height: 300px;
  background-color: #111;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transform: translateX(175px);
  border: 3px solid rgb(84, 84, 84);
  align-items: center;
}

/* Carousel */
.carousel-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-image {
  width: 1300px;
  height: 500px;
  object-fit: contain;
  border-radius: 20px;
  cursor: pointer;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Dots Indicator */
.dots-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  margin: 0 6px;
  background-color: rgb(84, 84, 84);
  border-radius: 50%;
  opacity: 0.5;
  transition: opacity 0.3s, transform 0.3s;
}

.dot.active {
  opacity: 1;
  transform: scale(1.3);
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  border-radius: 12px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 50%;
}

.close-button:hover {
  background: white;
}
</style>
