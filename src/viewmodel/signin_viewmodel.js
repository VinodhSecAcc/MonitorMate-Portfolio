import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { AuthService } from "@/service/auth_service";

export function useSignInViewModel() {
  const email = ref("");
  const password = ref("");
  const errorMessage = ref("");
  const loading = ref(false);
  const showPassword = ref(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.value || !password.value) {
      errorMessage.value = "Please enter both email and password.";
      return;
    }

    loading.value = true;
    errorMessage.value = "";

    const result = await AuthService.signInUser(email.value, password.value);

    if (result) {
      errorMessage.value = result;
    } else {
      router.push("/dashboard"); // Redirect on success
    }

    loading.value = false;
  };

  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };

  // Typing effect for "About MonitorMate"
  const fullText = [
    "MonitorMate is an advanced attendance and smartphone activity monitoring system.",
    "Designed to improve efficiency and security in educational and professional environments.",
    "Generate attendance QR codes for seamless check-ins.",
    "Track all students' attendance in real-time.",
    "Monitor students' smartphone activity usage during class and exam time.",
    "Send warning notifications to students for policy violations.",
    "Generate detailed reports for analysis and record-keeping.",
  ];

  const typedLines = ref([]);
  const typingSpeed = 40;

  function typeText(index = 0, charIndex = 0) {
    if (index < fullText.length) {
      if (charIndex < fullText[index].length) {
        if (!typedLines.value[index]) typedLines.value[index] = "";
        typedLines.value[index] += fullText[index][charIndex];

        setTimeout(() => typeText(index, charIndex + 1), typingSpeed);
      } else {
        setTimeout(() => typeText(index + 1, 0), 500);
      }
    }
  }

  onMounted(() => {
    typeText();
  });

  return {
    email,
    password,
    errorMessage,
    loading,
    showPassword,
    handleSignIn,
    togglePassword,
    typedLines,
  };
}
