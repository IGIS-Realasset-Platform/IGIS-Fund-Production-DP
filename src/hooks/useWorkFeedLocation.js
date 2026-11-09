import { useEffect, useState } from 'react';
import { readWorkFeedLocation } from '../utils/workFeedLocation';

export default function useWorkFeedLocation() {
    const [location, setLocation] = useState(() => readWorkFeedLocation());
    useEffect(() => {
        const sync = () => setLocation(readWorkFeedLocation());
        window.addEventListener('popstate', sync);
        window.addEventListener('iota:feed-navigation', sync);
        return () => {
            window.removeEventListener('popstate', sync);
            window.removeEventListener('iota:feed-navigation', sync);
        };
    }, []);
    return location;
}
