'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  Image,
  VStack,
  SimpleGrid,
  useToast,
  Icon,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Stack,
  Select,
} from '@chakra-ui/react';
import { DownloadIcon, AttachmentIcon } from '@chakra-ui/icons';

// NETFLIX COLOR PALETTE
const NETFLIX_RED = '#E50914';
const NETFLIX_RED_HOVER = '#B20710';
const NETFLIX_BLACK = '#000000';
const NETFLIX_DARK_GRAY = '#141414';
const NETFLIX_LIGHT_GRAY = '#333333';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('NETFLIX ORIGINAL'); // Default text
  const [position, setPosition] = useState<string>('center');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format Salah",
          description: "Harap upload file gambar.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
          containerStyle: {
            bg: NETFLIX_DARK_GRAY,
            color: 'white'
          }
        });
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setProcessedImage(null);
    }
  };

  const applyWatermark = () => {
    if (!selectedImage || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new window.Image(); 
    
    img.src = selectedImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw Image
      ctx?.drawImage(img, 0, 0);

      // 2. Draw Watermark
      if (ctx) {
        const fontSize = Math.floor(img.width / 20);
        // Font Impact atau Arial Bold agar tegas seperti subtitle film
        ctx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`; 
        ctx.fillStyle = 'rgba(229, 9, 20, 0.8)'; // Merah Netflix Transparan
        
        // Shadow Effect (Outline)
        ctx.lineWidth = fontSize / 15;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeText(watermarkText, 0, 0); // Placeholder for sizing

        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        
        const padding = img.width * 0.05;

        ctx.save();

        if (position === 'center') {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(canvas.width / 2, canvas.height / 2);
            // ctx.rotate(-Math.PI / 4); // Opsional: Matikan rotasi jika ingin seperti logo film
            ctx.strokeText(watermarkText, 0, 0);
            ctx.fillText(watermarkText, 0, 0);
        } 
        else if (position === 'top-left') {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.strokeText(watermarkText, padding, padding);
            ctx.fillText(watermarkText, padding, padding);
        }
        else if (position === 'top-right') {
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.strokeText(watermarkText, canvas.width - padding, padding);
            ctx.fillText(watermarkText, canvas.width - padding, padding);
        }
        else if (position === 'bottom-left') {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.strokeText(watermarkText, padding, canvas.height - padding);
            ctx.fillText(watermarkText, padding, canvas.height - padding);
        }
        else if (position === 'bottom-right') {
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.strokeText(watermarkText, canvas.width - padding, canvas.height - padding);
            ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);
        }

        ctx.restore();
      }

      const resultUrl = canvas.toDataURL('image/jpeg');
      setProcessedImage(resultUrl);
      setIsProcessing(false);
      
      toast({
        title: "Selesai",
        description: "Watermark bergaya sinematik diterapkan.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    };
  };

  return (
    <Box minH="100vh" bg={NETFLIX_BLACK} color="white" py={10} fontFamily="sans-serif">
      <Container maxW="container.xl">
        
        {/* HEADER: NETFLIX STYLE */}
        <VStack spacing={4} mb={12} textAlign="center">
          <Heading 
            as="h1" 
            size="3xl" 
            color={NETFLIX_RED}
            letterSpacing="widest"
            textTransform="uppercase"
            fontWeight="900"
            textShadow="0px 0px 20px rgba(229, 9, 20, 0.6)"
          >
            WATERMARK
          </Heading>
          <Text color="gray.400" fontSize="lg" fontWeight="medium">
            TUGAS PENGOLAHAN CITRA DIGITAL
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          
          {/* KOLOM KIRI: CONTROL PANEL */}
          <Card 
            bg={NETFLIX_DARK_GRAY} 
            borderColor="gray.800" 
            borderWidth={1} 
            shadow="2xl"
            borderRadius="md"
          >
            <CardBody p={8}>
              <Stack spacing={6}>
                <Heading size="md" color="white" mb={2}>
                  ADD TO YOUR LIST
                </Heading>
                
                {/* 1. UPLOAD */}
                <FormControl>
                  <FormLabel color="gray.400" fontSize="sm">UPLOAD IMAGE</FormLabel>
                  <Box
                    position="relative"
                    h="120px"
                    border="2px dashed"
                    borderColor="gray.600"
                    bg={NETFLIX_BLACK}
                    borderRadius="sm"
                    _hover={{ borderColor: NETFLIX_RED, bg: '#1a1a1a' }}
                    transition="all 0.3s"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Input
                      type="file"
                      height="100%"
                      width="100%"
                      position="absolute"
                      top="0"
                      left="0"
                      opacity="0"
                      cursor="pointer"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <VStack spacing={2}>
                      <Icon as={AttachmentIcon} w={8} h={8} color={NETFLIX_RED} />
                      <Text fontSize="xs" color="gray.500" fontWeight="bold">DRAG & DROP OR CLICK</Text>
                    </VStack>
                  </Box>
                </FormControl>

                {/* 2. TEXT INPUT */}
                <FormControl>
                  <FormLabel color="gray.400" fontSize="sm">WATERMARK TEXT</FormLabel>
                  <Input 
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    bg={NETFLIX_LIGHT_GRAY}
                    border="none"
                    color="white"
                    h="50px"
                    borderRadius="sm"
                    fontWeight="bold"
                    _focus={{ ring: 2, ringColor: NETFLIX_RED }}
                    placeholder="Enter text..."
                  />
                </FormControl>

                {/* 3. POSITION SELECT */}
                <FormControl>
                  <FormLabel color="gray.400" fontSize="sm">POSITION</FormLabel>
                  <Select 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)}
                    bg={NETFLIX_LIGHT_GRAY}
                    border="none"
                    color="white"
                    h="50px"
                    borderRadius="sm"
                    cursor="pointer"
                    _focus={{ ring: 2, ringColor: NETFLIX_RED }}
                  >
                    <option style={{background: NETFLIX_LIGHT_GRAY}} value="center">Center Title (Diagonal)</option>
                    <option style={{background: NETFLIX_LIGHT_GRAY}} value="top-left">Top Left</option>
                    <option style={{background: NETFLIX_LIGHT_GRAY}} value="top-right">Top Right</option>
                    <option style={{background: NETFLIX_LIGHT_GRAY}} value="bottom-left">Bottom Left</option>
                    <option style={{background: NETFLIX_LIGHT_GRAY}} value="bottom-right">Bottom Right</option>
                  </Select>
                </FormControl>

                {/* PREVIEW THUMBNAIL */}
                {selectedImage && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={2} fontWeight="bold">ORIGINAL SOURCE</Text>
                    <Box borderRadius="sm" overflow="hidden" border="1px solid" borderColor="gray.700">
                       <Image src={selectedImage} alt="Original" objectFit="cover" h="150px" w="100%" filter="brightness(0.8)" />
                    </Box>
                  </Box>
                )}

                {/* ACTION BUTTON */}
                <Button
                  onClick={applyWatermark}
                  isLoading={isProcessing}
                  loadingText="RENDERING..."
                  isDisabled={!selectedImage}
                  size="lg"
                  w="full"
                  bg={NETFLIX_RED}
                  color="white"
                  borderRadius="sm"
                  fontWeight="bold"
                  fontSize="md"
                  _hover={{ bg: NETFLIX_RED_HOVER, transform: 'scale(1.02)' }}
                  _active={{ transform: 'scale(0.98)' }}
                  transition="all 0.2s"
                >
                  PROCESS IMAGE
                </Button>
              </Stack>
            </CardBody>
          </Card>

          {/* KOLOM KANAN: PREVIEW SCREEN */}
          <Card 
            bg={NETFLIX_DARK_GRAY} 
            borderColor="gray.800" 
            borderWidth={1} 
            shadow="2xl"
            borderRadius="md"
            position="relative"
            overflow="hidden"
          >
             <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="500px" p={0}>
              
              {processedImage ? (
                <Box w="full" h="full" position="relative" className="group">
                  {/* Image Result */}
                  <Image src={processedImage} alt="Processed" w="100%" h="100%" objectFit="contain" />
                  
                  {/* Overlay on Hover (Like Netflix Tiles) */}
                  <Box 
                    position="absolute" 
                    bottom="0" 
                    left="0" 
                    right="0" 
                    bgGradient="linear(to-t, blackAlpha.900, transparent)" 
                    p={6}
                    opacity={1}
                    transition="opacity 0.3s"
                  >
                    <Text color="green.400" fontWeight="bold" fontSize="sm" mb={2}>98% Match</Text>
                    <Heading size="md" mb={4}>Result Ready</Heading>
                    
                    <Button
                      as="a"
                      href={processedImage}
                      download="netflix-style-watermark.jpg"
                      leftIcon={<DownloadIcon />}
                      bg="white"
                      color="black"
                      fontWeight="bold"
                      w="full"
                      _hover={{ bg: 'gray.200' }}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              ) : (
                <VStack spacing={4} opacity={0.5}>
                  <Box p={4} borderRadius="full" border="2px solid" borderColor="gray.600">
                    <Icon viewBox="0 0 24 24" w={10} h={10} fill="none" stroke="gray.600" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </Icon>
                  </Box>
                  <Text letterSpacing="widest" fontSize="sm" fontWeight="bold">PREVIEW SCREEN</Text>
                </VStack>
              )}
            </CardBody>
          </Card>

        </SimpleGrid>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </Container>
    </Box>
  );
}