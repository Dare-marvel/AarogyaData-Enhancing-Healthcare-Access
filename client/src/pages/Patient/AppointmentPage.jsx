import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Heading,
  VStack,
  useToast,
  HStack,
  Button,
  Text,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import DoctorGrid from '../../components/Patient/AppointmentPage/DoctorGrid';
import AppointmentList from '../../components/Patient/AppointmentPage/AppointmentList';
import axios from 'axios';
import { AuthState } from '../../context/AuthContext';

const AppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const specialization = searchParams.get('specialization');
  const toast = useToast();
  const doctorsPerPage = 4;

  const { user } = AuthState();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        let url = 'http://localhost:5000/api/patients/doctors';
        

        // Add pagination parameters
        url += `?page=${currentPage}&limit=${doctorsPerPage}`;

        const response = await axios.get(url, {
          headers: { 'x-auth-token': user.token }
        });

        setDoctors(response.data.doctors);
        setTotalPages(Math.ceil(response.data.total / doctorsPerPage));
        
        if (response.data.doctors.length === 0) {
          toast({
            title: 'No doctors found',
            description: specialization 
              ? `No doctors found for the selected specialization(s)`
              : 'No doctors available',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({
          title: 'Error fetching doctors',
          description: error.response?.data?.message || error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients/patient', {
          headers: { 'x-auth-token': user.token }
        });
        setAppointments(response.data);
      } catch (error) {
        toast({
          title: 'Error fetching appointments',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (user?.token) {
      fetchDoctors();
      fetchAppointments();
    }
  }, [specialization, currentPage, toast, user]);

  const refreshAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients/patient', {
        headers: { 'x-auth-token': user.token }
      });
      setAppointments(response.data);
    } catch (error) {
      toast({
        title: 'Error refreshing appointments',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Container maxW="container.xl" py={1}>
      <VStack spacing={8} align="stretch">
        <Heading color={"teal.600"} size="lg">Book an Appointment</Heading>
        <DoctorGrid doctors={doctors} onAppointmentBooked={refreshAppointments} />
        
        {/* Pagination Controls */}
        <HStack justify="center" spacing={4}>
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          
          <Button
            rightIcon={<ChevronRightIcon />}
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>

        <Heading  color={"teal.600"} size="lg" mt={3}>Your Appointments</Heading>
        <AppointmentList appointments={appointments} onAppointmentCancelled={refreshAppointments} />
      </VStack>
    </Container>
  );
};

export default AppointmentPage;