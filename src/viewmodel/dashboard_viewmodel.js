import { ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FirebaseService } from "@/service/firebase_service";

export function DashboardViewModel() {
  const userProfilePic = ref("https://via.placeholder.com/80"); // Default image
  const username = ref("");
  const auth = getAuth();

  const fetchUserProfile = async (userId) => {
    try {
      if (userId) {
        const [imageUrl, name] = await Promise.all([
          FirebaseService.getUserProfileImage(userId),
          FirebaseService.getUsername(userId),
        ]);

        if (imageUrl) userProfilePic.value = imageUrl;
        if (name) username.value = name;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Listen for user authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserProfile(user.uid);
    }
  });

  return { userProfilePic, username };
}
