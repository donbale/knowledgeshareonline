import React, { useState, useEffect } from 'react';
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

  // Handle password recovery flow
  useEffect(() => {
    // Check URL for recovery params
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setRecoveryMode(true);
      // Clear the URL to prevent issues on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for auth state changes (including password recovery)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Force the user to reset their password
        setRecoveryMode(true);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
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
            
            try {
              // First update the password
              const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
              });

              if (updateError) throw updateError;

              // Sign out the user after password change for security
              await supabase.auth.signOut();
              
              setNewPasswordMessage('Password updated! Please log in with your new password.');
              
              // Redirect to login after a short delay
              setTimeout(() => {
                setRecoveryMode(false);
                // Clear any auth state and redirect to login
                window.location.href = '/';
              }, 2000);
              
            } catch (error) {
              setNewPasswordMessage(error.message || 'An error occurred while updating your password');
            } finally {
              setNewPasswordLoading(false);
            }
          }}
        >
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Please enter a new password for your account.
            </Text>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              color="gray.700"
              bg="gray.100"
            />
            {newPasswordMessage && (
              <Alert 
                status={newPasswordMessage.includes('updated') ? 'success' : 'error'} 
                fontSize="sm"
                borderRadius="md"
              >
                <AlertIcon />
                {newPasswordMessage}
              </Alert>
            )}
            <Button 
              colorScheme="teal" 
              type="submit" 
              isLoading={newPasswordLoading} 
              w="full"
              mt={2}
            >
              Set New Password
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                supabase.auth.signOut();
                setRecoveryMode(false);
              }} 
              w="full"
            >
              Back to Login
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

