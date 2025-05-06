import React from 'react';
import { Box, Heading, Text, OrderedList, ListItem } from '@chakra-ui/react';
import ImportBooks from '../ImportBooks';

export default function BulkImport({ user }) {
  return (
    <Box>
      <Heading size="md" mb={4}>Bulk Import Books</Heading>
      <Box mb={4} bg="teal.50" borderRadius="md" p={3}>
        <Text fontWeight="bold" mb={2} color="teal.700">How to bulk import books:</Text>
        <OrderedList fontSize="sm" color="gray.700">
          <ListItem>Take a photo of your bookshelf or write a list of your books.</ListItem>
          <ListItem>Copy the ChatGPT prompt below and paste it into ChatGPT (or another AI assistant) along with your bookshelf photo description or list.</ListItem>
          <ListItem>Copy the JSON output from ChatGPT.</ListItem>
          <ListItem>Paste the JSON into the box below and click "Import Books".</ListItem>
          <ListItem>Book cover images will be found automatically for you!</ListItem>
        </OrderedList>
      </Box>
      <ImportBooks user={user} />
    </Box>
  );
}
