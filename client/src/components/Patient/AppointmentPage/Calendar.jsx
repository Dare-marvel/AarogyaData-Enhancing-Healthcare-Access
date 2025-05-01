import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    IconButton,
    Select,
    useColorModeValue,
    GridItem,
    Grid,
} from '@chakra-ui/react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const Calendar = ({ value, onChange, tileClassName }) => {
    const [currentDate, setCurrentDate] = useState(value || new Date());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

    useEffect(() => {
        setCurrentDate(value || new Date());
        setSelectedYear(currentDate.getFullYear());
        setSelectedMonth(currentDate.getMonth());
    }, [value]);

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getWeekday = (year, month, date) => {
        return new Date(year, month, date).getDay();
    };

    const handlePrevMonth = () => {
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
        setCurrentDate(new Date(newYear, newMonth, 1));
        onChange(new Date(newYear, newMonth, 1));
    };

    const handleNextMonth = () => {
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;

        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
        setCurrentDate(new Date(newYear, newMonth, 1));
        onChange(new Date(newYear, newMonth, 1));
    };


    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        setCurrentDate(new Date(event.target.value, selectedMonth, 1));
        onChange(new Date(event.target.value, selectedMonth, 1));
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setCurrentDate(new Date(selectedYear, event.target.value, 1));
        onChange(new Date(selectedYear, event.target.value, 1));
    };

    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const weekday = getWeekday(selectedYear, selectedMonth, 1);

    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const availableDateBg = useColorModeValue('green.400', 'green.600');
    const availableDateColor = useColorModeValue('white', 'gray.800');
    const currentDateBg = useColorModeValue('yellow.400', 'yellow.600');
    const currentDateColor = useColorModeValue('gray.800', 'gray.100');
    const unavailableDateBg = useColorModeValue('gray.300', 'gray.600');
    const previousMonthDateBg = useColorModeValue('gray.200', 'gray.600');
    const nextMonthDateBg = useColorModeValue('gray.200', 'gray.600');
    const dateCellBorder = useColorModeValue('1px solid gray.200', '1px solid gray.600');

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return (
        <Box borderWidth={1} borderRadius="md" p={4}>
            <Flex justify="space-between" align="center" mb={4}>
                <IconButton
                    aria-label="Previous Month"
                    icon={<FaAngleLeft />}
                    onClick={handlePrevMonth}
                    variant="ghost"
                    isDisabled={
                        selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()
                    }
                />
                <Flex align="center" gap={4}>
                    <Select value={selectedMonth} onChange={handleMonthChange}> {Array.from({ length: 12 }).map((_, index) => { // If the selected year is the current year, only show the remaining months 
                        if (selectedYear === currentYear && index < currentMonth) { return null; } return (<option key={index} value={index}> {new Date(0, index).toLocaleString('default', { month: 'long' })} </option>);
                    })}
                    </Select>
                    <Select value={selectedYear} onChange={handleYearChange}> 
                    {Array.from({ length: 10 }).map((_, index) => (<option key={index} value={currentYear + index - 4}> {currentYear + index - 4} </option>))}
                    </Select>
                </Flex>
                <IconButton
                    aria-label="Next Month"
                    icon={<FaAngleRight />}
                    onClick={handleNextMonth}
                    variant="ghost"
                />
            </Flex>
            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <GridItem key={`weekday-${index}`} py={2} textAlign="center" fontWeight="bold">
                        {day}
                    </GridItem>
                ))}
                {Array.from({ length: weekday }).map((_, index) => (
                    <GridItem
                        key={`empty-${index}`}
                        py={2}
                        borderWidth={dateCellBorder}
                        bg={previousMonthDateBg}
                        color="gray.500"
                        cursor="not-allowed"
                    >
                        {new Date(selectedYear, selectedMonth, -(weekday - index)).getDate()}
                    </GridItem>
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const date = new Date(selectedYear, selectedMonth, index + 1);
                    const dateString = date.toISOString().slice(0, 10);
                    const isCurrentDate = date.toDateString() === new Date().toDateString();
                    const isAvailable = tileClassName?.(date) === 'available-date';
                    const isUnavailable = date < new Date();
                    return (
                        <GridItem
                            key={dateString}
                            py={2}
                            px={3}
                            borderWidth={dateCellBorder}
                            bg={
                                isCurrentDate
                                    ? currentDateBg
                                    : isAvailable
                                        ? availableDateBg
                                        : isUnavailable
                                            ? unavailableDateBg
                                            : bgColor
                            }
                            color={isCurrentDate ? currentDateColor : isAvailable ? availableDateColor : undefined}
                            cursor={isUnavailable ? 'not-allowed' : 'pointer'}
                            _hover={{
                                bg:
                                    isCurrentDate || isAvailable
                                        ? undefined
                                        : isUnavailable
                                            ? unavailableDateBg
                                            : 'gray.200',
                            }}
                            onClick={() =>{
                                console.log("checking teh date", date,typeof date);
                                onChange(date);
                            } }
                        >
                            {index + 1}
                        </GridItem>
                    );
                })}
                {Array.from({ length: (7 - ((weekday + daysInMonth) % 7)) % 7 }).map((_, index) => (
                    <GridItem
                        key={`next-month-${index}`}
                        py={2}
                        px={3}
                        borderWidth={dateCellBorder}
                        bg={nextMonthDateBg}
                        color="gray.500"
                        cursor="not-allowed"
                    >
                        {index + 1}
                    </GridItem>
                ))}
            </Grid>
        </Box>
    );
};

export default Calendar;