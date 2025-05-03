// hooks/useFileUpload.js
import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import storage from '../config/firebase';
import axios from 'axios';

export const useFileUpload = (patientId, type, onUploadSuccess, patientName) => { // Add onUploadSuccess callback
    const [files, setFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressShow, setProgressShow] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async (resetFileInput) => { // Add resetFileInput callback
        console.log("let's see files in hook", files)
        if (!files || files.length === 0) return;

        setProgressShow(true);
        const uploadPromises = files.map((file) => {
            const fileName = `${new Date().getTime()}_${file.name}`;

            // console.log("in handle upload ",fileName)
            const storageRef = ref(storage, `files/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const uploaded = Math.floor(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgress(uploaded);
                    },
                    (error) => reject(error),
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            resolve({
                                url,
                                fileName
                            });
                        });
                    }
                );
            });
        });

        try {
            const urlsWithNames = await Promise.all(uploadPromises);

            

            await saveFileLinksToDB(urlsWithNames);
            setFiles([]);
            resetFileInput(); // Call the resetFileInput callback

            if (type === 'handwrittenNotes') {
                console.log('checking urls ',urlsWithNames)
                const payload =
                {
                    url: urlsWithNames[0].url, // replace with the actual URL 
                    patient_name: patientName, // replace with the actual patient 
                    doctor_name: JSON.parse(localStorage.getItem("userInfo")).name, // replace with the actual doctor name 
                };
                try {
                    const response = await axios.post('http://127.0.0.1:5001/upload_handwritten_notes', payload);
                    // console.log('success in uploading there', response.data);
                }
                catch (error) {
                    console.error('There was an error uploading the notes:', error);
                }
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setProgressShow(false);
            setProgress(0);
        }
    };

    const handleSingleUpload = async (resetFileInput, IndividualFile) => {
        // Ensure IndividualFile is valid
        if (!IndividualFile) return;

        setProgressShow(true);

        const fileName = `${new Date().getTime()}_${IndividualFile.name}`;
        const storageRef = ref(storage, `files/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, IndividualFile);

        try {
            // Create a promise to handle the file upload
            const urlWithName = await new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const uploaded = Math.floor(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgress(uploaded);
                    },
                    (error) => reject(error),
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            resolve({
                                url,
                                fileName
                            });
                        });
                    }
                );
            });


            if (type === 'handwrittenNotes') {
                console.log('checking urls ',urlWithName.url)
                const payload =
                {
                    url: urlWithName.url, // replace with the actual URL 
                    patient_name: patientName, // replace with the actual patient 
                    doctor_name: JSON.parse(localStorage.getItem("userInfo")).name, // replace with the actual doctor name 
                };
                try {
                    const response = await axios.post('http://127.0.0.1:5001/upload_handwritten_notes', payload);
                    console.log('success in uploading there', response.data);
                }
                catch (error) {
                    console.error('There was an error uploading the notes:', error);
                }
            }

            // Save file link to database
            await saveFileLinksToDB([urlWithName]);
            setFiles([]);
            resetFileInput(); // Call the resetFileInput callback
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setProgressShow(false);
            setProgress(0);
        }
    };


    const saveFileLinksToDB = async (urlsWithNames) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/patients/files`, {
                patientId,
                fileType: type,
                files: urlsWithNames
            });
            onUploadSuccess(); // Call the onUploadSuccess callback
        } catch (err) {
            console.error('Failed to save files to DB', err);
        }
    };

    return {
        files,
        progress,
        progressShow,
        handleUpload,
        handleFileChange,
        handleSingleUpload,
        setFiles
    };
};