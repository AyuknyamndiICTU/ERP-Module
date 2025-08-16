import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  keyframes,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard, { GradientCard, FeatureCard, StatsCard } from '../../components/GlassCard';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const StudentsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock data for demonstration
  const mockStudents = [
    {
      id: 1,
      student_id: 'STU2024001',
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice.johnson@university.edu',
      phone: '+1-555-0123',
      date_of_birth: '2002-03-15',
      gender: 'female',
      enrollment_date: '2022-09-01',
      program_name: 'Computer Science',
      degree_type: 'Bachelor',
      year_level: 3,
      current_gpa: 3.75,
      enrolled_courses: 5,
      status: 'active',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701'
      },
      emergency_contact: {
        name: 'Mary Johnson',
        relationship: 'Mother',
        phone: '+1-555-0124'
      }
    },
    {
      id: 2,
      student_id: 'STU2024002',
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob.smith@university.edu',
      phone: '+1-555-0125',
      date_of_birth: '2001-07-22',
      gender: 'male',
      enrollment_date: '2021-09-01',
      program_name: 'Mathematics',
      degree_type: 'Bachelor',
      year_level: 4,
      current_gpa: 3.92,
      enrolled_courses: 4,
      status: 'active',
      address: {
        street: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zip: '62702'
      },
      emergency_contact: {
        name: 'John Smith',
        relationship: 'Father',
        phone: '+1-555-0126'
      }
    },
    {
      id: 3,
      student_id: 'STU2024003',
      first_name: 'Carol',
      last_name: 'Davis',
      email: 'carol.davis@university.edu',
      phone: '+1-555-0127',
      date_of_birth: '2003-11-08',
      gender: 'female',
      enrollment_date: '2023-09-01',
      program_name: 'English Literature',
      degree_type: 'Bachelor',
      year_level: 2,
      current_gpa: 3.58,
      enrolled_courses: 6,
      status: 'active',
      address: {
        street: '789 Pine St',
        city: 'Springfield',
        state: 'IL',
        zip: '62703'
      },
      emergency_contact: {
        name: 'Susan Davis',
        relationship: 'Mother',
        phone: '+1-555-0128'
      }
    },
    {
      id: 4,
      student_id: 'STU2024004',
      first_name: 'David',
      last_name: 'Wilson',
      email: 'david.wilson@university.edu',
      phone: '+1-555-0129',
      date_of_birth: '2002-05-14',
      gender: 'male',
      enrollment_date: '2022-09-01',
      program_name: 'Physics',
      degree_type: 'Bachelor',
      year_level: 3,
      current_gpa: 3.83,
      enrolled_courses: 5,
      status: 'active',
      address: {
        street: '321 Elm St',
        city: 'Springfield',
        state: 'IL',
        zip: '62704'
      },
      emergency_contact: {
        name: 'Robert Wilson',
        relationship: 'Father',
        phone: '+1-555-0130'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram = !selectedProgram || student.program_name === selectedProgram;
    const matchesYear = !selectedYear || student.year_level.toString() === selectedYear;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;

    return matchesSearch && matchesProgram && matchesYear && matchesStatus;
  });

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setStudentDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'graduated': return 'info';
      case 'suspended': return 'error';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.7) return '#10b981';
    if (gpa >= 3.0) return '#f59e0b';
    return '#ef4444';
  };

  const getYearLabel = (year) => {
    const labels = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior' };
    return labels[year] || `Year ${year}`;
  };

  const StudentCard = ({ student, index }) => (
    <FeatureCard
      sx={{
        animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
        cursor: 'pointer',
        height: '100%',
      }}
      onClick={() => handleStudentClick(student)}
    >
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                background: `linear-gradient(135deg, ${getGPAColor(student.current_gpa)}, ${getGPAColor(student.current_gpa)}dd)`,
                width: 48,
                height: 48,
                mr: 2,
                fontSize: '1.2rem',
                fontWeight: 700,
              }}
            >
              {student.first_name[0]}{student.last_name[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                {student.first_name} {student.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student.student_id}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={student.status}
            color={getStatusColor(student.status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="600">
                {student.program_name} - {getYearLabel(student.year_level)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GradeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                GPA: {student.current_gpa.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {student.enrolled_courses} Courses
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {student.email}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 6,
              borderRadius: 3,
              background: '#f3f4f6',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(student.current_gpa / 4.0) * 100}%`,
                height: '100%',
                background: getGPAColor(student.current_gpa),
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      </Box>
    </FeatureCard>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, animation: `${slideIn} 0.8s ease-out` }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 800,
            mb: 1,
          }}
        >
          Student Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage student records, enrollment, and academic progress
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PersonIcon />}
            color="primary"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
            }}
          >
            <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
              {students.length}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Total Students
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<SchoolIcon />}
            color="secondary"
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#ffffff',
              animation: `${fadeInUp} 0.6s ease-out 0.2s both`,
            }}
          >
            <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
              {students.filter(s => s.status === 'active').length}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Active Students
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<GradeIcon />}
            color="success"
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: '#ffffff',
              animation: `${fadeInUp} 0.6s ease-out 0.3s both`,
            }}
          >
            <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
              {(students.reduce((sum, s) => sum + s.current_gpa, 0) / students.length).toFixed(2)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Average GPA
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUpIcon />}
            color="warning"
            sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: '#ffffff',
              animation: `${fadeInUp} 0.6s ease-out 0.4s both`,
            }}
          >
            <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
              {students.filter(s => s.current_gpa >= 3.5).length}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Honor Students
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <GlassCard sx={{ mb: 4, animation: `${fadeInUp} 0.8s ease-out 0.5s both` }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{ minWidth: 120 }}
          >
            Filters
          </Button>

          {(user?.role === 'admin' || user?.role === 'academic_staff') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minWidth: 140,
              }}
            >
              Add Student
            </Button>
          )}
        </Box>
      </GlassCard>

      {/* Students Grid */}
      <Grid container spacing={3}>
        {filteredStudents.map((student, index) => (
          <Grid item xs={12} sm={6} lg={4} key={student.id}>
            <StudentCard student={student} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Program</InputLabel>
            <Select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              label="Program"
            >
              <MenuItem value="">All Programs</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="English Literature">English Literature</MenuItem>
              <MenuItem value="Physics">Physics</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Year Level</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Year Level"
            >
              <MenuItem value="">All Years</MenuItem>
              <MenuItem value="1">Freshman</MenuItem>
              <MenuItem value="2">Sophomore</MenuItem>
              <MenuItem value="3">Junior</MenuItem>
              <MenuItem value="4">Senior</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="graduated">Graduated</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="withdrawn">Withdrawn</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Student Details Dialog */}
      <Dialog
        open={studentDialogOpen}
        onClose={() => setStudentDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${getGPAColor(selectedStudent.current_gpa)}, ${getGPAColor(selectedStudent.current_gpa)}dd)`,
                      width: 56,
                      height: 56,
                      mr: 2,
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.student_id} • {selectedStudent.program_name}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={selectedStudent.status}
                  color={getStatusColor(selectedStudent.status)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab label="Personal Info" />
                <Tab label="Academic Record" />
                <Tab label="Contact Details" />
              </Tabs>

              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Basic Information
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Student ID:</strong> {selectedStudent.student_id}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Date of Birth:</strong> {new Date(selectedStudent.date_of_birth).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Gender:</strong> {selectedStudent.gender}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Enrollment Date:</strong> {new Date(selectedStudent.enrollment_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedStudent.address.street}<br />
                      {selectedStudent.address.city}, {selectedStudent.address.state} {selectedStudent.address.zip}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Emergency Contact
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>{selectedStudent.emergency_contact.name}</strong><br />
                      {selectedStudent.emergency_contact.relationship}<br />
                      {selectedStudent.emergency_contact.phone}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Academic Status
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Program:</strong> {selectedStudent.program_name}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Year Level:</strong> {getYearLabel(selectedStudent.year_level)}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Current GPA:</strong> {selectedStudent.current_gpa.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Enrolled Courses:</strong> {selectedStudent.enrolled_courses}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      GPA Progress
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Current GPA</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {selectedStudent.current_gpa.toFixed(2)}/4.0
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedStudent.current_gpa / 4.0) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#f3f4f6',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getGPAColor(selectedStudent.current_gpa),
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedStudent.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedStudent.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <LocationIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                      <Typography variant="body2">
                        {selectedStudent.address.street}<br />
                        {selectedStudent.address.city}, {selectedStudent.address.state} {selectedStudent.address.zip}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStudentDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Download Transcript
              </Button>
              {(user?.role === 'admin' || user?.role === 'academic_staff') && (
                <Button variant="contained" startIcon={<EditIcon />}>
                  Edit Student
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentsPage;
