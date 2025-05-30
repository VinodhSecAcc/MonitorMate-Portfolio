<template>
  <div class="auth-container">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Brand Section (Left for Sign In, Right for Sign Up) -->
      <div class="brand-section" :class="{ 'slide-right': isSignUp }">
        <div class="brand-content">
          <div class="logo-container">
            <img src="@/assets/app_logo2.png" alt="MonitorMate Logo" class="logo-image" />
          </div>
          <h1 class="brand-title">MonitorMate</h1>
          <p class="brand-subtitle">Empowering Education Through Technology</p>
          
          <div class="feature-list">
            <div 
              class="feature-item" 
              v-for="(line, index) in displayLines" 
              :key="index"
              :style="{ animationDelay: `${index * 1}s` }"
            >
              <div class="feature-icon">✓</div>
              <span>{{ line }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Section (Right for Sign In, Left for Sign Up) -->
      <div class="form-section" :class="{ 'slide-left': isSignUp }">
        <!-- Sign In Form -->
        <div v-if="!isSignUp" class="form-container fade-in">
          <div class="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <form class="auth-form" @submit.prevent="signInViewModel.handleSignIn">
            <div class="input-wrapper">
              <div class="input-group">
                <i class="icon fas fa-envelope"></i>
                <input 
                  v-model="signInViewModel.email.value" 
                  type="email" 
                  placeholder="Email address"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="input-wrapper">
              <div class="input-group">
                <i class="icon fas fa-lock"></i>
                <input 
                  :type="signInViewModel.showPassword.value ? 'text' : 'password'" 
                  v-model="signInViewModel.password.value" 
                  placeholder="Password"
                  class="form-input"
                  required
                />
                <i 
                  :class="signInViewModel.showPassword.value ? 'fas fa-eye' : 'fas fa-eye-slash'" 
                  class="toggle-password" 
                  @click="signInViewModel.togglePassword" 
                ></i>
              </div>
            </div>

            <div class="form-options">
              <a href="#" @click.prevent="openForgetPasswordPopup" class="forgot-link">Forgot your password?</a>
            </div>

            <button 
              type="submit" 
              :disabled="signInViewModel.loading.value" 
              class="auth-btn"
            >
              <span v-if="signInViewModel.loading.value" class="loading-spinner"></span>
              {{ signInViewModel.loading.value ? "Signing in..." : "Sign In" }}
            </button>

            <div v-if="signInViewModel.errorMessage.value" class="error-message">
              {{ signInViewModel.errorMessage.value }}
            </div>

            <div class="auth-prompt">
              <span>Don't have an account?</span>
              <button type="button" @click="switchToSignUp" class="switch-link">Create one now</button>
            </div>
          </form>
        </div>

        <!-- Sign Up Form -->
        <div v-else class="form-container fade-in">
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Join MonitorMate today</p>
          </div>

          <form class="auth-form" @submit.prevent="signUpViewModel.handleSignUp">
            <div class="input-wrapper">
              <div class="input-group">
                <i class="icon fas fa-envelope"></i>
                <input 
                  v-model="signUpViewModel.email.value" 
                  type="email" 
                  placeholder="Email address"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="input-wrapper">
              <div class="input-group">
                <i class="icon fas fa-user"></i>
                <input 
                  v-model="signUpViewModel.username.value" 
                  type="text" 
                  placeholder="Username"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="input-wrapper">
              <div class="input-group">
                <i class="icon fas fa-lock"></i>
                <input 
                  :type="signUpViewModel.showPassword.value ? 'text' : 'password'" 
                  v-model="signUpViewModel.password.value" 
                  placeholder="Password"
                  class="form-input"
                  required
                />
                <i 
                  :class="signUpViewModel.showPassword.value ? 'fas fa-eye' : 'fas fa-eye-slash'" 
                  class="toggle-password" 
                  @click="signUpViewModel.togglePassword" 
                ></i>
              </div>
            </div>

            <div class="input-wrapper">
              <div class="input-group">
                <i class="icon fas fa-lock"></i>
                <input 
                  :type="signUpViewModel.showConfirmPassword.value ? 'text' : 'password'" 
                  v-model="signUpViewModel.confirmPassword.value" 
                  placeholder="Confirm Password"
                  class="form-input"
                  required
                />
                <i 
                  :class="signUpViewModel.showConfirmPassword.value ? 'fas fa-eye' : 'fas fa-eye-slash'" 
                  class="toggle-password" 
                  @click="signUpViewModel.toggleConfirmPassword" 
                ></i>
              </div>
            </div>

            <!-- In your template, change this button section: -->
<button 
  type="submit" 
  :disabled="signUpViewModel.loading.value" 
  class="auth-btn"
>
  <span v-if="signUpViewModel.loading.value" class="loading-spinner"></span>
  {{ signUpViewModel.loading.value ? "Creating account..." : "Create Account" }}
</button>

<div v-if="signUpViewModel.errorMessage.value" class="error-message">
  {{ signUpViewModel.errorMessage.value }}
</div>

            <div class="auth-prompt">
              <span>Already have an account?</span>
              <button type="button" @click="switchToSignIn" class="switch-link">Sign in here</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edition Label -->
    <div class="edition-label">Lecturer & Staff Edition</div>
  </div>
  <!-- Add this right before the closing </div> of auth-container -->
<!-- Forget Password Popup -->
<div v-if="showForgetPasswordPopup" class="forget-password-overlay" @click="closeForgetPasswordPopup">
  <div class="forget-password-container" @click.stop>
    <div class="forget-password-header">
      <h3>Reset Password</h3>
      <button class="close-btn" @click="closeForgetPasswordPopup">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="forget-password-content">
      <p class="forget-password-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form @submit.prevent="handleForgetPassword" class="forget-password-form">
        <div class="input-group">
          <i class="icon fas fa-envelope"></i>
          <input 
            v-model="forgetPasswordEmail"
            type="email" 
            placeholder="Enter your email address"
            class="form-input"
            required
            :disabled="forgetPasswordState.isLoading"
          />
        </div>
        
        <button 
          type="submit" 
          :disabled="forgetPasswordState.isLoading || !forgetPasswordEmail.trim()"
          class="reset-btn"
        >
          <span v-if="forgetPasswordState.isLoading" class="loading-spinner"></span>
          {{ forgetPasswordState.isLoading ? "Sending..." : "Send Reset Link" }}
        </button>
      </form>
      
      <!-- Success Message -->
      <div v-if="forgetPasswordState.successMessage" class="success-message">
        <i class="fas fa-check-circle"></i>
        {{ forgetPasswordState.successMessage }}
      </div>
      
      <!-- Error Message -->
      <div v-if="forgetPasswordState.errorMessage" class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        {{ forgetPasswordState.errorMessage }}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useHead } from '@vueuse/head'
import { SignupViewModel } from '@/viewmodel/signup_viewmodel'
import { useSignInViewModel } from '@/viewmodel/signin_viewmodel'
import { ForgetPasswordViewModel } from '@/viewmodel/forgetpassword_viewmodel'

export default {
  name: 'AuthComponent',
  setup() {
    // State management for form switching
    const isSignUp = ref(false)
    
    // Initialize ViewModels
    const signUpViewModel = SignupViewModel(() => switchToSignIn()) // Pass callback
    const signInViewModel = useSignInViewModel()
    
    // Reset loading states to ensure they start as false
    signUpViewModel.loading.value = false
    signInViewModel.loading.value = false
    
    // Computed property for display lines (uses typing effect from signInViewModel)
    const displayLines = computed(() => {
      return signInViewModel.typedLines.value.length > 0 
        ? signInViewModel.typedLines.value 
        : [
            "MonitorMate is an advanced attendance and smartphone activity monitoring system.",
            "Designed to improve efficiency and security in educational and professional environments.",
            "Generate attendance QR codes for seamless check-ins.",
            "Track all students' attendance in real-time.",
            "Monitor students' smartphone activity usage during class and exam time.",
            "Send warning notifications to students for policy violations.",
            "Generate detailed reports for analysis and record-keeping.",
          ]
    })
    
    // Dynamic head configuration
    const headConfig = computed(() => {
      if (isSignUp.value) {
        return {
          title: 'Sign Up - MonitorMate',
          meta: [
            { 
              name: 'description', 
              content: 'Create your MonitorMate account and start empowering education through advanced attendance monitoring and smartphone activity tracking.' 
            },
            {
              name: 'keywords',
              content: 'MonitorMate, sign up, registration, attendance monitoring, education technology'
            }
          ]
        }
      } else {
        return {
          title: 'Sign In - MonitorMate',
          meta: [
            { 
              name: 'description', 
              content: 'Sign in to your MonitorMate account to access advanced attendance monitoring, QR code generation, and comprehensive analytics.' 
            },
            {
              name: 'keywords',
              content: 'MonitorMate, sign in, login, attendance monitoring, education technology'
            }
          ]
        }
      }
    })
    
    // Use the reactive head configuration
    useHead(headConfig)
    
    // Form switching methods
    const switchToSignUp = () => {
      // Clear error messages from both viewmodels
      signInViewModel.errorMessage.value = ''
      signUpViewModel.errorMessage.value = ''
      
      // Reset loading states
      signUpViewModel.loading.value = false
      signInViewModel.loading.value = false
      
      const currentForm = document.querySelector('.form-container')
      
      if (currentForm) {
        currentForm.style.animation = 'slideOutToLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
      }
      
      setTimeout(() => {
        isSignUp.value = true
      }, 0)
    }
    
    const switchToSignIn = () => {
      // Clear error messages from both viewmodels
      signInViewModel.errorMessage.value = ''
      signUpViewModel.errorMessage.value = ''
      
      // Reset loading states
      signUpViewModel.loading.value = false
      signInViewModel.loading.value = false
      
      const currentForm = document.querySelector('.form-container')
      
      if (currentForm) {
        currentForm.style.animation = 'slideOutToRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
      }
      
      setTimeout(() => {
        isSignUp.value = false
      }, 0)
    }

    // Forget Password functionality
    const showForgetPasswordPopup = ref(false)
    const forgetPasswordEmail = ref('')
    const forgetPasswordViewModel = new ForgetPasswordViewModel()

    // Add reactive state tracking for the ViewModel
    const forgetPasswordState = reactive({
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    })

    // Add observer for ViewModel updates
    forgetPasswordViewModel.addObserver({
      update: () => {
        forgetPasswordState.isLoading = forgetPasswordViewModel.getIsLoading()
        forgetPasswordState.errorMessage = forgetPasswordViewModel.getErrorMessage()
        forgetPasswordState.successMessage = forgetPasswordViewModel.getSuccessMessage()
      }
    })

    // Updated Forget Password Methods
    const openForgetPasswordPopup = () => {
      showForgetPasswordPopup.value = true
      forgetPasswordEmail.value = ''
      forgetPasswordViewModel.resetForm()
      document.body.style.overflow = 'hidden'
    }

    const closeForgetPasswordPopup = () => {
      showForgetPasswordPopup.value = false
      forgetPasswordEmail.value = ''
      forgetPasswordViewModel.resetForm()
      document.body.style.overflow = 'auto'
    }

    const debugForgetPassword = () => {
      console.log('🔍 Debug Info:')
      console.log('Email:', forgetPasswordEmail.value)
      console.log('ViewModel state:', forgetPasswordViewModel.getState())
      console.log('Component state:', forgetPasswordState)
      // Removed the undefined 'auth' reference
    }

    const handleForgetPassword = async () => {
      debugForgetPassword() // Add this line
      console.log('🔄 handleForgetPassword called with email:', forgetPasswordEmail.value)
      
      if (!forgetPasswordEmail.value.trim()) {
        console.log('❌ No email provided')
        return
      }
      
      try {
        const result = await forgetPasswordViewModel.sendPasswordReset(forgetPasswordEmail.value)
        console.log('📧 Password reset result:', result)
        
        if (result.success) {
          // Close popup after 3 seconds to show success message
          setTimeout(() => {
            closeForgetPasswordPopup()
          }, 5000)
        }
      } catch (error) {
        console.error('❌ Error in handleForgetPassword:', error)
      }
    }
    
    return {
      isSignUp,
      signUpViewModel,
      signInViewModel,
      displayLines,
      switchToSignUp,
      switchToSignIn,
      showForgetPasswordPopup,
      forgetPasswordEmail,
      forgetPasswordState,
      forgetPasswordViewModel,
      openForgetPasswordPopup,
      closeForgetPasswordPopup,
      handleForgetPassword
    }
  }
}
</script>

<style scoped>
/* Import Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

/* Reset and Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%);
}

/* Background Pattern */
.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(46, 204, 113, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  z-index: 1;
}

/* Main Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 2;
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
}

/* Brand Section */
.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: white;
  height: 100vh;
  overflow: hidden;
  transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  order: 1;
  transform: translateX(0);
}

.brand-section.slide-right {
  order: 2;
  transform: translateX(100vw);
  animation: slideInFromLeft 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.brand-content {
  max-width: 450px;
  text-align: center;
  width: 100%;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo-image {
  width: 430px;
  height: 120px;
  object-fit: cover;
  border-radius: 15px;
  filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.4)) 
          drop-shadow(0 0 20px rgba(46, 204, 113, 0.2));
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #2ecc71, #27ae60, #1dd1a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  color: #a0a0a0;
}

.feature-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  color: #e0e0e0;
  width: 100%;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

/* Fade-in animation */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 0.8rem;
  color: #1a1a1a;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
  flex-shrink: 0;
}

/* Form Section */
.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  height: 100vh;
  overflow: hidden;
  transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  order: 2;
  transform: translateX(0);
}

.form-section.slide-left {
  order: 1;
  transform: translateX(-100vw);
  animation: slideInFromRight 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.form-container {
  width: 100%;
  max-width: 480px;
  background: rgba(40, 40, 40, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(46, 204, 113, 0.2);
  transform-origin: center;
}

.fade-in {
  animation: fadeInScale 0.8s ease-out;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Sliding Animations */
@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100vw);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromRight {
  0% {
    transform: translateX(100vw);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Additional transition states */
.brand-section:not(.slide-right) {
  animation: slideInFromRight 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.form-section:not(.slide-left) {
  animation: slideInFromLeft 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Form sliding out animations */
@keyframes slideOutToLeft {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50px) scale(0.95);
  }
}

@keyframes slideOutToRight {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(50px) scale(0.95);
  }
}

/* Enhanced form container animations */
.form-container {
  width: 100%;
  max-width: 480px;
  background: rgba(40, 40, 40, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(46, 204, 113, 0.2);
  transform-origin: center;
}

/* Staggered input animations */
.input-wrapper:nth-child(1) { animation-delay: 0.1s; }
.input-wrapper:nth-child(2) { animation-delay: 0.2s; }
.input-wrapper:nth-child(3) { animation-delay: 0.3s; }
.input-wrapper:nth-child(4) { animation-delay: 0.4s; }

.input-wrapper {
  margin-bottom: 1.8rem;
  opacity: 0;
  animation: slideInInput 0.6s ease-out forwards;
}

@keyframes slideInInput {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #a0a0a0;
  font-size: 1.1rem;
}

.auth-form {
  width: 100%;
}

.input-wrapper {
  margin-bottom: 1.8rem;
  opacity: 0;
  animation: slideInInput 0.6s ease-out forwards;
}

/* Replace your existing .icon and .input-group styles with these: */

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border: 2px solid #404040;
  border-radius: 12px;
  transition: all 0.3s ease;
  width: 100%;
  height: 56px; /* Fixed height to ensure consistent positioning */
}

.input-group:focus-within {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
  transform: translateY(-2px);
}

.icon {
  position: absolute;
  left: 1.2rem;
  top: 50%; /* Center vertically */
  transform: translateY(-50%); /* Perfect vertical centering */
  color: #2ecc71;
  z-index: 3;
  font-size: 1rem;
  pointer-events: none; /* Prevent icon from blocking input clicks */
}

.form-input {
  width: 100%;
  height: 100%; /* Fill the container height */
  padding: 0 1.2rem 0 3.5rem; /* Remove top/bottom padding, use container height */
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.1rem;
  color: #e0e0e0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center; /* Center text vertically */
}

.form-input::placeholder {
  color: #808080;
  font-size: 1rem;
}

.toggle-password {
  position: absolute;
  right: 1.2rem;
  top: 50%; /* Center vertically */
  transform: translateY(-50%); /* Perfect vertical centering */
  color: #2ecc71;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
  font-size: 1rem;
}

.toggle-password:hover {
  color: #27ae60;
  transform: translateY(-50%) scale(1.1); /* Maintain vertical centering while scaling */
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .input-group {
    height: 52px; /* Slightly smaller on mobile */
  }
  
  .form-input {
    font-size: 1rem;
    padding: 0 1rem 0 3rem;
  }
  
  .icon {
    left: 1rem;
    font-size: 0.9rem;
  }
  
  .toggle-password {
    right: 1rem;
    font-size: 0.9rem;
  }
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2.5rem;
}

.forgot-link {
  color: #2ecc71;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #27ae60;
  text-decoration: underline;
}

.auth-btn {
  width: 100%;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: #1a1a1a;
  border: none;
  padding: 1.2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(46, 204, 113, 0.4);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(26, 26, 26, 0.3);
  border-top: 2px solid #1a1a1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #3d1a1a;
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 1.5rem;
  border: 1px solid #5a2828;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
}

.auth-prompt {
  text-align: center;
  margin-top: 2.5rem;
  color: #a0a0a0;
  font-size: 1rem;
}

.switch-link {
  background: none;
  border: none;
  color: #2ecc71;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}

.switch-link:hover {
  color: #27ae60;
  text-decoration: underline;
  transform: scale(1.05);
}

/* Edition Label */
.edition-label {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .brand-section {
    padding: 1rem;
    height: auto;
    min-height: 40vh;
    order: 1 !important;
  }
  
  .form-section {
    padding: 1rem;
    height: auto;
    min-height: 60vh;
    order: 2 !important;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .form-container {
    max-width: 420px;
  }
}

@media (max-width: 768px) {
  .auth-container {
    height: 100vh;
    overflow-y: auto;
  }
  
  .content-wrapper {
    min-height: 100vh;
    height: auto;
  }
  
  .form-container {
    padding: 2rem;
    margin: 1rem;
    max-width: 400px;
  }
  
  .brand-content {
    max-width: 100%;
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .logo-image {
    width: 300px;
    height: 90px;
  }
  
  .edition-label {
    bottom: 15px;
    right: 15px;
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .brand-section {
    padding: 0.5rem;
  }
  
  .form-section {
    padding: 0.5rem;
  }
  
  .form-container {
    padding: 1.5rem;
    margin: 0.5rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .form-header h2 {
    font-size: 1.8rem;
  }
  
  .form-input {
    font-size: 1rem;
    padding: 1rem 1rem 1rem 3rem;
  }
  
  .logo-image {
    width: 250px;
    height: 70px;
  }
}
.form-container.fade-in {
  animation: fadeInScale 0.6s ease-out !important;
}
/* Forget Password Popup Styles */
.forget-password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeInOverlay 0.3s ease-out;
}

@keyframes fadeInOverlay {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.forget-password-container {
  background: rgba(40, 40, 40, 0.98);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 450px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  animation: slideInUp 0.4s ease-out;
  position: relative;
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.forget-password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(46, 204, 113, 0.2);
}

.forget-password-header h3 {
  color: #e0e0e0;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #2ecc71;
  transform: scale(1.1);
}

.forget-password-content {
  text-align: center;
}

.forget-password-description {
  color: #a0a0a0;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.forget-password-form {
  margin-bottom: 1.5rem;
}

.forget-password-form .input-group {
  margin-bottom: 1.5rem;
}

.reset-btn {
  width: 100%;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: #1a1a1a;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 204, 113, 0.4);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  border: 1px solid rgba(46, 204, 113, 0.3);
  animation: fadeInSuccess 0.5s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-message i {
  font-size: 1.1rem;
}

@keyframes fadeInSuccess {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.forget-password-container .error-message {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 107, 107, 0.3);
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forget-password-container .error-message i {
  font-size: 1.1rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .forget-password-container {
    padding: 1.5rem;
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .forget-password-header h3 {
    font-size: 1.3rem;
  }
  
  .forget-password-description {
    font-size: 0.9rem;
  }
}
</style>