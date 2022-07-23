import { Popover, Theme, Button, List, ListItemText, ListItemButton } from '@mui/material';
import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { BASE_URL } from '../constants';
import { useMutation } from 'react-query';
import { logout } from '../api';
import { useAppDispatch } from '../redux/hooks';
import { resetUser } from '../redux/slice/userSlice';

/********************************************************
 * CSS classes
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    pointerEvents: 'auto',
  },
}));

/********************************************************
 * Main Component
 ********************************************************/

const ProfileButton: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.user.user);

  const { mutate } = useMutation(logout);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handlePopoverClose();
    mutate();
    dispatch(resetUser());
  };

  return (
    <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
      <Button
        startIcon={<AccountCircleIcon />}
        size="large"
        sx={{ color: 'grey !important', textTransform: currentUser?.email ? 'lowercase' : 'capitalize' }}
      >
        {currentUser?.email ?? 'Guest'}
      </Button>
      <Popover
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <List>
          <Link to="/order-history">
            <ListItemButton disableRipple dense>
              <ListItemText primary="Order History" />
            </ListItemButton>
          </Link>
          {currentUser ? (
            <>
              <Link to="/change-password">
                <ListItemButton disableRipple dense>
                  <ListItemText primary="Change Password" />
                </ListItemButton>
              </Link>
              <ListItemButton disableRipple dense onClick={handleLogout}>
                <ListItemText primary="Logout" primaryTypographyProps={{ color: '#f68084' }} />
              </ListItemButton>
            </>
          ) : (
            <a href={`${BASE_URL}/login.php`}>
              <ListItemButton disableRipple dense>
                <ListItemText primary="Login" />
              </ListItemButton>
            </a>
          )}
        </List>
      </Popover>
    </div>
  );
};

export default ProfileButton;
