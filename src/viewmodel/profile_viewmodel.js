import { FirebaseService } from "@/service/firebase_service";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { reactive } from "vue";
import { ProfileModel } from "@/model/profile_model";

const ProfileViewModel = reactive({
  userId: "",
  isEditing: false,
  profileImageUrl: "",
  profileImage: null,

  username: "",
  universityId: "",
  phoneNumber: "",
  selectedFaculty: "",
  selectedCourse: "",

  errors: {}, 
  originalProfileData: {}, 

  get facultyCourses() {
  const model = new ProfileModel();
  return model.getFacultyCourses();
},

// Add these watchers to your ViewModel
watch: {
  username(newValue) {
    if (newValue) {
      this.username = newValue.toUpperCase();
    }
  },
  universityId(newValue) {
    if (newValue) {
      this.universityId = newValue.toUpperCase();
    }
  }
},

  initAuth(callback) {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.userId = user.uid;
        callback(user.uid);
        await this.loadProfile();
      }
    });
  },

  async loadProfile() {
    if (!this.userId) return;

    this.username = await FirebaseService.getUsername(this.userId) || "";

    const profile = await FirebaseService.getUserProfile(this.userId);
    if (profile) {
      this.profileImageUrl = profile.profileImageUrl || "";
      this.universityId = profile.universityId || "";
      this.phoneNumber = profile.phoneNumber || "";
      this.selectedFaculty = profile.faculty || "";
      this.selectedCourse = profile.course || "";

      this.originalProfileData = { ...profile, username: this.username };
    }
  },

  toggleEditing() {
    this.isEditing = !this.isEditing;
    this.errors = {}; 

    if (!this.isEditing) {
      this.username = this.originalProfileData.username;
      this.universityId = this.originalProfileData.universityId;
      this.phoneNumber = this.originalProfileData.phoneNumber;
      this.selectedFaculty = this.originalProfileData.faculty;
      this.selectedCourse = this.originalProfileData.course;
    }
  },

  validateForm() {
  const model = new ProfileModel({
    username: this.username,
    universityId: this.universityId,
    phoneNumber: this.phoneNumber,
    faculty: this.selectedFaculty,
    course: this.selectedCourse
  });
  
  const validation = model.validate();
  this.errors = validation.errors;
  return validation.isValid;
},
  async saveProfile() {
    if (!this.userId) return;
    if (!this.validateForm()) return; 

    await FirebaseService.updateUsername(this.userId, this.username);

    const userData = {
      universityId: this.universityId,
      phoneNumber: this.phoneNumber,
      faculty: this.selectedFaculty,
      course: this.selectedCourse,
    };

    await FirebaseService.saveUserProfile(this.userId, userData, this.profileImage);
    
    this.isEditing = false;
    await this.loadProfile(); 
  },

  onFileChange(event) {
    this.profileImage = event.target.files[0];
  },

  updateFaculty(faculty) {
    this.selectedFaculty = faculty;
    this.selectedCourse = ""; 
  },

  updateCourse(course) {
    this.selectedCourse = course;
  },
});

export default ProfileViewModel;
