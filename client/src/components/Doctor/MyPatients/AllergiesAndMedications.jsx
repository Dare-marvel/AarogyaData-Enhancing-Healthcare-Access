import React, { useState } from 'react';
import {
    VStack, Box, Heading, HStack, Text, Input,
    Tag, TagLabel, TagCloseButton, Divider, Icon,
    Button, Wrap, WrapItem, useToast, IconButton
} from '@chakra-ui/react';
import { WarningIcon, TimeIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { GiMedicines } from "react-icons/gi";
import { FaAllergies } from 'react-icons/fa';


export const AllergiesAndMedications = ({ allergies, medications, patientId, onUpdate, token }) => {
    const [newAllergy, setNewAllergy] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const toast = useToast();

    const handleAdd = async (type, value) => {
        if (!value.trim()) return;

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/doctor/${patientId}/${type}`,
                {
                    [type === 'allergies' ? 'allergy' : 'medication']: value
                },
                config
            );

            toast({
                title: "Successfully added",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            type === 'allergies' ? setNewAllergy('') : setNewMedication('');
            onUpdate();
        } catch (error) {
            toast({
                title: "Error adding item",
                description: error.response?.data?.message || "An error occurred",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (type, item) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                data: { [type === 'allergies' ? 'allergy' : 'medication']: item }
            };

            await axios.delete(`${import.meta.env.VITE_API_URL}/api/doctor/${patientId}/${type}`, config);

            toast({
                title: "Successfully removed",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onUpdate();
        } catch (error) {
            toast({
                title: "Error removing item",
                description: error.response?.data?.message || "An error occurred",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing={6} w="full" bg="white" p={4} borderRadius="lg" boxShadow="md">
            <Box w="full">
                <Heading size="md" mb={4} color="red.600">
                    <HStack>
                        <Icon as={FaAllergies} />
                        <Text>Allergies</Text>
                    </HStack>
                </Heading>
                <HStack mb={4}>
                    <Input
                        placeholder="Add new allergy"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        borderColor="red.200"
                        size="sm"
                        _hover={{ borderColor: "red.300" }}
                        _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px red.400" }}
                    />
                    <IconButton
                        icon={<AddIcon />}
                        colorScheme="red"
                        onClick={() => handleAdd('allergies', newAllergy)}
                        aria-label="Add allergy"
                        size="sm"
                    />
                </HStack>
                <Box maxH="200px" overflowY="auto">
                    <Wrap spacing={2}>
                        {allergies.map((allergy, idx) => (
                            <WrapItem key={idx}>
                                <Tag
                                    size="md"
                                    variant="subtle"
                                    colorScheme="red"
                                    borderRadius="full"
                                    px={4}
                                    py={2}
                                >
                                    <TagLabel>{allergy}</TagLabel>
                                    <TagCloseButton
                                        onClick={() => handleDelete('allergies', allergy)}
                                    />
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Box>
            </Box>

            <Divider />

            <Box w="full">
                <Heading size="md" mb={4} color="green.600">
                    <HStack>
                        <Icon as={GiMedicines} />
                        <Text>Current Medications</Text>
                    </HStack>
                </Heading>
                <HStack mb={4}>
                    <Input
                        size="md"
                        placeholder="Add new medication"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        borderColor="green.200"
                        _hover={{ borderColor: "green.300" }}
                        _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px green.400" }}
                    />
                    <IconButton
                        icon={<AddIcon />}
                        size="md"
                        colorScheme="green"
                        onClick={() => handleAdd('medications', newMedication)}
                        aria-label="Add medication"
                    />
                </HStack>
                <Box maxH="200px" overflowY="auto">
                    <Wrap spacing={2}>
                        {medications.map((medication, idx) => (
                            <WrapItem key={idx}>
                                <Tag
                                    size="md"
                                    variant="subtle"
                                    colorScheme="green"
                                    borderRadius="full"
                                    px={4}
                                    py={2}
                                >
                                    <TagLabel>{medication}</TagLabel>
                                    <TagCloseButton
                                        onClick={() => handleDelete('medications', medication)}
                                    />
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Box>
            </Box>
        </VStack>
    );
};