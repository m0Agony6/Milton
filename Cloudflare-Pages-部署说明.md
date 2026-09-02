# Cloudflare Pages 部署说明

这份说明适用于当前“深眸识农”网页项目。项目本身是 Vite + React 静态前端，适合直接通过 GitHub 接入 Cloudflare Pages，部署完成后可以获得固定地址，后续更新代码也可以自动发布。

## 一、你会拿到什么

当前部署材料里已经整理好了以下内容：

- 可直接上传到 GitHub 的项目源码
- Cloudflare Pages 参数清单
- `.node-version` 文件，用于固定 Node.js 主版本为 22

## 二、部署前你需要准备的账号

你需要在自己的电脑上准备以下两个账号并完成登录：

- GitHub 账号
- Cloudflare 账号

这两个账号的登录和授权操作建议只在你自己的私人电脑上完成，不要在公共设备上操作。

## 三、先把项目上传到 GitHub

### 方式一：网页上传，适合不使用命令行

1. 登录 GitHub。
2. 点击右上角 `New repository`。
3. 仓库名称建议填写 `deep-agri-origin`，也可以使用你自己习惯的名称。
4. 仓库建议设为 `Private` 或 `Public`，按你的需要选择。
5. 创建仓库后，点击 `uploading an existing file`。
6. 将部署包里的项目文件拖进去。
7. 不要上传 `node_modules` 和 `dist`。
8. 提交后，确保默认分支为 `main`。

### 方式二：本地 Git 推送，适合熟悉命令行

1. 在自己的电脑上解压项目。
2. 进入项目根目录。
3. 依次执行：

   - `git init`
   - `git branch -M main`
   - `git add .`
   - `git commit -m "init pages deployment"`
   - `git remote add origin 你的仓库地址`
   - `git push -u origin main`

## 四、在 Cloudflare Pages 上接入 GitHub

1. 登录 Cloudflare。
2. 进入左侧的 `Workers & Pages`。
3. 点击 `Create application`。
4. 选择 `Pages`。
5. 选择 `Connect to Git`。
6. 首次使用时，Cloudflare 会要求你授权 GitHub。
7. 选择刚刚上传好的 GitHub 仓库。
8. 进入构建配置页面后，按下面参数填写。

## 五、Pages 构建参数

请按下面内容填写，不要改动：

- Framework preset：`Vite`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：`/`
- Production branch：`main`
- Node.js version：`22`

当前版本网页不依赖额外的线上环境变量，所以可以先不配置环境变量。

## 六、部署完成后会得到什么

部署成功后，Cloudflare Pages 会生成一个固定地址，通常是：

`https://你的项目名.pages.dev`

这个地址比临时隧道稳定得多，适合长期展示、答辩和对外分享。

## 七、如果你要绑定自己的域名

部署成功后可以继续操作：

1. 进入该 Pages 项目。
2. 打开 `Custom domains`。
3. 点击添加域名。
4. 按 Cloudflare 提示完成解析。

如果你的域名本身已经托管在 Cloudflare，绑定会更顺畅。

## 八、后续如何更新网站

后续如果你修改了网页内容，只需要：

1. 修改本地项目文件。
2. 再次推送到 GitHub 的 `main` 分支。
3. Cloudflare Pages 会自动重新构建并发布。

也就是说，后面不需要再手动开临时公网隧道。

## 九、当前项目的建议上传范围

建议保留并上传：

- `src`
- `public`
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `.gitignore`
- `.node-version`
- 本说明文件

建议不要上传：

- `node_modules`
- `dist`
- 临时日志文件
- 本地测试产生的临时链接记录

## 十、如果构建时报错，优先检查这几项

1. GitHub 仓库里是否误传了 `node_modules`。
2. `Build command` 是否严格填写为 `npm run build`。
3. `Build output directory` 是否严格填写为 `dist`。
4. `Root directory` 是否为空或填写为 `/`。
5. Node.js 版本是否为 22。

## 十一、当前项目特点说明

这个网页目前已经包含以下主要内容：

- 首页展示与技术概览
- 研究背景与产业痛点说明
- 技术路线与模块化说明
- 结果验证图表
- 枸杞、小米、花生三类应用场景展示
- 电子鼻 + 高光谱双模态产地识别页
- 部署需求填写页

因此它非常适合直接部署到 Cloudflare Pages，不需要额外后端服务即可正常展示和交互。

## 十二、官方文档入口

如果你在自己的电脑上操作时想对照官方页面，可以查看：

- Cloudflare Pages Git 集成文档
- Cloudflare Pages 构建配置文档
- Cloudflare Pages Vite 框架文档
