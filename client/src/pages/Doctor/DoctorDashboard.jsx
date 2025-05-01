import React from 'react';
import {
  VStack,
  Container,
} from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import DoctorProfile from './DoctorProfile'
import DoctorScheduleManager from './DoctorScheduleManager';
import MyPatients from './MyPatients';


function DoctorDashboard() {

  return (
    <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Routes>
            <Route
              path="profile"
              element={<DoctorProfile />}
            />
            <Route
              path="schedule_manager"
              element={<DoctorScheduleManager />}
            />
            <Route
              path="my_patients"
              element={<MyPatients />}
            />

            {/* Add more routes as needed */}
          </Routes>
        </VStack>

    </Container>
  );
}

export default DoctorDashboard;