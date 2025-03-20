// api/deepseek.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/ask', async (req, res) => {
  const { message, userId } = req.body;
  
  // 从 Supabase 获取用户八字数据
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  
  const { data: user } = await supabase
    .from('users')
    .select('birthday, location')
    .eq('id', userId)
    .single();

  // 调用 DeepSeek API（需替换为你的 API Key）
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-r1",
      messages: [{
        role: "user",
        content: `用户八字：${user.birthday} ${user.location}，问题：${message}`
      }]
    })
  });
  
  const result = await response.json();
  res.json({ reply: result.choices[0].message.content });
});

module.exports = app;