import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  HStack,
  Icon
} from '@chakra-ui/react';
import { 
  MdSchool, 
  MdMedicalServices, 
  MdWorkHistory 
} from 'react-icons/md';

const DoctorCard = ({ doctor, onBookClick }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={3}
      w='100%'
      shadow="sm"
      bg="white"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <VStack align="stretch" spacing={2}>
        <Heading size="sm" mb={1}>Dr. {doctor.username}</Heading>
        
        <HStack spacing={2} fontSize="sm">
          <Icon as={MdMedicalServices} boxSize={4} />
          <Text color="gray.600">{doctor.specialization}</Text>
        </HStack>

        <HStack spacing={2} fontSize="sm">
          <Icon as={MdWorkHistory} boxSize={4} />
          <Text color="gray.600">{doctor.yearsOfExperience} yrs</Text>
        </HStack>

        <HStack spacing={2} fontSize="sm">
          <Icon as={MdSchool} boxSize={4} />
          <Text color="gray.600" noOfLines={1}>{doctor.college}</Text>
        </HStack>

        <Badge colorScheme="blue" fontSize="xs">
          License: {doctor.licenseNumber}
        </Badge>

        <Button
          colorScheme="blue"
          onClick={onBookClick}
          size="sm"
          width="100%"
          mt={1}
        >
          Book Appointment
        </Button>
      </VStack>
    </Box>
  );
};

export default DoctorCard;