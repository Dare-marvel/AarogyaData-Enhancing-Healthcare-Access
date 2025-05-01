import React from 'react';
import { GridItem, Flex, Box, Divider } from '@chakra-ui/react';
import UploadAndViewFiles from './UploadAndViewFiles';

export const PatientFiles = ({ patientId,patientName }) => {
    return (
        <GridItem colSpan={{ base: 1, lg: 3 }}>
            <Flex width="100%" alignItems="stretch">
                <Box flex="1" width="50%">
                    <UploadAndViewFiles
                        title="Reports"
                        type="reports"
                        patientId={patientId}
                    />
                </Box>

                <Divider orientation="vertical" mx={4} />

                <Box flex="1" width="50%">
                    <UploadAndViewFiles
                        title="Prescriptions"
                        type="handwrittenNotes"
                        patientId={patientId}
                        patientName={patientName}
                    />
                </Box>
            </Flex>
        </GridItem>
    );
};  