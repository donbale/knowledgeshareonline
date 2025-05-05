import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Box, Button, Input, Textarea, VStack, FormLabel, Select, useToast } from '@chakra-ui/react';

const genres = [
  '', 'Adventure', 'Fantasy', 'Mystery', 'Science Fiction', 'Non-fiction', 'Comics', 'Other'
];

export default function BookForm({ onBookAdded }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('books').insert({
      title, author, genre, synopsis, cover_url: coverUrl
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 4000 });
    } else {
      setTitle(''); setAuthor(''); setGenre(''); setSynopsis(''); setCoverUrl('');
      toast({ title: 'Book added!', status: 'success', duration: 2000 });
      onBookAdded && onBookAdded();
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} bg="teal.50" p={4} borderRadius="lg" mb={6}>
      <VStack spacing={3}>
        <Box w="100%">
          <FormLabel>Title</FormLabel>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </Box>
        <Box w="100%">
          <FormLabel>Author</FormLabel>
          <Input value={author} onChange={e => setAuthor(e.target.value)} />
        </Box>
        <Box w="100%">
          <FormLabel>Genre</FormLabel>
          <Select value={genre} onChange={e => setGenre(e.target.value)}>
            {genres.map(g => <option value={g} key={g}>{g}</option>)}
          </Select>
        </Box>
        <Box w="100%">
          <FormLabel>Synopsis</FormLabel>
          <Textarea value={synopsis} onChange={e => setSynopsis(e.target.value)} />
        </Box>
        <Box w="100%">
          <FormLabel>Cover Image URL (optional)</FormLabel>
          <Input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} />
        </Box>
        <Button colorScheme="teal" type="submit" isLoading={loading} w="full">
          Add Book
        </Button>
      </VStack>
    </Box>
  );
}
