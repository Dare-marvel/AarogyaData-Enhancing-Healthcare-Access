import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Box,
  Badge,
  Icon,
  Flex,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../../../utils/dateTimeUtils';
import { MdVisibility, MdCancel, MdPictureAsPdf, MdFileDownload } from 'react-icons/md';
import Papa from 'papaparse';

const statusColors = {
  scheduled: 'green',
  cancelled: 'red',
  completed: 'blue',
  available: 'gray',
};

const ITEMS_PER_PAGE = 5;

const AppointmentTable = ({ appointments, onCancel }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = appointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const exportToCSV = () => {
    const data = appointments.map((appointment) => ({
      doctor: appointment.doctorId?.username || 'N/A',
      date: formatDate(appointment.date),
      time: `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`,
      venue: appointment.venue,
      status: appointment.status,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTable = () => {
    const printContent = document.getElementById('appointment-table').outerHTML;
    const newWindow = window.open('', '_blank');
    newWindow.document.write('<html><head><title>Print Appointments</title></head><body>');
    newWindow.document.write(printContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
  };

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  return (
    <Box
      overflowX="auto"
      boxShadow="md"
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        '-ms-overflow-style': 'none', // IE and Edge
        'scrollbar-width': 'none', // Firefox
      }}
    >
      {/* Export & Print Options */}
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Flex gap={2}>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={MdFileDownload} />}
            variant="solid"
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
          <Button
            colorScheme="red"
            leftIcon={<Icon as={MdPictureAsPdf} />}
            variant="solid"
            onClick={printTable}
          >
            Export PDF
          </Button>
        </Flex>
        <Text fontWeight="semibold">
          Page {currentPage} of {totalPages}
        </Text>
      </Flex>

      {/* Appointment Table */}
      <Table variant="simple" size="md" bg="white" id="appointment-table">
        <Thead bg="blue.700">
          <Tr>
            <Th color="white">Doctor</Th>
            <Th color="white">Date</Th>
            <Th color="white">Time</Th>
            <Th color="white">Venue</Th>
            <Th color="white">Status</Th>
            <Th color="white">View Doctor</Th>
            <Th color="white">Cancel</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentItems.map((appointment) => (
            <Tr
              key={appointment._id}
              _hover={{ bg: 'gray.100', cursor: 'pointer' }}
              color="black"
            >
              <Td>Dr. {appointment.doctorId?.username || 'N/A'}</Td>
              <Td>{formatDate(appointment.date)}</Td>
              <Td>
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </Td>
              <Td>{appointment.venue}</Td>
              <Td>
                <Badge
                  colorScheme={statusColors[appointment.status]}
                  rounded="full"
                  px={2}
                >
                  {appointment.status}
                </Badge>
              </Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<Icon as={MdVisibility} />}
                  onClick={() => {
                    navigate(`/patient/appointments?id=${appointment.doctorId._id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls to the top smoothly
                  }}
                >
                  View Doctor
                </Button>
              </Td>
              <Td>
                {appointment.status === 'scheduled' && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<Icon as={MdCancel} />}
                    onClick={() => onCancel(appointment._id)}
                  >
                    Cancel
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Pagination Controls */}
      <Flex justifyContent="flex-end" mt={4} gap={2}>
        <Button
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default AppointmentTable;
