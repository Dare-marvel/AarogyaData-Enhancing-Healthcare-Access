import React from 'react';
import {
  Box,
  IconButton,
  useDisclosure,
  VStack,
  Heading,
  Container,
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import { Routes, Route } from 'react-router-dom';
import ChatBot from '../../components/Patient/PatientDashboard/ChatBot';
import AppointmentPage from './AppointmentPage';
import PatientProfile from './PatientProfile';

function PatientDashboard() {
  const { isOpen, onToggle } = useDisclosure();

  const handleCollectPatientInfo = (patientInfo) => {
    console.log('Collected patient info:', patientInfo);
  };

  return (
    <Box position="relative" minH="100vh" bg="gray.50">
      <Container maxW="1200px" py={2}>
        <VStack spacing={6} align="stretch">

          <Routes>
            <Route
              path="appointments"
              element={<AppointmentPage />}
            />
            <Route
              path="profile"
              element={<PatientProfile />}
            />
          </Routes>
        </VStack>
      </Container>

      <Box position="fixed" bottom="4" right="4" zIndex="docked">
        {isOpen && (
          <ChatBot
            isOpen={isOpen}
            onCollectPatientInfo={handleCollectPatientInfo}
          />
        )}
        <IconButton
          icon={<ChatIcon />}
          isRound
          size="lg"
          onClick={onToggle}
          colorScheme="blue"
          boxShadow="lg"
        />
      </Box>
    </Box>
  );
}

export default PatientDashboard;