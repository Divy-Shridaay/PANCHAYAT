"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    Box, Button, Input, Heading, VStack, HStack,
    FormControl, FormLabel, Select, Text, Progress,
    Menu, MenuButton, MenuList, MenuItem, Divider
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import LoaderSpinner from "../components/LoaderSpinner";
import { apiFetch } from "../utils/api.js";

export default function Pedhinamu() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { t } = useTranslation();
    // const formRef = useRef({});
    const toast = useToast();

    const showSuccess = (msg) =>
        toast({
            title: msg,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
        });
    const isEmpty = (v) => v === "" || v === null || v === undefined;

    const showError = (msg) =>
        toast({
            title: msg,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
        });

    const [step, setStep] = useState(1);
    const [totalHeirs, setTotalHeirs] = useState(0);

    const [form, setForm] = useState({
        mukhyaName: "",

        // Birth
        mukhyaDob: "",
        mukhyaDobDisplay: "",
        mukhyaBirthAge: "",

        // Death
        mukhyaIsDeceased: false,
        mukhyaDod: "",
        mukhyaDodDisplay: "",
        mukhyaDeathAge: "",

        heirs: []
    });

    const [fieldErrors, setFieldErrors] = useState({});


    // Loader for edit mode
    const [initialLoading, setInitialLoading] = useState(!!id);

    const calculateAge = (dob) => {
        if (!dob) return "";
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // ✅ FINAL AGE OF MUKHYA (DOB first, else manual age)
    const getMukhyaFinalAge = () => {
        // DEAD → calculate from dates OR use manual death age
        if (form.mukhyaIsDeceased) {
            if (form.mukhyaDeathAge) {
                return Number(form.mukhyaDeathAge);
            }

            if (form.mukhyaDob && form.mukhyaDod) {
                return Number(calculateAgeAtDeath(form.mukhyaDob, form.mukhyaDod));
            }

            return 0;
        }

        // ALIVE → birth age OR DOB
        if (form.mukhyaBirthAge) {
            return Number(form.mukhyaBirthAge);
        }

        if (form.mukhyaDob) {
            return Number(calculateAge(form.mukhyaDob));
        }

        return 0;
    };


    const calculateAgeAtDeath = (dob, dod) => {
        if (!dob || !dod) return "";

        const birth = new Date(dob);
        const death = new Date(dod);

        let age = death.getFullYear() - birth.getFullYear();
        const m = death.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) {
            age--;
        }

        return age >= 0 ? age : "";
    };

    const getDobFromAge = (age) => {
        if (!age) return "";
        const today = new Date();
        const y = today.getFullYear() - Number(age);
        return `${y}-07-01`;   // safe mid-year
    };



    // Converts user input "20 1 2004" → "2004-01-20"
    const formatDisplayDate = (value) => {
        // Keep digits only
        let v = value.replace(/\D/g, "");

        let d = v.slice(0, 2);
        let m = v.slice(2, 4);
        let y = v.slice(4, 8);

        let result = d;
        if (m) result += "/" + m;
        if (y) result += "/" + y;

        return result;
    };

    const convertToISO = (display) => {
        const parts = display.split("/");
        if (parts.length !== 3) return "";

        let [d, m, y] = parts;

        if (d.length !== 2 || m.length !== 2 || y.length !== 4) return "";

        return `${y}-${m}-${d}`;
    };

    const validateDob = (display) => {
        if (!display) return true;

        const parts = display.split("/");
        if (parts.length !== 3) return false;

        const [d, m, y] = parts;
        if (d.length !== 2 || m.length !== 2 || y.length !== 4) return false;

        const date = new Date(`${y}-${m}-${d}`);
        if (isNaN(date.getTime())) return false;

        // No future date
        if (date > new Date()) return false;

        return true;
    };


    const isDeathAfterBirth = (birthDisplay, deathDisplay) => {
        if (!birthDisplay || !deathDisplay) return true;

        const [bd, bm, by] = birthDisplay.split("/");
        const [dd, dm, dy] = deathDisplay.split("/");

        if (!bd || !bm || !by || !dd || !dm || !dy) return false;

        const birth = new Date(`${by}-${bm}-${bd}`);
        const death = new Date(`${dy}-${dm}-${dd}`);

        return death > birth;
    };

    const requireDeathDate = (isDeceased, dodDisplay, age, name = "") => {
        if (isDeceased && isEmpty(dodDisplay) && isEmpty(age)) {
            showError(
                name
                    ? `${name} માટે મૈયત  તારીખ અથવા મૈયત  સમયે ઉમર ફરજિયાત છે`
                    : "મૃત વ્યક્તિ માટે મૈયત  તારીખ અથવા મૈયત  સમયે ઉમર ફરજિયાત છે"
            );
            return false;
        }
        return true;
    };


    const generateHeirs = (count) => {
        const items = Array.from({ length: count }, () => ({
            name: "",
            relation: "",
            age: "",
            mobile: "",
            isDeceased: false,

            showSubFamily: false,
            childCount: 0,

            subFamily: {
                spouse: {
                    name: "",
                    age: "",
                    relation: "",
                    // relation2: "",
                    isDeceased: false
                },
                children: []
            }
        }));
        setForm({ ...form, heirs: items });
    };


    const updateHeir = (i, key, value) => {
        const updated = [...form.heirs];
        updated[i][key] = value;
        setForm({ ...form, heirs: updated });
    };

    const relationList = [
        "son",
        "daughter",
        "grandson",
        "granddaughter",
        "great_grandson",
        "great_granddaughter",
        "dohitra",
        "dohitri",
        "first_wife",
        "wife",
        "husband",
        "second_wife",
        "third_wife",
    ];

    useEffect(() => {
        if (!id) return;

        setInitialLoading(true);

        (async () => {
            try {
                const { response, data } = await apiFetch(`/api/pedhinamu/${id}`, {}, navigate, toast);
                const p = data.pedhinamu;

                if (!p) {
                    setInitialLoading(false);
                    return;
                }

                if (p.hasFullForm) {
                    navigate(`/pedhinamu/form/${id}?from=records`);
                    return;
                }

                // Use fixed normalizer
                const formatted = normalizeForm(p);

                setForm(formatted);
                setTotalHeirs(formatted.heirs.length);
                setStep(formatted.heirs.length > 0 ? 2 : 1);

                setInitialLoading(false);
            } catch (err) {
                console.error("Failed to load:", err);
                setInitialLoading(false);
            }
        })();
    }, [id]);


    const handleBack = () => {
        if (id) {
            // Editing mode → go back to list
            navigate("/pedhinamu/list");
        } else {
            // Creating new → go back to main home or list
            navigate(-1);
        }
    };

    const handleSave = async () => {
        try {

            // ✅ MAIN PERSON NAME REQUIRED
            if (!form.mukhyaName || !form.mukhyaName.trim()) {
                showError("મુખ્ય વ્યક્તિનું નામ જરૂરી છે");
                return;
            }


            // 🔴 ALL SELECTED HEIRS MUST BE FILLED
            if (form.heirs.length !== totalHeirs) {
                showError("વારસદારોની સંખ્યા અને વિગતો મળતી નથી");
                return;
            }

            // (Previous heir loop removed as it is now consolidated below)


            // -----------------------------
            // VALIDATION HELPERS
            // -----------------------------
            const validateAge = (age) => !age || /^[0-9]{1,3}$/.test(age);

            // -----------------------------
            // MAIN PERSON VALIDATION
            // -----------------------------
            // ✅ IF DEAD → death date OR age is compulsory

            if (form.mukhyaDobDisplay && !validateDob(form.mukhyaDobDisplay)) {
                showError(t("invalidDate"));
                return;
            }




            // 🔴 ALIVE → DOB or AGE is compulsory
            // 🟢 ALIVE VALIDATION (FINAL RULE)
            if (!form.mukhyaIsDeceased) {

                // ❌ both empty → error
                if (
                    isEmpty(form.mukhyaDobDisplay) &&
                    isEmpty(form.mukhyaBirthAge)
                ) {
                    showError("હયાત વ્યક્તિ માટે જન્મ તારીખ અથવા ઉમર ફરજિયાત છે");
                    return;
                }

                // ❌ DOB entered but invalid → error
                if (
                    !isEmpty(form.mukhyaDobDisplay) &&
                    !validateDob(form.mukhyaDobDisplay)
                ) {
                    showError("માન્ય જન્મ તારીખ દાખલ કરો (DD/MM/YYYY)");
                    return;
                }
            }


            if (
                form.mukhyaIsDeceased &&
                isEmpty(form.mukhyaDodDisplay) &&
                isEmpty(form.mukhyaDeathAge)
            ) {
                showError(`${form.mukhyaName || "મુખ્ય વ્યક્તિ"}: મૃત વ્યક્તિ માટે મૈયત  તારીખ અથવા મૈયત  સમયે ઉમર ફરજિયાત છે`);
                return;
            }


            if (form.mukhyaIsDeceased && form.mukhyaDodDisplay) {
                if (!validateDob(form.mukhyaDodDisplay)) {
                    showError(t("invalidDate"));
                    return;
                }

                if (!isDeathAfterBirth(form.mukhyaDobDisplay, form.mukhyaDodDisplay)) {
                    showError("મૈયત  તારીખ જન્મ તારીખ પછીની હોવી જોઈએ");
                    return;
                }
            }




            // -----------------------------
            // VALIDATE HEIRS (UPDATED LOGIC)
            // -----------------------------



            for (let i = 0; i < form.heirs.length; i++) {
                const h = form.heirs[i];


                // ❌ REMOVED "Skip completely empty heirs" check
                // We want strict validation: if you added a row, you must fill it.

                // ⭐ NAME REQUIRED (Always)
                if (!h.name?.trim()) {
                    showError("પરિવારના સભ્યનું નામ ફરજિયાત છે");
                    return;
                }

                // ⭐ RELATION REQUIRED
                if (!h.relation?.trim()) {
                    showError(`${h.name}: ${t("relationRequired")}`);
                    return;
                }


                // 🔴 HEIR DEATH DATE/AGE REQUIRED
                if (!requireDeathDate(h.isDeceased, h.dodDisplay, h.age, h.name)) {
                    return;
                }

                // DOB or Age required (ALIVE ONLY)
                if (!h.isDeceased && !h.dobDisplay && !h.age) {
                    showError(`${h.name}: ${t("dobOrAgeRequired")}`);
                    return;
                }

                if (h.dobDisplay && !validateDob(h.dobDisplay)) {
                    showError(`${h.name}: ${t("invalidDate")}`);
                    return;
                }

                if (h.age && !validateAge(h.age)) {
                    // showError(`${h.name}: ${t("invalidAge")}`);
                    return;
                }

                if (h.isDeceased && h.dodDisplay) {
                    if (!validateDob(h.dodDisplay)) {
                        showError(`${h.name}: ${t("invalidDate")}`);
                        return;
                    }

                    if (!isDeathAfterBirth(h.dobDisplay, h.dodDisplay)) {
                        setFieldErrors({ [`heir_${i}_dod`]: true });

                        showError(
                            ` કૃપા કરી માન્ય મૈયત  તારીખ દાખલ કરો. મૈયત  તારીખ જન્મ તારીખ પછીની હોવી જોઈએ.`
                        );
                        return;
                    }
                }



                // -----------------------------
                // SPOUSE VALIDATION
                // -----------------------------
                // -----------------------------
                // SPOUSE VALIDATION
                // -----------------------------
                // If ANY spouse field is entered, then Name + Relation become compulsory
                const s = h.subFamily.spouse;
                const hasSpouseData =
                    s.name?.trim() ||
                    s.relation?.trim() ||
                    s.age ||
                    s.dobDisplay ||
                    s.isDeceased; // changing alive/dead is also "data entry"

                if (hasSpouseData) {
                    if (!s.name?.trim()) {
                        showError("પરિવારના સભ્યનું નામ ફરજિયાત છે");
                        return;
                    }

                    // 🔴 SPOUSE DEATH DATE/AGE REQUIRED
                    if (!requireDeathDate(s.isDeceased, s.dodDisplay, s.age, s.name)) {
                        return;
                    }


                    if (!s.relation?.trim()) {
                        showError(`${s.name}: ${t("spouseRelationRequired")}`);
                        return;
                    }

                    if (!s.isDeceased && !s.dobDisplay && !s.age) {
                        showError(`${s.name}: ${t("dobOrAgeRequired")}`);
                        return;
                    }

                    if (s.dobDisplay && !validateDob(s.dobDisplay)) {
                        showError(`${s.name}: ${t("invalidDate")}`);
                        return;
                    }

                    if (s.age && !validateAge(s.age)) {
                        // showError(`${s.name}: ${t("invalidAge")}`);
                        return;
                    }
                    if (s.isDeceased && s.dodDisplay) {
                        if (!validateDob(s.dodDisplay)) {
                            showError(`${s.name}: ${t("invalidDate")}`);
                            return;
                        }

                        if (!isDeathAfterBirth(s.dobDisplay, s.dodDisplay)) {
                            setFieldErrors({ [`spouse_${i}_dod`]: true });

                            showError(
                                ` કૃપા કરી માન્ય મૈયત  તારીખ દાખલ કરો. મૈયત  તારીખ જન્મ તારીખ પછીની હોવી જોઈએ.`
                            );
                            return;
                        }
                    }


                }

                // -----------------------------
                // CHILDREN VALIDATION
                // -----------------------------
                // CHILDREN VALIDATION
                for (let ci = 0; ci < (h.subFamily.children || []).length; ci++) {
                    const c = h.subFamily.children[ci];

                    // 🔴 If child row exists, name is compulsory
                    if (!c.name || !c.name.trim()) {
                        showError("પરિવારના સભ્યનું નામ ફરજિયાત છે");
                        return;
                    }



                    if (!c.relation?.trim()) {
                        showError(`${c.name}: ${t("childRelationRequired")}`);
                        return;
                    }

                    // 🔴 CHILD DEATH DATE/AGE REQUIRED
                    if (!requireDeathDate(c.isDeceased, c.dodDisplay, c.age, c.name)) {
                        return;
                    }

                    if (!c.isDeceased && !c.dobDisplay && !c.age) {
                        showError(`${c.name}: ${t("dobOrAgeRequired")}`);
                        return;
                    }

                    if (c.dobDisplay && !validateDob(c.dobDisplay)) {
                        showError(`${c.name}: ${t("invalidDate")}`);
                        return;
                    }

                    if (c.age && !validateAge(c.age)) {
                        // showError(`${c.name}: ${t("invalidAge")}`);
                        return;
                    }

                    if (c.isDeceased && c.dodDisplay) {
                        if (!validateDob(c.dodDisplay)) {
                            showError(`${c.name}: ${t("invalidDate")}`);
                            return;
                        }

                        if (!isDeathAfterBirth(c.dobDisplay, c.dodDisplay)) {
                            setFieldErrors({ [`child_${i}_${ci}_dod`]: true });

                            showError(
                                ` કૃપા કરી માન્ય મૈયત  તારીખ દાખલ કરો. મૈયત  તારીખ જન્મ તારીખ પછીની હોવી જોઈએ.`
                            );
                            return;
                        }
                    }



                    // -----------------------------
                    // CHILD SPOUSE VALIDATION
                    // -----------------------------
                    const cs = c.spouse;

                    if (cs?.name?.trim()) {


                        // 🔴 CHILD SPOUSE DEATH DATE/AGE REQUIRED
                        if (cs && !requireDeathDate(cs.isDeceased, cs.dodDisplay, cs.age, cs.name)) {
                            return;
                        }


                        if (!cs.relation?.trim()) {
                            showError(`${cs.name}: ${t("spouseRelationRequired")}`);
                            return;
                        }

                        if (!cs.isDeceased && !cs.dobDisplay && !cs.age) {
                            showError(`${cs.name}: ${t("dobOrAgeRequired")}`);
                            return;
                        }

                        if (cs.dobDisplay && !validateDob(cs.dobDisplay)) {
                            showError(`${cs.name}: ${t("invalidDate")}`);
                            return;
                        }

                        if (cs.age && !validateAge(cs.age)) {
                            // showError(`${cs.name}: ${t("invalidAge")}`);
                            return;
                        }


                    }

                    // -----------------------------
                    // GRANDCHILDREN VALIDATION
                    // -----------------------------
                    for (let gi = 0; gi < (c.children || []).length; gi++) {
                        const gc = c.children[gi];



                        // 🔴 GRANDCHILD DEATH DATE/AGE REQUIRED
                        if (!requireDeathDate(gc.isDeceased, gc.dodDisplay, gc.age, gc.name)) {
                            return;
                        }

                        // 🔴 If grandchild row exists, name is compulsory
                        if (!gc.name || !gc.name.trim()) {
                            showError("પરિવારના સભ્યનું નામ ફરજિયાત છે");
                            return;
                        }



                        if (!gc.relation?.trim()) {
                            showError(`${gc.name}: ${t("grandchildRelationRequired")}`);
                            return;
                        }

                        if (!gc.isDeceased && !gc.dobDisplay && !gc.age) {
                            showError(`${gc.name}: ${t("dobOrAgeRequired")}`);
                            return;
                        }

                        if (gc.dobDisplay && !validateDob(gc.dobDisplay)) {
                            showError(`${gc.name}: ${t("invalidDate")}`);
                            return;
                        }

                        if (gc.age && !validateAge(gc.age)) {
                            // showError(`${gc.name}: ${t("invalidAge")}`);
                            return;
                        }

                        if (gc.isDeceased && gc.dodDisplay && !isDeathAfterBirth(gc.dobDisplay, gc.dodDisplay)) {
                            setFieldErrors({ [`grand_${i}_${ci}_${gi}_dod`]: true });

                            showError(
                                ` કૃપા કરી માન્ય મૈયત  તારીખ દાખલ કરો. મૈયત  તારીખ જન્મ તારીખ પછીની હોવી જોઈએ.`
                            );
                            return;
                        }

                    }
                }
            }



            // -----------------------------
            // COUNT MUKHIYA WIVES
            // -----------------------------
            const mukhiyaWifeCount = form.heirs.filter((h) =>
                ["wife", "first_wife", "second_wife", "third_wife"].includes(h.relation)
            ).length;

            const hasMultipleWives = mukhiyaWifeCount > 1;

            // -----------------------------
            // BUILD PAYLOAD AFTER VALIDATION
            // -----------------------------
            const payload = {
                mukhya: {
                    name: form.mukhyaName,
                    age: getMukhyaFinalAge(),

                    dob: form.mukhyaDob || "",
                    hasMultipleWives,

                    dobDisplay: form.mukhyaDobDisplay || "",
                    isDeceased: form.mukhyaIsDeceased || false,
                    dod: form.mukhyaIsDeceased ? (form.mukhyaDod || "") : "",
                    dodDisplay: form.mukhyaIsDeceased ? (form.mukhyaDodDisplay || "") : ""
                },

                // 🔽 ADD HERE
                makanMilkatAkarniNo: form.makanMilkatAkarniNo || "",
                any: form.any || "",
                heirs: form.heirs.map((h) => ({
                    name: h.name,
                    relation: h.relation,
                    age: h.age,
                    dob: h.dob || "",
                    dobDisplay: h.dobDisplay || "",
                    mobile: h.mobile || "",
                    isDeceased: h.isDeceased || false,
                    dod: h.isDeceased ? (h.dod || "") : "",
                    dodDisplay: h.isDeceased ? (h.dodDisplay || "") : "",

                    subFamily: {
                        spouse: {
                            name: h.subFamily.spouse.name,
                            age: h.subFamily.spouse.age,
                            relation: h.subFamily.spouse.relation,
                            dob: h.subFamily.spouse.dob || "",
                            dobDisplay: h.subFamily.spouse.dobDisplay || "",
                            isDeceased: h.subFamily.spouse.isDeceased,
                            dod: h.subFamily.spouse.isDeceased
                                ? (h.subFamily.spouse.dod || "")
                                : "",
                            dodDisplay: h.subFamily.spouse.isDeceased
                                ? (h.subFamily.spouse.dodDisplay || "")
                                : ""
                        },

                        children: h.subFamily.children.map((c) => ({
                            name: c.name,
                            age: c.age,
                            relation: c.relation,
                            dob: c.dob || "",
                            dobDisplay: c.dobDisplay || "",
                            isDeceased: c.isDeceased || false,
                            dod: c.isDeceased ? (c.dod || "") : "",
                            dodDisplay: c.isDeceased ? (c.dodDisplay || "") : "",

                            spouse: c.spouse
                                ? {
                                    name: c.spouse.name || "",
                                    age: c.spouse.age || "",
                                    relation: c.spouse.relation || "",
                                    dob: c.spouse.dob || "",
                                    dobDisplay: c.spouse.dobDisplay || "",
                                    isDeceased: c.spouse.isDeceased || false,
                                    dod: c.spouse.isDeceased ? (c.spouse.dod || "") : "",
                                    dodDisplay: c.spouse.isDeceased
                                        ? (c.spouse.dodDisplay || "")
                                        : ""
                                }
                                : null,

                            children: (c.children || []).map((gc) => ({
                                name: gc.name,
                                age: gc.age,
                                relation: gc.relation,
                                dob: gc.dob || "",
                                dobDisplay: gc.dobDisplay || "",
                                isDeceased: gc.isDeceased || false,
                                dod: gc.isDeceased ? (gc.dod || "") : "",
                                dodDisplay: gc.isDeceased ? (gc.dodDisplay || "") : "",
                                // Support further nesting
                                spouse: gc.spouse ? { ...gc.spouse } : null,
                                children: (gc.children || []).map(ggc => ({ ...ggc }))
                            }))
                        }))
                    }
                }))
            };

            // -----------------------------
            // DECIDE API METHOD (CREATE vs UPDATE)
            // -----------------------------
            const isEditMode = Boolean(id);
            const url = isEditMode
                ? `/api/pedhinamu/${id}`
                : `/api/pedhinamu`;

            const method = isEditMode ? "PUT" : "POST";


            const { response, data } = await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            }, navigate, toast);

            if (!response.ok) {
                showError(data.error || t("error"));
                return;
            }

            // SUCCESS
            showSuccess(isEditMode ? t("updateSuccess") : t("success"));

            setTimeout(() => {
                const redirectId = isEditMode ? id : data.data._id;
                navigate(`/pedhinamu/form/${redirectId}`);
            }, 500);

        } catch (err) {
            console.error("SAVE ERROR:", err);
            showError(t("error"));
        }
    };


    const normalizeForm = (p) => {
        if (!p) return null;

        return {
            // -------------------------
            // MAIN PERSON
            // -------------------------
            mukhyaName: p.mukhya?.name || "",
            mukhyaAge: p.mukhya?.age || "",
            mukhyaBirthAge: !p.mukhya?.isDeceased ? (p.mukhya?.age || "") : "",
            mukhyaDeathAge: p.mukhya?.isDeceased ? (p.mukhya?.age || "") : "",
            mukhyaDob: p.mukhya?.dob || "",
            mukhyaDobDisplay: p.mukhya?.dobDisplay || "",
            mukhyaIsDeceased: p.mukhya?.isDeceased || false,
            mukhyaDod: p.mukhya?.dod || "",
            mukhyaDodDisplay: p.mukhya?.dodDisplay || "",

            // -------------------------
            // HEIRS
            // -------------------------
            heirs: (p.heirs || []).map((h) => ({
                name: h.name || "",
                relation: h.relation || "",
                age: h.age || "",
                dob: h.dob || "",
                dobDisplay: h.dobDisplay || "",
                mobile: h.mobile || "",
                isDeceased: h.isDeceased || false,
                dod: h.dod || "",
                dodDisplay: h.dodDisplay || "",
                showSubFamily: true,
                // ✅ THIS IS THE FIX (FOR "કુલ સંતાન")
                childCount: (h.subFamily?.children || []).length,


                subFamily: {
                    spouse: {
                        name: h.subFamily?.spouse?.name || "",
                        age: h.subFamily?.spouse?.age || "",
                        relation: h.subFamily?.spouse?.relation || "",
                        // relation2: h.subFamily?.spouse?.relation2 || "",
                        dob: h.subFamily?.spouse?.dob || "",
                        dobDisplay: h.subFamily?.spouse?.dobDisplay || "",
                        isDeceased: h.subFamily?.spouse?.isDeceased || false,
                        dod: h.subFamily?.spouse?.dod || "",
                        dodDisplay: h.subFamily?.spouse?.dodDisplay || "",
                    },

                    children: (h.subFamily?.children || []).map((c) => ({
                        name: c.name || "",
                        relation: c.relation || "",
                        age: c.age || "",
                        dob: c.dob || "",
                        dobDisplay: c.dobDisplay || "",
                        isDeceased: c.isDeceased || false,
                        dod: c.dod || "",
                        dodDisplay: c.dodDisplay || "",
                        showSpouse: !!c.spouse?.name,

                        // ✅ FIX: initialize total children count for edit mode
                        childCount: (c.children || []).length,

                        // ✅ THIS IS THE FIX
                        grandCount: (c.children || []).length,
                        spouse: c.spouse
                            ? {
                                name: c.spouse?.name || "",
                                age: c.spouse?.age || "",
                                relation: c.spouse?.relation || "",
                                dob: c.spouse?.dob || "",
                                dobDisplay: c.spouse?.dobDisplay || "",
                                isDeceased: c.spouse?.isDeceased || false,
                                dod: c.spouse?.dod || "",
                                dodDisplay: c.spouse?.dodDisplay || "",
                            }
                            : {
                                name: "",
                                age: "",
                                relation: "",
                                dob: "",
                                dobDisplay: "",
                                isDeceased: false,
                                dod: "",
                                dodDisplay: ""
                            },

                        children: (c.children || []).map((gc) => ({
                            name: gc.name || "",
                            relation: gc.relation || "",
                            age: gc.age || "",
                            dob: gc.dob || "",
                            dobDisplay: gc.dobDisplay || "",
                            isDeceased: gc.isDeceased || false,
                            dod: gc.dod || "",
                            dodDisplay: gc.dodDisplay || "",
                        }))
                    })),
                }
            })),
        };
    };

    if (initialLoading) {
        return <LoaderSpinner label={t("loading")} />;
    }

    return (
        <Box p={8} maxW="900px" mx="auto" bg="#F8FAF9" minH="100vh">
            <Button
                leftIcon={<span>←</span>}
                colorScheme="green"
                variant="outline"
                mb={6}
                rounded="xl"
                fontWeight="700"
                onClick={handleBack}
            >
                {t("back")}
            </Button>

            {/* Progress Bar */}
            <Progress
                value={step === 1 ? 0 : 50}
                size="sm"
                colorScheme="green"
                borderRadius="md"
                mb={6}
            />

            {/* Page Title */}
            <Heading textAlign="center" mb={6} color="#1E4D2B" fontWeight="700">
                {t("pedhinamu")}
            </Heading>

            {/* STEP 1 */}
            {step === 1 && (
                <Box p={6} bg="white" rounded="2xl" shadow="md" borderWidth="1px">

                    <Heading size="md" mb={4} color="green.700" borderLeft="4px solid #2A7F62" pl={3}>
                        {t("mukhyaDetails")}
                    </Heading>

                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel fontWeight="600">{t("name")} </FormLabel>
                            <Input
                                size="lg"
                                bg="gray.100"
                                value={form.mukhyaName}
                                onChange={(e) => setForm({ ...form, mukhyaName: e.target.value })}
                            />
                        </FormControl>

                        {/* ALIVE / DEAD — MOVED UP */}
                        <FormControl>
                            <FormLabel fontWeight="600">{t("aliveDead")}</FormLabel>
                            <Select
                                size="lg"
                                bg="gray.100"
                                value={form.mukhyaIsDeceased ? "dead" : "alive"}
                                onChange={(e) => {
                                    const isDead = e.target.value === "dead";

                                    setForm({
                                        ...form,
                                        mukhyaIsDeceased: isDead,

                                        // 🔁 CLEAR BIRTH FIELDS WHEN DEAD
                                        // ❌ DO NOT clear DOB when dead
                                        mukhyaDob: form.mukhyaDob,
                                        mukhyaDobDisplay: form.mukhyaDobDisplay,

                                        mukhyaBirthAge: isDead ? "" : form.mukhyaBirthAge,

                                        // 🔁 CLEAR DEATH FIELDS WHEN ALIVE
                                        mukhyaDod: !isDead ? "" : form.mukhyaDod,
                                        mukhyaDodDisplay: !isDead ? "" : form.mukhyaDodDisplay,
                                        mukhyaDeathAge: !isDead
                                            ? ""
                                            : form.mukhyaDod && (form.mukhyaDob || form.mukhyaBirthAge)
                                                ? calculateAgeAtDeath(
                                                    form.mukhyaDob || getDobFromAge(form.mukhyaBirthAge),
                                                    form.mukhyaDod
                                                )
                                                : "",

                                    });
                                }}

                            >
                                <option value="alive">{t("alive")}</option>
                                <option value="dead">{t("deceased")}</option>
                            </Select>
                        </FormControl>

                        {/* BIRTH DATE / AGE */}
                        <FormControl>
                            <FormLabel fontWeight="600">{t("birthDateAge")}</FormLabel>

                            <HStack spacing={3} align="center">
                                <Input
                                    type="text"
                                    placeholder="DD/MM/YYYY"
                                    size="lg"
                                    bg="gray.100"
                                    value={form.mukhyaDobDisplay || ""}
                                    onChange={(e) => {
                                        const display = formatDisplayDate(e.target.value);
                                        const iso = convertToISO(display);

                                        setForm({
                                            ...form,
                                            mukhyaDobDisplay: display,
                                            mukhyaDob: iso,
                                            mukhyaBirthAge: iso ? calculateAge(iso) : ""
                                        });
                                    }}
                                />



                                <Text fontWeight="bold" color="green.700">
                                    {t("orText")}
                                </Text>

                                <Input
                                    size="lg"
                                    width="120px"
                                    bg="gray.100"
                                    placeholder={t("age")}
                                    value={form.mukhyaBirthAge}
                                    isReadOnly={form.mukhyaIsDeceased}
                                    maxLength={3}
                                    onChange={(e) => {
                                        if (form.mukhyaIsDeceased) return;
                                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                        setForm({ ...form, mukhyaBirthAge: v });
                                    }}
                                />

                            </HStack>
                        </FormControl>


                        {form.mukhyaIsDeceased && (
                            <FormControl>
                                <FormLabel fontWeight="600">{t("deathDate")}</FormLabel>

                                <HStack spacing={3} align="center">

                                    {/* Death Date */}
                                    <Input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        size="lg"
                                        bg="gray.100"
                                        value={form.mukhyaDodDisplay || ""}
                                        onChange={(e) => {
                                            const display = formatDisplayDate(e.target.value);
                                            const iso = convertToISO(display);

                                            const dob = form.mukhyaDob || getDobFromAge(form.mukhyaBirthAge);

                                            setForm({
                                                ...form,
                                                mukhyaDodDisplay: display,
                                                mukhyaDod: iso,
                                                mukhyaDeathAge: dob && iso ? calculateAgeAtDeath(dob, iso) : "",
                                            });
                                        }}
                                    />

                                    <Text fontWeight="bold" color="green.700">
                                        {t("orText")}
                                    </Text>

                                    {/* Death Age */}
                                    <Input
                                        size="lg"
                                        width="120px"
                                        bg="gray.100"
                                        placeholder={t("age")}
                                        value={form.mukhyaDeathAge}
                                        maxLength={3}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                            setForm({ ...form, mukhyaDeathAge: v });
                                        }}
                                    />

                                </HStack>
                            </FormControl>
                        )}



                        <FormControl>
                            <FormLabel fontWeight="600">{t("totalHeirs")}</FormLabel>

                            <Input
                                type="number"
                                size="lg"
                                bg="gray.100"
                                value={totalHeirs}
                                onChange={(e) => {
                                    let newCount = parseInt(e.target.value || 0);

                                    if (newCount < 0) newCount = 0;

                                    setTotalHeirs(newCount);

                                    if (!isEdit) {
                                        // CREATE MODE → original behaviour
                                        generateHeirs(newCount);
                                        return;
                                    }

                                    // -----------------------------
                                    // EDIT MODE BEHAVIOUR
                                    // -----------------------------
                                    setForm((prev) => {
                                        const updated = { ...prev };
                                        const existing = [...prev.heirs];

                                        if (newCount > existing.length) {
                                            // ADD EMPTY HEIRS
                                            const toAdd = newCount - existing.length;

                                            for (let i = 0; i < toAdd; i++) {
                                                existing.push({
                                                    name: "",
                                                    relation: "",
                                                    age: "",
                                                    dob: "",
                                                    dobDisplay: "",
                                                    mobile: "",
                                                    isDeceased: false,
                                                    dod: "",
                                                    dodDisplay: "",
                                                    showSubFamily: true,
                                                    childCount: 0,

                                                    subFamily: {
                                                        spouse: {
                                                            name: "",
                                                            age: "",
                                                            relation: "",
                                                            // relation2: "",
                                                            dob: "",
                                                            dobDisplay: "",
                                                            isDeceased: false,
                                                            dod: "",
                                                            dodDisplay: ""
                                                        },
                                                        children: []
                                                    }
                                                });
                                            }
                                        } else if (newCount < existing.length) {
                                            // REMOVE EXTRA HEIRS
                                            existing.splice(newCount);
                                        }

                                        updated.heirs = existing;
                                        return updated;
                                    });
                                }}
                                onWheel={(e) => e.target.blur()}
                            />
                        </FormControl>
                        <Button
                            colorScheme="green"
                            size="lg"
                            width="100%"
                            rounded="xl"
                            onClick={() => {


                                // 🔴 NAME REQUIRED (STEP 1)
                                if (!form.mukhyaName || !form.mukhyaName.trim()) {
                                    showError("મુખ્ય વ્યક્તિનું નામ જરૂરી છે");
                                    return;
                                }




                                // 🔴 ALIVE → DOB or AGE is compulsory
                                // 🟢 ALIVE VALIDATION (FINAL RULE)
                                if (!form.mukhyaIsDeceased) {

                                    // ❌ both empty → error
                                    if (
                                        isEmpty(form.mukhyaDobDisplay) &&
                                        isEmpty(form.mukhyaBirthAge)
                                    ) {
                                        showError("હયાત વ્યક્તિ માટે જન્મ તારીખ અથવા ઉમર ફરજિયાત છે");
                                        return;
                                    }

                                    // ❌ DOB entered but invalid → error
                                    if (
                                        !isEmpty(form.mukhyaDobDisplay) &&
                                        !validateDob(form.mukhyaDobDisplay)
                                    ) {
                                        showError("માન્ય જન્મ તારીખ દાખલ કરો (DD/MM/YYYY)");
                                        return;
                                    }
                                }

                                if (
                                    form.mukhyaIsDeceased &&
                                    isEmpty(form.mukhyaDodDisplay) &&
                                    isEmpty(form.mukhyaDeathAge)
                                ) {
                                    showError(`${form.mukhyaName || "મુખ્ય વ્યક્તિ"}: મૃત વ્યક્તિ માટે મૈયત  તારીખ અથવા મૈયત  સમયે ઉમર ફરજિયાત છે`);
                                    return;
                                }


                                // 🔴 2️⃣ INVALID DEATH DATE FORMAT
                                if (
                                    form.mukhyaIsDeceased &&
                                    form.mukhyaDodDisplay &&
                                    !validateDob(form.mukhyaDodDisplay)
                                ) {
                                    showError("મૈયત  તારીખ અમાન્ય છે");
                                    return;
                                }

                                if (
                                    form.mukhyaIsDeceased &&
                                    form.mukhyaDobDisplay &&
                                    form.mukhyaDodDisplay &&
                                    !isDeathAfterBirth(form.mukhyaDobDisplay, form.mukhyaDodDisplay)
                                ) {
                                    setFieldErrors({ mukhyaDod: true });

                                    showError("મૈયત  તારીખ જન્મ તારીખ પછીની હોવી જોઈએ");

                                    setTimeout(() => {
                                        document.querySelector('input[placeholder="DD/MM/YYYY"]')?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center"
                                        });
                                    }, 200);

                                    return;
                                }


                                // 🔴 MINIMUM 18 AGE VALIDATION (FINAL & CORRECT)
                                if (
                                    !form.mukhyaIsDeceased ||        // alive
                                    form.mukhyaDeathAge              // dead + age entered
                                ) {
                                    const age = getMukhyaFinalAge();

                                    if (age && age < 18) {
                                        showError("મુખિયા ની ઉંમર ઓછામાં ઓછી ૧૮ વર્ષ હોવી જરૂરી છે");
                                        return;
                                    }
                                }


                                // 🔴 5️⃣ TOTAL HEIRS CHECK
                                if (totalHeirs < 1) {
                                    showError("ઓછામાં ઓછો એક વારસદાર જરૂરી છે");
                                    return;
                                }

                                // ✅ ALL OK → GO TO STEP 2
                                setStep(2);
                            }}


                        >
                            {t("next")}
                        </Button>

                    </VStack>

                </Box>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <Box p={6} bg="white" rounded="2xl" shadow="md" borderWidth="1px">

                    <Heading size="md" mb={4} color="green.700" borderLeft="4px solid #2A7F62" pl={3}>
                        {t("heirs")}
                    </Heading>

                    {form.heirs.map((h, i) => (
                        <Box key={i} p={4} bg="#F8FAF9" rounded="xl" borderWidth="1px" mb={4}>
                            <Text fontWeight="700" mb={2} color="green.800">
                                {t("heirNumber", { number: i + 1 })}
                            </Text>


                            <VStack spacing={3}>

                                <FormControl>
                                    <FormLabel>{t("name")}</FormLabel>
                                    <Input
                                        size="lg"
                                        bg="gray.100"
                                        value={h.name}
                                        onChange={(e) => updateHeir(i, "name", e.target.value)}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>{t("relation")}</FormLabel>

                                    <Menu placement="bottom">
                                        <MenuButton
                                            as={Button}
                                            size="lg"
                                            bg="gray.100"
                                            rightIcon={<ChevronDownIcon />}
                                            textAlign="left"
                                            width="100%"
                                        >
                                            {h.relation ? t(h.relation) : t("select")}
                                        </MenuButton>

                                        <MenuList maxH="250px" overflowY="auto">
                                            {relationList.map((r) => (
                                                <MenuItem key={r} onClick={() => updateHeir(i, "relation", r)}>
                                                    {t(r)}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{t("birthDateAge")}</FormLabel>

                                    <HStack spacing={3} align="center">

                                        {/* DATE */}
                                        <Input
                                            type="text"
                                            placeholder="DD/MM/YYYY"
                                            size="lg"
                                            bg="gray.100"
                                            value={h.dobDisplay || ""}
                                            onChange={(e) => {
                                                const display = formatDisplayDate(e.target.value);

                                                // Validate only when fully entered
                                                if (display.length === 10 && !validateDob(display)) {
                                                    showError(t("invalidDate"));
                                                    return;
                                                }

                                                const iso = convertToISO(display);

                                                const updated = [...form.heirs];
                                                updated[i].dobDisplay = display;
                                                updated[i].dob = iso;
                                                updated[i].age = updated[i].isDeceased
                                                    ? updated[i].dod
                                                        ? calculateAgeAtDeath(iso, updated[i].dod)
                                                        : ""
                                                    : iso
                                                        ? calculateAge(iso)
                                                        : "";


                                                setForm({ ...form, heirs: updated });
                                            }}
                                        />

                                        {/* OR TEXT */}
                                        <Text fontWeight="bold" color="green.700">
                                            {t("orText")}
                                        </Text>

                                        <Input
                                            size="lg"
                                            width="120px"
                                            bg="gray.100"
                                            placeholder={t("age")}
                                            value={h.isDeceased ? "" : h.age}
                                            isReadOnly={h.isDeceased}
                                            maxLength={3}
                                            onChange={(e) => {
                                                if (h.isDeceased) return;
                                                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                updateHeir(i, "age", value);
                                            }}
                                        />

                                    </HStack>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{t("aliveDead")}</FormLabel>

                                    <Select
                                        size="lg"
                                        bg="gray.100"
                                        value={h.isDeceased ? "dead" : "alive"}
                                        onChange={(e) => {
                                            const isDead = e.target.value === "dead";
                                            const updated = [...form.heirs];

                                            updated[i].isDeceased = isDead;
                                            updated[i].age = isDead
                                                ? updated[i].dob && updated[i].dod
                                                    ? calculateAgeAtDeath(updated[i].dob, updated[i].dod)
                                                    : ""
                                                : updated[i].dob
                                                    ? calculateAge(updated[i].dob)
                                                    : "";

                                            setForm({ ...form, heirs: updated });
                                        }}

                                    >
                                        <option value="alive">{t("alive")}</option>
                                        <option value="dead">{t("deceased")}</option>
                                    </Select>
                                </FormControl>

                                {h.isDeceased && (
                                    <FormControl>
                                        <FormLabel>{t("deathDate")}</FormLabel>

                                        <HStack spacing={3} align="center">
                                            <Input
                                                type="text"
                                                placeholder="DD/MM/YYYY"
                                                size="lg"
                                                bg="gray.100"
                                                borderColor={fieldErrors[`heir_${i}_dod`] ? "red.500" : "gray.200"}
                                                value={h.dodDisplay || ""}
                                                onChange={(e) => {
                                                    const display = formatDisplayDate(e.target.value);

                                                    // clear red when user edits
                                                    setFieldErrors((p) => ({ ...p, [`heir_${i}_dod`]: false }));

                                                    if (display.length === 10 && !validateDob(display)) {
                                                        showError(t("invalidDate"));
                                                        return;
                                                    }

                                                    const iso = convertToISO(display);

                                                    const updated = structuredClone(form.heirs);
                                                    updated[i].dodDisplay = display;
                                                    updated[i].dod = iso;
                                                    updated[i].age =
                                                        updated[i].dob && iso
                                                            ? calculateAgeAtDeath(updated[i].dob, iso)
                                                            : "";

                                                    setForm({ ...form, heirs: updated });
                                                }}
                                            />

                                            <Text fontWeight="bold" color="green.700">
                                                {t("orText")}
                                            </Text>

                                            <Input
                                                size="lg"
                                                width="120px"
                                                bg="gray.100"
                                                value={h.age || ""}
                                                placeholder={t("age")}
                                                maxLength={3}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                    updateHeir(i, "age", v);
                                                }}
                                            />
                                        </HStack>
                                    </FormControl>
                                )}



                                {/* ADD SUB-FAMILY BUTTON */}
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    variant="outline"
                                    rounded="full"
                                    leftIcon={<ChevronDownIcon />}
                                    onClick={() => {
                                        const u = [...form.heirs];
                                        u[i].showSubFamily = !u[i].showSubFamily;
                                        setForm({ ...form, heirs: u });
                                    }}
                                >
                                    {h.showSubFamily ? t("hideSubFamily") : t("addSubFamily")}
                                </Button>

                                {h.showSubFamily && (
                                    <Box
                                        mt={4}
                                        p={5}
                                        bg="white"
                                        rounded="2xl"
                                        shadow="md"
                                        borderWidth="1px"
                                        borderColor="green.200"
                                    >
                                        {/* Title */}
                                        <Heading size="sm" mb={4} color="green.700">
                                            {h.name
                                                ? t("familyOf", { name: h.name })
                                                : t("familyOfHeir", { number: i + 1 })}
                                        </Heading>

                                        {/* SPOUSE SECTION */}
                                        <Box bg="green.50" p={4} rounded="xl" borderWidth="1px" borderColor="green.100" mb={5}>
                                            <Text fontWeight="600" mb={3} color="green.700">
                                                {t("spouseDetails")}
                                            </Text>

                                            <VStack align="stretch" spacing={3}>
                                                <FormControl>
                                                    <FormLabel>{t("spouseName")}</FormLabel>
                                                    <Input
                                                        size="lg"
                                                        bg="gray.100"
                                                        value={h.subFamily.spouse.name}
                                                        onChange={(e) => {
                                                            const u = [...form.heirs];
                                                            u[i].subFamily.spouse.name = e.target.value;
                                                            setForm({ ...form, heirs: u });
                                                        }}
                                                    />
                                                </FormControl>

                                                <HStack spacing={3}>
                                                    {/* SPOUSE DOB + AGE */}
                                                    <FormControl>
                                                        <FormLabel>{t("birthDateAge")}</FormLabel>

                                                        <HStack spacing={3} align="center">

                                                            {/* SPOUSE DOB */}
                                                            <Input
                                                                type="text"
                                                                placeholder="DD/MM/YYYY"
                                                                size="lg"
                                                                bg="gray.100"
                                                                value={h.subFamily.spouse.dobDisplay || ""}
                                                                onChange={(e) => {
                                                                    const display = formatDisplayDate(e.target.value);

                                                                    // Validate full DD/MM/YYYY
                                                                    if (display.length === 10 && !validateDob(display)) {
                                                                        showError(t("invalidDate"));
                                                                        return;
                                                                    }

                                                                    const iso = convertToISO(display);

                                                                    const u = [...form.heirs];
                                                                    u[i].subFamily.spouse.dobDisplay = display;
                                                                    u[i].subFamily.spouse.dob = iso;
                                                                    u[i].subFamily.spouse.age =
                                                                        u[i].subFamily.spouse.isDeceased
                                                                            ? u[i].subFamily.spouse.dod
                                                                                ? calculateAgeAtDeath(iso, u[i].subFamily.spouse.dod)
                                                                                : ""
                                                                            : iso
                                                                                ? calculateAge(iso)
                                                                                : "";


                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />

                                                            {/* OR TEXT */}
                                                            <Text fontWeight="bold" color="green.700">
                                                                {t("orText")}
                                                            </Text>

                                                            {/* SPOUSE AGE - Unified */}
                                                            <Input
                                                                size="lg"
                                                                width="120px"
                                                                bg="gray.100"
                                                                placeholder={t("age")}
                                                                value={h.subFamily.spouse.isDeceased ? "" : h.subFamily.spouse.age}
                                                                isReadOnly={h.subFamily.spouse.isDeceased}
                                                                maxLength={3}
                                                                onChange={(e) => {
                                                                    if (h.subFamily.spouse.isDeceased) return;
                                                                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                    const u = [...form.heirs];
                                                                    u[i].subFamily.spouse.age = value;
                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />

                                                        </HStack>
                                                    </FormControl>
                                                </HStack>

                                                <FormControl>
                                                    <FormLabel>{t("spouseRelation")}</FormLabel>

                                                    <Menu placement="bottom">
                                                        <MenuButton
                                                            as={Button}
                                                            size="lg"
                                                            bg="gray.100"
                                                            rightIcon={<ChevronDownIcon />}
                                                            textAlign="left"
                                                            width="100%"
                                                        >
                                                            {h.subFamily.spouse.relation
                                                                ? t(h.subFamily.spouse.relation)
                                                                : t("select")}
                                                        </MenuButton>

                                                        <MenuList maxH="250px" overflowY="auto">
                                                            {relationList.map((r) => (
                                                                <MenuItem
                                                                    key={r}
                                                                    onClick={() => {
                                                                        const u = JSON.parse(JSON.stringify(form.heirs)); // FIXED
                                                                        u[i].subFamily.spouse.relation = r;
                                                                        setForm({ ...form, heirs: u });
                                                                    }}
                                                                >
                                                                    {t(r)}
                                                                </MenuItem>
                                                            ))}
                                                        </MenuList>
                                                    </Menu>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>{t("spouseAliveDead")}</FormLabel>
                                                    <Select
                                                        size="lg"
                                                        bg="gray.100"
                                                        value={h.subFamily.spouse.isDeceased ? "dead" : "alive"}
                                                        onChange={(e) => {
                                                            const u = [...form.heirs];
                                                            const isDead = e.target.value === "dead";
                                                            u[i].subFamily.spouse.isDeceased = isDead;
                                                            u[i].subFamily.spouse.age = isDead
                                                                ? u[i].subFamily.spouse.dob && u[i].subFamily.spouse.dod
                                                                    ? calculateAgeAtDeath(
                                                                        u[i].subFamily.spouse.dob,
                                                                        u[i].subFamily.spouse.dod
                                                                    )
                                                                    : ""
                                                                : u[i].subFamily.spouse.dob
                                                                    ? calculateAge(u[i].subFamily.spouse.dob)
                                                                    : "";

                                                            setForm({ ...form, heirs: u });
                                                        }}

                                                    >
                                                        <option value="alive">{t("alive")}</option>
                                                        <option value="dead">{t("deceased")}</option>
                                                    </Select>
                                                </FormControl>

                                                {h.subFamily.spouse.isDeceased && (
                                                    <FormControl>
                                                        <FormLabel>{t("deathDate")}</FormLabel>

                                                        <HStack spacing={3} align="center">
                                                            <Input
                                                                type="text"
                                                                placeholder="DD/MM/YYYY"
                                                                size="lg"
                                                                bg="gray.100"
                                                                borderColor={fieldErrors[`spouse_${i}_dod`] ? "red.500" : "gray.200"}
                                                                value={h.subFamily.spouse.dodDisplay || ""}
                                                                onChange={(e) => {
                                                                    const display = formatDisplayDate(e.target.value);

                                                                    // clear red when editing
                                                                    setFieldErrors((p) => ({ ...p, [`spouse_${i}_dod`]: false }));

                                                                    if (display.length === 10 && !validateDob(display)) {
                                                                        showError(t("invalidDate"));
                                                                        return;
                                                                    }

                                                                    const iso = convertToISO(display);

                                                                    const u = structuredClone(form.heirs);
                                                                    u[i].subFamily.spouse.dodDisplay = display;
                                                                    u[i].subFamily.spouse.dod = iso;
                                                                    u[i].subFamily.spouse.age =
                                                                        u[i].subFamily.spouse.dob && iso
                                                                            ? calculateAgeAtDeath(u[i].subFamily.spouse.dob, iso)
                                                                            : "";

                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />

                                                            <Text fontWeight="bold" color="green.700">
                                                                {t("orText")}
                                                            </Text>

                                                            <Input
                                                                size="lg"
                                                                width="120px"
                                                                bg="gray.100"
                                                                value={h.subFamily.spouse.age || ""}
                                                                placeholder={t("age")}
                                                                onChange={(e) => {
                                                                    const v = e.target.value;
                                                                    if (v && !/^[0-9]{1,3}$/.test(v)) return;
                                                                    const u = [...form.heirs];
                                                                    u[i].subFamily.spouse.age = v;
                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />
                                                        </HStack>
                                                    </FormControl>
                                                )}
                                            </VStack>
                                        </Box>

                                        {/* CHILDREN SECTION */}
                                        <Box bg="gray.50" p={4} rounded="xl" borderWidth="1px" borderColor="gray.200">
                                            <Text fontWeight="600" mb={3} color="green.700">
                                                {t("childrenDetails")}
                                            </Text>

                                            {/* TOTAL CHILDREN */}
                                            <FormControl mb={3}>
                                                <FormLabel>{t("totalChildren")}</FormLabel>
                                                <Input
                                                    type="number"
                                                    size="lg"
                                                    bg="gray.100"
                                                    value={h.childCount}
                                                    onChange={(e) => {
                                                        const count = Number(e.target.value);
                                                        const u = [...form.heirs];
                                                        u[i].childCount = count;
                                                        u[i].subFamily.children = Array.from({ length: count }, () => ({
                                                            name: "",
                                                            age: "",
                                                            relation: "",
                                                            isDeceased: false
                                                        }));
                                                        setForm({ ...form, heirs: u });
                                                    }}
                                                    onWheel={(e) => e.target.blur()}

                                                />
                                            </FormControl>

                                            {/* RENDER CHILDREN */}
                                            {h.subFamily.children.map((child, ci) => (
                                                <Box
                                                    key={ci}
                                                    mt={3}
                                                    p={4}
                                                    rounded="lg"
                                                    borderWidth="1px"
                                                    borderColor="gray.300"
                                                    bg="white"
                                                >
                                                    <Text fontWeight="600" mb={2}>
                                                        {t("childNameWithNumber", { number: ci + 1 })}
                                                    </Text>

                                                    <VStack align="stretch" spacing={3}>
                                                        <FormControl>
                                                            <FormLabel>{t("childName")}</FormLabel>
                                                            <Input
                                                                size="lg"
                                                                bg="gray.100"
                                                                value={child.name}
                                                                onChange={(e) => {
                                                                    const u = [...form.heirs];
                                                                    u[i].subFamily.children[ci].name = e.target.value;
                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />
                                                        </FormControl>
                                                        {/* CHILD SPOUSE TOGGLE */}
                                                        <Button
                                                            size="xs"
                                                            colorScheme="green"
                                                            variant="outline"
                                                            rounded="full"
                                                            leftIcon={<ChevronDownIcon />}
                                                            onClick={() => {
                                                                const u = structuredClone(form.heirs);
                                                                u[i].subFamily.children[ci].showSpouse = !child.showSpouse;

                                                                // initialize blank spouse object
                                                                if (!u[i].subFamily.children[ci].spouse) {
                                                                    u[i].subFamily.children[ci].spouse = {
                                                                        name: "",
                                                                        age: "",
                                                                        relation: "",
                                                                        isDeceased: false
                                                                    };
                                                                }

                                                                setForm({ ...form, heirs: u });
                                                            }}
                                                        >
                                                            {child.showSpouse ? t("hideSpouse") : t("addSpouse")}
                                                        </Button>
                                                        {child.showSpouse && (
                                                            <Box mt={3} p={4} bg="green.50" rounded="xl" borderWidth="1px" borderColor="green.200">
                                                                <Text fontWeight="600" mb={3} color="green.700">
                                                                    {t("childSpouseDetails")}
                                                                </Text>

                                                                <VStack spacing={3} align="stretch">
                                                                    <FormControl>
                                                                        <FormLabel>{t("spouseName")}</FormLabel>
                                                                        <Input
                                                                            size="lg"
                                                                            bg="gray.100"
                                                                            value={child.spouse?.name || ""}
                                                                            onChange={(e) => {
                                                                                const u = structuredClone(form.heirs);
                                                                                u[i].subFamily.children[ci].spouse.name = e.target.value;
                                                                                setForm({ ...form, heirs: u });
                                                                            }}
                                                                        />
                                                                    </FormControl>

                                                                    <HStack spacing={3}>
                                                                        <FormControl>
                                                                            <FormLabel>{t("birthDateAge")}</FormLabel>

                                                                            <HStack spacing={3} align="center">

                                                                                {/* SPOUSE DOB */}
                                                                                <Input
                                                                                    type="text"
                                                                                    placeholder="DD/MM/YYYY"
                                                                                    size="lg"
                                                                                    bg="gray.100"
                                                                                    value={child.spouse?.dobDisplay || ""}
                                                                                    onChange={(e) => {
                                                                                        const display = formatDisplayDate(e.target.value);

                                                                                        // validate only when complete
                                                                                        if (display.length === 10 && !validateDob(display)) {
                                                                                            showError(t("invalidDate"));
                                                                                            return;
                                                                                        }

                                                                                        const iso = convertToISO(display);

                                                                                        const u = structuredClone(form.heirs);
                                                                                        u[i].subFamily.children[ci].spouse.dobDisplay = display;
                                                                                        u[i].subFamily.children[ci].spouse.dob = iso;
                                                                                        u[i].subFamily.children[ci].spouse.age =
                                                                                            u[i].subFamily.children[ci].spouse.isDeceased
                                                                                                ? u[i].subFamily.children[ci].spouse.dod
                                                                                                    ? calculateAgeAtDeath(
                                                                                                        iso,
                                                                                                        u[i].subFamily.children[ci].spouse.dod
                                                                                                    )
                                                                                                    : ""
                                                                                                : iso
                                                                                                    ? calculateAge(iso)
                                                                                                    : "";


                                                                                        setForm({ ...form, heirs: u });
                                                                                    }}
                                                                                />

                                                                                {/* OR TEXT */}
                                                                                <Text fontWeight="bold" color="green.700">
                                                                                    {t("orText")}
                                                                                </Text>

                                                                                {/* SPOUSE AGE - Unified */}
                                                                                <Input
                                                                                    size="lg"
                                                                                    width="120px"
                                                                                    bg="gray.100"
                                                                                    value={child.spouse?.isDeceased ? "" : (child.spouse?.age || "")}
                                                                                    isReadOnly={child.spouse?.isDeceased}
                                                                                    placeholder={t("age")}
                                                                                    maxLength={3}
                                                                                    onChange={(e) => {
                                                                                        if (child.spouse?.isDeceased) return;
                                                                                        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                                        const u = structuredClone(form.heirs);
                                                                                        u[i].subFamily.children[ci].spouse.age = value;
                                                                                        setForm({ ...form, heirs: u });
                                                                                    }}
                                                                                />
                                                                            </HStack>
                                                                        </FormControl>
                                                                    </HStack>

                                                                    <FormControl>
                                                                        <FormLabel>{t("relation")}</FormLabel>

                                                                        <Menu placement="bottom">
                                                                            <MenuButton
                                                                                as={Button}
                                                                                size="lg"
                                                                                bg="gray.100"
                                                                                rightIcon={<ChevronDownIcon />}
                                                                                textAlign="left"
                                                                                width="100%"
                                                                            >
                                                                                {child.spouse?.relation ? t(child.spouse.relation) : t("select")}
                                                                            </MenuButton>

                                                                            <MenuList maxH="250px" overflowY="auto">
                                                                                {relationList.map((r) => (
                                                                                    <MenuItem
                                                                                        key={r}
                                                                                        onClick={() => {
                                                                                            const u = structuredClone(form.heirs);
                                                                                            u[i].subFamily.children[ci].spouse.relation = r; // ← UPDATED
                                                                                            setForm({ ...form, heirs: u });
                                                                                        }}
                                                                                    >
                                                                                        {t(r)}
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </MenuList>
                                                                        </Menu>
                                                                    </FormControl>



                                                                    <FormControl>
                                                                        <FormLabel>{t("aliveDead")}</FormLabel>
                                                                        <Select
                                                                            size="lg"
                                                                            bg="gray.100"
                                                                            value={child.spouse?.isDeceased ? "dead" : "alive"}
                                                                            onChange={(e) => {
                                                                                const u = structuredClone(form.heirs);
                                                                                const isDead = e.target.value === "dead";

                                                                                u[i].subFamily.children[ci].spouse.isDeceased = isDead;
                                                                                u[i].subFamily.children[ci].spouse.age = isDead
                                                                                    ? u[i].subFamily.children[ci].spouse.dob &&
                                                                                        u[i].subFamily.children[ci].spouse.dod
                                                                                        ? calculateAgeAtDeath(
                                                                                            u[i].subFamily.children[ci].spouse.dob,
                                                                                            u[i].subFamily.children[ci].spouse.dod
                                                                                        )
                                                                                        : ""
                                                                                    : u[i].subFamily.children[ci].spouse.dob
                                                                                        ? calculateAge(u[i].subFamily.children[ci].spouse.dob)
                                                                                        : "";

                                                                                setForm({ ...form, heirs: u });
                                                                            }}

                                                                        >
                                                                            <option value="alive">{t("alive")}</option>
                                                                            <option value="dead">{t("deceased")}</option>
                                                                        </Select>
                                                                    </FormControl>

                                                                    {child.spouse?.isDeceased && (
                                                                        <FormControl>
                                                                            <FormLabel>{t("deathDate")}</FormLabel>

                                                                            <HStack spacing={3} align="center">
                                                                                <Input
                                                                                    type="text"
                                                                                    placeholder="DD/MM/YYYY"
                                                                                    size="lg"
                                                                                    bg="gray.100"
                                                                                    value={child.spouse?.dodDisplay || ""}
                                                                                    onChange={(e) => {
                                                                                        const display = formatDisplayDate(e.target.value);

                                                                                        // validate only when complete
                                                                                        if (display.length === 10 && !validateDob(display)) {
                                                                                            showError(t("invalidDate"));
                                                                                            return;
                                                                                        }

                                                                                        const iso = convertToISO(display);

                                                                                        const u = structuredClone(form.heirs);
                                                                                        u[i].subFamily.children[ci].spouse.dodDisplay = display;
                                                                                        u[i].subFamily.children[ci].spouse.dod = iso;
                                                                                        u[i].subFamily.children[ci].spouse.age =
                                                                                            u[i].subFamily.children[ci].spouse.dob && iso
                                                                                                ? calculateAgeAtDeath(
                                                                                                    u[i].subFamily.children[ci].spouse.dob,
                                                                                                    iso
                                                                                                )
                                                                                                : "";

                                                                                        setForm({ ...form, heirs: u });
                                                                                    }}
                                                                                />

                                                                                <Text fontWeight="bold" color="green.700">
                                                                                    {t("orText")}
                                                                                </Text>

                                                                                <Input
                                                                                    size="lg"
                                                                                    width="120px"
                                                                                    bg="gray.100"
                                                                                    value={child.spouse?.age || ""}
                                                                                    placeholder={t("age")}
                                                                                    maxLength={3}
                                                                                    onChange={(e) => {
                                                                                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                                        const u = structuredClone(form.heirs);
                                                                                        u[i].subFamily.children[ci].spouse.age = v;
                                                                                        setForm({ ...form, heirs: u });
                                                                                    }}
                                                                                />
                                                                            </HStack>
                                                                        </FormControl>
                                                                    )}

                                                                    {/* GRANDCHILDREN SECTION */}
                                                                    <Box
                                                                        bg="yellow.50"
                                                                        p={4}
                                                                        rounded="xl"
                                                                        borderWidth="1px"
                                                                        borderColor="yellow.300"
                                                                        mt={4}
                                                                    >
                                                                        <Text fontWeight="600" mb={3} color="yellow.700">
                                                                            {t("grandchildren")} {/* if needed add a key */}
                                                                        </Text>

                                                                        {/* TOTAL GRANDCHILDREN */}
                                                                        <FormControl mb={3}>
                                                                            <FormLabel>{t("totalChildren")}</FormLabel>
                                                                            <Input
                                                                                type="number"
                                                                                size="lg"
                                                                                bg="gray.100"
                                                                                value={child.grandCount || 0}
                                                                                onChange={(e) => {
                                                                                    const count = Number(e.target.value);
                                                                                    const u = structuredClone(form.heirs);

                                                                                    u[i].subFamily.children[ci].grandCount = count;

                                                                                    u[i].subFamily.children[ci].children = Array.from(
                                                                                        { length: count },
                                                                                        () => ({
                                                                                            name: "",
                                                                                            relation: "",
                                                                                            age: "",
                                                                                            dob: "",
                                                                                            dobDisplay: "",
                                                                                            isDeceased: false,
                                                                                            spouse: {
                                                                                                name: "",
                                                                                                age: "",
                                                                                                relation: "",
                                                                                                isDeceased: false
                                                                                            },
                                                                                            children: []
                                                                                        })
                                                                                    );

                                                                                    setForm({ ...form, heirs: u });
                                                                                }}
                                                                                onWheel={(e) => e.target.blur()}

                                                                            />
                                                                        </FormControl>

                                                                        {/* RENDER EACH GRANDCHILD */}
                                                                        {child.children?.map((gc, gi) => (
                                                                            <Box
                                                                                key={gi}
                                                                                mt={3}
                                                                                p={4}
                                                                                rounded="lg"
                                                                                borderWidth="1px"
                                                                                borderColor="gray.300"
                                                                                bg="white"
                                                                            >
                                                                                <Text fontWeight="600" mb={2}>
                                                                                    {t("childNameWithNumber", { number: gi + 1 })}
                                                                                </Text>

                                                                                <VStack spacing={3} align="stretch">

                                                                                    {/* NAME */}
                                                                                    <FormControl>
                                                                                        <FormLabel>{t("name")}</FormLabel>
                                                                                        <Input
                                                                                            size="lg"
                                                                                            bg="gray.100"
                                                                                            value={gc.name}
                                                                                            onChange={(e) => {
                                                                                                const u = structuredClone(form.heirs);
                                                                                                u[i].subFamily.children[ci].children[gi].name =
                                                                                                    e.target.value;
                                                                                                setForm({ ...form, heirs: u });
                                                                                            }}
                                                                                        />
                                                                                    </FormControl>

                                                                                    {/* RELATION DROPDOWN */}
                                                                                    {/* RELATION DROPDOWN */}
                                                                                    <FormControl>
                                                                                        <FormLabel>{t("relation")}</FormLabel>
                                                                                        <Menu>
                                                                                            <MenuButton
                                                                                                as={Button}
                                                                                                size="lg"
                                                                                                bg="gray.100"
                                                                                                width="100%"
                                                                                                rightIcon={<ChevronDownIcon />}
                                                                                                textAlign="left"
                                                                                            >
                                                                                                {gc.relation ? t(gc.relation) : t("select")}
                                                                                            </MenuButton>

                                                                                            <MenuList maxH="250px" overflowY="auto">
                                                                                                {relationList.map((r) => (
                                                                                                    <MenuItem
                                                                                                        key={r}
                                                                                                        onClick={() => {
                                                                                                            const u = structuredClone(form.heirs);
                                                                                                            u[i].subFamily.children[ci].children[gi].relation = r;
                                                                                                            setForm({ ...form, heirs: u });
                                                                                                        }}
                                                                                                    >
                                                                                                        {t(r)}
                                                                                                    </MenuItem>
                                                                                                ))}
                                                                                            </MenuList>
                                                                                        </Menu>
                                                                                    </FormControl>


                                                                                    {/* DOB + AGE */}
                                                                                    <FormControl>
                                                                                        <FormLabel>{t("birthDateAge")}</FormLabel>

                                                                                        <HStack spacing={3} align="center">

                                                                                            {/* GRANDCHILD DOB */}
                                                                                            <Input
                                                                                                type="text"
                                                                                                placeholder="DD/MM/YYYY"
                                                                                                size="lg"
                                                                                                bg="gray.100"
                                                                                                borderColor={fieldErrors[`grand_${i}_${ci}_${gi}_dob`] ? "red.500" : "gray.200"}
                                                                                                value={gc.dobDisplay || ""}
                                                                                                onChange={(e) => {
                                                                                                    const display = formatDisplayDate(e.target.value);

                                                                                                    // Validate only when full length
                                                                                                    // clear red when editing
                                                                                                    setFieldErrors((p) => ({ ...p, [`grand_${i}_${ci}_${gi}_dob`]: false }));

                                                                                                    if (display.length === 10 && !validateDob(display)) {
                                                                                                        console.log("invalid dob");
                                                                                                        showError(t("invalidDate"));
                                                                                                        return;
                                                                                                    }

                                                                                                    const iso = convertToISO(display);

                                                                                                    const u = structuredClone(form.heirs);
                                                                                                    u[i].subFamily.children[ci].children[gi].dobDisplay = display;
                                                                                                    u[i].subFamily.children[ci].children[gi].dob = iso;
                                                                                                    u[i].subFamily.children[ci].children[gi].age =
                                                                                                        u[i].subFamily.children[ci].children[gi].isDeceased
                                                                                                            ? u[i].subFamily.children[ci].children[gi].dob &&
                                                                                                                u[i].subFamily.children[ci].children[gi].dod
                                                                                                                ? calculateAgeAtDeath(
                                                                                                                    iso,
                                                                                                                    u[i].subFamily.children[ci].children[gi].dod
                                                                                                                )
                                                                                                                : ""
                                                                                                            : iso
                                                                                                                ? calculateAge(iso)
                                                                                                                : "";


                                                                                                    setForm({ ...form, heirs: u });
                                                                                                }}
                                                                                            />

                                                                                            {/* OR TEXT */}
                                                                                            <Text fontWeight="bold" color="green.700">
                                                                                                {t("orText")}
                                                                                            </Text>

                                                                                            {/* MANUAL AGE INPUT - Unified */}
                                                                                            <Input
                                                                                                size="lg"
                                                                                                width="120px"
                                                                                                bg="gray.100"
                                                                                                placeholder={t("age")}
                                                                                                value={gc.isDeceased ? "" : gc.age}
                                                                                                isReadOnly={gc.isDeceased}
                                                                                                maxLength={3}
                                                                                                onChange={(e) => {
                                                                                                    if (gc.isDeceased) return;
                                                                                                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                                                    const u = structuredClone(form.heirs);
                                                                                                    u[i].subFamily.children[ci].children[gi].age = value;
                                                                                                    setForm({ ...form, heirs: u });
                                                                                                }}
                                                                                            />

                                                                                        </HStack>
                                                                                    </FormControl>

                                                                                    {/* ALIVE / DEAD */}
                                                                                    <FormControl>
                                                                                        <FormLabel>{t("aliveDead")}</FormLabel>
                                                                                        <Select
                                                                                            size="lg"
                                                                                            bg="gray.100"
                                                                                            value={gc.isDeceased ? "dead" : "alive"}
                                                                                            onChange={(e) => {
                                                                                                const u = structuredClone(form.heirs);
                                                                                                const isDead = e.target.value === "dead";
                                                                                                u[i].subFamily.children[ci].children[gi].isDeceased = isDead;
                                                                                                u[i].subFamily.children[ci].children[gi].age = isDead
                                                                                                    ? u[i].subFamily.children[ci].children[gi].dob &&
                                                                                                        u[i].subFamily.children[ci].children[gi].dod
                                                                                                        ? calculateAgeAtDeath(
                                                                                                            u[i].subFamily.children[ci].children[gi].dob,
                                                                                                            u[i].subFamily.children[ci].children[gi].dod
                                                                                                        )
                                                                                                        : ""
                                                                                                    : u[i].subFamily.children[ci].children[gi].dob
                                                                                                        ? calculateAge(u[i].subFamily.children[ci].children[gi].dob)
                                                                                                        : "";

                                                                                                setForm({ ...form, heirs: u });
                                                                                            }}
                                                                                        >
                                                                                            <option value="alive">{t("alive")}</option>
                                                                                            <option value="dead">{t("deceased")}</option>
                                                                                        </Select>
                                                                                    </FormControl>

                                                                                    {gc.isDeceased && (
                                                                                        <FormControl>
                                                                                            <FormLabel>{t("deathDate")}</FormLabel>

                                                                                            <HStack>
                                                                                                <Input
                                                                                                    type="text"
                                                                                                    placeholder="DD/MM/YYYY"
                                                                                                    size="lg"
                                                                                                    bg="gray.100"
                                                                                                    borderColor={fieldErrors[`grand_${i}_${ci}_${gi}_dod`] ? "red.500" : "gray.200"}
                                                                                                    value={gc.dodDisplay || ""}
                                                                                                    onChange={(e) => {
                                                                                                        const display = formatDisplayDate(e.target.value);

                                                                                                        // clear red when editing
                                                                                                        setFieldErrors((p) => ({ ...p, [`grand_${i}_${ci}_${gi}_dod`]: false }));

                                                                                                        if (display.length === 10 && !validateDob(display)) {
                                                                                                            showError(t("invalidDate"));
                                                                                                            return;
                                                                                                        }

                                                                                                        const iso = convertToISO(display);

                                                                                                        const u = structuredClone(form.heirs);
                                                                                                        u[i].subFamily.children[ci].children[gi].dodDisplay = display;
                                                                                                        u[i].subFamily.children[ci].children[gi].dod = iso;
                                                                                                        u[i].subFamily.children[ci].children[gi].age =
                                                                                                            u[i].subFamily.children[ci].children[gi].dob && iso
                                                                                                                ? calculateAgeAtDeath(
                                                                                                                    u[i].subFamily.children[ci].children[gi].dob,
                                                                                                                    iso
                                                                                                                )
                                                                                                                : "";

                                                                                                        setForm({ ...form, heirs: u });
                                                                                                    }}
                                                                                                />

                                                                                                <Text fontWeight="bold" color="green.700">
                                                                                                    {t("orText")}
                                                                                                </Text>

                                                                                                <Input
                                                                                                    size="lg"
                                                                                                    width="120px"
                                                                                                    bg="gray.100"
                                                                                                    value={gc.age || ""}
                                                                                                    placeholder={t("age")}
                                                                                                    maxLength={3}
                                                                                                    onChange={(e) => {
                                                                                                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                                                        const u = structuredClone(form.heirs);
                                                                                                        u[i].subFamily.children[ci].children[gi].age = v;
                                                                                                        setForm({ ...form, heirs: u });
                                                                                                    }}
                                                                                                />
                                                                                            </HStack>
                                                                                        </FormControl>
                                                                                    )}

                                                                                </VStack>
                                                                            </Box>
                                                                        ))}
                                                                    </Box>

                                                                </VStack>
                                                            </Box>
                                                        )}

                                                        {/* <FormControl>
                                                            <FormLabel>{t("relation")}</FormLabel>

                                                            <Menu>
                                                                <MenuButton
                                                                    as={Button}
                                                                    size="lg"
                                                                    bg="gray.100"
                                                                    width="100%"
                                                                    rightIcon={<ChevronDownIcon />}
                                                                    textAlign="left"
                                                                >
                                                                    {gc.relation ? t(gc.relation) : t("select")}
                                                                </MenuButton>

                                                                <MenuList maxH="250px" overflowY="auto">
                                                                    {relationList.map((r) => (
                                                                        <MenuItem
                                                                            key={r}
                                                                            onClick={() => {
                                                                                const u = structuredClone(form.heirs);
                                                                                u[i].subFamily.children[ci].children[gi].relation = r;
                                                                                setForm({ ...form, heirs: u });
                                                                            }}
                                                                        >
                                                                            {t(r)}
                                                                        </MenuItem>
                                                                    ))}
                                                                </MenuList>
                                                            </Menu>
                                                        </FormControl> */}
                                                        <FormControl>
                                                            <FormLabel>{t("relation")}</FormLabel>
                                                            <Menu>
                                                                <MenuButton
                                                                    as={Button}
                                                                    size="lg"
                                                                    bg="gray.100"
                                                                    width="100%"
                                                                    rightIcon={<ChevronDownIcon />}
                                                                    textAlign="left"
                                                                >
                                                                    {child.relation ? t(child.relation) : t("select")}
                                                                </MenuButton>

                                                                <MenuList maxH="250px" overflowY="auto">
                                                                    {relationList.map((r) => (
                                                                        <MenuItem
                                                                            key={r}
                                                                            onClick={() => {
                                                                                const u = structuredClone(form.heirs);
                                                                                u[i].subFamily.children[ci].relation = r;
                                                                                setForm({ ...form, heirs: u });
                                                                            }}
                                                                        >
                                                                            {t(r)}
                                                                        </MenuItem>
                                                                    ))}
                                                                </MenuList>
                                                            </Menu>
                                                        </FormControl>
                                                        <HStack spacing={3}>
                                                            <FormControl>
                                                                <FormLabel>{t("birthDateAge")}</FormLabel>

                                                                <HStack spacing={3} align="center">

                                                                    {/* CHILD DOB */}
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="DD/MM/YYYY"
                                                                        size="lg"
                                                                        bg="gray.100"
                                                                        borderColor={fieldErrors[`child_${i}_${ci}_dob`] ? "red.500" : "gray.200"}
                                                                        value={child.dobDisplay || ""}
                                                                        onChange={(e) => {
                                                                            const display = formatDisplayDate(e.target.value);

                                                                            // clear red when editing
                                                                            setFieldErrors((p) => ({ ...p, [`child_${i}_${ci}_dob`]: false }));

                                                                            // Validate only when full length
                                                                            if (display.length === 10 && !validateDob(display)) {
                                                                                showError(t("invalidDate"));
                                                                                return;
                                                                            }

                                                                            const iso = convertToISO(display);

                                                                            const u = structuredClone(form.heirs);
                                                                            u[i].subFamily.children[ci].dobDisplay = display;
                                                                            u[i].subFamily.children[ci].dob = iso;
                                                                            u[i].subFamily.children[ci].age =
                                                                                u[i].subFamily.children[ci].isDeceased &&
                                                                                    u[i].subFamily.children[ci].dod
                                                                                    ? calculateAgeAtDeath(
                                                                                        iso,
                                                                                        u[i].subFamily.children[ci].dod
                                                                                    )
                                                                                    : iso
                                                                                        ? calculateAge(iso)
                                                                                        : "";



                                                                            setForm({ ...form, heirs: u });
                                                                        }}
                                                                    />

                                                                    {/* OR TEXT */}
                                                                    <Text fontWeight="bold" color="green.700">
                                                                        {t("orText")}
                                                                    </Text>

                                                                    {/* CHILD AGE - Unified */}
                                                                    <Input
                                                                        size="lg"
                                                                        width="120px"
                                                                        bg="gray.100"
                                                                        placeholder={t("age")}
                                                                        value={child.isDeceased ? "" : child.age}
                                                                        isReadOnly={child.isDeceased}
                                                                        maxLength={3}
                                                                        onChange={(e) => {
                                                                            if (child.isDeceased) return;
                                                                            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                            const u = structuredClone(form.heirs);
                                                                            u[i].subFamily.children[ci].age = value;
                                                                            setForm({ ...form, heirs: u });
                                                                        }}
                                                                    />
                                                                </HStack>
                                                            </FormControl>
                                                        </HStack>

                                                        <FormControl>
                                                            <FormLabel>{t("aliveDead")}</FormLabel>
                                                            <Select
                                                                size="lg"
                                                                bg="gray.100"
                                                                value={child.isDeceased ? "dead" : "alive"}
                                                                onChange={(e) => {
                                                                    const u = structuredClone(form.heirs);
                                                                    const isDead = e.target.value === "dead";
                                                                    u[i].subFamily.children[ci].isDeceased = isDead;
                                                                    u[i].subFamily.children[ci].age = isDead
                                                                        ? u[i].subFamily.children[ci].dob &&
                                                                            u[i].subFamily.children[ci].dod
                                                                            ? calculateAgeAtDeath(
                                                                                u[i].subFamily.children[ci].dob,
                                                                                u[i].subFamily.children[ci].dod
                                                                            )
                                                                            : ""
                                                                        : u[i].subFamily.children[ci].dob
                                                                            ? calculateAge(u[i].subFamily.children[ci].dob)
                                                                            : "";

                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            >
                                                                <option value="alive">{t("alive")}</option>
                                                                <option value="dead">{t("deceased")}</option>
                                                            </Select>
                                                        </FormControl>

                                                        {child.isDeceased && (
                                                            <FormControl>
                                                                <FormLabel>{t("deathDate")}</FormLabel>
                                                                <HStack>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="DD/MM/YYYY"
                                                                        size="lg"
                                                                        bg="gray.100"
                                                                        borderColor={fieldErrors[`child_${i}_${ci}_dod`] ? "red.500" : "gray.200"}
                                                                        value={child.dodDisplay || ""}
                                                                        onChange={(e) => {
                                                                            const display = formatDisplayDate(e.target.value);

                                                                            // clear red when editing
                                                                            setFieldErrors((p) => ({ ...p, [`child_${i}_${ci}_dod`]: false }));

                                                                            if (display.length === 10 && !validateDob(display)) {
                                                                                showError(t("invalidDate"));
                                                                                return;
                                                                            }

                                                                            const iso = convertToISO(display);

                                                                            const u = structuredClone(form.heirs);
                                                                            u[i].subFamily.children[ci].dodDisplay = display;
                                                                            u[i].subFamily.children[ci].dod = iso;
                                                                            u[i].subFamily.children[ci].age =
                                                                                u[i].subFamily.children[ci].dob && iso
                                                                                    ? calculateAgeAtDeath(
                                                                                        u[i].subFamily.children[ci].dob,
                                                                                        iso
                                                                                    )
                                                                                    : "";

                                                                            setForm({ ...form, heirs: u });
                                                                        }}
                                                                    />
                                                                    <Input
                                                                        size="lg"
                                                                        width="120px"
                                                                        bg="gray.100"
                                                                        value={child.age || ""}
                                                                        placeholder={t("age")}
                                                                        maxLength={3}
                                                                        onChange={(e) => {
                                                                            const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                                            const u = structuredClone(form.heirs);
                                                                            u[i].subFamily.children[ci].age = v;
                                                                            setForm({ ...form, heirs: u });
                                                                        }}
                                                                    />
                                                                </HStack>

                                                            </FormControl>
                                                        )}
                                                    </VStack>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}


                            </VStack>
                        </Box>
                    ))}

                    <Divider my={6} />





                    <HStack mt={6}>
                        <Button
                            size="lg"
                            variant="outline"
                            colorScheme="green"
                            width="50%"
                            rounded="xl"
                            onClick={() => setStep(1)}
                        >
                            {t("back")}
                        </Button>

                        <Button
                            size="lg"
                            colorScheme="green"
                            width="50%"
                            rounded="xl"
                            onClick={handleSave}
                        >
                            {t("save")}
                        </Button>
                    </HStack>

                </Box>
            )}

        </Box>
    );
}   