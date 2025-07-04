// models/UserModel.js
import { FirebaseService } from "@/service/firebase_service";

export class DashboardModel {
  constructor() {
    this.profilePicUrl = null;
    this.username = null;
    this.userId = null;
  }

  async fetchUserProfileImage(userId) {
    try {
      if (!userId) return null;
      const imageUrl = await FirebaseService.getUserProfileImage(userId);
      this.profilePicUrl = imageUrl;
      return imageUrl;
    } catch (error) {
      console.error("Error fetching user profile image:", error);
      throw error;
    }
  }

  async fetchUsername(userId) {
    try {
      if (!userId) return null;
      const name = await FirebaseService.getUsername(userId);
      this.username = name;
      return name;
    } catch (error) {
      console.error("Error fetching username:", error);
      throw error;
    }
  }

  async fetchUserProfile(userId) {
    try {
      if (!userId) return { imageUrl: null, name: null };
      
      const [imageUrl, name] = await Promise.all([
        this.fetchUserProfileImage(userId),
        this.fetchUsername(userId)
      ]);

      this.userId = userId;
      return { imageUrl, name };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  getUserData() {
    return {
      userId: this.userId,
      profilePicUrl: this.profilePicUrl,
      username: this.username
    };
  }

  clearUserData() {
    this.profilePicUrl = null;
    this.username = null;
    this.userId = null;
  }
}