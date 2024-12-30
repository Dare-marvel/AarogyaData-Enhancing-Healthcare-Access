// src/MedicalNews.js
import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text, Image, Heading, Spinner, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Link } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const MedicalNews = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(6);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const apiKey = import.meta.env.VITE_GNEWS_API_KEY;

  useEffect(() => {
    axios.get(`https://gnews.io/api/v4/top-headlines?country=in&category=health&apikey=${apiKey}`)
      .then(response => {
        setArticles(response.data.articles);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [apiKey]);

  // Get current articles
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (article) => {
    setSelectedArticle(article);
    onOpen();
  };

  return (
    <Box p={4} background="gray.50" minHeight="100vh">
      <Heading as="h1" mb={6} textAlign="center" color="teal.500">Medical News</Heading>
      {articles.length > 0 ? (
        <>
          <SimpleGrid columns={[1, 2, 3]} spacing={10}>
            {currentArticles.map((article, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" shadow="md" height="100%" onClick={() => openModal(article)}>
                  <Image src={article.image} alt={article.title} objectFit="cover" height="200px" width="100%" />
                  <Box p={6}>
                    <Text fontWeight="bold" as="h4" fontSize="xl" mb={2}>{article.title}</Text>
                    <Text noOfLines={[1, 2, 3]}>{article.description}</Text>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>

          <Box display="flex" justifyContent="center" alignItems="center" mt={6}>
            <Button
              leftIcon={<FiArrowLeft />}
              isDisabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
              mr={2}
            >
              Previous
            </Button>
            <Text>{currentPage}</Text>
            <Button
              rightIcon={<FiArrowRight />}
              isDisabled={indexOfLastArticle >= articles.length}
              onClick={() => paginate(currentPage + 1)}
              ml={2}
            >
              Next
            </Button>
          </Box>

          {selectedArticle && (
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{selectedArticle.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Image src={selectedArticle.image} alt={selectedArticle.title} objectFit="cover" width="100%" mb={4} />
                  <Text mb={4}>{selectedArticle.content}</Text>
                  <Link href={selectedArticle.url} color="teal.500" isExternal>Read full article</Link>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onClose}>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      )}
    </Box>
  );
};

export default MedicalNews;
