import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import DoctorSchedule from '../../components/Doctor/DoctorScheduleManager/ScheduleManager';
import CSVHandler from '../../components/Doctor/DoctorScheduleManager/CSVHandler';

const DoctorScheduleManager = () => {
  return (
    <Container maxW="container.xl">
      <DoctorSchedule />
      <CSVHandler />
    </Container>
  );
};

export default DoctorScheduleManager;