import request from '@/utils/request'

// 上传单张图片
export const uploadImageApi = (form: FormData) => {
	return request.post('/upload/image', form, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}

// 上传多张图片
export const uploadImagesApi = (form: FormData) => {
	return request.post('/upload/images', form, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}


// 分片上传


// 分片上传全部结束接口