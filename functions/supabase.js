exports.handler = async (event, context) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const client = supabase.createClient(supabaseUrl, supabaseKey);
    const result = await someAsyncOperation();
    return {
      statusCode: 200,
      body: JSON.stringify({ data: result }),
    };
  } catch (error) {
    // 捕获所有错误并返回 500
    console.error("函数错误:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
