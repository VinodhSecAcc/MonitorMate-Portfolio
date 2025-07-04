import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ReportModel } from '@/model/report_model';

export const ReportViewModel = () => {
  // Initialize model
  const reportModel = new ReportModel();

  // Reactive variables
  const selectedType = ref('');
  const selectedCourseCode = ref('');
  const selectedSection = ref('');
  const selectedDate = ref('');
  const selectedTime = ref('');
  
  const courseCodes = ref([]);
  const sections = ref([]);
  const dates = ref([]);
  const times = ref([]);
  const reportData = ref([]);
  const selectedTimeSlot = ref('');
  
  const loading = ref(false);
  const loadingCourses = ref(false);
  const loadingSections = ref(false);
  const loadingDates = ref(false);
  const loadingTimes = ref(false);
  const generatingReport = ref(false);
  const reportGenerated = ref(false);

  // Computed properties
  const canGenerate = computed(() => {
    return selectedType.value && selectedCourseCode.value && 
           selectedSection.value && selectedDate.value && selectedTime.value;
  });

  const presentCount = computed(() => {
    return reportData.value.filter(student => student.isPresent).length;
  });

  const absentCount = computed(() => {
    return reportData.value.filter(student => !student.isPresent).length;
  });

  const totalCount = computed(() => {
    return reportData.value.length;
  });

  const selectedDateDisplay = computed(() => {
    const dateObj = dates.value.find(d => d.value === selectedDate.value);
    return dateObj ? dateObj.display : '';
  });

  const selectedTimeSlotDisplay = computed(() => {
    return selectedTimeSlot.value || 'Unknown';
  });

  // Event handlers
  const onTypeChange = async () => {
    selectedCourseCode.value = '';
    selectedSection.value = '';
    selectedDate.value = '';
    selectedTime.value = '';
    courseCodes.value = [];
    sections.value = [];
    dates.value = [];
    times.value = [];
    reportData.value = [];
    reportGenerated.value = false;
    selectedTimeSlot.value = '';

    if (selectedType.value) {
      await loadCourseCodes();
    }
  };

  const onCourseCodeChange = async () => {
    selectedSection.value = '';
    selectedDate.value = '';
    selectedTime.value = '';
    sections.value = [];
    dates.value = [];
    times.value = [];
    reportData.value = [];
    reportGenerated.value = false;
    selectedTimeSlot.value = '';

    if (selectedCourseCode.value) {
      await loadSections();
    }
  };

  const onSectionChange = async () => {
    selectedDate.value = '';
    selectedTime.value = '';
    dates.value = [];
    times.value = [];
    reportData.value = [];
    reportGenerated.value = false;
    selectedTimeSlot.value = '';

    if (selectedSection.value) {
      await loadDates();
    }
  };

  const onDateChange = async () => {
    selectedTime.value = '';
    times.value = [];
    reportData.value = [];
    reportGenerated.value = false;
    selectedTimeSlot.value = '';

    if (selectedDate.value) {
      await loadTimes();
    }
  };

  // Data loading functions
  const loadCourseCodes = async () => {
    loadingCourses.value = true;
    try {
      const result = await reportModel.loadCourseCodes(selectedType.value);
      if (result.success) {
        courseCodes.value = result.data;
      }
    } catch (error) {
      console.error('Error loading course codes:', error);
    } finally {
      loadingCourses.value = false;
    }
  };

  const loadSections = async () => {
    loadingSections.value = true;
    try {
      const result = await reportModel.loadSections(selectedType.value, selectedCourseCode.value);
      if (result.success) {
        sections.value = result.data;
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      loadingSections.value = false;
    }
  };

  const loadDates = async () => {
    loadingDates.value = true;
    try {
      const result = await reportModel.loadDates(selectedType.value, selectedCourseCode.value, selectedSection.value);
      if (result.success) {
        dates.value = result.data;
      }
    } catch (error) {
      console.error('Error loading dates:', error);
    } finally {
      loadingDates.value = false;
    }
  };

  const loadTimes = async () => {
    loadingTimes.value = true;
    try {
      const result = await reportModel.loadTimes(selectedType.value, selectedCourseCode.value, selectedSection.value, selectedDate.value);
      if (result.success) {
        times.value = result.data;
      }
    } catch (error) {
      console.error('Error loading times:', error);
    } finally {
      loadingTimes.value = false;
    }
  };

  const generateReport = async () => {
    generatingReport.value = true;
    try {
      const result = await reportModel.loadStudentsData(selectedType.value, selectedCourseCode.value, selectedSection.value, selectedTime.value);
      
      if (result.success) {
        reportData.value = result.data;
        selectedTimeSlot.value = result.timeSlot;
      } else {
        reportData.value = [];
        selectedTimeSlot.value = 'Unknown';
      }
      
      reportGenerated.value = true;
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      generatingReport.value = false;
    }
  };

  // Export functions
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(46, 204, 113);
      doc.text('Attendance Report', 20, 20);
      
      // Add report details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Type: ${selectedType.value.toUpperCase()}`, 20, 40);
      doc.text(`Course Code: ${selectedCourseCode.value}`, 20, 50);
      doc.text(`Section: ${selectedSection.value}`, 20, 60);
      doc.text(`Date: ${selectedDateDisplay.value}`, 20, 70);
      doc.text(`Time Slot: ${selectedTimeSlotDisplay.value}`, 20, 80);
      
      // Add statistics
      doc.text(`Present: ${presentCount.value} | Absent: ${absentCount.value} | Total: ${totalCount.value}`, 20, 100);
      
      // Prepare table data
      const tableData = reportData.value.map((student, index) => [
        index + 1,
        student.username,
        student.universityId,
        student.scanTimeFormatted || 'Not scanned',
        student.appUsage || 'No data',
        student.isPresent ? 'Present' : 'Absent'
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        head: [['#', 'Username', 'University ID', 'Scan Time', 'App Activity Usage', 'Status']],
        body: tableData,
        startY: 110,
        theme: 'grid',
        headStyles: {
          fillColor: [46, 204, 113],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 60 },
          5: { cellWidth: 20, halign: 'center' }
        }
      });
      
      // Save the PDF
      doc.save(`attendance_report_${selectedCourseCode.value}_${selectedDate.value}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF. Please try again.');
    }
  };

  const exportToCSV = () => {
    const headers = ['#', 'Username', 'University ID', 'Scan Time', 'App Activity Usage', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reportData.value.map((student, index) => [
        index + 1,
        student.username,
        student.universityId,
        student.scanTimeFormatted || 'Not scanned',
        `"${student.appUsage || 'No data'}"`,
        student.isPresent ? 'Present' : 'Absent'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedCourseCode.value}_${selectedDate.value}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Prepare data for Excel
      const reportInfo = [
        ['Attendance Report'],
        [''],
        ['Type:', selectedType.value.toUpperCase()],
        ['Course Code:', selectedCourseCode.value],
        ['Section:', selectedSection.value],
        ['Date:', selectedDateDisplay.value],
        ['Time Slot:', selectedTimeSlotDisplay.value],
        [''],
        ['Statistics:'],
        ['Present:', presentCount.value],
        ['Absent:', absentCount.value],
        ['Total:', totalCount.value],
        [''],
        ['Student Data:'],
        ['#', 'Username', 'University ID', 'Scan Time', 'App Activity Usage', 'Status']
      ];
      
      // Add student data
      reportData.value.forEach((student, index) => {
        reportInfo.push([
          index + 1,
          student.username,
          student.universityId,
          student.scanTimeFormatted || 'Not scanned',
          student.appUsage || 'No data',
          student.isPresent ? 'Present' : 'Absent'
        ]);
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(reportInfo);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // #
        { wch: 20 },  // Username
        { wch: 15 },  // University ID
        { wch: 15 },  // Scan Time
        { wch: 40 },  // App Activity Usage
        { wch: 10 }   // Status
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
      
      // Save the file
      XLSX.writeFile(wb, `attendance_report_${selectedCourseCode.value}_${selectedDate.value}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const exportToJSON = () => {
    const reportInfo = {
      type: selectedType.value,
      courseCode: selectedCourseCode.value,
      section: selectedSection.value,
      date: selectedDateDisplay.value,
      timeSlot: selectedTimeSlotDisplay.value,
      stats: {
        present: presentCount.value,
        absent: absentCount.value,
        total: totalCount.value
      },
      students: reportData.value
    };

    const blob = new Blob([JSON.stringify(reportInfo, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedCourseCode.value}_${selectedDate.value}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    // Reactive variables
    selectedType,
    selectedCourseCode,
    selectedSection,
    selectedDate,
    selectedTime,
    courseCodes,
    sections,
    dates,
    times,
    reportData,
    selectedTimeSlot,
    loading,
    loadingCourses,
    loadingSections,
    loadingDates,
    loadingTimes,
    generatingReport,
    reportGenerated,
    
    // Computed properties
    canGenerate,
    presentCount,
    absentCount,
    totalCount,
    selectedDateDisplay,
    selectedTimeSlotDisplay,
    
    // Event handlers
    onTypeChange,
    onCourseCodeChange,
    onSectionChange,
    onDateChange,
    generateReport,
    
    // Export functions
    exportToPDF,
    exportToCSV,
    exportToExcel,
    exportToJSON
  };
};