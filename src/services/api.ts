import { EOrderStatus, IAccount, IBackendRes, IBook, IBookRequest, ICartItem, ICategory, ICreateOrderRequest, IModelPaginate, IOrder, IPaymentResponse, IPaymentResult, IPermission, IRole, IUploadFile, IUser } from "@/types/backend";
import axios from "services/axios.customize"

/**
 * 
Module Auth
 */

export const loginAPI = (username: string, password: string) => {
    const urlBackend = "/api/v1/auth/login";
    return axios.post<IBackendRes<IAccount>>(urlBackend, { username, password });
}

export const registerAPI = (fullName: string, email: string, password: string, phone: string) => {
    const urlBackend = '/api/v1/auth/register';
    return axios.post<IBackendRes<IUser>>(urlBackend, { fullName, email, password, phone });
}

export const getAccountAPI = () => {
    const urlBackend = "/api/v1/auth/account";
    return axios.get<IBackendRes<IAccount>>(urlBackend);
}

export const logoutAPI = () => {
    return axios.post<IBackendRes<null>>("/api/v1/auth/logout");
}

export const changePasswordAPI = (id: number, oldPassword: string, newPassword: string) => {
    return axios.post<IBackendRes<null>>('api/v1/auth/change-password', { id, oldPassword, newPassword });
}

/**
 * 
Module User
 */

export const createUserAPI = (fullName: string, email: string, password: string, address: string, phone: string, role: number) => {
    return axios.post<IBackendRes<IUser>>("/api/v1/users", { fullName, email, password, address, phone, role });
}

export const updateUserAPI = (id: number, fullName: string, email: string, address: string, phone: string, role: number, password: string = "123") => {
    console.log(">>> password in api:", password);
    return axios.put<IBackendRes<IUser>>(`/api/v1/users/${id}`, { fullName, email, address, phone, role, password });
}

export const deleteUserAPI = (id: number) => {
    return axios.delete<IBackendRes<null>>(`/api/v1/users/${id}`);
}

export const fetchUserAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

export const updateUserInfoAPI = (id: number, fullName: string, phone: string, avatar: string, address: string) => {
    return axios.put<IBackendRes<IUser>>('/api/v1/users/info', { id, fullName, phone, avatar, address });
}

/**
 * 
Module Permission
 */

export const createPermissionAPI = (name: string, path: string, method: string, module: string) => {
    return axios.post<IBackendRes<IPermission>>("/api/v1/permissions", { name, path, method, module });
}

export const updatePermissionAPI = (id: number, name: string, path: string, method: string, module: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`, { name, path, method, module });
}

export const deletePermissionAPI = (id: number) => {
    return axios.delete<IBackendRes<null>>(`/api/v1/permissions/${id}`);
}

export const fetchPermissionAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}


/**
 * 
Module Role
 */

export const createRoleAPI = (name: string, description: string, permissionIds: number[]) => {
    return axios.post<IBackendRes<IRole>>("/api/v1/roles", { name, description, permissionIds });
}

export const updateRoleAPI = (id: number, name: string, description: string, permissionIds: number[]) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles/${id}`, { name, description, permissionIds });
}

export const deleteRoleAPI = (id: number) => {
    return axios.delete<IBackendRes<null>>(`/api/v1/roles/${id}`);
}

export const fetchRoleAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

/**
 * 
Module Category
 */

export const createCategoryAPI = (name: string, description?: string) => {
    return axios.post<IBackendRes<ICategory>>('/api/v1/categories', { name, description });
}

export const updateCategoryAPI = (id: number, name: string, description?: string) => {
    return axios.put<IBackendRes<ICategory>>(`/api/v1/categories/${id}`, { name, description });
}

export const deleteCategoryAPI = (id: number) => {
    return axios.delete<IBackendRes<null>>(`/api/v1/categories/${id}`);
}

export const fetchCategoryAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(`/api/v1/categories?${query}`);
}


/**
 * 
Module Book
 */

export const createBookAPI = (book: IBookRequest) => {
    return axios.post<IBackendRes<IBook>>('/api/v1/books', book);
}

export const updateBookAPI = (id: number, book: IBookRequest) => {
    return axios.put<IBackendRes<IBook>>(`/api/v1/books/${id}`, book);
}

export const fetchBookByIdAPI = (id: number) => {
    return axios.get<IBackendRes<IBook>>(`/api/v1/books/${id}`);
}

export const fetchBookAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IBook>>>(`/api/v1/books?${query}`);
}


/**
 * 
Module File
 */

export const uploadFileAPI = (file: any, folder: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folder);

    return axios<IBackendRes<IUploadFile>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 * 
Module Cart
 */

export const addToCartAPI = (bookId: number, quantity: number) => {
    return axios.post<IBackendRes<ICartItem>>('/api/v1/carts', { bookId, quantity })
}

export const updateCartAPI = (bookId: number, quantity: number) => {
    return axios.put<IBackendRes<ICartItem>>('/api/v1/carts', { bookId, quantity });
}

export const removeFromCartAPI = (bookId: number) => {
    return axios.delete<IBackendRes<null>>(`/api/v1/carts/${bookId}`);
}

export const clearCartAPI = () => {
    return axios.delete<IBackendRes<null>>('/api/v1/carts/clear');
}

export const fetchCartAPI = () => {
    return axios.get<IBackendRes<ICartItem[]>>('/api/v1/carts');
}

/**
 * 
Module Order Admin
 */

export const fetchOrderAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IOrder>>>(`/api/v1/orders?${query}`);
};

export const fetchOrderByIdAPI = (id: number) => {
    return axios.get<IBackendRes<IOrder>>(`/api/v1/orders/${id}`);
};

export const createOrderAPI = (order: any) => {
    return axios.post<IBackendRes<IOrder>>('/api/v1/orders', order);
};

export const updateOrderAPI = (id: number, order: any) => {
    return axios.put<IBackendRes<IOrder>>(`/api/v1/orders/${id}`, order);
};

/**
 * 
Module Order User
 */

export const placeOrderAPI = (order: ICreateOrderRequest) => {
    return axios.post<IBackendRes<IOrder>>('/api/v1/orders', order);
}

export const getTransactionStatusAPI = (transactionId: string) => {
    return axios.get<IBackendRes<IPaymentResult>>(`/api/v1/transactions/${transactionId}`);
};

export const createPaymentUrlAPI = (paymentData: { orderId: number; amount: number; paymentMethod: string }) => {
    return axios.post<IBackendRes<IPaymentResponse>>(`/api/v1/payments`, paymentData);
};

export const historyOrderAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IOrder>>>(`/api/v1/orders/history?${query}`);
}

export const getOrderDetailAPI = (orderId: number) => {
    return axios.get<IBackendRes<IOrder>>(`/api/v1/orders/${orderId}`);
}

export const cancelOrderAPI = (orderId: number) => {
    return axios.put<IBackendRes<{ orderId: number, status: EOrderStatus }>>(`/api/v1/orders/${orderId}/cancel`);
}