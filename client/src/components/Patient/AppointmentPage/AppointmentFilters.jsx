import React from 'react';
import {
  Stack,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaCalendar } from 'react-icons/fa';

const AppointmentFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange
}) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={4}
    >
      <InputGroup flex={1}>
        <InputLeftElement pointerEvents="none">
          <FaSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search by doctor or location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>

      <Select
        width={{ base: "full", md: "200px" }}
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        icon={<FaFilter />}
      >
        <option value="all">All Status</option>
        <option value="scheduled">Scheduled</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </Select>

      <Select
        width={{ base: "full", md: "200px" }}
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value)}
        icon={<FaCalendar />}
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </Select>
    </Stack>
  );
};

export default AppointmentFilters;