export const colors = {
  black: '#2E2E2E',
  white: '#C0C0C0',
  gray: '#999999',
  barkBlue: '#1f3359',
  orange: '#E09200',
  blue: '#106DA4',
  yellow: '#E0D73A',
  lightBlue: '#A8B9BF',

  red: '#E36134',
}
export type Colors = typeof colors

const theme = {
  dark: {
    bgColor: colors.black,
    fgColor: colors.white,
  },
  light: {
    bgColor: colors.white,
    fgColor: colors.black,
  },
  contentPadding: '5px',
}

export default theme
export type Theme = typeof theme
