import { JwtService } from '@nestjs/jwt'
import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { Role } from './modules/user/entities/role.entity'
import { Reflector } from '@nestjs/core'

declare module 'express' {
	interface Request {
		user: {
			username: string
			roles: Role[]
		}
	}
}

@Injectable()
export class LoginGuard implements CanActivate {
	@Inject(JwtService)
	private jwtService: JwtService

	@Inject()
	private reflector: Reflector

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const request: Request = context.switchToHttp().getRequest()

		const requireLogin = this.reflector.getAllAndOverride('require-login', [
			context.getClass(),
			context.getHandler()
		])

		console.log(requireLogin,'requireLogin')

		if (!requireLogin) {
			return true
		}

		const authorization = request.header('authorization') || ''

		const bearer = authorization.split(' ')

		if (!bearer || bearer.length < 2) {
			throw new UnauthorizedException('登录 token 错误')
		}

		const token = bearer[1]

		try {
			const info = this.jwtService.verify(token)
			request.user = info.user
			return true
		} catch (e) {
			throw new UnauthorizedException('登录 token 失效，请重新登录')
		}
	}
}
