'use client'


import { useTour } from '@/app/context/TourContext'
import { useEffect, useRef } from 'react'
import { Step } from 'react-joyride'

export const useTourControl = (componentSteps: Step[]) => {
    const { addSteps, removeSteps } = useTour()
    const stepsRef = useRef(componentSteps)

    useEffect(() => {
        addSteps(stepsRef.current)
        return () => {
            removeSteps(stepsRef.current)
        }
    }, [addSteps, removeSteps])
}
