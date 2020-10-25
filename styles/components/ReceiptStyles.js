import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    table: {
    },
    tableHead: {
      fontWeight: 'bold'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        '& svg': {
            cursor: 'pointer'
        }
    },
    newItem: {
      backgroundColor: theme.palette.background.light,
      border: ({color}) => color && `2px solid ${theme.palette[color].main}`,
    },
    editItem: {
      border: ({color}) => color && `2px solid ${theme.palette[color].main}`,
    },
    numberField: {
      '& input': {
          direction: 'rtl',
          textAlign: 'left'
      },
      [`& input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button`]: {
          '-webkit-appearance': 'none'
      },
      [`& input[type='number']`]: {
          '-moz-appearance': 'textfield'
      }
    },
    sum: {
      direction: 'rtl',
      textAlign: 'left'
    }
  }));

export default useStyles;