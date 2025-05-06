import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Heading, Input, Button, FormLabel, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function CompleteProfile({ user }) {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally, fetch existing profile to prefill
    async function fetchProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setName(data.name || '');
        setClassName(data.class || '');
      }
    }
    fetchProfile();
  }, [user.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      class: className
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error saving profile', description: error.message, status: 'error' });
    } else {
      toast({ title: 'Profile saved!', status: 'success' });
      navigate('/'); // Go to home
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>Complete Your Profile</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </Box>
          <Box>
            <FormLabel>Class</FormLabel>
            <Input value={className} onChange={e => setClassName(e.target.value)} required />
          </Box>
          <Button colorScheme="teal" type="submit" isLoading={loading} w="full">
            Save Profile
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
