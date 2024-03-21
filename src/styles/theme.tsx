export const colors = {
  bg: "#EEEfE8",
  text: '#1A1919FF',
  textCompleted: "#B2B1B1FF",
  accent: '#E88853',
  accentStrong: '#E36513',
  warning: '#da544a',
}

export const typography = {
  taskText: {
    fontFamily: 'Haas-Medium',
    fontSize: 54,
    lineHeight: 49,
    letterSpacing: -0.54,
    paddingHorizontal: 10,
  },
}

export const devStyle = {
  border: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#706C6C',
  }
}

export const theme = {
  colors,
  typography
}


// type ThemeProviderProps = {
//   children: React.ReactNode
// }
//
// export const ThemeContext = React.createContext({theme, toggleTheme: () => {}})
//
// export const ThemeProvider = ({children}: ThemeProviderProps) => {
//   const [theme, setTheme] = React.useState("light")
//
//   const toggleTheme = useCallback(() => {
//     setTheme(theme === "light" ? "dark" : "light")
//   }, [theme])
//
//   // const ThemeContext = useMemo(() => React.createContext({theme, toggleTheme}), [theme])
//
//   return (
//     <ThemeContext.Provider value={{theme, toggleTheme}}>
//       {children}
//   </ThemeContext.Provider>
//   )
// }
