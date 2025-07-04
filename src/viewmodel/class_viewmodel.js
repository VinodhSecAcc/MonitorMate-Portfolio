// AttendanceViewModel.js
import { reactive, nextTick } from 'vue';
import QRCode from "qrcode";
import { getAuth } from "firebase/auth";
import { FirebaseService } from '@/service/firebase_service';
import { AttendanceModel } from '@/model/classAttendance_model';

export class AttendanceViewModel {
  constructor(router) {
    this.router = router;
    this.model = new AttendanceModel();
    
    // Reactive state - wrapping the model
    this.state = reactive({
      currentUser: null,
      courseCode: this.model.courseCode,
      selectedDate: this.model.selectedDate,
      selectedSection: this.model.selectedSection,
      selectedSlots: this.model.selectedSlots,
      isExam: this.model.isExam,
      qrGenerated: this.model.qrGenerated,
      sessionID: this.model.sessionID,
      showInfo: this.model.showInfo,
      qrButtonDisabled: this.model.qrButtonDisabled,
      studentsList: this.model.studentsList,
      sections: this.model.sections,
      timeSlots: this.model.timeSlots
    });

    // Initialize authentication
    this.initializeAuth();
    
    // Keep model in sync with reactive state
    this.syncModelWithState();
  }

  // Sync model with reactive state
  syncModelWithState() {
    // Watch for changes in state and update model
    this.$watch = () => {
      this.model.courseCode = this.state.courseCode;
      this.model.selectedDate = this.state.selectedDate;
      this.model.selectedSection = this.state.selectedSection;
      this.model.selectedSlots = this.state.selectedSlots;
      this.model.isExam = this.state.isExam;
      this.model.qrGenerated = this.state.qrGenerated;
      this.model.sessionID = this.state.sessionID;
      this.model.showInfo = this.state.showInfo;
      this.model.qrButtonDisabled = this.state.qrButtonDisabled;
      this.model.studentsList = this.state.studentsList;
      this.model.currentUser = this.state.currentUser;
    };
  }

  // Computed properties
  get canGenerateQR() {
    this.syncStateToModel();
    return this.model.canGenerateQR();
  }

  get isCourseCodeValid() {
    this.syncStateToModel();
    return this.model.isCourseCodeValid();
  }

  // Helper to sync state to model before operations
  syncStateToModel() {
    this.model.courseCode = this.state.courseCode;
    this.model.selectedDate = this.state.selectedDate;
    this.model.selectedSection = this.state.selectedSection;
    this.model.selectedSlots = [...this.state.selectedSlots];
    this.model.isExam = this.state.isExam;
    this.model.currentUser = this.state.currentUser;
  }

  // Helper to sync model to state after operations
  syncModelToState() {
    this.state.courseCode = this.model.courseCode;
    this.state.selectedDate = this.model.selectedDate;
    this.state.selectedSection = this.model.selectedSection;
    this.state.selectedSlots = [...this.model.selectedSlots];
    this.state.isExam = this.model.isExam;
    this.state.qrGenerated = this.model.qrGenerated;
    this.state.sessionID = this.model.sessionID;
    this.state.showInfo = this.model.showInfo;
    this.state.qrButtonDisabled = this.model.qrButtonDisabled;
    this.state.studentsList = [...this.model.studentsList];
  }

  // Methods
  initializeAuth() {
    const auth = getAuth();
    this.state.currentUser = auth.currentUser;
    this.model.currentUser = auth.currentUser;
  }

  formatCourseID() {
    this.syncStateToModel();
    this.model.formatCourseCode();
    this.syncModelToState();
  }

  formatScanTime(timeString) {
    return this.model.formatScanTime(timeString);
  }

  navigateToTrackScreen() {
    this.syncStateToModel();
    const attendanceData = this.model.createAttendanceData();
    
    this.router.push({
      name: 'TrackStudents',
      params: {
        attendanceData: JSON.stringify(attendanceData)
      },
      query: {
        courseCode: this.state.courseCode,
        section: this.state.selectedSection,
        sessionID: this.state.sessionID
      }
    });
  }

  toggleTimeSlot(index) {
    this.syncStateToModel();
    this.model.toggleTimeSlot(index);
    this.syncModelToState();
  }

  consolidateTimeSlots() {
    this.syncStateToModel();
    return this.model.consolidateTimeSlots();
  }

  async generateQRCode(canvasRef) {
    try {
      if (!this.state.currentUser) {
        alert('Please log in to generate attendance');
        return;
      }

      this.syncStateToModel();
      
      // Generate session ID
      this.model.generateSessionID();
      const qrCodeValue = this.model.generateQRCodeValue();

      // Create session data for main attendance table
      const sessionData = this.model.createSessionData();

      // Create attendance record for lecturer folder
      const attendanceRecord = this.model.createAttendanceRecord();

      // Save to Firebase using service
      const attendanceResult = await FirebaseService.createAttendanceSession(
        this.model.courseCode,
        this.model.selectedSection,
        this.model.sessionID,
        sessionData
      );

      if (!attendanceResult.success) {
        throw new Error(attendanceResult.error);
      }

      // Store in lecture folder structure
      const attendanceType = this.model.isExam ? 'exam' : 'class';
      const lecturePath = `users/lecturers/${this.model.currentUser.uid}/${attendanceType}/${this.model.courseCode}/section_${this.model.selectedSection}/${this.model.sessionID}`;
      
      const lectureResult = await FirebaseService.createLectureRecord(lecturePath, attendanceRecord);

      if (!lectureResult.success) {
        throw new Error(lectureResult.error);
      }

      // Update model and state
      this.model.setQRGenerated(true);
      this.syncModelToState();

      await nextTick();
      
      await this.renderQRCode(canvasRef, qrCodeValue);
      this.listenForStudents();

      console.log('Attendance record created successfully at:', lecturePath);
      
    } catch (error) {
      console.error('Error generating QR code and creating attendance record:', error);
      alert('Failed to generate attendance. Please try again.');
    }
  }

  // Solution 1: Add debugging to renderQRCode method
async renderQRCode(canvasRef, qrCodeValue) {
  console.log('renderQRCode called with:', { canvasRef, qrCodeValue });
  
  if (!canvasRef) {
    console.error('Canvas reference is null or undefined');
    return;
  }

  return new Promise((resolve, reject) => {
    QRCode.toCanvas(canvasRef, qrCodeValue, {
      width: 400,
      color: { dark: "#32cd32", light: "#000000" }
    }, (error) => {
      if (error) {
        console.error('QRCode generation error:', error);
        reject(error);
        return;
      }

      console.log('QR Code generated successfully');
      
      // Add image to the center of the QR Code
      const canvas = canvasRef;
      const ctx = canvas.getContext("2d");
      
      console.log('Canvas dimensions:', canvas.width, canvas.height);
      
      const img = new Image();
      img.src = require('@/assets/mm.png');
      
      img.onload = function () {
        console.log('Image loaded successfully');
        const newWidth = 160;
        const newHeight = 70;
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;
        ctx.drawImage(img, x, y, newWidth, newHeight);
        console.log('Image drawn on canvas');
        resolve();
      };
      
      img.onerror = function(error) {
        console.error('Image loading failed:', error);
        // Still resolve since QR code was generated successfully
        resolve();
      };
      
      // Add timeout in case image doesn't load
      setTimeout(() => {
        if (!img.complete) {
          console.warn('Image loading timeout, proceeding without image');
          resolve();
        }
      }, 5000);
    });
  });
}

  listenForStudents() {
    const callback = async (snapshot) => {
      if (snapshot.exists()) {
        const students = Object.values(snapshot.val());
        this.model.updateStudentsList(students);
        this.state.studentsList = [...students];
        
        if (this.state.currentUser) {
          const attendanceType = this.state.isExam ? 'exam' : 'class';
          const lecturePath = `users/lecturers/${this.state.currentUser.uid}/${attendanceType}/${this.state.courseCode}/section_${this.state.selectedSection}/${this.state.sessionID}`;
          
          const updates = {
            [`${lecturePath}/totalStudentsScanned`]: students.length,
            [`${lecturePath}/studentsData`]: snapshot.val(),
            [`${lecturePath}/lastUpdated`]: new Date().toISOString()
          };
          
          const result = await FirebaseService.updateLectureRecord(updates);
          if (!result.success) {
            console.error('Error updating student data in lecture folder:', result.error);
          }
        }
      } else {
        this.model.updateStudentsList([]);
        this.state.studentsList = [];
      }
    };

    FirebaseService.listenToStudents(
      this.state.courseCode,
      this.state.selectedSection,
      this.state.sessionID,
      callback
    );
  }

  async endAttendance() {
    if (!this.state.sessionID || !this.state.currentUser) return;

    try {
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

      // Expire the main attendance session
      const expireResult = await FirebaseService.expireAttendanceSession(
        this.state.courseCode,
        this.state.selectedSection,
        this.state.sessionID
      );

      if (!expireResult.success) {
        throw new Error(expireResult.error);
      }

      // Update lecturer record
      const attendanceType = this.state.isExam ? 'exam' : 'class';
      const lecturePath = `users/lecturers/${this.state.currentUser.uid}/${attendanceType}/${this.state.courseCode}/section_${this.state.selectedSection}/${this.state.sessionID}`;
      
      const updates = {
        [`${lecturePath}/sessionActive`]: false,
        [`${lecturePath}/sessionEndTime`]: endTimestamp,
        [`${lecturePath}/sessionEndTimeFormatted`]: endTime,
        [`${lecturePath}/qrCodeExpired`]: true,
        [`${lecturePath}/lastUpdated`]: endTimestamp,
        [`${lecturePath}/finalStudentCount`]: this.state.studentsList.length
      };

      const updateResult = await FirebaseService.updateLectureRecord(updates);

      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Update model and state
      this.model.resetQRState();
      this.syncModelToState();
      
      alert(`${this.state.isExam ? 'Exam' : 'Class'} attendance session ended. QR Code is now expired.`);
      
    } catch (error) {
      console.error('Error ending attendance session:', error);
      alert('Error ending session. Please try again.');
    }
  }

  toggleInfo() {
    this.model.toggleInfo();
    this.state.showInfo = this.model.showInfo;
  }

  closeInfo() {
    this.model.closeInfo();
    this.state.showInfo = this.model.showInfo;
  }
}