import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Query,
	UploadedFile,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common'
import { UploadService } from './upload.service'
import {
	AnyFilesInterceptor,
	FileInterceptor,
	FilesInterceptor
} from '@nestjs/platform-express'
import { storage } from '../../config/upload-file-storage'
import { UploadImageParsePipe } from './pipes/upload-image-parse.pipe'
import fs from 'fs'
import config from '../../config/config'

const OSS = require('ali-oss')

@Controller('upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	// 单张直接上传到项目目录下
	@Post('image')
	@UseInterceptors(
		FileInterceptor('image', {
			storage:storage
		})
	)
	uploadImageFile(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: { field: string }
	) {
		console.log('body', body)
		console.log('file', file)

		return {
			code: 200,
			message: '成功'
		}
	}

	// 上传到阿里云 oss
	@Post('image-ali-oss')
	async uploadAliOss(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: any
	) {
		if (!file) {
			throw new BadRequestException('No file uploaded')
		}
		const client = new OSS({ ...config.ali_oss })

		const headers = {
			// 指定Object的存储类型。
			'x-oss-storage-class': 'Standard',
			// 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.txt。
			'Content-Disposition': 'attachment; filename="1.png"',
			// 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
			'x-oss-forbid-overwrite': 'true'
		}

		const result = await client.put('cat.png', './mao.png', { headers })

		return 'This action adds a new user'
	}

	// // 指定 storage 的方式
	// @Post('image')
	// @UseInterceptors(
	// 	AnyFilesInterceptor({
	// 		storage: storage
	// 	})
	// )
	// uploadAnyFile(@UploadedFile() file: Express.Multer.File, @Body() body) {
	// 	console.log('body', body)
	// 	console.log('file', file)
	// }

	// // 添加文件大小和类型的校验
	// @Post('image')
	// @UseInterceptors(
	// 	FileInterceptor('image', {
	// 		dest: 'uploads'
	// 	})
	// )
	// uploadFile(
	// 	@UploadedFile(new UploadImageParsePipe())
	// 	file: Express.Multer.File,
	// 	@Body() body
	// ) {
	// 	console.log('body', body)
	// 	console.log('file', file)
	// }

	// 多张上传
	@Post('images')
	@UseInterceptors(
		FilesInterceptor('images', 3, {
			dest: 'uploads'
		})
	)
	uploadFiles(
		@UploadedFiles() files: Array<Express.Multer.File>,
		@Body() body
	) {
		console.log('body', body)
		console.log('files', files)
	}

	// 大文件分片上传
	@Post('big-file')
	@UseInterceptors(
		FilesInterceptor('files', 20, {
			dest: 'uploads'
		})
	)
	uploadBigFile(
		@UploadedFiles() files: Array<Express.Multer.File>,
		@Body() body
	) {
		console.log('body', body)
		console.log('files', files)

		const fileName = body.name.match(/(.+)\-\d+$/)[1]
		const chunkDir = 'uploads/chunks_' + fileName

		if (!fs.existsSync(chunkDir)) {
			fs.mkdirSync(chunkDir)
		}
		fs.cpSync(files[0].path, chunkDir + '/' + body.name)
		fs.rmSync(files[0].path)
	}

	@Get('merge')
	merge(@Query('name') name: string) {
		const chunkDir = 'uploads/chunks_' + name

		const files = fs.readdirSync(chunkDir)

		let count = 0
		let startPos = 0
		files.map((file) => {
			const filePath = chunkDir + '/' + file
			const stream = fs.createReadStream(filePath)
			stream
				.pipe(
					fs.createWriteStream('uploads/' + name, {
						start: startPos
					})
				)
				.on('finish', () => {
					count++

					if (count === files.length) {
						fs.rm(
							chunkDir,
							{
								recursive: true
							},
							() => {}
						)
					}
				})

			startPos += fs.statSync(filePath).size
		})
	}
}
