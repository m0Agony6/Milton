# 深眸识农

“深眸识农”是一个面向农产品产地识别场景的前端展示与演示网站，围绕电子鼻、高光谱成像和 IFFormer 融合网络展开，当前已经包含首页展示、研究背景、技术路线、结果验证、应用场景、双模态产地识别页和部署需求页。

## 技术栈

- React
- Vite
- TypeScript
- Recharts
- Framer Motion
- XLSX

## 本地运行

### 环境要求

- Node.js 22
- npm

项目根目录已经提供 `.node-version`，用于统一构建环境。

### 启动步骤

1. 安装依赖

   `npm install`

2. 启动开发环境

   `npm run dev`

3. 生产构建

   `npm run build`

## 当前页面内容

- 首页首屏展示项目定位、关键指标和双模态识别入口
- 研究背景页说明政策驱动、传统方法局限和产业端快检需求
- 技术路线页展示采样、电子鼻、高光谱和融合网络的完整流程
- 结果验证页展示多品类识别准确率与模型参数量对比
- 应用场景页展示枸杞、小米、花生三类样本的实际应用
- 双模态产地识别页支持上传电子鼻与高光谱文件并生成分析结果
- 部署需求页支持填写使用对象、单位和应用需求

## 双模态识别功能说明

当前识别页支持以下文件格式：

- `.xlsx`
- `.xls`
- `.csv`
- `.tsv`
- `.txt`
- `.json`

当前样本类型包括：

- 花生
- 小米
- 枸杞

系统会在上传两类模态文件后，自动完成数值提取、模态分析、融合判别，并输出：

- 预测产地
- 预测置信度
- 融合一致性
- 主峰波段
- 电子鼻响应图
- 高光谱波段图
- 候选产地排序

## Cloudflare Pages 部署

这个项目适合直接部署到 Cloudflare Pages。

推荐配置如下：

- Framework preset：`Vite`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：`/`
- Node.js version：`22`

当前版本不依赖额外环境变量，可以直接构建。

更详细的部署步骤请查看：

- `Cloudflare-Pages-部署说明.md`
- `Cloudflare-Pages-参数清单.txt`
