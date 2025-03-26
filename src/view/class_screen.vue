<template>
    <div class="container">
      <h2>Generate QR Code for Attendance</h2>
  
      <!-- Course Code Input -->
      <label for="course">Enter Course Code:</label>
      <input type="text" v-model="courseCode" placeholder="e.g. CSC101" />
  
      <!-- Section Selection -->
      <label for="section">Select Section:</label>
      <select v-model="selectedSection">
        <option disabled value="">Select Section</option>
        <option v-for="section in sections" :key="section" :value="section">
          Section {{ section }}
        </option>
      </select>
  
      <!-- Time Slot Selection -->
      <label>Select Time Slot(s):</label>
      <div class="time-slots">
        <label v-for="slot in timeSlots" :key="slot">
          <input type="checkbox" :value="slot" v-model="selectedSlots" />
          {{ slot }}
        </label>
      </div>
  
      <!-- Generate QR Button -->
      <button :disabled="!canGenerateQR" @click="generateQRCode">Generate QR</button>
  
      <!-- Show QR Code -->
      <canvas ref="qrCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import QRCode from "qrcode";
  import { getDatabase, ref, set } from "firebase/database";
  
  export default {
    data() {
      return {
        courseCode: "",
        selectedSection: "",
        selectedSlots: [],
        sections: Array.from({ length: 9 }, (_, i) => i + 1), // Sections 1-9
        timeSlots: Array.from({ length: 24 }, (_, i) => `${i + 1}:00 - ${i + 2}:00`)
      };
    },
    computed: {
      canGenerateQR() {
        return this.courseCode && this.selectedSection && this.selectedSlots.length > 0;
      }
    },
    methods: {
      async generateQRCode() {
        const sessionID = `session_${Date.now()}`;
        const qrCodeValue = `${this.courseCode}/S${this.selectedSection}/${sessionID}`;
  
        // Store in Firebase
        const db = getDatabase();
        set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${sessionID}`), {
          qrCode: qrCodeValue,
          timestamp: new Date().toISOString(),
          timeSlots: this.selectedSlots,
          students: {}
        });
  
        // Generate QR Code on Canvas
        QRCode.toCanvas(
          this.$refs.qrCanvas,
          qrCodeValue,
          { width: 200 },
          (error) => {
            if (error) console.error(error);
          }
        );
      }
    }
  };
  </script>
  
  <style>
  .container {
    max-width: 400px;
    margin: auto;
    text-align: center;
  }
  .time-slots {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .time-slots label {
    margin: 5px;
    cursor: pointer;
  }
  button {
    margin-top: 15px;
  }
  </style>
  