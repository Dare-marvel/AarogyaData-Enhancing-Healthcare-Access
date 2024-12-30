import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, Heading, useDisclosure } from '@chakra-ui/react';
import FileUploadSection from './UploadAndViewFiles/FileUploadSection';
import FileGrid from './UploadAndViewFiles/FileGrid';
import FileViewerModal from './UploadAndViewFiles/FileViewerModal';
import { useFileUpload } from '../../../hooks/useFileUpload';
import { useFileManagement } from '../../../hooks/useFileManagement';

const UploadAndViewFiles = ({ title, type, patientId,patientName }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        uploadedDocs,
        handleDelete,
        handleDownload,
        fetchUploadedFiles
    } = useFileManagement(patientId, type);

    const {
        files,
        progress,
        progressShow,
        handleUpload,
        handleSingleUpload,
        handleFileChange,
        setFiles
    } = useFileUpload(patientId, type, fetchUploadedFiles,patientName);

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const handleView = (doc) => {
        setSelectedFile(doc);
        onOpen();
    };

    return (
        <Box>
            <Heading as='h3' size='lg'>{title}</Heading>
            <VStack spacing={6} p={6} bg="gray.50" minH="10vh">
                <Box w="100%" maxW="1200px">
                    <FileUploadSection
                        files={files}
                        progress={progress}
                        progressShow={progressShow}
                        handleUpload={handleUpload}
                        handleSingleUpload={handleSingleUpload}
                        handleFileChange={handleFileChange}
                        setFiles={setFiles}
                    />
                    <FileGrid
                        uploadedDocs={uploadedDocs}
                        handleView={handleView}
                        handleDownload={handleDownload}
                        handleDelete={handleDelete}
                        patientId={patientId}
                        type={type}
                    />
                </Box>

                <FileViewerModal
                    isOpen={isOpen}
                    onClose={onClose}
                    selectedFile={selectedFile}
                />
            </VStack>
        </Box>
    );
};

export default UploadAndViewFiles;