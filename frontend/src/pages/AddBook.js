import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import BookForm from '../BookForm';

export default function AddBook() {
  return (
    <Box>
      <Heading size="md" mb={4}>Add a Book</Heading>
      <BookForm />
    </Box>
  );
}
