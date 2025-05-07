import React, { useState } from 'react';
import {
  Box, Text, Badge, Button, IconButton, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Input, Textarea, HStack, Spinner
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';

export default function BookFlipCard({ book, isOwner, owner, onRequest, requesting, onBookUpdated, onBookDeleted }) {
  const [flipped, setFlipped] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editBook, setEditBook] = useState(book);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleFlip = () => setFlipped(f => !f);

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: editBook.title,
          author: editBook.author,
          genre: editBook.genre,
          synopsis: editBook.synopsis
        })
        .eq('id', book.id);
      if (error) throw error;
      toast({ title: 'Book updated!', status: 'success' });
      onBookUpdated && onBookUpdated();
      onClose();
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, status: 'error' });
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from('books').delete().eq('id', book.id);
      if (error) throw error;
      toast({ title: 'Book deleted', status: 'info' });
      onBookDeleted && onBookDeleted();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, status: 'error' });
    }
    setDeleting(false);
  }

  return (
    <Box
      position="relative"
      h="260px"
      w="180px"
      perspective="1000px"
      mx="auto"
      _hover={{ boxShadow: 'xl' }}
    >
      {/* Flip Card Container */}
      <Box
        position="relative"
        w="100%"
        h="100%"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <Box
          position="absolute"
          w="100%"
          h="100%"
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          style={{
            backfaceVisibility: 'hidden',
            transition: 'transform 0.6s',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            zIndex: flipped ? 1 : 2,
            cursor: flipped ? 'pointer' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12
          }}
          onClick={() => !flipped && handleFlip()}
        >
          {book.cover_url && <img src={book.cover_url} alt={book.title} style={{ maxHeight: 110, marginBottom: 8, borderRadius: 8 }} />}
          <Text fontWeight="bold" textAlign="center">{book.title}</Text>
          <Text fontSize="sm" color="gray.600">by {book.author || 'Unknown'}</Text>
          <Badge
            bg="teal.400"
            color="white"
            mt={1}
            maxW="130px"
            minH="20px"
            fontSize="10px"
            px={3}
            py={1}
            borderRadius="full"
            textAlign="center"
            whiteSpace="normal"
            overflowWrap="break-word"
            wordBreak="break-word"
            display="inline-block"
            title={book.genre}
          >
            {book.genre}
          </Badge>
          {isOwner && (
            <HStack mt={2} spacing={2}>
              <IconButton icon={<EditIcon />} aria-label="Edit" size="sm" onClick={e => { e.stopPropagation(); setEditBook(book); onOpen(); }} />
              <IconButton icon={<DeleteIcon />} aria-label="Delete" size="sm" colorScheme="red" isLoading={deleting} onClick={e => { e.stopPropagation(); if(window.confirm('Delete this book?')) handleDelete(); }} />
            </HStack>
          )}
          {!isOwner && onRequest && (
            <Box mt={2} w="100%" textAlign="center">
              <Button
                colorScheme="teal"
                size="sm"
                variant="solid"
                isLoading={requesting}
                onClick={e => { e.stopPropagation(); onRequest(book); }}
                isDisabled={book.status === 'borrowed' || requesting}
                title={book.status === 'borrowed' ? 'Not Available' : 'Borrow'}
              >
                Borrow
              </Button>
            </Box>
          )} 
        </Box>
        {/* Back */}
        <Box
          position="absolute"
          w="100%"
          h="100%"
          bg="teal.50"
          borderRadius="lg"
          boxShadow="md"
          style={{
            backfaceVisibility: 'hidden',
            transition: 'transform 0.6s',
            transform: flipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
            zIndex: flipped ? 2 : 1,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12
          }}
          onClick={() => flipped && handleFlip()}
        >
          <Text fontWeight="bold" mb={2}>Synopsis</Text>
          <Text fontSize="sm" color="gray.700" textAlign="center">{book.synopsis || 'No synopsis.'}</Text>
          <Text fontSize="xs" color="gray.600" mt={3} textAlign="center">
            Owner: {owner?.name || 'Unknown'}{owner?.class ? ` (${owner.class})` : ''}
          </Text>
          <IconButton icon={<ArrowBackIcon />} aria-label="Flip back" mt={4} onClick={e => { e.stopPropagation(); handleFlip(); }} />
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Book</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              mb={2}
              placeholder="Title"
              value={editBook.title}
              onChange={e => setEditBook({ ...editBook, title: e.target.value })}
            />
            <Input
              mb={2}
              placeholder="Author"
              value={editBook.author}
              onChange={e => setEditBook({ ...editBook, author: e.target.value })}
            />
            <Input
              mb={2}
              placeholder="Genre"
              value={editBook.genre}
              onChange={e => setEditBook({ ...editBook, genre: e.target.value })}
            />
            <Textarea
              mb={2}
              placeholder="Synopsis"
              value={editBook.synopsis}
              onChange={e => setEditBook({ ...editBook, synopsis: e.target.value })}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSave} isLoading={saving}>Save</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
