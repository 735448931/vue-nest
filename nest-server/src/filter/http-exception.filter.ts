import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	ExceptionFilter,
	HttpException
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const http = host.switchToHttp()
		const response = http.getResponse<Response>()
		const statusCode = exception.getStatus()

		const res = exception.getResponse() as { message: string[] }

		response.status(statusCode).json({
			code: statusCode,
			message: res?.message?.join
				? res?.message?.join(',')
				: exception.message,
			data:'Error'
		})
	}
}

// BadRequestException 		参数错误
// UnauthorizedException 	未授权
// NotFoundException 		找不到资源
// ForbiddenException 		没有权限
// NotAcceptableException 	不可接受的请求
// RequestTimeoutException 	请求超时
// ConflictException 		资源冲突
// GoneException 			资源已删除
// HttpVersionNotSupportedException HTTP 版本不支持
// PayloadTooLargeException 		请求体过大
// UnsupportedMediaTypeException 	不支持的媒体类型
// UnprocessableEntityException 	无法处理的实体
// InternalServerErrorException 	服务器内部错误
// NotImplementedException 			功能未实现
// MethodNotAllowedException 		请求方法不允许
// BadGatewayException 				无效网关
// ServiceUnavailableException 		服务不可用
// GatewayTimeoutException 			网关超时
// PreconditionFailedException 		先决条件失败