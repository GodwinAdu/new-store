'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { Step } from 'react-joyride';
import { create } from 'zustand';

interface TourStore {
    completed: boolean;
    setCompleted: (completed: boolean) => void;
}

const useTourStore = create<TourStore>((set) => ({
    completed: typeof window !== 'undefined' && localStorage.getItem('tourCompleted') === 'true',
    setCompleted: (completed: boolean) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('tourCompleted', completed.toString());
        }
        set({ completed });
    },
}));

// Tour Context
interface TourState {
    steps: Step[];
    run: boolean;
}

type TourAction =
    | { type: 'ADD_STEPS'; payload: Step[] }
    | { type: 'REMOVE_STEPS'; payload: Step[] }
    | { type: 'SET_RUN'; payload: boolean }
    | { type: 'RESET_TOUR' };

interface TourContextType {
    state: TourState;
    addSteps: (steps: Step[]) => void;
    removeSteps: (steps: Step[]) => void;
    setRun: (run: boolean) => void;
    resetTour: () => void;
    handleTourComplete: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const tourReducer = (state: TourState, action: TourAction): TourState => {
    switch (action.type) {
        case 'ADD_STEPS':
            return { ...state, steps: [...state.steps, ...action.payload] };
        case 'REMOVE_STEPS':
            return {
                ...state,
                steps: state.steps.filter((step) => !action.payload.includes(step)),
            };
        case 'SET_RUN':
            return { ...state, run: action.payload };
        case 'RESET_TOUR':
            return { steps: [], run: true };
        default:
            return state;
    }
};

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(tourReducer, { steps: [], run: false });

    const { completed, setCompleted } = useTourStore();

    useEffect(() => {
        if (!completed) {
            // Set the tour to run only if it hasn't been completed
            dispatch({ type: 'SET_RUN', payload: true });
        }
    }, [completed]);

    const addSteps = useCallback((steps: Step[]) => {
        dispatch({ type: 'ADD_STEPS', payload: steps });
    }, []);

    const removeSteps = useCallback((steps: Step[]) => {
        dispatch({ type: 'REMOVE_STEPS', payload: steps });
    }, []);

    const setRun = useCallback((run: boolean) => {
        dispatch({ type: 'SET_RUN', payload: run });
    }, []);

    const resetTour = useCallback(() => {
        dispatch({ type: 'RESET_TOUR' });
        setCompleted(false); // Reset the completed state
    }, [setCompleted]);

    const handleTourComplete = useCallback(() => {
        setCompleted(true); // Mark the tour as completed
        dispatch({ type: 'SET_RUN', payload: false });
    }, [setCompleted]);

    const value = { state, addSteps, removeSteps, setRun, resetTour, handleTourComplete };

    return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
