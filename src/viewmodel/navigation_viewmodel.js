import { ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FirebaseService } from "@/service/firebase_service";

export function NavigationViewModel() {
  const userProfilePic = ref("https://via.placeholder.com/80"); // Default image
  const auth = getAuth();

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

  // Listen for user authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserProfileImage(user.uid);
    }
  });

  return { userProfilePic };
}
