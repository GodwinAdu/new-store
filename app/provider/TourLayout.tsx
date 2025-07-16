'use client';

import React, { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../context/TourContext';


interface TourLayoutProps {
    children: React.ReactNode;
}

const TourLayout: React.FC<TourLayoutProps> = ({ children }) => {
    const { state, setRun} = useTour();

    useEffect(() => {
        // Check localStorage for the completed status
        const tourCompleted = localStorage.getItem('tourCompleted') === 'true';

        if (!tourCompleted) {
            // Delay the start of the tour to ensure all components are mounted
            const timer = setTimeout(() => setRun(true), 500);
            return () => clearTimeout(timer);
        }
    }, [setRun]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;

        // Log callback data for debugging purposes
        console.log('Joyride callback', data);

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as 'finished' | 'skipped')) {
            // Stop the tour
            setRun(false);

            // Mark the tour as completed in localStorage
            localStorage.setItem('tourCompleted', 'true');
        }
    };

    return (
        <>
            <Joyride
                steps={state.steps}
                run={state.run}
                continuous
                showSkipButton
                showProgress
                disableOverlayClose
                disableScrolling
                styles={{
                    options: {
                        primaryColor: '#007bff',
                        zIndex: 10000,
                    },
                }}
                callback={handleJoyrideCallback}
            />
            {children}
        </>
    );
};

export default TourLayout;
