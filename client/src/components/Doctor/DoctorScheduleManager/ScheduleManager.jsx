// components/DoctorSchedule.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Select,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  useToast,
  Badge,
  Grid,
  useColorModeValue,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Container,
  Heading
} from '@chakra-ui/react';
import axios from 'axios';
import moment from 'moment';
import { formatDate, formatTime } from '../../../utils/dateTimeUtils';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    startTime: '',
    endTime: '',
    venue: ''
  });

  // For Schedule filtering
  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const [searchVenue, setSearchVenue] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of rows per page

  // Pagination functions
  const getCurrentPageData = (data) =>
    data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const nextPage = (data) => {
    if (currentPage < totalPages(data)) setCurrentPage((prev) => prev + 1);
  };

  const getAuthHeaders = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return {
      headers: {
        'x-auth-token': userInfo?.token
      }
    };
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/doctor/schedules',
        getAuthHeaders()
      );
      setSchedules(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching schedules',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    let filtered = [...schedules];

    // Filter by venue search
    if (searchVenue) {
      filtered = filtered.filter(schedule =>
        schedule.venue.toLowerCase().includes(searchVenue.toLowerCase())
      );
    }

    // Filter by specific date
    if (selectedDate) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const selectedDateObj = new Date(selectedDate);
        return scheduleDate.toISOString().split('T')[0] === selectedDate;
      });
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const today = new Date();
      const ranges = {
        '7days': 7,
        '30days': 30,
        '1year': 365
      };

      const daysAgo = new Date();
      daysAgo.setDate(today.getDate() - ranges[dateRange]);

      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= daysAgo && scheduleDate <= today;
      });
    }

    setFilteredSchedules(filtered);
  }, [searchVenue, selectedDate, dateRange, schedules]);

  const handleAddSchedule = async () => {
    try {
      // Validate inputs
      if (!newSchedule.date || !newSchedule.startTime || !newSchedule.endTime || !newSchedule.venue) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all fields',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Validate time order
      const startMoment = moment(`${newSchedule.date} ${newSchedule.startTime}`);
      const endMoment = moment(`${newSchedule.date} ${newSchedule.endTime}`);

      if (!startMoment.isBefore(endMoment)) {
        toast({
          title: 'Time Error',
          description: 'End time must be after start time',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setLoading(true);

      // Format date to YYYY-MM-DD
      const formattedDate = moment(newSchedule.date).format('YYYY-MM-DD');

      await axios.post(
        'http://localhost:5000/api/doctor/add-schedule',
        {
          ...newSchedule,
          date: formattedDate,
          // Ensure time is in HH:mm format
          startTime: moment(newSchedule.startTime, 'HH:mm').format('HH:mm'),
          endTime: moment(newSchedule.endTime, 'HH:mm').format('HH:mm'),
        },
        getAuthHeaders()
      );

      toast({
        title: 'Schedule added',
        status: 'success',
        duration: 3000,
      });

      setNewSchedule({
        date: '',
        startTime: '',
        endTime: '',
        venue: ''
      });

      await fetchSchedules();
    } catch (error) {
      toast({
        title: 'Error adding schedule',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotAction = async (scheduleId, slotId, action, patientId) => {
    try {
      setLoading(true);
      if (action === 'delete') {
        await axios.put(
          'http://localhost:5000/api/doctor/update-slot',
          {
            slotId,    // The MongoDB ObjectId of the specific slot
            status: 'cancelled',
            patientId: patientId
          },
          getAuthHeaders()
        );
        await fetchSchedules();
      } else if (action === 'view-patient') {
        window.location.href = `http://localhost:5173/doctor/my_patients?patientId=${patientId}`;
      }
    } catch (error) {
      toast({
        title: 'Error performing action',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };


  const getSlotStatus = (slot) => {
    if (moment(slot.endTime).isBefore(moment())) {
      return 'completed';
    }
    return slot.status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  return (
    <Box p={2} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="lg" boxShadow="md">
        <Text fontSize="2xl" fontWeight="bold" color="teal.600">Doctor Schedule Management</Text>

        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Input
            type="date"
            value={newSchedule.date}
            onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
            placeholder="Select Date"
            // Force date format
            min={moment().format('YYYY-MM-DD')}
          />
          <Input
            type="time"
            value={newSchedule.startTime}
            onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
            placeholder="Start Time (HH:mm)"
          />
          <Input
            type="time"
            value={newSchedule.endTime}
            onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
            placeholder="End Time (HH:mm)"
          />
          <Input
            value={newSchedule.venue}
            onChange={(e) => setNewSchedule({ ...newSchedule, venue: e.target.value })}
            placeholder="Venue"
          />
        </Grid>

        <Button
          colorScheme="teal"
          onClick={handleAddSchedule}
          isLoading={loading}
        >
          Add Time Slot
        </Button>

        <HStack spacing={4} mb={1} align="flex-end">
          {/* Search by venue */}
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Venue</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch />
              </InputLeftElement>
              <Input
                placeholder="Search by venue"
                value={searchVenue}
                onChange={(e) => setSearchVenue(e.target.value)}
                borderColor={borderColor}
              />
            </InputGroup>
          </Box>

          {/* Date picker */}
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Date</Text>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              borderColor={borderColor}
            />
          </Box>

          {/* Date range filter */}
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Time Period</Text>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              borderColor={borderColor}
            >
              <option value="all">All Schedules</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="1year">Last Year</option>
            </Select>
          </Box>
        </HStack>
        {filteredSchedules.length === 0 ? (
          <Text textAlign="center" color="gray.500">No schedules found</Text>
        ) : (
          <Box>

            <Accordion allowMultiple>
              {filteredSchedules.map((schedule) => (
                <AccordionItem key={schedule._id} border="1px" borderColor={borderColor} borderRadius="md" mb={2}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold">
                        {formatDate(schedule.date)} - {schedule.venue}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    {/* Table with sticky header, hover highlighting, and centered alignment */}
                    <Table variant="striped" size="sm" overflowX="auto" sx={{ borderCollapse: "separate" }}>
                      <Thead
                        position="sticky"
                        top={0}
                        bg="blue.100"
                        zIndex="1"
                        color="white !important"
                      >
                        <Tr>
                          <Th textAlign="center">Start Time</Th>
                          <Th textAlign="center">End Time</Th>
                          <Th textAlign="center">Status</Th>
                          <Th textAlign="center">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getCurrentPageData(schedule.slots).map((slot) => (
                          <Tr
                            key={slot._id}
                            _hover={{ bg: "gray.200" }}
                          >
                            <Td textAlign="center">{formatTime(slot.startTime)}</Td>
                            <Td textAlign="center">{formatTime(slot.endTime)}</Td>
                            <Td textAlign="center">
                              <Badge
                                colorScheme={
                                  getSlotStatus(slot) === "available"
                                    ? "green"
                                    : getSlotStatus(slot) === "scheduled"
                                      ? "blue"
                                      : getSlotStatus(slot) === "completed"
                                        ? "gray"
                                        : "red"
                                }
                              >
                                {getSlotStatus(slot)}
                              </Badge>
                            </Td>
                            <Td textAlign="center">
                              {getSlotStatus(slot) === "scheduled" && (
                                <Button
                                  size="sm"
                                  colorScheme="teal"
                                  height={6}
                                  mr={2}
                                  onClick={() =>
                                    handleSlotAction(schedule._id, slot._id, "view-patient", slot.patientId)
                                  }
                                  isLoading={loading}
                                >
                                  View Patient
                                </Button>
                              )}
                              {(getSlotStatus(slot) === "available" ||
                                getSlotStatus(slot) === "cancelled") && (
                                  <Button
                                    size="sm"
                                    height={6}
                                    colorScheme="red"
                                    onClick={() => handleSlotAction(schedule._id, slot._id, "delete")}
                                    isLoading={loading}
                                  >
                                    Delete Slot
                                  </Button>
                                )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {/* Pagination */}
                    <Box mt={4} display="flex" justifyContent="center" alignItems="center">
                      <Button size="sm" onClick={prevPage} isDisabled={currentPage === 1}>
                        Previous
                      </Button>
                      <Text mx={4}>
                        Page {currentPage} of {totalPages(schedule.slots)}
                      </Text>
                      <Button size="sm" onClick={() => nextPage(schedule.slots)} isDisabled={currentPage === totalPages(schedule.slots)}>
                        Next
                      </Button>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default DoctorSchedule;