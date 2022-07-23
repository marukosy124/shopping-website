export interface IProduct {
  pid: string;
  image: string;
  price: number;
  name: string;
  description: string;
  inventory: number;
  catid: string;
  cat_name: string;
}
export interface IToBuyProduct extends IProduct {
  quantity: number;
}
export interface IProductsResponse {
  total_pages: number;
  products: IProduct[];
}

export interface ISavedProduct {
  pid: string;
  quantity: number;
}

export interface IOrderedProduct extends IProduct {
  quantity: number;
}
