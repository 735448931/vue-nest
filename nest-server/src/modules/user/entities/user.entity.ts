import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
	name: 'aaa_user'
})
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		name: 'name',
		length: 50
	})
	name: string
}
