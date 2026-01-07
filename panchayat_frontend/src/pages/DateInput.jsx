import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { AiOutlineCalendar } from "react-icons/ai";

/* ================= Gujarati → English Digits ================= */
const gujaratiToEnglishDigits = (str) => {
  if (!str) return str;

  const guj = "૦૧૨૩૪૫૬૭૮૯";
  const eng = "0123456789";

  let result = str;
  for (let i = 0; i < guj.length; i++) {
    result = result.split(guj[i]).join(eng[i]);
  }

  return result;
};

const DateInput = ({
  label,
  formValue,
  setFormValue,
  value,
  name,
  onDateChange,
  formatDisplayDate,
  convertToISO,
  t,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  /* ================= Get Display Value ================= */
  const getValue = () => {
    if (formValue) return formValue.dateDisplay || "";
    return value || "";
  };

  /* ================= Update Value ================= */
  const updateValue = (displayDate, isoDate) => {
    if (formValue && setFormValue) {
      setFormValue((prev) => ({
        ...prev,
        dateDisplay: displayDate,
        date: isoDate,
      }));
    }

    if (onDateChange && name) {
      onDateChange(name, displayDate);
    }
  };

  /* ================= Selected Date for Picker ================= */
  const selectedDate = (() => {
    const val = formValue ? formValue.date : value;
    return val && !isNaN(new Date(val).getTime()) ? new Date(val) : null;
  })();

  /* ================= Manual Input Handler ================= */
 const handleManualInput = (e) => {
  const raw = e.target.value || "";

  // clear
  if (raw.trim() === "") {
    updateValue("", "");
    return;
  }

  // Gujarati → English digits
  const converted = gujaratiToEnglishDigits(raw);

  // format DD/MM/YYYY
  const display = formatDisplayDate(converted);

  // ✅ validate ONLY when full date entered
  if (display.length === 10) {
    const iso = convertToISO(display);

    if (iso) {
      const enteredDate = new Date(iso);
      const today = new Date();

      // normalize both
      enteredDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // ❌ block future date only
      if (enteredDate > today) {
        return;
      }

      updateValue(display, iso);
      return;
    }
  }

  // ⏳ allow partial typing
  updateValue(display, "");
};


  return (
    <FormControl isRequired w="100%">
      <FormLabel fontWeight="600">{label || t("date")}</FormLabel>

      <InputGroup w="100%">
        <Input
          placeholder="DD/MM/YYYY"
          size="lg"
          bg="gray.100"
          value={getValue()}
          onChange={handleManualInput}
          onFocus={() => setIsPickerOpen(true)}
          w={{
            base: "100%",
            sm: "120%",
            md: "650px",
            lg: "780px",
            xl: "780px",
            "2xl": "820px",
          }}
        />

        <InputRightElement
          pointerEvents="auto"
          cursor="pointer"
          onClick={() => setIsPickerOpen(!isPickerOpen)}
        >
          <Icon as={AiOutlineCalendar} color="gray.500" boxSize={5} />
        </InputRightElement>
      </InputGroup>

      {/* ================= DatePicker ================= */}
      {isPickerOpen && (
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            if (!date) return;

            const dd = String(date.getDate()).padStart(2, "0");
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yyyy = date.getFullYear();

            const display = `${dd}/${mm}/${yyyy}`;
            const iso = `${yyyy}-${mm}-${dd}`;

            updateValue(display, iso);
            setIsPickerOpen(false);
          }}
          onClickOutside={() => setIsPickerOpen(false)}
          inline
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}   // ✅ FUTURE DATE DISABLED
        />
      )}
    </FormControl>
  );
};

export default DateInput;
