// components/SearchBar.jsx
import { Input, InputGroup, InputLeftElement, Select, HStack } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const SearchBar = ({ onSearch, searchType, setSearchType }) => {
  return (
    <HStack spacing={4} mb={6} width="100%">
      <Select 
        value={searchType} 
        onChange={(e) => setSearchType(e.target.value)}
        width="200px"
      >
        <option value="username">Username</option>
        <option value="specialization">Specialization</option>
      </Select>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input 
          placeholder={`Search by ${searchType}...`}
          onChange={(e) => onSearch(e.target.value)}
        />
      </InputGroup>
    </HStack>
  );
};

export default SearchBar;