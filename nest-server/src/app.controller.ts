import {
	BadRequestException,
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpException,
	Inject,
	MaxFileSizeValidator,
	NotFoundException,
	ParseFilePipe,
	Post,
	Sse,
	UploadedFile,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	ValidationPipe
} from '@nestjs/common'
import { AppService } from './app.service'
import { isInt, IsNotEmpty, max, MaxLength } from 'class-validator'
// import { LoginGuard } from './login.guard'
import { RequireLogin, RequirePermission } from './decorator/custom-decorator'
import { firstValueFrom, Observable } from 'rxjs'
import { randomUUID } from 'crypto'
import * as qrcode from 'qrcode'
import * as os from 'os'
import { HttpService } from '@nestjs/axios'
import { RedisService } from './modules/redis/redis.service'
import dayjs from 'dayjs'
import { ConfigService } from '@nestjs/config'
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

	@Inject(HttpService)
	private httpService: HttpService

	@Inject(RedisService)
	private redisService: RedisService

	@Inject(ConfigService)
	private configService: ConfigService

	@Get('/weather')
	async getWeather() {
		const today = dayjs().format('YYYY-MM-DD')
		const weatherRedisKey = `weather:${today}`
		const cached = await this.redisService.hgetall(weatherRedisKey)
		if (cached) {
			return cached
		}

		const { data } = await firstValueFrom(
			this.httpService.get(
				`https://geoapi.qweather.com/v2/city/lookup?location=dalian&key=7f1a0468afef4a5d9fafc92c3dcf7536`
			)
		)
		const location = data.location[0]

		const { data: weatherData } = await firstValueFrom(
			this.httpService.get(
				`https://api.qweather.com/v7/weather/7d?location=${location.id}&key=7f1a0468afef4a5d9fafc92c3dcf7536`
			)
		)

		const todayWeather = {
			fxDate: weatherData.daily[0].fxDate,
			tempMin: weatherData.daily[0].tempMin,
			tempMax: weatherData.daily[0].tempMax,
			textDay: weatherData.daily[0].textDay,
			textNight: weatherData.daily[0].textNight,
			windScaleDay: weatherData.daily[0].windScaleDay,
		}

		await this.redisService.hset(weatherRedisKey, todayWeather)
		await this.redisService.expire(weatherRedisKey, 24 * 60 * 60)

		return todayWeather
	}

	@Get('/test')
	getHello(): string {		

		console.log('🍿🍿🍿🍿🍿:', this.configService.get('NEST_SERVER_PORT'),888)
		
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
			}, 2000)

			setTimeout(() => {
				observer.next({ data: { msg: 'ccc' } })
			}, 5000)
		})
	}

	@Get('qrcode/generate')
	async generate() {
		const uuid = randomUUID()
		const dataUrl = await qrcode.toDataURL(
			`http://192.168.0.3:8888/login?id=${uuid}`
		)
		return {
			qrcode_id: uuid,
			img: dataUrl
		}
	}

	@Get('status')
	status() {
		return {
			cpu: this.getCpuInfo(),
			mem: this.getMemInfo(),
			sys: this.getSysInfo()
		}
	}

	bytesToGB(bytes) {
		const gb = bytes / (1024 * 1024 * 1024)
		return gb.toFixed(2)
	}

	getMemInfo() {
		const totalMemory = os.totalmem()
		const freeMemory = os.freemem()
		const usedMemory = totalMemory - freeMemory
		const memoryUsagePercentage = (
			((totalMemory - freeMemory) / totalMemory) *
			100
		).toFixed(2)
		const mem = {
			total: this.bytesToGB(totalMemory),
			used: this.bytesToGB(usedMemory),
			free: this.bytesToGB(freeMemory),
			usage: memoryUsagePercentage
		}
		return mem
	}

	getCpuInfo() {
		const cpus = os.cpus()
		const cpuInfo = cpus.reduce(
			(info, cpu) => {
				info.cpuNum += 1
				info.user += cpu.times.user
				info.sys += cpu.times.sys
				info.idle += cpu.times.idle
				info.total += cpu.times.user + cpu.times.sys + cpu.times.idle
				return info
			},
			{ user: 0, sys: 0, idle: 0, total: 0, cpuNum: 0 }
		)
		const cpu = {
			cpuNum: cpuInfo.cpuNum,
			sys: ((cpuInfo.sys / cpuInfo.total) * 100).toFixed(2),
			used: ((cpuInfo.user / cpuInfo.total) * 100).toFixed(2),
			free: ((cpuInfo.idle / cpuInfo.total) * 100).toFixed(2)
		}
		return cpu
	}

	getSysInfo() {
		return {
			computerName: os.hostname(),
			computerIp: this.getServerIP(),
			osName: os.platform(),
			osArch: os.arch()
		}
	}

	getServerIP() {
		const nets = os.networkInterfaces() as any
		for (const name of Object.keys(nets)) {
			for (const net of nets[name]) {
				if (net.family === 'IPv4' && !net.internal) {
					return net.address
				}
			}
		}
	}
}
