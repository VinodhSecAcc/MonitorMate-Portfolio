<template>
  <div class="report-generator">
    <navigation_bar />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    
    <div class="report-main">
      <div class="header-container">
        <h1 class="page-title">Generate Report</h1>
        <p class="page-subtitle">Select criteria to generate attendance reports</p>
      </div>

      <!-- Filter Section -->
      <div class="filter-container">
        <div class="filter-row">
          <!-- Class/Exam Selection -->
          <div class="filter-group">
            <label class="filter-label">Type</label>
            <select 
              v-model="selectedType" 
              @change="onTypeChange"
              class="filter-select"
              :disabled="loading"
            >
              <option value="">Select Type</option>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
            </select>
          </div>

          <!-- Course Code Selection -->
          <div class="filter-group">
            <label class="filter-label">Course Code</label>
            <select 
              v-model="selectedCourseCode" 
              @change="onCourseCodeChange"
              class="filter-select"
              :disabled="!selectedType || loadingCourses"
            >
              <option value="">Select Course Code</option>
              <option 
                v-for="course in courseCodes" 
                :key="course" 
                :value="course"
              >
                {{ course }}
              </option>
            </select>
          </div>

          <!-- Section Selection -->
          <div class="filter-group">
            <label class="filter-label">Section</label>
            <select 
              v-model="selectedSection" 
              @change="onSectionChange"
              class="filter-select"
              :disabled="!selectedCourseCode || loadingSections"
            >
              <option value="">Select Section</option>
              <option 
                v-for="section in sections" 
                :key="section" 
                :value="section"
              >
                Section {{ section }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-row">
          <!-- Date Selection -->
          <div class="filter-group">
            <label class="filter-label">Date</label>
            <select 
              v-model="selectedDate" 
              @change="onDateChange"
              class="filter-select"
              :disabled="!selectedSection || loadingDates"
            >
              <option value="">Select Date</option>
              <option 
                v-for="date in dates" 
                :key="date.value" 
                :value="date.value"
              >
                {{ date.display }}
              </option>
            </select>
          </div>

          <!-- Time Selection -->
          <div class="filter-group">
            <label class="filter-label">Time</label>
            <select 
              v-model="selectedTime" 
              class="filter-select"
              :disabled="!selectedDate || loadingTimes"
            >
              <option value="">Select Time</option>
              <option 
                v-for="time in times" 
                :key="time.sessionId" 
                :value="time.sessionId"
              >
                {{ time.display }}
              </option>
            </select>
          </div>

          <!-- Generate Button -->
          <div class="filter-group">
            <button 
              @click="generateReport"
              class="generate-btn"
              :disabled="!canGenerate || generatingReport"
            >
              <span v-if="generatingReport">Generating...</span>
              <span v-else>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Report Display Section -->
      <div v-if="reportData.length > 0" class="report-container">
        <div class="report-header">
          <div class="report-info">
            <h2>Attendance Report</h2>
            <div class="report-details">
              <span class="detail-item">{{ selectedType.toUpperCase() }}</span>
              <span class="detail-item">{{ selectedCourseCode }}</span>
              <span class="detail-item">Section {{ selectedSection }}</span>
              <span class="detail-item">{{ selectedDateDisplay }}</span>
              <span class="detail-item">{{ selectedTimeSlotDisplay }}</span>
            </div>
            <div class="report-stats">
              <span class="stat-item present">Present: {{ presentCount }}</span>
              <span class="stat-item absent">Absent: {{ absentCount }}</span>
              <span class="stat-item total">Total: {{ totalCount }}</span>
            </div>
          </div>
          
          <!-- Export Buttons -->
          <div class="export-buttons">
            <button @click="exportToPDF" class="export-btn pdf-btn">
              Export PDF
            </button>
            <button @click="exportToCSV" class="export-btn csv-btn">
              Export CSV
            </button>
            <button @click="exportToExcel" class="export-btn excel-btn">
              Export Excel
            </button>
            <button @click="exportToJSON" class="export-btn json-btn">
              Export JSON
            </button>
          </div>
        </div>

        <!-- Students Table -->
        <div class="table-container">
          <table class="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>University ID</th>
                <th>Scan Time</th>
                <th>App Activity Usage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(student, index) in reportData" 
                :key="student.userId"
                :class="{ 'present-row': student.isPresent, 'absent-row': !student.isPresent }"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ student.username }}</td>
                <td>{{ student.universityId }}</td>
                <td>{{ student.scanTimeFormatted || 'Not scanned' }}</td>
                <td class="app-usage-cell">{{ student.appUsage || 'No data' }}</td>
                <td>
                  <span 
                    class="status-badge" 
                    :class="student.isPresent ? 'present' : 'absent'"
                  >
                    {{ student.isPresent ? 'Present' : 'Absent' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-else-if="reportGenerated && reportData.length === 0" class="no-data">
        <p>No student data found for the selected criteria.</p>
      </div>
    </div>
  </div>
</template>

<script>
import navigation_bar from '@/components/navigation_bar.vue';
import { useHead } from '@vueuse/head';
import {ReportViewModel} from '@/viewmodel/report_viewmodel.js';


export default {
  components: {
    navigation_bar
  },
  setup() {
    useHead({
      title: 'Report - MonitorMate',
      meta: [{ name: 'description', content: 'This is a sample description' }]
    });

    // Use the ViewModel
    const viewModel = ReportViewModel();

    return {
      ...viewModel
    };
  }
};
</script>

<style scoped>
/* General Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%) !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.report-generator {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #0d4f3c 100%);
  padding-bottom: 50px;
}

.report-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.header-container {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  color: #2ecc71;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.page-subtitle {
  color: #d1d5db;
  font-size: 16px;
  opacity: 0.9;
}

/* Filter Section */
.filter-container {
  background: rgba(40, 40, 40, 0.95);
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(46, 204, 113, 0.2);
  margin-bottom: 30px;
}

.filter-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  display: block;
  color: #2ecc71;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.filter-select {
  width: 100%;
  padding: 12px 15px;
  background: rgba(20, 20, 20, 0.8);
  border: 2px solid rgba(46, 204, 113, 0.3);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #2ecc71;
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.3);
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Report Section */
.report-container {
  background: rgba(40, 40, 40, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(46, 204, 113, 0.2);
  overflow: hidden;
}

.report-header {
  padding: 25px;
  background: rgba(46, 204, 113, 0.1);
  border-bottom: 1px solid rgba(46, 204, 113, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.report-info h2 {
  color: #2ecc71;
  font-size: 24px;
  margin-bottom: 15px;
}

.report-details {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.detail-item {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.report-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-item {
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.stat-item.present {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.stat-item.absent {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.stat-item.total {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.export-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.export-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pdf-btn {
  background: #e74c3c;
}

.csv-btn {
  background: #f39c12;
}

.excel-btn {
  background: #27ae60;
}

.json-btn {
  background: #3498db;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Table */
.table-container {
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(46, 204, 113, 0.2);
}

.students-table td {
  padding: 12px 15px;
  color: #d1d5db;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.students-table tr:hover {
  background: rgba(46, 204, 113, 0.05);
}

.present-row {
  border-left: 4px solid #2ecc71;
}

.absent-row {
  border-left: 4px solid #e74c3c;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.present {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-badge.absent {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #d1d5db;
  font-size: 16px;
  background: rgba(40, 40, 40, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .report-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .export-buttons {
    justify-content: center;
  }
  
  .students-table {
    font-size: 14px;
  }
  
  .students-table th,
  .students-table td {
    padding: 10px 8px;
    text-align: left; /* Changed from center to left alignment */
  }
}
/* App usage cell specific styling */
.app-usage-cell {
  max-width: 200px;
  word-wrap: break-word;
  font-size: 12px;
  line-height: 1.4;
}

/* Responsive design updates for the new column */
@media (max-width: 768px) {
  .app-usage-cell {
    max-width: 150px;
    font-size: 11px;
  }
}

/* Table column width adjustments for better spacing */
.students-table th:nth-child(1),
.students-table td:nth-child(1) {
  width: 5%;
}

.students-table th:nth-child(2),
.students-table td:nth-child(2) {
  width: 20%;
}

.students-table th:nth-child(3),
.students-table td:nth-child(3) {
  width: 15%;
}

.students-table th:nth-child(4),
.students-table td:nth-child(4) {
  width: 15%;
}

.students-table th:nth-child(5),
.students-table td:nth-child(5) {
  width: 35%;
}

.students-table th:nth-child(6),
.students-table td:nth-child(6) {
  width: 10%;
}
</style>