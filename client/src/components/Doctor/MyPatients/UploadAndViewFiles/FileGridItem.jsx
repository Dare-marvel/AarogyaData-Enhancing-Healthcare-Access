import React from 'react';
import { HStack, VStack, Text, IconButton, Tooltip } from '@chakra-ui/react';
import { ViewIcon, DownloadIcon, DeleteIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {getFileIcon, shouldShowViewButton} from '../../../../utils/fileUtils';

const FileGridItem = ({
    doc,
    handleView,
    handleDownload,
    handleDelete,
    patientId,
    type
}) => {
    const fileIcon = getFileIcon(doc.url);
    const canView = shouldShowViewButton(doc.url);

    return (
        <HStack align="start" spacing={2}>
            <VStack spacing={2} align="center">
                <FontAwesomeIcon
                    icon={fileIcon.icon}
                    size="5x"
                    style={{
                        color: fileIcon.color,
                    }}
                />
                <Text noOfLines={1} fontSize="sm">
                    {doc.fileName.length > 10 
                        ? `${doc.fileName.slice(0, 10)}...` 
                        : doc.fileName}
                </Text>
            </VStack>

            <VStack spacing={2}>
                {canView ? (
                    <Tooltip label="View">
                        <IconButton
                            icon={<ViewIcon />}
                            onClick={() => handleView(doc)}
                            colorScheme="blue"
                            size="sm"
                        />
                    </Tooltip>
                ) : (
                    <Tooltip label="View Off">
                        <IconButton
                            icon={<ViewOffIcon />}
                            colorScheme="gray"
                            bg="gray.200"
                            size="sm"
                        />
                    </Tooltip>
                )}
                <Tooltip label="Download">
                    <IconButton
                        icon={<DownloadIcon />}
                        onClick={() => handleDownload(doc.url, doc.fileName)}
                        colorScheme="green"
                        size="sm"
                    />
                </Tooltip>
                <Tooltip label="Delete">
                    <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => handleDelete(doc._id, doc.fileName, patientId, type)}
                        colorScheme="red"
                        size="sm"
                    />
                </Tooltip>
            </VStack>
        </HStack>
    );
};

export default FileGridItem;