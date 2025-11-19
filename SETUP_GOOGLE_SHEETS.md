# Google Sheets 数据收集设置指南

本指南将帮助您设置 Google Sheets 来自动收集问卷填写的数据。

## 步骤 1: 创建 Google Sheets

1. 打开 [Google Sheets](https://sheets.google.com)
2. 创建一个新的空白表格
3. 在第一行输入以下表头（A1 到 X1）：
   ```
   A1: 时间戳
   B1: 总分
   C1: 等级
   D1: 等级文本
   E1: 内容得分
   F1: 广告得分
   G1: AI得分
   H1: 自动化得分
   I1: 数据得分
   J1: 问题1
   K1: 问题2
   L1: 问题3
   M1: 问题4
   N1: 问题5
   O1: 问题6
   P1: 问题7
   Q1: 问题8
   R1: 问题9
   S1: 问题10
   T1: 问题11
   U1: 问题12
   V1: 诊断分析
   W1: 建议优先级
   X1: IP地址
   ```
4. 保存并记下这个 Google Sheets 的 ID（在 URL 中可以找到，例如：`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`）

## 步骤 2: 创建 Google Apps Script

1. 在同一个 Google Sheets 中，点击菜单栏的 **扩展程序** > **Apps Script**
2. 如果看到示例代码，全部删除
3. 复制以下代码并粘贴到编辑器：

```javascript
// 配置：将下面的 SPREADSHEET_ID 替换为您的 Google Sheets ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Sheet1'; // 如果您的表名称不同，请修改这里

function doPost(e) {
  try {
    // 解析 JSON 数据
    const data = JSON.parse(e.postData.contents);
    
    // 打开指定的 Google Sheets
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
    
    // 获取客户端 IP 地址
    const ipAddress = e.parameter?.ip || 'unknown';
    
    // 准备要写入的数据行
    const row = [
      data.timestamp || new Date().toLocaleString('zh-TW'),
      data.totalScore || 0,
      data.level || 0,
      data.levelText || '',
      data.dimensions?.content?.score || 0,
      data.dimensions?.ads?.score || 0,
      data.dimensions?.ai?.score || 0,
      data.dimensions?.automation?.score || 0,
      data.dimensions?.data?.score || 0,
      data.answers?.[0]?.answerText || '',
      data.answers?.[1]?.answerText || '',
      data.answers?.[2]?.answerText || '',
      data.answers?.[3]?.answerText || '',
      data.answers?.[4]?.answerText || '',
      data.answers?.[5]?.answerText || '',
      data.answers?.[6]?.answerText || '',
      data.answers?.[7]?.answerText || '',
      data.answers?.[8]?.answerText || '',
      data.answers?.[9]?.answerText || '',
      data.answers?.[10]?.answerText || '',
      data.answers?.[11]?.answerText || '',
      data.diagnosis || '',
      data.priorities?.join(' | ') || '',
      ipAddress
    ];
    
    // 在第二行追加数据（第一行是表头）
    sheet.appendRow(row);
    
    // 返回成功响应
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '数据已成功保存' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 返回错误响应
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 测试函数（可选，用于测试脚本是否正常工作）
function test() {
  const testData = {
    timestamp: new Date().toISOString(),
    totalScore: 24,
    maxScore: 48,
    level: 2,
    levelText: "Level 2 · 入门阶段",
    dimensions: {
      content: { score: 4, max: 8 },
      ads: { score: 6, max: 12 },
      ai: { score: 5, max: 12 },
      automation: { score: 4, max: 8 },
      data: { score: 5, max: 8 }
    },
    answers: [
      { question: "Q1", score: 2, answerText: "偶尔用模板，但不固定" },
      { question: "Q2", score: 2, answerText: "有模糊方向，但不稳定" },
      { question: "Q3", score: 2, answerText: "偶尔投，效果不稳定" },
      { question: "Q4", score: 2, answerText: "看得懂，但不会分析" },
      { question: "Q5", score: 2, answerText: "使用模板但无法复用" },
      { question: "Q6", score: 2, answerText: "偶尔用来写文案" },
      { question: "Q7", score: 2, answerText: "只会写简单指令" },
      { question: "Q8", score: 1, answerText: "没做过" },
      { question: "Q9", score: 2, answerText: "有简单设置（欢迎语）" },
      { question: "Q10", score: 2, answerText: "有一点，但不稳定" },
      { question: "Q11", score: 2, answerText: "偶尔记一下" },
      { question: "Q12", score: 3, answerText: "可以追踪到主要来源" }
    ],
    diagnosis: "已经开始尝试内容、广告或 AI 工具，但还比较零散、不稳定，可以通过建立基础流程快速升级。",
    priorities: ["数据能力 优先优化：每个月做一次简单复盘：本月内容、广告、咨询来源分别是多少，记录在一份表格就好。"]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

4. 将代码中的 `SPREADSHEET_ID` 替换为您在步骤 1 中记下的 Google Sheets ID
5. 点击左上角的 **保存** 图标（💾），给项目起个名字，例如 "问卷数据收集"

## 步骤 3: 部署为 Web App

1. 在 Apps Script 编辑器中，点击右上角的 **部署** > **新建部署**
2. 点击设置图标（⚙️）选择类型，选择 **网页应用**
3. 配置部署设置：
   - **说明**：输入一个说明，例如 "问卷数据收集 v1"
   - **执行身份**：选择 **我**
   - **谁可以访问**：选择 **所有人**（这很重要！）
4. 点击 **部署**
5. **重要**：首次部署时，会要求授权：
   - 点击 **授权访问**
   - 选择您的 Google 账号
   - 点击 **高级** > **前往"项目名称"（不安全）**
   - 点击 **允许**
6. 部署成功后，会显示 **网页应用网址**，复制这个 URL

## 步骤 4: 配置 HTML 文件

1. 打开 `index.html` 文件
2. 找到以下代码（大约在第 1014 行）：
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. 将 `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` 替换为您在步骤 3 中复制的网页应用网址
4. 保存文件

## 步骤 5: 测试

1. 在浏览器中打开您的 `index.html` 文件
2. 完成所有题目并点击「查看评估报告」
3. 打开浏览器的开发者工具（F12）查看控制台，应该看到「✓ 数据已成功提交到 Google Sheets」的消息
4. 回到 Google Sheets，刷新页面，应该能看到新的一行数据

## 故障排除

### 问题 1: 数据没有保存到 Google Sheets

**解决方案**：
- 检查 Google Apps Script 中的 `SPREADSHEET_ID` 是否正确
- 确认 Web App 的访问权限设置为「所有人」
- 检查浏览器控制台是否有错误信息

### 问题 2: CORS 错误

**解决方案**：
- 代码已经使用了 `no-cors` 模式，这应该不会出现 CORS 错误
- 如果仍有问题，确保 Web App 的访问权限设置为「所有人」

### 问题 3: 数据格式不对

**解决方案**：
- 检查 Google Sheets 的表头是否正确
- 确认 `SHEET_NAME` 是否与您的表名称一致

### 问题 4: 权限错误

**解决方案**：
- 重新授权：在 Apps Script 编辑器中，点击 **部署** > **管理部署** > 点击编辑图标（✏️）> 点击 **测试部署** 重新授权

## 安全建议

1. **限制访问**：虽然需要设置为「所有人」才能从网页提交数据，但您可以：
   - 定期查看提交的数据
   - 在 Apps Script 中添加简单的验证（如验证特定的请求来源）
   
2. **备份数据**：定期备份您的 Google Sheets 数据

3. **监控使用**：可以通过 Apps Script 添加使用统计功能

## 进阶功能（可选）

### 添加 IP 地址记录

Google Apps Script 默认无法直接获取客户端 IP（因为经过代理），但您可以：
1. 在前端使用第三方 API 获取 IP
2. 将 IP 包含在提交的数据中

### 添加数据验证

在 `doPost` 函数中添加数据验证，例如：
```javascript
// 验证必需字段
if (!data.totalScore || !data.timestamp) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: '缺少必需字段' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 添加邮件通知

当有新提交时发送邮件通知：
```javascript
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: '新的问卷提交',
  body: `收到新的问卷提交，总分：${data.totalScore}`
});
```

## 需要帮助？

如果遇到问题，请检查：
1. 浏览器控制台（F12）的错误信息
2. Apps Script 的执行日志：**执行** > **查看执行记录**
3. Google Sheets 的权限设置

---

完成以上步骤后，您的问卷就可以自动将数据保存到 Google Sheets 了！🎉
