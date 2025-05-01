import React, { useState, useEffect } from 'react';
import {
    Accordion,
    Container,
    Heading,
    useColorModeValue,
    SlideFade,
    Input,
    InputGroup,
    InputLeftElement,
    Box,
    Text,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { AuthState } from '../../context/AuthContext';
import { usePatients } from '../../hooks/usePatients';
import { PatientCard } from '../../components/Doctor/MyPatients/PatientCard';
import { useLocation, useNavigate } from 'react-router-dom';

function MyPatients() {
    const { user } = AuthState();
    const { patients, refetchPatients } = usePatients(user);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    // Theme values
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const cardBg = useColorModeValue('gray.50', 'gray.800');
    const timelineBg = useColorModeValue('blue.50', 'blue.900');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const timelineBorderColor = useColorModeValue('blue.50', 'blue.900');
    const searchBg = useColorModeValue('white', 'gray.800');
    const searchBorder = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        // Check if URL contains a patient ID
        const urlParams = new URLSearchParams(location.search);
        const patientId = urlParams.get('patientId');

        if (patientId && !searchTerm) {
            const matchedPatient = patients.filter(patient => patient._id === patientId);
            setFilteredPatients(matchedPatient);
            return;
        }

        // Filter patients based on search term
        const filtered = patients.filter(patient => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                patient.username.toLowerCase().includes(searchTermLower) ||
                patient.email.toLowerCase().includes(searchTermLower)
            );
        });
        setFilteredPatients(filtered);
    }, [searchTerm, patients, location]);

    const handleSearch = (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        
        // Remove patientId from URL when user starts searching
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('patientId') && newSearchTerm) {
            navigate('/doctor/my_patients'); 
        }
    };

    return (
        <Container maxW="container.xl" py={2}>
            <Heading mb={8} textAlign="center" size="xl">
                My Patients
            </Heading>

            <Box mb={6}>
                <InputGroup size="lg">
                    <InputLeftElement 
                        pointerEvents="none"
                        children={<SearchIcon color="gray.400" />}
                    />
                    <Input
                        placeholder="Search patients by username or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        bg={searchBg}
                        border="2px"
                        borderColor={searchBorder}
                        borderRadius="full"
                        _hover={{
                            borderColor: 'blue.400',
                        }}
                        _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px blue.500',
                        }}
                        fontSize="md"
                        px={6}
                    />
                </InputGroup>
            </Box>

            {filteredPatients.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Text fontSize="lg" color="gray.500">
                        No patients found matching your search.
                    </Text>
                </Box>
            ) : (
                <Accordion allowMultiple>
                    {filteredPatients.map((patient, index) => (
                        <SlideFade in={true} offsetY="20px" delay={index * 0.1} key={patient._id}>
                            <PatientCard
                                patient={patient}
                                token={user.token}
                                borderColor={borderColor}
                                cardBg={cardBg}
                                timelineBg={timelineBg}
                                hoverBg={hoverBg}
                                timelineBorderColor={timelineBorderColor}
                                onUpdate={refetchPatients}
                            />
                        </SlideFade>
                    ))}
                </Accordion>
            )}
        </Container>
    );
}

export default MyPatients;