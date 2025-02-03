exports.handler = async (event, context) => {
    // 服务端代码中访问环境变量
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const client = supabase.createClient(supabaseUrl, supabaseKey);

    return {
      statusCode: 200,
      body: JSON.stringify({ data: "已与服务端建立连接" }), // 返回处理结果
    };
  };