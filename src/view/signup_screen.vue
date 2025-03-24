<template>
  <div class="signup-container">
    <!-- Left Section (System Info) -->
    <div class="left-section">
      <div class="info-box">
        <img src="@/assets/app_logo2.png" alt="App Logo" class="logo" />
        <h2>About MonitorMate</h2>
        <p>{{ typedText }}</p>
      </div>
    </div>

    <!-- Right Section (Sign-Up) -->
    <div class="right-section">
      <div class="signup-box">
        <h2 class="create-text">Create an Account</h2>

        <!-- Email Field -->
        <div class="input-container">
          <font-awesome-icon icon="envelope" class="icon" />
          <input v-model="email" type="email" placeholder="Email" />
        </div>

        <!-- Username Field -->
        <div class="input-container">
          <font-awesome-icon icon="user" class="icon" />
          <input v-model="username" type="text" placeholder="Username" />
        </div>

        <!-- Password Field -->
        <div class="input-container">
          <font-awesome-icon icon="lock" class="icon" />
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" />
          <font-awesome-icon 
            :icon="showPassword ? 'eye' : 'eye-slash'" 
            class="toggle-password" 
            @click="togglePassword" 
          />
        </div>

        <!-- Confirm Password Field -->
        <div class="input-container">
          <font-awesome-icon icon="lock" class="icon" />
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" placeholder="Confirm Password" />
          <font-awesome-icon 
            :icon="showConfirmPassword ? 'eye' : 'eye-slash'" 
            class="toggle-password" 
            @click="toggleConfirmPassword" 
          />
        </div>

        <button :disabled="loading" @click="handleSignUp" class="signup-button">{{ loading ? "Signing up..." : "Sign Up" }}</button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <!-- Sign-in Link -->
        <p class="signup-text">
          Already have an account? 
          <router-link to="/signin" class="signin-link">Sign in here</router-link>
        </p>
      </div>
    </div>

    <!-- Lecturer & Staff Edition Label -->
    <div class="edition-label">Lecturer & Staff Edition</div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { SignupViewModel } from "@/viewmodel/signup_viewmodel";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default {
  components: {
    FontAwesomeIcon,
  },
  setup() {
    // Use ViewModel
    const {
      email,
      username,
      password,
      confirmPassword,
      errorMessage,
      showPassword,
      showConfirmPassword,
      togglePassword,
      toggleConfirmPassword,
      handleSignUp,
    } = SignupViewModel();

    // Typing effect for about text
    const fullText = "MonitorMate is an advanced attendance and smartphone activity monitoring system designed to improve efficiency and security in educational and professional environments.";
    const typedText = ref("");
    let index = 0;

    onMounted(() => {
      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          typedText.value += fullText[index];
          index++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);
    });

    return {
      email,
      username,
      password,
      confirmPassword,
      errorMessage,
      showPassword,
      showConfirmPassword,
      togglePassword,
      toggleConfirmPassword,
      handleSignUp,
      typedText,
    };
  },
};
</script>

  <style scoped>
  /* Reset margins and paddings */
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
  
  /* Full screen layout */
  .signup-container {
    display: flex;
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  /* Left Section (Info) */
  .left-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: lightgreen;
    height: 100vh;
    flex-direction: column;
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
    color: black;
  }
  
  .info-box h2 {
    font-size: 28px;
    color: #064c22;
    margin-bottom: 15px;
  }
  
  .info-box p {
    font-size: 20px;
    color: #064c22;
    line-height: 1.5;
    font-weight: bold;
  }
  
  /* Right Section (Sign-Up) */
  .right-section {
    flex: 1.4;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url("@/assets/book.jpg") no-repeat center center;
    background-size: cover;
    height: 100vh;
    color: black;
    position: relative;
  }

  /* create text */
  .create-text {
  color: lightgreen !important;
  font-size: 24px;
  margin-bottom: 10px;
}

  
  /* Sign-up box */
  .signup-box {
    text-align: center;
    width: 100%;
    max-width: 350px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    backdrop-filter: blur(3px);
  }

  .signup-button {
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
  
  /* Title */
  .signup-box h2 {
    color: black;
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  /* Input fields */
  .input-container {
  display: flex;
  align-items: center;
  background: rgba(154, 150, 150, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  margin: 10px 0;
  padding: 15px;
}
  
  .icon {
    color: lightgreen;
    margin-right: 10px;
  }
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    color: lightgreen;
    outline: none;
    font-size: 16px;
  }
  
  input::placeholder {
    color: lightgreen;
    font-size: 13px;
  }
  
  /* Password visibility toggle */
  .toggle-password {
    cursor: pointer;
    color: lightgreen;
  }
  
  /* Sign-up button */
  button {
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
  
  button:hover {
  background-color: #005700;
}
  
  /* Error message */
  .error-message {
    color: red;
    margin-top: 10px;
    font-size: 14px;
  }
  
  /* Sign-up Text */
  .signup-text {
    margin-top: 20px;
    font-size: 14px;
    color: rgb(255, 255, 255);
  }
  
  .signin-link {
    color: lightgreen;
    text-decoration: none;
    font-weight: bold;
  }
  
  .signin-link:hover {
    text-decoration: underline;
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
  