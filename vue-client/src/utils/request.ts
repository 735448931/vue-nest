import axios, { AxiosError } from 'axios'

import type {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig
} from 'axios'

const config = { baseURL: import.meta.env.VITE_BASE_API, timeout: 10000 }

export interface Resonse<T = any> {
	code: number
	message: any
	data: T
}

class RequestHttp {
	private instance: AxiosInstance
	constructor() {
		this.instance = axios.create(config)
		// 请求拦截器
		this.setupInterceptorsRequest()
		// 响应拦截器
		this.setupInterceptorsResponse()
	}

	// 请求拦截器
	private setupInterceptorsRequest() {
		this.instance.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				// const token = useGlobalStore.getState().token

				// if (token) {
				// 	config.headers['Authorization'] = `Bearer ${token}`
				// }

				return config
			},
			(error: AxiosError) => {
				return Promise.reject(error.response)
			}
		)
	}

	// 响应拦截器
	private setupInterceptorsResponse() {
		this.instance.interceptors.response.use(
			(response: AxiosResponse) => {
				return response.data
			},
			(error: AxiosError) => {
				return Promise.reject(error.response?.data)
			}
		)
	}

	get<T = any>(
		url: string,
		query?: any,
		config?: AxiosRequestConfig
	): Promise<Resonse<T>> {
		let _config = {
			params: query,
			...config
		}

		return this.instance.get<Resonse<T>, Resonse<T>>(url, _config)
	}

	post<T = any>(
		url: string,
		data: any,
		config?: AxiosRequestConfig
	): Promise<Resonse<T>> {
		return this.instance.post<Resonse<T>, Resonse<T>>(url, data, config)
	}

	patch<T = any>(
		url: string,
		data: any,
		config?: AxiosRequestConfig
	): Promise<Resonse<T>> {
		return this.instance.patch<Resonse<T>, Resonse<T>>(url, data, config)
	}

	delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<Resonse<T>> {
		return this.instance.delete<Resonse<T>, Resonse<T>>(url, config)
	}
}

const request = new RequestHttp()

export default request
