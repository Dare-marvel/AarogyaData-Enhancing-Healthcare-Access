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
  Spinner
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { MdMedicalServices, MdBiotech, MdQuestionAnswer, MdImage } from 'react-icons/md';
import { FaChevronLeft, FaPlusSquare, FaPaperPlane } from 'react-icons/fa';
import { FaBrain, FaLungs, FaHeart, FaStethoscope } from 'react-icons/fa';
import { GiKidneys, GiLiver, GiAwareness } from "react-icons/gi";
import { FaRegHandPaper } from "react-icons/fa";

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
  const [prediction, setPrediction] = useState(null);
  const [doctorPrediction, setDoctorPrediction] = useState(null);
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

      setPrediction(riskResponse.data);
      setDoctorPrediction(doctorResponse.data);
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
    // Format the doctor type to ensure proper URL encoding
    const formattedSpecialization = doctorPrediction.predicted_doctor
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens

    // Navigate to the appointments page with the specialization as a query parameter
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

        <Modal
          isOpen={isOpenModal}
          onClose={onCloseModal}
          placement="left"
          size="md"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select Functionality</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedOption('symptoms');
                    onCloseModal();
                  }}
                >
                  Symptoms
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedOption('health-query');
                    onCloseModal();
                  }}
                >
                  Health Query
                </Button>
                <Button variant="ghost"
                  onClick={() => {
                    setSelectedOption('image-scan');
                    onCloseModal();
                  }}
                >
                  Image Scan
                </Button>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onCloseModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {selectedOption === 'symptoms' ? (
          <VStack width="100%" spacing={3} height="100%" overflowY="auto">
            {prediction && (
              <Box width="100%" p={3} borderRadius="md" bg="gray.50">
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Risk Level:{' '}
                  <Badge colorScheme={getRiskLevelColor(prediction.risk_level)}>
                    {prediction.risk_level.toUpperCase()}
                  </Badge>
                </Text>
              </Box>
            )}

            {doctorPrediction && (
              <Box width="100%" p={3} borderRadius="md" bg="gray.50">
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Recommended Specialist:
                </Text>
                <Text fontSize="sm" mb={2}>
                  {doctorPrediction.predicted_doctor.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
                <Button
                  colorScheme="blue"
                  size="xs"
                  onClick={handleFindDoctors}
                  width="full"
                >
                  Find Doctors
                </Button>
              </Box>
            )}
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