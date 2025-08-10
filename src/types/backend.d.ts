export interface IBackendRes<T> {
  error?: string | string[];
  message: string;
  statusCode: number | string;
  data?: T;
}

export interface IModelPaginate<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface IUploadFile {
  url: string;
  fileName: string;
  uploadedAt: string;
}

export interface IAccount {
  access_token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    address: string;
    avatar: string;
    role: string;
    permissions: {
      id: number;
      name: string;
      path: string;
      method: string;
      module: string;
    }[];
    noPassword: boolean;
  };
}

export interface IGetAccount extends Omit<IAccount, "access_token"> {}

export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  active: boolean;
  adminActive?: boolean;
  role?: {
    id: number;
    name: string;
  };
  avatar?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface IPermission {
  id: number;
  name: string;
  path: string;
  method: string;
  module: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface IRole {
  id: number;
  name: string;
  description: string;

  createdAt?: string;
  updatedAt?: string;
  permissions: IPermission[] | [];
}

export interface ICategory {
  id: number;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBook {
  id: number;
  title: string;
  thumbnail: string;
  slider: string[];
  author: string;
  price: number;
  quantity: number;
  description: string | null;
  category: ICategory;
  createdAt?: string;
  updatedAt?: string;
  discount: number;
  sold: number;
  age: number;
  publicationDate: string;
  publisher: string;
  pageCount: number;
  coverType: string;
}

export interface IBookRequest {
  title: string;
  thumbnail: string;
  slider: string[];
  author: string;
  price: number;
  quantity: number;
  description: string | null;
  category: number;
  discount: number;
  sold: number;
  age: number;
  publicationDate: string;
  publisher: string;
  pageCount: number;
  coverType: string;
}

export interface ICartItem {
  id: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  book: IBook;
}

export interface ICreateOrderRequest {
  fullName: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    bookId: number;
    quantity: number;
  }[];
  userId?: number;
}

export interface IOrderItem {
  id: number;
  quantity: number;
  price: number;
  book: IBook;
}

export interface IOrder {
  id: number;
  fullName: string;
  phone: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  userId: number;
  orderItems: IOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentResult {
  transactionId: string;
  status: string;
  message: string;
}

export interface IPaymentResponse {
  paymentUrl?: string;
  transactionId: string;
  paymentMethod: string;
  status: string;
  message: string;
}

export enum EOrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
