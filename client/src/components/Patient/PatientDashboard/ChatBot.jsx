import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
  SimpleGrid,
  Text,
  Progress,
  Flex,
  IconButton,
  useToast,
  SlideFade,
  Badge,
  Icon,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Input,
  HStack,
  Divider
} from '@chakra-ui/react';
// import { AddIcon } from '@chakra-ui/icons';
import { MdMedicalServices, MdBiotech, MdQuestionAnswer, MdImage } from 'react-icons/md';
// import { FaChevronLeft, FaPlusSquare, FaPaperPlane } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa';
import { GiKidneys } from "react-icons/gi";
import { FaRegHandPaper } from "react-icons/fa";
import { MdSick, MdHealthAndSafety, MdImageSearch } from "react-icons/md";

import ChipInput from '../../ChipInput';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSend } from 'react-icons/md';
import { ChatMessage } from './ChatMessage';
import { useImageUpload } from '../../../hooks/useImageUpload';

const getRiskLevelColor = (riskLevel) => {
  const colors = {
    low: 'green',
    moderate: 'yellow',
    high: 'red',
    varies: 'purple'
  };
  return colors[riskLevel] || 'gray';
};

function ChatBot({ isOpen }) {
  const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure();
  const [selectedOption, setSelectedOption] = useState('symptoms');
  const [symptoms, setSymptoms] = useState([]);
  // const [prediction, setPrediction] = useState(null);
  // const [doctorPrediction, setDoctorPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(Date.now().toString());

  const toast = useToast();
  const navigate = useNavigate();

  // For image scan 
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ImagePrediction, setImagePrediction] = useState(null);
  const { progress, uploadImage, handleDelete } = useImageUpload();

  const options = [
    {
      id: "symptoms",
      label: "Symptoms",
      icon: MdSick,
      color: "red.500"
    },
    {
      id: "health-query",
      label: "Health Query",
      icon: MdHealthAndSafety,
      color: "green.500"
    },
    {
      id: "image-scan",
      label: "Image Scan",
      icon: MdImageSearch,
      color: "blue.500"
    }
  ];

  const handleSelect = (optionId) => {
    setSelectedOption(optionId);
    onCloseModal();
  };

  const organs = [
    { name: 'Kidney', endpoint: 'http://127.0.0.1:5001/predict_kidney_image', icon: GiKidneys },
    { name: 'Brain', endpoint: 'http://localhost:5001/predict_brain_tumor', icon: FaBrain },
    { name: 'Skin', endpoint: 'http://localhost:5001/predict_skin_cancer', icon: FaRegHandPaper },
  ];

  const handleOrganSelect = (organ) => {
    setSelectedOrgan(organ);
    setImagePrediction(null); // Reset prediction on organ change
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrgan || !selectedFile) {
      alert('Please select an organ and upload an image.');
      return;
    }

    try {
      const imageUrl = await uploadImage(selectedFile);
      const response = await axios.post(selectedOrgan.endpoint, { image_url: imageUrl });
      setImagePrediction(response.data);
      console.log("description ", response.data)

      const urlParts = imageUrl.split('%2F'); // Split at '%2F' (URL-encoded '/')
      let fileName = urlParts[urlParts.length - 1].split('?')[0]; // Get the last part and strip query params

      // console.log("checking url ",imageUrl)
      // console.log("checking filename ",fileName)

      if (fileName) {
        await handleDelete(fileName);
      }

    } catch (error) {
      console.error('Error during prediction:', error);
      alert('An error occurred while processing the image.');
    }
  };

  // Image Scan ends 



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const response = await fetch('http://localhost:5000/api/patients/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId.current,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomSubmit = async () => {
    if (symptoms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one symptom',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const symptomsString = symptoms.join(', ');
    const requestBody = { symptoms: symptomsString };

    try {
      const [riskResponse, doctorResponse] = await Promise.all([
        axios.post('http://127.0.0.1:5001/predict', requestBody),
        axios.post('http://127.0.0.1:5001/predict_doctor', requestBody)
      ]);

      // Set the risk level prediction using document.getElementById
      const riskLevelText = document.getElementById('risk-level-text');
      const riskLevelBadge = document.getElementById('risk-level-badge');
      const riskLevelContainer = document.getElementById('risk-level-container');

      if (riskResponse.data) {
        // riskLevelText.innerText = `${riskResponse.data.risk_level.toUpperCase()}`;
        riskLevelBadge.textContent = riskResponse.data.risk_level.toUpperCase();
        // riskLevelBadge.colorScheme = getRiskLevelColor(riskResponse.data.risk_level);
        riskLevelBadge.style.backgroundColor = getRiskLevelColor(riskResponse.data.risk_level);
        // riskLevelBadge.setAttribute('colorScheme', getRiskLevelColor(riskResponse.data.risk_level));
        riskLevelContainer.style.display = 'block'; // Show the container
      }

      // Set the doctor prediction using document.getElementById
      const doctorPredictionText = document.getElementById('doctor-prediction-text');
      const doctorPredictionContainer = document.getElementById('doctor-prediction-container');

      if (doctorResponse.data) {
        doctorPredictionText.innerText = doctorResponse.data.predicted_doctor
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        doctorPredictionContainer.style.display = 'block'; // Show the container
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get predictions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctors = () => {
    const doctorTextElement = document.getElementById('doctor-prediction-text');

    if (!doctorTextElement) return;

    const predictedDoctor = doctorTextElement.innerText;

    const formattedSpecialization = predictedDoctor
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens

    navigate(`/patient/appointments?specialization=${formattedSpecialization}`);
  };


  return (
    <SlideFade in={isOpen} offsetY="20px">
      <Box
        position="absolute"
        bottom="13px"
        right="0"
        width="300px"
        height="400px"
        bg="white"
        boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1), 0px 0px 20px rgba(0, 0, 0, 0.08)"
        borderRadius="md"
        p="4"
        zIndex="modal"
      >
        <Flex alignItems="center" justifyContent="space-between" mb={4}>
          <IconButton
            aria-label="Select functionality"
            icon={
              selectedOption === 'symptoms'
                ? <MdMedicalServices />
                : selectedOption === 'health-query'
                  ? <MdQuestionAnswer />
                  : selectedOption === 'image-scan' ? <MdImage /> : <MdBiotech />
            }
            onClick={onOpenModal}
            position="absolute"
            colorScheme="red"
            left={2}
            bottom={3}
            borderRadius="full"
            size="sm"
            zIndex={2}
          />
          {selectedOption === 'health-query' && (
            <HStack width="100%" spacing={1} position="relative" top="340px" zIndex={1}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your health-related question..."
                disabled={isLoading}
                borderRadius="full"
                borderColor="teal.500"
                focusBorderColor="teal.700"
                _placeholder={{ color: 'gray.500' }}
                bg="white"
                boxShadow="md"
                width="210px"
                left={7}
                size="sm"
              />

              <IconButton
                colorScheme="teal"
                onClick={handleSend}
                isLoading={isLoading}
                icon={<Icon as={MdSend} />}
                isRound
                aria-label="Send"
                left={7}
                size="sm"
              />

            </HStack>
          )}
          {selectedOption === 'symptoms' && (
            <Flex alignItems="center" gap={2} width='full'>
              <ChipInput
                value={symptoms}
                onChange={setSymptoms}
                placeholder="Type symptoms and press +"
                style={{ width: '100%' }}
              />
              <IconButton
                colorScheme="teal"
                onClick={handleSymptomSubmit}
                isLoading={loading}
                icon={<Icon as={MdSend} />}
                isRound
                aria-label="Send"
                size="sm"
              />
            </Flex>
          )}
          {selectedOption === 'image-scan' && (
            <VStack spacing={4} align="center">
              {/* Organ Selection */}
              <Flex
                justify="center"
                gap={2}
                wrap="nowrap"
                position="relative"
                left={1}
              >
                {organs.map((organ) => (
                  <Box
                    key={organ.name}
                    w="40px"
                    h="40px"
                    p={1}
                    borderRadius="50%"
                    borderWidth="2px"
                    borderColor={selectedOrgan?.name === organ.name ? 'blue.500' : 'gray.300'}
                    onClick={() => handleOrganSelect(organ)}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      as={organ.icon}
                      w="24px"
                      h="24px"
                      color={selectedOrgan?.name === organ.name ? 'blue.500' : 'gray.500'}
                    />
                  </Box>
                ))}
              </Flex>

              {/* File Input */}
              <Input type="file" onChange={handleFileChange} w="full" />

              {/* Progress Bar */}
              {progress > 0 && progress < 100 && (
                <VStack w="full" align="start" spacing={1}>
                  <Progress value={progress} size="sm" colorScheme="blue" w="full" />
                  <Text fontSize="sm">{progress}% uploaded</Text>
                </VStack>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                w="full"
                isDisabled={!selectedOrgan || !selectedFile}
              >
                Submit
              </Button>
            </VStack>
          )}
        </Flex>

        <Modal isOpen={isOpenModal} onClose={onCloseModal} size="xs" isCentered>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
          <ModalContent borderRadius="lg" shadow="xl">
            <ModalHeader fontSize="lg" pb={2}>Select Functionality</ModalHeader>
            <ModalCloseButton size="sm" />
            <Divider />
            <ModalBody py={4}>
              <Flex direction="column" gap={2}>
                {options.map((option) => (
                  <Button
                    key={option.id}
                    variant="ghost"
                    justifyContent="flex-start"
                    height="48px"
                    onClick={() => handleSelect(option.id)}
                    _hover={{ bg: "gray.100" }}
                    borderRadius="md"
                  >
                    <HStack spacing={3}>
                      <Flex
                        w="32px"
                        h="32px"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                        bg={option.color}
                        color="white"
                      >
                        <option.icon size={18} />
                      </Flex>
                      <Text fontWeight="medium">{option.label}</Text>
                    </HStack>
                  </Button>
                ))}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>

        {selectedOption === 'symptoms' ? (
          <VStack width="100%" spacing={3} height="100%" overflowY="auto">
            <Box id="risk-level-container" width="100%" p={3} borderRadius="md" bg="gray.50" style={{ display: 'none' }}>
              <Text id="risk-level-text" fontWeight="bold" fontSize="sm" mb={1}>
                Risk Level:{' '}
                <Badge id="risk-level-badge" colorScheme="">
                  {/* Risk level will be populated here */}
                </Badge>
              </Text>
            </Box>

            <Box id="doctor-prediction-container" width="100%" p={3} borderRadius="md" bg="gray.50" style={{ display: 'none' }}>
              <Text fontWeight="bold" fontSize="sm" mb={1}>
                Recommended Specialist:
              </Text>
              <Text id="doctor-prediction-text" fontSize="sm" mb={2}>
                {/* Doctor prediction will be populated here */}
              </Text>
              <Button
                colorScheme="blue"
                size="xs"
                id="find-doctors-button"
                width="full"
                onClick={handleFindDoctors}
              >
                Find Doctors
              </Button>
            </Box>
          </VStack>

        ) : selectedOption === 'health-query' ? (

          <Box
            w="100%"
            h="93%"
            borderWidth={1}
            borderRadius="lg"
            p={2}
            overflowY="auto"
            position="relative"
            bottom={14}
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'transparent',
                borderRadius: '24px',
              },
              '&:hover::-webkit-scrollbar-thumb': {
                background: '#D1D5DB',
              }
            }}
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
        ) : selectedOption === 'image-scan' ? (
          <VStack width="100%" spacing={3} height="100%" >
            {ImagePrediction !== null && (
              <Box
                textAlign="center"
                mt={2}
                p={2}
                borderWidth="1px"
                borderRadius="md"
                bg="gray.100"
                fontSize="sm"
              >
                <Text fontWeight="semibold">Prediction Result</Text>
                <Text mt={1}>Class: {ImagePrediction.predicted_class}</Text>
                {ImagePrediction.description && (
                  <Text mt={1} fontStyle="italic" color="gray.600">
                    {ImagePrediction.description}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        ) : (
          <Text>Please select a functionality from the menu.</Text>
        )}
      </Box>
    </SlideFade>
  );
}

export default ChatBot;