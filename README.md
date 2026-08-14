# math-copy

为 DeepSeek Harness Web 对话中的 KaTeX 数学公式添加轻量、可访问的复制交互。

> 包名与 Cordis 配置项名都是 `math-copy`（DSH 对插件名没有任何前缀要求），GitHub 仓库名仍是 `dsh-math-copy`。

## 功能

- 自动识别 DSH 已渲染的行内公式、行间公式以及 KaTeX 错误公式。
- 鼠标悬停或键盘聚焦时，公式轻微悬浮，并显示柔和的边缘光影。
- 左键单击公式，直接复制为 `$$...$$`。
- 右键单击公式，可选择复制为：
  - `$...$`
  - `$$...$$`
  - `\[...\]`
- 复制成功后，在公式上方显示半透明的 **Copied ✓** 提示。
- 支持键盘：Enter/Space 复制，菜单键或 Shift+F10 打开格式菜单，方向键选择，Escape 关闭。
- 支持对话流式输出后新增的公式，并在插件卸载/HMR 时完整清理事件与 DOM。

> DSH 本身负责 Markdown 数学语法识别与 KaTeX 渲染；本插件从 KaTeX 的 `application/x-tex` 注解读取原始 LaTeX，因此不会从视觉文本反向猜测公式。


## 开发与构建

克隆仓库并进入仓库根目录：

```shell
git clone https://github.com/Blackspace2/dsh-math-copy.git
cd dsh-math-copy
```

安装依赖、检查、测试并构建：

```shell
corepack pnpm install
corepack pnpm run check
corepack pnpm test
corepack pnpm run build
```

构建产物位于 `lib/`：

- `lib/index.js`：DSH Host 侧空插件入口，用于被 Cordis Loader 挂载。
- `lib/client.js`：符合 `window.__ModuleLoader__.load(...)` 协议的浏览器插件包，其模块 id 取自 `package.json` 的 `name`。
- `lib/types/`：公开 TypeScript 类型。

## 安装到 DeepSeek Harness

DSH 的插件管理命令会调用 `pnpm`，因此先确认它在 PATH 中：

```shell
corepack enable
pnpm --version
```

如果当前 Node.js 发行版不允许 `corepack enable`，可以改用：

```shell
npm install --global pnpm
pnpm --version
```

### 从 GitHub 安装（推荐）

不需要克隆本仓库，也不依赖任何本地插件路径。默认拉取 `main` 分支的最新提交，不需要 tag：

```shell
npx --yes @deepseek-ai/dsh@0.1.0-rc.6 plugin --profile web add "github:Blackspace2/dsh-math-copy"
```

如果已经全局安装 DSH，可以使用较短的等价命令：

```shell
dsh plugin --profile web add "github:Blackspace2/dsh-math-copy"
```

### 从本地仓库安装（开发用途）

在仓库根目录执行；`.` 表示当前目录，命令在三平台通用：

```shell
npx --yes @deepseek-ai/dsh@0.1.0-rc.6 plugin --profile web add .
```

### 启动与刷新

在你希望作为 DSH workspace 的目录中运行：

```shell
dsh web
```

安装或升级后，先用 `Ctrl+C` 停止旧进程，再重新运行 `dsh web`，然后强制刷新 `http://127.0.0.1:3080`。源码修改后需要重新执行 `corepack pnpm run build`；只有 DSH checkout 中的 `pnpm run dev:web` watcher 同时运行时，client-plugin HMR 才会自动接收重建结果。


### 卸载

```shell
dsh plugin --profile web remove math-copy
```

## 交互说明

| 操作 | 结果 |
| --- | --- |
| 左键单击 / Enter / Space | 复制 `$$原始 LaTeX$$` |
| 右键 / 菜单键 / Shift+F10 | 打开复制格式菜单 |
| 菜单内 ↑ / ↓ | 切换格式 |
| Escape | 关闭格式菜单 |

如果现代 Clipboard API 因权限不可用，插件会尝试使用同一用户手势中的 `document.execCommand('copy')` 兼容路径。

## 兼容性

当前面向 DeepSeek Harness `0.1.0-rc.6` Web 客户端。插件只依赖稳定的客户端模块交接协议和 KaTeX 标准 DOM，不依赖 DSH 内部 React 组件实现。

## License

MIT
