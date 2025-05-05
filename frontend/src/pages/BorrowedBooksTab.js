import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, SimpleGrid, Text, Spinner } from '@chakra-ui/react';

import { Image, Button, HStack } from '@chakra-ui/react';

export default function BorrowedBooksTab({ user }) {
  const [borrowed, setBorrowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function fetchBorrowed() {
      setLoading(true);
      // Get all borrow requests for this user
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('id, status, created_at, book:books(*), owner_id')
        .eq('borrower_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const borrowedList = data || [];
      // Get unique owner_ids
      const ownerIds = Array.from(new Set(borrowedList.map(b => b.owner_id)));
      let ownersMap = {};
      if (ownerIds.length > 0) {
        const { data: ownersData, error: ownersError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', ownerIds);
        if (!ownersError && ownersData) {
          ownersMap = Object.fromEntries(ownersData.map(o => [o.id, o]));
        }
      }
      // Attach owner info to each borrowed item
      setBorrowed(borrowedList.map(b => ({ ...b, owner: ownersMap[b.owner_id] })));
      setLoading(false);
    }
    if (user) fetchBorrowed();
  }, [user]);

  async function handleReturn(borrowRequest) {
    setProcessingId(borrowRequest.id);
    try {
      // Update borrow_requests status to 'returned'
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: 'returned' })
        .eq('id', borrowRequest.id);
      if (error) throw error;
      // Update book status to 'available'
      if (borrowRequest.book?.id) {
        await supabase
          .from('books')
          .update({ status: 'available' })
          .eq('id', borrowRequest.book.id);
      }
      // Refresh list
      setBorrowed(borrowed => borrowed.filter(b => b.id !== borrowRequest.id));
    } catch (e) {
      setError(e.message);
    }
    setProcessingId(null);
  }

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">Error: {error}</Text>;
  if (borrowed.length === 0) return <Text>No borrowed books.</Text>;

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={4}>
      {borrowed.map(({ id, book, created_at, owner }) => (
        <Box key={id} borderWidth="1px" borderRadius="lg" p={4} bg="whiteAlpha.900" display="flex" flexDirection="column" alignItems="center">
          {book.cover_url && (
            <Image src={book.cover_url} alt={book.title} borderRadius="md" mb={2} maxH="120px" objectFit="cover" />
          )}
          <Text fontWeight="bold">{book.title}</Text>
          <Text>By {book.author}</Text>
          <Text fontSize="sm" color="gray.500">Borrowed on {new Date(created_at).toLocaleDateString()}</Text>
          <Text fontSize="sm" color="gray.600" mb={2}>Borrowed from: <b>{owner?.name || 'Unknown'}</b></Text>
          <Button colorScheme="teal" size="sm" mt={2} onClick={() => handleReturn({ id, book })} isLoading={processingId === id} disabled={processingId === id}>
            Return Book
          </Button>
        </Box>
      ))}
    </SimpleGrid>
  );
}
