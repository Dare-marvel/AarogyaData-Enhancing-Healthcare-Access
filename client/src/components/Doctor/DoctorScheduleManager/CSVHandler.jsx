import React, { useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  Heading,
  HStack,
  Icon,
  Link
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import Papa from 'papaparse';
import { FaUpload } from 'react-icons/fa';

const CSVHandler = () => {
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'text/csv') {
      toast({
        title: 'Error',
        description: 'Please upload a CSV file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Skip empty rows
      complete: async (results) => {
        // Validate CSV structure
        const requiredHeaders = ['date', 'venue', 'startTime', 'endTime', 'status', 'patientId'];
        const headers = Object.keys(results.data[0]);
        const hasAllHeaders = requiredHeaders.every(header => headers.includes(header));

        if (!hasAllHeaders) {
          toast({
            title: 'Invalid CSV Format',
            description: `CSV must contain ${requiredHeaders.join(', ')}`,
            status: 'error',
            duration: 4000,
          });
          return;
        }

        try {
          const response = await fetch('http://localhost:5000/api/doctor/schedule/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token,
            },
            body: JSON.stringify({ scheduleData: results.data }),
          });

          if (response.ok) {
            toast({
              title: 'Success',
              description: 'Schedule imported successfully',
              status: 'success',
              duration: 3000,
            });
          } else {
            throw new Error('Import failed');
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to import schedule',
            status: 'error',
            duration: 3000,
          });
        }
      },
      error: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to parse CSV file',
          status: 'error',
          duration: 3000,
        });
      },
    });
  };


  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctor/schedule/export', {
        headers: {
          'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      // Convert data to CSV
      const csv = Papa.unparse(data);

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `schedule_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Schedule exported successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export schedule',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        date: '2024-12-01',
        venue: 'Health Clinic A',
        startTime: '2024-12-01T09:00:00.000Z',
        endTime: '2024-12-01T09:30:00.000Z',
        status: 'available',
        patientId: ''
      },
      {
        date: '',
        venue: '',
        startTime: '2024-12-01T09:30:00.000Z',
        endTime: '2024-12-01T10:00:00.000Z',
        status: 'available',
        patientId: ''
      },
      {
        date: '',
        venue: '',
        startTime: '2024-12-01T10:00:00.000Z',
        endTime: '2024-12-01T10:30:00.000Z',
        status: 'scheduled',
        patientId: '6715e55625042771d8981eb8'
      },
      {
        date: '2024-12-02',
        venue: 'Clinic B',
        startTime: '2024-12-02T11:00:00.000Z',
        endTime: '2024-12-02T11:30:00.000Z',
        status: 'available',
        patientId: ''
      },
      {
        date: '',
        venue: '',
        startTime: '2024-12-02T11:30:00.000Z',
        endTime: '2024-12-02T12:00:00.000Z',
        status: 'scheduled',
        patientId: '6715e55625042771d8981eb8'
      },
      {
        date: '',
        venue: '',
        startTime: '2024-12-02T12:00:00.000Z',
        endTime: '2024-12-02T12:30:00.000Z',
        status: 'available',
        patientId: ''
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'schedule_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Box bg="white" p={6} rounded="md" shadow="md" mt={1}>
      <VStack spacing={6} align="stretch">
        <Heading fontSize="2xl" fontWeight="bold" color="teal.600">Import/Export Schedule</Heading>

        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">Import Schedule from CSV</Text>
            <Text fontSize="sm" color="gray.600">
              Upload a CSV file with columns: date, time, venue, and isBooked
            </Text>
            <HStack>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                display="none"
                onChange={handleFileUpload}
                id="csv-upload"
              />
              <Button
                as="label"
                htmlFor="csv-upload"
                leftIcon={<Icon as={FaUpload} />}
                colorScheme="blue"
                cursor="pointer"
              >
                Choose File
              </Button>
              <Link onClick={handleDownloadTemplate} color="blue.500">
                Download Template
              </Link>
            </HStack>
          </VStack>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">Export Current Schedule</Text>
            <Text fontSize="sm" color="gray.600">
              Download your current schedule as a CSV file
            </Text>
            <Button
              leftIcon={<Icon as={DownloadIcon} />}
              colorScheme="green"
              onClick={handleExport}
            >
              Export to CSV
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default CSVHandler;