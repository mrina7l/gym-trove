
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
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    
    // Create sample products
    const products = [];
    const categories = ['Protein', 'Amino Acids', 'Pre-Workout', 'Vitamins', 'Accessories'];
    const demoProducts = [
      {
        title: 'Premium Whey Protein Isolate',
        description: 'Our highest quality whey protein with 27g of protein per serving and minimal fats and carbs. Ideal for muscle recovery and growth.',
        price: 59.99,
        imageurl: 'https://images.unsplash.com/photo-1579722820310-211f4d88a5a9?q=80&w=2940&auto=format&fit=crop',
        category: 'Protein',
        tags: ['whey', 'isolate', 'muscle building'],
        quantity: 50
      },
      {
        title: 'Mass Gainer - Chocolate',
        description: 'High-calorie formula with 1250 calories per serving to help you bulk up. Contains 50g protein and 250g carbs.',
        price: 64.99,
        imageurl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2787&auto=format&fit=crop',
        category: 'Gainers',
        tags: ['mass gainer', 'bulking', 'weight gain'],
        quantity: 35
      },
      {
        title: 'Pre-Workout Energy Boost',
        description: 'Powerful pre-workout formula with caffeine, beta-alanine, and creatine to maximize your training performance.',
        price: 39.99,
        imageurl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2858&auto=format&fit=crop',
        category: 'Pre-Workout',
        tags: ['energy', 'focus', 'pump'],
        quantity: 60
      },
      {
        title: 'BCAAs Recovery Formula',
        description: '2:1:1 ratio of BCAAs to support muscle recovery and reduce muscle soreness after intense workouts.',
        price: 29.99,
        imageurl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop',
        category: 'Amino Acids',
        tags: ['recovery', 'bcaa', 'amino acids'],
        quantity: 45
      },
      {
        title: 'Vegan Plant Protein',
        description: 'Plant-based protein blend from pea, rice, and hemp sources. 24g of protein per serving with all essential amino acids.',
        price: 49.99,
        imageurl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=2833&auto=format&fit=crop',
        category: 'Protein',
        tags: ['vegan', 'plant-based', 'dairy-free'],
        quantity: 30
      }
    ];
    
    // Insert products
    for (const product of demoProducts) {
      const { data, error } = await supabaseClient
        .from('products')
        .insert(product)
        .select();
      
      if (error) {
        console.error('Failed to create product:', error);
      } else {
        products.push(data[0]);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `Successfully created ${products.length} products`, products }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
