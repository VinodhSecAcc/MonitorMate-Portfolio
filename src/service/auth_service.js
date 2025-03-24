import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
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
  }
};
