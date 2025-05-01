import { Box, HStack, Text, Button } from "@chakra-ui/react";
import { DeleteIcon, TimeIcon } from "@chakra-ui/icons";

const TimelineItem = ({ date, disease, onDelete, isLast }) => (
    <Box position="relative" pl={7} pb={isLast ? 0 : 4}> {/* Reduced padding-left and padding-bottom */}
        {/* Vertical line */}
        {!isLast && (
            <Box position="absolute" left="15px" top="24px" bottom={0} width="2px" bg="blue.100" />
        )}
        {/* Timeline dot */}
        <Box position="absolute" left="11px" top="18px" width="10px" height="10px" borderRadius="full" bg="blue.500" zIndex={1} />
        {/* Content */}
        <Box
            bg="white"
            p={2} // Reduced padding
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.100"
            _hover={{
                boxShadow: "md",
                borderColor: "blue.100",
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out"
            }}
        >
            <HStack justify="space-between" spacing={1}> {/* Reduced spacing */}
                <HStack spacing={2}> {/* Reduced spacing */}
                    <TimeIcon color="blue.500" />
                    <Box>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.700">
                            {new Date(date).toLocaleDateString()}
                        </Text>
                        <Text color="gray.600" fontSize="sm">{disease}</Text> {/* Reduced font size */}
                    </Box>
                </HStack>
                <Button size="xs" colorScheme="red" variant="ghost" onClick={onDelete}> {/* Reduced button size */}
                    <DeleteIcon />
                </Button>
            </HStack>
        </Box>
    </Box>
);

export default TimelineItem;
