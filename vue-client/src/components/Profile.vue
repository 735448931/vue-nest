<template>
    <el-dialog
        v-model="dialogVisible"
        :show-close="true"
        :close-on-click-modal="false"
        width="560px"
        class="profile-dialog"
        destroy-on-close
        @close="handleClose"
    >
    <div class="profile-container">
        <div class="profile-card">
            <!-- 头部背景 -->
            <div class="profile-header">
                <div class="header-bg"></div>
                <div class="avatar-wrapper">
                    <el-upload
                        class="avatar-uploader"
                        :show-file-list="false"
                        :before-upload="beforeAvatarUpload"
                        :http-request="handleAvatarUpload"
                    >
                        <div class="avatar-container">
                            <el-avatar 
                                :size="120" 
                                :src="avatarUrl" 
                                class="user-avatar"
                            >
                                <el-icon :size="50"><User /></el-icon>
                            </el-avatar>
                            <div class="avatar-overlay">
                                <el-icon :size="24"><Camera /></el-icon>
                                <span>更换头像</span>
                            </div>
                        </div>
                    </el-upload>
                </div>
            </div>

            <!-- 表单内容 -->
            <div class="profile-content">
                <h2 class="profile-title">个人信息</h2>
                
                <el-form 
                    ref="formRef"
                    :model="formData" 
                    :rules="rules"
                    label-position="top"
                    class="profile-form"
                >
                    <!-- ID 展示 -->
                    <el-form-item label="用户ID">
                        <el-input 
                            v-model="formData.id" 
                            disabled 
                            class="readonly-input"
                        >
                            <template #prefix>
                                <el-icon><Key /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 用户名展示 -->
                    <el-form-item label="用户名">
                        <el-input 
                            v-model="formData.username" 
                            disabled 
                            class="readonly-input"
                        >
                            <template #prefix>
                                <el-icon><User /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 邮箱展示 -->
                    <el-form-item label="邮箱">
                        <el-input 
                            v-model="formData.email" 
                            disabled 
                            class="readonly-input"
                        >
                            <template #prefix>
                                <el-icon><Message /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 新密码 -->
                    <el-form-item label="新密码" prop="password">
                        <el-input 
                            v-model="formData.password" 
                            type="password"
                            placeholder="请输入新密码"
                            show-password
                        >
                            <template #prefix>
                                <el-icon><Lock /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 确认密码 -->
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input 
                            v-model="formData.confirmPassword" 
                            type="password"
                            placeholder="请再次输入新密码"
                            show-password
                        >
                            <template #prefix>
                                <el-icon><Lock /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 提交按钮 -->
                    <el-form-item class="form-actions">
                        <el-button 
                            type="primary" 
                            :loading="loading"
                            @click="handleSubmit"
                            class="submit-btn"
                        >
                            <el-icon><Check /></el-icon>
                            保存修改
                        </el-button>
                        <el-button @click="handleReset" class="reset-btn">
                            <el-icon><RefreshLeft /></el-icon>
                            重置
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { User, Message, Lock, Key, Camera, Check, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage, UploadRequestOptions, type FormInstance, type FormRules, type UploadRawFile } from 'element-plus'
import { uploadAliOssApi } from '@/api/upload'
import useUserStore from '@/store/user'

// 弹窗控制
const dialogVisible = ref(false)

// 打开弹窗
const open = () => {
    dialogVisible.value = true
    // 每次打开时更新表单数据
    formData.id = userStore.userInfo?.id || ''
    formData.username = userStore.userInfo?.username || ''
    formData.email = userStore.userInfo?.email || ''
    formData.password = ''
    formData.confirmPassword = ''
}

// 关闭弹窗
const handleClose = () => {
    dialogVisible.value = false
    handleReset()
}

// 暴露方法给父组件调用
defineExpose({
    open
})

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 头像URL
const avatarUrl = computed(() => {
    return userStore.userInfo?.headPic || ''
})

// 表单数据
const formData = reactive({
    id: userStore.userInfo?.id || '',
    username: userStore.userInfo?.username || '',
    email: userStore.userInfo?.email || '',
    password: '',
    confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
    if (value && value !== formData.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

// 表单验证规则
const rules = reactive<FormRules>({
    password: [
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
})

// 头像上传前校验
const beforeAvatarUpload = (file: UploadRawFile) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
    }
    return true
}

// 头像上传
const handleAvatarUpload = async (options: UploadRequestOptions) => {
    
    const formData = new FormData()
    // 后端接的是 image
    formData.append('image', options.file)
    
    try {
        const { data } = await uploadAliOssApi(formData)
        
        userStore.setAvatar(data.url)
        ElMessage.success('头像上传成功')
    } catch (error) {
        ElMessage.error('头像上传失败')
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate(async (valid) => {
        if (valid) {
            // 检查是否有修改密码
            if (!formData.password) {
                ElMessage.warning('请输入新密码')
                return
            }
            
            if (formData.password !== formData.confirmPassword) {
                ElMessage.error('两次输入的密码不一致')
                return
            }

            loading.value = true
            try {
                // TODO: 调用修改密码接口
                // await updatePasswordApi({ password: formData.password })
                ElMessage.success('密码修改成功')
                formData.password = ''
                formData.confirmPassword = ''
            } catch (error) {
                ElMessage.error('密码修改失败')
            } finally {
                loading.value = false
            }
        }
    })
}

// 重置表单
const handleReset = () => {
    formData.password = ''
    formData.confirmPassword = ''
    formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
// 弹窗样式
:deep(.profile-dialog) {
    
    .el-dialog {
        padding: 0;
    }

    .el-dialog__header {
        display: none;
    }
    
    .el-dialog__body {
        padding: 0;
    }
}

.profile-container {
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.profile-card {
    width: 100%;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
}

.profile-header {
    position: relative;
    height: 140px;
    
    .header-bg {
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .avatar-wrapper {
        position: absolute;
        left: 50%;
        bottom: -60px;
        transform: translateX(-50%);
    }
}

.avatar-uploader {
    .avatar-container {
        position: relative;
        cursor: pointer;
        
        .user-avatar {
            border: 4px solid #fff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease;
        }
        
        .avatar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #fff;
            opacity: 0;
            transition: opacity 0.3s ease;
            
            span {
                font-size: 12px;
                margin-top: 4px;
            }
        }
        
        &:hover {
            .user-avatar {
                transform: scale(1.05);
            }
            
            .avatar-overlay {
                opacity: 1;
            }
        }
    }
}

.profile-content {
    padding: 80px 40px 40px;
    
    .profile-title {
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 30px;
    }
}

.profile-form {
    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #666;
    }
    
    :deep(.el-input__wrapper) {
        border-radius: 10px;
        padding: 8px 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        
        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        &.is-focus {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
    }
    
    .readonly-input {
        :deep(.el-input__wrapper) {
            background-color: #f8f9fa;
        }
        
        :deep(.el-input__inner) {
            color: #666;
        }
    }
}

.form-actions {
    margin-top: 20px;
    
    :deep(.el-form-item__content) {
        justify-content: center;
        gap: 15px;
    }
    
    .submit-btn {
        padding: 12px 40px;
        border-radius: 25px;
        font-size: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
    }
    
    .reset-btn {
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 16px;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
        }
    }
}

// 响应式适配
@media (max-width: 576px) {
    .profile-content {
        padding: 80px 25px 30px;
    }
    
    .form-actions {
        :deep(.el-form-item__content) {
            flex-direction: column;
        }
        
        .submit-btn,
        .reset-btn {
            width: 100%;
        }
    }
}
</style>