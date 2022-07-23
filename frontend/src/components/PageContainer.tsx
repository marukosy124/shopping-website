import { AppBar, IconButton, SwipeableDrawer, Toolbar, Typography, Theme, useMediaQuery, useTheme } from '@mui/material';
import { memo, ReactNode, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import ShoppingCart from './ShoppingCart';
import Navbar from './Navbar';
import CustomBreadcrumbs from './CustomBreadcrumbs';
import Searchbar from './Searchbar';
import { useQuery } from 'react-query';
import { getCurrentUser } from '../api';
import ProfileButton from './ProfileButton';
import { PAGE_EXCEPTION } from '../constants';

/********************************************************
 * CSS classes
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: theme.typography.h5.fontSize,
    backgroundImage: 'linear-gradient(100deg, #a6c0fe 0%, #f68084 100%)',
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
    padding: '0 1rem',
  },
  menuButton: {
    mr: 2,
  },
  menu: {
    width: 200,
  },
  bottomContainer: {
    display: 'flex',
  },
  sidebar: {
    paddingTop: 0,
  },
  container: {
    padding: theme.spacing(2),
    justifyContent: 'center',
    [theme.breakpoints.up('xs')]: {
      width: '100%',
      paddingTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      width: '90%',
      paddingTop: theme.spacing(2),
    },
  },
  rightContainer: {
    display: 'flex',
  },
}));

/********************************************************
 * Main Component
 ********************************************************/

const PageContainer: React.FC<ReactNode> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const classes = useStyles(props);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event && event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  return (
    <>
      {/* NOTE: AppBar is using <header> */}
      <AppBar position="static" className={classes.appbar}>
        <Toolbar className={classes.toolbar}>
          {/* navbar in mobile */}
          {isMobile && (
            <IconButton className={classes.menuButton} size="large" edge="start" color="default" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Link to="/">
            <Typography variant="h5" fontWeight="bold" mr={2} className={classes.title}>
              JustShop
            </Typography>
          </Link>
          <SwipeableDrawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
            <Navbar onClick={toggleDrawer(false)} />
          </SwipeableDrawer>

          <div className={classes.rightContainer}>
            {!isMobile && <Searchbar />}
            <ShoppingCart />
            <ProfileButton />
          </div>
        </Toolbar>
      </AppBar>

      <div className={classes.bottomContainer}>
        {/* navbar in desktop */}
        {!isMobile && (
          <aside className={classes.sidebar}>
            <Navbar onClick={toggleDrawer(false)} />
          </aside>
        )}

        <div className={classes.container}>
          {isMobile && <Searchbar />}
          {/* breadcrumbs (NOTE: breadcrumbs is using <nav> */}
          {!PAGE_EXCEPTION.some((page) => pathname.includes(page)) && <CustomBreadcrumbs />}
          {/* page content */}
          <main>{props.children}</main>
        </div>
      </div>
    </>
  );
};

export default memo(PageContainer);
