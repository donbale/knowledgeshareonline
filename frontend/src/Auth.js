import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import {
  Box,
  Button,
  Input,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Link
} from '@chakra-ui/react';

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error && result.data?.user && !result.data?.session) {
        // User is pending verification
        setPendingVerification(true);
        setLoading(false);
        return;
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    if (result.error) {
      setError(result.error.message);
    } else {
      onAuth();
    }
    setLoading(false);
  }

  if (pendingVerification) {
    return (
      <Box maxW="xs" mx="auto" mt={8} p={6} bg="white" borderRadius="lg" boxShadow="md">
        <Heading size="md" color="teal.500" mb={4} textAlign="center">
          Check your email!
        </Heading>
        <Text color="gray.700" mb={4}>
          We've sent a verification link to <b>{email}</b>. Please check your inbox and click the link to activate your account.
        </Text>
        <Button colorScheme="teal" w="full" onClick={() => setPendingVerification(false)}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="xs" mx="auto" mt={8} p={6} bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="md" color="teal.500" mb={4} textAlign="center">
        {isSignUp ? 'Sign Up' : 'Log In'}
      </Heading>
      <form onSubmit={handleAuth}>
        <VStack spacing={4}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            color="gray.700"
            bg="gray.100"
          />
          <Input
            type="password"
            placeholder="Password"
            required
            aria-required="true"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            color="gray.700"
            bg="gray.100"
          />
          {error && (
            <Alert status="error" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Button
            colorScheme="teal"
            type="submit"
            isLoading={loading}
            w="full"
          >
            {isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
          <Text fontSize="sm" color="gray.500">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Link color="teal.500" onClick={() => setIsSignUp(false)}>
                  Log In
                </Link>
              </>
            ) : (
              <>
                New here?{' '}
                <Link color="teal.500" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </Link>
              </>
            )}
          </Text>
        </VStack>
      </form>
    </Box>
  );
}

