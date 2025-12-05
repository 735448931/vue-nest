import { loginApi } from '@/api/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'


const useUserStore = defineStore('user', () => {
    
    const userId = ref<string>('')

    const userInfo = ref<any>({})

    const setUserId = (id: string) => {
        userId.value = id
    }
    const setAvatar = (url: string) => {
        userInfo.value.headPic = url
    }

    const handleLogin = async (query: { username: string, password: string }) => {
        const { data } = await loginApi(query)
        setUserId(data.id)
        userInfo.value = data
    }
    

    return {
        userId,
        userInfo,
        setUserId,
        setAvatar,
        handleLogin
    }
    
})

export default useUserStore
