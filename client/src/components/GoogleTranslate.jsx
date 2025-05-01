import React, { useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const GoogleTranslate = () => {
    useEffect(() => {
        // Function to initialize the Google Translate element
        const initGoogleTranslate = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            }
        };

        // Load the Google Translate API script
        if (!document.querySelector('#google-translate-script')) {
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.id = 'google-translate-script';
            document.body.appendChild(script);
            window.googleTranslateElementInit = initGoogleTranslate;
        } else {
            initGoogleTranslate();
        }

        // Interval to check and remove the text node and span
        const removePoweredBy = setInterval(() => {
            const poweredBySpan = document.querySelector('.skiptranslate span');
            if (poweredBySpan && poweredBySpan.previousSibling) {
                // Remove the text node before the <span> (usually the "Powered by" text)
                poweredBySpan.previousSibling.remove();
                // Remove the <span> containing the Google branding logo
                poweredBySpan.remove();
                clearInterval(removePoweredBy); // Stop checking once removed
            }
        }, 100);

        return () => clearInterval(removePoweredBy); // Cleanup on unmount
    }, []);

    return (
        <Box
            backgroundColor={useColorModeValue('white', 'gray.800')}
            borderRadius="md"
            boxShadow="sm"
            py={1}
            px={3}
            mr={3}
            _hover={{
                boxShadow: 'md',
            }}
        >
            <div id="google_translate_element" />
        </Box>
    );
};

export default GoogleTranslate;
