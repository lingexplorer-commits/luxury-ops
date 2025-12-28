# Luxury Ops - 高奢旅行社内部运营系统

一个基于 Next.js 14 的酒店资源运营系统，专为高端定制旅行社设计。

## 功能特点

- 📍 **目的地管理** - 酒店卡片展示，板块筛选
- 📅 **日历视图** - 多板块多选，房态矩阵，私汤筛选
- 💰 **报价生成** - 多房型选择，加价/降价，货币转换
- 🔍 **客户需求** - Kanban/列表视图，智能推荐
- 📊 **渠道分析** - 数据统计，酒店排名
- ⚙️ **控制台** - 监控任务，自动订房，系统日志

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- date-fns

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 部署

### Zeabur (推荐)

1. Fork 此仓库到你的 GitHub
2. 登录 [Zeabur](https://zeabur.com)
3. 新建项目 → 部署服务 → Git → 选择仓库
4. Zeabur 会自动检测 Next.js 并部署

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker

```bash
docker build -t luxury-ops .
docker run -p 3000:3000 luxury-ops
```

## 目录结构

```
src/
├── app/                 # 页面路由
│   ├── (main)/         # 主应用布局
│   │   ├── destinations/
│   │   ├── calendar/
│   │   ├── budget/
│   │   ├── inquiries/
│   │   ├── hotels/[id]/
│   │   └── settings/
│   └── console/        # 控制台布局
├── components/         # UI 组件
├── lib/
│   ├── mock-data/     # 模拟数据
│   ├── types/         # TypeScript 类型
│   ├── api/           # API 抽象层
│   └── currency.ts    # 货币汇率系统
```

## License

MIT
