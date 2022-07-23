import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Theme,
  TextField,
  Dialog,
  DialogTitle,
  Paper,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { connect, ConnectedProps } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { RootState } from '../redux/store';
import { makeStyles } from '@mui/styles';
import { removeFromCart, updateCart } from '../redux/slice/shoppingCartSlice';
import { IToBuyProduct } from '../types/ProductTypes';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useMutation } from 'react-query';
import { saveOrder } from '../api';
import { PAYPAL_OPTIONS } from '../constants';
import ProgressBox from './ProgressBox';

/********************************************************
 * CSS classes/ custom styled components
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    pointerEvents: 'auto',
  },
  checkoutButton: {
    float: 'right',
    margin: '0.5rem !important',
  },
  quantityInput: {
    width: 100,
  },
  confirmButton: {
    marginLeft: theme.spacing(1),
  },
  confirmRemoveContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledCheckoutBtn: {
    cursor: 'pointer !important',
    opacity: 0.5,
  },
  backBtn: {
    marginTop: 3,
  },
}));

/********************************************************
 * Redux & Props
 ********************************************************/

const mapStateToProps = (state: RootState) => ({
  products: state.shoppingCart.products,
  user: state.user.user,
});

const mapDispatch = {
  updateCart: updateCart,
  removeFromCart: removeFromCart,
};

const connector = connect(mapStateToProps, mapDispatch);
type PropsType = ConnectedProps<typeof connector>;

/********************************************************
 * Main Component
 ********************************************************/

const ShoppingCart: React.FC<PropsType> = (props) => {
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [products, setProducts] = useState<IToBuyProduct[]>(props.products);
  const [total, setTotal] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [orderResponse, setOrderResponse] = useState<{ [key: string]: string }>({ status: '', message: '' });
  const [customId, setCustomId] = useState<string>(Math.random().toString(36).substring(2, 20));

  useEffect(() => {
    if (orderResponse.status && orderResponse.message) {
      setOrderResponse({ status: '', message: '' });
    }
  }, [location]);

  useEffect(() => {
    setProducts(props.products);
  }, [props.products]);

  useEffect(() => {
    setTotal(products.reduce((acc, product) => acc + product.price * (product.quantity === -1 ? 0 : product.quantity), 0));
  }, [products]);

  const { isLoading, mutate, isSuccess } = useMutation(saveOrder, {
    onSuccess: (data) => {
      if (data.success) {
        // setOrderResponse({ status: 'success', message: data.success });
        props.updateCart([]);
        navigate(`/payment?status=success&oid=${data.success}`);
      } else if (data.failed) {
        navigate('/payment?status=failed');
        // setOrderResponse({ status: 'failed', message: data.failed });
      }
      setIsVisible(false);
      handlePopoverClose();
    },
  });

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleQuantityOnChange = (quantity: string, id: string) => {
    const newProducts = [...products];
    const index = newProducts.findIndex((product) => product.pid === id);
    const newProduct = { ...newProducts[index], quantity: quantity ? Number(quantity) : -1 };
    newProducts[index] = newProduct;
    props.updateCart(newProducts);
  };

  const handleCreateOrder = async (data: Record<string, unknown>, actions: any) => {
    setIsVisible(true);
    const orderId = await actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: PAYPAL_OPTIONS.currency,
            value: String(total),
            breakdown: {
              item_total: {
                currency_code: PAYPAL_OPTIONS.currency,
                value: String(total),
              },
            },
          },
          items: products.map((product) => ({
            name: product.name,
            description: product.description,
            unit_amount: {
              currency_code: PAYPAL_OPTIONS.currency,
              value: String(product.price),
            },
            quantity: String(product.quantity),
          })),
          invoice_id: customId,
          custom_id: customId,
        },
      ],
    });
    return orderId;
  };

  const handleOnApprove = (data: Record<string, unknown>, actions: any) => {
    return actions.order!.capture().then(function () {
      const guestToken = localStorage.getItem('guestToken') ?? Math.random().toString(36).substring(2, 20);
      localStorage.setItem('guestToken', guestToken);
      const formdata = new FormData();
      formdata.append('oid', data.orderID as string);
      formdata.append('custom_id', customId);
      formdata.append('status', 'pending');
      formdata.append('currency', PAYPAL_OPTIONS.currency);
      formdata.append('buyer', props.user?.email ?? 'guest');
      if (!props.user?.email) formdata.append('guest_token', guestToken);
      formdata.append(
        'products',
        JSON.stringify(products.map((product) => ({ pid: product.pid, quantity: product.quantity, price: product.price })))
      );
      formdata.append('total', String(total));
      mutate(formdata);
      setCustomId(Math.random().toString(36).substring(2, 20));
    });
  };

  return (
    <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
      <IconButton className={classes.icon}>
        <Badge badgeContent={products.reduce((acc, product) => acc + product.quantity, 0)} color="secondary" invisible={products.length === 0}>
          <ShoppingCartOutlinedIcon />
        </Badge>
      </IconButton>
      <Popover
        style={{ opacity: isVisible && !Boolean(anchorEl) ? 0 : 1 }}
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={Boolean(anchorEl) || isVisible}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Grid container justifyContent="space-between">
          <Typography variant="subtitle1" component="div" margin={1}>
            Shopping Cart
          </Typography>
          <Typography variant="subtitle1" component="div" margin={1} fontWeight="bold">
            Total: ${total}
          </Typography>
        </Grid>
        {products.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Remove?</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    {product.quantity === 0 ? (
                      <TableCell colSpan={4}>
                        <div className={classes.confirmRemoveContainer}>
                          <span>Are you sure to remove this product?</span>
                          <div>
                            <IconButton className={classes.confirmButton} onClick={() => props.removeFromCart(product.pid)}>
                              <CheckIcon />
                            </IconButton>
                            <IconButton onClick={() => handleQuantityOnChange('1', product.pid)}>
                              <ClearIcon />
                            </IconButton>
                          </div>
                        </div>
                      </TableCell>
                    ) : (
                      <>
                        <TableCell component="th" scope="row">
                          <Link to={`/category/${product.catid}/product/${product.pid}`}>{product.name}</Link>
                        </TableCell>
                        <TableCell align="right" width="fit-content">
                          <TextField
                            className={classes.quantityInput}
                            placeholder="Quantity"
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            size="small"
                            value={product.quantity === -1 ? '' : String(product.quantity)}
                            onChange={(e) => handleQuantityOnChange(e.target.value, product.pid)}
                          />
                        </TableCell>
                        <TableCell align="right">${product.price * (product.quantity === -1 ? 0 : product.quantity)}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleQuantityOnChange('0', product.pid)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container alignItems="center" minHeight={50}>
            <Typography textAlign="center" margin="auto" component="div" variant="body2">
              No products yet
            </Typography>
          </Grid>
        )}
        <PayPalButtons
          disabled={products.length === 0}
          style={{ color: 'silver', tagline: false, label: 'checkout' }}
          fundingSource="paypal"
          createOrder={handleCreateOrder}
          onApprove={handleOnApprove}
          onCancel={(data, actions) => setIsVisible(false)}
          onError={(err) => setIsVisible(false)}
        />
      </Popover>

      <Dialog open={isLoading} disableEscapeKeyDown PaperComponent={(props) => <Paper {...props} sx={{ width: '20%', height: '30%' }} />}>
        <DialogTitle>Please wait...</DialogTitle>
        <ProgressBox />
      </Dialog>
    </div>
  );
};

export default connector(ShoppingCart);
