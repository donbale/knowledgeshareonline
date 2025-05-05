// src/theme.js
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: `'Roboto', sans-serif`,
    body:    `'Permanent Marker', cursive`,
  },
  // you can add more overrides here (colors, etc)
})

export default theme
