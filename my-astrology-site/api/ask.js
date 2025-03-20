// api/ask.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // 连接 Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: user } = await supabase
      .from('users')
      .select('birthday, location')
      .eq('id', userId)
      .single();

    // 调用 DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
    
    const result = await deepseekResponse.json();
    res.status(200).json({ reply: result.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};