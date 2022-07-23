import { Box, Grid, IconButton, Theme, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IProduct } from '../types/ProductTypes';
import ImageWrapper from './ImageWrapper';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { addToCart } from '../redux/slice/shoppingCartSlice';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../redux/store';

/********************************************************
 * CSS classes/ custom styled components
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  cardContainer: {
    alignItems: 'center',
    width: 200,
  },
  infoContainer: {
    marginTop: '0.3rem',
  },
}));

/********************************************************
 * Redux & Props
 ********************************************************/
interface ProductCardProps {
  product: IProduct;
}

const mapStateToProps = (state: RootState) => ({
  products: state.shoppingCart.products,
});

const connector = connect(mapStateToProps);
type PropsType = ConnectedProps<typeof connector> & ProductCardProps;

/********************************************************
 * Main Component
 ********************************************************/

const ProductCard: React.FC<PropsType> = (props) => {
  const classes = useStyles(props);
  const dispatch = useAppDispatch();

  const handleAddToClick = (product: IProduct) => {
    const productWithQuantity = {
      ...product,
      quantity: 1,
    };
    dispatch(addToCart(productWithQuantity));
  };

  return (
    <Box justifyContent="center" className={classes.cardContainer}>
      <Link to={`/category/${props.product.catid}/product/${props.product.pid}`}>
        <ImageWrapper src={props.product.image} />
      </Link>

      <Grid container justifyContent="space-between" className={classes.infoContainer}>
        <Grid item xs={10}>
          <Link to={`/category/${props.product.catid}/product/${props.product.pid}`}>
            <Typography variant="subtitle1">{props.product.name}</Typography>
            <Typography variant="body1" color={(theme) => theme.palette.grey[600]}>
              ${props.product.price}
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={2}>
          <Tooltip title="Add to Cart">
            <IconButton onClick={() => handleAddToClick(props.product)}>
              <AddShoppingCartOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default connector(ProductCard);
