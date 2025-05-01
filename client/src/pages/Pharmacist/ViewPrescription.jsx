import React from 'react';
import { Container,Heading } from '@chakra-ui/react';
import ViewFiles from '../../components/Pharmacist/ViewPrescription/ViewFiles';


const ViewPrescription = () => {
    
    return (
        <Container maxW="container.md" py={0}>
            <ViewFiles />
        </Container>
    );
};

export default ViewPrescription;