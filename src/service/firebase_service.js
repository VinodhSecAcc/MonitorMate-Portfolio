import { getDatabase, ref, set, get, remove, update, onValue } from "firebase/database";
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

// Attendance related Firebase operations
  async createAttendanceSession(courseCode, section, sessionID, attendanceData) {
    try {
      await set(ref(db, `attendance/${courseCode}/section_${section}/${sessionID}`), attendanceData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createLectureRecord(lecturePath, attendanceRecord) {
    try {
      await set(ref(db, lecturePath), attendanceRecord);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateLectureRecord(updates) {
    try {
      await update(ref(db), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async expireAttendanceSession(courseCode, section, sessionID) {
    try {
      await set(ref(db, `attendance/${courseCode}/section_${section}/${sessionID}/expired`), true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Real-time listener for students
  listenToStudents(courseCode, section, sessionID, callback) {
    const studentsRef = ref(db, `attendance/${courseCode}/section_${section}/${sessionID}/students`);
    return onValue(studentsRef, callback);
  },

  // Helper method to get database reference
  getDbRef(path) {
    return ref(db, path);
  },

   // Report Generation Firebase Methods
  async loadCourseCodes(userId, selectedType) {
    try {
      const userRef = ref(db, `users/lecturers/${userId}/${selectedType}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return { success: true, data: Object.keys(snapshot.val()) };
      }
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loadSections(userId, selectedType, selectedCourseCode) {
    try {
      const courseRef = ref(db, `users/lecturers/${userId}/${selectedType}/${selectedCourseCode}`);
      const snapshot = await get(courseRef);
      
      if (snapshot.exists()) {
        const sectionKeys = Object.keys(snapshot.val()).filter(key => key.startsWith('section_'));
        const sections = sectionKeys.map(key => key.replace('section_', ''));
        return { success: true, data: sections };
      }
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loadDates(userId, selectedType, selectedCourseCode, selectedSection) {
    try {
      const sectionRef = ref(db, `users/lecturers/${userId}/${selectedType}/${selectedCourseCode}/section_${selectedSection}`);
      const snapshot = await get(sectionRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loadTimes(userId, selectedType, selectedCourseCode, selectedSection) {
    try {
      const sectionRef = ref(db, `users/lecturers/${userId}/${selectedType}/${selectedCourseCode}/section_${selectedSection}`);
      const snapshot = await get(sectionRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loadAppUsageData(selectedCourseCode, selectedSection, sessionId, studentUserId) {
    try {
      const appRef = ref(db, `attendance/${selectedCourseCode}/section_${selectedSection}/${sessionId}/students/${studentUserId}/app`);
      const snapshot = await get(appRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loadTimeSlot(userId, selectedType, selectedCourseCode, selectedSection, sessionId) {
    try {
      const academicInfoRef = ref(db, `users/lecturers/${userId}/${selectedType}/${selectedCourseCode}/section_${selectedSection}/${sessionId}/academicInfo`);
      const snapshot = await get(academicInfoRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loadStudentsData(userId, selectedType, selectedCourseCode, selectedSection, selectedTime) {
    try {
      const sessionRef = ref(db, `users/lecturers/${userId}/${selectedType}/${selectedCourseCode}/section_${selectedSection}/${selectedTime}/studentsData`);
      const snapshot = await get(sessionRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

};
