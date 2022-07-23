import { Breadcrumbs, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../redux/store';
import { useQuery } from 'react-query';
import { getCategories } from '../api';
import { updateCategories } from '../redux/slice/categorySlice';
import { useAppDispatch } from '../redux/hooks';

/********************************************************
 * CSS classes/ custom styled components
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.grey[700],
    textTransform: 'capitalize',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  breadcrumbs: {
    marginBottom: '1.5rem !important',
  },
}));

/********************************************************
 * Redux & Props
 ********************************************************/

const mapStateToProps = (state: RootState) => ({
  product: state.product.product,
  categories: state.category.categories,
});

const connector = connect(mapStateToProps);
type PropsType = ConnectedProps<typeof connector>;

/********************************************************
 * Main Componenies
 ********************************************************/

const CustomBreadcrumbs: React.FC<PropsType> = (props) => {
  const classes = useStyles(props);
  const dispatch = useAppDispatch();

  const { pathname, search } = useLocation();
  const path = pathname.split('/');
  const queryString = useMemo(() => new URLSearchParams(search), [search]);

  const query = useQuery('categories', getCategories, {
    enabled: props.categories.length === 0,
    onSuccess: (data) => {
      dispatch(updateCategories(data));
    },
  });

  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" className={classes.breadcrumbs}>
      {/*  for category */}
      {!path.includes('product') &&
        !path.every((item) => !item) && [
          <Link to="/" key="home" className={classes.link}>
            Home
          </Link>,
          <Typography key="category" color="text.primary" textTransform="capitalize">
            {props.categories?.find((category) => category.catid === queryString.get('catid'))?.name}
          </Typography>,
        ]}

      {/*  for product */}
      {path.includes('product') &&
        !path.every((item) => !item) && [
          <Link to="/" key="home" className={classes.link}>
            Home
          </Link>,
          <Link key="category" to={`/category?catid=${props.product?.catid}`} className={classes.link}>
            {props.categories?.find((category) => category.catid === path[2])?.name}
          </Link>,
          <Typography key="category" color="text.primary" textTransform="capitalize">
            {props.product?.name}
          </Typography>,
        ]}

      {/* for home */}
      {path.every((item) => !item) && (
        <Typography color="text.primary" textTransform="capitalize">
          Home
        </Typography>
      )}
    </Breadcrumbs>
  );
};
export default connector(CustomBreadcrumbs);
