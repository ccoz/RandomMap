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
