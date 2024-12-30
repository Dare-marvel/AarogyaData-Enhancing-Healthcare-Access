import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const usePatients = (user) => {
    const [patients, setPatients] = useState([]);

    const fetchPatients = useCallback(async () => {
        try {
            if (!user?.token) return;
            
            const config = {
                headers: {
                    'x-auth-token': user.token
                }
            };
            const response = await axios.get('/api/doctor/patients', config);
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    return { patients, refetchPatients: fetchPatients };
};