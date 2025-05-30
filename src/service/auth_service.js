import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "./configuration/firebase";
import { FirebaseService } from "./firebase_service";
import { ref, update, getDatabase } from "firebase/database";

const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

export const AuthService = {
  async signInUser(email, password) {
    try {
      console.log("🔑 Attempting to sign in user:", email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      let user = userCredential.user;

      if (!user) {
        return "Sign-in failed. Please try again.";
      }

      await user.reload();
      user = auth.currentUser; // Get updated user data

      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth);
        return "Your email is not verified. Please check your email inbox.";
      }

      // ✅ Call moveUserToVerified from Firebase service
      await FirebaseService.moveUserToVerified(user.uid);

      // ✅ Update the `is_verified` status in Realtime Database
      const userRef = ref(db, `users/lecturers/${user.uid}/auth_info`);
      await update(userRef, { is_verified: true });

      return null; // Success
    } catch (error) {
      console.error("⚠️ Unexpected error:", error.message);

      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("invalid") || errorMessage.includes("wrong password") || errorMessage.includes("no user record")) {
        return "Invalid email or password. Please try again.";
      }

      return "An unexpected error occurred. Please try again.";
    }
  },

  async signUpUser(email, username, password, lecturerId) {
    try {
      // Check if email is already registered
      const registeredEmails = await FirebaseService.getAllRegisteredEmails();
      if (registeredEmails.includes(email)) {
        throw new Error("This email is already registered. Please log in or use a different email.");
      }

      // Validate password
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
        throw new Error("Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.");
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      // Save user data in pending_users
      const userData = {
        lecturer_id: lecturerId,
        email,
        username,
        is_verified: false,
        created_at: new Date().toISOString()
      };

      await FirebaseService.savePendingUserData(user.uid, userData);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async forgetPassword(email) {
  try {
    console.log("🔄 Attempting to send password reset email to:", email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    // Send password reset email (remove the email existence check as it's not reliable)
    await sendPasswordResetEmail(auth, email);

    console.log("✅ Password reset email sent successfully");
    return { 
      success: true, 
      message: "If an account with this email exists, you will receive a password reset link shortly." 
    };

  } catch (error) {
    console.error("⚠️ Error sending password reset email:", error);

    // Handle specific Firebase Auth errors
    const errorCode = error.code;
    let errorMessage = "An unexpected error occurred. Please try again.";

    switch (errorCode) {
      case 'auth/user-not-found':
        // Don't reveal if user exists or not for security
        errorMessage = "If an account with this email exists, you will receive a password reset link shortly.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Please enter a valid email address.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Too many requests. Please try again later.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Network error. Please check your connection and try again.";
        break;
      default:
        errorMessage = error.message;
    }

    return { 
      success: false, 
      error: errorMessage 
    };
  }
},

  async logoutUser() {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log("No user is currently signed in");
        return { success: false, error: "No user is currently signed in" };
      }

      const userId = currentUser.uid;
      const userEmail = currentUser.email;
      console.log("🚪 Logging out user:", userId, "Email:", userEmail);

      // Update user's online status or last seen in database (optional)
      try {
        const userRef = ref(db, `users/lecturers/${userId}/auth_info`);
        await update(userRef, { 
          last_logout: new Date().toISOString(),
          is_online: false 
        });
      } catch (dbError) {
        console.warn("Could not update user status in database:", dbError.message);
        // Continue with logout even if database update fails
      }

      // Sign out from Firebase Auth
      await signOut(auth);
      
      console.log("✅ User successfully logged out");
      return { 
        success: true, 
        userId: userId,
        userEmail: userEmail 
      };

    } catch (error) {
      console.error("⚠️ Error during logout:", error.message);
      return { success: false, error: error.message };
    }
  },

  // Alternative logout method with callback for custom navigation
  async logoutUserWithCallback(onLogoutSuccess) {
    const result = await this.logoutUser();
    
    if (result.success && onLogoutSuccess) {
      // Execute custom callback (like navigation)
      onLogoutSuccess(result);
    }
    
    return result;
  },

  // Get current user information
  getCurrentUser() {
    return auth.currentUser;
  },

  // Check if user is authenticated
  isUserAuthenticated() {
    return auth.currentUser !== null;
  }
};