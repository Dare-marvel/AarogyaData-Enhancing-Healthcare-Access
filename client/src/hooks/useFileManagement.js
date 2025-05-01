import { useState } from 'react';
import axios from 'axios';
import { ref, deleteObject } from 'firebase/storage';
import storage from '../config/firebase';

export const useFileManagement = (patientId, type) => {
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const fetchUploadedFiles = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/patients/files', {
                params: { patientId, fileType: type }
            });
            setUploadedDocs(data.files);
        } catch (err) {
            console.error('Failed to fetch files', err);
        }
    };

    const handleDelete = async (docId, fileName) => {
        try {
            if (fileName) {
                const fileRef = ref(storage, `files/${fileName}`);
                await deleteObject(fileRef);
            }

            const response = await axios.delete(
                `http://localhost:5000/api/patients/files/${docId}`,
                {
                    data: { patientId, fileType: type }
                }
            );
            if (response.status === 200) {
                fetchUploadedFiles();
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Error deleting file. Please try again.');
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
        uploadedDocs,
        handleDelete,
        handleDownload,
        fetchUploadedFiles
    };
};