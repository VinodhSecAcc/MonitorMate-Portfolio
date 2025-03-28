<template>
  <div class="signin-container">
    <div class="left-section">
      <div class="signin-box">
        <h2 class="welcome-text">Welcome Back to MonitorMate</h2>

        <div class="input-group">
          <font-awesome-icon icon="envelope" class="icon" />
          <input v-model="email" type="email" placeholder="Email" />
        </div>

        <div class="input-group">
          <font-awesome-icon icon="lock" class="icon" />
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" />
          <font-awesome-icon 
            :icon="showPassword ? 'eye' : 'eye-slash'" 
            class="toggle-password" 
            @click="togglePassword" 
          />
        </div>

        <router-link to="/forgot-password" class="forgot-password">
          Forgot Password?
        </router-link>

        <button :disabled="loading" @click="handleSignIn" class="signin-button">
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <p class="signup-text">
          Don't have an account?
          <router-link to="/signup" class="signup-link">Create now</router-link>
        </p>
      </div>
    </div>

    <div class="right-section">
      <div class="info-box">
        <img src="@/assets/app_logo2.png" alt="App Logo" class="logo" />
        <h2>About MonitorMate</h2>
        <ul>
          <li v-for="(line, index) in typedLines" :key="index" class="fade-in">
            {{ line }}
          </li>
        </ul>
      </div>
    </div>

    <div class="edition-label">Lecturer & Staff Edition</div>
  </div>
</template>

<script>
import { useSignInViewModel } from "@/viewmodel/signin_viewmodel";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useHead } from "@vueuse/head";

export default {
  components: {
    FontAwesomeIcon,
  },
  setup() {
    useHead({
      title: 'Profile',
      meta: [
        { name: 'description', content: 'This is a sample description' }
      ]
    });
    return useSignInViewModel();
  },
};
</script>


<style scoped>
/* Remove unwanted margins, paddings, and force full-screen */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
}

/* Ensure container covers full screen */
.signin-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}

/* Left Section (Sign-In) - With background image */
.left-section {
  flex: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("@/assets/book.jpg") no-repeat center center;
  background-size: cover;
  height: 100vh;
}

/* Sign-in box */
.signin-box {
  text-align: center;
  width: 100%;
  max-width: 350px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05); /* Reduced blur effect */
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  backdrop-filter: blur(3px); /* Reduced blur */
}

/* Welcome text */
.welcome-text {
  color: #90ee90;
  font-size: 24px;
  margin-bottom: 10px;
}

/* Input fields with icons */
.input-group {
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(154, 150, 150, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  margin: 10px 0;
  padding: 15px;
}

.input-group i {
  color: lightgreen;
  margin-right: 10px;
}

.input-group input {
  flex: 1;
  background: transparent;
  border: none;
  color: lightgreen;
  outline: none;
}

.input-group input::placeholder {
  color: lightgreen;
  font-size: 13px;
}

/* Password toggle icon */
.password-toggle {
  cursor: pointer;
  color: white;
}

/* Forgot Password Link */
.forgot-password {
  display: block;
  text-align: right;
  color: lightgreen;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 15px;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* Sign-in button */
.signin-button {
  width: 100%;
  background-color: lightgreen;
  color: rgb(0, 0, 0);
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.signin-button:hover {
  background-color: #005700;
}

/* Error message */
.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

/* Right Section (System Info) */
.right-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: lightgreen;
  height: 100vh;
  color: black;
  flex-direction: column; /* Ensure vertical stacking */
}

/* Logo */
.logo {
  width: 400px;
  border-radius: 5px;
  margin-bottom: 15px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* Info box */
.info-box {
  max-width: 500px;
  text-align: center;
}

.info-box h2 {
  font-size: 28px;
  color: #064c22;
  margin-bottom: 15px;
}

.info-box ul {
  list-style-type: disc; /*  Standard bullet points */
  list-style-position: outside; /* Ensures bullets stay outside */
  padding-left: 20px; /* Adjust left padding for bullets */
  text-align: left; /* Aligns text properly */
}

.info-box li {
  text-indent: 0px; /* Adjust this to align second lines with the first */
  margin-left: 10px; /* Ensures text lines up correctly */
  padding-left: 0px;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
}

/* Signup Text Below Sign-in Button */
.signup-text {
  margin-top: 20px; /* Moved text down */
  font-size: 14px;
  color: white;
}

.signup-link {
  color: lightgreen;
  text-decoration: none;
  font-weight: bold;
}

.signup-link:hover {
  text-decoration: underline;
}

.icon {
    color: lightgreen;
    margin-right: 10px;
  }

  .toggle-password {
    cursor: pointer;
    color: lightgreen;
  }

/* Lecturer & Staff Edition Label */
.edition-label {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
}
</style>
