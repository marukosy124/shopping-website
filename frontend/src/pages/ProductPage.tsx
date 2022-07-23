import { Alert, Button, Divider, Grid, TextField, Typography, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { getProductByPid } from '../api';
import ImageWrapper from '../components/ImageWrapper';
import ProgressBox from '../components/ProgressBox';
import { products } from '../DummyData';
import { useAppDispatch } from '../redux/hooks';
import { resetProduct, updateProduct } from '../redux/slice/productSlice';
import { addToCart } from '../redux/slice/shoppingCartSlice';
import { IToBuyProduct } from '../types/ProductTypes';

/********************************************************
 * CSS classes/ custom styled components
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  productImage: {
    maxWidth: '90%',
    height: 'auto',
    margin: 'auto',
  },
  quantityInput: {
    margin: '0.2rem  0 1rem!important',
    '& input': {
      textAlign: 'center',
    },
  },
  alert: {
    marginTop: '2rem !important',
  },
  divider: {
    margin: '0.5rem 0 !important',
  },
  inventory: {
    float: 'right',
    fontWeight: 'bold !important',
  },
  noImageWrapper: {
    boxShadow: 'none !important',
    margin: 'auto',
  },
}));

/********************************************************
 * Main Component
 ********************************************************/

const ProductPage: React.FC = (props) => {
  const classes = useStyles(props);

  const { pathname } = useLocation();
  const productId = pathname.split('/')[4];

  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<IToBuyProduct>();
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const { isLoading } = useQuery(`product-${productId}`, () => getProductByPid(productId), {
    onSuccess: (data) => {
      setProduct({ ...data, quantity: 1 });
      dispatch(updateProduct(data));
    },
  });

  useEffect(() => {
    if (productId) {
      const currentProduct = products.find((product) => product.pid === productId)!;
      setProduct({ ...currentProduct, quantity: 1 });
    }
  }, [productId]);

  useEffect(() => {
    return () => {
      dispatch(resetProduct());
    };
  }, []);

  const handleQuantityOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (product) {
      setProduct({ ...product, quantity: Number(e.target.value) });
    }
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      setIsAdded(true);
    }
  };

  return (
    <>
      {isLoading ? (
        <ProgressBox />
      ) : (
        <>
          <Grid container alignItems="center" spacing={3} marginBottom={{ xs: 5, sm: 2 }}>
            <Grid item xs={12} sm={6} display="flex">
              {product?.image ? (
                <img alt={product?.name} src={product?.image} className={classes.productImage} />
              ) : (
                <ImageWrapper className={classes.noImageWrapper} />
              )}
            </Grid>
            <Grid item xs={12} sm={6} paddingLeft={0}>
              <Typography variant="h5">{product?.name}</Typography>
              <Typography variant="h5" marginY="2rem" color={(theme) => theme.palette.grey[600]}>
                ${product?.price}
              </Typography>
              <Typography variant="caption">Quantity</Typography>
              <Typography variant="caption" className={classes.inventory}>
                {product?.inventory} items in stock
              </Typography>
              <TextField
                className={classes.quantityInput}
                fullWidth
                placeholder="Quantity"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
                value={String(product?.quantity)}
                onChange={handleQuantityOnChange}
              />
              <Button fullWidth variant="contained" onClick={handleAddToCart}>
                Add to Cart
              </Button>
              {isAdded && (
                <Alert severity="success" onClose={() => setIsAdded(false)} className={classes.alert}>
                  Product is added to cart successfully
                </Alert>
              )}
            </Grid>
          </Grid>
          <Typography variant="subtitle1">Description</Typography>
          <Divider className={classes.divider} />
          <Typography textAlign="justify" variant="body2">
            {product?.description ?? 'No description'}
          </Typography>
        </>
      )}
    </>
  );
};

export default ProductPage;
