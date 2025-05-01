import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Center } from '@chakra-ui/react';

function PrivateRoute({ children, role }) {
  const [isValid, setIsValid] = useState(null); // null = loading, false = invalid, true = valid
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const verifyUser = async () => {
      if (!user?.token) {
        setIsValid(false);
        return;
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/validate-token`, {
          headers: {
          'x-auth-token': user.token
        }
        });

        if (data.valid && data.user.role === role && data.user.id === user.id) {
          setIsValid(true);
        } else {
          localStorage.removeItem('userInfo');
          setIsValid(false);
        }
      } catch (err) {
        localStorage.removeItem('userInfo');
        setIsValid(false);
      }
    };

    verifyUser();
  }, []);

  if (isValid === null) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
      </Center>
    );
  }

  return isValid ? children : <Navigate to="/auth" replace />;
}

export default PrivateRoute;
