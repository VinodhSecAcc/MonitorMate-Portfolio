<template>
    <div class="nav-container">
      <span @click="navigate('dashboard')" class="nav-title">MonitorMate</span>
      <nav class="nav-bar">
        <img :src="userProfilePic" alt="Profile" class="profile-pic" />
        <div class="nav-links">
          <span @click="navigate('dashboard')">Home</span>
          <span @click="navigate('class')">Class</span>
          <span @click="navigate('exam')">Exam</span>
          <span @click="navigate('track')">Track Students</span>
          <span @click="navigate('report')">Report</span>
          <span @click="navigate('profile')">Profile</span>
        </div>
        <span class="logout-icon" @click="logout">
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" /> Logout
        </span>
      </nav>
    </div>
  </template>
  
  <script>
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { library } from "@fortawesome/fontawesome-svg-core";
  import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
  library.add(faSignOutAlt);
  import { NavigationViewModel } from "@/viewmodel/navigation_viewmodel";
  
  export default {
    components: {
      FontAwesomeIcon,
    },
    setup() {
      const { userProfilePic } = NavigationViewModel();
      return { userProfilePic };
    },
    methods: {
      navigate(page) {
        this.$router.push(`/${page}`);
      },
      logout() {
        console.log("Logging out...");
      },
    },
  };
  </script>
  
  <style scoped>
  /* Container for Title + Navigation */
  .nav-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 5%;
    width: 100%;
  }
  
  /* MonitorMate Title (fixed size) */
  .nav-title {
    font-size: 30px;
    font-weight: bold;
    color: rgb(255, 255, 255);
    text-shadow: 0px 0px 8px rgb(255, 255, 255);
    width: 300px; /* Fixed width */
    text-align: center;
    margin-right: 20px; /* Space between text and nav */
    margin-left: -8%; /* Space between text and screen edge */
  }
  
  /* Fixed Size Navigation Bar */
  .nav-bar {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 1000px; /* Fixed width */
    padding: 12px 25px;
    border-radius: 20px;
    box-shadow: 0px 4px 15px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  /* Navigation Links */
  .nav-links {
    display: flex;
    justify-content: center;
    gap: 60px;
  }
  
  span {
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
    cursor: pointer;
    transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
  }
  
  span:hover {
    color: rgb(84, 84, 84);
    text-shadow: 0px 0px 8px rgb(84, 84, 84);
  }
  
  /* Profile Picture */
  /* Profile Picture */
.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgb(84, 84, 84);
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease-in-out;
  object-fit: cover; /* Ensures the image fills the container without distortion */
  aspect-ratio: 1 / 1; /* Maintains a perfect circle */
}

  
  .profile-pic:hover {
    transform: scale(1.1);
  }
  
  /* Logout Icon */
  .logout-icon {
    color: #ff4d4d;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
  }
  
  .logout-icon:hover {
    color: red;
    text-shadow: 0px 0px 8px red;
  }
  </style>
  