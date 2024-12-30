import React from 'react';
import { Container } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import PharmacistProfile from './PharmacistProfile';
import QrScanner from './QrScanner';
import ViewPrescription from './ViewPrescription';

const PharmacistDashboard = () => {
    return (
        <Container maxW="container.md">
            <Routes>
                <Route path="scanner" element={<QrScanner />} />
                <Route path="profile" element={<PharmacistProfile />} />
                <Route path="view-prescription/:id" element={<ViewPrescription />} />
            </Routes>
        </Container>
    );
};

export default PharmacistDashboard;