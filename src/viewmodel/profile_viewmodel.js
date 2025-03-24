import { FirebaseService } from "@/service/firebase_service";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { reactive } from "vue";

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

  facultyCourses: {
    "Faculty of Built Environment and Surveying": [
      "Bachelor of Urban and Regional Planning",
      "Bachelor of Quantity Surveying",
    ],
    "Faculty of Computing": [
      "Bachelor of Computer Science (Software Engineering)",
      "Bachelor of Computer Science (Data Engineering)",
    ],
    "Faculty of Engineering": [
      "Bachelor of Engineering (Civil)",
      "Bachelor of Engineering (Electrical)",
    ],
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
    this.errors = {};

    if (!this.username.trim()) this.errors.username = "Username is required.";
    if (!this.universityId.trim()) this.errors.universityId = "University ID is required.";
    if (!this.phoneNumber.trim()) this.errors.phoneNumber = "Phone number is required.";
    if (!this.selectedFaculty) this.errors.selectedFaculty = "Faculty is required.";
    if (!this.selectedCourse) this.errors.selectedCourse = "Course is required.";

    return Object.keys(this.errors).length === 0;
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
