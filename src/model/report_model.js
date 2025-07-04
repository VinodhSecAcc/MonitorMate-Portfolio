import { getAuth } from "firebase/auth";
import { FirebaseService } from "@/service/firebase_service";

export class ReportModel {
  constructor() {
    this.auth = getAuth();
  }

  // Utility functions
  parseSessionId(sessionId) {
    const parts = sessionId.split('_');
    if (parts.length >= 3) {
      const dateStr = parts[1];
      const timestamp = parseInt(parts[2]);
      
      const date = new Date(
        parseInt(dateStr.substr(0, 4)),
        parseInt(dateStr.substr(4, 2)) - 1,
        parseInt(dateStr.substr(6, 2))
      );
      
      const time = new Date(timestamp);
      
      return {
        date: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      };
    }
    return { date: 'Unknown', time: 'Unknown' };
  }

  formatScanTime(scanTime) {
    if (!scanTime) return null;
    
    const timeMatch = scanTime.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!timeMatch) return scanTime;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const seconds = timeMatch[3];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    
    const formattedHours = hours.toString().padStart(2, '0');
    
    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  }

  formatDuration(durationInMilliseconds) {
    const totalSeconds = Math.floor(durationInMilliseconds / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || result === '') result += `${seconds}s`;
    
    return result.trim();
  }

  getCurrentUserId() {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  // Data loading functions
  async loadCourseCodes(selectedType) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return { success: false, data: [] };

      const result = await FirebaseService.loadCourseCodes(userId, selectedType);
      return result;
    } catch (error) {
      console.error('Error loading course codes:', error);
      return { success: false, data: [] };
    }
  }

  async loadSections(selectedType, selectedCourseCode) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return { success: false, data: [] };

      const result = await FirebaseService.loadSections(userId, selectedType, selectedCourseCode);
      return result;
    } catch (error) {
      console.error('Error loading sections:', error);
      return { success: false, data: [] };
    }
  }

  async loadDates(selectedType, selectedCourseCode, selectedSection) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return { success: false, data: [] };

      const result = await FirebaseService.loadDates(userId, selectedType, selectedCourseCode, selectedSection);
      if (result.success) {
        const sessions = result.data;
        const dateMap = new Map();
        
        Object.keys(sessions).forEach(sessionId => {
          const parsed = this.parseSessionId(sessionId);
          const dateKey = sessionId.split('_')[1];
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, parsed.date);
          }
        });
        
        const dates = Array.from(dateMap.entries()).map(([value, display]) => ({
          value,
          display
        }));
        
        return { success: true, data: dates };
      }
      return result;
    } catch (error) {
      console.error('Error loading dates:', error);
      return { success: false, data: [] };
    }
  }

  async loadTimes(selectedType, selectedCourseCode, selectedSection, selectedDate) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return { success: false, data: [] };

      const result = await FirebaseService.loadTimes(userId, selectedType, selectedCourseCode, selectedSection);
      if (result.success) {
        const sessions = result.data;
        const timesArray = [];
        
        Object.keys(sessions).forEach(sessionId => {
          const dateKey = sessionId.split('_')[1];
          if (dateKey === selectedDate) {
            const parsed = this.parseSessionId(sessionId);
            timesArray.push({
              sessionId,
              display: parsed.time
            });
          }
        });
        
        return { success: true, data: timesArray };
      }
      return result;
    } catch (error) {
      console.error('Error loading times:', error);
      return { success: false, data: [] };
    }
  }

  async loadAppUsageData(selectedCourseCode, selectedSection, sessionId, studentUserId) {
    try {
      const result = await FirebaseService.loadAppUsageData(selectedCourseCode, selectedSection, sessionId, studentUserId);
      
      if (result.success && result.data) {
        const appData = result.data;
        const appUsages = [];
        
        Object.keys(appData).forEach(encodedAppName => {
          const appInfo = appData[encodedAppName];
          if (appInfo.appName && appInfo.duration) {
            const formattedDuration = this.formatDuration(appInfo.duration);
            appUsages.push(`${appInfo.appName}(${formattedDuration})`);
          }
        });
        
        return appUsages.length > 0 ? appUsages.join(', ') : 'No data';
      }
      
      return 'No data';
    } catch (error) {
      console.error('Error loading app usage data:', error);
      return 'Error loading data';
    }
  }

  async loadTimeSlot(selectedType, selectedCourseCode, selectedSection, sessionId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return { success: false, data: null };

      const result = await FirebaseService.loadTimeSlot(userId, selectedType, selectedCourseCode, selectedSection, sessionId);
      return result;
    } catch (error) {
      console.error('Error loading time slot:', error);
      return { success: false, data: null };
    }
  }

  async loadStudentsData(selectedType, selectedCourseCode, selectedSection, selectedTime) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return { success: false, data: null };

      // Load time slot
      const timeSlotResult = await this.loadTimeSlot(selectedType, selectedCourseCode, selectedSection, selectedTime);
      const timeSlot = timeSlotResult.success && timeSlotResult.data ? 
        timeSlotResult.data.scheduledTimeSlot || 'Unknown' : 'Unknown';

      const result = await FirebaseService.loadStudentsData(userId, selectedType, selectedCourseCode, selectedSection, selectedTime);
      
      if (result.success && result.data) {
        const studentsData = result.data;
        const students = [];
        
        // Process each student and load their app usage data
        for (const studentUserId of Object.keys(studentsData)) {
          const student = studentsData[studentUserId];
          const appUsage = await this.loadAppUsageData(selectedCourseCode, selectedSection, selectedTime, studentUserId);
          
          students.push({
            userId: studentUserId,
            username: student.username || 'Unknown',
            universityId: student.universityId || 'Unknown',
            scanTime: student.scanTime || null,
            scanTimeFormatted: this.formatScanTime(student.scanTime),
            appUsage: appUsage,
            isPresent: !!student.scanTime
          });
        }
        
        const sortedStudents = students.sort((a, b) => a.username.localeCompare(b.username));
        
        return { 
          success: true, 
          data: sortedStudents,
          timeSlot: timeSlot
        };
      } else {
        return { 
          success: true, 
          data: [],
          timeSlot: timeSlot
        };
      }
    } catch (error) {
      console.error('Error loading students data:', error);
      return { success: false, data: [], timeSlot: 'Unknown' };
    }
  }
}