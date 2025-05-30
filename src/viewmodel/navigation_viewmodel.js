import { ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";
import { FirebaseService } from "@/service/firebase_service";
import { AuthService } from "@/service/auth_service";

export function NavigationViewModel() {
  const userProfilePic = ref("https://via.placeholder.com/80"); // Default image
  const isLoggedIn = ref(false);
  const currentUser = ref(null);
  const auth = getAuth();
  const router = useRouter(); // Vue Router instance

  const fetchUserProfileImage = async (userId) => {
    try {
      if (userId) {
        const imageUrl = await FirebaseService.getUserProfileImage(userId);
        if (imageUrl) {
          userProfilePic.value = imageUrl;
        }
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await AuthService.logoutUser();
      
      if (result.success) {
        console.log("User logged out successfully:", result.userId);
        
        // Reset profile picture to default
        userProfilePic.value = "https://via.placeholder.com/80";
        isLoggedIn.value = false;
        currentUser.value = null;
        
        // Navigate to sign-in page
        await router.push('/signin');
        
        return { success: true };
      } else {
        console.error("Logout failed:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error during logout:", error);
      return { success: false, error: error.message };
    }
  };

  // Listen for user authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log("User authenticated:", user.uid);
      currentUser.value = user;
      isLoggedIn.value = true;
      fetchUserProfileImage(user.uid);
    } else {
      // User is signed out
      console.log("User signed out");
      currentUser.value = null;
      isLoggedIn.value = false;
      userProfilePic.value = "https://via.placeholder.com/80";
    }
  });

  return { 
    userProfilePic, 
    isLoggedIn, 
    currentUser,
    handleLogout 
  };
}