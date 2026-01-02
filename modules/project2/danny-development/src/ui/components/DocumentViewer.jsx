import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Select,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { FiPrinter, FiZoomIn, FiZoomOut } from "react-icons/fi";
import TableComponent from "./TableComponent";

export default function DocumentViewer({ columns, data }) {
  const [searchParams] = useSearchParams();
  const docType = searchParams.get("type");
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState("single");

  const printDoc = () => window.print();

  return (
    <VStack w="100%" spacing={4} p={4}>
      {/* Header Controls */}
      <HStack justifyContent="space-between" w="100%">
        <Button leftIcon={<FiPrinter />} colorScheme="teal" onClick={printDoc}>
          Print
        </Button>
        <HStack spacing={4}>
          <IconButton
            icon={<FiZoomOut />}
            onClick={() => setZoom((z) => Math.max(10, z - 10))}
            aria-label="Zoom out"
          />
          <Slider
            w="150px"
            aria-label="zoom"
            value={zoom}
            onChange={setZoom}
            min={10}
            max={300}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <IconButton
            icon={<FiZoomIn />}
            onClick={() => setZoom((z) => Math.min(300, z + 10))}
            aria-label="Zoom in"
          />
        </HStack>

        <Select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          maxW="200px"
        >
          <option value="single">Single Page</option>
          <option value="two">Two Page View</option>
          <option value="four">Four Page View</option>
        </Select>
      </HStack>

      {/* Document Preview Area */}
      <Box
        w="100%"
        h="80vh"
        border="1px solid #ccc"
        overflow="auto"
        bg="gray.50"
        p={4}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        <Text fontWeight="bold">Showing: {docType}</Text>
        {/* Placeholder for actual document rendering */}
        <Box bg="white" w="100%" h="600px" mt={4} shadow="md" p={4}>
          <TableComponent
            columns={columns}
            data={[]}
            isSearch={false}
            isCreate={false}
          />
        </Box>
      </Box>
    </VStack>
  );
}
