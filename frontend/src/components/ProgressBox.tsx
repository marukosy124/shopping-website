import { Box, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  loadingContainer: {
    height: 300,
  },
});

const ProgressBox: React.FC = () => {
  const classes = useStyles();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" className={classes.loadingContainer}>
      <CircularProgress />
    </Box>
  );
};

export default ProgressBox;
