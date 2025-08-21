import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  School as SchoolIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';

const TranscriptGenerator = ({ open, onClose, studentData }) => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  // Mock transcript data - in real app, fetch from API
  const transcriptData = {
    student: {
      id: studentData?.id || user?.id || '2024001',
      name: studentData?.name || user?.name || 'John Doe',
      email: studentData?.email || user?.email || 'john.doe@university.edu',
      program: studentData?.program || 'Bachelor of Computer Science',
      year: studentData?.year || '4th Year',
      gpa: studentData?.gpa || '3.75',
      totalCredits: studentData?.totalCredits || 120,
      status: studentData?.status || 'Active'
    },
    courses: [
      {
        semester: 'Fall 2023',
        courses: [
          { code: 'CS301', name: 'Data Structures', credits: 3, grade: 'A', points: 4.0 },
          { code: 'CS302', name: 'Algorithms', credits: 3, grade: 'A-', points: 3.7 },
          { code: 'MATH201', name: 'Calculus II', credits: 4, grade: 'B+', points: 3.3 },
          { code: 'ENG201', name: 'Technical Writing', credits: 2, grade: 'A', points: 4.0 }
        ]
      },
      {
        semester: 'Spring 2024',
        courses: [
          { code: 'CS401', name: 'Software Engineering', credits: 3, grade: 'A', points: 4.0 },
          { code: 'CS402', name: 'Database Systems', credits: 3, grade: 'B+', points: 3.3 },
          { code: 'CS403', name: 'Web Development', credits: 3, grade: 'A-', points: 3.7 },
          { code: 'STAT301', name: 'Statistics', credits: 3, grade: 'B', points: 3.0 }
        ]
      }
    ]
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATIONAL ERP SYSTEM', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('Official Academic Transcript', pageWidth / 2, 45, { align: 'center' });

      // Student Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Information', margin, 70);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${transcriptData.student.name}`, margin, 85);
      doc.text(`Student ID: ${transcriptData.student.id}`, margin, 95);
      doc.text(`Email: ${transcriptData.student.email}`, margin, 105);
      doc.text(`Program: ${transcriptData.student.program}`, margin, 115);
      doc.text(`Year: ${transcriptData.student.year}`, margin, 125);
      doc.text(`Status: ${transcriptData.student.status}`, margin, 135);

      // Academic Summary
      doc.setFont('helvetica', 'bold');
      doc.text('Academic Summary', margin, 155);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Cumulative GPA: ${transcriptData.student.gpa}`, margin, 170);
      doc.text(`Total Credits: ${transcriptData.student.totalCredits}`, margin, 180);

      let yPosition = 200;

      // Course History
      transcriptData.courses.forEach((semesterData, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(semesterData.semester, margin, yPosition);
        yPosition += 15;

        // Create table data
        const tableData = semesterData.courses.map(course => [
          course.code,
          course.name,
          course.credits.toString(),
          course.grade,
          course.points.toFixed(1)
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Course Code', 'Course Name', 'Credits', 'Grade', 'Points']],
          body: tableData,
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [102, 126, 234] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`transcript_${transcriptData.student.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating transcript. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const calculateSemesterGPA = (courses) => {
    const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6">Academic Transcript</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ p: 2 }}>
          {/* Student Info Header */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {transcriptData.student.name}
                </Typography>
                <Typography variant="body1">
                  Student ID: {transcriptData.student.id}
                </Typography>
                <Typography variant="body1">
                  Program: {transcriptData.student.program}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Typography variant="h4" gutterBottom>
                  {transcriptData.student.gpa}
                </Typography>
                <Typography variant="body1">
                  Cumulative GPA
                </Typography>
                <Typography variant="body2">
                  {transcriptData.student.totalCredits} Credits
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Course History */}
          {transcriptData.courses.map((semesterData, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {semesterData.semester}
              </Typography>
              
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Course Code</strong></TableCell>
                      <TableCell><strong>Course Name</strong></TableCell>
                      <TableCell align="center"><strong>Credits</strong></TableCell>
                      <TableCell align="center"><strong>Grade</strong></TableCell>
                      <TableCell align="center"><strong>Points</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {semesterData.courses.map((course, courseIndex) => (
                      <TableRow key={courseIndex}>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell align="center">{course.credits}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {course.grade}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{course.points.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
                Semester GPA: {calculateSemesterGPA(semesterData.courses)}
              </Typography>
              
              {index < transcriptData.courses.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={generatePDF}
          disabled={generating}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          {generating ? 'Generating...' : 'Download PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranscriptGenerator;
