import { Body, Controller, FileTypeValidator, Get, HttpException, Inject, MaxFileSizeValidator, ParseFilePipe, Post, Sse, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common'
import { AppService } from './app.service'
import { isInt, IsNotEmpty, max, MaxLength } from 'class-validator'
import { LoginGuard } from './login.guard'
import { RequireLogin, RequirePermission } from './custom-decorator'
import { Observable } from 'rxjs'
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
		console.log(obj)
	}

	@RequireLogin()
	@Get('aaa')
	aaa() {
		return 'aaa'
	}

	@Get('bbb')
	@RequirePermission('查询 bbb')
	bbb() {
		return 'bbb'
	}

	// SSE数据推送
	@Sse('stream')
	stream() {
		return new Observable((observer) => { 
			observer.next({ data: { msg: 'aaa' } })
			
			setTimeout(() => {
				observer.next({ data: { msg: 'bbb' } })
			}, 2000);

			setTimeout(() => {
				observer.next({ data: { msg: 'ccc' } })
			}, 5000);
		})
	}
}
