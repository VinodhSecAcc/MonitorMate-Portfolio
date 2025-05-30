<template>
  <navigation_bar />
  <div class="track-container">
    <!-- Header Section -->
    <div class="header-section">
      <h2>Track Students Attendance</h2>
      <button @click="showAttendanceQR" class="back-btn">
  <i class="fas fa-qrcode"></i>
  Show Attendance QR
</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading attendance data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="loadAttendanceData" class="retry-btn">
        <i class="fas fa-redo"></i>
        Retry
      </button>
    </div>

    <div v-if="!loading && !error">
      <!-- Session Information Card -->
      <div class="session-info-card">
        <div class="info-grid">
          <div class="info-item">
            <i class="fas fa-book"></i>
            <div>
              <label>Course</label>
              <span>{{ sessionData.courseCode }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-users"></i>
            <div>
              <label>Section</label>
              <span>{{ sessionData.section }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar"></i>
            <div>
              <label>Date</label>
              <span>{{ formatDate(sessionData.date) }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <div>
              <label>Time Slot</label>
              <span>{{ sessionData.timeSlot }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-clipboard-list"></i>
            <div>
              <label>Type</label>
              <span class="attendance-type" :class="{ exam: sessionData.isExam }">
                {{ sessionData.isExam ? 'Exam' : 'Class' }}
              </span>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-user-check"></i>
            <div>
              <label>Total Scanned</label>
              <span class="total-count">{{ sessionData.totalStudents }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Table -->
      <div class="table-container">
        <div class="table-header">
          <h3>Students List ({{ filteredStudents.length }} students)</h3>
          <div class="table-actions">
            <button @click="exportToCSV" class="export-btn" :disabled="filteredStudents.length === 0">
              <i class="fas fa-download"></i>
              Export CSV
            </button>
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search student..."
                @input="filterStudents"
              />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="students-table" v-if="filteredStudents.length > 0">
            <thead>
              <tr>
                <th>#</th>
                <th @click="sortBy('username')" class="sortable">
                  Username
                  <i class="fas fa-sort" :class="getSortIcon('username')"></i>
                </th>
                <th @click="sortBy('universityId')" class="sortable">
                  University ID
                  <i class="fas fa-sort" :class="getSortIcon('universityId')"></i>
                </th>
                <th @click="sortBy('scanTime')" class="sortable">
                  Scan Time
                  <i class="fas fa-sort" :class="getSortIcon('scanTime')"></i>
                </th>
                <th>Apps Usage</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in filteredStudents" :key="student.universityId" class="student-row">
                <td>{{ index + 1 }}</td>
                <td class="username">{{ student.username }}</td>
                <td class="university-id">{{ student.universityId }}</td>
                <td class="scan-time">{{ formatScanTime(student.scanTime) }}</td>
                <td class="apps-data">
                  <div v-if="student.apps && student.apps.length > 0" class="apps-summary">
                    <!-- Apps Summary -->
                    <div class="apps-count" @click="toggleAppsDropdown(student.universityId)" :class="{ active: expandedApps[student.universityId] }">
                      <div class="count-info">
                        <i class="fas fa-mobile-alt"></i>
                        <span class="count-text">{{ student.apps.length }} app{{ student.apps.length > 1 ? 's' : '' }}</span>
                        <span class="active-count" v-if="getActiveAppsCount(student.apps) > 0">
                          ({{ getActiveAppsCount(student.apps) }} active)
                        </span>
                      </div>
                      <i class="fas fa-chevron-down dropdown-icon" :class="{ rotated: expandedApps[student.universityId] }"></i>
                    </div>
                    
                    <!-- Replace the apps dropdown section in your template with this: -->

<!-- Apps Dropdown -->
<div v-if="expandedApps[student.universityId]" class="apps-dropdown" @click.stop>
  <!-- Dropdown Header -->
  <div class="apps-dropdown-header">
    <span class="apps-dropdown-title">{{ student.username }}'s Apps</span>
    <button class="apps-dropdown-close" @click="toggleAppsDropdown(student.universityId)">
      <i class="fas fa-times"></i>
    </button>
  </div>
  
  <!-- Apps List -->
  <div v-for="app in student.apps" :key="app.encodedName" class="app-item">
    <div class="app-header">
      <span class="app-name">{{ app.appName }}</span>
      <span class="app-status" :class="{ active: app.status === 'active', inactive: app.status === 'inactive' }">
        <i class="fas fa-circle"></i>
        {{ app.status }}
      </span>
    </div>
    <div class="app-duration">
      <i class="fas fa-clock"></i>
      {{ formatDuration(app.duration) }}
    </div>
  </div>
</div>
                  </div>
                  <div v-else class="no-apps">
                    <i class="fas fa-mobile-alt"></i>
                    No app data
                  </div>
                </td>
                <td>
                  <span class="status-badge present">
                    <i class="fas fa-check"></i>
                    Present
                  </span>
                </td>
                <td class="manage-actions">
                  <button @click="confirmDeleteStudent(student)" class="action-btn delete-btn" title="Delete Student">
  <i class="fas fa-trash"></i>
  Delete Student
</button>
                  <button @click="trackActivity(student)" class="action-btn track-btn" title="Send Warning to Student">
  <i class="fas fa-exclamation-triangle"></i>
  Send Warning
</button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredStudents.length === 0" class="empty-state">
            <i class="fas fa-user-times"></i>
            <h4>{{ searchQuery ? 'No students found' : 'No students scanned yet' }}</h4>
            <p>{{ searchQuery ? 'Try adjusting your search terms' : 'Students will appear here once they scan the QR code' }}</p>
          </div>
        </div>
      </div>

      <!-- Statistics Card -->
      <div class="stats-card">
        <h3>Session Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ sessionData.totalStudents }}</div>
            <div class="stat-label">Total Scanned</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ getEarliestScanTime() }}</div>
            <div class="stat-label">First Scan</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ getLatestScanTime() }}</div>
            <div class="stat-label">Latest Scan</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ getAverageScanTime() }}</div>
            <div class="stat-label">Avg. Scan Time</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- QR Code Modal -->
<QRCodeGenerator
  :courseCode="sessionData.courseCode"
  :selectedSection="sessionData.section"
  :sessionID="currentSessionID"
  :selectedDate="sessionData.date"
  :timeSlot="sessionData.timeSlot"
  :isExam="sessionData.isExam"
  :isVisible="showQRModal"
  @close="closeQRModal"
  @qr-generated="onQRGenerated"
  @qr-error="onQRError"
  @attendance-ended="onAttendanceEnded"
  @students-updated="onStudentsUpdated"
  @show-message="onShowMessage"
/>
<!-- Delete Confirmation Modal -->
<div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
  <div class="modal-content" @click.stop>
    <div class="modal-header">
      <h3>Confirm Delete</h3>
      <button @click="closeDeleteModal" class="modal-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to delete this student's attendance record?</p>
      <div class="student-info">
        <strong>Student:</strong> {{ studentToDelete?.username }}<br>
        <strong>University ID:</strong> {{ studentToDelete?.universityId }}
      </div>
      <p class="warning-text">This action cannot be undone.</p>
    </div>
    <div class="modal-footer">
      <button @click="closeDeleteModal" class="cancel-btn">Cancel</button>
      <button @click="deleteStudent" class="confirm-delete-btn" :disabled="deleting">
        <i class="fas fa-spinner fa-spin" v-if="deleting"></i>
        <i class="fas fa-trash" v-else></i>
        {{ deleting ? 'Deleting...' : 'Delete' }}
      </button>
    </div>
  </div>
</div>
</template>

<script>
import navigation_bar from '@/components/navigation_bar.vue';
import { ref, onValue, off, getDatabase, remove, get } from 'firebase/database';
import QRCodeGenerator from '@/components/QRCodeGenerator.vue';
import { useHead } from '@vueuse/head';


export default {
  setup() {
    useHead({
      title: 'Monitor Students - MonitorMate',
      meta: [{ name: 'description', content: 'This is a sample description' }]
    });
  },
  name: 'TrackStudents',
  components: {
    navigation_bar,
    QRCodeGenerator
  },
  data() {
    return {
      sessionData: {
        courseCode: '',
        section: '',
        date: '',
        timeSlot: '',
        isExam: false,
        sessionID: '',
        students: [],
        totalStudents: 0
      },
      searchQuery: '',
      filteredStudents: [],
      sortField: '',
      sortDirection: 'asc',
      loading: true,
      error: null,
      courseCode: '',
      selectedSection: '',
      sessionID: '',
      firebaseRef: null,
      expandedApps: {}, // Track which student's apps are expanded
      showQRModal: false,
      currentSessionID: null,
      showDeleteModal: false,
      studentToDelete: null,
      deleting: false
    };
  },
  mounted() {
    this.initializeData();
    this.loadAttendanceData();

     // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.apps-summary') && !e.target.closest('.apps-dropdown')) {
      this.closeAllDropdowns();
    }
  });
  },

  beforeUnmount() {
    // Clean up Firebase listener
    if (this.firebaseRef) {
      off(this.firebaseRef);
    }
    // Remove event listener
  document.removeEventListener('click', this.closeAllDropdowns);
  },
  methods: {
    confirmDeleteStudent(student) {
    this.studentToDelete = student;
    this.showDeleteModal = true;
  },

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.studentToDelete = null;
    this.deleting = false;
  },

  async deleteStudent() {
  if (!this.studentToDelete) return;
  
  this.deleting = true;
  
  try {
    const db = getDatabase();
    const userId = this.studentToDelete.userId || this.studentToDelete.universityId;
    
    console.log('Deleting student:', {
      userId,
      courseCode: this.courseCode,
      selectedSection: this.selectedSection,
      sessionID: this.sessionID,
      isExam: this.sessionData.isExam
    });
    
    // Determine the attendance folder name based on session type
    const attendanceFolder = this.sessionData.isExam ? 'exam' : 'class';
    
    // Delete from attendance folder
    const attendanceRef = ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/students/${userId}`);
    console.log('Attendance path:', `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/students/${userId}`);
    await remove(attendanceRef);
    console.log('✅ Deleted from attendance folder');

    // Try multiple possible user paths
    const possibleUserPaths = [
      // Current path you're using
      `users/students/${userId}/${attendanceFolder}/${this.courseCode}/${this.selectedSection}/${this.sessionID}`,
      
      // Alternative path without section prefix
      `users/students/${userId}/${attendanceFolder}/${this.courseCode}/${this.selectedSection}/${this.sessionID}`,
      
      // Path without attendance folder subdivision
      `users/students/${userId}/${this.courseCode}/${this.selectedSection}/${this.sessionID}`,
      
      // Path with different structure
      `users/students/${userId}/attendance/${this.courseCode}/${this.selectedSection}/${this.sessionID}`,
      
      // Path with session data at course level
      `users/students/${userId}/${this.courseCode}/${attendanceFolder}/${this.selectedSection}/${this.sessionID}`,
    ];

    // Try each path and log results
    let deleted = false;
    for (const path of possibleUserPaths) {
      try {
        console.log('Trying user path:', path);
        const userRef = ref(db, path);
        
        // First check if the path exists
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          console.log('✅ Found data at path:', path);
          console.log('Data:', snapshot.val());
          await remove(userRef);
          console.log('✅ Successfully deleted from user path:', path);
          deleted = true;
          break;
        } else {
          console.log('❌ No data found at path:', path);
        }
      } catch (error) {
        console.error('Error trying path:', path, error);
      }
    }

    if (!deleted) {
      console.error('❌ Could not find user data in any expected path');
      
      // Let's also try to find where the user data actually exists
      await this.debugUserDataLocation(userId, attendanceFolder);
    }
    
    console.log('Student deletion completed');
    this.closeDeleteModal();
    
  } catch (error) {
    console.error('Error deleting student:', error);
    this.error = 'Failed to delete student. Please try again.';
    this.deleting = false;
  }
},

// Add this import to your existing imports:
// import { ref, onValue, off, getDatabase, remove, get } from 'firebase/database';

// Add this debugging method to help find the actual user data structure
/*async debugUserDataLocation(userId, attendanceFolder) {
  try {
    const db = getDatabase();
    
    // Check the entire user node structure
    console.log('🔍 Debugging user data location for userId:', userId);
    
    const userRootRef = ref(db, `users/students/${userId}`);
    const snapshot = await get(userRootRef);
    
    if (snapshot.exists()) {
      console.log('📁 Full user data structure:', JSON.stringify(snapshot.val(), null, 2));
      
      // Try to find any reference to this course/session
      const userData = snapshot.val();
      this.searchInObject(userData, this.courseCode, `users/students/${userId}`);
      this.searchInObject(userData, this.sessionID, `users/students/${userId}`);
    } else {
      console.log('❌ No user data found at users/students/' + userId);
      
      // Check if user exists at different path
      const altUserRef = ref(db, `users/${userId}`);
      const altSnapshot = await get(altUserRef);
      if (altSnapshot.exists()) {
        console.log('📁 Found user at alternative path users/' + userId);
        console.log('Data:', JSON.stringify(altSnapshot.val(), null, 2));
      }
    }
  } catch (error) {
    console.error('Error debugging user data location:', error);
  }
},*/

// Helper method to search for specific values in nested objects
searchInObject(obj, searchValue, currentPath = '') {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const [key, value] of Object.entries(obj)) {
    const newPath = currentPath ? `${currentPath}/${key}` : key;
    
    if (key === searchValue || value === searchValue) {
      console.log(`🎯 Found ${searchValue} at path:`, newPath);
    }
    
    if (typeof value === 'object' && value !== null) {
      this.searchInObject(value, searchValue, newPath);
    }
  }
},
    initializeData() {
      // Get parameters from route
      this.courseCode = this.$route.query.courseCode || this.$route.params.courseCode;
      this.selectedSection = this.$route.query.section || this.$route.params.section;
      this.sessionID = this.$route.query.sessionID || this.$route.params.sessionID;

      if (!this.courseCode || !this.selectedSection || !this.sessionID) {
        this.error = 'Missing required parameters (courseCode, section, sessionID)';
        this.loading = false;
        return;
      }

      this.sessionData.courseCode = this.courseCode;
      this.sessionData.section = this.selectedSection;
      this.sessionData.sessionID = this.sessionID;
    },

    loadAttendanceData() {
      this.loading = true;
      this.error = null;

      try {
        // First, load session details
        const db = getDatabase();
        const sessionRef = ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`);
        
        onValue(sessionRef, (snapshot) => {
          if (snapshot.exists()) {
            const sessionData = snapshot.val();
            
            // Update session information
            this.sessionData.date = sessionData.date || new Date().toISOString().split('T')[0];
            this.sessionData.timeSlot = sessionData.timeSlot || 'N/A';
            this.sessionData.isExam = sessionData.isExam || false;

            // Load students data
            this.loadStudentsData();
          } else {
            this.error = 'Session not found';
            this.loading = false;
          }
        }, (error) => {
          console.error('Error loading session data:', error);
          this.error = 'Failed to load session data';
          this.loading = false;
        });

      } catch (error) {
        console.error('Error setting up Firebase listener:', error);
        this.error = 'Failed to connect to database';
        this.loading = false;
      }
    },

    // Fixed loadStudentsData method with proper data handling
loadStudentsData() {
  const db = getDatabase();
  const studentsRef = ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/students`);
  this.firebaseRef = studentsRef;

  onValue(studentsRef, async (snapshot) => {
    if (snapshot.exists()) {
      // Clear existing students array to prevent duplication
      this.sessionData.students = [];
      
      const studentsData = snapshot.val();
      const allUserIds = Object.keys(studentsData);
      console.log('Found user IDs:', allUserIds);
      
      // Process each student individually with proper error handling
      const studentPromises = allUserIds.map(async (userId) => {
        try {
          const studentData = studentsData[userId];
          
          // Create student object with proper validation
          const studentObj = {
            username: studentData.username || 'N/A',
            universityId: studentData.universityId || userId,
            scanTime: studentData.scanTime || 'N/A',
            apps: [],
            userId: userId // Keep original userId for reference
          };

          // Process app data if it exists
          if (studentData.app && typeof studentData.app === 'object') {
            studentObj.apps = this.processAppData(studentData.app);
          }

          return studentObj;
        } catch (error) {
          console.error(`Error processing student data for ${userId}:`, error);
          // Return a fallback student object
          return {
            username: 'Error Loading',
            universityId: userId,
            scanTime: 'N/A',
            apps: [],
            userId: userId
          };
        }
      });

      // Wait for all student data to be processed
      try {
        const processedStudents = await Promise.all(studentPromises);
        
        // Filter out any null/undefined results and sort by scan time
        this.sessionData.students = processedStudents
          .filter(student => student !== null)
          .sort((a, b) => {
            // Sort by scan time (earliest first)
            if (a.scanTime === 'N/A' && b.scanTime === 'N/A') return 0;
            if (a.scanTime === 'N/A') return 1;
            if (b.scanTime === 'N/A') return -1;
            
            const timeA = this.parseScanTime(a.scanTime);
            const timeB = this.parseScanTime(b.scanTime);
            return timeA - timeB;
          });

        // Update total count
        this.sessionData.totalStudents = this.sessionData.students.length;
        
        // Update filtered students
        this.filteredStudents = [...this.sessionData.students];
        this.filterStudents(); // Apply any existing search filter
        
        console.log('Processed students:', this.sessionData.students);
        
      } catch (error) {
        console.error('Error processing students data:', error);
        this.error = 'Failed to process students data';
      }
      
    } else {
      // No students have scanned yet
      this.sessionData.students = [];
      this.sessionData.totalStudents = 0;
      this.filteredStudents = [];
    }
    
    this.loading = false;
  }, (error) => {
    console.error('Error loading students data:', error);
    this.error = 'Failed to load students data';
    this.loading = false;
  });
},
// Helper method to parse scan time for sorting
parseScanTime(timeString) {
  if (!timeString || timeString === 'N/A') return 0;
  
  try {
    // If it's a timestamp, return it directly
    if (typeof timeString === 'number') {
      return timeString;
    }
    
    // If it's a formatted time string, convert to comparable number
    if (timeString.includes('AM') || timeString.includes('PM')) {
      const date = new Date(`1970-01-01 ${timeString}`);
      return date.getTime();
    }
    
    // Parse time string like "14:8:1" or "08:15:23"
    const timeParts = timeString.split(':');
    if (timeParts.length >= 3) {
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    
    return 0;
  } catch (error) {
    console.error('Error parsing scan time:', timeString, error);
    return 0;
  }
},

    // Improved processAppData method with better error handling
processAppData(appData) {
  if (!appData || typeof appData !== 'object') {
    return [];
  }
  
  const apps = [];
  
  try {
    // Iterate through each encoded app name
    Object.keys(appData).forEach(encodedAppName => {
      const app = appData[encodedAppName];
      if (app && typeof app === 'object') {
        apps.push({
          encodedName: encodedAppName,
          appName: app.appName || 'Unknown App',
          duration: this.convertMillisecondsToSeconds(app.duration || 0),
          status: app.status || 'inactive'
        });
      }
    });

    // Sort apps by status (active first) then by app name
    apps.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return a.appName.localeCompare(b.appName);
    });

  } catch (error) {
    console.error('Error processing app data:', error);
  }

  return apps;
},

    convertMillisecondsToSeconds(milliseconds) {
      if (!milliseconds || isNaN(milliseconds)) return 0;
      return Math.round(milliseconds / 1000);
    },

    formatDuration(seconds) {
      if (!seconds || seconds === 0) return '0s';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      let result = '';
      
      if (hours > 0) {
        result += `${hours}h `;
      }
      
      if (minutes > 0) {
        result += `${minutes}m `;
      }
      
      if (remainingSeconds > 0 || result === '') {
        result += `${remainingSeconds}s`;
      }
      
      return result.trim();
    },

    getActiveAppsCount(apps) {
      return apps.filter(app => app.status === 'active').length;
    },

    toggleAppsDropdown(universityId) {
    // Close all other dropdowns first
    Object.keys(this.expandedApps).forEach(id => {
      if (id !== universityId) {
        this.expandedApps[id] = false;
      }
    });
    
    // Toggle the clicked one
    this.expandedApps[universityId] = !this.expandedApps[universityId];
  },

  // Add this method to close dropdown when clicking outside
  closeAllDropdowns() {
    Object.keys(this.expandedApps).forEach(id => {
      this.expandedApps[id] = false;
    });
  },

    formatScanTime(timeString) {
      if (!timeString || timeString === 'N/A') return 'N/A';
      
      try {
        // If it's a timestamp, convert it
        if (typeof timeString === 'number') {
          const date = new Date(timeString);
          return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }

        // If already formatted with AM/PM, return as is
        if (timeString.includes('AM') || timeString.includes('PM')) {
          return timeString;
        }
        
        // Parse time string like "14:8:1" or "08:15:23"
        const timeParts = timeString.split(':');
        if (timeParts.length >= 3) {
          let hours = parseInt(timeParts[0]);
          let minutes = parseInt(timeParts[1]);
          let seconds = parseInt(timeParts[2]);
          
          const period = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
        }
        
        return timeString;
      } catch (error) {
        return timeString;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    },

    // Enhanced filtering to prevent cross-contamination
filterStudents() {
  if (!this.searchQuery.trim()) {
    this.filteredStudents = [...this.sessionData.students];
  } else {
    const query = this.searchQuery.toLowerCase();
    this.filteredStudents = this.sessionData.students.filter(student => {
      // Ensure we're checking the correct student data
      const matchesUsername = student.username && student.username.toLowerCase().includes(query);
      const matchesUniversityId = student.universityId && student.universityId.toLowerCase().includes(query);
      const matchesApps = student.apps && student.apps.some(app => 
        app.appName && app.appName.toLowerCase().includes(query)
      );
      
      return matchesUsername || matchesUniversityId || matchesApps;
    });
  }
},

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }

      this.filteredStudents.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'scanTime') {
          // Handle time comparison
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          } else {
            aVal = new Date(`1970-01-01 ${aVal}`);
            bVal = new Date(`1970-01-01 ${bVal}`);
          }
        }

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },

    getSortIcon(field) {
      if (this.sortField !== field) return '';
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },

    exportToCSV() {
      if (this.filteredStudents.length === 0) return;

      const headers = ['#', 'Username', 'University ID', 'Scan Time', 'Apps Data', 'Status'];
      const csvContent = [
        headers.join(','),
        ...this.filteredStudents.map((student, index) => {
          const appsData = student.apps && student.apps.length > 0 
            ? student.apps.map(app => `${app.appName}(${this.formatDuration(app.duration)},${app.status})`).join(';')
            : 'No app data';
          
          return [
            index + 1,
            student.username,
            student.universityId,
            this.formatScanTime(student.scanTime),
            `"${appsData}"`,
            'Present'
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${this.sessionData.courseCode}_section${this.sessionData.section}_${this.sessionData.date}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    getEarliestScanTime() {
      if (this.sessionData.students.length === 0) return 'N/A';
      const times = this.sessionData.students.map(s => s.scanTime).sort();
      return this.formatScanTime(times[0]);
    },

    getLatestScanTime() {
      if (this.sessionData.students.length === 0) return 'N/A';
      const times = this.sessionData.students.map(s => s.scanTime).sort();
      return this.formatScanTime(times[times.length - 1]);
    },

    getAverageScanTime() {
      if (this.sessionData.students.length === 0) return 'N/A';
      // For simplicity, return the middle scan time
      const times = this.sessionData.students.map(s => s.scanTime).sort();
      const middleIndex = Math.floor(times.length / 2);
      return this.formatScanTime(times[middleIndex]);
    },

    viewStudent(student) {
      // Navigate to student details page or show modal
      this.$router.push({
        name: 'StudentDetails', // Replace with your route name
        params: {
          universityId: student.universityId,
          courseCode: this.courseCode,
          section: this.selectedSection
        },
        query: {
          username: student.username,
          sessionID: this.sessionID
        }
      });
    },

    trackActivity(student) {
      // Navigate to student activity tracking page
      this.$router.push({
        name: 'StudentActivity', // Replace with your route name
        params: {
          universityId: student.universityId,
          courseCode: this.courseCode,
          section: this.selectedSection
        },
        query: {
          username: student.username
        }
      });
    },

    showAttendanceQR() {
    // Generate a new session ID or reuse current one
    this.currentSessionID = this.sessionID || this.generateSessionID();
    this.showQRModal = true;
  },

  generateSessionID() {
    // Generate a unique session ID
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  closeQRModal() {
    this.showQRModal = false;
  },

  onQRGenerated(data) {
    console.log('QR Generated:', data);
    // Handle QR generation success
  },

  onQRError(error) {
    console.error('QR Error:', error);
    // Handle QR generation error
    this.error = 'Failed to generate QR code';
  },

  onAttendanceEnded(sessionID) {
    console.log('Attendance ended for session:', sessionID);
    // Handle attendance end
    this.showQRModal = false;
  },

  onStudentsUpdated(data) {
    console.log('Students updated:', data);
    // This will automatically update your existing listener
    // No additional action needed as your Firebase listener will handle it
  },

  onShowMessage(message) {
    console.log('Message:', message);
    // Handle success/error messages - you can show toast notifications here
    // Example: this.$toast.success(message.message);
  },

  // Keep your existing goBack method if you want a separate back navigation
  goBack() {
    this.$router.go(-1);
  }
  }
};
</script>

<style scoped>
.track-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 170px;
  background: #111;
  border-radius: 10px;
  border: 3px solid rgb(84, 84, 84);
  color: white;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
}

.loading-state i,
.error-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #32cd32;
}

.error-state i {
  color: #dc3545;
}

.retry-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: linear-gradient(135deg, #c82333, #dc3545);
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-section h2 {
  color: white;
  margin: 0;
}

.back-btn {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: linear-gradient(135deg, #495057, #6c757d);
  transform: translateY(-2px);
}

/* Session Info Card */
.session-info-card {
  background: #222;
  border: 2px solid #32cd32;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item i {
  font-size: 20px;
  color: #32cd32;
  width: 25px;
}

.info-item div {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 2px;
}

.info-item span {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.attendance-type.exam {
  color: #ff6b35;
}

.total-count {
  color: #32cd32;
}

/* Table Container */
.table-container {
  background: #222;
  border: 2px solid #32cd32;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-header h3 {
  color: white;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.export-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.export-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #20c997, #28a745);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #aaa;
  font-size: 14px;
}

.search-box input {
  background: #333;
  border: 2px solid #555;
  border-radius: 6px;
  padding: 8px 8px 8px 35px;
  color: white;
  font-size: 14px;
  width: 200px;
}

.search-box input:focus {
  outline: none;
  border-color: #32cd32;
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  min-width: 1000px;
}

.students-table th {
  background: #32cd32;
  color: #000;
  padding: 15px;
  text-align: left;
  font-weight: bold;
  position: relative;
}

.students-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.students-table th.sortable:hover {
  background: #28a745;
}

.students-table th i {
  margin-left: 8px;
  font-size: 12px;
}

.students-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #555;
  vertical-align: top;
}

.student-row:hover {
  background: #3a3a3a;
}

.username {
  font-weight: bold;
  color: #32cd32;
}

.university-id {
  font-family: 'Courier New', monospace;
  color: #ffd700;
}

.scan-time {
  color: #87ceeb;
  font-size: 14px;
}

/* Apps Data Styles */
.apps-data {
  min-width: 200px;
}

.apps-summary {
  position: relative;
}

.apps-count {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #444;
  border: 1px solid #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.apps-count:hover {
  background: #555;
  border-color: #32cd32;
}

.apps-count.active {
  background: #555;
  border-color: #32cd32;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-info i {
  color: #32cd32;
  font-size: 14px;
}

.count-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.active-count {
  color: #32cd32;
  font-size: 12px;
  font-weight: bold;
}

.dropdown-icon {
  color: #aaa;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* Replace the existing .apps-dropdown CSS rule with this overlay approach: */

.apps-dropdown {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: #333;
  border: 2px solid #32cd32;
  border-radius: 8px;
  max-height: 70vh;
  min-width: 300px;
  max-width: 90vw;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
}

/* Add overlay background */
.apps-dropdown::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: -1;
}

/* Add a close button to the dropdown */
.apps-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #555;
  background: #444;
  border-radius: 6px 6px 0 0;
}

.apps-dropdown-title {
  color: #32cd32;
  font-weight: bold;
  font-size: 16px;
}

.apps-dropdown-close {
  background: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.apps-dropdown-close:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* Adjust app items padding since we now have a header */
.app-item:first-child {
  border-top: none;
}

/* For mobile devices, keep the centered modal approach */
@media (max-width: 480px) {
  .apps-dropdown {
    position: fixed;
    top: 50%;
    left: 10px;
    right: 10px;
    bottom: auto; /* Reset bottom positioning for mobile */
    transform: translateY(-50%);
    max-height: 60vh;
    margin-bottom: 0; /* Reset margin for mobile */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); /* Normal shadow for mobile modal */
  }
}

.app-item {
  padding: 12px 15px;
  border-bottom: 1px solid #555;
}

.app-item:last-child {
  border-bottom: none;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.app-name {
  font-weight: bold;
  color: white;
  font-size: 14px;
}

.app-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
}

.app-status.active {
  color: #32cd32;
}

.app-status.inactive {
  color: #ff6b6b;
}

.app-status i {
  font-size: 8px;
}

.app-duration {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #aaa;
  font-size: 12px;
}

.app-duration i {
  color: #32cd32;
}

.no-apps {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
  font-style: italic;
  padding: 8px 0;
}

.no-apps i {
  color: #666;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.present {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.status-badge i {
  font-size: 10px;
}

/* Manage Actions */
.manage-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}

.action-btn {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  text-align: center;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.view-btn {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.view-btn:hover {
  background: linear-gradient(135deg, #138496, #17a2b8);
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.track-btn {
  background: linear-gradient(135deg, #fd7e14, #e55a00);
}

.track-btn:hover {
  background: linear-gradient(135deg, #e55a00, #fd7e14);
  box-shadow: 0 2px 8px rgba(253, 126, 20, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
}

.empty-state i {
  font-size: 64px;
  color: #555;
  margin-bottom: 20px;
}

.empty-state h4 {
  color: white;
  margin-bottom: 10px;
  font-size: 24px;
}

.empty-state p {
  color: #777;
  font-size: 16px;
}

/* Statistics Card */
.stats-card {
  background: #222;
  border: 2px solid #32cd32;
  border-radius: 10px;
  padding: 20px;
}

.stats-card h3 {
  color: white;
  margin-bottom: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #333;
  border-radius: 8px;
  border: 1px solid #555;
  transition: all 0.3s ease;
}

.stat-item:hover {
  border-color: #32cd32;
  transform: translateY(-2px);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #32cd32;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .track-container {
    margin-top: 140px;
    padding: 15px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .table-actions {
    justify-content: space-between;
  }
  
  .search-box input {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .track-container {
    margin-top: 120px;
    padding: 10px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .students-table {
    font-size: 14px;
    min-width: 800px;
  }
  
  .students-table th,
  .students-table td {
    padding: 8px 10px;
  }
  
  .manage-actions {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: 120px;
  }
  
  .action-btn {
    font-size: 11px;
    padding: 5px 8px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .track-container {
    margin-top: 100px;
    padding: 8px;
    border-width: 2px;
  }
  
  .header-section h2 {
    font-size: 20px;
  }
  
  .back-btn {
    padding: 8px 15px;
    font-size: 14px;
  }
  
  .session-info-card,
  .table-container,
  .stats-card {
    padding: 15px;
  }
  
  .students-table {
    min-width: 700px;
  }
  
  .apps-dropdown {
    position: fixed;
    top: 50%;
    left: 10px;
    right: 10px;
    transform: translateY(-50%);
    max-height: 60vh;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Custom Scrollbar for Apps Dropdown */
.apps-dropdown::-webkit-scrollbar {
  width: 6px;
}

.apps-dropdown::-webkit-scrollbar-track {
  background: #444;
  border-radius: 3px;
}

.apps-dropdown::-webkit-scrollbar-thumb {
  background: #32cd32;
  border-radius: 3px;
}

.apps-dropdown::-webkit-scrollbar-thumb:hover {
  background: #28a745;
}

/* Animation for Loading Spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fa-spin {
  animation: spin 1s infinite linear;
}

/* Smooth transitions for interactive elements */
* {
  box-sizing: border-box;
}

button {
  transition: all 0.3s ease;
}

input {
  transition: border-color 0.3s ease;
}

/* Print Styles */
@media print {
  .track-container {
    background: white;
    color: black;
    border: none;
    margin-top: 0;
  }
  
  .header-section,
  .table-actions,
  .manage-actions,
  .back-btn {
    display: none;
  }
  
  .session-info-card,
  .table-container {
    border: 1px solid #000;
    background: white;
  }
  
  .students-table th {
    background: #f0f0f0;
    color: black;
  }
  
  .students-table td {
    border-bottom: 1px solid #ccc;
  }
}
/* Delete Button Styles */
.delete-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #c82333, #dc3545);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #333;
  border: 2px solid #dc3545;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #555;
  background: #444;
  border-radius: 8px 8px 0 0;
}

.modal-header h3 {
  color: #dc3545;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
}

.modal-close:hover {
  color: white;
  background: #555;
}

.modal-body {
  padding: 20px;
  color: white;
}

.student-info {
  background: #444;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
  border-left: 4px solid #dc3545;
}

.warning-text {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #555;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-btn:hover {
  background: #5a6268;
}

.confirm-delete-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #c82333, #dc3545);
}

.confirm-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>