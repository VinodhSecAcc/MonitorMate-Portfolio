// signup_viewmodel.js
import { ref } from "vue";
import { AuthService } from "@/service/auth_service";
import { useRouter } from "vue-router";

export function SignupViewModel(switchToSignInCallback = null) {
  // Reactive Variables - Initialize loading as ref(false) immediately
  const email = ref("");
  const username = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const errorMessage = ref("");
  const loading = ref(false); // This should be initialized as ref(false)
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const router = useRouter();

  // Toggle Password Visibility
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };
  
  const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
  };

  // Password Validation Function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`at least ${minLength} characters`);
    }
    if (!hasUpperCase) {
      errors.push("one uppercase letter");
    }
    if (!hasLowerCase) {
      errors.push("one lowercase letter");
    }
    if (!hasNumbers) {
      errors.push("one number");
    }
    if (!hasSpecialChar) {
      errors.push("one special character (!@#$%^&*(),.?\":{}|<>)");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Function to generate Lecturer ID
  const generateLecturerId = (email) => {
    const prefix = email.split("@")[0]; // Extracts "asdf" from "asdf@gmail.com"
    const timestamp = Date.now(); // Current time in milliseconds
    return `${prefix}_LEC${timestamp}`;
  };

  // Handle Sign-Up
  const handleSignUp = async () => {
    // Clear previous error message
    errorMessage.value = "";

    // Check if all fields are filled
    if (!email.value || !username.value || !password.value || !confirmPassword.value) {
      errorMessage.value = "All fields are required!";
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password.value);
    if (!passwordValidation.isValid) {
      errorMessage.value = `Password must contain: ${passwordValidation.errors.join(", ")}`;
      return;
    }

    // Check if passwords match
    if (password.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match!";
      return;
    }

    const lecturerId = generateLecturerId(email.value);

    // Set loading to true ONLY when form is actually submitted
    loading.value = true;

    try {
      const result = await AuthService.signUpUser(
        email.value,
        username.value,
        password.value,
        lecturerId
      );

      if (result.success) {
        console.log("Lecturer registered successfully:", result.user);
        errorMessage.value = "";
        
        // Keep loading state for 2 seconds before switching to sign in
        setTimeout(() => {
          loading.value = false;
          
          // Clear form fields after successful registration
          email.value = "";
          username.value = "";
          password.value = "";
          confirmPassword.value = "";
          
          // Use callback to switch to sign in form if provided, otherwise use router
          if (switchToSignInCallback) {
            switchToSignInCallback();
          } else {
            router.push("/signin");
          }
        }, 2000);
        
      } else {
        loading.value = false;
        errorMessage.value = result.error;
      }
    } catch (error) {
      loading.value = false;
      errorMessage.value = "An error occurred during registration. Please try again.";
      console.error("Signup error:", error);
    }
  };

  return {
    email,
    username,
    password,
    confirmPassword,
    errorMessage,
    loading, // Make sure loading is returned here
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword,
    handleSignUp,
    validatePassword, // Export for potential use in component for real-time validation
  };
}