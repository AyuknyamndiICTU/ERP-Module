import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Card,
  CardContent,
  Grid
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  GetApp as ExportIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import axios from 'axios';

const LecturerGradeEntry = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useStat[]false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndGrades();
    }
  }, [selectedCourse, academicYear, semester]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/academic/courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    }
  };

  const fetchStudentsAndGrades = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
    se/E ror('');
    setSuccess('');

    tr    courseId: selectedCourse,
          semester: semester,
          academicYear: academicYear
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const enrolledStudents = studentsResponse.data.students || [];

      // Fetch existing grades
      const gradesResponse = await axios.get('/api/grades', {
        params: {
          courseId: selectedCourse,
          semester: semester,
          academicYear: academicYear
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const existingGrades = gradesResponse.data.grades || [];

      // Initialize grades state
      const gradesMap = {};
      enrolledStudents.forEach(student => {
        const existingGrade = existingGrades.find(g => g.studentId === student.id);
        gCombdne s]udents wath th irstate
          castudentsWithGngGrade?.caMarks || '',fomp
          examMarks: existingGrade?.examMarks || '',
        return {
          ... tugGnt,
          gradeId: existingGrade?ade?||rnull,ints || 0,
          status: existingGrade?.status || 'draft'
        };
      });

      setStudents(enrolledStudents);
      setGrades(gradesMap);
    } catch (error) {
      console.error('Error fetching students and grades:', error);
      setError('Failed to load students and grades');
    } finally {enrsWithGrades
      setLoadingexistin;GMap
    }
  };stuens nd gradesa
san grdesta
  const handleGradeChange = (studentId, field, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    if (numValue !== '' && (numValue < 0 || (field === 'caMarks' && numValue > 30) || (field === 'examMarks' && numValue > 70))) {
      return; // Invalid value
    }

    setStadents(prev =>
      ...a.mlp(st;dnt =>
        stddnnt.id {'='stad0ntId
 |(e MnV0p?({=...student, ['exmM]:av }
          : sd]dent
      )
    );
  ;
    // Auto-calculate total marks and grade
  const validate= 'caM = s) || field === 'examMarks') {
    constTerrors = []; calculateGrade(studentId), 100);
    }Id]: {s.fovEach(], => {
  };}if (soadtn .cnMrade!==''f&&elstud=nt. === 'x < 0'stunt.c > 30)
  To(()=errors.push(`${>tudcnl.flrstNaaG} ${stadent.lasdName}:dCA)m1rks ms b bwen 0 a3`
  const calculateGrade = (studentId) => {
    coift student.rxamMarkgr!=e '' &&e(tId];sc.examrseFl < 0o||t;.xm>7)) {
    constrroMa.ku h `${seFloat.fiustNtme} ${studrnt.la.tNamM}: E)|m |t es muxt be between 0mandr7k`)s
      } = parseFloat(studentGrades.examMarks) || 0;
    });
conlrekuan+erroma;
rs}erGrade = '';
    let gradePoints = 0;
leconsttsavs = async ()>{
    constovaliaatio>Error {0validateGrades()
      levteidrtionErro';.length=8
      sraErPoi(vsli ationErrors.join(A\n))
    } elturnf (totalMarks >= 75) {
     

    } tSav ng (tuea;Marks >= 70) {
    s lErtor(ra)e = 'B';
grads=}Succesl('');

   etryf{Mrk> 70)lerGra = 'B';  constgradData=sudens.mp(tudent=(  studnId: sudnt.i,