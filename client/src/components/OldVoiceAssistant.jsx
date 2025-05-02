// VoiceAssistant.js
import React, { useState } from 'react';
import axios from 'axios';
import { IconButton, Box, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Select } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react'; // Import keyframes from @emotion/react
import { useNavigate } from 'react-router-dom';


// Circular waveform animation
const waveformAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.6); }
  50% { box-shadow: 0 0 0 15px rgba(72, 187, 120, 0); }
  100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); }
`;

const VoiceAssistant = () => {
  const [language, setLanguage] = useState('en-US'); // Default language is English
  const [isListening, setIsListening] = useState(false); // Track if recording is active
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for language selection
  const toast = useToast();
  const navigate = useNavigate();


  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = language;
  recognition.interimResults = false;

  const startListening = () => {
    setIsListening(true);
    recognition.start();
    const startSound = new Audio('/sounds/start.mp3');
    startSound.play();

    const user = JSON.parse(localStorage.getItem('userInfo'));

    recognition.onresult = async (event) => {
      const userMessage = event.results[0][0].transcript;
      try {
        const res = await axios.post('http://localhost:5000/api/dialogflow',
          {
            message: userMessage,
            languageCode: language,
            sessionid : user.dialogflowSessionId,
          },
          {
            headers: { 'x-auth-token': user.token },
          }
        );

        // Play audio response
        const utterance = new SpeechSynthesisUtterance(res.data.fulfillmentText);
        utterance.lang = language;
        
        // Handle navigation after speech ends
        utterance.onend = () => {
          setIsListening(false);
          
          // Check if navigation is required
          if (res.data.navigation && res.data.navigation.shouldNavigate) {
            navigate(res.data.navigation.url);
          }
        };

        window.speechSynthesis.speak(utterance);

        // console.log("navigation url",res.data.navigation.url)

        // If speech synthesis fails or is not supported, ensure navigation still works
        if (!window.speechSynthesis.speaking) {
          setIsListening(false);
          if (res.data.navigation && res.data.navigation.shouldNavigate) {
            navigate(res.data.navigation.url);
          }
        }

      } catch (error) {
        console.error('Error fetching DialogFlow response:', error);
        toast({
          title: 'Error',
          description: 'Error connecting to DialogFlow',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsListening(false);
      }
    };

    recognition.onend = () => setIsListening(false);
};

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    recognition.lang = newLanguage;
    closeModal();
  };

  return (
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

        {/* Voice Assistant Button with GIF */}
        <IconButton
          aria-label="Voice Assistant"
          isRound
          size="lg"
          colorScheme="green"
          onClick={startListening}
          animation={isListening ? `${waveformAnimation} 2s infinite` : 'none'}
          icon={<img src="/images/siri.gif" alt="siri GIF" width="45px" height="45px" />} // Replace with the path to your GIF
        />
      </Box>

      {/* Modal for Language Selection */}
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
    </Box>
  );
};

export default VoiceAssistant;
