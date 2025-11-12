import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { RegisterDto } from './dto/register.dto';
import * as crypto from 'crypto'
import { LoginDto } from './dto/login.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

function md5(str) {
	const hash = crypto.createHash('md5')
	hash.update(str)
	return hash.digest('hex')
}

@Injectable()
export class UserService {
	@InjectRepository(User)
	private userRepository: Repository<User>

	@InjectEntityManager()
	private manager: EntityManager

	async register(user: RegisterDto) {
		const foundUser = await this.userRepository.findOneBy({
			username: user.username
		})

		if (foundUser) {
			throw new HttpException('用户已存在', 200)
		}

		const newUser = new User()
		newUser.username = user.username
		newUser.password = md5(user.password)

		try {
			await this.userRepository.save(newUser)
			return '注册成功'
		} catch (e) {
			return '注册失败'
		}
	}

	async login(user: LoginDto) {
		// const foundUser = await this.userRepository.findOneBy({
		// 	username: user.username
		// })
		const foundUser = await this.manager.findOne(User, {
			where: {
				username: user.username
			},
			relations: {
				roles: true
			}
		})

		if (!foundUser) {
			throw new HttpException('用户名不存在', 200)
		}
		// if (foundUser.password !== md5(user.password)) {
		if (foundUser.password !== user.password) {
			throw new HttpException('密码错误', 200)
		}
		return foundUser
	}

	async initData() {
		const user1 = new User()
		user1.username = 'haoxuan1'
		user1.password = '111111'

		const user2 = new User()
		user2.username = 'haoxuan2'
		user2.password = '222222'

		const user3 = new User()
		user3.username = 'haoxuan3'
		user3.password = '333333'

		const role1 = new Role()
		role1.name = '管理员'

		const role2 = new Role()
		role2.name = '普通用户'

		const permission1 = new Permission()
		permission1.name = '新增 aaa'

		const permission2 = new Permission()
		permission2.name = '修改 aaa'

		const permission3 = new Permission()
		permission3.name = '删除 aaa'

		const permission4 = new Permission()
		permission4.name = '查询 aaa'

		const permission5 = new Permission()
		permission5.name = '新增 bbb'

		const permission6 = new Permission()
		permission6.name = '修改 bbb'

		const permission7 = new Permission()
		permission7.name = '删除 bbb'

		const permission8 = new Permission()
		permission8.name = '查询 bbb'

		role1.permissions = [
			permission1,
			permission2,
			permission3,
			permission4,
			permission5,
			permission6,
			permission7,
			permission8
		]

		role2.permissions = [permission1, permission2, permission3, permission4]

		user1.roles = [role1]

		user2.roles = [role2]

		await this.manager.save(Permission, [
			permission1,
			permission2,
			permission3,
			permission4,
			permission5,
			permission6,
			permission7,
			permission8
		])

		await this.manager.save(Role, [role1, role2])

		await this.manager.save(User, [user1, user2, user3])
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
