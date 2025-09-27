export const colors = {
    brown: '#6E4213',
    beige: '#C19B6C',
    gray: '#999999',
    red: '#FF0000',
  } as const;

  export const tailwindColors = {
    extend: {
      colors: {
        primary: colors.brown,
        secondary: colors.beige,
        gray: colors.gray,
        warning: colors.red,
      }
    }
  };