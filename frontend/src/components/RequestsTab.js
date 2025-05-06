import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box, Text, Button, HStack, VStack, Badge, Spinner, useToast
} from '@chakra-ui/react';

function RequestCard({ request, book, isOwner, onApprove, onReject, processing, profilesMap, ownersMap }) {
  return (
    <Box bg="gray.50" p={3} borderRadius="md" boxShadow="sm" mb={2}>
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">{book?.title || 'Unknown Book'}</Text>
          <Text fontSize="sm">by {book?.author || 'Unknown'}</Text>
          <Badge colorScheme={request.status === 'pending' ? 'yellow' : request.status === 'approved' ? 'green' : request.status === 'rejected' ? 'red' : 'gray'}>
            {request.status}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            {isOwner
              ? (<>
                  Request from: {profilesMap?.[request.borrower_id]?.name || 'Unknown'}
                  {profilesMap?.[request.borrower_id]?.class ? ` (${profilesMap[request.borrower_id].class})` : ''}
                </>)
              : (<>
                  Owner: {ownersMap?.[request.owner_id]?.name || 'Unknown'}
                  {ownersMap?.[request.owner_id]?.class ? ` (${ownersMap[request.owner_id].class})` : ''}
                </>)}
          </Text>
        </VStack>
        {isOwner && request.status === 'pending' && (
          <VStack>
            <Button colorScheme="green" size="sm" onClick={() => onApprove(request)} isLoading={processing === 'approve'}>Approve</Button>
            <Button colorScheme="red" size="sm" onClick={() => onReject(request)} isLoading={processing === 'reject'}>Reject</Button>
          </VStack>
        )}
      </HStack>
    </Box>
  );
}

export default function RequestsTab({ user }) {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [booksMap, setBooksMap] = useState({});
  const [profilesMap, setProfilesMap] = useState({});
  const [ownersMap, setOwnersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      // Get all requests where user is owner (incoming) or borrower (outgoing)
      const { data: incomingData } = await supabase
        .from('borrow_requests')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      const { data: outgoingData } = await supabase
        .from('borrow_requests')
        .select('*')
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });
      // Get all involved book ids
      const bookIds = [
        ...(incomingData?.map(r => r.book_id) || []),
        ...(outgoingData?.map(r => r.book_id) || [])
      ];
      // Fetch all involved books
      let booksMap = {};
      if (bookIds.length > 0) {
        const { data: books } = await supabase
          .from('books')
          .select('*')
          .in('id', bookIds);
        booksMap = Object.fromEntries((books || []).map(b => [b.id, b]));
      }
      setBooksMap(booksMap);
      // Fetch all involved profiles (for borrowers)
      const borrowerIds = Array.from(new Set((incomingData || []).map(r => r.borrower_id)));
      let profilesMap = {};
      if (borrowerIds.length > 0) {
        console.log('Fetching profiles for borrowerIds:', borrowerIds);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, class')
          .in('id', borrowerIds);
        if (profileError) {
          console.error('Error fetching profiles:', profileError);
        } else {
          console.log('Fetched profiles:', profiles);
        }
        profilesMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      }
      console.log('profilesMap:', profilesMap);
      setProfilesMap(profilesMap);
      // Fetch all involved owner profiles (for outgoing requests)
      const ownerIds = Array.from(new Set((outgoingData || []).map(r => r.owner_id)));
      let ownersMap = {};
      if (ownerIds.length > 0) {
        const { data: owners } = await supabase
          .from('profiles')
          .select('id, name, class')
          .in('id', ownerIds);
        ownersMap = Object.fromEntries((owners || []).map(p => [p.id, p]));
      }
      setOwnersMap(ownersMap);
      setIncoming(incomingData || []);
      setOutgoing(outgoingData || []);
      setLoading(false);
    }
    fetchRequests();
  }, [user.id, processingId]);

  async function handleApprove(request) {
    setProcessingId(request.id);
    setProcessingAction('approve');
    try {
      // Update request status
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);
      if (error) throw error;
      // Mark book as borrowed
      await supabase
        .from('books')
        .update({ status: 'borrowed' })
        .eq('id', request.book_id);
      toast({ title: 'Request approved', status: 'success' });
    } catch (err) {
      toast({ title: 'Failed to approve', description: err.message, status: 'error' });
    }
    setProcessingId(null);
    setProcessingAction(null);
  }

  async function handleReject(request) {
    setProcessingId(request.id);
    setProcessingAction('reject');
    try {
      // Update request status
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);
      if (error) throw error;
      toast({ title: 'Request rejected', status: 'info' });
    } catch (err) {
      toast({ title: 'Failed to reject', description: err.message, status: 'error' });
    }
    setProcessingId(null);
    setProcessingAction(null);
  }

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>Incoming Requests (books you own)</Text>
      {loading ? <Spinner /> : (
        incoming.length === 0 ? <Text color="gray.500">No incoming requests.</Text> :
          incoming.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              book={booksMap[req.book_id]}
              isOwner={true}
              onApprove={handleApprove}
              onReject={handleReject}
              processing={processingId === req.id ? processingAction : null}
              profilesMap={profilesMap}
              ownersMap={ownersMap}
            />
          ))
      )}
      <Text fontWeight="bold" mt={6} mb={2}>Outgoing Requests (books you want to borrow)</Text>
      {loading ? <Spinner /> : (
        outgoing.length === 0 ? <Text color="gray.500">No outgoing requests.</Text> :
          outgoing.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              book={booksMap[req.book_id]}
              isOwner={false}
              ownersMap={ownersMap}
            />
          ))
      )}
    </Box>
  );
}
