import apiManager from './config/apiManager';
import { ICategory } from './types/CategoryTypes';
import { IOrderResponse, IOrdersResponse } from './types/OrderTypes';
import { IProduct, IProductsResponse } from './types/ProductTypes';
import { IUser } from './types/UserTypes';

const PAGE_SIZE = 20;

export const getProducts = (page: number): Promise<IProductsResponse> => {
  return apiManager.get(`/admin-process.php?role=guest&action=prod_fetchAll&page=${page}&page_size=${PAGE_SIZE}`).then((res) => res.data.success);
};

export const getProductsByCatid = (query: { catid: string; page: number }): Promise<IProductsResponse> => {
  const { catid, page } = query;
  return apiManager
    .get(`/admin-process.php?role=guest&action=prod_fetchByCatid&catid=${catid}&page=${page}&page_size=${PAGE_SIZE}`)
    .then((res) => res.data.success);
};

export const getProductByPid = (pid: string): Promise<IProduct> => {
  return apiManager.get(`/admin-process.php?role=guest&action=prod_fetchOne&pid=${pid}`).then((res) => res.data.success);
};

export const getCategories = (): Promise<ICategory[]> => {
  return apiManager.get('/admin-process.php?role=guest&action=cat_fetchAll').then((res) => res.data.success);
};

export const getCurrentUser = (): Promise<IUser> => {
  return apiManager.get('/auth-process.php?action=auth').then((res) => res.data.success);
};

export const changePassword = async (credentials: FormData): Promise<any> => {
  return apiManager.post('/auth-process.php?action=change_password', credentials).then((res) => res.data);
};

export const logout = async (): Promise<any> => {
  return await apiManager.get('/auth-process.php?action=logout');
};

export const getCsrfNonce = async (action: string): Promise<string> => {
  return await apiManager.get(`/auth-process.php?action=getNonce&params=${action}`).then((res) => res.data.success);
};

export const saveOrder = async (order: FormData): Promise<any> => {
  return await apiManager.post('/payments.php', order).then((res) => res.data);
};

export const getOrdersByUser = async (query: any): Promise<IOrdersResponse> => {
  const { user, guestToken } = query;
  return await apiManager.get(`/admin-process.php?role=guest&action=order_fetchAll&buyer=${user}&guest_token=${guestToken}`).then((res) => res.data);
};

export const getOrderByOid = async (oid: string): Promise<IOrderResponse> => {
  return await apiManager.get(`/admin-process.php?role=guest&action=order_fetchOne&oid=${oid}`).then((res) => res.data);
};
