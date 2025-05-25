import axios from 'axios'

// https://github.com/axios/axios/issues/1510#issuecomment-448201698
declare module 'axios' {
    export interface AxiosResponse<T = any> extends Promise<T> { }
}