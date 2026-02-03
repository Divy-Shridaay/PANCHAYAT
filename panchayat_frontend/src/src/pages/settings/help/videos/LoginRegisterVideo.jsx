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

export default function LoginRegisterVideo() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ▶️ Auto-play (muted) */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play();
  }, []);

  /* 🔄 Sync fullscreen state (ESC / browser exit) */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  /* ⏱ Update progress */
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const percent = (video.currentTime / video.duration) * 100;
    setProgress(percent || 0);
  };

  /* ⏯ Play / Pause */
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  /* 🔊 Mute / Unmute */
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  /* ⏩ Seek */
  const handleSeek = (value) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  /* ⛶ Fullscreen toggle */
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* HEADER */}
      <Flex align="center" mb={6}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/settings/help/videos")}
        >
          પાછા જાવ
        </Button>

        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.800"
          fontWeight="700"
        >
          લોગિન અને રજીસ્ટ્રેશન
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* VIDEO PLAYER */}
      <Box
        ref={containerRef}
        bg="black"
        rounded="2xl"
        overflow="hidden"
        maxW="1000px"
        mx="auto"
        position="relative"
      >
        {/* VIDEO */}
        <video
          ref={videoRef}
          src="/videos/dummy.mp4"
          style={{ width: "100%" }}
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
        />

        {/* CONTROLS */}
        <Box
          position="absolute"
          bottom="0"
          width="100%"
          bg="rgba(0,0,0,0.65)"
          p={3}
        >
          {/* Progress Bar */}
          <Slider value={progress} onChange={handleSeek} mb={3}>
            <SliderTrack bg="gray.600">
              <SliderFilledTrack bg="green.400" />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          {/* Buttons */}
          <HStack spacing={3}>
            <IconButton
              icon={isPlaying ? <FiPause /> : <FiPlay />}
              onClick={togglePlay}
              aria-label="Play / Pause"
              colorScheme="green"
            />

            <IconButton
              icon={isMuted ? <FiVolumeX /> : <FiVolume2 />}
              onClick={toggleMute}
              aria-label="Mute / Unmute"
              colorScheme="green"
            />

            <IconButton
              icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
              onClick={toggleFullscreen}
              aria-label="Fullscreen toggle"
              colorScheme="green"
            />
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
