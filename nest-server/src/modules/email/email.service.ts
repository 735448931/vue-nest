import { Injectable } from '@nestjs/common'
import { createTransport, Transporter } from 'nodemailer'

@Injectable()
export class EmailService {
    transporter: Transporter
    

	constructor() {
		this.transporter = createTransport({
			host: 'smtp.163.com',
			port: 465,
			secure: true,
			auth: {
				user: '17640659681@163.com',
				pass: 'BNZKxu4tAU5VLPGe'
			}
		})
	}

    async sendMail({ to, subject, html }) {
		await this.transporter.sendMail({
			from: {
				name: '地坛在我',
				address: '17640659681@163.com'
			},
			to,
			subject,
			html
		})
	}
}
