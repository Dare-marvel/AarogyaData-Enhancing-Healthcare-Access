import {
    faFilePdf,
    faFileWord,
    faFileExcel,
    faFilePowerpoint,
    faFileImage,
    faFileAlt,
    faFile
} from '@fortawesome/free-solid-svg-icons';

export const getFileIcon = (url) => {
    const cleanUrl = url.split('?')[0];
    const extension = cleanUrl.split('.').pop().toLowerCase();

    const iconMap = {
        pdf: { icon: faFilePdf, color: 'red' },
        doc: { icon: faFileWord, color: 'blue' },
        docx: { icon: faFileWord, color: 'blue' },
        xls: { icon: faFileExcel, color: 'green' },
        xlsx: { icon: faFileExcel, color: 'green' },
        ppt: { icon: faFilePowerpoint, color: 'pink' },
        pptx: { icon: faFilePowerpoint, color: 'pink' },
        jpg: { icon: faFileImage, color: 'brown' },
        jpeg: { icon: faFileImage, color: 'brown' },
        png: { icon: faFileImage, color: 'brown' },
        txt: { icon: faFileAlt, color: 'black' }
    };

    return iconMap[extension] || { icon: faFile, color: 'gray' };
};

export const shouldShowViewButton = (url) => {
    const cleanUrl = url.split('?')[0];
    const extension = cleanUrl.split('.').pop().toLowerCase();
    const nonViewableExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    return !nonViewableExtensions.includes(extension);
};
