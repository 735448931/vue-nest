import axios, { AxiosError } from 'axios'

import type {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig
} from 'axios'

const config = { baseURL: import.meta.env.VITE_BASE_API, timeout: 10000 }

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
	): Promise<T> {
		if (query?.filter) {
			query.filter = JSON.stringify(query.filter)
		}

		if (query?.sort) {
			query.sort = JSON.stringify(query.sort)
		}

		let _config = {
			params: query,
			...config
		}

		return this.instance.get(url, _config)
	}

	post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
		return this.instance.post(url, data, config)
	}

	patch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
		return this.instance.patch(url, data, config)
	}

	delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.instance.delete(url, config)
	}
}

const request = new RequestHttp()

export default request
