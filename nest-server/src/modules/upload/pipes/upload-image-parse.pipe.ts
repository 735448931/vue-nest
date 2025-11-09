import { FileTypeValidator, HttpException, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common'

export class UploadImageParsePipe extends ParseFilePipe {
  constructor() {
    super({
		exceptionFactory: (err) => {
			throw new HttpException('xxx' + err, 500)
		},
		// 还有一个问题 上传所有文件都会被先写到硬盘,检验无效 
		validators: [
			new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
			new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png)/,skipMagicNumbersValidation:true })
		]
	})
  }
}
