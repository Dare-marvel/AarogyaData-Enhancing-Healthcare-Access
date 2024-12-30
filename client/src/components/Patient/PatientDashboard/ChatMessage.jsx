import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const components = {
    p: ({ children }) => (
      <Text mb={2} color={isUser ? 'white' : 'black'}>
        {children}
      </Text>
    ),
    h1: ({ children }) => (
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={isUser ? 'white' : 'black'}>
        {children}
      </Text>
    ),
    h2: ({ children }) => (
      <Text fontSize="xl" fontWeight="bold" mb={3} color={isUser ? 'white' : 'black'}>
        {children}
      </Text>
    ),
    h3: ({ children }) => (
      <Text fontSize="lg" fontWeight="bold" mb={2} color={isUser ? 'white' : 'black'}>
        {children}
      </Text>
    ),
    ul: ({ children }) => (
      <Box as="ul" pl={4} mb={2} color={isUser ? 'white' : 'black'}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box as="ol" pl={4} mb={2} color={isUser ? 'white' : 'black'}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Box as="li" mb={1} color={isUser ? 'white' : 'black'}>
        {children}
      </Box>
    ),
    code: ({node, inline, className, children, ...props}) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <Box my={2}>
          <SyntaxHighlighter
            language={match[1]}
            style={atomDark}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <Text
          as="span"
          px={2}
          py={1}
          bg={isUser ? 'blue.600' : 'gray.200'}
          borderRadius="md"
          fontSize="sm"
          fontFamily="mono"
        >
          {children}
        </Text>
      );
    },
    blockquote: ({ children }) => (
      <Box
        borderLeftWidth="4px"
        borderLeftColor={isUser ? 'blue.300' : 'gray.300'}
        pl={4}
        py={2}
        my={4}
        color={isUser ? 'white' : 'black'}
      >
        {children}
      </Box>
    ),
  };

  return (
    <Box
      w="full"
      display="flex"
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      mb={4}
    >
      <Box
        maxW="80%"
        bg={isUser ? 'blue.500' : 'gray.100'}
        px={4}
        py={2}
        borderRadius="lg"
        borderTopRightRadius={isUser ? '0' : 'lg'}
        borderTopLeftRadius={isUser ? 'lg' : '0'}
      >
        {isUser ? (
          <Text color="white">{message.content}</Text>
        ) : (
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </Box>
    </Box>
  );
};