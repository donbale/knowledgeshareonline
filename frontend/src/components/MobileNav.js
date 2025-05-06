import React, { useState } from 'react'
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Button,
  VStack,
  Box,
  useDisclosure,
  HStack,
  Heading,
  Link as ChakraLink
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

function ProfileMenu({ onLogout }) {
  const navigate = useNavigate()
  return (
    <Menu>
      <MenuButton as={Button} colorScheme="teal" variant="outline" leftIcon={<Avatar size="xs" />}>
        Profile
      </MenuButton>
      <MenuList fontFamily="body">
        <MenuItem onClick={() => navigate('/complete-profile')}>View/Edit Profile</MenuItem>
        <MenuItem onClick={onLogout}>Log Out</MenuItem>
      </MenuList>
    </Menu>
  )
}

export default function MobileNav({ onLogout }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  const [navItems] = useState([
    { label: 'Home', to: '/' },
    { label: 'Browse Books', to: '/browse' },
    { label: 'Add Book', to: '/add' },
    { label: 'Bulk Import', to: '/import' },
  ])

  return (
    <HStack justify="space-between" align="center" mb={4} fontFamily="body">
      {/* Heading now uses the theme.heading font (Roboto) at 'md' size */}
      <Heading color="teal.500" size="md">
        KnowledgeShareOnline
      </Heading>

      {/* Mobile hamburger */}
      <Box display={{ base: 'block', md: 'none' }}>
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="outline"
        />
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <VStack spacing={4} mt={8}>
                {navItems.map(item => (
                  <ChakraLink
                    as={Link}
                    to={item.to}
                    key={item.to}
                    fontWeight={location.pathname === item.to ? 'bold' : 'normal'}
                    fontSize="lg"
                    w="100%"
                    onClick={onClose}
                  >
                    {item.label}
                  </ChakraLink>
                ))}
                <ProfileMenu onLogout={onLogout} />
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>

      {/* Desktop nav */}
      <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
        {navItems.map(item => (
          <ChakraLink
            as={Link}
            to={item.to}
            key={item.to}
            fontWeight={location.pathname === item.to ? 'bold' : 'normal'}
          >
            {item.label}
          </ChakraLink>
        ))}
        <ProfileMenu onLogout={onLogout} />
      </HStack>
    </HStack>
  )
}
