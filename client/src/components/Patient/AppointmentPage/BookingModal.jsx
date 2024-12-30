import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  VStack,
  Select,
  useToast,
  Text,
  Box,
  Icon,
  HStack
} from '@chakra-ui/react';
import axios from 'axios';
import { AuthState } from '../../../context/AuthContext';
import { FaHospital, FaClock } from 'react-icons/fa';

const BookingModal = ({ isOpen, onClose, doctor, onAppointmentBooked }) => {
  const [schedule, setSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    startTime: '',
    endTime: '',
    id: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = AuthState();
  const toast = useToast();

  function formatTime(datetimeStr) {
    const datetimeObj = new Date(datetimeStr);
    const hours = datetimeObj.getUTCHours().toString().padStart(2, '0');
    const minutes = datetimeObj.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function formatDate(dateStr) {
    const dateObj = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    return dateObj.toLocaleDateString('en-US', options);
  }

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/doctor/schedule/${doctor._id}`, {
          headers: { 'x-auth-token': user.token }
        });
        // console.log('Schedule data:', response.data);
        setSchedule(response.data);
      } catch (error) {
        toast({
          title: 'Error fetching schedule',
          description: error.response?.data?.message || error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (isOpen && user?.token) {
      fetchSchedule();
    }

    setSelectedDate(null);
    setSelectedTime({ startTime: '', endTime: '', id: '' });
  }, [isOpen, doctor._id, toast, user]);

  useEffect(() => {
    if (schedule) {
      console.log('Available dates in schedule:', Object.keys(schedule));
    }
  }, [schedule]);

  const handleBooking = async (slotId) => {
    if (!selectedDate || !selectedTime.id) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select both date and time',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];

      await axios.post(
        'http://localhost:5000/api/patients/book',
        {
          doctorId: doctor._id,
          date: localDate,
          startTime: formatTime(selectedTime.startTime),
          endTime: formatTime(selectedTime.endTime),
          venue: schedule[localDate].venue,
          slotId: slotId
        },
        {
          headers: { 'x-auth-token': user.token }
        }
      );

      toast({
        title: 'Success',
        description: 'Appointment booked successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onAppointmentBooked();
      onClose();
    } catch (error) {
      toast({
        title: 'Error booking appointment',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const tileClassName = ({ date }) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    const todayDate = new Date().toISOString().split('T')[0];

    if (localDate === todayDate) {
      return 'today-date';
    }

    return schedule && schedule[localDate] ? 'available-date' : '';
  };

  const tileDisabled = ({ date }) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    return (
      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
      (schedule && !schedule[localDate])
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal.600" >Book Appointment with Dr. {doctor.username}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box
              width="100%"
              sx={{
                '.react-calendar': {
                  width: '100%',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                },
                '.react-calendar__tile--active': {
                  background: '#3182ce',
                  color: 'white',
                },
                '.today-date': {
                  backgroundColor: '#90CDF4 !important',
                  color: 'black !important',
                },
                '.available-date': {
                  backgroundColor: '#C6F6D5 !important',
                  color: 'black',
                },
                '.react-calendar__tile:enabled:hover': {
                  backgroundColor: '#4299e1',
                  color: 'red',
                },
                '.react-calendar__tile:disabled': {
                  backgroundColor: '#EDF2F7',
                  color: '#A0AEC0',
                },
              }}
            >
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                tileClassName={tileClassName}
                tileDisabled={tileDisabled}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                locale="en-US"
              />
            </Box>

            {selectedDate && schedule && (() => {
              const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
                .toISOString()
                .split('T')[0];

              return schedule[localDate] && (
                <>
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={4}
                    boxShadow="md"
                    borderColor="teal.200"
                  >
                    <VStack align="flex-start" spacing={4}>
                      <HStack>
                        <Icon as={FaHospital} mr={2} color="teal.400" />
                        <Text fontSize="lg" color="teal.700">
                          Venue: {schedule[localDate].venue}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaClock} mr={2} color="teal.400" />
                        <Text fontSize="lg" color="teal.700">
                          {formatTime(schedule[localDate].startTime)} - {formatTime(schedule[localDate].endTime)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                  <Select
                    placeholder="Select Time"
                    value={selectedTime?.startTime}
                    onChange={(e) => {
                      const selectedSlot = schedule[localDate].slots.find(
                        (slot) => slot.startTime === e.target.value
                      );
                      setSelectedTime({
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                        id: selectedSlot._id,
                      });
                    }}
                    bg="white" // Background color
                    borderColor="teal.300" // Border color
                    borderWidth="1px" // Border width
                    borderRadius="md" // Border radius
                    boxShadow="md" // Box shadow for depth
                    _hover={{ borderColor: "teal.400" }} // Hover state
                    _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }} // Focus state
                    icon={<Icon as={FaClock} color="teal.700" />} // Add an icon
                  >
                    {schedule[localDate].slots
                      .filter((slot) => slot.status === "available")
                      .map((slot) => (
                        <option key={slot.startTime} value={slot.startTime}>
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </option>
                      ))}
                  </Select>
                </>
              );
            })()}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => handleBooking(selectedTime?.id)}
            isLoading={loading}
            isDisabled={!selectedDate || !selectedTime.id}
          >
            Book Appointment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookingModal;