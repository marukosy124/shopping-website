import { InputBase, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/********************************************************
 * CSS classes/ custom styled components
 ********************************************************/

const Search = styled('div')(({ theme }) => ({
  color: theme.palette.common.black,
  position: 'relative',
  borderRadius: 50,
  border: '1px solid #ced4da',
  width: '100%',
  [theme.breakpoints.up('xs')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(2),
  },
  marginRight: theme.spacing(1),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

/********************************************************
 * Main Component
 ********************************************************/

const Searchbar: React.FC = () => {
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.key === 'Enter') {
      alert('TODO: search');
    }
  };

  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} onKeyDown={onInputKeyDown} />
    </Search>
  );
};

export default Searchbar;
