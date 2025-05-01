// Frontend: MedicalHistory.jsx
import React, { useState } from 'react';
import {
    Box, VStack, Heading, HStack, Text, Button, Input,
    useToast, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalBody, ModalFooter, useDisclosure,
    FormControl, FormLabel, Icon
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { MdHistory } from 'react-icons/md';
import TimelineItem from './MedicalHistory/TimelineItem';

// const TimelineItem = ({ date, disease, onDelete, isLast }) => (
//     <Box position="relative" pl={8} pb={isLast ? 0 : 6}>
//         {/* Vertical line */}
//         {!isLast && (
//             <Box
//                 position="absolute"
//                 left="15px"
//                 top="24px"
//                 bottom={0}
//                 width="2px"
//                 bg="blue.100"
//             />
//         )}

//         {/* Timeline dot */}
//         <Box
//             position="absolute"
//             left="11px"
//             top="18px"
//             width="10px"
//             height="10px"
//             borderRadius="full"
//             bg="blue.500"
//             zIndex={1}
//         />

//         {/* Content */}
//         <Box
//             bg="white"
//             p={4}
//             borderRadius="lg"
//             boxShadow="sm"
//             border="1px"
//             borderColor="gray.100"
//             _hover={{
//                 boxShadow: "md",
//                 borderColor: "blue.100",
//                 transform: "translateY(-2px)",
//                 transition: "all 0.2s ease-in-out"
//             }}
//         >
//             <HStack justify="space-between">
//                 <HStack spacing={3}>
//                     <TimeIcon color="blue.500" />
//                     <Box>
//                         <Text fontWeight="semibold" fontSize="sm" color="gray.700">
//                             {new Date(date).toLocaleDateString()}
//                         </Text>
//                         <Text color="gray.600">{disease}</Text>
//                     </Box>
//                 </HStack>
//                 <Button
//                     size="sm"
//                     colorScheme="red"
//                     variant="ghost"
//                     onClick={onDelete}
//                 >
//                     <DeleteIcon />
//                 </Button>
//             </HStack>
//         </Box>
//     </Box>
// );

export const MedicalHistory = ({
    history,
    patientId,
    onUpdate,
    token
}) => {
    const [newDisease, setNewDisease] = useState('');
    const [date, setDate] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const axiosConfig = {
        headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
        }
    };

    const handleAdd = async () => {
        if (!newDisease || !date) {
            toast({
                title: "Please fill all fields",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/doctor/${patientId}/medical-history`,
                {
                    disease: newDisease,
                    date: date
                },
                axiosConfig
            );

            toast({
                title: "Record added successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onUpdate();
            onClose();
            setNewDisease('');
            setDate('');
        } catch (error) {
            toast({
                title: "Error adding record",
                description: error.response?.data?.message || "An error occurred",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (entryId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/doctor/${patientId}/medical-history/${entryId}`,
                axiosConfig
            );

            toast({
                title: "Record deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onUpdate();
        } catch (error) {
            toast({
                title: "Error deleting record",
                description: error.response?.data?.message || "An error occurred",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Sort medical history by date (most recent first)
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );



    return (
        <Box bg="gray.50" p={6} borderRadius="xl" boxShadow="md">
            <HStack justify="space-between" mb={6}>
                <HStack spacing={3}>
                    <Heading size="md" mb={4} color="blue.600">
                        <HStack>
                            <Icon as={MdHistory} />
                            <Text>Medical History</Text>
                            {/* <Text color="gray.500" fontSize="sm">
                                ({history.length} records)
                            </Text> */}
                        </HStack>
                    </Heading>

                </HStack>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={onOpen}
                    boxShadow="sm"
                >
                    Add Record
                </Button>
            </HStack>

            <VStack align="stretch" spacing={0}>
                {sortedHistory.map((entry, idx) => (
                    <TimelineItem
                        key={entry._id || idx}
                        date={entry.date}
                        disease={entry.disease}
                        onDelete={() => handleDelete(entry._id)}
                        isLast={idx === sortedHistory.length - 1}
                    />
                ))}
                {sortedHistory.length === 0 && (
                    <Box
                        py={8}
                        textAlign="center"
                        color="gray.500"
                        bg="white"
                        borderRadius="md"
                    >
                        No medical history records found
                    </Box>
                )}
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color="blue.600">Add Medical Record</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Condition/Disease</FormLabel>
                                <Input
                                    value={newDisease}
                                    onChange={(e) => setNewDisease(e.target.value)}
                                    placeholder="Enter condition or disease"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Date</FormLabel>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleAdd}>
                            Add Record
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};