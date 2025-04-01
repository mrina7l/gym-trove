
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

  try {
    const { items, userId } = await req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid items data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Fetch products for items to ensure we have valid data
    const productIds = items.map(item => item.productId);
    
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError || !products) {
      console.error('Error fetching products:', productsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch products' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Create line items for Stripe checkout
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      // Check inventory
      if (product.quantity < item.quantity) {
        throw new Error(`Not enough inventory for ${product.title}`);
      }
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.description,
            images: [product.imageurl],
          },
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      };
    });

    // Calculate totals for order metadata
    const subtotal = items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const shippingCost = subtotal > 100 ? 0 : 5.99;
    const total = subtotal + taxAmount + shippingCost;

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout`,
      metadata: {
        userId,
        items: JSON.stringify(items),
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        shipping: shippingCost.toFixed(2),
        total: total.toFixed(2),
      },
    });

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
