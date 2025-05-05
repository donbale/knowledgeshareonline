import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Heading, Text, SimpleGrid, Badge, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import RequestsTab from '../components/RequestsTab';

import BookFlipCard from '../components/BookFlipCard';
import BorrowedBooksTab from './BorrowedBooksTab';

export default function Home({ user }) {
  const [myBooks, setMyBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [requests, setRequests] = useState([]); // Placeholder for future
  const [loading, setLoading] = useState(true);

  async function fetchBooks() {
    setLoading(true);
    // Fetch user's own books
    const { data: owned } = await supabase.from('books').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
    setMyBooks(owned || []);
    // Fetch borrowed books (placeholder, needs borrow logic)
    setBorrowedBooks([]);
    // Fetch requests (placeholder)
    setRequests([]);
    setLoading(false);
  }

  useEffect(() => {
    fetchBooks();
  }, [user.id]);

  return (
    <Box>
      <Heading size="md" mb={4}>My Library</Heading>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>My Books</Tab>
          <Tab>Borrowed</Tab>
          <Tab>Requests</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {loading ? <Spinner /> : (
              <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                {myBooks.length === 0 ? <Text>No books yet.</Text> : myBooks.map(book => (
                  <BookFlipCard
                    key={book.id}
                    book={book}
                    isOwner={true}
                    onBookUpdated={fetchBooks}
                    onBookDeleted={fetchBooks}
                  />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          <TabPanel>
  {loading ? (
    <Spinner />
  ) : (
    <BorrowedBooksTab user={user} />
  )}
</TabPanel>
          <TabPanel>
            <RequestsTab user={user} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
