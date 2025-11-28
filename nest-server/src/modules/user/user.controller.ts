import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Res, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { type Response } from 'express'
import { UserId } from 'src/decorator/custom-decorator';
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Inject(JwtService)
	private jwtService: JwtService

	// 用户注册
	@Post('register')
	async register(@Body(ValidationPipe) user: RegisterDto) {
		return await this.userService.register(user)
	}

	// 用户登录
	@Post('login')
	async login(
		@Body(ValidationPipe) user: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {

		const foundUser = await this.userService.login(user)

		console.log('🍿🍿🍿🍿🍿foundUser:', foundUser)

		if (foundUser) {
			// const token = await this.jwtService.signAsync({
			// 	user: {
			// 		id: foundUser.id,
			// 		username: foundUser.username,
			// 		roles: foundUser.roles
			// 	}
			// })
			// res.setHeader('token', token)
			return foundUser
		} else {
			return 'login fail'
		}
	}

	@Get('init-data')
	async initData() {
		await this.userService.initData()
		return 'done'
	}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto)
	}

	// 获取除了自己的所有用户
	@Get('allExceptSelf')
	findAllExceptSelf(@UserId() userId: number) {
		return this.userService.findAllExceptSelf(userId)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.findOne(+id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(+id, updateUserDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.userService.remove(+id)
	}
}
