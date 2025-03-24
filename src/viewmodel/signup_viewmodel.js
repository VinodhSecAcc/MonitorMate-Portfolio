import { ref } from "vue";
import { AuthService } from "@/service/auth_service";
import { useRouter } from "vue-router";

export function SignupViewModel() {
  // Reactive Variables
  const email = ref("");
  const username = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const errorMessage = ref("");

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

  // Function to generate Lecturer ID
  const generateLecturerId = (email) => {
    const prefix = email.split("@")[0]; // Extracts "asdf" from "asdf@gmail.com"
    const timestamp = Date.now(); // Current time in milliseconds
    return `${prefix}_LEC${timestamp}`;
  };

  // Handle Sign-Up
  const handleSignUp = async () => {
    if (!email.value || !username.value || !password.value || !confirmPassword.value) {
      errorMessage.value = "All fields are required!";
      return;
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match!";
      return;
    }

    const lecturerId = generateLecturerId(email.value);

    const result = await AuthService.signUpUser(
      email.value,
      username.value,
      password.value,
      lecturerId
    );

    if (result.success) {
      console.log("Lecturer registered successfully:", result.user);
      errorMessage.value = "";
      router.push("/signin"); // Redirect to sign-in page
    } else {
      errorMessage.value = result.error;
    }
  };

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
  };
}
