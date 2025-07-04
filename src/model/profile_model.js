// models/profile_model.js

/**
 * Profile Model Class
 * Handles data structures, validation, and business logic for user profiles
 * Following MVVM architecture pattern
 */
export class ProfileModel {
  constructor(data = {}) {
    this.userId = data.userId || "";
    this.username = data.username || "";
    this.universityId = data.universityId || "";
    this.phoneNumber = data.phoneNumber || "";
    this.faculty = data.faculty || "";
    this.course = data.course || "";
    this.profileImageUrl = data.profileImageUrl || "";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Static method to create ProfileModel from Firebase data
   */
  static fromFirebaseData(userId, authData = {}, profileData = {}) {
    return new ProfileModel({
      userId,
      username: authData.username || "",
      universityId: profileData.universityId || "",
      phoneNumber: profileData.phoneNumber || "",
      faculty: profileData.faculty || "",
      course: profileData.course || "",
      profileImageUrl: profileData.profileImageUrl || "",
      createdAt: profileData.createdAt || new Date().toISOString(),
      updatedAt: profileData.updatedAt || new Date().toISOString()
    });
  }

  /**
   * Convert model to Firebase-compatible format for profile data
   */
  toFirebaseProfileData() {
    return {
      universityId: this.universityId,
      phoneNumber: this.phoneNumber,
      faculty: this.faculty,
      course: this.course,
      profileImageUrl: this.profileImageUrl,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Convert model to Firebase-compatible format for auth data
   */
  toFirebaseAuthData() {
    return {
      username: this.username,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate all profile fields
   */
  validate() {
    const errors = {};

    // Username validation
    if (!this.username || !this.username.trim()) {
      errors.username = "Username is required.";
    } else {
      // Auto-convert to uppercase
      this.username = this.username.trim().toUpperCase();
      
      if (this.username.length < 3) {
        errors.username = "Username must be at least 3 characters long.";
      } else if (this.username.length > 50) {
        errors.username = "Username must be less than 50 characters.";
      } else if (!/^[A-Z0-9_\s/]+$/.test(this.username)) {
        errors.username = "Username can only contain letters, numbers, underscores, spaces, and forward slash (/).";
      }
    }

    // University ID validation
    if (!this.universityId || !this.universityId.trim()) {
      errors.universityId = "University ID is required.";
    } else {
      // Auto-convert to uppercase
      this.universityId = this.universityId.trim().toUpperCase();
      
      if (!/^[A-Z]\d{2}[A-Z]{2}\d{4}$/.test(this.universityId)) {
        errors.universityId = "University ID must be in format: A21EC0138 (1 letter, 2 digits, 2 letters, 4 digits).";
      }
    }

    // Phone number validation
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (!/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(this.phoneNumber.trim().replace(/\s/g, ''))) {
      errors.phoneNumber = "Please enter a valid Malaysian phone number (e.g., 011-12345678 or +6011-12345678).";
    }

    // Faculty validation
    if (!this.faculty || !this.faculty.trim()) {
      errors.selectedFaculty = "Faculty selection is required.";
    } else if (!this.isValidFaculty(this.faculty)) {
      errors.selectedFaculty = "Please select a valid faculty.";
    }

    // Course validation
    if (!this.course || !this.course.trim()) {
      errors.selectedCourse = "Course selection is required.";
    } else if (!this.isValidCourse(this.faculty, this.course)) {
      errors.selectedCourse = "Please select a valid course for the selected faculty.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Business logic: Check if faculty is valid
   */
  isValidFaculty(faculty) {
    const validFaculties = [
      "Faculty of Built Environment and Surveying",
      "Faculty of Computing",
      "Faculty of Engineering",
      "Faculty of Science",
      "Faculty of Social Sciences and Humanities"
    ];
    return validFaculties.includes(faculty);
  }

  /**
   * Business logic: Check if course is valid for the given faculty
   */
  isValidCourse(faculty, course) {
    const facultyCourses = this.getFacultyCourses();
    return facultyCourses[faculty] && facultyCourses[faculty].includes(course);
  }

  /**
   * Get available courses for a faculty
   */
  getCoursesForFaculty(faculty) {
    const facultyCourses = this.getFacultyCourses();
    return facultyCourses[faculty] || [];
  }

  /**
   * Static data: Faculty and courses mapping
   */
  getFacultyCourses() {
    return {
      "Faculty of Built Environment and Surveying": [
        "Urban and Regional Planning",
        "Quantity Surveying",
        "Land Administration and Development",
        "Science in Architecture",
        "Science in Geoinformatics",
        "Science in Property Management",
        "Landscape Architecture"
      ],
      "Faculty of Computing": [
        "Software Engineering",
        "Data Engineering",
        "Computer Network and Security",
        "Graphics and Multimedia Software",
        "Bioinformatics",
        "Artificial Intelligence"
      ],
      "Faculty of Engineering": [
        "Civil",
        "Electrical",
        "Mechanical",
        "Chemical",
        "Biomedical",
        "Petroleum",
        "Geomatic",
        "Environmental",
        "Aerospace",
        "Naval Architecture and Offshore Engineering",
        "Electronic",
        "Mechatronics",
        "Computer and Communication"
      ],
      "Faculty of Science": [
        "Industrial Chemistry",
        "Physics",
        "Industrial Mathematics",
        "Biology",
        "Chemistry",
        "Mathematics",
        "Statistics"
      ],
      "Faculty of Social Sciences and Humanities": [
        "Management (Technology)",
        "Management (Marketing)",
        "Management (Human Resource Development)",
        "Science in Psychology",
        "Science in Education (TESL)",
        "Science in Education (Mathematics)",
        "Science in Education (Physics)",
        "Science in Education (Chemistry)",
        "Science in Education (Biology)",
        "Science in Education (Islamic Studies)",
        "Science in Education (Guidance and Counseling)"
      ]
    };
  }

  /**
   * Format phone number for display
   */
  getFormattedPhoneNumber() {
    if (!this.phoneNumber) return "";
    
    const cleaned = this.phoneNumber.replace(/\D/g, '');
    
    // Malaysian phone number formatting
    if (cleaned.startsWith('601')) {
      return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.startsWith('01')) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    return this.phoneNumber;
  }

  /**
   * Get display name (fallback to username if no proper name)
   */
  getDisplayName() {
    return this.username || "User";
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete() {
    return !!(
      this.username &&
      this.universityId &&
      this.phoneNumber &&
      this.faculty &&
      this.course
    );
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage() {
    const fields = [
      this.username,
      this.universityId,
      this.phoneNumber,
      this.faculty,
      this.course,
      this.profileImageUrl
    ];
    
    const completedFields = fields.filter(field => field && field.trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Create a copy of the model
   */
  clone() {
    return new ProfileModel({
      userId: this.userId,
      username: this.username,
      universityId: this.universityId,
      phoneNumber: this.phoneNumber,
      faculty: this.faculty,
      course: this.course,
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }

  /**
   * Check if two profiles are equal
   */
  equals(other) {
    if (!(other instanceof ProfileModel)) return false;
    
    return (
      this.userId === other.userId &&
      this.username === other.username &&
      this.universityId === other.universityId &&
      this.phoneNumber === other.phoneNumber &&
      this.faculty === other.faculty &&
      this.course === other.course &&
      this.profileImageUrl === other.profileImageUrl
    );
  }

  /**
   * Get changes between this model and another
   */
  getChanges(other) {
    if (!(other instanceof ProfileModel)) return {};
    
    const changes = {};
    
    if (this.username !== other.username) changes.username = this.username;
    if (this.universityId !== other.universityId) changes.universityId = this.universityId;
    if (this.phoneNumber !== other.phoneNumber) changes.phoneNumber = this.phoneNumber;
    if (this.faculty !== other.faculty) changes.faculty = this.faculty;
    if (this.course !== other.course) changes.course = this.course;
    if (this.profileImageUrl !== other.profileImageUrl) changes.profileImageUrl = this.profileImageUrl;
    
    return changes;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      universityId: this.universityId,
      phoneNumber: this.phoneNumber,
      faculty: this.faculty,
      course: this.course,
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}