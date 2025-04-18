
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Create the SQL function to decrement product quantity
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION decrement_quantity(p_id UUID, qty INTEGER)
      RETURNS INTEGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        current_qty INTEGER;
      BEGIN
        -- Get current quantity
        SELECT quantity INTO current_qty
        FROM products
        WHERE id = p_id;
        
        -- Check if we have enough stock
        IF current_qty >= qty THEN
          -- Update the quantity
          UPDATE products
          SET quantity = quantity - qty
          WHERE id = p_id;
          
          -- Return the new quantity
          RETURN current_qty - qty;
        ELSE
          -- Not enough stock
          RETURN current_qty;
        END IF;
      END;
      $$;
    `;

    const { error: functionError } = await supabaseClient
      .rpc('create_decrement_quantity_function', { sql: createFunctionSQL });
    
    if (functionError) {
      console.error('Error creating function:', functionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create database function', details: functionError }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Database functions created successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error setting up database functions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
