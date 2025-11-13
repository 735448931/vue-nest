import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator'
import { LoginTypeEnum } from 'src/enum/loginType.enum'



export class LoginDto {
	@IsEnum(LoginTypeEnum)
	type: LoginTypeEnum

	@ValidateIf((dto) => dto.type === LoginTypeEnum.Account)
	@IsNotEmpty()
	username?: string

	@ValidateIf((dto) => dto.type === LoginTypeEnum.Account)
	@IsNotEmpty()
	password?: string

	@ValidateIf((dto) => dto.type === LoginTypeEnum.Phone)
	@IsPhoneNumber('CN')
	phone?: string

	@ValidateIf((dto) => dto.type === LoginTypeEnum.Email)
	@IsEmail()
	email?: string

	@ValidateIf(
		(dto) => dto.type === LoginTypeEnum.Phone || dto.type === LoginTypeEnum.Email
	)
	@IsNotEmpty()
	code?: string
}
