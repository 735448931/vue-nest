import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { UserService } from './modules/user/user.service'
import { Permission } from './modules/user/entities/permission.entity'
import { Reflector } from '@nestjs/core'

@Injectable()
export class PermissionGuard implements CanActivate {
	@Inject(UserService)
	private userService: UserService

	@Inject(Reflector)
	private reflector: Reflector

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest()

		console.log('🍿🍿🍿🍿🍿request.user:', request.user)

		if (!request.user) {
			return true
		}

		const roles = await this.userService.findRolesByIds(
			request.user.roles.map((item) => item.id)
		)

		const permissions: Permission[] = roles.reduce<Permission[]>(
			(total, current) => {
				total.push(...current.permissions)
				return total
			},
			[] as Permission[]
		)

		console.log('🍿🍿🍿🍿🍿permissions:', permissions)

		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
			'require-permission',
			[context.getClass(), context.getHandler()]
		)

		console.log(requiredPermissions, 'requiredPermissions')

    if (requiredPermissions && requiredPermissions.length > 0) { 

      for (let i = 0; i < requiredPermissions.length; i++) {
			const curPermission = requiredPermissions[i]
			const found = permissions.find(
				(item) => item.name === curPermission
			)
			if (!found) {
				throw new UnauthorizedException('您没有访问该接口的权限')
			}
		}

    }

		return true
	}
}
