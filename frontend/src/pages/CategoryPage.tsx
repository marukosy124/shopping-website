import { Grid, Pagination } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { getProductsByCatid } from '../api';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import ProgressBox from '../components/ProgressBox';

const CategoryPage = () => {
  const { search } = useLocation();
  const queryString = useMemo(() => new URLSearchParams(search), [search]);
  const catid = queryString.get('catid') ?? '';
  const [page, setPage] = useState<number>(1);
  const query = { catid: catid, page: page };

  const { data, isLoading, refetch } = useQuery(`category-${catid}`, () => getProductsByCatid(query));

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
            {data?.products.length === 0 ? (
              <Grid container alignItems="center" justifyContent="center" minHeight={300}>
                No products yet
              </Grid>
            ) : (
              <>
                {data?.products.map((product) => (
                  <Grid item key={product.pid}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </>
            )}
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

export default CategoryPage;
