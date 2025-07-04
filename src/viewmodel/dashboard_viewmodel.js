// viewmodels/DashboardViewModel.js
import { ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { DashboardModel } from "@/model/dashboard_model";


export function DashboardViewModel() {
  const userProfilePic = ref("https://via.placeholder.com/80"); // Default image
  const username = ref("");
  const auth = getAuth();
  const userModel = new DashboardModel();

  const fetchUserProfile = async (userId) => {
    try {
      if (userId) {
        const userData = await userModel.fetchUserProfile(userId);
        
        if (userData.imageUrl) {
          userProfilePic.value = userData.imageUrl;
        }
        if (userData.name) {
          username.value = userData.name;
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Listen for user authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserProfile(user.uid);
    } else {
      // Clear user data when user logs out
      userModel.clearUserData();
      userProfilePic.value = "https://via.placeholder.com/80";
      username.value = "";
    }
  });

  return { userProfilePic, username };
}