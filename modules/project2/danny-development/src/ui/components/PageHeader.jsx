import { Box, Heading, useColorModeValue } from '@chakra-ui/react';

function PageHeader({ children }) {
  // const bg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      as="header"
      // bg={bg}
      py={3}
      // px={8}
      // borderBottomWidth="1px"
      // borderColor={useColorModeValue('gray.200', 'gray.600')}
    >
      <Heading size="md">
        {children}
      </Heading>
    </Box>
  );
}

export default PageHeader;
