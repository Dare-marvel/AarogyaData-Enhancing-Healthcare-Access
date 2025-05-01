import React, { useState, useRef } from 'react';
import {
    Box,
    Tag,
    TagCloseButton,
    Flex,
    IconButton,
    chakra,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const ChipInput = ({ value, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const addChip = () => {
        if (inputValue.trim()) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const removeChip = (index) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
    };

    return (
        <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            position="relative"
            minH="32px"
            w={'100%'}
        >
            <Flex
                wrap="wrap"
                alignItems="center"
                gap="1"
                p="1"
                pr="25px"
            >
                {value.map((item, index) => (
                    <Tag
                        size="sm"
                        key={index}
                        marginY="1"
                    >
                        {item}
                        <TagCloseButton onClick={() => removeChip(index)} />
                    </Tag>
                ))}
                <chakra.input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={value.length === 0 ? placeholder : ''}
                    size="1"
                    border="none"
                    outline="none"
                    flex="1"
                    minW="10px"
                    h="24px"
                    _focus={{ outline: 'none' }}
                />
            </Flex>
            <IconButton
                icon={<AddIcon />}
                size="sm"
                variant="plain"
                onClick={addChip}
                aria-label="Add chip"
                position="absolute"
                right="2px"
                top="50%"
                transform="translateY(-50%)"
            />
        </Box>
    );
};

export default ChipInput;