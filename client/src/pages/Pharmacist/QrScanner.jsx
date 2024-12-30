import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import {
    Box,
    Button,
    Text,
    Heading,
    VStack,
    HStack,
    useToast,
    Icon,
    Link,
    Card,
    CardBody,
    Spinner,
    useColorModeValue
} from '@chakra-ui/react';
import { FaQrcode, FaUpload, FaExternalLinkAlt, FaTimes, FaCheck } from 'react-icons/fa';

const QrScannerComponent = () => {
    const [scanResult, setScanResult] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isURL, setIsURL] = useState(false);

    const videoRef = useRef(null);
    const qrScannerRef = useRef(null);
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (isScannerOpen && videoRef.current && !qrScannerRef.current) {
            initializeScanner();
        }
    }, [isScannerOpen]);

    useEffect(() => {
        if (scanResult) {
            try {
                new URL(scanResult);
                setIsURL(true);
            } catch {
                setIsURL(false);
            }
        }
    }, [scanResult]);

    const initializeScanner = async () => {
        try {
            setIsScanning(true);
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                result => {
                    setScanResult(result.data);
                    stopScanner();
                    showSuccessToast();
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );
            await qrScannerRef.current.start();
        } catch (error) {
            console.error('Failed to initialize scanner:', error);
            setIsScannerOpen(false);
            showErrorToast('Failed to start camera');
        } finally {
            setIsScanning(false);
        }
    };

    const stopScanner = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
        setIsScannerOpen(false);
    };

    const toggleScanner = () => {
        if (isScannerOpen) {
            stopScanner();
        } else {
            setIsScannerOpen(true);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setIsLoading(true);
            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: true,
            });
            setScanResult(result.data);
            showSuccessToast();
        } catch (error) {
            console.error('Failed to scan QR code from image:', error);
            setScanResult('');
            showErrorToast('Failed to scan QR code from image');
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccessToast = () => {
        toast({
            title: 'QR Code Scanned!',
            description: 'Successfully scanned the QR code',
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top',
        });
    };

    const showErrorToast = (message) => {
        toast({
            title: 'Error',
            description: message,
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
        });
    };

    return (
        <VStack spacing={8}>
            <Card
                w="full"
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="lg"
            >
                <CardBody>
                    <VStack spacing={6}>
                        <Heading size="lg" textAlign="center" color="teal.500">
                            QR Code Scanner
                        </Heading>

                        <HStack spacing={4} justifyContent="center">
                            <Button
                                colorScheme="teal"
                                size="lg"
                                onClick={toggleScanner}
                                leftIcon={isScannerOpen ? <FaTimes /> : <FaQrcode />}
                                isLoading={isScanning}
                                loadingText="Initializing..."
                            >
                                {isScannerOpen ? 'Close Scanner' : 'Scan QR Code'}
                            </Button>

                            <Box>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="qr-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    as="label"
                                    htmlFor="qr-upload"
                                    colorScheme="blue"
                                    size="lg"
                                    cursor="pointer"
                                    leftIcon={<FaUpload />}
                                    isLoading={isLoading}
                                    loadingText="Processing..."
                                >
                                    Upload QR Image
                                </Button>
                            </Box>
                        </HStack>

                        {isScannerOpen && (
                            <Box
                                position="relative"
                                width="100%"
                                maxW="400px"
                                height="400px"
                                bg="black"
                                borderRadius="lg"
                                overflow="hidden"
                                boxShadow="2xl"
                            >
                                <video
                                    ref={videoRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                                {isScanning && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="50%"
                                        transform="translate(-50%, -50%)"
                                    >
                                        <Spinner size="xl" color="white" />
                                    </Box>
                                )}
                            </Box>
                        )}

                        {scanResult && (
                            <Card
                                w="full"
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                p={4}
                                borderRadius="md"
                            >
                                <VStack spacing={3}>
                                    <HStack>
                                        <Icon as={FaCheck} color="green.500" />
                                        <Heading size="sm">Scan Result</Heading>
                                    </HStack>

                                    <Text fontSize="md" wordBreak="break-all">
                                        {scanResult}
                                    </Text>

                                    {isURL && (
                                        <Button
                                            as={Link}
                                            href={scanResult}
                                            colorScheme="green"
                                            target="_self"
                                            rightIcon={<FaExternalLinkAlt />}
                                            size="sm"
                                        >
                                            Open Link
                                        </Button>
                                    )}
                                </VStack>
                            </Card>
                        )}
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
};

export default QrScannerComponent;