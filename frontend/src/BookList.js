import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Box, Text, Image, SimpleGrid, Badge, Spinner, Input } from '@chakra-ui/react';

export default function BookList({ refreshKey }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      let query = supabase.from('books').select('*').order('created_at', { ascending: false });
      const { data, error } = await query;
      if (!error) {
        setBooks(data);
      }
      setLoading(false);
    }
    fetchBooks();
  }, [refreshKey]);

  const filtered = books.filter(
    b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(search.toLowerCase())) ||
      (b.genre && b.genre.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Input
        placeholder="Search by title, author, or genre..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        mb={4}
        bg="white"
      />
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Text color="gray.500">No books found.</Text>
      ) : (
        <SimpleGrid columns={[1, 2]} spacing={4}>
          {filtered.map(book => (
            <Box key={book.id} bg="white" p={4} borderRadius="lg" boxShadow="md">
              {book.cover_url && (
                <Image src={book.cover_url} alt={book.title} borderRadius="md" mb={2} maxH="120px" objectFit="cover" />
              )}
              <Text fontWeight="bold" fontSize="lg">{book.title}</Text>
              <Text color="gray.600">by {book.author || 'Unknown'}</Text>
              <Badge colorScheme="teal" mt={1}>{book.genre}</Badge>
              <Text mt={2} fontSize="sm" color="gray.700">{book.synopsis}</Text>
              <Text mt={2} fontSize="xs" color="gray.400">Status: {book.status}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
