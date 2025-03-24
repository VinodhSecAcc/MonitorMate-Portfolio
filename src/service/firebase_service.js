import { getDatabase, ref, set, get, remove, update } from "firebase/database";
import { firebaseApp } from "./configuration/firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


const db = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

export const FirebaseService = {
  async savePendingUserData(userId, userData) {
    try {
      await set(ref(db, `pending_users/${userId}`), userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async moveUserToVerified(userId) {
    try {
      const pendingUserRef = ref(db, `pending_users/${userId}`);
      const snapshot = await get(pendingUserRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Move to `users/lecturers` collection
        await set(ref(db, `users/lecturers/${userId}/auth_info`), userData);

        // Remove from pending_users
        await remove(pendingUserRef);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateUserData(userId, updates) {
    try {
      await update(ref(db, `users/lecturers/${userId}/auth_info`), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAllRegisteredEmails() {
    try {
      const snapshot = await get(ref(db, "users/lecturers/auth_info"));
      if (snapshot.exists()) {
        return Object.values(snapshot.val()).map(user => user.email);
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  // Save user profile details including image under 'profile' node
async  saveUserProfile(userId, userData, imageFile) {
  try {
    if (imageFile) {
      const imagePath = `profile_images/${userId}.jpg`;
      const storageReference = storageRef(storage, imagePath);

      // Upload image
      await uploadBytes(storageReference, imageFile);
      const imageUrl = await getDownloadURL(storageReference);

      // Add image URL to userData
      userData.profileImageUrl = imageUrl;
    }

    // Save user data under 'profile' node
    await update(ref(db, `users/lecturers/${userId}/profile`), userData);
  } catch (error) {
    console.error("Error saving profile:", error);
  }
},

// Fetch user profile details from 'profile' node
/*async  getUserProfile(userId) {
  try {
    const snapshot = await get((ref(db), `users/lecturers/${userId}/profile`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
  return null;
},

// Fetch username from users database
async  getUsername(userId) {
  try {
    const snapshot = await get((ref(db), `users/lecturers/${userId}/auth_info/username`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Error fetching username:", error);
  }
  return null;
},*/

// Update username in users database
async  updateUsername(userId, newUsername) {
  try {
    await update(ref(db, `users/lecturers/${userId}/auth_info`), { username: newUsername });
  } catch (error) {
    console.error("Error updating username:", error);
  }
},

// Fetch user profile details from 'profile' node
async getUserProfile(userId) {
  try {
    const snapshot = await get(ref(db, `users/lecturers/${userId}/profile`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
  return null;
},

// Fetch username from users database
async getUsername(userId) {
  try {
    const snapshot = await get(ref(db, `users/lecturers/${userId}/auth_info/username`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Error fetching username:", error);
  }
  return null;
},

// Fetch user profile image URL
async getUserProfileImage(userId) {
  try {
    const snapshot = await get(ref(db, `users/lecturers/${userId}/profile/profileImageUrl`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Error fetching profile picture:", error);
  }
  return null;
},

};
