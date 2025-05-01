import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Box
} from '@chakra-ui/react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import "@cyntler/react-doc-viewer/dist/index.css";

const FileViewerModal = ({ isOpen, onClose, selectedFile }) => {

    console.log("selectedFile", selectedFile)
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>File Viewer</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedFile && (
                        <Box height="calc(100vh - 80px)" overflowY="auto">
                            <DocViewer
                                documents={[{ uri: selectedFile.firebase_path }]}
                                pluginRenderers={DocViewerRenderers}
                                style={{
                                    height: '100%',
                                    width: '100%'
                                }}
                            />
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default FileViewerModal;