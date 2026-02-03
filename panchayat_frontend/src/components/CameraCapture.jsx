import { useState, useRef, useEffect } from "react";
import { Box, Button, HStack, Image, VStack } from "@chakra-ui/react";

const CameraCapture = ({ src, onCapture, onClear, showRetake = true }) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const streamRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      // --- IMAGE COMPRESSION LOGIC ---
      // 1. Determine target dimensions (Max 800px)
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      // Use standard smoothing for resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(video, 0, 0, width, height);

      // 2. Export as JPEG with lower quality (0.7) to drastically reduce size
      const imageUrl = canvas.toDataURL("image/jpeg", 0.7);

      canvas.toBlob((blob) => {
        // Name it as jpg since we changed format
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        onCapture(file, imageUrl);
      }, "image/jpeg", 0.7);

      stopCamera();
      setCameraOpen(false);
    }
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleRemove = () => {
    stopCamera();
    setCameraOpen(false);
    onClear();
  };

  return (
    <Box mt={2}>
      {/* 1. Initial State: No Photo & Camera Closed */}
      {!src && !cameraOpen && (
        <Button size="sm" colorScheme="blue" onClick={startCamera}>
          📷 camera open
        </Button>
      )}

      {/* 2. Camera Viewfinder */}
      {cameraOpen && (
        <VStack spacing={3} mt={2}>
          <Box
            borderRadius="md"
            overflow="hidden"
            border="2px solid #ccc"
            width="100%"
            maxWidth="300px"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%", display: "block" }}
            />
          </Box>
          <canvas ref={canvasRef} hidden />

          <Button colorScheme="green" onClick={capturePhoto}>
            📸 ફોટો ક્લિક કરો
          </Button>
        </VStack>
      )}

      {/* 3. Preview State (Photo Exists) - independent of cameraOpen status, 
          but usually camera is closed when preview is shown unless retaking immediately overrides it.
          Let's show preview only if camera is NOT open, or if we want to show it. 
          Standard flow: src exists -> show preview. Retake -> hides preview, shows camera. */}
      {src && !cameraOpen && (
        <Box mt={2}>
          <Image
            src={src}
            alt="Captured"
            maxW="200px"
            borderRadius="md"
            border="1px solid #ccc"
          />

          <HStack mt={2}>
            {showRetake && (
              <Button size="sm" colorScheme="orange" onClick={handleRetake}>
                🔄 retake
              </Button>
            )}

            <Button size="sm" colorScheme="red" onClick={handleRemove}>
              🗑 ફોટો દૂર કરો
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default CameraCapture;
