import React, { useState } from 'react';

// Custom hook for debouncing
 const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;