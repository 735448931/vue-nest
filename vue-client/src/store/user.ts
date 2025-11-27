import { defineStore } from 'pinia'
import { ref } from 'vue'


const useUserStore = defineStore('user', () => {
    
    const userId = ref<string>('')


    const setUserId = (id: string) => {
        userId.value = id
    }

    return {
        userId,
        setUserId
    }
    
})

export default useUserStore
