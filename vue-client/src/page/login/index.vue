<template>
    <div class="login-wrapper">
        <div class="login-card">
            <header class="card-header">
                <h1 class="brand">Vue Nest Project</h1>
                <p class="subtitle">请选择登录方式进入系统</p>
            </header>

            <el-tabs v-model="activeTab" stretch>
                <el-tab-pane label="账户登录" name="account">
                    <div class="tab-pane">
                        <el-form ref="accountFormRef" :model="accountForm" :rules="accountRules" label-position="top">
                            <el-form-item label="用户名" prop="username">
                                <el-input v-model="accountForm.username" placeholder="请输入用户名" clearable />
                            </el-form-item>
                            <el-form-item label="密码" prop="password">
                                <el-input v-model="accountForm.password" type="password" placeholder="请输入密码"
                                    show-password />
                            </el-form-item>
                            <div class="form-footer">
                                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                                <el-link type="primary" underline="never">忘记密码？</el-link>
                            </div>
                            <el-button type="primary" class="submit-btn" :loading="isSubmitting"
                                @click="handleAccountLogin">
                                登录
                            </el-button>
                        </el-form>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="第三方登录" name="third">
                    <div class="tab-pane third-login">
                        <p class="hint">使用企业或社交账号登录</p>
                        <el-button type="primary" plain class="oauth-btn" @click="handleGithubLogin">
                            通过 GitHub 登录
                        </el-button>
                        <el-button plain class="oauth-btn" @click="handleWechatLogin">
                            通过微信登录
                        </el-button>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="注册账号" name="register">
                    <div class="tab-pane">
                        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules"
                            label-position="top">
                            <el-form-item label="用户名" prop="username">
                                <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
                            </el-form-item>
                            <el-form-item label="密码" prop="password">
                                <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"
                                    show-password />
                            </el-form-item>
                            <el-form-item label="邮箱" prop="email">
                                <el-input v-model="registerForm.email" placeholder="请输入邮箱" clearable />
                            </el-form-item>
                            <el-form-item label="验证码" prop="code">
                                <el-input v-model="registerForm.code" placeholder="请输入验证码" clearable />
                                <el-button :disabled="countdown > 0" @click="handleSendCode" style="margin-top: 8px;">
                                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                        <div class="form-actions">
                            <el-button class="flex-1" @click="switchToLogin">返回登录</el-button>
                            <el-button type="primary" class="flex-1" :loading="registerSubmitting"
                                @click="handleRegister">注册</el-button>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <footer class="card-footer">
                <span>没有账号？</span>
                <el-link type="primary" underline="never" @click="switchToRegister">立即注册</el-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
import { getEmailCodeApi, loginApi, registerApi } from '@/api/user'

type TabName = 'account'  | 'third' | 'register'

const activeTab = ref<TabName>('account')
const rememberMe = ref(true)
const isSubmitting = ref(false)
const countdown = ref(0)
const registerSubmitting = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const accountForm = reactive({
	username: '',
	password: '',
})



const registerForm = reactive({
	username: '',
	password: '',
	email: '',
	code: '',
})

const accountFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const accountRules: FormRules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}


const registerRules: FormRules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleAccountLogin = async () => {
	if (!accountFormRef.value) return
	try {
		isSubmitting.value = true
        await accountFormRef.value.validate()

		await loginApi({
			username: accountForm.username,
			password: accountForm.password,
			type: 'account'
		})
        
		ElMessage.success('登录成功')
	} catch (error) {
		ElMessage.error('请完善登录信息')
	} finally {
		isSubmitting.value = false
	}
}



const handleSendCode = async () => {
	if (registerForm.email.trim() === '') {
		ElMessage.error('请输入邮箱地址')
		return
	}

	ElMessage.success('验证码已发送')

	await getEmailCodeApi({ email: registerForm.email })

	

	countdown.value = 60
	timer = setInterval(() => {
		countdown.value -= 1
		if (countdown.value <= 0) {
			countdown.value = 0
			if (timer) {
				clearInterval(timer)
				timer = null
			}
		}
	}, 1000)
}

const handleGithubLogin = () => {
	// TODO: 跳转 GitHub OAuth
	ElMessage.info('即将跳转 GitHub OAuth 登录')
}

const handleWechatLogin = () => {
	// TODO: 跳转微信扫码登录
	ElMessage.info('即将跳转微信扫码登录')
}

const switchToLogin = () => {
	activeTab.value = 'account'
}

const resetRegisterForm = () => {
	registerForm.username = ''
	registerForm.password = ''
	registerForm.email = ''
	if (registerFormRef.value) {
		registerFormRef.value.clearValidate()
	}
}

const handleRegister = async () => {
	if (!registerFormRef.value) return
	try {
		registerSubmitting.value = true
		await registerFormRef.value.validate()
		const registeredUsername = registerForm.username
		await registerApi({
			username: registeredUsername,
			password: registerForm.password,
			email: registerForm.email ,
			code: registerForm.code ,
		})
		ElMessage.success('注册成功')
		activeTab.value = 'account'
		accountForm.username = registeredUsername
		resetRegisterForm()
	} catch (error: any) {
		if (error?.fields) {
			ElMessage.error('请完善注册信息')
			return
		}
		const message =
			error?.response?.data?.message || error?.message || '注册失败，请稍后再试'
		ElMessage.error(message)
	} finally {
		registerSubmitting.value = false
	}
}

const switchToRegister = () => {
	resetRegisterForm()
	activeTab.value = 'register'
}

onBeforeUnmount(() => {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
})
</script>

<style scoped lang="scss">
.login-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 24px;
	box-sizing: border-box;
}

.login-card {
	width: 420px;
	padding: 36px;
	border-radius: 16px;
	background: #fff;
	box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
}

.card-header {
	text-align: center;
	margin-bottom: 24px;
}

.login-card :deep(.el-tabs) {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.login-card :deep(.el-tabs__content) {
	flex: 1;
	display: flex;
}

.login-card :deep(.el-tab-pane) {
	flex: 1;
	display: flex;
}

.tab-pane {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
	justify-content: center;
	min-height: 280px;
}

.tab-pane :deep(.el-form) {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.brand {
	margin: 0;
	font-size: 28px;
	font-weight: 600;
	color: #1f2937;
}

.subtitle {
	margin: 8px 0 0;
	color: #6b7280;
	font-size: 14px;
}

.form-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.submit-btn {
	width: 100%;
}

.third-login {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 12px 0;
}

.hint {
	margin: 0;
	color: #6b7280;
	font-size: 14px;
}

.oauth-btn {
	width: 100%;
}

.card-footer {
	margin-top: 24px;
	display: flex;
	justify-content: center;
	gap: 8px;
	color: #6b7280;
}

.form-actions {
	display: flex;
	gap: 12px;
	margin-top: 8px;
}

.flex-1 {
	flex: 1;
}
</style>