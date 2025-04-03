
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
  });

  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing Stripe signature' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  try {
    const body = await req.text();
    let event;

    try {
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('Missing Stripe webhook secret');
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client with service role for admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment successful for session:', session.id);
      
      // Extract order details from metadata
      const userId = session.metadata.userId;
      const items = JSON.parse(session.metadata.items);
      const total = parseFloat(session.metadata.total);
      
      if (!userId || !items || !total) {
        throw new Error('Missing order details in session metadata');
      }
      
      // Create the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          userid: userId,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            product: item.product  // Ensure product details are stored with the order
          })),
          total: total,
          status: 'paid',
          paymentintentid: session.payment_intent,
          shippingaddress: session.shipping || { line1: '', city: '', state: '', postalCode: '', country: '' }
        })
        .select('id')
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }
      
      console.log(`Order ${order.id} created successfully, updating inventory...`);
      
      // Update inventory by decrementing quantity for each product
      for (const item of items) {
        console.log(`Updating product ${item.productId} quantity: decrementing by ${item.quantity}`);
        
        const { data: product, error: getProductError } = await supabaseAdmin
          .from('products')
          .select('quantity')
          .eq('id', item.productId)
          .single();
        
        if (getProductError) {
          console.error(`Error getting product ${item.productId}:`, getProductError);
          continue;
        }
        
        const currentQuantity = product.quantity;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        
        console.log(`Product ${item.productId}: current quantity = ${currentQuantity}, new quantity = ${newQuantity}`);
        
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ quantity: newQuantity })
          .eq('id', item.productId);
          
        if (updateError) {
          console.error(`Error updating product ${item.productId} quantity:`, updateError);
        } else {
          console.log(`Successfully updated product ${item.productId} quantity to ${newQuantity}`);
        }
      }
      
      console.log(`Order ${order.id} processing completed successfully`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${error.message}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
