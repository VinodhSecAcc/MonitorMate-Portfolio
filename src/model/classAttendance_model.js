// AttendanceModel.js
export class AttendanceModel {
  constructor() {
    this.courseCode = "";
    this.selectedDate = "";
    this.selectedSection = "";
    this.selectedSlots = [];
    this.isExam = false;
    this.qrGenerated = false;
    this.sessionID = "";
    this.showInfo = false;
    this.qrButtonDisabled = false;
    this.studentsList = [];
    this.currentUser = null;
    
    // Static data
    this.sections = Array.from({ length: 9 }, (_, i) => i + 1);
    this.timeSlots = Array.from({ length: 24 }, (_, i) => {
      let hour = (i % 12) || 12;
      let period = i < 12 ? "AM" : "PM";
      let nextHour = ((i + 1) % 12) || 12;
      let nextPeriod = (i + 1) === 24 ? "AM" : (i + 1) < 12 ? "AM" : "PM";
      return `${hour}:00 ${period} - ${nextHour}:00 ${nextPeriod}`;
    });
  }

  // Validation methods
  isCourseCodeValid() {
    return /^[A-Z]{4}\d{4}$/.test(this.courseCode);
  }

  canGenerateQR() {
    return this.isCourseCodeValid() && 
           this.courseCode && 
           this.selectedDate && 
           this.selectedSection && 
           this.selectedSlots.length > 0;
  }

  // Data transformation methods
  formatCourseCode() {
    this.courseCode = this.courseCode.toUpperCase().replace(/\s+/g, "");
  }

  consolidateTimeSlots() {
    if (this.selectedSlots.length === 0) return "";
    
    const sortedSlots = [...this.selectedSlots].sort((a, b) => a - b);
    const startSlot = sortedSlots[0];
    const endSlot = sortedSlots[sortedSlots.length - 1] + 1;
    
    const startTime = this.timeSlots[startSlot].split(' - ')[0];
    
    let endTime;
    if (endSlot < this.timeSlots.length) {
      endTime = this.timeSlots[endSlot].split(' - ')[0];
    } else {
      endTime = "12:00 AM";
    }
    
    return `${startTime} - ${endTime}`;
  }

  formatScanTime(timeString) {
    if (!timeString) return '';
    
    try {
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      const date = new Date(timeString);
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      
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
      console.error('Error formatting time:', error);
      return timeString;
    }
  }

  // Time slot selection logic
  toggleTimeSlot(index) {
    if (this.selectedSlots.includes(index)) {
      const minSlot = Math.min(...this.selectedSlots);
      const maxSlot = Math.max(...this.selectedSlots);

      if (this.selectedSlots.length > 2 && index > minSlot && index < maxSlot) {
        this.selectedSlots = [];
      } else {
        this.selectedSlots = this.selectedSlots.filter(slot => slot !== index);
      }
    } 
    else if (this.selectedSlots.length === 0) {
      this.selectedSlots.push(index);
    } 
    else {
      const minSlot = Math.min(...this.selectedSlots);
      const maxSlot = Math.max(...this.selectedSlots);

      if (index < minSlot) {
        this.selectedSlots = [];
      } 
      else if (index === maxSlot + 1) {
        this.selectedSlots.push(index);
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
        this.selectedSlots = [];
      }
    }
  }

  // Generate session ID
  generateSessionID() {
    const formattedDate = this.selectedDate.replace(/-/g, "");
    this.sessionID = `session_${formattedDate}_${Date.now()}`;
    return this.sessionID;
  }

  // Create attendance data for tracking
  createAttendanceData() {
    return {
      courseCode: this.courseCode,
      section: this.selectedSection,
      date: this.selectedDate,
      timeSlot: this.consolidateTimeSlots(),
      isExam: this.isExam,
      sessionID: this.sessionID,
      students: this.studentsList,
      totalStudents: this.studentsList.length
    };
  }

  // Generate QR code value
  generateQRCodeValue() {
    return `${this.courseCode}/S${this.selectedSection}/${this.sessionID}`;
  }

  // Create attendance record for Firebase
  createAttendanceRecord() {
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

    return {
      courseCode: this.courseCode,
      section: this.selectedSection,
      sessionId: this.sessionID,
      attendanceType: this.isExam ? 'exam' : 'class',
      date: this.selectedDate,
      attendanceGeneratedTime: attendanceGeneratedTime,
      attendanceGeneratedTimestamp: currentTimestamp,
      timeSlot: consolidatedTimeSlot,
      selectedTimeSlots: [...this.selectedSlots],
      qrCode: this.generateQRCodeValue(),
      qrCodeExpired: false,
      sessionActive: true,
      sessionStartTime: currentTimestamp,
      sessionEndTime: null,
      totalStudentsScanned: 0,
      studentsData: {},
      createdBy: this.currentUser?.uid || '',
      createdByEmail: this.currentUser?.email || '',
      lastUpdated: currentTimestamp,
      academicInfo: {
        courseCode: this.courseCode,
        sectionNumber: this.selectedSection,
        sessionType: this.isExam ? 'examination' : 'lecture',
        scheduledDate: this.selectedDate,
        scheduledTimeSlot: consolidatedTimeSlot
      }
    };
  }

  // Create basic session data for Firebase attendance table
  createSessionData() {
    const consolidatedTimeSlot = this.consolidateTimeSlots();
    const currentTimestamp = new Date().toISOString();

    return {
      date: this.selectedDate,
      qrCode: this.generateQRCodeValue(),
      timestamp: currentTimestamp,
      timeSlot: consolidatedTimeSlot,
      isExam: this.isExam,
      students: {},
      expired: false
    };
  }

  // Update students list
  updateStudentsList(students) {
    this.studentsList = students;
  }

  // Toggle info visibility
  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  closeInfo() {
    this.showInfo = false;
  }

  // Reset QR state
  resetQRState() {
    this.qrGenerated = false;
    this.qrButtonDisabled = false;
  }

  // Set QR generated state
  setQRGenerated(generated) {
    this.qrGenerated = generated;
    this.qrButtonDisabled = generated;
  }
}