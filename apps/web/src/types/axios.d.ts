import type { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  /**
   * 强类型 AxiosInstance，拦截器返回的是 response.data
   * 因此所有方法返回 Promise<T>
   */
  export interface AxiosInstance {
    <T, D = unknown>(config: AxiosRequestConfig<D>): Promise<T>

    <T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>

    get<T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>

    post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>

    put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>

    delete<T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  }
}
