import React from 'react';
import { Grid, Box, HStack, VStack, Text, IconButton, Tooltip } from '@chakra-ui/react';
import { ViewIcon, DownloadIcon, DeleteIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {getFileIcon, shouldShowViewButton} from '../../../../utils/fileUtils';
import FileGridItem from './FileGridItem';

const FileGrid = ({
    uploadedDocs,
    handleView,
    handleDownload,
    handleDelete,
    patientId,
    type
}) => {
    return (
        <Grid
            templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
            gap={0.01}
            mt={4}
            overflowY="auto"
            maxHeight="120px"
        >
            {uploadedDocs.map((doc) => (
                <Box
                    key={doc._id}
                    bg="white"
                    p={2}
                    borderRadius="lg"
                    boxShadow="md"
                    width="140px"
                    height="125px"
                >
                    <FileGridItem
                        doc={doc}
                        handleView={handleView}
                        handleDownload={handleDownload}
                        handleDelete={handleDelete}
                        patientId={patientId}
                        type={type}
                    />
                </Box>
            ))}
        </Grid>
    );
};

export default FileGrid;