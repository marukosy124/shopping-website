import { Grid, Pagination } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import ProgressBox from '../components/ProgressBox';

const HomePage = () => {
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, refetch } = useQuery('products', () => getProducts(page));

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  useEffect(() => {
    refetch();
  }, [page]);

  return (
    <>
      {isLoading ? (
        <ProgressBox />
      ) : (
        <>
          <ProductGrid>
            {data?.products.map((product) => (
              <ProductCard product={product} key={product.pid} />
            ))}
          </ProductGrid>
          {data?.total_pages && data?.total_pages > 1 && (
            <Grid container justifyContent="center" mt={10}>
              <Pagination count={data?.total_pages} onChange={handlePageChange} />
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default HomePage;
