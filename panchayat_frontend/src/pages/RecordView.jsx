"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Heading,
    Text,
    Divider,
    Button,
    SimpleGrid,
    VStack,
    HStack,
    Badge,
    Flex
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@chakra-ui/react";
import { apiFetch } from "../utils/api.js";
import PaymentPopup from "../components/PaymentPopup";

const RecursiveFamilyMember = ({ member, t, level = 0 }) => {
    // Determine children: support both subFamily.children and direct children property
    const children = member.subFamily?.children || member.children || [];

    return (
        <Box
            mb={2}
            p={level === 0 ? 2 : 2}
            ml={0} // Align with parent's spouse box
            borderWidth="1px"
            rounded="md"
            borderColor={member.isDeceased ? "red.400" : (level === 0 ? "gray.200" : "gray.300")}
            bg={member.isDeceased ? "#F9EAEA" : "white"}
        >
            {level === 0 ? (
                <Text
                    fontWeight="600"
                    textDecoration={member.isDeceased ? "line-through" : "none"}
                    color={member.isDeceased ? "red.600" : "black"}
                >
                    {member.name} {member.isDeceased && t("isDeceasedShort")}
                </Text>
            ) : (
                <Text
                    fontSize="sm"
                    textDecoration={member.isDeceased ? "line-through" : "none"}
                    color={member.isDeceased ? "red.600" : "black"}
                >
                    <b>{t("name")}:</b> {member.name} {member.isDeceased && t("isDeceasedShort")}
                </Text>
            )}

            <Text fontSize={level === 0 ? "md" : "sm"}><b>{t("age")}:</b> {member.age}</Text>
            <Text fontSize={level === 0 ? "md" : "sm"}><b>{t("relation")}:</b> {t(member.relation)}</Text>

            {/* SPOUSE of this member */}
            {member.spouse?.name?.trim() && (
                <>
                    <Text
                        fontWeight="600"
                        fontSize="sm"
                        color={member.spouse.isDeceased ? "red.600" : "green.600"}
                        mt={2}
                    >
                        {t("spouse")} {member.spouse.isDeceased && t("isDeceasedShort")}
                    </Text>
                    <Box
                        p={2}
                        bg="white"
                        borderWidth="1px"
                        rounded="md"
                        borderColor={member.spouse.isDeceased ? "red.400" : "gray.300"}
                    >
                        <Text fontSize="sm"><b>{t("name")}:</b> {member.spouse.name}</Text>
                        <Text fontSize="sm"><b>{t("age")}:</b> {member.spouse.age || "-"}</Text>
                        <Text fontSize="sm"><b>{t("relation")}:</b> {t(member.spouse.relation)}</Text>
                    </Box>
                </>
            )}

            {/* Recursively render children */}
            {children.length > 0 && (
                <Box mt={2} pl={0}>
                    {children.map((child, index) => (
                        <RecursiveFamilyMember key={index} member={child} t={t} level={level + 1} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default function RecordView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const toast = useToast();

    const [data, setData] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);

    // 🌐 API Base URL for image serving
    const API_BASE_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
        ? "http://localhost:5000"
        : "https://panchayat.shridaay.com";

    useEffect(() => {
        (async () => {
            const { response, data } = await apiFetch(`/api/pedhinamu/${id}`, {}, navigate, toast);
            console.log("API DATA:", data);

            setData(data);
        })();

        fetchUserStatus();
    }, []);

    const fetchUserStatus = async () => {
        try {
            const { response, data } = await apiFetch("/api/register/user/status", {}, navigate, toast);
            if (response.ok) {
                setUserStatus(data.user);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!data) return <Text p={10}>{t("loading")}</Text>;

    const { pedhinamu, form } = data;

    // -------------------------------
    // MULTIPLE WIFE LINE LOGIC
    // -------------------------------
    // -------------------------------
    // MULTIPLE WIFE LINE (CORRECT LOGIC)
    // -------------------------------
    const wifeRelation = pedhinamu?.mukhya?.spouse?.relation;

    // 🔥 COUNT WIVES FROM HEIRS (NOT mukhya.spouse)
    const wifeCount = pedhinamu?.heirs?.filter(h => {
        const r = (h.relation || "")
            .toLowerCase()
            .replace(/\s|_/g, "");   // remove space and _

        return (
            r.includes("wife") ||          // wife, firstwife, secondwife
            r.includes("patni") ||         // if backend sends transliteration
            r.includes("પત્ની")           // if Gujarati stored
        );
    }).length || 0;

    const multipleWifeLine =
        wifeCount > 1
            ? "તેમજ બીજી પત્ની હોય તો તેના તમામ વારસદારોનો સમાવેશ  કરેલ છે "
            : "નો સમાવેશ કરવામાં આવેલ છે ";





    // Format +91 99999 99999 (Display only)
    const displayMobile = (num) => {
        if (!num) return "-";

        const digits = num.toString().replace(/\D/g, "").slice(0, 10);
        if (!digits) return "-";

        if (digits.length <= 5) return `+91 ${digits}`;

        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    };
    // Format mobile → +91 99999 99999
    const formatMobile = (num) => {
        if (!num) return "-";
        const digits = num.toString().replace(/\D/g, "").slice(0, 10);
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    };

    // Format Aadhaar → 1234 5678 9012
    const formatAadhaar = (num) => {
        if (!num) return "-";
        const digits = num.toString().replace(/\D/g, "").slice(0, 12);
        return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
    };

    // 🖼️ ROBUST PHOTO URL HELPER
    const getPhotoUrl = (path) => {
        if (!path) return "";
        let cleanPath = path.toString().trim();

        // 0. If it's already an absolute URL, return it
        if (cleanPath.startsWith("http")) return cleanPath;

        // 1. Normalize slashes
        cleanPath = cleanPath
            .replace(/\\/g, "/")       // Fix Windows backslashes
            .replace(/^\/+/, "");     // Remove all leading slashes

        // 2. Normalize to api/uploads/filename
        if (cleanPath.startsWith("api/uploads/")) {
            // Already correct
        } else if (cleanPath.startsWith("uploads/")) {
            cleanPath = "api/" + cleanPath;
        } else {
            // Handle cases where only filename is stored
            cleanPath = "api/uploads/" + cleanPath;
        }

        return `${API_BASE_URL}/${cleanPath}`;
    };


    // Convert English numbers → Gujarati numbers
    const toGujaratiDigits = (value) => {
        if (!value) return value;
        const map = {
            "0": "૦",
            "1": "૧",
            "2": "૨",
            "3": "૩",
            "4": "૪",
            "5": "૫",
            "6": "૬",
            "7": "૭",
            "8": "૮",
            "9": "૯",
        };
        return value.toString().replace(/[0-9]/g, (d) => map[d]);
    };

    const relationToGujarati = (rel) => {
        if (!rel) return "";

        const map = {
            son: "પુત્ર",
            daughter: "પુત્રી",

            grandson: "પૌત્ર",
            granddaughter: "પૌત્રી",

            great_grandson: "પ્રપૌત્ર",
            great_granddaughter: "પ્રપૌત્રી",

            dohitra: "દોહિત્ર",
            dohitri: "દોહિત્રી",

            wife: "પત્ની",
            husband: "પતિ",

            first_wife: "પ્રથમ પત્ની",
            second_wife: "બીજી પત્ની",
            third_wife: "ત્રીજી પત્ની",
        };

        return map[rel?.toLowerCase()?.trim()] || rel;
    };

    const formatDateToGujarati = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return `${toGujaratiDigits(d)}/${toGujaratiDigits(m)}/${toGujaratiDigits(y)}`;
    };



    function formatGujaratiDate(dateStr) {
        if (!dateStr) return "";
        if (dateStr.includes("/")) return toGujaratiDigits(dateStr);

        const d = new Date(dateStr);
        if (isNaN(d)) return "";
        return `${toGujaratiDigits(d.getDate())}/${toGujaratiDigits(d.getMonth() + 1)}/${toGujaratiDigits(d.getFullYear())}`;
    }

    function calculateAgeAtDeath(dob, dod) {
        if (!dob || !dod) return "";

        const birth = new Date(dob);
        const death = new Date(dod);

        if (isNaN(birth) || isNaN(death)) return "";

        let age = death.getFullYear() - birth.getFullYear();
        const m = death.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) {
            age--;
        }

        return age > 0 ? toGujaratiDigits(age) : "";
    }


    function generateSvgTree(root) {
        function countNodes(n) {
            let count = 1;
            if (n.children) n.children.forEach(c => count += countNodes(c));
            return count;
        }

        const totalNodes = countNodes(root);
        const isSmall = totalNodes < 6;
        const isRotated = root.children && root.children.length > 4;

        // Dynamic scaling for large rotated trees
        let scale = 1.0;
        if (isRotated && totalNodes > 15) {
            scale = Math.max(0.65, 1.0 - (totalNodes - 15) * 0.02);
        }

        // Optimized Parameters for Horizontal Mode (60px Font)
        const charWidth = (isRotated ? 8.5 : 28) * scale;
        const minWidth = (isRotated ? 120 : 350) * scale;
        const hGap = (isRotated ? 30 : 100) * scale;
        const vGap = (isRotated ? 120 : 550) * scale;
        const paddingH = (isRotated ? 20 : 60) * scale;
        const topMargin = (isRotated ? 80 : 80) * scale;
        const marginX = (isRotated ? 5 : 80) * scale;
        const depthOffset = (isRotated ? 130 : 350) * scale;

        const strokeWidth = (isRotated ? 2 : 5) * scale;
        const strokeColor = "#000";

        function getNodeDimensions(node) {
            const isDead = node.isDeceased;
            const displayName = (!node.isRoot && node.name) ? node.name.split(' ')[0] : node.name;
            const textName = isDead ? `${displayName} (મૈયત)` : displayName;
            let relationText = node.relation ? ` (${node.relation})` : "";
            if (!node.isDeceased) {
                relationText += ` ઉંમર: ${toGujaratiDigits(node.age || "")}`;
            }

            const nameLen = textName.length;
            const relLen = relationText.length;
            const contentWidth = Math.max(nameLen, relLen) * charWidth + paddingH;
            const nodeWidth = Math.max(minWidth, contentWidth);
            const nodeHeight = isRotated
                ? (isDead ? 120 : 90) * scale
                : (isDead ? (isSmall ? 300 : 360) : (isSmall ? 200 : 260));


            return { width: nodeWidth, height: nodeHeight };
        }

        // Always calculate as a horizontal tree first
        function computeLayout(node, depth = 0, startX = 0) {
            node.depth = depth;
            const { width: nw, height: nh } = getNodeDimensions(node);
            node.nodeWidth = nw;
            node.nodeHeight = nh;

            if (!node.children || node.children.length === 0) {
                node.subtreeWidth = nw;
                node.x = startX;
                return nw;
            }

            let childrenTotalWidth = 0;
            node.children.forEach((child, i) => {
                const w = computeLayout(child, depth + 1, startX + childrenTotalWidth);
                childrenTotalWidth += w;
                if (i < node.children.length - 1) childrenTotalWidth += hGap;
            });

            node.subtreeWidth = Math.max(nw, childrenTotalWidth);
            node.x = startX + (node.subtreeWidth / 2) - (nw / 2);

            if (nw > childrenTotalWidth) {
                const shift = (nw - childrenTotalWidth) / 2;
                function shiftSubtree(n, s) {
                    n.x += s;
                    if (n.children) n.children.forEach(c => shiftSubtree(c, s));
                }
                node.children.forEach(c => shiftSubtree(c, shift));
            }

            return node.subtreeWidth;
        }

        const totalTreeWidth = computeLayout(root);
        let maxReachedY = 0;

        let svgNodes = "";
        let svgLines = "";

        function render(node) {
            // Coordinate prep
            const x = node.x + marginX;
            const yBasis = node.depth * (vGap + depthOffset) + topMargin;
            const xCenter = x + node.nodeWidth / 2;
            const yCenter = yBasis + node.nodeHeight / 2;

            const bottomY = yCenter + node.nodeHeight / 2;
            if (bottomY > maxReachedY) maxReachedY = bottomY;

            const isDead = node.isDeceased;
            const displayName = (!node.isRoot && node.name) ? node.name.split(' ')[0] : node.name;
            const textName = isDead ? `${displayName} (મૈયત)` : displayName;
            let relationText = node.relation ? `(${node.relation})` : "";
            if (!node.isDeceased) {
                relationText += ` ઉંમર: ${toGujaratiDigits(node.age || "")}`;
            }

            const bg = "#ffffff";
            const fontSize = (isRotated ? 22 : (node.isRoot ? 110 : 110)) * scale;
            const subFontSize = (isRotated ? 20 : 90) * scale;

            svgNodes += `
<rect x="${x}" y="${yCenter - node.nodeHeight / 2}" width="${node.nodeWidth}" height="${node.nodeHeight}" rx="${isRotated ? 6 : 28}" ry="${isRotated ? 6 : 28}" fill="${bg}" stroke="none" />
<text x="${xCenter}" y="${yCenter - (isDead ? (isRotated ? 22 * scale : 110) : (isRotated ? 12 * scale : 60))}" text-anchor="middle" font-size="${fontSize}" font-weight="700" text-decoration="underline" font-family="Noto Serif Gujarati" fill="#000">${textName}</text>
`;

            if (isDead) {
                const dob = formatGujaratiDate(node.dob);
                const dod = formatGujaratiDate(node.dodDisplay || node.dod);
                let secondLine = dod ? `મૈયત : ${dod}` : "";
                if (!secondLine && node.age) secondLine = `ઉંમર: ${toGujaratiDigits(node.age)} વર્ષ`;

                svgNodes += `
<text x="${xCenter}" y="${yCenter + (isRotated ? 0 : 20)}" text-anchor="middle" font-size="${subFontSize}" font-weight="700" font-family="Noto Serif Gujarati" fill="#000">${dob ? `જન્મ: ${dob}` : ""}</text>
<text x="${xCenter}" y="${yCenter + (isRotated ? 14 * scale : 85)}" text-anchor="middle" font-size="${subFontSize}" font-weight="700" font-family="Noto Serif Gujarati" fill="#000">${secondLine}</text>
`;
            }

            svgNodes += `
<text x="${xCenter}" y="${yCenter + (isDead ? (isRotated ? 38 * scale : 160) : (isRotated ? 26 * scale : 100))}" text-anchor="middle" font-size="${subFontSize}" font-weight="700" fill="#000" font-family="Noto Serif Gujarati">${relationText}</text>
`;

            if (node.children) {
                node.children.forEach(child => {
                    const childX = child.x + marginX + child.nodeWidth / 2;
                    const childYStart = (child.depth * (vGap + depthOffset) + topMargin);

                    svgLines += `
                <line x1="${xCenter}" y1="${bottomY}" x2="${childX}" y2="${childYStart}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
            `;
                    render(child);
                });
            }
        }

        render(root);

        const calculatedWidth = totalTreeWidth + marginX * 2;
        const calculatedHeight = maxReachedY + 300;

        // Enforce minimum dimensions to prevent "zooming in" on small trees
        const MIN_WIDTH = 2500;
        const MIN_HEIGHT = 2000;

        const finalWidth = Math.max(calculatedWidth, MIN_WIDTH);
        const finalHeight = Math.max(calculatedHeight, MIN_HEIGHT);

        // Center the tree in the new larger box if needed
        const xOffset = (finalWidth - calculatedWidth) / 2;
        const yOffset = (finalHeight - calculatedHeight) / 2;

        if (isRotated) {
            svgNodes += `<text x="${totalTreeWidth / 2 + marginX}" y="${topMargin - 55 * scale}" text-anchor="middle" font-size="${30 * scale}" font-weight="700" font-family="Noto Serif Gujarati" fill="#000">પેઢીનામું</text>`;
        }


        if (isRotated) {
            return `
            <svg class="rotated-tree" width="${calculatedHeight}" height="${calculatedWidth}" viewBox="0 0 ${calculatedHeight} ${calculatedWidth}" xmlns="http://www.w3.org/2000/svg" style="max-height: 255mm; max-width: 100%; height: auto; display: block; margin-left: 0; margin-right: auto; page-break-inside: avoid;">
                <g transform="translate(0, ${calculatedWidth}) rotate(-90)">
                    ${svgLines}
                    ${svgNodes}
                </g>
            </svg>
            `;
        }

        // Re-construct the non-rotated return
        // We need to apply the offset to the group or viewBox. 
        // EASIER: Just use the larger viewBox. The content (x,y) starts at 0,0 relative to calculatedWidth.
        // We need to shift content to center it.

        return `
        <div class="std-tree-box">
            <svg width="100%" height="100%" viewBox="0 0 ${finalWidth} ${finalHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="display: block; margin: 0 auto;">
                <g transform="translate(${xOffset}, ${yOffset})">
                    ${svgLines}
                    ${svgNodes}
                </g>
            </svg>
        </div>
    `;
    }

    const handlePedhinamuPrint = async () => {
        try {
            // 🔴 FIRST increment & check limit
            const res = await apiFetch(
                "/api/register/user/increment-print",
                { method: "POST" },
                navigate,
                toast
            );

            if (!res.data.canPrint) {
                setShowPaymentPopup(true);
                return;
            }

            // ✅ Only allowed prints reach here
            const response2 = await fetch("/pedhinamu/pedhinamu.html");
            let htmlTemplate = await response2.text();

            const { pedhinamu, form } = data;

            // Get logged-in user data
            const user = JSON.parse(localStorage.getItem("user") || "null");

            // 🔥 DEBUG: Log the applicant photo value
            console.log('🖼️ Applicant Photo Path:', form?.applicantPhoto);
            console.log('🖼️ Full Photo URL:', form?.applicantPhoto ? `${import.meta.env.VITE_API_BASE_URL}${form.applicantPhoto}` : 'No photo');

            /* -----------------------------------------
               BASIC PLACEHOLDER REPLACEMENTS
            ----------------------------------------- */
            const isDetailed = ((pedhinamu?.heirs?.length || 0) + (pedhinamu?.mukhya?.spouse?.name?.trim() ? 1 : 0)) > 4;

            const replacements = {
                applicantName: form?.applicantName || "",
                mukkamAddress: form?.mukkamAddress || "",
                multipleWifeLine: multipleWifeLine,

                talatiName: form?.talatiName || "",
                javadNo: form?.javadNo || "",
                totalHeirsCount: form?.totalHeirsCount || "",

                // Rotated Tree Message
                rotatedTreeMessage: ((pedhinamu?.heirs?.length || 0) + (pedhinamu?.mukhya?.spouse?.name?.trim() ? 1 : 0)) > 4
                    ? '<div style="text-align:center; font-weight:bold; font-size: 32px; margin-top: 150px; margin-bottom: 150px; transform: rotate(-15deg); color: rgba(0,0,0,0.8); white-space: nowrap;">પેઢીઆંબા વિસ્તૃત પ્રમાણ માં હોઈ <br> આગળ ના પાના પર પ્રિન્ટ થયેલ છે .</div>'
                    : "",

                // ✅ ADD THESE
                referenceNo: form?.referenceNo || "",

                jaminSurveyNo: form?.jaminSurveyNo || "",
                jaminKhatano: form?.jaminKhatano || "",

                makanMilkatAkarniNo: form?.makanMilkatAkarniNo || "",
                any: form?.any || "",

                mukhyoName: pedhinamu?.mukhya?.name || "",

                reasonForPedhinamu: form?.reasonForPedhinamu || "",


                // 🔥 ADD THESE (THIS WAS MISSING)
                mukhyoPrefix: pedhinamu?.mukhya?.isDeceased ? "મૈયત શ્રી" : "શ્રી",

                deathLine:
                    pedhinamu?.mukhya?.isDeceased && pedhinamu?.mukhya?.dodDisplay
                        ? ` (મૈયત  તા. ${pedhinamu.mukhya.dodDisplay})`
                        : "",

                notarySerialNo: form?.notarySerialNo || "",
                notaryBookNo: form?.notaryBookNo || "",
                notaryPageNo: form?.notaryPageNo || "",
                notaryName: form?.notaryName || "",
                notaryDate: form?.notaryDate
                    ? formatDateToGujarati(form.notaryDate)
                    : "",

                applicationDate: form?.applicationDate
                    ? formatDateToGujarati(form.applicationDate)
                    : formatDateToGujarati(pedhinamu.createdAt),

                applicantMobile: formatMobile(form?.applicantMobile),
                applicantAadhaar: formatAadhaar(form?.applicantAadhaar),

                taluko: user?.gam || "",
                userTaluko: user?.taluko || "",
                userJillo: user?.jillo || "",
                treeTitle1: isDetailed ? "" : `<h2 class="tree-title">પેઢીનામું</h2>`,
            };




            // ✅ PROPERTY EXTRA ROWS (NO HANDLEBARS)
            let propertyExtraRows = "";

            if (form?.makanMilkatAkarniNo?.trim()) {
                propertyExtraRows += `
  <tr>
    <td></td>
    <td>મકાનના</td>
    <td>મિલકત આકરણી નંબર</td>
    <td class="center">${toGujaratiDigits(form.makanMilkatAkarniNo)}</td>
  </tr>`;
            }

            if (form?.any?.trim()) {
                propertyExtraRows += `
  <tr>
    <td></td>
    <td>અન્ય</td>
    <td></td>
    <td class="center">${form.any}</td>
  </tr>`;
            }

            replacements.propertyExtraRows = propertyExtraRows;

            console.log('userTaluko:', replacements.userTaluko);
            console.log('userJillo:', replacements.userJillo);
            console.log('taluko:', replacements.taluko);

            // 🔥 IMPORTANT: Handle applicant photo separately with proper error handling
            let applicantPhotoHtml = '';

            if (form?.applicantPhoto) {
                const photoUrl = getPhotoUrl(form.applicantPhoto);

                applicantPhotoHtml = `<img 
        src="${photoUrl}" 
        style="width:120px; height:120px; object-fit:cover; border:1px solid #000;" 
        alt="Applicant Photo" 
        onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:120px;height:120px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;background:#f5f5f5;\\'>No Photo</div>';"
      />`;
                console.log('✅ Applicant photo HTML generated:', photoUrl);
            } else {
                applicantPhotoHtml = `<div style="width:120px; height:120px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; background:#f5f5f5; color:#666;">No Photo</div>`;
                console.log('⚠️ No applicant photo available');
            }

            replacements.applicantPhotoHtml = applicantPhotoHtml;

            replacements.treeSectionTitle = isDetailed
                ? `<div class="page-break"></div><h3 class="section-title tree-title">${isDetailed ? "" : "પેઢીનામું"}</h3>`
                : `<h3 class="section-title tree-title">પેઢીનામું</h3>`;

            // Replace all placeholders
            const htmlFields = ['applicantPhotoHtml', 'panchTable', 'panchSignatureBlocks', 'panchPhotoBlocks', 'heirsHtml', 'treeSectionTitle', 'rotatedTreeMessage'];
            Object.entries(replacements).forEach(([key, value]) => {
                const processedValue = htmlFields.includes(key) ? (value || "") : toGujaratiDigits(value || "");
                htmlTemplate = htmlTemplate.replace(
                    new RegExp(`{{\\s*${key}\\s*}}`, "g"),
                    processedValue
                );
            });

            /* -----------------------------------------
               HEIRS TABLE (SAFE + CLEAN)
            ----------------------------------------- */

            let heirsHtml = pedhinamu.heirs
                .map((h) => {
                    let spouseRow = "";
                    let childrenRows = "";

                    // spouse
                    if (h.subFamily?.spouse?.name?.trim()) {
                        spouseRow = `
            <tr>
                <td style="padding-left:25px;">➤ ${h.subFamily.spouse.name}</td>
                <td>${toGujaratiDigits(h.subFamily.spouse.age || "-")}</td>
                <td>${relationToGujarati(h.subFamily.spouse.relation)}</td>
            </tr>
          `;
                    }

                    // children
                    if (h.subFamily?.children?.length > 0) {
                        childrenRows = h.subFamily.children
                            .map((c) => `
              <tr>
                  <td style="padding-left:40px;">• ${c.name}</td>
                  <td>${toGujaratiDigits(c.age)}</td>
                  <td>${relationToGujarati(c.relation)}</td>
              </tr>
            `)
                            .join("");
                    }

                    return `
            <tr>
                <td><b>${h.name}</b></td>
                <td>${toGujaratiDigits(h.age)}</td>
                <td>${relationToGujarati(h.relation)}</td>
            </tr>
            ${spouseRow}
            ${childrenRows}
        `;
                })
                .join("");

            htmlTemplate = htmlTemplate.replace("{{heirsTable}}", heirsHtml);

            /* -----------------------------------------
               PANCH TABLE
            ----------------------------------------- */
            let panchHtml = form.panch
                .map(
                    (p) => `
          <tr>
              <td>${p.name}</td>
              <td>${toGujaratiDigits(p.age)}</td>
              <td>${p.occupation}</td>
             <td>${replacements.taluko || "-"}</td>
          </tr>`
                )
                .join("");

            htmlTemplate = htmlTemplate.replace("{{panchTable}}", panchHtml);

            /* -----------------------------------------
               PANCH SIGNATURE BLOCKS
            ----------------------------------------- */
            let panchSignHtml = form.panch
                .map(
                    (p) => `
          <p>
              <b>${p.name}</b><br>
              સહી: _______________________<br>
              અંગુઠાનો નિશાન: _____________
          </p>`
                )
                .join("");

            htmlTemplate = htmlTemplate.replace("{{panchSignatureBlocks}}", panchSignHtml);

            /* -----------------------------------------
               PANCH PHOTO BLOCKS
            ----------------------------------------- */
            let panchPhotoHtml = form.panch
                .map((p) => {
                    let photoHtml = '';

                    if (p.photo) {
                        const photoUrl = getPhotoUrl(p.photo);

                        photoHtml = `<img 
            src="${photoUrl}" 
            style="width:120px; height:120px; object-fit:cover; border:1px solid #ccc;" 
            alt="Panch Photo"
            onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:120px;height:120px;border:1px solid #ccc;background:#f5f5f5;\\'>No Photo</div>';"
          />`;
                    } else {
                        photoHtml = '<div style="width:120px; height:120px; border:1px solid #ccc; background:#f5f5f5;"></div>';
                    }

                    return `
        <table class="panch-photo-table" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #000;">
            <tr style="height: 160px;">
                <!-- Photo -->
                <td style="width: 20%; text-align: center; vertical-align: middle; padding: 10px; border: 1px solid #000;">
                    ${photoHtml}
                </td>

                <!-- Details -->
                <td style="width: 40%; text-align: left; vertical-align: top; padding: 12px; border: 1px solid #000;">
                    <p style="margin: 0; line-height: 1.5; font-size: 15px;">
                        <b>પંચનું નામ :</b> ${p.name} <br>
                        <b>આધાર નંબર / ચુંટણી કાર્ડ નંબર :</b><br>
                        ${toGujaratiDigits(formatAadhaar(p.aadhaar))} <br>
                        <b>મો. નંબર :</b> ${toGujaratiDigits(formatMobile(p.mobile))}
                    </p>
                </td>

                <!-- Thumb -->
                <td style="width: 20%; text-align: center; vertical-align: middle; padding: 10px; border: 1px solid #000;">
                    <b>અંગુઠાનું નિશાન</b>
                </td>

                <!-- Signature -->
                <td style="width: 20%; text-align: center; vertical-align: middle; padding: 10px; border: 1px solid #000;">
                    <b>સહી</b>
                </td>
            </tr>
        </table>
        `;
                })
                .join("");

            htmlTemplate = htmlTemplate.replace("{{panchPhotoBlocks}}", panchPhotoHtml);

            /* -----------------------------------------
                FAMILY TREE BUILDER (Dynamic)
            ----------------------------------------- */

            function buildNode(person) {
                if (!person) return null;

                const node = {
                    name: person.name,
                    age: person.age || "",

                    // 🔥 THESE WERE MISSING
                    dob: person.dobDisplay || person.dob || "",
                    dod: person.dodDisplay || person.dod || "",
                    dodDisplay: person.dodDisplay || person.dod || "",

                    relation: relationToGujarati(person.relation),
                    isDeceased: person.isDeceased || false,
                    isRoot: person.isRoot || false,
                    children: []
                };

                const spouse = person.spouse || person.subFamily?.spouse;

                if (spouse?.name?.trim()) {
                    node.children.push({
                        name: spouse.name,
                        age: spouse.age || "",
                        dob: spouse.dobDisplay || spouse.dob || "",
                        dod: spouse.dodDisplay || spouse.dod || "",
                        dodDisplay: spouse.dodDisplay || spouse.dod || "",
                        relation: relationToGujarati(spouse.relation),
                        isDeceased: spouse.isDeceased || false,
                        children: []
                    });
                }

                const personChildren = person.subFamily?.children || person.children || [];

                personChildren.forEach(c => {
                    node.children.push(buildNode(c));
                });

                return node;
            }


            const rootPerson = buildNode({
                ...pedhinamu.mukhya,
                relation: "",
                isRoot: true,
                spouse: pedhinamu.mukhya.spouse || null,
                children: pedhinamu.heirs
            });

            const svgTree = generateSvgTree(rootPerson);
            htmlTemplate = htmlTemplate.replace(/{{\s*familyTreeHtml\s*}}/g, svgTree);

            /* -----------------------------------------
               PRINT WINDOW
            ----------------------------------------- */
            const printWindow = window.open("", "_blank", "width=1000,height=1200");
            printWindow.document.write(htmlTemplate);
            await printWindow.document.fonts.ready;
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();


            console.log('✅ PDF generation completed successfully');

        } catch (err) {
            console.error("❌ PRINT ERROR:", err);
            toast({
                title: "પ્રિન્ટ ભૂલ",
                description: "PDF જનરેટ કરવામાં નિષ્ફળતા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",

                status: "error",
                duration: 3000,
                position: "top",
            });
        }
    };
    return (
        <Box bg="#F8FAF9" minH="100vh" p={10}>
            <Flex justify="space-between" mb={5}>
                <Button
                    colorScheme="green"
                    onClick={() => navigate("/records")}
                    px={6}
                >
                    ← {t("back")}
                </Button>
                <Button
                    colorScheme="green"
                    px={6}
                    onClick={handlePedhinamuPrint}
                    isDisabled={!form} // ✅ ફોર્મ ન હોય તો disable
                >
                    {t("printPedhinamu")}
                </Button>

            </Flex>

            <Box
                bg="white"
                p={8}
                rounded="2xl"
                shadow="md"
                border="1px solid #E3EDE8"
            >
                <Heading size="lg" mb={4} color="#1E4D2B">
                    {t("certificateDetails")}
                </Heading>

                {/* ---------------------- BASIC DETAILS ---------------------- */}
                <Heading size="md" mt={6}>{t("basicDetails")}</Heading>
                <Divider my={3} />

                <SimpleGrid columns={[1, 2]} spacing={5} mt={2}>
                    <Box>
                        <Text fontWeight="600">{t("mukhyoName")}:</Text>

                        <HStack>
                            <Text
                                fontWeight="700"
                                color={pedhinamu.mukhya.isDeceased ? "red.600" : "black"}
                                textDecoration={pedhinamu.mukhya.isDeceased ? "line-through" : "none"}
                            >
                                {pedhinamu.mukhya.name}
                            </Text>

                            {pedhinamu.mukhya.isDeceased && (
                                <Badge colorScheme="red">{t("isDeceasedShort")}</Badge>
                            )}
                        </HStack>
                    </Box>

                    <Box>
                        <Text fontWeight="600">{t("age")}:</Text>
                        <Text>{pedhinamu.mukhya?.age}</Text>
                    </Box>

                    {pedhinamu.mukhya.isDeceased && (
                        <Box>
                            <Text fontWeight="600">મૈયત  તારીખ:</Text>
                            <Text>{pedhinamu.mukhya.dodDisplay || "-"}</Text>
                        </Box>
                    )}
                </SimpleGrid>


                {/* ---------------------- HEIRS ---------------------- */}
                <Heading size="md" mt={8}>{t("heirInfo")}</Heading>
                <Divider my={3} />

                <SimpleGrid columns={[1, 2]} spacing={6}>
                    {pedhinamu.heirs.map((h, i) => (
                        <Box
                            key={i}
                            p={4}
                            borderWidth="1px"
                            rounded="lg"
                            shadow="sm"
                            bg={h.isDeceased ? "#F9EAEA" : "#FAFFFA"}
                            borderColor={h.isDeceased ? "red.400" : "gray.200"}
                        >
                            {/* MAIN HEIR */}
                            <HStack justify="space-between">
                                <Text
                                    fontSize="lg"
                                    fontWeight="600"
                                    textDecoration={h.isDeceased ? "line-through" : "none"}
                                    color={h.isDeceased ? "red.600" : "black"}
                                >
                                    {h.name} {h.isDeceased && t("isDeceasedShort")}
                                </Text>

                                <Badge
                                    colorScheme={h.isDeceased ? "red" : "green"}
                                    px={3}
                                >
                                    {t(h.relation)}
                                </Badge>
                            </HStack>

                            <Divider my={2} />

                            <Text><b>{t("age")}:</b> {h.age}</Text>
                            {h.isDeceased && (
                                <HStack>
                                    <Text fontWeight="600" color="black">મૈયત  તારીખ:</Text>
                                    <Text fontWeight="600" color="red.600">{h.dodDisplay || "-"}</Text>
                                </HStack>
                            )}


                            {/* SPOUSE */}
                            {h.subFamily?.spouse?.name?.trim() && (
                                <Box
                                    mt={4}
                                    p={2}
                                    bg="#fff"
                                    borderWidth="1px"
                                    rounded="md"
                                    borderColor={h.subFamily.spouse.isDeceased ? "red.400" : "gray.300"}
                                >
                                    <Text
                                        fontWeight="600"
                                        color={h.subFamily.spouse.isDeceased ? "red.600" : "green.600"}
                                        textDecoration={h.subFamily.spouse.isDeceased ? "line-through" : "none"}
                                    >
                                        {t("spouse")} {h.subFamily.spouse.isDeceased && t("isDeceasedShort")}
                                    </Text>

                                    <Divider my={2} />

                                    <Text><b>{t("name")}:</b> {h.subFamily.spouse.name}</Text>
                                    <Text><b>{t("age")}:</b> {h.subFamily.spouse.age || "-"}</Text>
                                    {h.subFamily.spouse.isDeceased && (
                                        <Text color="red.600" fontWeight="600">
                                            {t("isDeceasedShort")} • {h.subFamily.spouse.dodDisplay || "-"}
                                        </Text>
                                    )}

                                    <Text><b>{t("relation")}:</b> {t(h.subFamily.spouse.relation)}</Text>
                                </Box>
                            )}

                            {/* CHILDREN */}
                            {h.subFamily?.children?.length > 0 && (
                                <Box
                                    mt={4}
                                    p={2}
                                    bg="#fff"
                                    borderWidth="1px"
                                    rounded="md"
                                >
                                    <Text fontWeight="600" color="blue.600">{t("children")}</Text>
                                    <Divider my={2} />

                                    {h.subFamily.children.map((c, index) => (
                                        <RecursiveFamilyMember key={index} member={c} t={t} level={0} />
                                    ))}
                                </Box>
                            )}

                        </Box>
                    ))}
                </SimpleGrid>
                {/* ---------------------- FULL FORM ---------------------- */}
                {form ? (
                    <>
                        {/* TALATI */}
                        <Heading size="md" mt={8}>{t("talatiNote")}</Heading>
                        <Divider my={3} />

                        <SimpleGrid columns={[1, 2]} spacing={5}>
                            <Box>
                                <Text fontWeight="600">{t("talatiName")}:</Text>
                                <Text>{form.talatiName}</Text>
                            </Box>

                            <Box>
                                <Text fontWeight="600">{t("javadNo")}:</Text>
                                <Text>{form.javadNo}</Text>
                            </Box>

                            <Box>
                                <Text fontWeight="600">{t("totalHeirsCount")}:</Text>
                                <Text>{form.totalHeirsCount}</Text>
                            </Box>
                        </SimpleGrid>

                        {/* PANCH */}
                        <Heading size="md" mt={8}>{t("panchInfo")}</Heading>
                        <Divider my={3} />

                        <SimpleGrid columns={[1, 2]} spacing={6}>
                            {form.panch.map((p, i) => (
                                <Box
                                    key={i}
                                    p={4}
                                    borderWidth="1px"
                                    rounded="lg"
                                    shadow="sm"
                                    bg="#FFFDF5"
                                >
                                    <HStack spacing={4} align="start">
                                        {p.photo && (
                                            <Box>
                                                <img
                                                    src={getPhotoUrl(p.photo)}
                                                    alt={`Panch ${p.name}`}
                                                    onError={(e) => {
                                                        console.error("❌ Panch photo failed to load:", e.target.src);
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div style="width:80px;height:80px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;background:#f5f5f5;border-radius:8px;font-size:10px;">No Photo</div>';
                                                    }}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ccc'
                                                    }}
                                                />
                                            </Box>
                                        )}
                                        <Box flex="1">
                                            <Text fontSize="lg" fontWeight="600">{p.name}</Text>
                                            <Divider my={2} />
                                            <Text><b>{t("age")}:</b> {p.age}</Text>
                                            <Text><b>{t("mobile")}:</b> {displayMobile(p.mobile)}</Text>
                                            <Text><b>{t("occupation")}:</b> {p.occupation || "-"}</Text>
                                        </Box>
                                    </HStack>
                                </Box>
                            ))}
                        </SimpleGrid>

                        {/* APPLICANT */}
                        <Heading size="md" mt={8}>{t("applicantDetails")}</Heading>
                        <Divider my={3} />

                        <Box p={4} borderWidth="1px" rounded="lg" shadow="sm" bg="#FFFDF5">
                            <HStack spacing={4} align="start">
                                {form.applicantPhoto && (
                                    <Box>
                                        <img
                                            src={getPhotoUrl(form.applicantPhoto)}
                                            alt="Applicant Photo"
                                            onError={(e) => {
                                                console.error("❌ Applicant photo failed to load:", e.target.src);
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div style="width:80px;height:80px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;background:#f5f5f5;border-radius:8px;font-size:10px;">No Photo</div>';
                                            }}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid #ccc'
                                            }}
                                        />
                                    </Box>
                                )}
                                <Box flex="1">
                                    <Text fontSize="lg" fontWeight="600">{form.applicantName}</Text>
                                    <Divider my={2} />
                                    <Text><b>{t("mobile")}:</b> {displayMobile(form.applicantMobile)}</Text>
                                    <Text><b>{t("aadhaarShort")}:</b> {formatAadhaar(form.applicantAadhaar)}</Text>
                                </Box>
                            </HStack>
                        </Box>
                    </>
                ) : (
                    <Text color="red.500" mt={5}>
                        {t("notFilled")}
                    </Text>
                )}
            </Box>

            <PaymentPopup
                isOpen={showPaymentPopup}
                onClose={() => setShowPaymentPopup(false)}
                type="print"
            />

        </Box>
    );
}