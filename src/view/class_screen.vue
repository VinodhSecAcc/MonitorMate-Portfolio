<template>
<navigation_bar />
  <div class="container">
    <h2>Generate QR Code for Attendance</h2>

    <div class="form-container">
      <div class="input-section">
        <!-- Course ID Input -->
        <div class="form-group">
          <label for="course">Enter Course ID</label>
          <input 
            type="text" 
            v-model="viewModel.state.courseCode" 
            @input="viewModel.formatCourseID" 
            placeholder="e.g. SECJ3324" 
          />
          <p v-if="!viewModel.isCourseCodeValid && viewModel.state.courseCode.length > 0" class="error">
            Course ID must follow the format of 4 letters followed by 4 digits, e.g. SECJ3324.
          </p>
        </div>

        <!-- Date Selection -->
        <div class="form-group">
          <label for="date">Select Date</label>
          <input type="date" v-model="viewModel.state.selectedDate" />
        </div>

        <!-- Section Selection -->
        <div class="form-group">
          <label for="section">Select Section</label>
          <select v-model="viewModel.state.selectedSection">
            <option disabled value="">Select Section</option>
            <option v-for="section in viewModel.state.sections" :key="section" :value="section">
              Section {{ section }}
            </option>
          </select>
        </div>

        <!-- Class/Exam Toggle -->
        <div class="form-group">
          <label>Attendance Type</label>
          <div class="toggle-container">
            <div class="toggle-switch" @click="viewModel.state.isExam = !viewModel.state.isExam">
              <div class="toggle-option" :class="{ active: !viewModel.state.isExam }">
                <i class="fas fa-chalkboard-teacher"></i>
                Class
              </div>
              <div class="toggle-option" :class="{ active: viewModel.state.isExam }">
                <i class="fas fa-clipboard-list"></i>
                Exam
              </div>
              <div class="toggle-slider" :class="{ 'slide-right': viewModel.state.isExam }"></div>
            </div>
          </div>
        </div>

        <!-- Generate QR & End Attendance Buttons -->
        <div class="button-group">
          <button 
            :disabled="!viewModel.canGenerateQR || viewModel.state.qrButtonDisabled" 
            @click="generateQR" 
            class="qr-btn"
          >
            Generate QR Attendance
          </button>

          <button 
            :disabled="!viewModel.state.qrGenerated" 
            @click="viewModel.endAttendance" 
            class="end-btn"
          >
            Close QR Attendance
          </button>
        </div>

      </div>

      <!-- Time Slot Selection -->
      <div class="time-slots">
        <div class="slot-header">
          <label>Select Time Slot(s)</label>
          <i class="fas fa-info-circle info-icon" @click="viewModel.toggleInfo"></i>
        </div>

        <!-- Floating Info Box -->
        <div v-if="viewModel.state.showInfo" class="info-box">
          <p><strong>How to use the time slots:</strong></p>
          <ul>
            <li>Click a time slot to select it.</li>
            <li>Click another slot to select a range.</li>
            <li>Click a selected slot again to deselect it.</li>
            <li>Selecting before the first slot resets all selections.</li>
            <li>Removing a middle slot from a selection of 3+ clears all.</li>
          </ul>
          <button @click="viewModel.closeInfo">Got it!</button>
        </div>

        <div class="slots-grid">
          <div
            v-for="(slot, index) in viewModel.state.timeSlots"
            :key="index"
            class="slot"
            :class="{ selected: viewModel.state.selectedSlots.includes(index) }"
            @click="viewModel.toggleTimeSlot(index)"
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
        <div v-if="viewModel.state.qrGenerated" class="qr-wrapper">
          <div class="qr-container">
            <canvas v-show="viewModel.state.qrGenerated" ref="qrCanvas"></canvas>
            <p class="qr-text">Scan the QR code using the <strong>MonitorMate</strong> app.</p>
          </div>
        </div>
      </div>

      <!-- Student List (Right-Aligned) -->
      <div v-if="viewModel.state.studentsList.length > 0" class="students-list">
        <h3>Scanned Students ({{ viewModel.state.isExam ? 'Exam' : 'Class' }})</h3>
        <div v-for="(student, index) in viewModel.state.studentsList" :key="index" class="student">
          <div class="student-info">
            <p>{{ student.username }} &nbsp; {{ student.universityId }}</p>
            <p class="scan-time">{{ viewModel.formatScanTime(student.scanTime) }}</p>
          </div>
          <hr v-if="index < viewModel.state.studentsList.length - 1" />
        </div>
        
        <!-- Track Students Button -->
        <div class="track-button-container">
          <button @click="viewModel.navigateToTrackScreen" class="track-btn">
            <i class="fas fa-chart-line"></i>
            Track Students
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import navigation_bar from '@/components/navigation_bar.vue';
import { useHead } from '@vueuse/head';
import { AttendanceViewModel } from '@/viewmodel/class_viewmodel.js';

export default {
  setup() {
    useHead({
      title: 'Attendance - MonitorMate',
      meta: [{ name: 'description', content: 'This is a sample description' }]
    });
  },

  components: {
    navigation_bar
  },

  data() {
    return {
      // Initialize the ViewModel here instead of in mounted()
      viewModel: new AttendanceViewModel(this.$router)
    };
  },

  mounted() {
    // Setup date input styling
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      dateInput.addEventListener('click', function() {
        this.style.backgroundColor = '#333';
        this.style.color = 'white';
      });
    }
  },

  methods: {
    async generateQR() {
  console.log('generateQR method called');
  
  // First, set the state to show the canvas
  this.viewModel.model.setQRGenerated(true);
  this.viewModel.syncModelToState();
  
  // Wait for Vue to render the canvas
  await this.$nextTick();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Now get the canvas reference
  const canvas = this.$refs.qrCanvas;
  console.log('Canvas element found:', canvas);
  
  if (!canvas) {
    alert('Error: Canvas not ready. Please try again.');
    this.viewModel.model.resetQRState();
    this.viewModel.syncModelToState();
    return;
  }
  
  // Generate QR with the canvas
  await this.viewModel.generateQRCode(canvas);
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