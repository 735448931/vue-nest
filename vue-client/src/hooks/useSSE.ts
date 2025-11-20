import { globalSSE, type SSEConfig } from "@/utils/sse";


/**
 * Vue 组合式函数：使用全局 SSE
 * @param config SSE 配置（可选，如果不提供则只返回管理器方法）
 */
export function useSSE(config?: SSEConfig) {
    // 如果提供了配置，自动连接
    if (config) {
        globalSSE.connect(config);
    }

    return {
        connect: (cfg: SSEConfig) => globalSSE.connect(cfg),
        disconnect: () => globalSSE.disconnect(),
        on: (eventName: string, listener: EventListener) => globalSSE.on(eventName, listener),
        off: (eventName: string, listener: EventListener) => globalSSE.off(eventName, listener),
        offAll: (eventName: string) => globalSSE.offAll(eventName),
        isConnected: globalSSE.isConnected,
        connectedUrl: globalSSE.connectedUrl,
    };
}
