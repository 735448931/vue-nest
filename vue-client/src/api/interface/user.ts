
export interface LoginParams {
	username: string
	password: string
}

export interface RegisterParams {
	username: string
	password: string
	phone?: string
	email: string
	code: string
}
