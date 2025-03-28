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
    <h3>Scanned Students</h3>
    <div v-for="(student, index) in studentsList" :key="index" class="student">
      <div class="student-info">
        <p>{{ student.username }} &nbsp; {{ student.universityId }}</p>
        <p class="scan-time">{{ student.scanTime }}</p>
      </div>
      <hr v-if="index < studentsList.length - 1" /> <!-- Line separator -->
    </div>
    </div>
</div>

  </div>
</template>

<script>
import QRCode from "qrcode";
import { getDatabase, ref, set, onValue } from "firebase/database";
import navigation_bar from '@/components/navigation_bar.vue'

export default {
  mounted() {
  document.querySelector('input[type="date"]').addEventListener('click', function() {
    this.style.backgroundColor = '#333'; // Dark grey background
    this.style.color = 'white'; // White text
  });
},
  components: {
      navigation_bar
    },
  data() {
    return {
      courseCode: "",
      selectedDate: "",
      selectedSection: "",
      selectedSlots: [],
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

async generateQRCode() {
  const formattedDate = this.selectedDate.replace(/-/g, "");
  this.sessionID = `session_${formattedDate}_${Date.now()}`;
  const qrCodeValue = `${this.courseCode}/S${this.selectedSection}/${this.sessionID}`;

  const db = getDatabase();
  set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`), {
    date: this.selectedDate,
    qrCode: qrCodeValue,
    timestamp: new Date().toISOString(),
    timeSlots: this.selectedSlots.map(i => this.timeSlots[i]),
    students: {},
    expired: false
  });

  this.qrGenerated = true;
  this.qrButtonDisabled = true;

  this.$nextTick(() => {
    QRCode.toCanvas(this.$refs.qrCanvas, qrCodeValue, {
      width: 400,
      color: { dark: "#90ee90", light: "#000000" }
    },(error) => {
        if (error){
              console.error(error);
            }
  
            // Add image to the center of the QR Code
            const canvas = this.$refs.qrCanvas;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = require('@/assets/mm.png'); // Logo in QR code
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
},

listenForStudents() {
  const db = getDatabase();
  const studentsRef = ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/students`);

  onValue(studentsRef, (snapshot) => {
    if (snapshot.exists()) {
      this.studentsList = Object.values(snapshot.val()); // Convert object to array
    } else {
      this.studentsList = [];
    }
  });
},

async endAttendance() {
  if (!this.sessionID) return;

  const db = getDatabase();
  set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/expired`), true);

  this.qrGenerated = false;
  this.qrButtonDisabled = false; // Re-enable the button
  alert("Attendance session ended. QR Code is now expired.");
}
  }
};
</script>

<style>
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
  border: 2px solid white; /* White border */
  font-size: 16px;
  background-color: #333; /* Dark grey background */
  color: white; /* White text */
}

/* When input is focused */
input:focus, select:focus {
  outline: none;
  border-color: white; /* Keep border white */
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
  border: 2px solid white;
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
  background: lightgreen;
  color: rgb(0, 0, 0);
}

/* Button styles */
button {
  background: lightgreen;
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
  background: lightgreen;
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
  color: lightgreen;
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
  background: lightgreen;
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
  background: green;
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
  border: 2px solid lightgreen;
}

.students-container h3 {
  color: lightgreen;
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


</style>
