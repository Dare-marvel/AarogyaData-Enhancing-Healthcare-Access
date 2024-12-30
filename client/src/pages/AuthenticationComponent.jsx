import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Flex,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  Textarea,
  Tag,
  TagCloseButton,
  IconButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaUserMd, FaHospitalUser, FaPills, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { AiOutlineLogin } from "react-icons/ai";
import { AddIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import ChipInput from '../components/ChipInput';

const specializations = [
  "Neurologist",
  "Psychiatrist",
  "Endocrinologist",
  "Oncologist",
  "Orthopedist",
  "Hematologist",
  "Pulmonologist",
  "Vascular Surgeon",
  "Gynecologist",
  "Gastroenterologist",
  "Psychologist",
  "Surgeon",
  "Neurosurgeon",
  "Urologist",
  "Dermatologist",
  "Addiction Specialist",
  "Rheumatologist",
  "Doctor",
  "Family Doctor",
  "Nephrologist",
  "Ophthalmologist",
  "Cardiologist",
  "Allergist"
];

function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('patient');
  const [page, setPage] = useState(1);
  const [additionalInfo, setAdditionalInfo] = useState({
    medicalHistory: [],
    allergies: [],
    currentMedications: []
  });
  const [disease, setDisease] = useState('');
  const [date, setDate] = useState('');

  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const addMedicalHistory = () => {
    if (disease && date) {
      setAdditionalInfo({
        ...additionalInfo,
        medicalHistory: [...additionalInfo.medicalHistory, { disease, date }]
      });
      setDisease('');
      setDate('');
    }
  };

  const removeMedicalHistory = (index) => {
    const newHistory = additionalInfo.medicalHistory.filter((_, i) => i !== index);
    setAdditionalInfo({ ...additionalInfo, medicalHistory: newHistory });
  };


  useEffect(() => {
    setIsNextDisabled(!(username && email && password && role));
  }, [username, email, password, role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      // localStorage.setItem('token', response.data.token);
      // localStorage.setItem('role', response.data.role);
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      navigate(`/${response.data.role}/profile`);
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error.response ? error.response.data.message : error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        role,
        ...additionalInfo
      });
      console.log('Registration successful:', response.data);
      toast({
        title: "Registration successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsLogin(true);
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error);
      toast({
        title: "Registration failed",
        description: error.response ? error.response.data.message : error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderAdditionalFields = () => {
    switch (role) {
      case 'patient':
        return (
          <>
            <HStack spacing={4} align="flex-start">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Age</FormLabel>
                <NumberInput size="sm" min={0}>
                  <NumberInputField onChange={(e) => setAdditionalInfo({ ...additionalInfo, age: e.target.value })} />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Height (cm)</FormLabel>
                <NumberInput size="sm" min={0}>
                  <NumberInputField onChange={(e) => setAdditionalInfo({ ...additionalInfo, height: e.target.value })} />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Weight (kg)</FormLabel>
                <NumberInput size="sm" min={0}>
                  <NumberInputField onChange={(e) => setAdditionalInfo({ ...additionalInfo, weight: e.target.value })} />
                </NumberInput>
              </FormControl>
            </HStack>
            <FormControl >
              <FormLabel fontSize="sm">Medical History</FormLabel>
              <HStack>
                <Input
                  placeholder="Disease"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  size="sm"
                  w="auto"
                />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  size="sm"
                  w="auto"
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={addMedicalHistory}
                  isDisabled={!disease || !date}
                  size="sm"
                />
              </HStack>

              <Box mt={2}>
                {additionalInfo.medicalHistory.map((entry, index) => (
                  <HStack key={index} mt={1}>
                    <Tag size="sm">
                      {entry.disease} - {entry.date}
                      <TagCloseButton onClick={() => removeMedicalHistory(index)} />
                    </Tag>
                  </HStack>
                ))}
              </Box>
            </FormControl>

            <HStack spacing={4} align="start" width='100%'>
              <FormControl width="50%">
                <FormLabel fontSize="sm">Allergies</FormLabel>
                <ChipInput
                  value={additionalInfo.allergies}
                  onChange={(value) => setAdditionalInfo({ ...additionalInfo, allergies: value })}
                  placeholder="Type and press enter to add allergies"
                />
              </FormControl>

              <FormControl width="50%">
                <FormLabel fontSize="sm">Current Medications</FormLabel>
                <ChipInput
                  value={additionalInfo.currentMedications}
                  onChange={(value) => setAdditionalInfo({ ...additionalInfo, currentMedications: value })}
                  placeholder="Type and press enter to add medications"
                />
              </FormControl>
            </HStack>
          </>
        );
      case 'doctor':
        return (
          <>
            <HStack spacing={4} align="flex-start" width='100%'>
              <FormControl isRequired width="50%">
                <FormLabel fontSize="sm">Specialization</FormLabel>
                <Select size="sm" placeholder="Select or type specialization" onChange={(e) => setAdditionalInfo({ ...additionalInfo, specialization: e.target.value })}>
                  {specializations.map((specialization) => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired width="50%">
                <FormLabel fontSize="sm">Years of Experience</FormLabel>
                <NumberInput size="sm" min={0}>
                  <NumberInputField onChange={(e) => setAdditionalInfo({ ...additionalInfo, yearsOfExperience: e.target.value })} />
                </NumberInput>
              </FormControl>
            </HStack>

            <FormControl isRequired width="100%">
              <FormLabel fontSize="sm">College</FormLabel>
              <Input size="sm" onChange={(e) => setAdditionalInfo({ ...additionalInfo, college: e.target.value })} />
            </FormControl>
            <FormControl isRequired width="100%">
              <FormLabel fontSize="sm">License Number</FormLabel>
              <Input size="sm" onChange={(e) => setAdditionalInfo({ ...additionalInfo, licenseNumber: e.target.value })} />
            </FormControl>

          </>
        );

      case 'pharmacist':
        return (
          <>
            <HStack spacing={4} align="flex-start" width='100%'>
              <FormControl isRequired width="50%">
                <FormLabel fontSize="sm">Years of Experience</FormLabel>
                <NumberInput size="sm" min={0}>
                  <NumberInputField onChange={(e) => setAdditionalInfo({ ...additionalInfo, yearsOfExperience: e.target.value })} />
                </NumberInput>
              </FormControl>
              <FormControl isRequired width="50%">
                <FormLabel fontSize="sm">License Number</FormLabel>
                <Input size="sm" onChange={(e) => setAdditionalInfo({ ...additionalInfo, licenseNumber: e.target.value })} />
              </FormControl>
            </HStack>
            <FormControl isRequired width="100%">
              <FormLabel fontSize="sm">Pharmacy</FormLabel>
              <Input size="sm" onChange={(e) => setAdditionalInfo({ ...additionalInfo, pharmacy: e.target.value })} />
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center" bg="gray.50">
      <Box position="relative" width="400px" height="600px" style={{ perspective: '1000px' }}>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}
        >
          {/* Login Card - Front */}
          <Box
            position="absolute"
            width="100%"
            // height="100%"
            bg="white"
            p={4}
            rounded="md"
            shadow="lg"
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
            <VStack spacing={4} width="100%">
              <Flex width="full" justifyContent="space-between" mb={4}>
                <Button
                  leftIcon={<FaSignInAlt />}
                  size='sm'
                  colorScheme="blue"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </Button>
                <Button
                  rightIcon={<FaUserPlus />}
                  size='sm'
                  colorScheme="gray"
                  onClick={() => { setIsLogin(false); setPage(1); }}
                >
                  Register
                </Button>
              </Flex>
              <form onSubmit={handleLogin} style={{ width: '100%' }}>
                <VStack spacing={4} width="100%">
                  <Heading size="md">Welcome Back</Heading>
                  <FaHospitalUser size="45" color="#3182ce" />
                  <FormControl id="email" isRequired width="100%">
                    <FormLabel fontSize="sm">Email</FormLabel>
                    <Input size="sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormControl>
                  <FormControl id="password" isRequired width="100%">
                    <FormLabel fontSize="sm">Password</FormLabel>
                    <Input size="sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </FormControl>
                  <Button type="submit" colorScheme="blue" width="full" leftIcon={<AiOutlineLogin />}>
                    Login
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>

          {/* Register Card - Back */}
          <Box
            position="absolute"
            width="100%"
            // height="88%"
            bg="white"
            p={4}
            rounded="md"
            shadow="lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <VStack spacing={1}>
              <Flex width="full" justifyContent="space-between" mb={3}>
                <Button
                  leftIcon={<FaSignInAlt />}
                  size='sm'
                  colorScheme="gray"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </Button>
                <Button
                  rightIcon={<FaUserPlus />}
                  size='sm'
                  colorScheme="green"
                  onClick={() => { setIsLogin(false); setPage(1); }}
                >
                  Register
                </Button>
              </Flex>
              <form onSubmit={handleRegister} style={{ width: '100%' }}>
                <VStack width="100%" spacing={3}>
                  <Heading size="md">{page === 1 ? "Join Us" : "Additional Info"}</Heading>
                  {role === 'patient' && <FaHospitalUser size="45" color="#38a169" />}
                  {role === 'doctor' && <FaUserMd size="45" color="#38a169" />}
                  {role === 'pharmacist' && <FaPills size="45" color="#38a169" />}
                  {page === 1 ? (
                    <>
                      <FormControl id="username" width="100%" isRequired>
                        <FormLabel fontSize="sm">Username</FormLabel>
                        <Input size="sm" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                      </FormControl>
                      <FormControl id="email" width="100%" isRequired>
                        <FormLabel fontSize="sm">Email</FormLabel>
                        <Input size="sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </FormControl>
                      <FormControl id="password" width="100%" isRequired>
                        <FormLabel fontSize="sm">Password</FormLabel>
                        <Input size="sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </FormControl>
                      <FormControl id="role" width="100%" isRequired>
                        <FormLabel fontSize="sm">Role</FormLabel>
                        <Select size="sm" value={role} onChange={(e) => setRole(e.target.value)}>
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="pharmacist">Pharmacist</option>
                        </Select>
                      </FormControl>
                      <Button
                        onClick={() => setPage(2)}
                        colorScheme="blue"
                        width="full"
                        isDisabled={isNextDisabled}
                        rightIcon={<ChevronRightIcon />}
                      >
                        Next
                      </Button>
                    </>
                  ) : (
                    <>
                      {renderAdditionalFields()}
                      <HStack spacing={4} width="full" mt={4} mb={2}>
                        <Button
                          size='sm'
                          onClick={() => setPage(1)}
                          colorScheme="gray"
                          width="50%"
                          leftIcon={<ChevronLeftIcon />}
                        >
                          Previous
                        </Button>
                        <Button
                          size='sm'
                          type="submit"
                          colorScheme="green"
                          width="50%"
                          leftIcon={<FaUserPlus />}
                        >
                          Register
                        </Button>
                      </HStack>
                    </>
                  )}
                </VStack>
              </form>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default AuthComponent;