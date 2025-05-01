import React, { useState } from "react";
import {
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Box,
    HStack,
    Avatar,
    Text,
    Grid,
    IconButton,
    useToast,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { DeleteIcon, EmailIcon } from "@chakra-ui/icons";
import { PatientBasicInfo } from "./PatientBasicInfo";
import { MedicalHistory } from "./MedicalHistory";
import { AllergiesAndMedications } from "./AllergiesAndMedications";
import { PatientFiles } from "./PatientFiles";
import axios from "axios";

export const PatientCard = ({ patient, borderColor, token, hoverBg, cardBg, onUpdate }) => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeletePatient = async () => {
        try {
            setIsDeleting(true);

            // Perform DELETE request
            await axios.delete(`/api/doctor/patients/${patient._id}`, {
                headers: {
                    "x-auth-token": token,
                },
            });

            // Show success toast
            toast({
                title: "Patient Removed",
                description: "Patient has been successfully removed from your list.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Refresh the patient list
            onUpdate();
            onClose(); // Close modal after deletion
        } catch (error) {
            // Show error toast
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to remove patient",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AccordionItem
            mb={6}
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
            _hover={{ boxShadow: "md" }}
            transition="all 0.2s"
        >
            <AccordionButton p={4} _hover={{ bg: hoverBg }}>
                <HStack flex="1" spacing={4} textAlign="left">
                    <Avatar size="md" name={patient.username} src="https://bit.ly/broken-link" />
                    <Box flex="1">
                        <Text fontSize="lg" fontWeight="bold">
                            {patient.username}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            <EmailIcon mr={2} />
                            {patient.email}
                        </Text>
                    </Box>
                </HStack>
            </AccordionButton>

            <AccordionPanel pb={6}>
                <Grid templateColumns={{ base: "1fr", lg: "minmax(250px, 1fr) minmax(250px, 1fr) minmax(400px, 1.5fr)" }} gap={6}>
                    <PatientBasicInfo
                        username={patient.username}
                        age={patient.age}
                        height={patient.height}
                        weight={patient.weight}
                        cardBg={cardBg}
                    />

                    <MedicalHistory
                        history={patient.medicalHistory}
                        patientId={patient._id}
                        onUpdate={onUpdate}
                        token={token}
                    />

                    <AllergiesAndMedications
                        allergies={patient.allergies}
                        medications={patient.currentMedications}
                        patientId={patient._id}
                        onUpdate={onUpdate}
                        token={token}
                    />

                    <PatientFiles patientId={patient._id} patientName={patient.username} />
                </Grid>

                {/* Warning and Delete Button */}
                <Box mt={4}>
                    <Alert status="warning" borderRadius="md" mb={4}>
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Warning!</AlertTitle>
                            <AlertDescription>
                                Deleting this patient will remove all related data.
                            </AlertDescription>
                        </Box>
                    </Alert>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        border="1px"
                        borderColor="red.500"
                        borderRadius="md"
                        p={4}
                        bg="red.50"
                    >
                        <Text fontSize="sm" fontWeight="bold" color="red.500">
                            This action can't be undone.
                        </Text>
                        <Button
                            leftIcon={<DeleteIcon />}
                            colorScheme="red"
                            size="sm"
                            onClick={onOpen}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>

                {/* Confirmation Modal */}
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Confirm Deletion</ModalHeader>
                        <ModalBody>
                            Are you sure you want to delete this patient? This action cannot be undone.
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={onClose} mr={3}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeletePatient}
                                isLoading={isDeleting}
                            >
                                Delete
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </AccordionPanel>
        </AccordionItem>
    );
};
