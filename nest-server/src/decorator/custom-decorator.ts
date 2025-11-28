import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'

export const RequireLogin = () => SetMetadata('require-login', true)

export const RequirePermission = (...permissions: string[]) =>
	SetMetadata('require-permission', permissions)

/**
 * 获取请求头中的 user-id
 * 使用方式: @UserId() userId: string
 */
export const UserId = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		const userId = request.headers['user-id']
		return Number(userId) // 在装饰器内部转换
	}
)