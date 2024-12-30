// dateTimeUtils.js

export const formatTime = (datetimeStr) => {
    const datetimeObj = new Date(datetimeStr);
    const hours = datetimeObj.getUTCHours().toString().padStart(2, '0');
    const minutes = datetimeObj.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  export const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    return dateObj.toLocaleDateString('en-US', options);
  };
  