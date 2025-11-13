export type LoginType = 'account' | 'phone' | 'email' | 'github'

export interface AccountLoginParams {
	username: string
	password: string
	type: 'account'
}


export interface EmailLoginParams {
	email: string
	code: string
	type: 'email'
}

export type LoginParams =
	| AccountLoginParams
	| EmailLoginParams

export interface RegisterParams {
	username: string
	password: string
	phone?: string
	email: string
	code: string
}
