import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import AuthComponent from './pages/AuthenticationComponent';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import PatientDashboard from './pages/Patient/PatientDashboard';
import PharmacistDashboard from './pages/Pharmacist/PharmacistDashboard';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/AboutUs';
import VoiceAssistant from './components/VoiceAssistant';
import MedicalNews from './pages/MedicalNews';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user info in localStorage when the app loads
    const user = JSON.parse(localStorage.getItem('userInfo'));

    if (user?.token && user?.role) {
      // If we're at the root path, redirect based on role
      if (window.location.pathname === '/') {
        switch (user.role) {
          case 'doctor':
            navigate('/doctor/profile');
            break;
          case 'patient':
            navigate('/patient/profile');
            break;
          case 'pharmacist':
            navigate('/pharmacist/profile');
            break;
          default:
            break;
        }
      }
    }
  }, [navigate]);

  return (
    <Box>
      <Navbar />
      <Box p={4}>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="/about" element={<About />} />
          <Route path="/medical_news" element={<MedicalNews />} />

          {/* Home route with authentication check */}
          <Route path="/" element={
            <AuthenticatedRedirect>
              <Home />
            </AuthenticatedRedirect>
          } />

          {/* Protected routes */}
          <Route path="/doctor/*" element={
            <PrivateRoute role="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          } />
          <Route path="/patient/*" element={
            <PrivateRoute role="patient">
              <PatientDashboard />
            </PrivateRoute>
          } />
          <Route path="/pharmacist/*" element={
            <PrivateRoute role="pharmacist">
              <PharmacistDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Box>
      {JSON.parse(localStorage.getItem('userInfo')) && <Box p={10}>
        <VoiceAssistant />
      </Box>}

    </Box>
  );
}

// New component to handle authenticated user redirection
function AuthenticatedRedirect({ children }) {
  const user = JSON.parse(localStorage.getItem('userInfo'));

  if (user?.token && user?.role) {
    const redirectPath = `/${user.role}/profile`;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default App;