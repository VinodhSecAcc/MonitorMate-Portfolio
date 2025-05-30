<template>
  <div class="qr-modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="qr-modal" @click.stop>
      <div class="qr-header">
        <h3>{{ isExam ? 'Exam' : 'Class' }} Attendance QR Code</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="qr-content">
        <div class="qr-info">
          <p><strong>Course:</strong> {{ courseCode }}</p>
          <p><strong>Section:</strong> {{ selectedSection }}</p>
          <p><strong>Date:</strong> {{ formattedDate }}</p>
          <p><strong>Type:</strong> {{ isExam ? 'Exam' : 'Class' }}</p>
        </div>
        
        <div class="qr-container">
          <canvas ref="qrCanvas"></canvas>
          <p class="qr-text">Scan the QR code using the <strong>MonitorMate</strong> app.</p>
        </div>
        
        <div class="qr-actions">
          <button @click="endAttendance" class="end-btn">
            <i class="fas fa-stop"></i>
            Close QR Attendance
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";
import { getDatabase, ref, set, onValue } from "firebase/database";

export default {
  name: 'QRCodeGenerator',
  props: {
    courseCode: {
      type: String,
      required: true
    },
    selectedSection: {
      type: [String, Number],
      required: true
    },
    sessionID: {
      type: String,
      required: true
    },
    selectedDate: {
      type: String,
      required: true
    },
    timeSlot: {
      type: String,
      default: ''
    },
    isExam: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      qrGenerated: false,
      studentsListener: null
    };
  },
  
  computed: {
    formattedDate() {
      if (!this.selectedDate) return '';
      const date = new Date(this.selectedDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  
  watch: {
    isVisible(newVal) {
      if (newVal && !this.qrGenerated) {
        this.$nextTick(() => {
          this.generateQRCode();
        });
      } else if (!newVal && this.studentsListener) {
        // Clean up listener when modal is closed
        this.studentsListener();
        this.studentsListener = null;
      }
    }
  },
  
  beforeUnmount() {
    // Clean up listener when component is destroyed
    if (this.studentsListener) {
      this.studentsListener();
    }
  },
  
  methods: {
    async generateQRCode() {
      try {
        const qrCodeValue = `${this.courseCode}/S${this.selectedSection}/${this.sessionID}`;
        
        // Store attendance session in database
        const db = getDatabase();
        await set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}`), {
          date: this.selectedDate,
          qrCode: qrCodeValue,
          timestamp: new Date().toISOString(),
          timeSlot: this.timeSlot,
          isExam: this.isExam,
          students: {},
          expired: false
        });

        // Generate QR code on canvas
        await QRCode.toCanvas(this.$refs.qrCanvas, qrCodeValue, {
          width: 350,
          height: 350,
          color: { 
            dark: "#32cd32", 
            light: "#000000" 
          }
        });

        // Add logo to center of QR code
        this.addLogoToQR();
        
        // Start listening for students who scan the QR
        this.listenForStudents();
        
        this.qrGenerated = true;
        
        // Emit event to parent that QR was generated
        this.$emit('qr-generated', {
          sessionID: this.sessionID,
          qrCode: qrCodeValue
        });
        
      } catch (error) {
        console.error('Error generating QR code:', error);
        this.$emit('qr-error', error);
      }
    },
    
    addLogoToQR() {
      const canvas = this.$refs.qrCanvas;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      // You'll need to provide the path to your logo
      img.src = require('@/assets/mm.png'); // Adjust path as needed
      
      img.onload = function () {
        const logoSize = 60; // Smaller logo size
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        
        // Add white background circle for logo
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw logo
        ctx.drawImage(img, x, y, logoSize, logoSize);
      };
      
      img.onerror = function() {
        console.warn('Could not load logo image');
      };
    },
    
    listenForStudents() {
      const db = getDatabase();
      const studentsRef = ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/students`);

      // Store the listener so we can clean it up later
      this.studentsListener = onValue(studentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const students = Object.values(snapshot.val());
          // Emit student count to parent component
          this.$emit('students-updated', {
            count: students.length,
            students: students
          });
        }
      });
    },
    
    async endAttendance() {
      try {
        const db = getDatabase();
        await set(ref(db, `attendance/${this.courseCode}/section_${this.selectedSection}/${this.sessionID}/expired`), true);
        
        // Clean up listener
        if (this.studentsListener) {
          this.studentsListener();
          this.studentsListener = null;
        }
        
        // Emit event to parent
        this.$emit('attendance-ended', this.sessionID);
        
        // Show success message
        this.$emit('show-message', {
          type: 'success',
          message: `${this.isExam ? 'Exam' : 'Class'} attendance session ended successfully.`
        });
        
        // Close modal
        this.closeModal();
        
      } catch (error) {
        console.error('Error ending attendance:', error);
        this.$emit('qr-error', error);
      }
    },
    
    closeModal() {
      // Clean up listener when closing
      if (this.studentsListener) {
        this.studentsListener();
        this.studentsListener = null;
      }
      
      this.qrGenerated = false;
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.qr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.qr-modal {
  background: #111;
  border-radius: 15px;
  border: 3px solid #32cd32;
  padding: 25px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.qr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #32cd32;
}

.qr-header h3 {
  color: white;
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #ff3838;
  transform: scale(1.1);
}

.qr-content {
  text-align: center;
}

.qr-info {
  background: #222;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #555;
}

.qr-info p {
  color: white;
  margin: 5px 0;
  font-size: 14px;
}

.qr-info strong {
  color: #32cd32;
}

.qr-container {
  background: #000;
  padding: 20px;
  border-radius: 10px;
  border: 3px solid #555;
  margin-bottom: 20px;
  display: inline-block;
}

.qr-text {
  color: #ff4757;
  font-weight: bold;
  margin-top: 10px;
  font-size: 14px;
}

.qr-actions {
  display: flex;
  justify-content: center;
}

.end-btn {
  background: linear-gradient(135deg, #ff4757, #ff3838);
  color: white;
  font-weight: bold;
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.end-btn:hover {
  background: linear-gradient(135deg, #ff3838, #ff4757);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.end-btn i {
  font-size: 16px;
}

/* Responsive design */
@media (max-width: 600px) {
  .qr-modal {
    width: 95%;
    padding: 20px;
  }
  
  .qr-container canvas {
    width: 280px !important;
    height: 280px !important;
  }
  
  .qr-header h3 {
    font-size: 18px;
  }
}
</style>