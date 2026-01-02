import React, { useEffect, useState } from "react";
import {
  Center,
  Checkbox,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { CustomFormLabel } from "component-library-iboon";
import { fetchPermissionsPage } from "../../adapters/PermissionsApiAdapter";

export default function ManagePermissions({
  allowedPermissions,
  updatePermission,
}) {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const getAllPermissions = async () => {
      const response = await fetchPermissionsPage(1, 1000);
      setPermissions(response.data.data);
    };
    setTimeout(() => {
      getAllPermissions();
    }, 0);
    //eslint-disable-next-line
  }, []);

  const handleCheckboxChange = (e, name) => {
    const permissionId = `${name}_${e.target.name}`;

    // Ensure allowedPermissions is always an array
    let updatedPermissions = Array.isArray(allowedPermissions)
      ? [...allowedPermissions]
      : [];

    if (updatedPermissions.includes(permissionId)) {
      // If unchecked, remove it
      updatedPermissions = updatedPermissions.filter(
        (id) => id !== permissionId
      );
    } else {
      // If checked, add it
      updatedPermissions.push(permissionId);

      // Ensure "READ" permission is always checked if any other permission is selected
      if (e.target.name !== "READ") {
        const readPermission = `${name}_READ`;
        if (!updatedPermissions.includes(readPermission)) {
          updatedPermissions.push(readPermission);
        }
      }
    }

    updatePermission(updatedPermissions);
  };

  const handleRowMasterCheckBoxChange = (name) => {
    const permissionTypes = ["READ", "CREATE", "UPDATE", "DELETE"];

    // Generate full permission strings (e.g., ['categories_READ', 'categories_create'...])
    const fullPermissions = permissionTypes.map((type) => `${name}_${type}`);

    // Ensure allowedPermissions is always an array
    let updatedPermissions = Array.isArray(allowedPermissions)
      ? [...allowedPermissions]
      : [];

    // Check how many permissions for this name are already selected

    const existingPermissions = updatedPermissions.filter((perm) =>
      perm?.startsWith(`${name}_`)
    );

    if (existingPermissions.length === permissionTypes.length) {
      // If all permissions exist, remove them
      updatedPermissions = updatedPermissions.filter(
        (perm) => !perm?.startsWith(`${name}_`)
      );
    } else {
      // Otherwise, add missing permissions (avoid duplicates)
      fullPermissions.forEach((perm) => {
        if (!updatedPermissions.includes(perm)) {
          updatedPermissions.push(perm);
        }
      });
    }

    updatePermission(updatedPermissions);
  };

  const handleColumnMasterCheckBoxChange = (column) => {
    let updatedPermissions = Array.isArray(allowedPermissions)
      ? [...allowedPermissions]
      : [];

    // Generate all permission names for this column (e.g., 'categories_READ', 'product_READ', etc.)
    const columnPermissions = permissions.map(
      (permission) => `${permission.value}_${column}`
    );

    // Check if all column permissions already exist
    const allChecked = columnPermissions.every((perm) =>
      updatedPermissions.includes(perm)
    );

    if (allChecked) {
      // If all are checked, remove them
      updatedPermissions = updatedPermissions.filter(
        (perm) => !columnPermissions.includes(perm)
      );
    } else {
      // Otherwise, add missing permissions
      columnPermissions.forEach((perm) => {
        if (!updatedPermissions.includes(perm)) {
          updatedPermissions.push(perm);
        }
      });

      // If column is "Create", "Update", or "Delete", ensure "Read" is also selected
      if (column !== "READ") {
        const readPermissions = permissions.map(
          (permission) => `${permission.value}_READ`
        );

        readPermissions.forEach((perm) => {
          if (!updatedPermissions.includes(perm)) {
            updatedPermissions.push(perm);
          }
        });
      }
    }

    updatePermission(updatedPermissions);
  };

  return (
    <Center w={"100%"} borderRadius={"10px"} m={1}>
      <VStack w={"100%"} alignItems={"flex-start"}>
        <CustomFormLabel fontSize={"sm"}>Manage Permissions</CustomFormLabel>
        <TableContainer w={"100%"}>
          <Table variant={"simple"} size={"sm"}>
            <Thead>
              <Tr>
                <Th
                  textAlign={"center"}
                  borderColor="#D0D0D0"
                  borderWidth="1px"
                >
                  id
                </Th>
                <Th
                  textAlign={"center"}
                  borderColor="#D0D0D0"
                  borderWidth="1px"
                >
                  Permission
                </Th>
                <Th
                  textAlign={"center"}
                  borderColor="#D0D0D0"
                  borderWidth="1px"
                >
                  <HStack w={"100%"} justifyContent={"center"}>
                    <Text>Read</Text>
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      onChange={() => handleColumnMasterCheckBoxChange("READ")}
                      isChecked={
                        permissions && permissions?.length > 0
                          ? permissions?.every(
                              (permission) =>
                                allowedPermissions &&
                                allowedPermissions.includes(
                                  `${permission.value}_READ`
                                )
                            )
                          : false
                      }
                    />
                  </HStack>
                </Th>
                <Th
                  textAlign={"center"}
                  borderColor="#D0D0D0"
                  borderWidth="1px"
                >
                  <HStack w={"100%"} justifyContent={"center"}>
                    <Text>Create</Text>
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      onChange={() =>
                        handleColumnMasterCheckBoxChange("CREATE")
                      }
                      isChecked={
                        permissions && permissions?.length > 0
                          ? permissions?.every(
                              (permission) =>
                                allowedPermissions &&
                                allowedPermissions.includes(
                                  `${permission.value}_CREATE`
                                )
                            )
                          : false
                      }
                    />
                  </HStack>
                </Th>
                <Th
                  textAlign={"center"}
                  borderColor="#D0D0D0"
                  borderWidth="1px"
                >
                  <HStack w={"100%"} justifyContent={"center"}>
                    <Text>Update</Text>
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      onChange={() =>
                        handleColumnMasterCheckBoxChange("UPDATE")
                      }
                      isChecked={
                        permissions && permissions?.length > 0
                          ? permissions?.every(
                              (permission) =>
                                allowedPermissions &&
                                allowedPermissions.includes(
                                  `${permission.value}_UPDATE`
                                )
                            )
                          : false
                      }
                    />
                  </HStack>
                </Th>
                <Th
                  textAlign={"center"}
                  borderColor="#D0D0D0"
                  borderWidth="1px"
                >
                  <HStack w={"100%"} justifyContent={"center"}>
                    <Text>Delete</Text>
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      onChange={() =>
                        handleColumnMasterCheckBoxChange("DELETE")
                      }
                      isChecked={
                        permissions && permissions?.length > 0
                          ? permissions?.every(
                              (permission) =>
                                allowedPermissions &&
                                allowedPermissions.includes(
                                  `${permission.value}_DELETE`
                                )
                            )
                          : false
                      }
                    />
                  </HStack>
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {permissions?.map((permission, index) => (
                <Tr key={index}>
                  <Td
                    textAlign={"center"}
                    borderColor="#D0D0D0"
                    borderWidth="1px"
                  >
                    {index + 1}
                  </Td>
                  <Td borderColor="#D0D0D0" borderWidth="1px">
                    <HStack w={"100%"} justifyContent={"space-between"}>
                      <Text>{permission.name}</Text>
                      <Checkbox
                        borderColor={"#D1D1D1"}
                        isChecked={
                          allowedPermissions &&
                          allowedPermissions.includes(
                            `${permission.value}_READ`
                          ) &&
                          allowedPermissions.includes(
                            `${permission.value}_CREATE`
                          ) &&
                          allowedPermissions.includes(
                            `${permission.value}_UPDATE`
                          ) &&
                          allowedPermissions.includes(
                            `${permission.value}_DELETE`
                          )
                        }
                        onChange={() =>
                          handleRowMasterCheckBoxChange(permission.value)
                        }
                      />
                    </HStack>
                  </Td>
                  <Td
                    textAlign={"center"}
                    borderColor="#D0D0D0"
                    borderWidth="1px"
                  >
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      isChecked={
                        allowedPermissions &&
                        allowedPermissions?.includes(`${permission.value}_READ`)
                      }
                      name="READ"
                      onChange={(e) =>
                        handleCheckboxChange(e, permission.value)
                      }
                    />
                  </Td>
                  <Td
                    textAlign={"center"}
                    borderColor="#D0D0D0"
                    borderWidth="1px"
                  >
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      isChecked={
                        allowedPermissions &&
                        allowedPermissions?.includes(
                          `${permission.value}_CREATE`
                        )
                      }
                      name="CREATE"
                      onChange={(e) =>
                        handleCheckboxChange(e, permission.value)
                      }
                    />
                  </Td>
                  <Td
                    textAlign={"center"}
                    borderColor="#D0D0D0"
                    borderWidth="1px"
                  >
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      isChecked={
                        allowedPermissions &&
                        allowedPermissions?.includes(
                          `${permission.value}_UPDATE`
                        )
                      }
                      name="UPDATE"
                      onChange={(e) =>
                        handleCheckboxChange(e, permission.value)
                      }
                    />
                  </Td>
                  <Td
                    textAlign={"center"}
                    borderColor="#D0D0D0"
                    borderWidth="1px"
                  >
                    <Checkbox
                      borderColor={"#D1D1D1"}
                      isChecked={
                        allowedPermissions &&
                        allowedPermissions?.includes(
                          `${permission.value}_DELETE`
                        )
                      }
                      name="DELETE"
                      onChange={(e) =>
                        handleCheckboxChange(e, permission.value)
                      }
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </Center>
  );
}
