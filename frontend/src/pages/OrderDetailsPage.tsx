import { Button, Chip, Divider, Grid, IconButton, Theme, Tooltip, Typography } from '@mui/material';
import NotFoundIcon from '../assets/notfound.png';
import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { getOrderByOid } from '../api';
import ProgressBox from '../components/ProgressBox';
import { IOrderedProduct, IToBuyProduct } from '../types/ProductTypes';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    paddingRight: '5px',
    fontSize: '16px !important',
  },
}));

const OrderDetailsPage: React.FC = () => {
  const classes = useStyles();
  const { search } = useLocation();
  const queryString = useMemo(() => new URLSearchParams(search), [search]);
  const orderId = queryString.get('oid') ?? '';
  const [products, setProducts] = useState<IOrderedProduct[]>([]);

  const { data: order, isLoading } = useQuery(`order-${orderId}`, () => getOrderByOid(orderId), {
    onSuccess: (data) => {
      if (data.success) {
        setProducts(JSON.parse(data.success.products as any));
      }
    },
  });

  return (
    <>
      {isLoading ? (
        <ProgressBox />
      ) : (
        <>
          {order?.success ? (
            <>
              <Grid container alignItems="center" mb={4} justifyContent="space-between">
                <Grid item display="flex" alignItems="center">
                  <Tooltip title="Back to order history">
                    <Link to="/order-history">
                      <IconButton>
                        <ChevronLeftIcon />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Grid item ml={1}>
                    <Typography variant="h5">Order #{orderId}</Typography>
                    <Typography variant="body2" alignItems="center" component="div" display="flex">
                      <AccessTimeFilledIcon className={classes.icon} /> {order.success.created_at}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item>
                  <Chip
                    label={order?.success?.status}
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                    color={order.success.status === 'completed' ? 'primary' : 'default'}
                  />
                </Grid>
              </Grid>
              <Grid container justifyContent="space-between">
                <Typography variant="h6" pt={3}>
                  Products
                </Typography>
                <Typography variant="h6" pt={3} color={(theme) => theme.palette.grey[600]} fontWeight="bold">
                  Total: ${order?.success?.total}
                </Typography>
              </Grid>
              <Divider sx={{ marginBottom: '1rem' }} />
              {products?.map((product: IToBuyProduct) => (
                <Grid container alignItems="center" justifyContent="space-between" key={product.pid}>
                  <Grid item>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        <img src={product.image} alt={product.name} width={150} />
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {product.name}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Typography variant="body1" fontWeight="bold" color={(theme) => theme.palette.grey[600]}>
                      ${product.price} x {product.quantity}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </>
          ) : (
            <Grid container justifyContent="center" alignItems="center" mt={5}>
              <Grid item textAlign="center">
                <img src={NotFoundIcon} width={200} />
                <Typography variant="h4" textAlign="center" my={3}>
                  Order not found!
                </Typography>
                <Link to="/order-history">
                  <Button variant="contained">Back to order history</Button>
                </Link>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default OrderDetailsPage;
