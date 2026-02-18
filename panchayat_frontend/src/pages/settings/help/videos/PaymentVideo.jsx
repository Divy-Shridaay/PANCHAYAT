"use client";

import {
    Box,
    Heading,
    Button,
    Flex,
    IconButton,
    HStack,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
} from "@chakra-ui/react";
import {
    FiArrowLeft,
    FiPlay,
    FiPause,
    FiVolume2,
    FiVolumeX,
    FiMaximize,
    FiMinimize,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export default function PaymentVideo() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = true;
        video.play();
    }, []);

    useEffect(() => {
        const handler = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        video.paused ? video.play() : video.pause();
        setIsPlaying(!video.paused);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleSeek = (value) => {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        video.currentTime = (value / 100) * video.duration;
        setProgress(value);
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        document.fullscreenElement
            ? document.exitFullscreen()
            : el.requestFullscreen();
    };

    return (
        <Box bg="#F8FAF9" minH="100vh" p={10}>
            <Flex align="center" mb={6}>
                <Button
                    leftIcon={<FiArrowLeft />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => navigate("/settings/help/videos")}
                >
                    પાછા જાવ
                </Button>

                <Heading flex="1" textAlign="center" size="lg" color="green.800">
                    પેમેન્ટ ફ્લો
                </Heading>

                <Box width="120px" />
            </Flex>

            <Box
                ref={containerRef}
                bg="black"
                rounded="2xl"
                overflow="hidden"
                maxW="1000px"
                mx="auto"
                position="relative"
            >
                <video
                    ref={videoRef}
                    src="/videos/Payment.mp4"
                    style={{ width: "100%" }}
                    autoPlay
                    muted
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                />

                <Box position="absolute" bottom="0" width="100%" bg="rgba(0,0,0,0.65)" p={3}>
                    <Slider value={progress} onChange={handleSeek} mb={3}>
                        <SliderTrack bg="gray.600">
                            <SliderFilledTrack bg="green.400" />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>

                    <HStack spacing={3}>
                        <IconButton
                            icon={isPlaying ? <FiPause /> : <FiPlay />}
                            onClick={togglePlay}
                            colorScheme="green"
                            aria-label="Play / Pause"
                        />
                        <IconButton
                            icon={isMuted ? <FiVolumeX /> : <FiVolume2 />}
                            onClick={toggleMute}
                            colorScheme="green"
                            aria-label="Mute / Unmute"
                        />
                        <IconButton
                            icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
                            onClick={toggleFullscreen}
                            colorScheme="green"
                            aria-label="Fullscreen toggle"
                        />
                    </HStack>
                </Box>
            </Box>
        </Box>
    );
}
