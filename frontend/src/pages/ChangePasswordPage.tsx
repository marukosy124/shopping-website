import { VisibilityOff, Visibility } from '@mui/icons-material';
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Theme,
  OutlinedInput,
  Typography,
  FormControl,
  FormHelperText,
  Alert,
  useMediaQuery,
  useTheme,
  Snackbar,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { changePassword, getCsrfNonce } from '../api';
import { BASE_URL } from '../constants';
import { useAppDispatch } from '../redux/hooks';
import { resetUser } from '../redux/slice/userSlice';
import { RootState } from '../redux/store';
import { ICredentials } from '../types/UserTypes';

/********************************************************
 * CSS classes
 ********************************************************/

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    width: '30%',
  },
}));

/********************************************************
 * Main Component
 ********************************************************/

const ChangePasswordPage = () => {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [credentials, setCredentials] = useState<ICredentials>({ email: currentUser?.email ?? '', oldPassword: '', newPassword: '' });
  const [isPasswordShow, setIsPasswordShow] = useState<{ [key: string]: boolean }>({ oldPassword: false, newPassword: false });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { isLoading, mutate } = useMutation(changePassword, {
    onSuccess: (data) => {
      if (data.failed) {
        setErrors({ ...errors, request: data.failed });
      } else {
        dispatch(resetUser());
        window.location.href = `${BASE_URL}/login.php`;
      }
    },
  });

  const handleInputOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleShowPasswordOnChange = (name: string) => {
    setIsPasswordShow({ ...isPasswordShow, [name]: !isPasswordShow[name] });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[\w=+\-\/][\w='+\-\/\.]*@[\w\-]+(\.[\w\-]+)*(\.[\w]{2,6})$/;
    const passwordRegex = /^[\w@#$%\^\&\*\-]+$/;
    if (!emailRegex.test(credentials.email)) {
      newErrors['email'] = 'Invalid Email Format';
    }
    if (!passwordRegex.test(credentials.oldPassword)) {
      newErrors['oldPassword'] = 'Invalid Password Format';
    }
    if (!passwordRegex.test(credentials.newPassword)) {
      newErrors['newPassword'] = 'Invalid Password Format';
    }
    setErrors(newErrors);
    if (Object.entries(newErrors).length === 0) {
      const formdata = new FormData();
      const nonce = await getCsrfNonce('change_password');
      formdata.append('email', credentials.email);
      formdata.append('old_password', credentials.oldPassword);
      formdata.append('new_password', credentials.newPassword);
      formdata.append('nonce', nonce);
      mutate(formdata);
    }
  };

  return (
    <>
      <Typography variant="h6" pb={3}>
        Change Password
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container direction="column" spacing={2} maxWidth={isMobile ? '100%' : '50%'}>
          <Grid item>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Email"
              value={credentials.email}
              onChange={handleInputOnChange}
              name="email"
              required
              disabled
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>
          <Grid item>
            <FormControl error={Boolean(errors.oldPassword)} fullWidth>
              <OutlinedInput
                required
                placeholder="Old Password"
                value={credentials.oldPassword}
                onChange={handleInputOnChange}
                type={isPasswordShow.oldPassword ? 'text' : 'password'}
                name="oldPassword"
                disabled={isLoading}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleShowPasswordOnChange('oldPassword')} onMouseDown={(e) => e.preventDefault()} edge="end">
                      {isPasswordShow.oldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                error={Boolean(errors.oldPassword)}
              />
              {errors.oldPassword && <FormHelperText>{errors.oldPassword}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl error={Boolean(errors.newPassword)} fullWidth>
              <OutlinedInput
                required
                placeholder="New Password"
                value={credentials.newPassword}
                onChange={handleInputOnChange}
                type={isPasswordShow.newPassword ? 'text' : 'password'}
                name="newPassword"
                disabled={isLoading}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleShowPasswordOnChange('newPassword')} onMouseDown={(e) => e.preventDefault()} edge="end">
                      {isPasswordShow.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                error={Boolean(errors.newPassword)}
              />
              {errors.newPassword && <FormHelperText>{errors.newPassword}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item mt={3} textAlign={isMobile ? 'center' : 'left'}>
            <Button variant="contained" type="submit" disabled={isLoading} className={classes.button}>
              Submit
            </Button>
          </Grid>
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={Boolean(errors.request)}
            autoHideDuration={6000}
            onClose={() => setErrors(({ request, ...rest }) => ({ ...rest }))}
          >
            <Alert severity="error">{errors.request}</Alert>
          </Snackbar>
        </Grid>
      </form>
    </>
  );
};

export default ChangePasswordPage;
