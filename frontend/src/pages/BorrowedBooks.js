import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, SimpleGrid, Text, Spinner } from '@chakra-ui/react';

export default function BorrowedBooks({ user }) {
  const [borrowed, setBorrowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBorrowed() {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('id, status, created_at, book:books(*)')
        .eq('borrower_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setBorrowed(data || []);
      setLoading(false);
    }
    if (user) fetchBorrowed();
  }, [user]);

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">Error: {error}</Text>;
  if (borrowed.length === 0) return <Text>No borrowed books.</Text>;

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={4}>
      {borrowed.map(({ id, book, created_at }) => (
        <Box key={id} borderWidth="1px" borderRadius="lg" p={4} bg="whiteAlpha.900">
          <Text fontWeight="bold">{book.title}</Text>
          <Text>By {book.author}</Text>
          <Text fontSize="sm" color="gray.500">Borrowed on {new Date(created_at).toLocaleDateString()}</Text>
        </Box>
      ))}
    </SimpleGrid>
  );
}
