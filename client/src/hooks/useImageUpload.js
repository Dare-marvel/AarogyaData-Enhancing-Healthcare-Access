import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import storage from '../config/firebase';

export const useImageUpload = () => {
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);

  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const fileName = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercentage = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(progressPercentage);
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setDownloadURL(url);
            resolve(url);
          });
        }
      );
    });
  };

  const handleDelete = async (fileName) => {
    try {
      if (fileName) {
        // Decode the URL-encoded filename if needed
        const decodedFileName = decodeURIComponent(fileName);
        const fileRef = ref(storage, `images/${decodedFileName}`);
        await deleteObject(fileRef);
        // console.log("Deleted Successfully")
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };


  return { progress, downloadURL, uploadImage, handleDelete };
};
