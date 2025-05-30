<template>
<navigation_bar />
  <div class="container">
    <h2>Generate QR Code for Attendance</h2>

    <div class="form-container">
      <div class="input-section">
        <!-- Course ID Input -->
        <div class="form-group">
          <label for="course">Enter Course ID</label>
          <input type="text" v-model="courseCode" @input="formatCourseID" placeholder="e.g. SECJ3324" />
          <p v-if="!isCourseCodeValid && courseCode.length > 0" class="error">
            Course ID must follow the format of 4 letters followed by 4 digits, e.g. SECJ3324.
          </p>
        </div>

        <!-- Date Selection -->
        <div class="form-group">
          <label for="date">Select Date</label>
          <input type="date" v-model="selectedDate" />
        </div>

        <!-- Section Selection -->
        <div class="form-group">
          <label for="section">Select Section</label>
          <select v-model="selectedSection">
            <option disabled value="">Select Section</option>
            <option v-for="section in sections" :key="section" :value="section">
              Section {{ section }}
            </option>
          </select>
        </div>

        <!-- Class/Exam Toggle -->
        <div class="form-group">
          <label>Attendance Type</label>
          <div class="toggle-container">
            <div class="toggle-switch" @click="isExam = !isExam">
              <div class="toggle-option" :class="{ active: !isExam }">
                <i class="fas fa-chalkboard-teacher"></i>
                Class
              </div>
              <div class="toggle-option" :class="{ active: isExam }">
                <i class="fas fa-clipboard-list"></i>
                Exam
              </div>
              <div class="toggle-slider" :class="{ 'slide-right': isExam }"></div>
            </div>
          </div>
        </div>

        <!-- Generate QR & End Attendance Buttons -->
<div class="button-group">
  <button :disabled="!canGenerateQR || qrButtonDisabled" @click="generateQRCode" class="qr-btn">
  Generate QR Attendance
</button>

  <button :disabled="!qrGenerated" @click="endAttendance" class="end-btn">Close QR Attendance</button>
</div>

      </div>
<!-- Time Slot Selection -->
<div class="time-slots">
  <div class="slot-header">
    <label>Select Time Slot(s)</label>
    <i class="fas fa-info-circle info-icon" @click="showInfo = !showInfo"></i>
  </div>

  <!-- Floating Info Box (Now Positioned Correctly) -->
  <div v-if="showInfo" class="info-box">
    <p><strong>How to use the time slots:</strong></p>
    <ul>
      <li>Click a time slot to select it.</li>
      <li>Click another slot to select a range.</li>
      <li>Click a selected slot again to deselect it.</li>
      <li>Selecting before the first slot resets all selections.</li>
      <li>Removing a middle slot from a selection of 3+ clears all.</li>
    </ul>
    <button @click="showInfo = false">Got it!</button>
  </div>

  <div class="slots-grid">
    <div
      v-for="(slot, index) in timeSlots"
      :key="index"
      class="slot"
      :class="{ selected: selectedSlots.includes(index) }"
      @click="toggleTimeSlot(index)"
    >
      {{ slot }}
    </div>
  </div>
</div>
 </div>
<!-- Container for QR Code (Left) and Scanned Students (Right) -->
<div class="scanned-students-container">
  <!-- QR Code Display (Left-Aligned) -->
  <div class="qr-code">
    <div v-if="qrGenerated" class="qr-wrapper">
      <div class="qr-container">
    <canvas v-show="qrGenerated" ref="qrCanvas"></canvas>
    <p class="qr-text">Scan the QR code using the <strong>MonitorMate</strong> app.</p>
  </div>
</div>
  </div>

  <!-- Student List (Right-Aligned) -->
  <div v-if="studentsList.length > 0" class="students-list">
    <h3>Scanned Students ({{ isExam ? 'Exam' : 'Class' }})</h3>
    <div v-for="(student, index) in studentsList" :key="index" class="student">
      <div class="student-info">
        <p>{{ student.username }} &nbsp; {{ student.universityId }}</p>
        <p class="scan-time">{{ formatScanTime(student.scanTime) }}</p>
      </div>
      <hr v-if="index < studentsList.length - 1" /> <!-- Line separator -->
    </div>
    
    <!-- Track Students Button -->
    <div class="track-button-container">
      <button @click="navigateToTrackScreen" class="track-btn">
        <i class="fas fa-chart-line"></i>
        Track Students
      </button>
    </div>
  </div>
</div>

  </div>
</template>

<script>
import QRCode from "qrcode";
import { getDatabase, ref, set, onValue, update } from "firebase/database";
import navigation_bar from '@/components/navigation_bar.vue';
import { useHead } from '@vueuse/head';
import { getAuth } from "firebase/auth";

export default {
setup() {
    useHead({
      title: 'Attendance - MonitorMate',
      meta: [{ name: 'description', content: 'This is a sample description' }]
    });
  },
  mounted() {
  document.querySelector('input[type="date"]').addEventListener('click', function() {
    this.style.backgroundColor = '#333'; // Dark grey background
    this.style.color = 'white'; // White text
  });
   const auth = getAuth();
  this.currentUser = auth.currentUser;
},
  components: {
      navigation_bar
    },
  data() {
    return {
      currentUser: null,
      courseCode: "",
      selectedDate: "",
      selectedSection: "",
      selectedSlots: [],
      isExam: false, // New property for attendance type
      qrGenerated: false, // Track if QR is generated
      sessionID: "", // Store session ID for ending attendance
      showInfo: false, // Controls the visibility of the info box
      qrButtonDisabled: false, // Added to disable button
      studentsList: [], // List of students who scanned the QR
      sections: Array.from({ length: 9 }, (_, i) => i + 1),
      timeSlots: Array.from({ length: 24 }, (_, i) => {
  let hour = (i % 12) || 12;
  let period = i < 12 ? "AM" : "PM";
  let nextHour = ((i + 1) % 12) || 12;
  let nextPeriod = (i + 1) === 24 ? "AM" : (i + 1) < 12 ? "AM" : "PM"; // Fixes 12 AM issue
  return `${hour}:00 ${period} - ${nextHour}:00 ${nextPeriod}`;
}),

    };
  },
  computed: {
    canGenerateQR() {
      return this.isCourseCodeValid && this.courseCode && this.selectedDate && this.selectedSection && this.selectedSlots.length > 0;
    },
    isCourseCodeValid() {
    // Adjust regex to match your course code format (e.g., "CS101", "IT-2023")
    return /^[A-Z]{4}\d{4}$/.test(this.courseCode); // Strictly 4 letters + 4 digits
  }
  },
  methods: {
    
    formatCourseID() {
      this.courseCode = this.courseCode.toUpperCase().replace(/\s+/g, "");
    },
    
    // NEW METHOD: Format scan time to 12-hour format with proper padding
    formatScanTime(timeString) {
      if (!timeString) return '';
      
      try {
        // If timeString is already formatted, return as is
        if (timeString.includes('AM') || timeString.includes('PM')) {
          return timeString;
        }
        
        // Parse the time string (assuming it's in format "HH:MM:SS" or similar)
        const date = new Date(timeString);
        
        // If it's a valid date object
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
        
        // If it's just a time string like "14:8:1"
        const timeParts = timeString.split(':');
        if (timeParts.length >= 3) {
          let hours = parseInt(timeParts[0]);
          let minutes = parseInt(timeParts[1]);
          let seconds = parseInt(timeParts[2]);
          
          const period = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12; // Convert to 12-hour format
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
        }
        
        return timeString; // Return original if parsing fails
      } catch (error) {
        console.error('Error formatting time:', error);
        return timeString;
      }
    },
    
    // NEW METHOD: Navigate to track screen with attendance details
    navigateToTrackScreen() {
      const attendanceData = {
        courseCode: this.courseCode,
        section: this.selectedSection,
        date: this.selectedDate,
        timeSlot: this.consolidateTimeSlots(),
        isExam: this.isExam,
        sessionID: this.sessionID,
        students: this.studentsList,
        totalStudents: this.studentsList.length
      };
      
      // Navigate to track screen with the attendance data
      // You can use Vue Router to navigate and pass the data
      this.$router.push({
        name: 'TrackStudents', // Replace with your actual route name
        params: {
          attendanceData: JSON.stringify(attendanceData)
        },
        query: {
          courseCode: this.courseCode,
          section: this.selectedSection,
          sessionID: this.sessionID
        }
      });
    },
    
    toggleTimeSlot(index) {
  if (this.selectedSlots.includes(index)) {
    // If the user deselects a middle slot in a selection of more than 3 slots, clear all selections
    const minSlot = Math.min(...this.selectedSlots);
    const maxSlot = Math.max(...this.selectedSlots);

    if (this.selectedSlots.length > 2 && index > minSlot && index < maxSlot) {
      this.selectedSlots = []; // Clear all selections if a middle slot is removed
    } else {
      // Otherwise, just remove the clicked slot
      this.selectedSlots = this.selectedSlots.filter(slot => slot !== index);
    }
  } 
  else if (this.selectedSlots.length === 0) {
    this.selectedSlots.push(index); // First slot selection
  } 
  else {
    const minSlot = Math.min(...this.selectedSlots);
    const maxSlot = Math.max(...this.selectedSlots);

    if (index < minSlot) {
      this.selectedSlots = []; // Deselect all if selecting before the first slot
    } 
    else if (index === maxSlot + 1) {
      this.selectedSlots.push(index); // Allow continuous selection after the last slot
    } 
    else if (this.selectedSlots.length === 1) {
      let start = Math.min(this.selectedSlots[0], index);
      let end = Math.max(this.selectedSlots[0], index);
      this.selectedSlots = [];
      for (let i = start; i <= end; i++) {
        this.selectedSlots.push(i);
      }
    } 
    else {
      this.selectedSlots = []; // Reset selection in any other case
    }
  }
},

    // NEW METHOD: Consolidate consecutive time slots into a range
    consolidateTimeSlots() {
      if (this.selectedSlots.length === 0) return "";
      
      // Sort the selected slots
      const sortedSlots = [...this.selectedSlots].sort((a, b) => a - b);
      
      // Get the start and end times
      const startSlot = sortedSlots[0];
      const endSlot = sortedSlots[sortedSlots.length - 1] + 1; // +1 because we want the end time of the last slot
      
      // Extract start time from the first slot
      const startTime = this.timeSlots[startSlot].split(' - ')[0]; // e.g., "8:00 AM"
      
      // Extract end time from what would be the next slot after the last selected
      let endTime;
      if (endSlot < this.timeSlots.length) {
        endTime = this.timeSlots[endSlot].split(' - ')[0]; // e.g., "11:00 AM"
      } else {
        // Handle case where last slot is selected (23rd index = 11 PM - 12 AM)
        endTime = "12:00 AM"; // Next day
      }
      
      return `${startTime} - ${endTime}`;
    },

async generateQRCode() {
  try {
    // Check if user is authenticated
    if (!this.currentUser) {
      alert('Please log in to generate attendance');
      return;
    }

    const formattedDate = this.selectedDate.replace(/-/g, "");
    this.sessionID = `session_${formattedDate}_${Date.now()}`;
    const qrCodeValue = `${this.courseCode}/S${this.selectedSection}/${this.sessionID}`;

    // Get consolidated time slot
    const consolidatedTimeSlot = this.consolidateTimeSlots();
    const currentTimestamp = new Date().toISOString();
    const attendanceGeneratedTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const db = getDatabase();
    
    // 1. Store in existing attendance structure (keep this for QR functionality)
    await set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`), {
      date: this.selectedDate,
      qrCode: qrCodeValue,
      timestamp: currentTimestamp,
      timeSlot: consolidatedTimeSlot,
      isExam: this.isExam,
      students: {},
      expired: false
    });

    // 2. Store in lecture folder structure for record keeping
    const attendanceType = this.isExam ? 'exam' : 'class';
    const lecturePath = `users/lecturers/${this.currentUser.uid}/${attendanceType}/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`;
    
    const attendanceRecord = {
      // Basic session info
      courseCode: this.courseCode,
      section: this.selectedSection,
      sessionId: this.sessionID,
      attendanceType: this.isExam ? 'exam' : 'class',
      
      // Date and time information
      date: this.selectedDate,
      attendanceGeneratedTime: attendanceGeneratedTime,
      attendanceGeneratedTimestamp: currentTimestamp,
      timeSlot: consolidatedTimeSlot,
      selectedTimeSlots: [...this.selectedSlots], // Store original slot indices
      
      // QR Code info
      qrCode: qrCodeValue,
      qrCodeExpired: false,
      
      // Session status
      sessionActive: true,
      sessionStartTime: currentTimestamp,
      sessionEndTime: null,
      
      // Student tracking
      totalStudentsScanned: 0,
      studentsData: {},
      
      // Additional metadata
      createdBy: this.currentUser.uid,
      createdByEmail: this.currentUser.email || '',
      lastUpdated: currentTimestamp,
      
      // Academic information
      academicInfo: {
        courseCode: this.courseCode,
        sectionNumber: this.selectedSection,
        sessionType: this.isExam ? 'examination' : 'lecture',
        scheduledDate: this.selectedDate,
        scheduledTimeSlot: consolidatedTimeSlot
      }
    };

    await set(ref(db, lecturePath), attendanceRecord);

    this.qrGenerated = true;
    this.qrButtonDisabled = true;

    this.$nextTick(() => {
      QRCode.toCanvas(this.$refs.qrCanvas, qrCodeValue, {
        width: 400,
        color: { dark: "#32cd32", light: "#000000" }
      }, (error) => {
        if (error) {
          console.error(error);
        }

        // Add image to the center of the QR Code
        const canvas = this.$refs.qrCanvas;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = require('@/assets/mm.png');
        img.onload = function () {
          const newWidth = 160;
          const newHeight = 70;
          const x = (canvas.width - newWidth) / 2;
          const y = (canvas.height - newHeight) / 2;
          ctx.drawImage(img, x, y, newWidth, newHeight);
        };
      });

      // Start listening for students who scan the QR
      this.listenForStudents();
    });

    console.log('Attendance record created successfully at:', lecturePath);
    
  } catch (error) {
    console.error('Error generating QR code and creating attendance record:', error);
    alert('Failed to generate attendance. Please try again.');
  }
},

// Update your listenForStudents method to also update the lecture folder:
listenForStudents() {
  const db = getDatabase();
  const studentsRef = ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/students`);

  onValue(studentsRef, async (snapshot) => {
    if (snapshot.exists()) {
      this.studentsList = Object.values(snapshot.val());
      
      // Also update the lecture folder with student data
      if (this.currentUser) {
        const attendanceType = this.isExam ? 'exam' : 'class';
        const lecturePath = `users/lecturers/${this.currentUser.uid}/${attendanceType}/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`;
        
        // Update student count and data in lecture folder
        const updates = {
          [`${lecturePath}/totalStudentsScanned`]: this.studentsList.length,
          [`${lecturePath}/studentsData`]: snapshot.val(),
          [`${lecturePath}/lastUpdated`]: new Date().toISOString()
        };
        
        try {
          await update(ref(db), updates);
        } catch (error) {
          console.error('Error updating student data in lecture folder:', error);
        }
      }
    } else {
      this.studentsList = [];
    }
  });
},

// Update your endAttendance method to also update the lecture folder:
async endAttendance() {
  if (!this.sessionID || !this.currentUser) return;

  try {
    const db = getDatabase();
    const endTimestamp = new Date().toISOString();
    const endTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Update the existing attendance structure
    await set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/expired`), true);

    // Update the lecture folder
    const attendanceType = this.isExam ? 'exam' : 'class';
    const lecturePath = `users/lecturers/${this.currentUser.uid}/${attendanceType}/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`;
    
    const updates = {
      [`${lecturePath}/sessionActive`]: false,
      [`${lecturePath}/sessionEndTime`]: endTimestamp,
      [`${lecturePath}/sessionEndTimeFormatted`]: endTime,
      [`${lecturePath}/qrCodeExpired`]: true,
      [`${lecturePath}/lastUpdated`]: endTimestamp,
      [`${lecturePath}/finalStudentCount`]: this.studentsList.length
    };

    await update(ref(db), updates);

    this.qrGenerated = false;
    this.qrButtonDisabled = false;
    alert(`${this.isExam ? 'Exam' : 'Class'} attendance session ended. QR Code is now expired.`);
    
  } catch (error) {
    console.error('Error ending attendance session:', error);
    alert('Error ending session. Please try again.');
  }
}
  }
};
</script>

<style scoped>
body {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%) !important;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
:global(body) {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%) !important;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
/* Darker container background */
.container {
  max-width: 1450px;
  margin: auto;
  text-align: center;
  background: #111; /* Darker grey */
  padding: 20px;
  border-radius: 10px;
  margin-top: 170px; 
  border: 3px solid rgb(84, 84, 84); /* Added white border */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Align inputs to the left */
.form-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 180px;
}

.input-section {
  flex: 1;
}

.form-group {
  text-align: left;
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: white; /* Changed to white */
}

/* Make the heading white */
.container h2 {
  color: white;
}

input, select {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 2px solid #32cd32; /* New green border */
  font-size: 16px;
  background-color: #333; /* Dark grey background */
  color: white; /* White text */
}

/* When input is focused */
input:focus, select:focus {
  outline: none;
  border-color: #90ee90; /* Lighter green on focus */
}

/* Placeholder text color */
input::placeholder {
  color: rgba(255, 255, 255, 0.7); /* Light white */
}

/* Dropdown arrow color */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 15px;
  padding-right: 30px; /* Space for dropdown arrow */
}
/* Dark grey background for the input */
input[type="date"] {
  background-color: #333;
  color: white;
  border: 2px solid #32cd32; /* New green border */
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
}

/* Change the text inside the date input */
input[type="date"]::-webkit-datetime-edit {
  color: white;
}

/* Hide default calendar icon and add custom styling */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1); /* Turns the icon white */
  cursor: pointer;
}

/* Remove default styles for a cleaner look */
input, select {
  box-shadow: none;
  appearance: none;
}

/* Toggle Switch Styles */
.toggle-container {
  margin-top: 5px;
}

.toggle-switch {
  position: relative;
  width: 280px;
  height: 50px;
  background-color: #333;
  border-radius: 25px;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  overflow: hidden;
  transition: all 0.3s ease;
}

.toggle-switch:hover {
  border-color: #32cd32;
  box-shadow: 0 0 10px rgba(50, 205, 50, 0.3);
}

.toggle-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
  color: #888;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
  padding: 0 15px;
}

.toggle-option.active {
  color: #333;
}

.toggle-option i {
  font-size: 18px;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: linear-gradient(135deg, lightgreen, #32cd32);
  border-radius: 22px;
  transition: transform 0.3s ease;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.toggle-slider.slide-right {
  transform: translateX(100%);
}

/* Header container for label + info icon */
.slot-header {
  display: flex;
  justify-content: space-between; /* Aligns label to left, icon to right */
  align-items: center;
  width: 100%;
  margin-bottom: 15px; /* Creates space between text and slot box */
}

/* Make sure .time-slots is relative so the info box is positioned inside it */


.slots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(6, auto);
  gap: 12px;
}

.slot {
  background: #b0b0b0;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.3s;
  font-weight: bold;
  width: 150px;
}

.slot:hover {
  background: #888;
}

.slot.selected {
  background: linear-gradient(135deg, #32cd32, #228b22);
  color: rgb(0, 0, 0);
}

/* Button styles */
button {
  background: linear-gradient(135deg, #32cd32, #228b22);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;
  padding: 12px;
  border-radius: 5px;
  border: none;
  font-size: 16px;
  margin-top: 10px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #333;
}

button:hover:not(:disabled) {
  background: linear-gradient(135deg, #228b22, #32cd32);
}

.button-group {
  display: flex;
  gap: 20px; /* Adjust spacing */
  justify-content: center; /* Center the buttons */
}

.qr-btn, .end-btn {
  flex: 1; /* Ensure equal size */
  color: rgb(15, 91, 42);
}

/* Wrapper to align QR code to the left */
.qr-wrapper {
  display: flex;
  justify-content: flex-start; /* Align to the left */
  margin-top: 30px;
}

/* QR Code Container */
.qr-container {
  padding: 15px;
  padding-left: 10px;
  background: rgb(0, 0, 0);
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid rgb(84, 84, 84); /* Border around QR code */
  text-align: center;
}

/* QR Code Instruction Text */
.qr-text {
  margin-top: 5px;
  font-size: 16px;
  font-weight: bold;
  color: rgb(255, 0, 0);
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}

/* Info Icon */
.info-icon {
  font-size: 20px;
  color: #32cd32;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 10px; /* Moves the icon slightly to the left */
}

.info-icon:hover {
  color: white;
}
/* Floating Info Box */
.info-box {
  position: absolute;
  top: 30px; /* Adjust distance below the icon */
  right: 0; /* Aligns to the right (next to the icon) */
  background: #222; /* Dark background */
  color: white;
  padding: 10px;
  border-radius: 5px;
  width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  text-align: left;
}
/* Make sure list items align properly */
.info-box ul {
  padding-left: 20px; /* Indent the list */
  margin: 10px 0;
}

.info-box li {
  margin-bottom: 5px;
}

/* Close button inside the box */
.info-box button {
  background: linear-gradient(135deg, #32cd32, #228b22);
  color: black;
  font-weight: bold;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  display: block;
  margin: 10px auto 0;
  border-radius: 5px;
}

.info-box button:hover {
  background: linear-gradient(135deg, #228b22, #32cd32);
  color: white;
}

.students-container {
  margin-top: 20px;
  background: #222;
  padding: 15px;
  border-radius: 10px;
  text-align: left;
  max-height: 250px; /* Limit height */
  overflow-y: auto; /* Scrollable */
  border: 2px solid #32cd32;
}

.students-container h3 {
  color: #32cd32;
  text-align: center;
  margin-bottom: 10px;
}

.students-list {
  width: 730px;
  border: 3px solid rgb(84, 84, 84);
  padding: 10px;
  border-radius: 5px;
  background-color: rgb(0, 0, 0);
  color: white;
  text-align: center; /* Center all content */
  margin-left: auto; /* Center horizontally */
  margin-right: auto; /* Center horizontally */
  margin-top: 30px;
}

.student-info {
  display: flex;
  flex-direction: column; /* Stack username and scan time */
  align-items: center; /* Center align */
  justify-content: center;
  padding: 10px 0;
}

.student {
  padding-bottom: 5px;
}

.student-info p {
  margin: 5px 0;
  font-size: 16px;
}

.scan-time {
  font-size: 14px;
  color: lightgray; /* Slightly lighter for distinction */
}

hr {
  border: 0;
  height: 1px;
  background: white; /* White separator for visibility */
  margin: 5px 0;
}

canvas {
  margin-left: 20px; /* Space between student list & QR code */
}

.scanned-students-container {
  display: flex;
  justify-content: space-between; /* QR code on left, student list on right */
  align-items: flex-start; /* Align items to top */
  margin-top: 10px;
}

.qr-code {
  flex: 1; /* Take available space */
  text-align: left; /* Align to left */
}

/* Track Students Button Styles */
.track-button-container {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #32cd32;
}

.track-btn {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  font-weight: bold;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 0;
}

.track-btn:hover {
  background: linear-gradient(135deg, #f7931e, #ff6b35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.track-btn i {
  font-size: 18px;
}
</style>