import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  HStack,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CategorySettings = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const API_BASE =
    (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + "/api";

  const [categories, setCategories] = useState({ aavak: [], javak: [] });
  const [type, setType] = useState("aavak");
  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/categories`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await res.json();

    const grouped = { aavak: [], javak: [] };
    data.forEach((c) => {
      if (c.type === "aavak") grouped.aavak.push(c);
      if (c.type === "javak") grouped.javak.push(c);
    });

    setCategories(grouped);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ name: name.trim(), type }),
    });

    if (res.ok) {
      setName("");
      fetchCategories();
      toast({ title: "કેટેગરી ઉમેરાઈ", status: "success" });
    }
  };

  const updateCategory = async (id) => {
    if (!editingName.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ name: editingName.trim() }),
    });

    if (res.ok) {
      setEditingId(null);
      setEditingName("");
      fetchCategories();
      toast({ title: "કેટેગરી સુધારાઈ", status: "success" });
    }
  };

  const deleteCategory = async (id) => {
    const ok = window.confirm("શું તમે આ કેટેગરી કાઢી નાખવા માંગો છો?");
    if (!ok) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (res.ok) {
      fetchCategories();
      toast({ title: "કેટેગરી કાઢી નાખવામાં આવી", status: "info" });
    }
  };

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* HEADER */}
      <Flex align="center" mb={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/settings")}
        >
          પાછા જાવ
        </Button>

        <Heading
          flex="1"
          textAlign="center"
          size="xl"
          color="green.800"
          fontWeight="700"
        >
          સેટિંગ્સ – કેટેગરી વ્યવસ્થાપન
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* CARD */}
      <Box
        bg="white"
        p={8}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
        maxW="700px"
        mx="auto"
      >
        <VStack spacing={6} align="stretch">
          <Heading size="md" color="green.700">
            નવી કેટેગરી ઉમેરો
          </Heading>

          <FormControl>
            <FormLabel>કેટેગરી પ્રકાર</FormLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="aavak">આવક</option>
              <option value="javak">જાવક</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>કેટેગરી નામ</FormLabel>
            <Input
              placeholder="કેટેગરી નામ લખો"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <Button colorScheme="green" onClick={addCategory}>
            ઉમેરો
          </Button>

          <Box pt={4}>
            <Text fontWeight="600" mb={2}>
              હાલની કેટેગરીઓ ({type === "aavak" ? "આવક" : "જાવક"})
            </Text>

            {(categories[type] || []).map((c) => (
              <HStack
                key={c._id}
                p={3}
                mb={2}
                rounded="md"
                bg="gray.50"
                border="1px solid #E2E8F0"
                justify="space-between"
              >
                {editingId === c._id ? (
                  <HStack flex="1">
                    <Input
                      size="sm"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => updateCategory(c._id)}
                    >
                      સેવ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                    >
                      રદ
                    </Button>
                  </HStack>
                ) : (
                  <>
                    <Text fontWeight="500">{c.name}</Text>

                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => {
                          setEditingId(c._id);
                          setEditingName(c.name);
                        }}
                      >
                        એડિટ
                      </Button>

                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => deleteCategory(c._id)}
                      >
                        ડિલીટ
                      </Button>
                    </HStack>
                  </>
                )}
              </HStack>
            ))}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default CategorySettings;
