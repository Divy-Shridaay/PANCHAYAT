export const lightTheme = {
  buttons: {
    primary: {
      size: "sm",
      colorScheme: "teal",
      borderRadius: 0,
      boxShadow:
        "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 1px rgba(16, 24, 40, 0.1)",
    },
    secondary: {
      bgColor: "black",
      color: "white",
      _hover: { bgColor: "white", color: "black" },
      size: "sm",
    },
    outline: {
      colorScheme: "red",
      size: "sm",
      variant: "outline",
    },
    menu: {
      size: "sm",
      colorScheme: "teal",
      variant: "outline",
      bgColor: "white",
      borderRadius: 0,
      boxShadow:
        "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 1px rgba(16, 24, 40, 0.1)",
    }
    // Users can keep adding their own styles
  },

  iconButtons: {
    primary: {
      size: "xs",
      bgColor: "#4C585B",
      color: "white",
      _hover: { bgColor: "" },
    },
    secondary: {
      bgColor: "#BA922F",
      color: "black",
      _hover: { bgColor: "" },
      size: "xs",
    },
    outline: {
      colorScheme: "red",
      size: "xs",
      variant: "outline",
    },
  },

  inputs: {
    primary: {
      size: "sm",
      color: "black",
      borderRadius: "md",
      borderColor: "#DCDCDC",
      focusBorderColor: "#1E1E1E",
    },
  },

  heading: {
    color: "#ffffff",
    as: "h6",
    size: "xs",
    textAlign: "left",
  },

  select: {
    colorScheme: "blackAlpha",
    size: { base: "xs", md: "sm" },
    borderRadius: "md",
    borderColor: "#DCDCDC",
    focusBorderColor: "#1E1E1E",
    color: "#1E1E1E",
    options: {
      color: "black",
    },
  },

  multiSelect: {
    size: "xs",
    bg: "transparent",
    _hover: { bgColor: "" },
    _active: { border: "1px solid black" },
  },

  form: {
    label: {
      fontSize: "14px",
      color: "#1E1E1E",
      noOfLines: 1,
    },

    helperText: {
      fontSize: "12px",
      color: "#585858",
    },

    errorText: {
      fontSize: "12px",
      color: "#FF0000",
    },
  },

  stepper: {
    size: { base: "md", md: "md" },
    position: "sticky",
    top: -3,
    bg: "#EBEBEB",
    colorScheme: "red",
    zIndex: 1,
    color: "black",
    p: 2,
    borderRadius: "md",
    stepSeparator: {
      bgColor: "#4C585B",
    },
    stepIndicator: {
      borderColor: "#4C585B",
    },
  },
};
  
  export const darkTheme = {};
  