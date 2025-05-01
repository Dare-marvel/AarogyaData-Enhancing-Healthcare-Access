export const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
};

export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'yellow' };
    if (bmi < 25) return { label: 'Normal weight', color: 'green' };
    if (bmi < 30) return { label: 'Overweight', color: 'orange' };
    return { label: 'Obese', color: 'red' };
};