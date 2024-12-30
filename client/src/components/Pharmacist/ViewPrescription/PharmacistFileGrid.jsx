import React from 'react';
import { Grid, Box, Text } from '@chakra-ui/react';
import PharmacistFileGridItem from './PharmacistFileGridItem';

const PharmacistFileGrid = ({
    uploadedPrescriptions,
    handleView,
    handleDownload,
}) => {
    console.log("uploadedPrescriptions", uploadedPrescriptions.data);

    const doc = uploadedPrescriptions?.data; // Assuming it's a single object

    return (
        <Grid
            templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
            gap={0.01}
            mt={4}
            maxHeight="120px"
        >
            {doc ? (
                <Box
                    // key={doc.prescription_id}
                    bg="white"
                    p={2}
                    borderRadius="lg"
                    boxShadow="md"
                    width="140px"
                    height="125px"
                >
                    <PharmacistFileGridItem
                        doc={doc}
                        handleView={handleView}
                        handleDownload={handleDownload}
                    />
                </Box>
            ) : (
                <Box
                    bg="white"
                    p={2}
                    borderRadius="lg"
                    boxShadow="md"
                    width="140px"
                    height="125px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Text>No prescriptions available</Text>
                </Box>
            )}
        </Grid>
    );
};

export default PharmacistFileGrid;
