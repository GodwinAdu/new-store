import React from 'react'

const VideoBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute min-w-full min-h-full object-cover"
            >
                <source src="/pos-background.webm" type="video/webm" />
                <source src="/hero1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
    )
}

export default VideoBackground

