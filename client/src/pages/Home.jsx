import {
    Box,
    Button,
    Flex,
    Heading,
    Image,
    Text,
    Grid,
    Avatar,
    HStack,
    VStack,
    IconButton,
    useColorModeValue,
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import doctor from '../assets/doctor.jpg';
import appointment from '../assets/appointment.png';
import collaboration from '../assets/collaboration.png';
import secure_data from '../assets/secure_data.png';

const Home = () => {
    // Framer Motion Animation Configs
    const MotionBox = motion(Box);
    const colorMode = useColorModeValue("gray.50", "gray.900");

    // Hook to trigger animations when section comes into view (only once)
    const [refWhy, inViewWhy] = useInView({ triggerOnce: true, threshold: 0.2 });
    const [refFeatures, inViewFeatures] = useInView({ triggerOnce: true, threshold: 0.2 });
    const [refTestimonials, inViewTestimonials] = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
        <Box bg={colorMode}>
            {/* Hero Section - Why Our System */}
            <Flex
                justify="space-between"
                align="center"
                p={10}
                bg="teal.100"
                ref={refWhy}
            >
                <MotionBox
                    flex={1}
                    initial={{ opacity: 0, x: -100 }}
                    animate={inViewWhy ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <Heading size="2xl" mb={5}>
                        Why Choose Our Medical System?
                    </Heading>
                    <Text mb={5}>
                        Our platform ensures 24/7 availability, secure patient data, real-time collaboration between healthcare professionals, and seamless prescription handling.
                    </Text>
                    <Button size="lg" colorScheme="teal">
                        Learn More
                    </Button>
                </MotionBox>
                <MotionBox
                    flex={1}
                    initial={{ opacity: 0, x: 100 }}
                    animate={inViewWhy ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <Image src={doctor} alt="Why Choose Us" borderRadius="lg" shadow="lg" />
                </MotionBox>
            </Flex>

            {/* <Flex align="center" my={4}>
                <Box
                    as="svg"
                    width="100%"
                    height="20"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                >
                    <polyline points="0,10 10,10 15,5 20,15 25,10 30,10 35,5 40,15 45,10 50,10 55,0 60,20 65,10 70,10 75,5 80,15 85,10 90,10 95,5 100,15" />
                </Box>
            </Flex> */}

            {/* Features Section */}
            <Box p={10} bg="blue.50" ref={refFeatures}>
                <Heading textAlign="center" mb={10} textDecoration="underline" textDecorationColor="teal.500">
                    Features of Our System
                </Heading>

                <Grid templateColumns="repeat(2, 1fr)" gap={10} alignItems="center">
                    {/* Feature 1 */}
                    <MotionBox
                        as={Flex}
                        flexDirection="column"
                        justifyContent="center"
                        initial={{ opacity: 0, x: -100 }}
                        animate={inViewFeatures ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Heading size="lg" mb={3} textAlign="center" borderBottom="4px solid teal" pb={1}>
                            Efficient Appointment Management
                        </Heading>
                        <UnorderedList spacing={3} textAlign="center" listStyleType="none">
                            <ListItem fontSize="lg">Book appointments seamlessly</ListItem>
                            <ListItem fontSize="lg">Track past and upcoming appointments</ListItem>
                            <ListItem fontSize="lg">Reschedule or cancel appointments easily</ListItem>
                            <ListItem fontSize="lg">Receive appointment reminders</ListItem>
                        </UnorderedList>
                    </MotionBox>
                    <MotionBox
                        as={Flex}
                        justifyContent="center"
                        initial={{ opacity: 0, x: 100 }}
                        animate={inViewFeatures ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src={appointment}
                            boxSize="150px"
                            alt="Appointment Management"
                            borderRadius="lg"
                            shadow="md"
                        />
                    </MotionBox>

                    {/* Feature 2 */}
                    <MotionBox
                        as={Flex}
                        justifyContent="center"
                        initial={{ opacity: 0, x: 100 }}
                        animate={inViewFeatures ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src={collaboration}
                            boxSize="150px"
                            alt="Collaboration"
                            borderRadius="lg"
                            shadow="md"
                        />
                    </MotionBox>
                    <MotionBox
                        as={Flex}
                        flexDirection="column"
                        justifyContent="center"
                        initial={{ opacity: 0, x: -100 }}
                        animate={inViewFeatures ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Heading size="lg" mb={3} textAlign="center" borderBottom="4px solid teal" pb={1}>
                            Real-Time Collaboration
                        </Heading>
                        <UnorderedList spacing={3} textAlign="center" listStyleType="none">
                            <ListItem fontSize="lg">Communicate seamlessly with doctors</ListItem>
                            <ListItem fontSize="lg">Share data and updates in real time</ListItem>
                            <ListItem fontSize="lg">Coordinate treatment plans effectively</ListItem>
                            <ListItem fontSize="lg">Pharmacists and doctors work in sync</ListItem>
                        </UnorderedList>
                    </MotionBox>

                    {/* Feature 3 */}
                    <MotionBox
                        as={Flex}
                        flexDirection="column"
                        justifyContent="center"
                        initial={{ opacity: 0, x: -100 }}
                        animate={inViewFeatures ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Heading size="lg" mb={3} textAlign="center" borderBottom="4px solid teal" pb={1}>
                            Secure Patient Data
                        </Heading>
                        <UnorderedList spacing={3} textAlign="center" listStyleType="none">
                            <ListItem fontSize="lg">End-to-end encryption for health records</ListItem>
                            <ListItem fontSize="lg">Secure access to sensitive information</ListItem>
                            <ListItem fontSize="lg">Strict data privacy policies</ListItem>
                            <ListItem fontSize="lg">Ensure confidentiality and safety</ListItem>
                        </UnorderedList>
                    </MotionBox>
                    <MotionBox
                        as={Flex}
                        justifyContent="center"
                        initial={{ opacity: 0, x: 100 }}
                        animate={inViewFeatures ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src={secure_data}
                            boxSize="150px"
                            alt="Secure Data"
                            borderRadius="lg"
                            shadow="md"
                        />
                    </MotionBox>
                </Grid>
            </Box>

            {/* <Flex align="center" my={4}>
                <Box
                    as="svg"
                    width="100%"
                    height="20"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                >
                    <polyline points="0,10 10,10 15,5 20,15 25,10 30,10 35,5 40,15 45,10 50,10 55,0 60,20 65,10 70,10 75,5 80,15 85,10 90,10 95,5 100,15" />
                </Box>
            </Flex> */}

            {/* Testimonials Section */}
            <Box p={10} bg="green.100" ref={refTestimonials}>
                <Heading textAlign="center" mb={10}>
                    Testimonials
                </Heading>
                <Flex justify="space-around">
                    {/* Testimonial 1 */}
                    <MotionBox
                        w="300px"
                        p={5}
                        bg="white"
                        borderRadius="lg"
                        shadow="lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={inViewTestimonials ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Text mb={5}>
                            "Amazing experience using this platform!"
                        </Text>
                        <HStack>
                            <Avatar name="Dr. John Doe" />
                            <VStack align="start">
                                <Text fontWeight="bold">Dr. John Doe</Text>
                                <Text fontSize="sm">Cardiologist</Text>
                            </VStack>
                        </HStack>
                    </MotionBox>

                    {/* Testimonial 2 */}
                    <MotionBox
                        w="300px"
                        p={5}
                        bg="white"
                        borderRadius="lg"
                        shadow="lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={inViewTestimonials ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Text mb={5}>
                            "Highly reliable and easy to use!"
                        </Text>
                        <HStack>
                            <Avatar name="Dr. Jane Smith" />
                            <VStack align="start">
                                <Text fontWeight="bold">Dr. Jane Smith</Text>
                                <Text fontSize="sm">Pediatrician</Text>
                            </VStack>
                        </HStack>
                    </MotionBox>

                    {/* Testimonial 3 */}
                    <MotionBox
                        w="300px"
                        p={5}
                        bg="white"
                        borderRadius="lg"
                        shadow="lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={inViewTestimonials ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <Text mb={5}>
                            "The best healthcare platform I've used."
                        </Text>
                        <HStack>
                            <Avatar name="Dr. Emily Brown" />
                            <VStack align="start">
                                <Text fontWeight="bold">Dr. Emily Brown</Text>
                                <Text fontSize="sm">Surgeon</Text>
                            </VStack>
                        </HStack>
                    </MotionBox>
                </Flex>
            </Box>

            {/* Footer Section */}
            <Box p={10} bg="gray.800" color="white">
                <Flex justify="space-between" align="center" mb={5}>
                    {/* Links */}
                    <VStack align="start">
                        <Heading size="md">Important Links</Heading>
                        <Text>Home</Text>
                        <Text>Features</Text>
                        <Text>Testimonials</Text>
                        <Text>Contact Us</Text>
                    </VStack>

                    {/* Contact */}
                    <VStack align="start">
                        <Heading size="md">Contact Us</Heading>
                        <Text>Email: support@medsystem.com</Text>
                        <Text>Phone: +1 234 567 890</Text>
                    </VStack>

                    {/* Placeholder */}
                    <VStack align="start">
                        <Heading size="md">Our Mission</Heading>
                        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                    </VStack>
                </Flex>

                <Flex justify="space-between" align="center">
                    <Text>© 2024 All rights reserved</Text>
                    <HStack spacing={5}>
                        <IconButton icon={<FaFacebook />} aria-label="Facebook" />
                        <IconButton icon={<FaTwitter />} aria-label="Twitter" />
                        <IconButton icon={<FaInstagram />} aria-label="Instagram" />
                    </HStack>
                </Flex>
            </Box>
        </Box>
    );
};

export default Home;
