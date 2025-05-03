import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Button,
  Text,
  Badge,
  Flex,
  Spinner,
  Select,
  ModalFooter
} from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import axios from 'axios';
import { IoMdClose } from "react-icons/io";

const waveformAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
`;

const VoiceAssistant = () => {
  const [language, setLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contexts, setContexts] = useState([]);
  const [bookingState, setBookingState] = useState({
    step: null, // 'select-doctor', 'select-date', 'select-slot', 'confirmation'
    doctorName: null,
    availableDates: [],
    selectedDate: null,
    availableSlots: [],
    selectedSlot: null,
    confirmation: null,
    isProcessing: false
  });
  const toast = useToast();
  const navigate = useNavigate();

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = language;
  recognition.interimResults = false;

  useEffect(() => {
    return () => {
      recognition.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  const processDialogflowResponse = (res) => {
    // Update booking state based on intent
    switch (res.data.intent) {
      case 'BookAppointmentInitial':
        setBookingState({
          step: 'select-date',
          doctorName: res.data.parameters.DoctorName,
          availableDates: res.data.context.availableDates || [],
          selectedDate: null,
          availableSlots: [],
          isProcessing: false
        });

        setContexts(res.data.context.outputContexts || []);
        break;

      case 'GetAppointmentDate':
        setBookingState(prev => ({
          ...prev,
          step: 'select-slot',
          selectedDate: res.data.parameters.date,
          availableSlots: res.data.context.availableSlots || [],
          isProcessing: false
        }));

        setContexts(res.data.context.outputContexts || []);
        break;

      case 'GetAppointmentTimeSlot':
        setBookingState({
          step: 'confirmation',
          selectedSlot: res.data.parameters.startTime,
          confirmation: res.data.context.confirmation,
          isProcessing: false
        });

        setContexts(res.data.context.outputContexts || []);
        // // document.getElementById("booking-panel").style.display = "block";
        // // document.getElementById("booking-confirmation").style.display = "block";

        // setTimeout(function () {
        //   document.getElementById("booking-confirmation").style.display = "none";
        //   // document.getElementById("booking-panel").style.display = "none";
        // }, 5000); // 5000 milliseconds = 5 seconds

        break;

      default:
        setBookingState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const speakResponse = (text, callback) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;

    utterance.onend = () => {
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const sendToDialogflow = async (message) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsListening(false);
      setBookingState(prev => ({ ...prev, isProcessing: true }));

      const { doctorName, selectedDate, selectedSlot } = bookingState;

      const inputContexts = {
        doctorName: doctorName || null,
        selectedDate: selectedDate || null,
        selectedSlot: selectedSlot || null,
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/dialogflow`, {
        message: message,
        languageCode: language,
        sessionId: user.dialogflowSessionId,
        contexts,
        inputContexts,
      }, {
        headers: { 'x-auth-token': user.token },
      });

      processDialogflowResponse(res);

      speakResponse(res.data.fulfillmentText, () => {
        if (res.data.navigation?.shouldNavigate) {
          navigate(res.data.navigation.url);
        }

        // Auto-restart listening if we're in a selection step
        if (['select-date'].includes(bookingState.step)) {
          setTimeout(() => startListening(), 500);
        }
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error connecting to DialogFlow',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setBookingState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const startListening = () => {
    setIsListening(true);
    recognition.start();
    const startSound = new Audio('/sounds/start.mp3');
    startSound.play();

    recognition.onresult = (event) => {
      const userMessage = event.results[0][0].transcript;
      sendToDialogflow(userMessage);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // If listening ended unexpectedly, restart
        setTimeout(() => startListening(), 500);
      }
    };
  };

  const stopListening = () => {
    recognition.stop();
    setIsListening(false);
  };

  const handleDateSelection = (date) => {
    stopListening();
    sendToDialogflow(date);
  };

  const handleSlotSelection = (slot) => {
    stopListening();
    document.getElementById("booking-panel").style.display = "none";
    document.getElementById("select-slot").style.display = "none";
    sendToDialogflow(slot.formatted.startTime);

  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    recognition.lang = newLanguage;
    closeModal();
  };

  const formatUTCDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // e.g., "2025-05-02"
  };

  const formatUTCTime = (isoString) => {
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`; // e.g., "21:57"
  };

  return (
    <>
      {/* Main Voice Assistant Button */}
      <Box position="fixed" bottom="4" left="50%" transform="translateX(-50%)">
        <Box position="relative" display="flex" alignItems="center" justifyContent="center">
          {/* Settings Button */}
          <IconButton
            icon={
              <Box position="relative">
                <Box
                  position="absolute"
                  inset="0"
                  filter="blur(8px)"
                  bgColor="rgba(77, 77, 255, 0.8)"
                  borderRadius="full"
                />
                <SettingsIcon color="#8A00C4" position="relative" />
              </Box>
            }
            aria-label="Settings"
            position="absolute"
            right="-50px"
            size="md"
            variant="plain"
            onClick={openModal}
          />

          {/* Voice Assistant Button */}
          <IconButton
            aria-label="Voice Assistant"
            isRound
            size="lg"
            colorScheme={isListening ? 'green' : 'gray'}
            onClick={isListening ? stopListening : startListening}
            animation={isListening ? `${waveformAnimation} 2s infinite` : 'none'}
            icon={
              isListening ? (
                <img src="/images/siri.gif" alt="Listening..." width="45px" height="45px" />
              ) : (
                <img src="/images/siri-halt.png" alt="Mic" width="38px" height="30px" />
              )
            }
          />
        </Box>
      </Box>

      {/* Booking Assistant Panel */}
      {bookingState.step && (
        <Box
          position="fixed"
          bottom="24"
          left="50%"
          transform="translateX(-50%)"
          width="90%"
          maxW="md"
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          p="4"
          zIndex="overlay"
          id='booking-panel'
        >
          {bookingState.isProcessing ? (
            <Flex justify="center" align="center" height="100px">
              <Spinner size="xl" />
            </Flex>
          ) : (
            <>
              <Box position="absolute" top="2" right="2">
                <IconButton
                  icon={<IoMdClose />}
                  aria-label="Cancel booking"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    stopListening();
                    setBookingState({ step: null });
                  }}
                />
              </Box>
              {bookingState.step === 'select-date' && (
                <VStack spacing={3} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">
                    Select a date for Dr. {bookingState.doctorName}
                  </Text>
                  <Text color="gray.600">Available dates:</Text>
                  <VStack spacing={2}>
                    {bookingState.availableDates.map((date) => (
                      <Button
                        key={date}
                        onClick={() => handleDateSelection(date)}
                        width="full"
                        variant="outline"
                      >
                        {date}
                      </Button>
                    ))}
                  </VStack>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Or say the date you prefer
                  </Text>
                </VStack>
              )}

              {bookingState.step === 'select-slot' && (
                <VStack spacing={3} align="stretch" id='select-slot'>
                  <Text fontSize="lg" fontWeight="bold">
                    Select a time slot for {formatUTCDate(bookingState.selectedDate)}
                  </Text>
                  <Text color="gray.600">Available slots:</Text>
                  <VStack spacing={2}>
                    {bookingState.availableSlots.map((slot) => {
                      const date = formatUTCDate(slot.startTime);
                      const startTime = formatUTCTime(slot.startTime);
                      const endTime = formatUTCTime(slot.endTime);

                      return (
                        <Button
                          key={slot._id}
                          onClick={() =>
                            handleSlotSelection({
                              ...slot,
                              formatted: {
                                date,
                                startTime,
                                endTime,
                              },
                            })
                          }
                          width="full"
                          variant="outline"
                        >
                          <Flex justify="space-between" width="full" wrap="wrap">
                            <Text>{startTime} - {endTime}</Text>
                            {slot.venue && <Badge colorScheme="blue">{slot.venue}</Badge>}
                          </Flex>
                        </Button>
                      );
                    })}
                  </VStack>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Or say the time you prefer
                  </Text>
                </VStack>
              )}

              {/* {bookingState.step === 'confirmation' && (
                <VStack spacing={3} align="stretch" id='booking-confirmation' style={{ display: 'none' }}>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    Appointment Confirmed!
                  </Text>
                  <Text>
                    With Dr. {bookingState.doctorName} on {formatUTCDate(bookingState.selectedDate)}
                  </Text>
                  {bookingState.confirmation?.confirmationCode && (
                    <Text>
                      Confirmation code: <Badge colorScheme="green">{bookingState.confirmation.confirmationCode}</Badge>
                    </Text>
                  )}
                  <Button
                    colorScheme="blue"
                    mt={4}
                    onClick={() => navigate('/patient/appointments')}
                  >
                    View My Appointments
                  </Button>
                </VStack>
              )} */}
            </>
          )}
        </Box>
      )}

      {/* Language Selection Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Language</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select value={language} onChange={handleLanguageChange}>
              <option value="en-US">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              {/* Add more language options as needed */}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VoiceAssistant;