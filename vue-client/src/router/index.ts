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
		component: Layout,
		name: 'Layout',
		// children: [
			// {
			// 	path: 'dashboard',
			// 	component: () => import('@/page/dashboard/index.vue')
			// },
		// ]
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes: staticRoutes,
	scrollBehavior: () => ({ left: 0, top: 0 })
})

export { router }
