# RandomMap

根据选择的国家 / 地区，生成 Stripe 测试模式可用的信用卡账单资料；账单地址和经纬度来自 Google Maps Places API 返回的真实地点数据。

> 注意：本项目只生成 Stripe Test Mode 测试卡资料，不生成真实可支付信用卡。

## 功能

- 选择国家 / 地区，并从对应的州、省或行政区下拉列表中选择位置范围。
- 通过后端代理调用 Google Maps Places API Text Search，获取真实地点、地址、经纬度和 Google Maps 链接。
- 生成 Stripe 官方测试卡号、测试 CVC、未来有效期、测试客户资料和账单地址。
- 支持复制完整 JSON，方便粘贴到 Stripe 测试流程或自动化脚本。
- 浏览器没有保存 Google Maps API Key 时，会进入 Demo 模式，便于先查看界面和数据结构。

## 运行

```bash
cp .env.example .env
npm install
```

编辑 `.env`：

```bash
PORT=5173
```

Google Maps API Key 不从 `.env` 读取。请在页面的 `Google Maps API Key` 输入框中填写并保存；Key 会存入当前浏览器的 `localStorage`，生成时发送给本地后端用于本次 Google Maps 查询。

启动服务：

```bash
npm run dev
```

打开：

```text
http://localhost:5173
```

如果 `5173` 已被占用，服务会自动尝试下一个端口，并在终端输出实际地址。

## 部署到 Vercel

项目已经适配 Vercel：

- `public/`：静态页面、样式和前端脚本。
- `api/health.mjs`：`/api/health`
- `api/geo.mjs`：`/api/geo`
- `api/generate.mjs`：`/api/generate`
- `lib/`：本地服务和 Vercel Functions 共用的生成逻辑。
- `vercel.json`：将静态输出目录指定为 `public`。

在 Vercel 新建项目时选择这个仓库，部署设置如下：

```text
Framework Preset: Other
Build Command: npm run build
Output Directory: public
Install Command: npm install
Root Directory: ./
```

不需要在 Vercel 配置 `GOOGLE_MAPS_API_KEY` 环境变量。本项目只使用网页端输入并保存到浏览器 `localStorage` 的 Key，生成时由浏览器发送给 `/api/generate`。

部署完成后打开站点，先访问 `/api/health` 应返回 `browser-key-required`，再访问 `/api/geo` 应返回国家 / 地区数据。首页会优先读取 `/api/geo`，如果函数暂时不可用，会自动回退到构建时生成的 `/geo.json`。

## Google Maps 配置

需要在 Google Cloud Console 中启用 Google Maps Platform，并给 API Key 开通 Places API。建议限制 API Key 的来源和可调用 API。

本项目使用的接口：

- `POST https://places.googleapis.com/v1/places:searchText`
- 请求头 `X-Goog-FieldMask` 只请求地点 ID、名称、地址、地址组件、经纬度和 Google Maps 链接。

## 数据说明

Stripe 卡号使用官方测试卡，例如 `4242 4242 4242 4242`。姓名、邮箱和电话是测试资料；账单地址来自 Google Maps 地点数据。请只在 Stripe 测试模式或内部 QA 环境中使用。

国家 / 地区和州、省、行政区列表由 `country-region-data` 提供，前端通过 `/api/geo` 加载，避免维护少量城市样例导致国家和地区不对应。
