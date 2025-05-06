import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Button, useToast, Box, Text, Textarea, useClipboard, IconButton, Flex } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

const chatGptPrompt = `Please extract the following information for each book in the picture and output it as a JSON array, where each object has these fields: title, author, genre, synopsis.

Example format:
[
  {
    "title": "",
    "author": "",
    "genre": "",
    "synopsis": ""
  }
]

Do not include any extra fields or text. Only output valid JSON.`;

async function fetchOpenLibraryCover(title, author) {
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}${author ? `&author=${encodeURIComponent(author)}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      const doc = data.docs[0];
      if (doc.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }
  } catch {
    // Ignore errors, fallback to blank
  }
  return '';
}

export default function ImportBooks({ onBooksImported, user }) {
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(chatGptPrompt);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setLoading(true);
    try {
      const books = JSON.parse(jsonText);
      if (!Array.isArray(books)) throw new Error('JSON must be an array of books');
      // Validate and clean books, auto-fetch cover_url if missing
      const validBooks = [];
      for (const b of books) {
        if (!b.title) continue;
        let cover_url = b.cover_url || '';
        if (!cover_url) {
          cover_url = await fetchOpenLibraryCover(b.title, b.author || '');
        }
        validBooks.push({
          title: b.title || '',
          author: b.author || '',
          genre: b.genre || '',
          synopsis: b.synopsis || '',
          cover_url,
          owner_id: user.id
        });
      }
      if (validBooks.length === 0) throw new Error('No valid books found in JSON');
      const { error } = await supabase.from('books').insert(validBooks);
      if (error) throw error;
      toast({ title: 'Books imported!', status: 'success', duration: 3000 });
      setJsonText('');
      onBooksImported && onBooksImported();
    } catch (err) {
      toast({ title: 'Import failed', description: err.message, status: 'error', duration: 6000 });
    }
    setLoading(false);
  }

  return (
    <Box mb={4}>
      <Text fontWeight="bold" mb={1}>Import Books from JSON</Text>
      <Box bg="gray.50" borderRadius="md" p={2} mb={2}>
        <Text fontSize="sm" mb={1} color="gray.700">Prompt for ChatGPT (copy and paste):</Text>
        <Flex align="center" mb={1}>
          <Textarea value={chatGptPrompt} isReadOnly size="sm" fontSize="sm" resize="none" h="150px" mr={2} />
          <IconButton icon={<CopyIcon />} aria-label="Copy prompt" onClick={onCopy} size="sm" colorScheme={hasCopied ? 'green' : 'teal'} ml={1} />
        </Flex>
        <Text fontSize="xs" color="gray.500">Paste your bookshelf description or book list into ChatGPT with this prompt to get a compatible JSON file.</Text>
      </Box>
      <Textarea
        placeholder="Paste your JSON here..."
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
        size="md"
        rows={8}
        mb={2}
        bg="white"
        fontFamily="mono"
      />
      <Button colorScheme="pink" onClick={handleImport} isLoading={loading} w="100%">
        Import Books
      </Button>
    </Box>
  );
}
