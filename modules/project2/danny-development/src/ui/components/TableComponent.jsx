import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Box,
  Select,
  Button,
  HStack,
  Tag,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  TableContainer,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomIconButton,
  CustomInput,
} from "component-library-iboon";
import { useTranslation } from "react-i18next";
import { FaLandmark, FaPencil, FaTrash, FaFileInvoice } from "react-icons/fa6";
import { formatToDDMMYYYY } from "dtf_package";
import { useLocation } from "react-router-dom";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";
import { convertSlashesToDashes } from "../../utils/dateFunction";

const TableComponent = forwardRef(
  (
    {
      caption,
      columns,
      data,
      emptyMessage,
      searchQuery,
      setSearchQuery,
      onOpen,
      totalDocs,
      lastPage,
      page,
      setPage,
      limit,
      setLimit,
      status,
      setStatus,
      filter,
      setFilter,
      setMode,
      setId,
      deleteFunction,
      isSearch = true,
      isCreate = true,
      isUpdate = true,
      isDelete = true,
      handlePrint,
      handleLandTenClick,
      permission,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation();

    const { pathname } = useLocation();
    const [isTotalRow, setIsTotalRow] = useState(true)


    useEffect(() => {
      if (["/districts", "/talukas", "/villages" ,"/users" , "/roles", "/permissions"].includes(pathname)) {
        setIsTotalRow(false)
      }else{
        setIsTotalRow(true)
      }
    }, [pathname])


    



    // Chakra AlertDialog states
    const { isOpen, onOpen: openDialog, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = (_id) => {
      setDeleteId(_id);
      openDialog();
    };

    const confirmDelete = () => {
      if (deleteId) {
        deleteFunction(deleteId);
      }
      onClose();
    };

    return (
      <Box overflowX="auto" color={"black"} w={"100%"} mt={5}>
        {(isSearch || isCreate) && (
          <HStack mb={4} justifyContent="space-between">
            {isSearch && (
              <CustomInput
                placeholder={t("table.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size={"sm"}
              />
            )}
            {isCreate && (
              <CustomButton onClick={onOpen}>{t("common.create")}</CustomButton>
            )}
            {
              handlePrint && (
                <CustomButton onClick={() => handlePrint()}>Print Receipt</CustomButton>
              )
            }
          </HStack>
        )}

        <TableContainer maxW={"90vw"} overflowX="auto">
          <Table
            {...rest}
            ref={ref}
            size={"sm"}
            variant={"striped"}
            colorScheme="blackAlpha"
          >
            {caption && <TableCaption>{caption}</TableCaption>}
            <Thead>
              <Tr>
                {columns?.map((column) => (
                  <Th key={column.accessor}>{column.header}</Th>
                ))}
                {(isUpdate || isDelete) && (
                  <Th key="actions">{t("table.actions")}</Th>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {data.length > 0 ? (
                <>
                  {data.map((row, index) => (
                    <Tr key={index}>
                      {columns?.map((column) => (
                        <Td key={column.accessor}>
                          {column.accessor === "status" ? (
                            row.status === 1 ? (
                              <Tag colorScheme="green">
                                {t("common.active")}
                              </Tag>
                            ) : row.status === 0 ? (
                              <Tag colorScheme="whiteAlpha">
                                {t("common.inactive")}
                              </Tag>
                            ) : (
                              <Tag colorScheme="red">{t("common.deleted")}</Tag>
                            )
                          ) : column.cell ? (
                            column.cell(row)
                          ) : column.accessor.includes(".") ? (
                            column.accessor
                              .split(".")
                              .reduce((acc, key) => acc[key], row)
                          ) : [
                            "date",
                            "createdAt",
                            "updatedAt",
                            "billDate",
                            "dob",
                          ].includes(column.accessor) ? (
                            convertEngToGujNumber(convertSlashesToDashes(formatToDDMMYYYY(new Date(row[column.accessor]))))
                          ) :
                            !["billNo" , "bookNo"].includes(column.accessor) && typeof row[column.accessor] === "number"  ? (
                            convertEngToGujNumber(row[column.accessor].toFixed(2))
                          ) : 
                          (
                            convertEngToGujNumber(row[column.accessor])
                          )}
                        </Td>
                      ))}
                      {(isUpdate || isDelete) && (
                        <Td>
                          <HStack>
                            {isUpdate && (
                              <CustomIconButton
                                onClick={() => {
                                  setMode("update");
                                  setId(row._id);
                                  setTimeout(() => onOpen(), 0);
                                }}
                                icon={<FaPencil />}
                              />
                            )}
                            {isDelete && (
                              <CustomIconButton
                                onClick={() => handleDelete(row._id)}
                                icon={<FaTrash />}
                                designType="outline"
                              />
                            )}
                            {
                              handleLandTenClick && (
                                <CustomIconButton
                                  onClick={() => handleLandTenClick(row._id)}
                                  icon={<FaFileInvoice />}

                                />
                              )
                            }
                          </HStack>
                        </Td>
                      )}
                    </Tr>
                  ))}

                  {/* 🧮 Totals Row */}
                  {
                    isTotalRow &&
                  <Tr fontWeight="bold" bg="gray.100">
                    {columns.map((col, colIndex) => {
                      const ignoreFields = [
                        "billDate",
                        "date",
                        "createdAt",
                        "updatedAt",
                        "name",
                        "accountNo",
                        "village.name",
                        "status",
                        "_id",
                        "actions",
                        "challanNo",
                        "status",
                        "district.name",
                        "taluka.name",
                        "taluka.district.name",
                        "villager.name",
                        "billNo", "bookNo"
                      ];

                      if (ignoreFields.includes(col.accessor)) {
                        return (
                          <Td key={`total-${col.accessor}`}>
                            {colIndex === 0 ? "Total" : "N/A"}
                          </Td>
                        );
                      }

                      const values = data.map((row) => {
                        const val = row[col.accessor];
                        const num =
                          typeof val === "string" ? parseFloat(val) : val;
                        return isNaN(num) ? 0 : num;
                      });

                      const sum = values.reduce((acc, val) => acc + val, 0);

                      return (
                        <Td key={`total-${col.accessor}`} textAlign="left">
                          {convertEngToGujNumber(sum.toFixed(2))}
                        </Td>
                      );
                    })}
                    {(isUpdate || isDelete) && <Td />}
                  </Tr>
                  }

                </>
              ) : (
                <Tr>
                  <Td
                    colSpan={columns?.length + (isUpdate || isDelete ? 1 : 0)}
                  >
                    {emptyMessage}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <HStack mt={4} justifyContent="space-between">
          <Select
            width="auto"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100, 100000].map((size) => (
              <option key={size} value={size}>
                {size === 100000 ? "All" : size}
              </option>
            ))}
          </Select>
          <HStack>
            <Button onClick={() => setPage(page - 1)} isDisabled={page === 1}>
              {t("table.previous")}
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              isDisabled={page === lastPage}
            >
              {t("table.next")}
            </Button>
          </HStack>
        </HStack>

        {/* Delete Confirmation Modal */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {t("table.confirmDeleteTitle") || "Confirm Deletion"}
              </AlertDialogHeader>

              <AlertDialogBody>
                {t("table.confirmDeleteMessage") ||
                  "Are you sure you want to delete this? This action cannot be undone."}
              </AlertDialogBody>

              <AlertDialogFooter>
                <CustomButton ref={cancelRef} onClick={onClose}>
                  {t("common.cancel")}
                </CustomButton>
                <CustomButton
                  designType="outline"
                  onClick={confirmDelete}
                  ml={3}
                >
                  {t("common.delete")}
                </CustomButton>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    );
  }
);

export default TableComponent;
