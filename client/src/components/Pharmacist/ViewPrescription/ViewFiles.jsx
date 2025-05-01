import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, Heading, useDisclosure } from '@chakra-ui/react';
import PharmacistFileGrid from './PharmacistFileGrid';
import FileViewerModal from '../../Doctor/MyPatients/UploadAndViewFiles/FileViewerModal';
import { usePharmacistFileManagement } from "../../../hooks/usePharmacistFileManagement";
import { useParams } from 'react-router-dom';
import PharmacistFileViewModal from './PharmacistFileViewModal';

const ViewFiles = ({ }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { id } = useParams();

    const {
        uploadedPrescriptions,
        handleDownload,
        fetchUploadedFiles
    } = usePharmacistFileManagement(id);


    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const handleView = (doc) => {
        setSelectedFile(doc);
        onOpen();
    };

    return (
        <Box>
            <Heading as='h3' size='lg'>Prescriptions</Heading>
            <VStack spacing={6} p={6} bg="gray.50" minH="10vh">
                <Box w="100%" maxW="1200px">

                    <PharmacistFileGrid
                        uploadedPrescriptions={uploadedPrescriptions}
                        handleView={handleView}
                        handleDownload={handleDownload}
                    />
                </Box>

                <PharmacistFileViewModal
                    isOpen={isOpen}
                    onClose={onClose}
                    selectedFile={selectedFile}
                />
            </VStack>
        </Box>
    );
};

export default ViewFiles;