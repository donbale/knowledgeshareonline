import React, { useEffect, useState } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddBook from './pages/AddBook';
import BulkImport from './pages/BulkImport';
import BrowseBooks from './pages/BrowseBooks';
import BorrowedBooks from './pages/BorrowedBooks';
import CompleteProfile from './pages/CompleteProfile';
import MobileNav from './components/MobileNav';

function App() {
  const [session, setSession] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = session?.user;

  useEffect(() => {
    // Try to restore session from localStorage/cookies on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      setHasProfile(!!data);
      setProfileChecked(true);
    }
    if (user) checkProfile();
  }, [user, refreshKey]);

  // Set background image on body once
  useEffect(() => {
    const url = `${process.env.PUBLIC_URL}/assets/library_interior.png`;
    Object.assign(document.body.style, {
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
    });
  }, []);

  // Toggle faded class on body based on session
  useEffect(() => {
    if (session) document.body.classList.add('faded');
    else document.body.classList.remove('faded');
  }, [session]);

  if (!session) {
    return (
      <ChakraProvider>
        <Box minH="100vh" p={8}>
          <Auth onAuth={() => setRefreshKey(k => k + 1)} />
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" p={8}>
          <Box maxW="3xl" mx="auto">
            <MobileNav onLogout={handleLogout} />
            <Box bg="whiteAlpha.900" borderRadius="xl" boxShadow="xl" p={[4, 8]}>
              <Routes>
                <Route path="/complete-profile" element={<CompleteProfile user={user} />} />
                <Route path="/" element={<Home user={user} />} />
                <Route path="/add" element={<AddBook user={user} />} />
                <Route path="/import" element={<BulkImport user={user} />} />
                <Route path="/browse" element={<BrowseBooks user={user} />} />
                <Route path="/borrowed" element={<BorrowedBooks user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
