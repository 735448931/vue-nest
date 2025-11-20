import { ref, readonly, type Ref } from 'vue';

/**
 * SSE 配置选项
 */
export interface SSEConfig {
	url: string;
	query?: Record<string, string | number | boolean>;
	withCredentials?: boolean;
}

/**
 * 事件监听器类型
 */
type EventListener = (data: any) => void;

/**
 * 全局 EventSource 管理器
 */
class GlobalSSEManager {
	private static instance: GlobalSSEManager;
	private eventSource: EventSource | null = null;
	private currentUrl: string = '';
	private isConnectedRef: Ref<boolean> = ref(false);
	private eventListeners: Map<string, Set<EventListener>> = new Map();

	private constructor() {}

	/**
	 * 获取单例实例
	 */
	static getInstance(): GlobalSSEManager {
		if (!GlobalSSEManager.instance) {
			GlobalSSEManager.instance = new GlobalSSEManager();
		}
		return GlobalSSEManager.instance;
	}

	/**
	 * 连接到 SSE 服务
	 * @param config SSE 配置
	 * @returns EventSource 实例
	 */
	connect(config: SSEConfig): EventSource {
		const url = this.buildUrl(config);

		// 如果已经连接到相同的 URL，直接返回现有实例
		if (this.eventSource && this.currentUrl === url) {
			console.log('复用现有 SSE 连接:', url);
			return this.eventSource;
		}

		// 如果连接到不同的 URL，先断开旧连接
		if (this.eventSource) {
			console.log('断开旧连接，建立新连接');
			this.disconnect();
		}

		// 创建新连接
		this.currentUrl = url;
		this.eventSource = new EventSource(url, {
			withCredentials: config.withCredentials ?? false,
		});

		// 设置连接事件
		this.eventSource.onopen = () => {
			console.log('SSE 连接已建立:', url);
			this.isConnectedRef.value = true;
		};

		this.eventSource.onerror = (error) => {
			console.error('SSE 连接错误:', error);
			this.isConnectedRef.value = false;
		};

		// 重新绑定所有已注册的事件监听器
		this.rebindAllListeners();

		return this.eventSource;
	}

	/**
	 * 断开 SSE 连接
	 */
	disconnect(): void {
		if (!this.eventSource) {
			return;
		}

		console.log('断开 SSE 连接:', this.currentUrl);

		// 移除所有事件监听器
		this.eventListeners.forEach((listeners, eventName) => {
			listeners.forEach(listener => {
				this.eventSource?.removeEventListener(eventName, listener as any);
			});
		});

		this.eventSource.close();
		this.eventSource = null;
		this.currentUrl = '';
		this.isConnectedRef.value = false;
	}

	/**
	 * 添加事件监听器
	 * @param eventName 事件名称
	 * @param listener 监听器函数
	 * @returns 取消监听的函数
	 */
	on(eventName: string, listener: EventListener): () => void {
		// 包装监听器以自动解析 JSON
		const wrappedListener = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				listener(data);
			} catch {
				listener(event.data);
			}
		};

		// 保存到监听器集合
		if (!this.eventListeners.has(eventName)) {
			this.eventListeners.set(eventName, new Set());
		}
		this.eventListeners.get(eventName)!.add(wrappedListener);

		// 如果已连接，立即绑定监听器
		if (this.eventSource) {
			this.eventSource.addEventListener(eventName, wrappedListener as any);
		}

		// 返回取消监听的函数
		return () => this.off(eventName, wrappedListener);
	}

	/**
	 * 移除事件监听器
	 * @param eventName 事件名称
	 * @param listener 监听器函数
	 */
	off(eventName: string, listener: EventListener): void {
		const listeners = this.eventListeners.get(eventName);
		if (!listeners) {
			return;
		}

		listeners.delete(listener);

		// 如果该事件没有监听器了，删除整个集合
		if (listeners.size === 0) {
			this.eventListeners.delete(eventName);
		}

		// 从 EventSource 移除监听器
		if (this.eventSource) {
			this.eventSource.removeEventListener(eventName, listener as any);
		}
	}

	/**
	 * 移除指定事件的所有监听器
	 * @param eventName 事件名称
	 */
	offAll(eventName: string): void {
		const listeners = this.eventListeners.get(eventName);
		if (!listeners) {
			return;
		}

		listeners.forEach(listener => {
			if (this.eventSource) {
				this.eventSource.removeEventListener(eventName, listener as any);
			}
		});

		this.eventListeners.delete(eventName);
	}

	/**
	 * 获取连接状态（只读）
	 */
	get isConnected(): Readonly<Ref<boolean>> {
		return readonly(this.isConnectedRef);
	}

	/**
	 * 获取当前连接的 URL
	 */
	get connectedUrl(): string {
		return this.currentUrl;
	}

	/**
	 * 重新绑定所有监听器
	 */
	private rebindAllListeners(): void {
		if (!this.eventSource) {
			return;
		}

		this.eventListeners.forEach((listeners, eventName) => {
			listeners.forEach(listener => {
				this.eventSource?.addEventListener(eventName, listener as any);
			});
		});
	}

	/**
	 * 构建完整的 URL（包含查询参数）
	 */
	private buildUrl(config: SSEConfig): string {
		const { url, query } = config;

		if (!query || Object.keys(query).length === 0) {
			return url;
		}

		const searchParams = new URLSearchParams();
		Object.entries(query).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		});

		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}${searchParams.toString()}`;
	}
}

/**
 * 导出全局 SSE 管理器实例
 */
export const globalSSE = GlobalSSEManager.getInstance();

