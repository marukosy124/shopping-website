import { ListItemButton, ListItemButtonProps, Box, List, ListItemText, styled, Theme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useQuery } from 'react-query';
import { getCategories } from '../api';
import { useAppDispatch } from '../redux/hooks';
import { updateCategories } from '../redux/slice/categorySlice';
import { useMemo } from 'react';

/********************************************************
 * CSS classes/ custom styled components
 ********************************************************/

const ListItemTextButton = styled(ListItemButton)<ListItemButtonProps>(({ theme }) => ({
  color: theme.palette.common.black,
  backgroundColor: 'transparent',
  textTransform: 'capitalize',
  '&:hover': {
    color: theme.palette.grey[600],
    backgroundColor: 'transparent',
  },
  fontSize: theme.typography.subtitle1.fontSize,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      color: theme.palette.grey[600],
      backgroundColor: 'transparent',
    },
  },
}));

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: theme.typography.h5.fontSize,
    backgroundImage: 'linear-gradient(120deg, #a6c0fe 0%, #f68084 100%)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  },
  appbar: {
    background: 'transparent !important',
    boxShadow: 'none !important',
    justifyContent: 'space-between !important',
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  menuButton: {
    [theme.breakpoints.up('xs')]: {
      display: 'flex !important',
    },
    [theme.breakpoints.up('md')]: {
      display: 'none !important',
    },
    mr: 2,
  },
  menu: {
    width: 200,
  },
  bottomContainer: {
    display: 'flex',
  },
  sidebar: {
    [theme.breakpoints.up('xs')]: {
      display: 'none !important',
    },
    [theme.breakpoints.up('md')]: {
      display: 'flex !important',
      paddingTop: 0,
    },
  },
  container: {
    padding: theme.spacing(2),
    justifyContent: 'center',
    [theme.breakpoints.up('xs')]: {
      width: '100%',
    },
    [theme.breakpoints.up('md')]: {
      width: '90%',
    },
  },
  main: {
    marginTop: theme.spacing(3),
  },
}));

/********************************************************
 * Props
 ********************************************************/
interface NavbarProps {
  onClick: any;
}

/********************************************************
 * Main Component
 ********************************************************/

const Navbar: React.FC<NavbarProps> = (props) => {
  const classes = useStyles(props);
  const { pathname, search } = useLocation();
  const queryString = useMemo(() => new URLSearchParams(search), [search]);
  const catid = pathname.split('/')[2] || queryString.get('catid');
  const dispatch = useAppDispatch();

  const { data: categories } = useQuery('categories', getCategories, {
    onSuccess: (data) => {
      dispatch(updateCategories(data));
    },
  });

  return (
    <Box className={classes.menu} role="presentation" onClick={props.onClick}>
      <List>
        <Link to="/">
          <ListItemTextButton disableRipple selected={pathname === '/'} dense>
            <ListItemText primary="All Products" />
          </ListItemTextButton>
        </Link>
        {categories?.map((category, index) => (
          <Link to={`/category?catid=${category.catid}`} key={index}>
            <ListItemTextButton disableRipple selected={catid === category.catid} dense>
              <ListItemText primary={category.name} />
            </ListItemTextButton>
          </Link>
        ))}
      </List>
    </Box>
  );
};

export default Navbar;
