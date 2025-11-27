import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/Layout/index.vue'

export const staticRoutes: RouteRecordRaw[] = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/page/login/index.vue')
	},
	{
		path: '/',
		name: 'Layout',
		component: Layout,
		redirect: '/dashboard',
		children: [
			{
				path: '/dashboard',
				name: 'Dashboard',
				component: () => import('@/page/dashboard/index.vue')
			},
			{
				path: '/langchain',
				name: ' Langchain',
				component: () => import('@/page/langchain/index.vue')
			},
			{
				path: '/chat',
				name: 'chat',
				component: () => import('@/views/ChatDemo.vue')
			}
		]
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes: staticRoutes,
	scrollBehavior: () => ({ left: 0, top: 0 })
})

export { router }
