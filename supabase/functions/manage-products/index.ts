
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Add a new product
    if (req.method === 'POST') {
      const { title, description, price, imageUrl, category, tags, quantity } = await req.json();
      
      // Validate required fields
      if (!title || !description || !price || !imageUrl || !category) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Insert the product
      const { data, error } = await supabaseClient
        .from('products')
        .insert({
          title,
          description,
          price,
          imageurl: imageUrl,
          category,
          tags: tags || [],
          quantity: quantity || 0
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, product: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      );
    }
    
    // Update an existing product
    if (req.method === 'PUT') {
      const { id, title, description, price, imageUrl, category, tags, quantity } = await req.json();
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Product ID is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Build update object with only provided fields
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (imageUrl !== undefined) updates.imageurl = imageUrl;
      if (category !== undefined) updates.category = category;
      if (tags !== undefined) updates.tags = tags;
      if (quantity !== undefined) updates.quantity = quantity;
      
      // Update the product
      const { data, error } = await supabaseClient
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, product: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Delete a product
    if (req.method === 'DELETE') {
      const { id } = await req.json();
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Product ID is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Delete the product
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Product deleted successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Get all products or a specific product
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      
      if (id) {
        // Get a specific product
        const { data, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        return new Response(
          JSON.stringify({ product: data }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        // Get all products
        const { data, error } = await supabaseClient
          .from('products')
          .select('*')
          .order('createdat', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        return new Response(
          JSON.stringify({ products: data }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }
    
    // If we got here, it's an unsupported method
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  } catch (error) {
    console.error('Error managing products:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
