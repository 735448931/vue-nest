import { Body, Controller, FileTypeValidator, Get, HttpException, Inject, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UploadedFiles, UseInterceptors, ValidationPipe } from '@nestjs/common'
import { AppService } from './app.service'
import { isInt, IsNotEmpty, max, MaxLength } from 'class-validator'
export class Ooo {
	@MaxLength(5)
	name: string
	@IsNotEmpty({ message: 'aaa 不能为空' })
	test: string
	age: number
	sex: boolean
	hobbies: Array<string>
}


@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	// @Inject(AppService)
	// private appService:AppService

	@Get('/test')
	getHello(): string {
		return this.appService.getHello()
	}
	@Post('/test-post')
	ooo(@Body() obj: Ooo) {
		console.log(obj);
		
	}
}
