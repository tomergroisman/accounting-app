import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      }
    },
    direction: 'rtl',
    palette: {
        primary: {
          light: "#b3e0ff",
          main: "#008ae6"
        },
        secondary: {
          light: "#ffa899",
          main: "#E62400"
        },
        edit: {
          light: "#ffe066",
          main: "#ffcc00"
        },
        background: {
          light: '#F1F1F1',
          main: '#ebeff4',
          dark: '#D0DBE6',
        },
        expense: {
          main: '#ff9999',
          dark: '#ff3333'
        },
        income: {
          main: '#33cc33',
          dark: '#29a329',
        },
      },
      typography: {
        fontFamily: `'Assistant', sans-serif`
      }
    
})

export default theme;