import React, { useState } from 'react';
import {
    Box,
    Container,
    Text,
    Heading,
    Button,
    SimpleGrid,
    Flex,
    Image,
    VStack,
    HStack,
    Icon,
    Card,
    CardBody,
    CardHeader,
    Center,
    Stack,
    Select,
    Input,
    InputLeftElement,
    Textarea,
    List,
    ListItem,
    Link,
    useColorModeValue,
    InputGroup,
    IconButton,
    Grid,
    Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FaFacebookF,
    FaTwitter,
    FaGoogle,
    FaInstagram,
    FaLinkedinIn,
    FaWhatsapp,
    FaPhone,
    FaComments,
    FaShieldAlt,
    FaShoppingBasket,
    FaChevronLeft,
    FaChevronRight,
    FaUser,
    FaEnvelope,
    FaBuilding,
    FaPaperPlane,
} from 'react-icons/fa';

// Import images
import bgImage from '../assets/img/bg_image_1.jpg';
import doctorBg from '../assets/img/bg-doctor.png';
import doctor1 from '../assets/img/doctors/doctor_1.jpg';
import doctor2 from '../assets/img/doctors/doctor_2.jpg';
import doctor3 from '../assets/img/doctors/doctor_3.jpg';
import mobileApp from '../assets/img/mobile_app.png';
import googlePlay from '../assets/img/google_play.svg';
import appStore from '../assets/img/app_store.svg';

// Wrap Chakra components with motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionInputGroup = motion(InputGroup);
const MotionButton = motion(Button);

const About = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const bgOverlay = useColorModeValue('rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)');
    const cardBg = useColorModeValue('white', 'gray.700');

    // For Contact form
    const bgColor = useColorModeValue('white', 'gray.700');
    const shadowColor = useColorModeValue('gray.100', 'gray.600');

    const leftAnimation = {
        hidden: { x: -100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const rightAnimation = {
        hidden: { x: 100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };


    const services = [
        { icon: FaComments, title: 'Chat with doctors', color: 'blue.400' },
        { icon: FaShieldAlt, title: 'AarogyaData Protection', color: 'green.400' },
        { icon: FaShoppingBasket, title: 'AarogyaData Pharmacy', color: 'purple.400' }
    ];

    // Sample doctors data - replace images with your imports
    const doctors = [
        { name: 'Dr. Stein Albert', specialty: 'Cardiology', image: doctor1 },
        { name: 'Dr. Alexa Melvin', specialty: 'Dental', image: doctor2 },
        { name: 'Dr. Rebecca Steffany', specialty: 'General Health', image: doctor3 },
        { name: 'Dr. John Smith', specialty: 'Neurology', image: doctor1 },
        { name: 'Dr. Sarah Wilson', specialty: 'Pediatrics', image: doctor2 },
        { name: 'Dr. Mike Johnson', specialty: 'Orthopedics', image: doctor3 },
    ];

    const doctorsPerPage = 3;
    const totalPages = Math.ceil(doctors.length / doctorsPerPage);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex + doctorsPerPage >= doctors.length ? 0 : prevIndex + doctorsPerPage
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - doctorsPerPage < 0 ?
                Math.max(0, doctors.length - doctorsPerPage) :
                prevIndex - doctorsPerPage
        );
    };

    const visibleDoctors = doctors.slice(currentIndex, currentIndex + doctorsPerPage);

    return (
        <Box>
            {/* Hero Section */}
            <Box
                position="relative"
                h="500px"
                bgImage={`url(${bgImage})`}
                bgPosition="center"
                bgRepeat="no-repeat"
                bgSize="cover"
            >
                <Box position="absolute" top={0} left={0} w="100%" h="100%" bg={bgOverlay} />
                <Container maxW="container.xl" centerContent position="relative" pt={20}>
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        textAlign="center"
                        color="white"
                    >
                        <Text fontSize="xl" mb={4}>Let's make your life happier</Text>
                        <Heading as="h1" size="2xl" mb={8}>Healthy Living</Heading>
                        <Button colorScheme="blue" size="lg">Let's Consult</Button>
                    </MotionBox>
                </Container>
            </Box>

            {/* Services Section */}
            <Container maxW="container.xl" mt="-16">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                    {services.map((service, index) => (
                        <MotionBox
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <Card bg={cardBg} shadow="xl">
                                <CardBody>
                                    <VStack>
                                        <Box p={4} borderRadius="full" bg={service.color}>
                                            <Icon as={service.icon} boxSize={6} color="white" />
                                        </Box>
                                        <Text fontSize="lg" fontWeight="bold">{service.title}</Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Container>

            {/* Welcome Section */}
            <Container maxW="container.xl" py={20} display="flex" alignItems="center" minH="100vh">
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
                    <MotionBox
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Heading mb={6} textAlign="center">Welcome to Your Health Center</Heading>
                        <Text mb={8} color="gray.600" textAlign="center">
                            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
                            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
                            et justo duo dolores et ea rebum. Accusantium aperiam earum ipsa eius, inventore nemo labore
                            eaque porro consequatur ex aspernatur. Explicabo, excepturi accusantium! Placeat voluptates
                            esse ut optio facilis!
                        </Text>
                        <Button colorScheme="blue" mx="auto" display="block">Learn More</Button>
                    </MotionBox>
                    <MotionBox
                        initial={{ opacity: 0, x: 200 }} // Increased x for sliding from the right edge
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        display="flex"
                        justifyContent="center"
                    >
                        <Image boxSize="410px" src={doctorBg} alt="Doctor" />
                    </MotionBox>
                </SimpleGrid>
            </Container>


            {/* Doctors Section */}
            <Box bg="gray.50" py={16} position="relative">
                <Container maxW="container.xl">
                    <Heading textAlign="center" mb={12}>Our Doctors</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                        {visibleDoctors.map((doctor, index) => (
                            <MotionBox
                                key={currentIndex + index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <Card
                                    overflow="hidden"
                                    role="group"
                                    position="relative"
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: 'translateY(-5px)',
                                        boxShadow: 'xl'
                                    }}
                                >
                                    <Box position="relative">
                                        <Image
                                            src={doctor.image}
                                            alt={doctor.name}
                                            h="250px"
                                            w="100%"
                                            objectFit="cover"
                                        />
                                        {/* Overlay with icons */}
                                        <Box
                                            position="absolute"
                                            top="0"
                                            left="0"
                                            right="0"
                                            bottom="0"
                                            bg="blackAlpha.600"
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            opacity="0"
                                            transition="all 0.3s"
                                            _groupHover={{ opacity: 1 }}
                                        >
                                            <HStack spacing={4}>
                                                <IconButton
                                                    aria-label="Call doctor"
                                                    icon={<FaPhone />}
                                                    rounded="full"
                                                    size="lg"
                                                    colorScheme="whiteAlpha"
                                                    variant="solid"
                                                    _hover={{ bg: 'blue.500' }}
                                                />
                                                <IconButton
                                                    aria-label="WhatsApp doctor"
                                                    icon={<FaWhatsapp />}
                                                    rounded="full"
                                                    size="lg"
                                                    colorScheme="whiteAlpha"
                                                    variant="solid"
                                                    _hover={{ bg: 'green.500' }}
                                                />
                                            </HStack>
                                        </Box>
                                    </Box>
                                    <CardBody>
                                        <VStack align="start">
                                            <Heading size="md">{doctor.name}</Heading>
                                            <Text color="gray.600">{doctor.specialty}</Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </MotionBox>
                        ))}
                    </SimpleGrid>

                    {/* Navigation Arrows */}
                    {doctors.length > doctorsPerPage && (
                        <HStack
                            justify="center"
                            mt={8}
                            spacing={4}
                        >
                            <IconButton
                                aria-label="Previous doctors"
                                icon={<FaChevronLeft />}
                                onClick={prevSlide}
                                isDisabled={currentIndex === 0}
                                colorScheme="blue"
                                variant="outline"
                                rounded="full"
                                size="lg"
                                _hover={{
                                    transform: 'scale(1.1)',
                                }}
                                transition="all 0.2s"
                            />
                            <IconButton
                                aria-label="Next doctors"
                                icon={<FaChevronRight />}
                                onClick={nextSlide}
                                isDisabled={currentIndex + doctorsPerPage >= doctors.length}
                                colorScheme="blue"
                                variant="outline"
                                rounded="full"
                                size="lg"
                                _hover={{
                                    transform: 'scale(1.1)',
                                }}
                                transition="all 0.2s"
                            />
                        </HStack>
                    )}
                </Container>
            </Box>

            {/* Appointment Form */}
            <Container maxW="container.xl" py={16}>
                <VStack spacing={8}>
                    <MotionBox
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Heading
                            textAlign="center"
                            bgGradient="linear(to-r, blue.400, blue.600)"
                            bgClip="text"
                            fontSize={{ base: "3xl", md: "4xl" }}
                            fontWeight="bold"
                        >
                            Get in Touch
                        </Heading>
                        <Text
                            textAlign="center"
                            color="gray.500"
                            mt={2}
                            fontSize={{ base: "md", md: "lg" }}
                        >
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </Text>
                    </MotionBox>

                    <Box
                        w="100%"
                        maxW="800px"
                        bg={bgColor}
                        borderRadius="xl"
                        p={{ base: 6, md: 8 }}
                        boxShadow={`0 0 24px ${shadowColor}`}
                    >
                        <VStack spacing={6} as="form">
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                                {/* Left animated fields */}
                                <VStack spacing={6}>
                                    <MotionInputGroup
                                        variants={leftAnimation}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.2 }}
                                    >
                                        <InputLeftElement pointerEvents="none">
                                            <FaUser color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Your Name"
                                            size="lg"
                                            borderRadius="full"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                        />
                                    </MotionInputGroup>

                                    <MotionInputGroup
                                        variants={leftAnimation}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.4 }}
                                    >
                                        <InputLeftElement pointerEvents="none">
                                            <FaPhone color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Phone Number"
                                            size="lg"
                                            borderRadius="full"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                        />
                                    </MotionInputGroup>
                                </VStack>

                                {/* Right animated fields */}
                                <VStack spacing={6}>
                                    <MotionInputGroup
                                        variants={rightAnimation}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.3 }}
                                    >
                                        <InputLeftElement pointerEvents="none">
                                            <FaEnvelope color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Email Address"
                                            size="lg"
                                            borderRadius="full"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                        />
                                    </MotionInputGroup>

                                    <MotionInputGroup
                                        variants={rightAnimation}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.5 }}
                                    >
                                        <InputLeftElement pointerEvents="none">
                                            <FaBuilding color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Company Name"
                                            size="lg"
                                            borderRadius="full"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                        />
                                    </MotionInputGroup>
                                </VStack>
                            </SimpleGrid>

                            {/* Message field with bottom animation */}
                            <MotionBox
                                w="100%"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none" h="100%" pl={2}>
                                        <FaComments color="gray" />
                                    </InputLeftElement>
                                    <Textarea
                                        placeholder="Your Message"
                                        size="lg"
                                        pl={12}
                                        rows={6}
                                        borderRadius="xl"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                    />
                                </InputGroup>
                            </MotionBox>

                            {/* Submit button with scale animation */}
                            <MotionButton
                                size="lg"
                                colorScheme="blue"
                                w={{ base: "100%", md: "auto" }}
                                borderRadius="full"
                                px={12}
                                rightIcon={<FaPaperPlane />}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.7,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                }}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                }}
                            >
                                Send Message
                            </MotionButton>
                        </VStack>
                    </Box>
                </VStack>
            </Container>

            {/* App Download Section */}
            <Box bg="blue.50" py={16}>
                <Container maxW="container.xl">
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
                        <Image src={mobileApp} alt="Mobile App" />
                        <VStack align="start" spacing={6}>
                            <Heading size="xl">Get easy access of all features using AarogyaData Application</Heading>
                            <HStack spacing={4}>
                                <Image src={googlePlay} alt="Google Play" h="50px" />
                                <Image src={appStore} alt="App Store" h="50px" />
                            </HStack>
                        </VStack>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Footer */}
            <Box bg="gray.800" color="white" py={16}>
                <Container maxW="container.xl">
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                        <VStack align="start">
                            <Heading size="md" mb={4}>Company</Heading>
                            <List spacing={2}>
                                <ListItem><Link>About Us</Link></ListItem>
                                <ListItem><Link>Career</Link></ListItem>
                                <ListItem><Link>Editorial Team</Link></ListItem>
                                <ListItem><Link>Protection</Link></ListItem>
                            </List>
                        </VStack>
                        <VStack align="start">
                            <Heading size="md" mb={4}>More</Heading>
                            <List spacing={2}>
                                <ListItem><Link>Terms & Condition</Link></ListItem>
                                <ListItem><Link>Privacy</Link></ListItem>
                                <ListItem><Link>Advertise</Link></ListItem>
                                <ListItem><Link>Join as Doctors</Link></ListItem>
                            </List>
                        </VStack>
                        <VStack align="start">
                            <Heading size="md" mb={4}>Our Partner</Heading>
                            <List spacing={2}>
                                <ListItem><Link>One-Fitness</Link></ListItem>
                                <ListItem><Link>One-Drugs</Link></ListItem>
                                <ListItem><Link>One-Live</Link></ListItem>
                            </List>
                        </VStack>
                        <VStack align="start">
                            <Heading size="md" mb={4}>Contact</Heading>
                            <Text>351 Willow Street Franklin, MA 02038</Text>
                            <Link>701-573-7582</Link>
                            <Link>healthcare@temporary.net</Link>
                            <Heading size="md" mt={6} mb={4}>Social Media</Heading>
                            <HStack spacing={4}>
                                <IconButton
                                    aria-label="Facebook"
                                    icon={<FaFacebookF />}
                                    rounded="full"
                                    variant="ghost"
                                />
                                <IconButton
                                    aria-label="Twitter"
                                    icon={<FaTwitter />}
                                    rounded="full"
                                    variant="ghost"
                                />
                                <IconButton
                                    aria-label="Google"
                                    icon={<FaGoogle />}
                                    rounded="full"
                                    variant="ghost"
                                />
                                <IconButton
                                    aria-label="Instagram"
                                    icon={<FaInstagram />}
                                    rounded="full"
                                    variant="ghost"
                                />
                                <IconButton
                                    aria-label="LinkedIn"
                                    icon={<FaLinkedinIn />}
                                    rounded="full"
                                    variant="ghost"
                                />
                            </HStack>
                        </VStack>
                    </SimpleGrid>
                    <Divider my={8} />
                    <Text textAlign="center">
                        Copyright © 2024 AarogyaData. All rights reserved.
                    </Text>
                </Container>
            </Box>
        </Box>
    );
};

export default About;