import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginTypeEnum } from 'src/enum/loginType.enum';
import { RedisService } from '../redis/redis.service';
import { md5 } from 'src/shared/lib';




@Injectable()
export class UserService {
	@InjectRepository(User)
	private userRepository: Repository<User>

	@InjectEntityManager()
	private manager: EntityManager

	@Inject()
	private redisService: RedisService

	constructor() {}

	// 用户注册
	async register(user: RegisterDto) {
		const foundUser = await this.userRepository.findOneBy({
			username: user.username
		})

		if (foundUser) {
			throw new BadRequestException('用户已存在')
		}

		const codeKey =  await this.redisService.get(`code_${user.email}:S`)

		if (codeKey && codeKey !== user.code) {
			throw new BadRequestException('验证码错误')
		}


		const newUser = new User()
		newUser.username = user.username
		newUser.password = md5(user.password)
		newUser.email = user.email

		try {
			await this.userRepository.save(newUser)
			return '注册成功'
		} catch (e) {
			throw new InternalServerErrorException('注册失败')
		}
	}

	async login(user: LoginDto) {

		console.log('🍿🍿🍿🍿🍿user:', user)

		const foundUser = await this.userRepository.findOneBy({
			username: user.username
		})
		// const foundUser = await this.manager.findOne(User, {
		// 	where: {
		// 		username: user.username
		// 	},
		// 	// relations: {
		// 	// 	roles: true
		// 	// }
		// })

		if (!foundUser) {
			throw new HttpException('用户名不存在', 200)
		}
		if (foundUser.password !== md5(user.password)) {
			throw new HttpException('密码错误', 200)
		}

		return foundUser
	}

	async findRolesByIds(roleIds: number[]) {
		return this.manager.find(Role, {
			where: {
				id: In(roleIds)
			},
			relations: {
				permissions: true
			}
		})
	}

	create(createUserDto: CreateUserDto) {
		this.manager.save(User, createUserDto)
	}

	findAll() {
		return this.manager.find(User)
	}

	findOne(id: number) {
		return this.manager.findOne(User, {
			where: { id }
		})
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		this.manager.save(User, {
			id: id,
			...updateUserDto
		})
	}

	remove(id: number) {
		this.manager.delete(User, id)
	}
}
