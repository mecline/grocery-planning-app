
export const textColor = '#c8541a';
export const backgroundColor = '#f7cfaa';

export default function MealPlannerTheme(theme) {
  return {
    toolbar: {
      fontWeight: 'bold',
      color: textColor,
      backgroundColor: backgroundColor,
      justifyContent: 'center'
    },
    homePage: {
      margin: '25px'
    },
    addButton: {
      size: '20px',
      color: textColor
    },
    squareButton: {
      color: textColor,
      backgroundColor: backgroundColor
    },
    categoryName: {
      fontWeight: 'bold',
      fontSize: 'large'
    },
    ingredientName: {
      paddingRight: '5px',
      display: 'inline-block'
    },
    notesText: {
      fontStyle: 'italic',
      display: 'inline-block'
    },
    linkStyle: {
      color: textColor,
      paddingRight: '5px',
      display: 'inline-block',
      right: 0,
      textDecorationLine: 'none'
    },
    divider: {
      background: textColor,
      minHeight: 'inherit',
      width: '2px',
      margin: '0px 5px'
    }
  }
};