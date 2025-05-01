import React, { useRef, useState, useCallback } from 'react';
import {
    VStack,
    Button,
    Input,
    Box,
    Progress,
    Text,
    Flex,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Icon
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { LiaFilePrescriptionSolid } from 'react-icons/lia';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import { htmlToText } from 'html-to-text';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import { FaFilePdf, FaFileAlt, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage } from 'react-icons/fa';
import './FileUploadSection.css'

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    return (
        <Flex wrap="wrap" gap={2} mb={4}>
            <IconButton
                icon={<FaBold />}
                onClick={() => editor.chain().focus().toggleBold().run()}
                colorScheme={editor.isActive('bold') ? 'blue' : 'gray'}
                aria-label="Bold"
            />
            <IconButton
                icon={<FaItalic />}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                colorScheme={editor.isActive('italic') ? 'blue' : 'gray'}
                aria-label="Italic"
            />
            <IconButton
                icon={<FaUnderline />}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                colorScheme={editor.isActive('underline') ? 'blue' : 'gray'}
                aria-label="Underline"
            />
            <IconButton
                icon={<FaAlignLeft />}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                colorScheme={editor.isActive({ textAlign: 'left' }) ? 'blue' : 'gray'}
                aria-label="Align Left"
            />
            <IconButton
                icon={<FaAlignCenter />}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                colorScheme={editor.isActive({ textAlign: 'center' }) ? 'blue' : 'gray'}
                aria-label="Align Center"
            />
            <IconButton
                icon={<FaAlignRight />}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                colorScheme={editor.isActive({ textAlign: 'right' }) ? 'blue' : 'gray'}
                aria-label="Align Right"
            />
            <IconButton
                icon={<FaImage />}
                onClick={() => {
                    const url = window.prompt('Enter image URL');
                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                }}
                aria-label="Insert Image"
            />
        </Flex>
    );
};

const FileUploadSection = ({
    files,
    progress,
    progressShow,
    handleUpload,
    handleSingleUpload,
    handleFileChange,
    setFiles,
}) => {
    const [showFileInput, setShowFileInput] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const inputRef = useRef();
    const [editorContent, setEditorContent] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            Color,
            TextStyle,
            FontFamily,
            Underline,
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setEditorContent(editor.getHTML());
        },
    });

    const resetFileInput = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setShowFileInput(false);
    };

    const handleUploadAsPDF = async () => {
        try {
            // Initialize jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });
    
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let currentY = 10; // Initial vertical position
    
            // Extract content from editor
            const tempElement = document.createElement('div');
            tempElement.innerHTML = editorContent;
    
            const paragraphs = tempElement.querySelectorAll('p');
    
            for (const paragraph of paragraphs) {
                const images = paragraph.querySelectorAll('img');
    
                // Handle images separately
                if (images.length > 0) {
                    for (const image of images) {
                        // Use html2pdf to process the image and convert to PDF blob
                        const imageContainer = document.createElement('div');
                        imageContainer.appendChild(image.cloneNode(true));
    
                        const options = {
                            margin: [0, 0, 0, 0], // No margin for the image
                            filename: 'temp.pdf',
                            html2canvas: { scale: 2, useCORS: true },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        };
    
                        const imageBlob = await html2pdf().from(imageContainer).set(options).outputPdf('blob');
    
                        // Read the image PDF and embed it into the main PDF
                        const imagePdf = await pdf.load(imageBlob);
                        const imgWidth = pageWidth - 20; // Maintain margins
                        const imgAspectRatio = imagePdf.internal.pageSize.getWidth() / imagePdf.internal.pageSize.getHeight();
                        const imgHeight = imgWidth / imgAspectRatio;
    
                        if (currentY + imgHeight > pageHeight - 10) {
                            pdf.addPage();
                            currentY = 10;
                        }
    
                        // Add the image PDF as a page or merge it into the main PDF
                        pdf.addImage(imagePdf, 'JPEG', 10, currentY, imgWidth, imgHeight);
                        currentY += imgHeight + 10; // Margin after image
                    }
                }
    
                // Process text
                const textContent = paragraph.textContent.trim();
                if (textContent) {
                    const textLines = pdf.splitTextToSize(textContent, pageWidth - 20);
                    const textHeight = textLines.length * 10;
    
                    if (currentY + textHeight > pageHeight - 10) {
                        pdf.addPage();
                        currentY = 10;
                    }
    
                    pdf.text(textLines, 10, currentY);
                    currentY += textHeight + 5;
                }
            }
    
            // Generate the final PDF blob
            const pdfBlob = pdf.output('blob');
    
            // Create a File object
            const file = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });
    
            console.log('PDF file:', file);
    
            // Handle the upload
            handleSingleUpload(resetFileInput, file);
            onClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };


    const handleUploadAsTxt = async () => {
        try {
            const plainText = htmlToText(editorContent, { wordwrap: false });
            const blob = new Blob([plainText], { type: 'text/plain' });
            const file = new File([blob], 'document.txt', { type: 'text/plain' });

            // Use Promise to ensure state is updated before proceeding
            // await new Promise((resolve) => {
            //     setFiles([file]);
            //     resolve();
            // });

            // Now files are guaranteed to be updated
            // console.log("checking files before uploading ", files)
            handleSingleUpload(resetFileInput, file);
            // console.log("complete")

            onClose();
        } catch (error) {
            console.error('Text file generation error:', error);
        }
    };

    return (
        <VStack spacing={4} bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Flex justify="space-between" w="full">
                {!showFileInput ? (
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        onClick={() => setShowFileInput(true)}
                        flex={1}
                    >
                        Upload Files
                    </Button>
                ) : (
                    <Flex direction="column" align="center" w="full">
                        <Input
                            ref={inputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            p={1}
                            border="2px dashed"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'blue.500' }}
                            h="150px"
                            w="full"
                        />
                        <Flex w="full" gap={4} mt={4}>
                            <Button
                                colorScheme="blue"
                                onClick={() => handleUpload(resetFileInput)}
                                isDisabled={!files || files.length === 0}
                                flex={1}
                            >
                                Submit
                            </Button>
                            <Button
                                onClick={() => {
                                    resetFileInput();
                                    setFiles([]);
                                }}
                                flex={1}
                            >
                                Cancel
                            </Button>
                        </Flex>
                    </Flex>

                )}
                {!showFileInput &&
                    <Button
                        leftIcon={<LiaFilePrescriptionSolid />}
                        colorScheme="green"
                        onClick={onOpen}
                        ml={2}
                    >
                        Create Document
                    </Button>
                }

            </Flex>

            {progressShow && (
                <Box w="100%">
                    <Progress
                        value={progress}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="full"
                    />
                    <Text mt={2} textAlign="center">
                        {progress}% Uploaded
                    </Text>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent minH="400px" minW="700px" bg="white" borderColor="gray.200" borderWidth="1px" borderRadius="md">
                    <ModalHeader>Text Editor</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box className="tiptap-editor">
                            <MenuBar editor={editor} />
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={4}
                                minH="200px"
                            >
                                <EditorContent editor={editor} />
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Text mr={4}>Export as:</Text>
                        <Button colorScheme="blue" mr={3} onClick={handleUploadAsPDF}>
                            <Icon as={FaFilePdf} mr={2} /> PDF
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleUploadAsTxt}
                        >
                            <Icon as={FaFileAlt} mr={2} /> TXT
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

export default FileUploadSection;