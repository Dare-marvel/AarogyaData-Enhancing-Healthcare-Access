import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Grid,
  GridItem,
  List,
  ListItem,
  NumberInput,
  NumberInputField,
  Tag,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Input,
  IconButton,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  FormControl,
  FormLabel,
  Divider
} from '@chakra-ui/react';
import { 
  FaUser,
  FaTimes, 
  FaSave, 
  FaEnvelope,
  FaRuler,
  FaWeight,
  FaBirthdayCake,
  FaPills,
  FaAllergies,
  FaHistory,
  FaPlus,
  FaTrash,
  FaEdit
} from 'react-icons/fa';

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    currentMedications: [],
    allergies: [],
    medicalHistory: []
  });
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newHistory, setNewHistory] = useState({
    disease: '',
    date: new Date().toISOString().split('T')[0]
  });

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const timelineBg = useColorModeValue('teal.50', 'teal.900');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/profile`, {
        headers: {
          'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
        }
      });
      const data = await response.json();
      setProfile(data);
      setFormData({
        age: data.age,
        height: data.height,
        weight: data.weight,
        currentMedications: data.currentMedications,
        allergies: data.allergies,
        medicalHistory: data.medicalHistory
      });
    } catch (error) {
      toast({
        title: 'Error fetching profile',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': JSON.parse(localStorage.getItem('userInfo')).token
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast({
          title: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast({
        title: 'Error updating profile',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setFormData({
        ...formData,
        currentMedications: [...formData.currentMedications, newMedication.trim()]
      });
      setNewMedication('');
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const handleAddHistory = () => {
    if (newHistory.disease.trim() && newHistory.date) {
      setFormData({
        ...formData,
        medicalHistory: [...formData.medicalHistory, newHistory]
      });
      setNewHistory({
        disease: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const removeMedication = (index) => {
    const updatedMeds = formData.currentMedications.filter((_, i) => i !== index);
    setFormData({ ...formData, currentMedications: updatedMeds });
  };

  const removeAllergy = (index) => {
    const updatedAllergies = formData.allergies.filter((_, i) => i !== index);
    setFormData({ ...formData, allergies: updatedAllergies });
  };

  const removeHistory = (index) => {
    const updatedHistory = formData.medicalHistory.filter((_, i) => i !== index);
    setFormData({ ...formData, medicalHistory: updatedHistory });
  };

  if (!profile) return null;

  return (
    <Container maxW="6xl" >
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Card
          borderWidth="1px"
          borderColor="teal.200"
          bg={bgColor}
          shadow="md"
        >
          <CardBody>
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <FaUser size={24} color="#319795" />
                <Heading size="lg" color="teal.600">Patient Profile</Heading>
              </HStack>
              <Button
                leftIcon={isEditing ? <FaTimes /> : <FaEdit />}
                colorScheme="teal"
                onClick={() => setIsEditing(!isEditing)}
                size="lg"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Basic Information Card */}
          <Card borderWidth="1px" borderColor="teal.200" bg={bgColor} shadow="md">
            <CardHeader>
              <HStack spacing={3}>
                <FaUser color="#319795" />
                <Heading size="md" color="teal.600">Basic Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <HStack spacing={2}>
                    <FaUser color="#319795" />
                    <Text fontWeight="bold" color="gray.600">Username</Text>
                  </HStack>
                  <Text fontSize="lg" ml={6}>{profile.username}</Text>
                </GridItem>
                <GridItem>
                  <HStack spacing={2}>
                    <FaEnvelope color="#319795" />
                    <Text fontWeight="bold" color="gray.600">Email</Text>
                  </HStack>
                  <Text fontSize="lg" ml={6}>{profile.email}</Text>
                </GridItem>
                <GridItem>
                  <HStack spacing={2}>
                    <FaBirthdayCake color="#319795" />
                    <Text fontWeight="bold" color="gray.600">Age</Text>
                  </HStack>
                  {isEditing ? (
                    <NumberInput 
                      value={formData.age} 
                      onChange={(value) => setFormData({ ...formData, age: value })}
                      min={0}
                      ml={6}
                    >
                      <NumberInputField />
                    </NumberInput>
                  ) : (
                    <Text fontSize="lg" ml={6}>{profile.age} years</Text>
                  )}
                </GridItem>
                <GridItem>
                  <HStack spacing={2}>
                    <FaRuler color="#319795" />
                    <Text fontWeight="bold" color="gray.600">Height</Text>
                  </HStack>
                  {isEditing ? (
                    <NumberInput 
                      value={formData.height} 
                      onChange={(value) => setFormData({ ...formData, height: value })}
                      min={0}
                      ml={6}
                    >
                      <NumberInputField />
                    </NumberInput>
                  ) : (
                    <Text fontSize="lg" ml={6}>{profile.height} cm</Text>
                  )}
                </GridItem>
                <GridItem>
                  <HStack spacing={2}>
                    <FaWeight color="#319795" />
                    <Text fontWeight="bold" color="gray.600">Weight</Text>
                  </HStack>
                  {isEditing ? (
                    <NumberInput 
                      value={formData.weight} 
                      onChange={(value) => setFormData({ ...formData, weight: value })}
                      min={0}
                      ml={6}
                    >
                      <NumberInputField />
                    </NumberInput>
                  ) : (
                    <Text fontSize="lg" ml={6}>{profile.weight} kg</Text>
                  )}
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Medical History Timeline Card */}
          <Card borderWidth="1px" borderColor="teal.200" bg={bgColor} shadow="md">
            <CardHeader>
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <FaHistory color="#319795" />
                  <Heading size="md" color="teal.600">Medical History</Heading>
                </HStack>
                {isEditing && (
                  <Popover placement="left">
                    <PopoverTrigger>
                      <IconButton
                        icon={<FaPlus />}
                        colorScheme="teal"
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody>
                        <VStack spacing={3}>
                          <FormControl>
                            <FormLabel>Condition</FormLabel>
                            <Input
                              value={newHistory.disease}
                              onChange={(e) => setNewHistory({
                                ...newHistory,
                                disease: e.target.value
                              })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Date</FormLabel>
                            <Input
                              type="date"
                              value={newHistory.date}
                              onChange={(e) => setNewHistory({
                                ...newHistory,
                                date: e.target.value
                              })}
                            />
                          </FormControl>
                          <Button
                            colorScheme="teal"
                            onClick={handleAddHistory}
                            width="full"
                          >
                            Add
                          </Button>
                        </VStack>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {formData.medicalHistory
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((history, index) => (
                    <Box
                      key={index}
                      position="relative"
                      padding="4"
                      bg={timelineBg}
                      borderRadius="md"
                      _before={{
                        content: '""',
                        position: "absolute",
                        left: "-14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        bg: "teal.500"
                      }}
                      ml={4}
                      borderLeft="2px solid"
                      borderColor="teal.500"
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{history.disease}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(history.date).toLocaleDateString()}
                          </Text>
                        </VStack>
                        {isEditing && (
                          <IconButton
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHistory(index)}
                          />
                        )}
                      </HStack>
                    </Box>
                  ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Medications Card */}
          <Card borderWidth="1px" borderColor="teal.200" bg={bgColor} shadow="md">
            <CardHeader>
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <FaPills color="#319795" />
                  <Heading size="md" color="teal.600">Current Medications</Heading>
                </HStack>
                {isEditing && (
                  <HStack>
                    <Input
                      placeholder="Add medication"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      size="sm"
                      width="auto"
                    />
                    <IconButton
                      icon={<FaPlus />}
                      colorScheme="teal"
                      onClick={handleAddMedication}
                      size="sm"
                    />
                  </HStack>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={2} spacing={4}>
                {formData.currentMedications.map((medication, index) => (
                  <HStack key={index}>
                    <Tag
                      size="lg"
                      colorScheme="teal"
                      borderRadius="full"
                      p={3}
                      flex={1}
                    >
                      {medication}
                    </Tag>
                    {isEditing && (
                      <IconButton
                        icon={<FaTrash />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      />
                    )}
                  </HStack>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Allergies Card */}
          <Card borderWidth="1px" borderColor="teal.200" bg={bgColor} shadow="md">
            <CardHeader>
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <FaAllergies color="#319795" />
                  <Heading size="md" color="teal.600">Allergies</Heading>
                </HStack>
                {isEditing && (
                  <HStack>
                    <Input
                      placeholder="Add allergy"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      size="sm"
                      width="auto"
                      />
                    <IconButton
                      icon={<FaPlus />}
                      colorScheme="teal"
                      onClick={handleAddAllergy}
                      size="sm"
                    />
                  </HStack>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={2} spacing={4}>
                {formData.allergies.map((allergy, index) => (
                  <HStack key={index}>
                    <Tag
                      size="lg"
                      colorScheme="teal"
                      borderRadius="full"
                      p={3}
                      flex={1}
                    >
                      {allergy}
                    </Tag>
                    {isEditing && (
                      <IconButton
                        icon={<FaTrash />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllergy(index)}
                      />
                    )}
                  </HStack>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Save Changes Button */}
        {isEditing && (
          <Card borderWidth="1px" borderColor="teal.200" bg={bgColor} shadow="md">
            <CardBody>
              <Button
                leftIcon={<FaSave />}
                colorScheme="teal"
                onClick={handleUpdate}
                size="lg"
                width="full"
              >
                Save All Changes
              </Button>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default PatientProfile;