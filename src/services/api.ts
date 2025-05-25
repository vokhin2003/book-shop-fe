import { IAccount, IBackendRes, IModelPaginate, IPermission, IRole, IUser } from "@/types/backend";
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