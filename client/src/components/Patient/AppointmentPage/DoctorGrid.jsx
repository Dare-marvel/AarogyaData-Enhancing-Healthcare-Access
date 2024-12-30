import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SimpleGrid, Box } from '@chakra-ui/react';
import DoctorCard from './DoctorCard';
import BookingModal from './BookingModal';
import SearchBar from './SearchBar';

const DoctorGrid = ({ doctors, onAppointmentBooked }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState('username');
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // Extract search parameters
  const specializationParam = searchParams.get('specialization');
  const idParam = searchParams.get('id');

  const specializations = specializationParam
    ? specializationParam.split(',').map(spec =>
        spec
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      )
    : [];

  // Filter doctors based on parameters
  const filteredDoctors = doctors.filter(doctor => {
    if (idParam) {
      return doctor._id === idParam;
    }
    if (specializations.length > 0) {
      return specializations.includes(doctor.specialization);
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return searchType === 'username'
        ? doctor.username.toLowerCase().includes(searchLower)
        : doctor.specialization.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Clear search parameters on search bar input
  const handleSearch = query => {
    setSearchQuery(query);
    navigate(location.pathname); // Reset URL
  };

  return (
    <Box>
      <SearchBar
        onSearch={handleSearch}
        searchType={searchType}
        setSearchType={setSearchType}
      />
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={3}>
        {filteredDoctors.map(doctor => (
          <DoctorCard
            key={doctor._id}
            doctor={doctor}
            onBookClick={() => {
              setSelectedDoctor(doctor);
              setIsModalOpen(true);
            }}
          />
        ))}
      </SimpleGrid>

      {selectedDoctor && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
          onAppointmentBooked={onAppointmentBooked}
        />
      )}
    </Box>
  );
};

export default DoctorGrid;
