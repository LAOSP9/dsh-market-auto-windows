// Auto Windows 高危工具客户端强制审批插件（DSH 插件）
// 对 mcp__auto-windows__ 的高危工具返回 tools/pre-execute ask 决策，
// 由 DSH 原生审批服务（dsh-user-approval + dsh-client-ui-approval）弹出人类确认 UI。
// 客户端强制：拒绝时调用根本不会到达 MCP Server，与模型自觉性无关。
//
// 实测（2026-11-25）：DSH「标准模式」原生审批只拦自家沙盒内文件操作，不拦 MCP 工具，
// 本插件是 MCP 高危操作的唯一客户端屏障。

// 需要人工审批的工具短名（与 AutoWindows.Core RiskClassifier 的 L2/L3 集合一致；
// proc_start 为 L1 自动执行，不在此列）
const GATED = new Set([
  'run_powershell', 'fs_write', 'fs_move', 'fs_delete',
  'proc_kill', 'reg_write', 'sandbox_restore',
])

const PREFIX = 'mcp__auto-windows__'

export const name = 'auto-windows-guard'

export const inject = []

export function apply(ctx) {
  ctx.on('tools/pre-execute', (exec, next) => {
    const tool = String(exec?.name ?? '')
    if (!tool.startsWith(PREFIX)) return next()
    const short = tool.slice(PREFIX.length)
    if (!GATED.has(short)) return next()
    return {
      kind: 'ask',
      reason: `Auto Windows 高危操作：${short}`,
      displayReason: { en: `Auto Windows high-risk operation: ${short} requires your approval` },
    }
  })
}