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
    },
    result: T[];
}

export interface IAccount {
    access_token: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        phone: string;
        avatar: string;
        role: string;
        permissions: {
            id: number;
            name: string;
            path: string;
            method: string;
            module: string;
        }[]
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface IUser {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    address: string;
    active: boolean;
    role?: {
        id: number;
        name: string;
    }
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