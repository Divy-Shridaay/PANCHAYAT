import React, { createContext, useContext, useState } from "react";
import { lightTheme } from "../../styles/style";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
	const [theme, setTheme] = useState("light");

	const updateTheme = (value) => {
		setTheme(value);
	};

	const getStyles = (attributeNames) => {
		let temp = [];
		if (!Array.isArray(attributeNames)) {
			temp.push(attributeNames);
		} else temp = attributeNames;

		const themeData = theme === "light" ? lightTheme : darkTheme;

		return temp.reduce((current, key) => {
			if (current && key in current) {
				return current[key];
			}
			throw new Error(`Invalid path: ${key} does not exist in the theme`);
		}, themeData);
	};

	return (
		<ThemeContext.Provider value={{ theme, updateTheme, getStyles }}>
			{children}
		</ThemeContext.Provider>
	);
}