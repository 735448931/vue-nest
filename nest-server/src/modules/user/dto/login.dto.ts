import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator'

export class LoginDto {


	@IsNotEmpty()
	username?: string

	@IsNotEmpty()
	password?: string

}
