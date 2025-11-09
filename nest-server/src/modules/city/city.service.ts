import { Injectable } from '@nestjs/common'
import { CreateCityDto } from './dto/create-city.dto'
import { UpdateCityDto } from './dto/update-city.dto'
import { EntityManager } from 'typeorm'
import { InjectEntityManager } from '@nestjs/typeorm'
import { City } from './entities/city.entity'

@Injectable()
export class CityService {
	@InjectEntityManager()
	entityManager: EntityManager

	create(createCityDto: CreateCityDto) {
		return 'This action adds a new city'
	}

	async findAll() {
		// findAncestorsTree 是查询某个节点的所有祖先节点。
		const parent = await this.entityManager.findOne(City, {
			where: {
				name: '云南'
			}
		})
		return this.entityManager
			.getTreeRepository(City)
			.findAncestorsTree(parent!)

		// findDescendantsTree 是查询某个节点的所有后代节点
		// const parent = await this.entityManager.findOne(City, {
		// 	where: {
		// 		name: '云南'
		// 	}
		// })
		// return this.entityManager
		// 	.getTreeRepository(City)
		// 	.findDescendantsTree(parent!)

		// 查询的是所有根节点
		// return this.entityManager.getTreeRepository(City).findRoots()
	}
	findOne(id: number) {
		return `This action returns a #${id} city`
	}

	update(id: number, updateCityDto: UpdateCityDto) {
		return `This action updates a #${id} city`
	}

	remove(id: number) {
		return `This action removes a #${id} city`
	}
}
