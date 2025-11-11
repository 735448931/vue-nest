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
import path from 'path'
import config from '../../config/config'

const OSS = require('ali-oss')

@Controller('upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	// 单张直接上传到项目目录下
	@Post('image')
	@UseInterceptors(
		FileInterceptor('image', {
			storage: storage
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
	@Post('ali-oss')
	@UseInterceptors(FileInterceptor('image'))
	async uploadAliOss(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: any
	) {
		if (!file) {
			throw new BadRequestException('No file uploaded')
		}

		const allowedMimeTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp'
		]
		const maxFileSize = 2 * 1024 * 1024

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException(
				'Only jpg, jpeg, png, webp images are allowed'
			)
		}

		if (file.size > maxFileSize) {
			throw new BadRequestException('Image size must be smaller than 2MB')
		}

		const client = new OSS({ ...config.ali_oss })

		const originalName = path.basename(file.originalname)
		const safeFileName = originalName.replace(/"/g, '')
		const timestamp = Date.now()
		const objectName = `${timestamp}-${safeFileName}`
		const encodedFileName = encodeURIComponent(safeFileName)

		const headers = {
			// 指定Object的存储类型。
			'x-oss-storage-class': 'Standard',
			// 访问时以附件形式下载，并保持上传时的文件名（支持中文）。
			'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
			// 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
			'x-oss-forbid-overwrite': 'true',
			'Content-Type': file.mimetype
		}

		if (!file.buffer && !file.path) {
			throw new BadRequestException(
				'File data is not available for upload'
			)
		}

		const result = file.buffer
			? await client.put(objectName, file.buffer, { headers })
			: await client.putStream(
					objectName,
					fs.createReadStream(file.path),
					{ headers }
				)

		console.log('🍿🍿🍿🍿🍿result:', result)

		return {
			code: 200,
			message: '成功',
			data: {
				objectName,
				url: result.url
			}
		}
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

	@Get('big-file-merge')
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
