import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box, Heading, SimpleGrid, Button, Text, Badge, Spinner, useToast
} from '@chakra-ui/react';
import BookFlipCard from '../components/BookFlipCard';

import { VStack } from '@chakra-ui/react';

function BookCard({ book, onRequest, requesting, owner }) {
  return (
    <BookFlipCard
      book={book}
      isOwner={false}
      owner={owner}
      onRequest={onRequest}
      requesting={requesting}
    />
  );
}

export default function BrowseBooks({ user }) {
  const [books, setBooks] = useState([]);
  const [ownersMap, setOwnersMap] = useState({});
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [{ data: booksData }, { data: profileData }] = await Promise.all([
        supabase.from('books').select('*').neq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('name, class').eq('id', user.id).single()
      ]);
      setBooks(booksData || []);
      setProfile(profileData || {});

      const ownerIds = Array.from(new Set((booksData || []).map(b => b.owner_id)));
      if (ownerIds.length > 0) {
        const { data: owners } = await supabase
          .from('profiles')
          .select('id, name, class')
          .in('id', ownerIds);
        setOwnersMap(Object.fromEntries((owners || []).map(p => [p.id, p])));
      }
      setLoading(false);
    }
    fetchData();
  }, [user.id]);

  // ✅ Re-add your sendBorrowRequestEmail function here:
  async function sendBorrowRequestEmail(book, owner, requester) {
    try {
      const owner_id = book.owner_id;
      const owner_name = owner?.name || '';
      const book_title = book.title;
      const requester_name = requester?.name?.trim()
        ? requester.name.trim()
        : requester.email.split('@')[0];

      let requester_class = requester?.class || '';

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        console.error('No access token found, user may not be logged in.');
        return;
      }

      const payload = {
        owner_id,
        owner_name,
        book_title,
        requester_name,
        requester_class
      };

      const res = await fetch('https://osvcnsgtpznppyeynity.supabase.co/functions/v1/send_borrow_request_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      console.log('Edge Function response:', data);
    } catch (e) {
      console.error('sendBorrowRequestEmail Error:', e);
    }
  }

  async function handleRequest(book) {
    setRequestingId(book.id);
    try {
      const { error } = await supabase.from('borrow_requests').insert({
        book_id: book.id,
        owner_id: book.owner_id,
        borrower_id: user.id,
        status: 'pending',
      });
      if (error) throw error;

      const owner = ownersMap[book.owner_id] || {};
      await sendBorrowRequestEmail(book, owner, { ...user, ...profile });

      toast({ title: 'Request sent!', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Failed to send request', description: err.message, status: 'error' });
    }
    setRequestingId(null);
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Browse Books</Heading>
      {loading ? (
        <Spinner />
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
          {books.length === 0 ? <Text>No books available to borrow.</Text> : books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onRequest={handleRequest}
              requesting={requestingId === book.id}
              owner={ownersMap[book.owner_id]}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}


