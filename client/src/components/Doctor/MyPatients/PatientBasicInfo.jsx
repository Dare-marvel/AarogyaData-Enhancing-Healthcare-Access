import React from 'react';
import {
    Card, CardBody, VStack, HStack, Avatar, Box, Text,
    Icon, Divider, Badge, Tooltip
} from '@chakra-ui/react';
import { CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { calculateBMI, getBMICategory } from './healthCalculations';

const MotionBox = motion(Box);

export const PatientBasicInfo = ({ 
    username, 
    age, 
    height, 
    weight,
    cardBg 
}) => {
    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    return (
        <MotionBox whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card bg={cardBg} shadow="lg" borderRadius="xl">
                <CardBody>
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="center" mb={2}>
                            <Avatar size="xl" name={username} src="https://bit.ly/broken-link" />
                        </HStack>
                        <Divider />
                        <Box>
                            <Text fontSize="sm" color="gray.500">Basic Information</Text>
                            <VStack align="stretch" spacing={3} mt={2}>
                                <HStack>
                                    <Icon as={CalendarIcon} color="blue.500" />
                                    <Text><strong>Age:</strong> {age} years</Text>
                                </HStack>
                                <HStack>
                                    <Icon as={InfoIcon} color="blue.500" />
                                    <Text><strong>Height:</strong> {height} cm</Text>
                                </HStack>
                                <HStack>
                                    <Icon as={InfoIcon} color="blue.500" />
                                    <Text><strong>Weight:</strong> {weight} kg</Text>
                                </HStack>
                                <Tooltip label="Body Mass Index" placement="top">
                                    <Badge
                                        colorScheme={bmiCategory.color}
                                        p={2}
                                        borderRadius="full"
                                        textAlign="center"
                                    >
                                        BMI: {bmi} ({bmiCategory.label})
                                    </Badge>
                                </Tooltip>
                            </VStack>
                        </Box>
                    </VStack>
                </CardBody>
            </Card>
        </MotionBox>
    );
};