import { styled } from "@mui/system";
import { Toolbar, Button, Container } from '@mui/material';
import { AddBox } from '@mui/icons-material';

// export const textColor = '#c8541a';                   //ORANGE
// export const backgroundColor = '#f7cfaa';

// export const backgroundColor = '#7fbb0d';             // GREEN COLOR PICKED
export const backgroundColor = '#acde85';
export const textColor = '#0b6375';

// export const textColor = '#0b6375';                    //GREEN
// export const backgroundColor = '#9bc687';

export const StyledToolbar = styled(Toolbar, {})({
  fontWeight: 'bold',
  color: textColor,
  backgroundColor: backgroundColor,
  justifyContent: 'center'
});

export const StyledAddBox = styled(AddBox, {})({
  size: '20px',
  color: textColor
});

export const StyledSquareButton = styled(Button, {})({
  color: textColor,
  backgroundColor: backgroundColor
});

export const StyledContainer = styled(Container, {})({
  borderRadius: '10px',
  width: 'fit-content',
  backgroundColor: 'white'
});

export default function MealPlannerTheme(theme) {
  return {
    // toolbar: {
    //   fontWeight: 'bold',
    //   color: textColor,
    //   backgroundColor: backgroundColor,
    //   justifyContent: 'center'
    // },
    homePage: {
      margin: '25px'
    },
    // addButton: {
    //   size: '20px',
    //   color: textColor
    // },
    // squareButton: {
    //   color: textColor,
    //   backgroundColor: backgroundColor
    // },
    // categoryName: {
    //   fontWeight: 'bold',
    //   fontSize: 'large'
    // },
    // ingredientName: {
    //   paddingRight: '5px',
    //   display: 'inline-block'
    // },
    // notesText: {
    //   fontStyle: 'italic',
    //   display: 'inline-block'
    // },
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