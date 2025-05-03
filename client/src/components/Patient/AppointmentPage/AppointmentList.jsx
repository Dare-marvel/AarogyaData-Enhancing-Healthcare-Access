import React, { useMemo, useState } from 'react';
import {
  Container,
  Text,
  Flex,
  Stack,
  Box,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { AuthState } from '../../../context/AuthContext';
import AppointmentTable from './AppointmentTable';
import AppointmentFilters from './AppointmentFilters';

const AppointmentList = ({ appointments, onAppointmentCancelled }) => {
  const { user } = AuthState();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const toast = useToast();

  const filteredAndSortedAppointments = useMemo(() => {
    if (!appointments) return [];

    return [...appointments]
      .filter(apt => {
        const matchesSearch =
          apt.doctorId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.venue.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [appointments, searchTerm, statusFilter, sortOrder]);

  const handleCancelAppointment = async (appointmentId) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const token = JSON.parse(userInfo).token;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/patients/cancel/${appointmentId}`,
        {},
        {
          headers: { 'x-auth-token': token }
        }
      );

      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been cancelled successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onAppointmentCancelled) {
        onAppointmentCancelled();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel appointment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={1}>
      <Stack spacing={6}>
        <AppointmentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {filteredAndSortedAppointments.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            h="200px"
            borderRadius="md"
            bg="gray.50"
          >
            <Text color="gray.500">No appointments found</Text>
          </Flex>
        ) : (
          <Box>
              <AppointmentTable
                appointments={filteredAndSortedAppointments}
                onCancel={handleCancelAppointment}
              />
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default AppointmentList;