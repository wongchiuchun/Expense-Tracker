// This file would be in your `netlify/functions/api.js`

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event, context) => {
  const path = event.path.replace(/\.netlify\/functions\/[^\/]+/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    switch (event.httpMethod) {
      case 'GET':
        if (segments[0] === 'transactions') {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
          
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify(data) };
        } else if (segments[0] === 'balance') {
          const { data, error } = await supabase
            .from('balance')
            .select('amount')
            .single();
          
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify({ balance: data.amount }) };
        }
        break;

      case 'POST':
        if (segments[0] === 'transactions') {
          const { data, error } = await supabase
            .from('transactions')
            .insert(JSON.parse(event.body))
            .single();
          
          if (error) throw error;
          return { statusCode: 201, body: JSON.stringify(data) };
        }
        break;

      case 'PUT':
        if (segments[0] === 'transactions' && segments[1]) {
          const { data, error } = await supabase
            .from('transactions')
            .update(JSON.parse(event.body))
            .match({ id: segments[1] })
            .single();
          
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify(data) };
        } else if (segments[0] === 'balance') {
          const { data, error } = await supabase
            .from('balance')
            .update({ amount: JSON.parse(event.body).balance })
            .eq('id', 1)  // Assuming there's only one row in the balance table
            .single();
          
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify({ balance: data.amount }) };
        }
        break;

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Internal Server Error: ' + err.message };
  }

  return { statusCode: 404, body: 'Not Found' };
};