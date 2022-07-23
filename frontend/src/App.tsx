import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import CategoryPage from './pages/CategoryPage';
import PageContainer from './components/PageContainer';
import { customTheme } from './theme';
import { ThemeProvider } from '@mui/material';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import { useEffect } from 'react';
import { useAppDispatch } from './redux/hooks';
import { getCurrentUser, getProductByPid } from './api';
import { updateCart } from './redux/slice/shoppingCartSlice';
import { ISavedProduct } from './types/ProductTypes';
import { useQuery } from 'react-query';
import { resetUser, updateUser } from './redux/slice/userSlice';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PAYPAL_OPTIONS } from './constants';
import PaymentResultPage from './pages/PaymentResultPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrdersPage from './pages/OrdersPage';

const App = () => {
  const dispatch = useAppDispatch();

  const { data: currentUser } = useQuery('currentUser', getCurrentUser, {
    onSuccess: (data) => {
      if (data) {
        dispatch(updateUser(data));
      } else {
        dispatch(resetUser());
      }
    },
  });

  useEffect(() => {
    async function restoreShoppingCart() {
      const savedShoppingCart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
      const shoppingCart = await Promise.all(
        savedShoppingCart.map(async (product: ISavedProduct) => {
          const productDetails = await getProductByPid(product.pid);
          return { ...productDetails, quantity: product.quantity };
        })
      );
      dispatch(updateCart(shoppingCart));
    }
    restoreShoppingCart();
  }, []);

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <ThemeProvider theme={customTheme}>
        <PageContainer>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/category/:catid/product/:pid" element={<ProductPage />} />
            <Route path="/change-password" element={currentUser ? <ChangePasswordPage /> : <Navigate to="/" />} />
            <Route path="/payment" element={<PaymentResultPage />} />
            <Route path="/order-history" element={<OrdersPage />} />
            <Route path="/order" element={<OrderDetailsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </PageContainer>
      </ThemeProvider>
    </PayPalScriptProvider>
  );
};

export default App;
