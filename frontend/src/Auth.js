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
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);
  const [newPasswordMessage, setNewPasswordMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setRecoveryMode(true);
    }
  }, []);
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

  if (recoveryMode) {
    return (
      <Box maxW="xs" mx="auto" mt={8} p={6} bg="white" borderRadius="lg" boxShadow="md">
        <Heading size="md" color="teal.500" mb={4} textAlign="center">
          Set New Password
        </Heading>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setNewPasswordLoading(true);
            setNewPasswordMessage('');
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) {
              setNewPasswordMessage(error.message);
            } else {
              setNewPasswordMessage('Password updated! You can now log in with your new password.');
              setTimeout(() => {
                setRecoveryMode(false);
                window.location.href = window.location.pathname; // Remove recovery params
              }, 2500);
            }
            setNewPasswordLoading(false);
          }}
        >
          <VStack spacing={4}>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              color="gray.700"
              bg="gray.100"
            />
            {newPasswordMessage && (
              <Alert status={newPasswordMessage.startsWith('Password updated') ? 'success' : 'error'} fontSize="sm">
                <AlertIcon />
                {newPasswordMessage}
              </Alert>
            )}
            <Button colorScheme="teal" type="submit" isLoading={newPasswordLoading} w="full">
              Set Password
            </Button>
          </VStack>
        </form>
      </Box>
    );
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

  if (showReset) {
    return (
      <Box maxW="xs" mx="auto" mt={8} p={6} bg="white" borderRadius="lg" boxShadow="md">
        <Heading size="md" color="teal.500" mb={4} textAlign="center">
          Reset Password
        </Heading>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setResetLoading(true);
            setResetMessage('');
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
            if (error) setResetMessage(error.message);
            else setResetMessage('Password reset email sent! Check your inbox.');
            setResetLoading(false);
          }}
        >
          <VStack spacing={4}>
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              color="gray.700"
              bg="gray.100"
            />
            {resetMessage && (
              <Alert status={resetMessage.startsWith('Password reset email sent') ? 'success' : 'error'} fontSize="sm">
                <AlertIcon />
                {resetMessage}
              </Alert>
            )}
            <Button colorScheme="teal" type="submit" isLoading={resetLoading} w="full">
              Send Reset Email
            </Button>
            <Button variant="link" colorScheme="teal" onClick={() => setShowReset(false)} w="full">
              Back to Login
            </Button>
          </VStack>
        </form>
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
          <Button variant="link" colorScheme="teal" onClick={() => setShowReset(true)} w="full">
            Forgot password?
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

