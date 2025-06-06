import React from 'react';
import { Box, Flex, Link, Button, Text, useColorModeValue,Image } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FaUserMd,
  FaUsers,
  // FaClinicMedical,
  FaQrcode,
  // FaPrescription,
  FaCalendarCheck,
  FaUser,
  // FaBoxes,
  FaUserInjured,
  FaCalendarAlt,
  FaPrescriptionBottleAlt,
  FaInfo, FaHome, FaNewspaper,
  // FaFilePrescription
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../context/AuthContext';
import GoogleTranslate from './GoogleTranslate';
import Logo from '../assets/Logo/aarogya-data-logo.png';

function Navbar() {
  const { user } = AuthState();
  const token = user?.token || null;
  const role = user?.role || null;
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = useColorModeValue('white', 'gray.800');
  // const borderColor = useColorModeValue('teal.500', 'teal.300');

  // Function to get role-specific icon and color
  const getRoleSpecifics = () => {
    switch (role) {
      case 'doctor':
        return {
          Icon: FaUserMd,
          color: '#2C7A7B', // teal.700
          title: 'Doctor'
        };
      case 'patient':
        return {
          Icon: FaUserInjured,
          color: '#319795', // teal.600
          title: 'Patient'
        };
      case 'pharmacist':
        return {
          Icon: FaPrescriptionBottleAlt,
          color: '#38B2AC', // teal.500
          title: 'Pharmacist'
        };
      default:
        return {
          Icon: FaUser,
          color: '#4FD1C5', // teal.400
          title: ''
        };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/auth');
  };

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        as={RouterLink}
        to={to}
        display="flex"
        alignItems="center"
        px={4}
        py={2}
        mr={4}
        fontSize="md"
        fontWeight="medium"
        color={isActive ? 'teal.500' : 'gray.600'}
        _hover={{
          textDecoration: 'none',
          color: 'teal.500',
        }}
        position="relative"
        _after={{
          content: '""',
          position: 'absolute',
          width: isActive ? '100%' : '0%',
          height: '2px',
          bottom: '-2px',
          left: '0',
          backgroundColor: 'teal.500',
          transition: 'all 0.3s ease'
        }}
      >
        {Icon && <Icon style={{ marginRight: '8px' }} />}
        {children}
      </Link>
    );
  };

  const { Icon, color, title } = getRoleSpecifics();

  return (
    <Box
      bg={bgColor}
      px={8}
      py={2}
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Flex alignItems="center">
        <Image src={Logo} boxSize="50px" alt="AarogyaData Logo" />
          <Text
            ml={3}
            fontSize="xl"
            fontWeight="bold"
            color="teal.500"
            letterSpacing="wide"
          >
            AarogyaData
          </Text>
        </Flex>



        <Flex alignItems={'center'}>
          {!token ? (
            <>
              <GoogleTranslate />
              <NavLink to="/about" icon={FaInfo}>About Us</NavLink>
              <NavLink to="/" icon={FaHome}>Home</NavLink>
              <NavLink to="/medical_news" icon={FaNewspaper}>Medical News</NavLink>
              <Button
                as={RouterLink}
                to="/auth"
                colorScheme="teal"
                variant="solid"
                size="md"
                ml={4}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                Register/Login
              </Button>
            </>
          ) : (
            <>
              <GoogleTranslate />
              {role === 'doctor' && (
                <>
                  <NavLink to="/doctor/profile" icon={FaUser}>
                    Profile
                  </NavLink>
                  <NavLink to="/doctor/schedule_manager" icon={FaCalendarAlt}>
                    Scheduler
                  </NavLink>
                  <NavLink to="/doctor/my_patients" icon={FaUsers}>
                    My Patients
                  </NavLink>
                </>
              )}
              {role === 'patient' && (
                <>
                  <NavLink to="/patient/appointments" icon={FaCalendarCheck}>
                    Appointments
                  </NavLink>
                  <NavLink to="/patient/profile" icon={FaUser}>
                    Profile
                  </NavLink>
                </>
              )}
              {role === 'pharmacist' && (
                <>
                  <NavLink to="/pharmacist/profile" icon={FaUser}>
                    Profile
                  </NavLink>
                  <NavLink to="/pharmacist/scanner" icon={FaQrcode}>
                    Scanner
                  </NavLink>
                </>
              )}
              <Flex
                alignItems="center"
                px={4}
                py={2}
                ml={4}
                borderLeft="1px"
                borderColor="gray.200"
              >
                <Icon size={20} color={color} style={{ marginRight: '8px' }} />
                <Text color="gray.600" fontWeight="medium" mr={4}>
                  {title}
                </Text>
              </Flex>
              <Button
                onClick={handleLogout}
                colorScheme="teal"
                variant="outline"
                size="md"
                _hover={{
                  bg: 'teal.50',
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;