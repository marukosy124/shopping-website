import { Button, Grid, Theme, Typography } from '@mui/material';
import SuccessIcon from '../assets/success.png';
import FailIcon from '../assets/fail.png';
import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useMemo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    margin: '1rem',
  },
}));

const PaymentResultPage: React.FC = () => {
  const classes = useStyles();
  const { search } = useLocation();
  const queryString = useMemo(() => new URLSearchParams(search), [search]);
  const isSuccess = queryString.get('status') === 'success';

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item textAlign="center">
        <img src={isSuccess ? SuccessIcon : FailIcon} width={200} />
        <Typography variant="h4" textAlign="center" my={3}>
          {isSuccess ? 'Success!' : 'Failed!'}
        </Typography>
        <Typography variant="h6" textAlign="center" my={3}>
          {isSuccess ? "Your order is received, we'll be in touch shortly!" : 'Your order is rejected. Please try again or contact us.'}
        </Typography>
        {isSuccess && (
          <Link to={`/order?oid=${queryString.get('oid')}`} className={classes.button}>
            <Button variant="contained">View your order</Button>
          </Link>
        )}
        <Link to="/" className={classes.button}>
          <Button variant="outlined">Back to home page</Button>
        </Link>
      </Grid>
    </Grid>
  );
};

export default PaymentResultPage;
