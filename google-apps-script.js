// Google Apps Script 代码
// 将此代码复制到 Google Apps Script 编辑器中

// ========== 配置区域 ==========
// 将下面的 SPREADSHEET_ID 替换为您的 Google Sheets ID
// 可以在 Google Sheets 的 URL 中找到，例如：
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// 工作表名称（通常是 'Sheet1'，如果您的表名称不同，请修改）
const SHEET_NAME = 'Sheet1';

// ========== 数据处理函数 ==========
function processData(data) {
  try {
    Logger.log('========== 开始处理数据 ==========');
    Logger.log('收到数据对象: ' + JSON.stringify(data));
    Logger.log('总得分原始值: ' + data.totalScore + ' (类型: ' + typeof data.totalScore + ')');
    
    // 打开指定的 Google Sheets
    if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
      throw new Error('SPREADSHEET_ID 未配置，请设置您的 Google Sheets ID');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('成功打开 Google Sheets');
    
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
    Logger.log('使用工作表: ' + sheet.getName());
    
    // 确保 totalScore 是数字类型
    const totalScore = Number(data.totalScore);
    if (isNaN(totalScore)) {
      Logger.log('警告: totalScore 不是有效数字，使用 0');
      Logger.log('totalScore 值: ' + data.totalScore);
    }
    Logger.log('总得分 (数字): ' + totalScore);
    
    // 准备要写入的数据行
    const row = [
      data.timestamp || new Date().toLocaleString('zh-TW'),
      totalScore,  // 确保是数字
      Number(data.level) || 0,
      data.levelText || '',
      Number(data.dimensions?.content?.score) || 0,
      Number(data.dimensions?.ads?.score) || 0,
      Number(data.dimensions?.ai?.score) || 0,
      Number(data.dimensions?.automation?.score) || 0,
      Number(data.dimensions?.data?.score) || 0,
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
      data.priorities?.join(' | ') || ''
    ];
    
    Logger.log('准备写入的数据行: ' + JSON.stringify(row));
    Logger.log('数据行长度: ' + row.length);
    Logger.log('第二列 (总分) 的值: ' + row[1]);
    
    // 在第二行追加数据（第一行是表头）
    sheet.appendRow(row);
    Logger.log('✓ 数据行已追加到工作表');
    
    // 验证写入的数据
    const lastRow = sheet.getLastRow();
    const savedTotalScore = sheet.getRange(lastRow, 2).getValue(); // B列是总分
    Logger.log('验证: 最后一行 = ' + lastRow + ', B列值 = ' + savedTotalScore);
    
    if (Number(savedTotalScore) !== totalScore) {
      Logger.log('警告: 保存的总分 (' + savedTotalScore + ') 与期望值 (' + totalScore + ') 不一致');
    }
    
    Logger.log('========== 数据处理完成 ==========');
    Logger.log('✓ 数据已成功保存，总得分: ' + totalScore);
    
    return { success: true, totalScore: totalScore };
    
  } catch (error) {
    Logger.log('处理数据时出错: ' + error.toString());
    Logger.log('错误堆栈: ' + error.stack);
    throw error;
  }
}

// ========== 主处理函数 - POST ==========
function doPost(e) {
  try {
    Logger.log('========== 收到 POST 请求 ==========');
    Logger.log('postData 类型: ' + (e.postData ? e.postData.type : 'null'));
    Logger.log('parameter keys: ' + (e.parameter ? Object.keys(e.parameter).join(', ') : 'null'));
    
    let data;
    
    // 方法1: 表单数据 (application/x-www-form-urlencoded)
    if (e.parameter && e.parameter.data) {
      Logger.log('方法1: 从 parameter.data 解析数据');
      try {
        data = JSON.parse(e.parameter.data);
        Logger.log('成功解析 parameter.data');
      } catch (err) {
        Logger.log('解析 parameter.data 失败: ' + err.toString());
      }
    }
    
    // 方法2: JSON 格式 (application/json)
    if (!data && e.postData && e.postData.contents) {
      Logger.log('方法2: 从 postData.contents 解析 JSON');
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('成功解析 postData.contents');
      } catch (err) {
        Logger.log('解析 postData.contents 失败: ' + err.toString());
      }
    }
    
    // 方法3: 直接使用 parameter (fallback)
    if (!data && e.parameter) {
      Logger.log('方法3: 尝试直接使用 parameter');
      // 如果 parameter 中有 data 字段但解析失败，尝试其他方式
      if (Object.keys(e.parameter).length > 0) {
        Logger.log('parameter 内容: ' + JSON.stringify(e.parameter));
      }
    }
    
    if (!data) {
      Logger.log('错误: 无法解析数据');
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: '无法解析请求数据',
          received: {
            hasPostData: !!e.postData,
            postDataType: e.postData ? e.postData.type : null,
            hasParameter: !!e.parameter,
            parameterKeys: e.parameter ? Object.keys(e.parameter) : []
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('解析成功，总得分: ' + data.totalScore);
    const result = processData(data);
    
    // 返回成功响应
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '数据已成功保存',
        totalScore: result.totalScore 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 记录错误
    Logger.log('========== doPost 错误 ==========');
    Logger.log('错误: ' + error.toString());
    Logger.log('错误堆栈: ' + error.stack);
    
    // 返回错误响应
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        message: '保存数据时出错，请检查配置',
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== GET 请求处理（备用方案）==========
function doGet(e) {
  try {
    let data;
    
    // 从 URL 参数获取数据
    if (e.parameter && e.parameter.data) {
      data = JSON.parse(decodeURIComponent(e.parameter.data));
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: '请提供数据参数' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const result = processData(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '数据已成功保存',
        totalScore: result.totalScore 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('doGet 错误: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== 测试函数（可选）==========
// 可以在 Apps Script 编辑器中运行此函数来测试脚本是否正常工作
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
    priorities: [
      "数据能力 优先优化：每个月做一次简单复盘：本月内容、广告、咨询来源分别是多少，记录在一份表格就好。",
      "自动化 优先优化：先从简单自动回复开始，例如 ManyChat / WhatsApp 欢迎语，再慢慢加上标签与跟进流程。",
      "AI 使用 优先优化：固定使用 1–2 个 AI 工具（ChatGPT + Canva），练习写 Prompt，让 AI 变成你的行销助手。"
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

// ========== 辅助函数：设置表头（可选）==========
// 如果您的表还没有表头，可以运行此函数自动创建
function setupHeaders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  
  const headers = [
    '时间戳',
    '总分',
    '等级',
    '等级文本',
    '内容得分',
    '广告得分',
    'AI得分',
    '自动化得分',
    '数据得分',
    '问题1',
    '问题2',
    '问题3',
    '问题4',
    '问题5',
    '问题6',
    '问题7',
    '问题8',
    '问题9',
    '问题10',
    '问题11',
    '问题12',
    '诊断分析',
    '建议优先级'
  ];
  
  // 检查第一行是否已有内容
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeader = firstRow.some(cell => cell.toString().trim() !== '');
  
  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // 格式化表头
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    Logger.log('表头已创建');
  } else {
    Logger.log('表头已存在，跳过创建');
  }
}
