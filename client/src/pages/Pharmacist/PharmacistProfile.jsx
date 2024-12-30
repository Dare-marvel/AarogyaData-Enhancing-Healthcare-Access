import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Stack,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  SimpleGrid,
  Flex
} from '@chakra-ui/react';
import {
  FaUser,
  FaEnvelope,
  FaBriefcaseMedical, 
  FaIdCard,
  FaClinicMedical,
  FaSave,
  FaTimes,
  FaEdit
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PharmacistProfile = () => {
  const [pharmacist, setPharmacist] = useState({
    username: '',
    email: '',
    yearsOfExperience: '',
    licenseNumber: '',
    pharmacy: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tempPharmacist, setTempPharmacist] = useState({});
  const toast = useToast();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const fetchPharmacistData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pharmacist/profile`, {
        headers: {
          'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
        }
      });
      setPharmacist(response.data);
      setTempPharmacist(response.data);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profile data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      if (error.response?.status === 401) {
        navigate('/auth');
      }
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempPharmacist(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempPharmacist({...pharmacist});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempPharmacist({...pharmacist});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/pharmacist/profile`, 
        tempPharmacist, 
        {
          headers: {
            'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
          }
        }
      );
      setPharmacist(response.data);
      setTempPharmacist(response.data);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg">
      <Card
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        shadow="lg"
      >
        <CardHeader>
          <Heading size="lg" textAlign="center" color="teal.500">
            Pharmacist Profile
          </Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaUser} color="teal.500" />
                    </InputLeftElement>
                    <Input
                      name="username"
                      value={isEditing ? tempPharmacist.username : pharmacist.username}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      focusBorderColor="teal.500"
                      bg={!isEditing ? 'gray.50' : 'white'}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaEnvelope} color="teal.500" />
                    </InputLeftElement>
                    <Input
                      name="email"
                      value={isEditing ? tempPharmacist.email : pharmacist.email}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      focusBorderColor="teal.500"
                      bg={!isEditing ? 'gray.50' : 'white'}
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <Flex width="100%" gap={4}>
                <FormControl flex="0 0 150px">
                  <FormLabel>Experience</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaBriefcaseMedical} color="teal.500" />
                    </InputLeftElement>
                    <Input
                      name="yearsOfExperience"
                      type="number"
                      value={isEditing ? tempPharmacist.yearsOfExperience : pharmacist.yearsOfExperience}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      focusBorderColor="teal.500"
                      bg={!isEditing ? 'gray.50' : 'white'}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel>Pharmacy</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaClinicMedical} color="teal.500" />
                    </InputLeftElement>
                    <Input
                      name="pharmacy"
                      value={isEditing ? tempPharmacist.pharmacy : pharmacist.pharmacy}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      focusBorderColor="teal.500"
                      bg={!isEditing ? 'gray.50' : 'white'}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>

              <FormControl>
                <FormLabel>License Number</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaIdCard} color="teal.500" />
                  </InputLeftElement>
                  <Input
                    name="licenseNumber"
                    value={isEditing ? tempPharmacist.licenseNumber : pharmacist.licenseNumber}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                    focusBorderColor="teal.500"
                    bg={!isEditing ? 'gray.50' : 'white'}
                  />
                </InputGroup>
              </FormControl>

              <Stack direction="row" spacing={4} width="100%">
                {!isEditing ? (
                  <Button
                    colorScheme="teal"
                    leftIcon={<Icon as={FaEdit} />}
                    onClick={handleEdit}
                    width="100%"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      colorScheme="teal"
                      type="submit"
                      width="100%"
                      leftIcon={<Icon as={FaSave} />}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="red"
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={handleCancel}
                      width="100%"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Stack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PharmacistProfile;