'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import VideoBackground from './VideoBackground'
import AnimatedText from './AnimateText'


const Hero: React.FC = () => {
    return (
        <section className="relative h-[calc(100vh)] flex items-center justify-center overflow-hidden">
            <VideoBackground />
            {/* <ParticlesComponent /> */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-4 w-full max-w-4xl mx-auto">
                <AnimatedText
                    text="Transform Your Business"
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6`}
                />
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`text-lg sm:text-xl md:text-2xl lg:text-3xl mb-10`}
                >
                    Streamline Operations • Boost Efficiency • Increase Profits
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
                >
                    <Link
                        href="/sign-in"
                        className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105`}
                    >
                        Sign In
                    </Link>
                    <a
                        href="/learn-more"
                        className={`w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105`}
                    >
                        Learn More
                    </a>
                </motion.div>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
                <a href="#features" className="animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </a>
            </motion.div>
        </section>
    )
}

export default Hero

