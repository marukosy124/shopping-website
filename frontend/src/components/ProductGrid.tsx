import { styled } from '@mui/material';

const ProductGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridGap: '1rem',
  justifyContent: 'space-around',
  padding: 'initial',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, max-content))',
}));

export default ProductGrid;
