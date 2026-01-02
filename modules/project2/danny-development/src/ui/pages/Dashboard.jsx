import {
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
} from "component-library-iboon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LandRevenueCollectionModal from "../components/RevenueCollectionModal";
import { fetchVillagerByAccountNo } from "../../adapters/VillagerApiAdapter";
import { useVillage } from "../../ports/context/VillageContext";
import LandRequisitionNotice from "../components/LandRequisitionNotice";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";

export default function Dashboard() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { village } = useVillage();
  const [accountNumber, setAccountNumber] = useState("");
  const [villager, setVillager] = useState(null);
  const [show, setShow] = useState(false);
  const [type, setType] = useState("");

  const fetchVillagers = async () => {
    const villagers = await fetchVillagerByAccountNo(accountNumber, village);
    if (villagers) {
      setVillager(villagers);
      setShow(true);
    } else {
      setShow(false);
    }
  };

  return (
    <VStack w={"100%"} alignItems={"flex-start"}>
      <HStack
        // bgColor={"yellow"}
        h={"40px"}
        w={"100%"}
        justifyContent={"center"}
      >
        <CustomFormLabel mb={0}>
          {t("dashboard.accountNumber")} : -{" "}
        </CustomFormLabel>
        <CustomInput
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder={t("dashboard.accountNumber")}
          maxW={"200px"}
        />

        <CustomButton
          px={5}
          onClick={fetchVillagers}
          isDisabled={!village || !accountNumber}
        >
          {t("dashboard.search")}
        </CustomButton>
      </HStack>

      {show && (
        <HStack w={"100%"}>
          <Table variant={"unstyled"} w={"40%"}>
            <Tbody>
              <Tr>
                <Td>{t("dashboard.accountNumber")} : -</Td>
                <Td>
                  <CustomInput readOnly value={convertEngToGujNumber(villager.accountNo)} />
                </Td>
              </Tr>
              <Tr>
                <Td>{t("dashboard.accountName")} : -</Td>
                <Td>
                  <CustomInput readOnly value={villager.name} />
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <Table variant={"striped"}>
            <Thead>
              <Th>{t("dashboard.types")}</Th>
              <Th>{t("dashboard.leftBehind")}</Th>
              <Th>{t("dashboard.pending")}</Th>
              <Th>{t("dashboard.rotating")}</Th>
              <Th>{t("dashboard.spare")}</Th>
              <Th>{t("dashboard.total")}</Th>
            </Thead>

            <Tbody>
              <Tr>
                <Td>{t("dashboard.landRevenue")}</Td>
                <Td>{convertEngToGujNumber(villager?.landMaangnu?.left || 0)}</Td>
                <Td>{convertEngToGujNumber(0)}</Td>
                <Td>{convertEngToGujNumber(villager?.landMaangnu?.rotating || 0)}</Td>
                <Td>{convertEngToGujNumber(villager?.landMaangnu?.fajal || 0)}</Td>
                <Td>
                  {convertEngToGujNumber(villager?.landMaangnu?.left ||
                    0 + villager?.landMaangnu?.rotating ||
                    0 + villager?.landMaangnu?.fajal ||
                    0)}
                </Td>
              </Tr>
              <Tr>
                <Td>{t("dashboard.localFund")}</Td>
                <Td>{convertEngToGujNumber(villager?.localFundMaangnu?.left || 0)}</Td>
                <Td>{convertEngToGujNumber(0)}</Td>
                <Td>{convertEngToGujNumber(villager?.localFundMaangnu?.rotating || 0)}</Td>
                <Td>{convertEngToGujNumber(villager?.localFundMaangnu?.fajal || 0)}</Td>
                <Td>
                  {convertEngToGujNumber(villager?.localFundMaangnu?.left ||
                    0 + villager?.localFundMaangnu?.rotating ||
                    0 + villager?.localFundMaangnu?.fajal ||
                    0)}
                </Td>
              </Tr>
              <Tr>
                <Td>{t("dashboard.educationCess")}</Td>
                <Td>{convertEngToGujNumber(villager?.educationCessMaangnu?.left || 0)}</Td>
                <Td>{convertEngToGujNumber(0)}</Td>
                <Td>{convertEngToGujNumber(villager?.educationCessMaangnu?.rotating || 0)}</Td>
                <Td>{convertEngToGujNumber(villager?.educationCessMaangnu?.fajal || 0)}</Td>
                <Td>
                  {convertEngToGujNumber(villager?.educationCessMaangnu?.left ||
                    0 + villager?.educationCessMaangnu?.rotating ||
                    0 + villager?.educationCessMaangnu?.fajal ||
                    0)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </HStack>
      )}

      {show && (
        <VStack gap={3} ml={5} alignItems={"stretch"}>
          <CustomButton
            size={"md"}
            onClick={() => {
              setType("Land");
              setTimeout(() => {
                onOpen();
              }, 0);
            }}
          >
            {t("dashboard.collectionOfLandRevenue")}
          </CustomButton>

          <CustomButton
            size={"md"}
            onClick={() => {
              setType("Local Fund");
              setTimeout(() => {
                onOpen();
              }, 0);
            }}
          >
            {t("dashboard.localFundLevy")}
          </CustomButton>

          <CustomButton
            size={"md"}
            onClick={() => {
              setType("Education");
              setTimeout(() => {
                onOpen();
              }, 0);
            }}
          >
            {t("dashboard.levyOfEducationCess")}
          </CustomButton>

          <LandRequisitionNotice villager={villager} accountNumber={accountNumber}  />

          {/* <CustomButton size={"md"}>
            {t("dashboard.lavaniImprovement")}
          </CustomButton> */}

          {/* <CustomButton size={"md"}>{t("dashboard.addDemand")}</CustomButton> */}

          {/* <CustomButton size={"md"}>{t("dashboard.once")}</CustomButton> */}
        </VStack>
      )}

      {isOpen && (
        <LandRevenueCollectionModal
          isOpen={isOpen}
          onClose={onClose}
          type={type}
          villager={villager}
        />
      )}
    </VStack>
  );
}
