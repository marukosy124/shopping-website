import { Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useQuery } from 'react-query';
import { getOrdersByUser } from '../api';
import ProgressBox from '../components/ProgressBox';
import { IOrderedProduct } from '../types/ProductTypes';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import LocalMallIcon from '@mui/icons-material/LocalMall';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    '&:last-child td, &:last-child th': { border: 0 },
  },
  tableCell: {
    padding: '0 1rem !important',
  },
  icon: {
    paddingRight: '5px',
    fontSize: '14px !important',
  },
}));

const OrdersPage: React.FC = () => {
  const classes = useStyles();
  const user = useSelector((state: RootState) => state.user.user);
  const guestToken = localStorage.getItem('guestToken') ?? '';
  const userQuery = { user: user?.email ?? 'guest', guestToken: user?.email ? '' : guestToken };

  const { data: orders, isLoading } = useQuery(`orders-${JSON.stringify(userQuery)}`, () => getOrdersByUser(userQuery));

  return (
    <>
      <Typography variant="h5" pb={3}>
        Your Order History
      </Typography>
      {isLoading || !orders?.success ? (
        <ProgressBox />
      ) : (
        <>
          {orders?.success?.length > 0 ? (
            <TableContainer>
              <Table sx={{ minWidth: 'md' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders?.success.map((order) => (
                    <TableRow key={order.oid} className={classes.table}>
                      <TableCell component="th" scope="row" className={classes.tableCell}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Order #{order.oid}
                        </Typography>
                        <Typography variant="body2" alignItems="center" component="div" display="flex">
                          <AccessTimeFilledIcon className={classes.icon} /> {order.created_at}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" alignItems="center">
                          {order.currency} ${order.total}
                        </Typography>
                        <Typography variant="body2" alignItems="center" component="div" display="flex" justifyContent="flex-end">
                          <LocalMallIcon className={classes.icon} />
                          {JSON.parse(order.products).reduce((acc: number, product: IOrderedProduct) => acc + product.quantity, 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={order?.status}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                          color={order.status === 'completed' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Link to={`/order?oid=${order.oid}`}>
                          <Button variant="contained">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="h6" pb={3}>
              No orders yet
            </Typography>
          )}
        </>
      )}
    </>
  );
};

export default OrdersPage;
