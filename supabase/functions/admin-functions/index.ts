
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  // Initialize Supabase client with service role
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing environment variables' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { action, data, userEmail } = await req.json();
    
    // Check if the user is an admin
    const isAdmin = userEmail === 'admin@example.com';
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }
    
    // Handle different admin actions
    if (action === 'createProduct') {
      const productData = data;
      
      // Validate product data
      if (!productData.title || !productData.description || !productData.price) {
        return new Response(
          JSON.stringify({ error: 'Missing required product data' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Insert product using service role key (bypasses RLS)
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .insert([{
          title: productData.title,
          description: productData.description,
          price: parseFloat(productData.price.toString()),
          quantity: parseInt(productData.quantity.toString()),
          category: productData.category,
          imageurl: productData.imageUrl || '/placeholder.svg',
          tags: productData.tags || ['new'],
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Product created successfully', 
          product 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      );
    }
    
    // Handle other admin actions here...
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
    
  } catch (error) {
    console.error('Error in admin-functions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
