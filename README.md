# MOBI-FREE 🚴

一个基于 Web Bluetooth API 的莫比椭圆机控制应用，无需安装任何 App，直接在浏览器中使用。

## ✨ 功能特性

- 🔗 **无线连接**：通过蓝牙 FTMS 协议连接椭圆机
- 📊 **实时数据**：显示速度、踏频、功率、距离、热量、时长等运动数据
- 🎚️ **阻力调节**：支持 10-24 档阻力实时调节
- 📱 **跨平台**：支持桌面和移动设备浏览器
- 🎨 **现代 UI**：简洁美观的深色主题界面

## 🚀 快速开始

### 环境要求

- Node.js 16+
- 支持 Web Bluetooth 的浏览器（Chrome、Edge、Opera）
- HTTPS 或 localhost 环境

### 安装运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 使用说明

1. 确保椭圆机已开机且未被其他应用连接
2. 在浏览器中打开应用
3. 点击「连接椭圆机」按钮
4. 选择你的设备并配对
5. 开始运动，实时查看数据并调节阻力

## 🌐 部署到 Cloudflare Pages

### 方式一：Git 集成（推荐）

1. 将代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. 选择你的仓库并配置：
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 **Save and Deploy**

### 方式二：Direct Upload

```bash
# 构建项目
npm run build

# 使用 wrangler 部署
npx wrangler pages deploy dist --project-name=mobi-free
```

> **注意**：Web Bluetooth API 要求 HTTPS 环境，Cloudflare Pages 自动提供 HTTPS。

## 🛠️ 技术栈

- **React** + **TypeScript**
- **Vite** - 构建工具
- **Web Bluetooth API** - 蓝牙通信
- **FTMS 协议** - 健身设备标准协议
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

## 📝 协议说明

本项目实现了 FTMS (Fitness Machine Service) 蓝牙协议，支持：
- Cross Trainer Data (0x2ACE) - 运动数据读取
- Fitness Machine Control Point (0x2AD9) - 设备控制

### 特殊处理

由于莫比椭圆机的非标准实现：
- **读取阻力**：机器返回值需除以 10（如 240 → 24 档）
- **写入阻力**：直接发送档位值（如设置 10 档发送 10）
- **阻力范围**：限制为 10-24 档

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**：本项目仅供学习交流使用，与莫比官方无关。
