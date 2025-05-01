import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner,
  Center,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Badge
} from '@chakra-ui/react';
import { AuthState } from '../../context/AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaStethoscope,
  FaClock,
  FaUniversity,
  FaIdCard,
  FaEdit,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = AuthState();
  const toast = useToast();

  const displayFields = [
    { key: 'username', label: 'Full Name', icon: FaUser },
    { key: 'email', label: 'Email Address', icon: FaEnvelope },
    { key: 'specialization', label: 'Specialization', icon: FaStethoscope },
    { key: 'yearsOfExperience', label: 'Years of Experience', icon: FaClock },
    { key: 'college', label: 'Medical School', icon: FaUniversity },
    { key: 'licenseNumber', label: 'License Number', icon: FaIdCard }
  ];

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/doctor/profile', {
        method: 'GET',
        headers: {
          'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setDoctor(data);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch profile',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
        },
        body: JSON.stringify(doctor)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setDoctor(updatedData);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading profile...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <Text color="red.500" fontSize="lg">
          Error: {error}
        </Text>
      </Center>
    );
  }

  if (!doctor) {
    return (
      <Center h="400px">
        <Text color="gray.600" fontSize="lg">
          No profile data available
        </Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={2}>
      <Card shadow="lg" borderRadius="xl">
        <CardHeader>
          <HStack spacing={6} w="full" align="center" justify="space-between">
            <HStack spacing={4}>
              <Avatar
                size="lg"
                name={doctor.username}
                src={doctor.profileImage}
                bg="blue.500"
              />

              <VStack align="flex-start" spacing={2}>
                <Heading size="lg" color="blue.600">
                  Dr. {doctor.username}
                </Heading>

                <HStack>
                  <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                    <HStack spacing={1}>
                      <Icon as={MdVerified} />
                      <Text>Verified Doctor</Text>
                    </HStack>
                  </Badge>
                  <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                    {doctor.specialization}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>

            <Button
              leftIcon={isEditing ? <FaTimes /> : <FaEdit />}
              colorScheme={isEditing ? "red" : "blue"}
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              size="sm"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </Button>
          </HStack>
        </CardHeader>

        <Divider />

        <CardBody>
          <SimpleGrid columns={[1, null, 2]} spacing={8} px={4}>
            {displayFields.map(({ key, label, icon }) => (
              <FormControl key={key}>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={icon} color="blue.500" />
                    <Text>{label}</Text>
                  </HStack>
                </FormLabel>
                <Input
                  value={doctor[key] || ''}
                  onChange={(e) => setDoctor({ ...doctor, [key]: e.target.value })}
                  disabled={!isEditing}
                  bg={isEditing ? "white" : "gray.50"}
                  borderColor={isEditing ? "blue.200" : "gray.200"}
                  _hover={{
                    borderColor: isEditing ? "blue.300" : "gray.200"
                  }}
                  _disabled={{
                    opacity: 0.8,
                    cursor: "not-allowed"
                  }}
                />
              </FormControl>
            ))}
          </SimpleGrid>

          {isEditing && (
            <Box mt={8} textAlign="center">
              <Button
                leftIcon={<FaSave />}
                colorScheme="blue"
                onClick={handleSubmit}
                size="lg"
                shadow="md"
              >
                Save Changes
              </Button>
            </Box>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default DoctorProfile;