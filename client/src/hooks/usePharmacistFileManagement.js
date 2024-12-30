import { useState } from 'react';
import axios from 'axios';
// import { ref, deleteObject } from 'firebase/storage';
// import storage from '../config/firebase';

export const usePharmacistFileManagement = (id) => {
    const [uploadedPrescriptions, setUploadedPrescriptions] = useState([]);

    const fetchUploadedFiles = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/prescription/files/${id}`);
            console.log(data);
            setUploadedPrescriptions(data);
            console.log(typeof uploadedPrescriptions);
        } catch (err) {
            console.error('Failed to fetch files', err);
        }
    };


    const handleDownload = (url, fileName) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                link.click();
                window.URL.revokeObjectURL(link.href);
            })
            .catch(console.error);
    };

    return {
        uploadedPrescriptions,
        handleDownload,
        fetchUploadedFiles
    };
};