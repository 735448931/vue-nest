<template>
    <div class="login-container">
        <!-- 动态背景装饰 -->
        <div class="background-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>

        <div class="login-card glass-effect">
            <header class="card-header">
                <div class="logo-container">
                    <div class="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <h1 class="brand">Vue Nest Project</h1>
                <p class="subtitle">开启您的即时通讯之旅</p>
            </header>

            <el-tabs v-model="activeTab" stretch class="custom-tabs">
                <el-tab-pane label="账户登录" name="account">
                    <div class="tab-pane fade-in">
                        <el-form ref="accountFormRef" :model="accountForm" :rules="accountRules" label-position="top" size="large">
                            <el-form-item prop="username">
                                <el-input v-model="accountForm.username" placeholder="请输入用户名" :prefix-icon="UserIcon" clearable />
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input v-model="accountForm.password" type="password" placeholder="请输入密码" :prefix-icon="LockIcon"
                                    show-password />
                            </el-form-item>
                            <div class="form-footer">
                                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                                <el-link type="primary" underline="never" class="forgot-pwd">忘记密码？</el-link>
                            </div>
                            <el-button type="primary" class="submit-btn gradient-btn" :loading="isSubmitting"
                                @click="handleAccountLogin" round>
                                立即登录
                            </el-button>
                        </el-form>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="快速登录" name="third">
                    <div class="tab-pane third-login fade-in">
                        <p class="hint">选择以下方式快速开始</p>
                        <div class="social-buttons">
                            <button class="social-btn github" @click="handleGithubLogin">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                <span>GitHub</span>
                            </button>
                            <button class="social-btn wechat" @click="handleWechatLogin">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M8.696 15.866c-.224 0-.435.016-.635.045-.975.14-1.866.53-2.616 1.085-1.385-1.025-3.36-1.025-4.745 0-.135.1-.27.21-.395.325-.025.025-.04.06-.04.095 0 .025.01.05.025.07.565.665 1.19 1.275 1.87 1.82.025.02.06.025.09.01.4-.215.835-.375 1.29-.47.29-.06.59-.095.895-.095.86 0 1.665.265 2.35.72.025.015.055.015.08 0 .685-.455 1.49-.72 2.35-.72.305 0 .605.035.895.095.455.095.89.255 1.29.47.03.015.065.01.09-.01.68-.545 1.305-1.155 1.87-1.82.015-.02.025-.045.025-.07 0-.035-.015-.07-.04-.095-.125-.115-.26-.225-.395-.325-1.385-1.025-3.36-1.025-4.745 0-.75-.555-1.64-.945-2.615-1.085-.2-.03-.41-.045-.635-.045zm8.696-6.42c-3.615 0-6.55 2.635-6.55 5.89 0 3.255 2.935 5.89 6.55 5.89 3.615 0 6.55-2.635 6.55-5.89 0-3.255-2.935-5.89-6.55-5.89zM5.42 2.945C2.425 2.945 0 5.13 0 7.825c0 2.695 2.425 4.88 5.42 4.88 2.995 0 5.42-2.185 5.42-4.88 0-2.695-2.425-4.88-5.42-4.88z"/>
                                </svg>
                                <span>WeChat</span>
                            </button>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="注册账号" name="register">
                    <div class="tab-pane fade-in">
                        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules"
                            label-position="top" size="large">
                            <el-form-item prop="username">
                                <el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="UserIcon" clearable />
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input v-model="registerForm.password" type="password" placeholder="设置密码" :prefix-icon="LockIcon"
                                    show-password />
                            </el-form-item>
                            <el-form-item prop="email">
                                <el-input v-model="registerForm.email" placeholder="请输入邮箱" :prefix-icon="MessageIcon" clearable />
                            </el-form-item>
                            <el-form-item prop="code">
                                <div class="code-input-group">
                                    <el-input v-model="registerForm.code" placeholder="验证码" :prefix-icon="KeyIcon" clearable />
                                    <el-button :disabled="countdown > 0" @click="handleSendCode" class="code-btn" :type="countdown > 0 ? 'info' : 'primary'" plain>
                                        {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                                    </el-button>
                                </div>
                            </el-form-item>
                        </el-form>
                        <div class="form-actions">
                            <el-button class="flex-1 back-btn" @click="switchToLogin" plain round>返回登录</el-button>
                            <el-button type="primary" class="flex-1 gradient-btn" :loading="registerSubmitting"
                                @click="handleRegister" round>立即注册</el-button>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <footer class="card-footer" v-if="activeTab !== 'register'">
                <span>还没有账号？</span>
                <el-link type="primary" underline="never" @click="switchToRegister" class="register-link">立即注册</el-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
import { User as UserIcon, Lock as LockIcon, Message as MessageIcon, Key as KeyIcon } from '@element-plus/icons-vue'
import { getEmailCodeApi, loginApi, registerApi } from '@/api/user'
import useUserStore from '@/store/user'
import { router } from '@/router'
import useChatStore from '@/store/chat'

type TabName = 'account'  | 'third' | 'register'

const activeTab = ref<TabName>('account')
const rememberMe = ref(true)
const isSubmitting = ref(false)
const countdown = ref(0)
const registerSubmitting = ref(false)
const userStore = useUserStore()
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

		const {data} = await loginApi({
			username: accountForm.username,
			password: accountForm.password,
		})

		console.log('🍿🍿🍿🍿🍿data:', data);

		userStore.setUserId(data.id)
		
        
		ElMessage.success('登录成功')

		router.push('/dashboard')

		const chatStore = useChatStore()
		await chatStore.login()

		
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
.login-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    box-sizing: border-box;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
}

/* 动态背景形状 */
.background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
}

.shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float 20s infinite;
}

.shape-1 {
    top: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: #4facfe;
    animation-delay: 0s;
}

.shape-2 {
    bottom: -10%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: #f093fb;
    animation-delay: -5s;
}

.shape-3 {
    top: 40%;
    left: 40%;
    width: 300px;
    height: 300px;
    background: #8fd3f4;
    animation-delay: -10s;
}

@keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -50px) rotate(10deg); }
    66% { transform: translate(-20px, 20px) rotate(-5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
}

/* 玻璃拟态卡片 */
.login-card {
    position: relative;
    z-index: 1;
    width: 440px;
    padding: 40px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25);
    }
}

.card-header {
    text-align: center;
    margin-bottom: 32px;
}

.logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
}

.logo-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 8px 16px rgba(118, 75, 162, 0.3);
    
    svg {
        width: 36px;
        height: 36px;
    }
}

.brand {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
}

.subtitle {
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 15px;
}

/* 自定义 Tabs */
.custom-tabs :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: rgba(0, 0, 0, 0.05);
}

.custom-tabs :deep(.el-tabs__item) {
    font-size: 16px;
    color: #6b7280;
    transition: all 0.3s;
    
    &.is-active {
        color: #764ba2;
        font-weight: 600;
    }
    
    &:hover {
        color: #667eea;
    }
}

.custom-tabs :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #667eea, #764ba2);
    height: 3px;
    border-radius: 3px;
}

.tab-pane {
    padding-top: 10px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* 表单样式优化 */
:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
    border-radius: 12px;
    padding: 8px 12px;
    background-color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s;

    &:hover {
        box-shadow: 0 0 0 1px rgba(118, 75, 162, 0.3) inset;
        background-color: rgba(255, 255, 255, 0.8);
    }

    &.is-focus {
        box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.2) inset !important;
        background-color: #fff;
    }
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #374151;
}

.form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.forgot-pwd {
    font-size: 14px;
    color: #667eea;
    
    &:hover {
        color: #764ba2;
    }
}

/* 按钮样式 */
.submit-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    border: none;
}

.gradient-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(118, 75, 162, 0.4);
        opacity: 0.95;
    }
    
    &:active {
        transform: translateY(0);
    }
}

/* 第三方登录 */
.third-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
}

.hint {
    margin: 0;
    color: #9ca3af;
    font-size: 14px;
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    
    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(0, 0, 0, 0.05);
        margin: 0 16px;
    }
}

.social-buttons {
    display: flex;
    gap: 16px;
    width: 100%;
}

.social-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: white;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    color: #374151;
    transition: all 0.3s;

    svg {
        transition: transform 0.3s;
    }

    &:hover {
        border-color: rgba(0, 0, 0, 0.15);
        background: #f9fafb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

        svg {
            transform: scale(1.1);
        }
    }

    &.github:hover {
        color: #24292e;
        border-color: #24292e;
    }

    &.wechat:hover {
        color: #07c160;
        border-color: #07c160;
    }
}

/* 注册表单 */
.code-input-group {
    display: flex;
    gap: 12px;
    
    .el-input {
        flex: 1;
    }
}

.code-btn {
    width: 110px;
    border-radius: 12px;
}

.form-actions {
    display: flex;
    gap: 16px;
    margin-top: 12px;
}

.back-btn {
    height: 44px;
    font-size: 15px;
    border-radius: 12px;
    
    &:hover {
        color: #667eea;
        border-color: #667eea;
        background-color: rgba(102, 126, 234, 0.05);
    }
}

.flex-1 {
    flex: 1;
}

/* 底部 */
.card-footer {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 14px;
}

.register-link {
    font-weight: 600;
    color: #667eea;
    
    &:hover {
        color: #764ba2;
    }
}

/* 动画 */
.fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>