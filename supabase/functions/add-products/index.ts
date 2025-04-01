
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
      { 
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Create sample products
    const products = [];
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
      },
      {
        title: 'Creatine Monohydrate Powder',
        description: 'Pure creatine monohydrate to increase strength and power output during high-intensity workouts.',
        price: 24.99,
        imageurl: 'https://images.unsplash.com/photo-1579126038374-6064e9370f0f?w=800&auto=format&fit=crop',
        category: 'Supplements',
        tags: ['creatine', 'strength', 'power'],
        quantity: 75
      },
      {
        title: 'Protein Bar Variety Pack',
        description: 'Convenient protein bars with 20g protein each. Pack includes chocolate, peanut butter, and cookies & cream flavors.',
        price: 29.99,
        imageurl: 'https://images.unsplash.com/photo-1656278160957-958d442cae55?w=800&auto=format&fit=crop',
        category: 'Protein',
        tags: ['protein bar', 'snack', 'on-the-go'],
        quantity: 40
      },
      {
        title: 'Joint Support Formula',
        description: 'Complete joint support with glucosamine, chondroitin, MSM, and turmeric for athletes and active individuals.',
        price: 34.99,
        imageurl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
        category: 'Vitamins',
        tags: ['joint health', 'recovery', 'anti-inflammatory'],
        quantity: 25
      },
      {
        title: 'Premium Blender Bottle',
        description: 'High-quality 28oz blender bottle with BlenderBall wire whisk for smooth, clump-free protein shakes.',
        price: 12.99,
        imageurl: 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=800&auto=format&fit=crop',
        category: 'Accessories',
        tags: ['shaker', 'bottle', 'blender'],
        quantity: 100
      },
      {
        title: 'Omega-3 Fish Oil',
        description: 'Pure fish oil capsules with 1000mg of Omega-3 fatty acids for heart health and recovery support.',
        price: 19.99,
        imageurl: 'https://images.unsplash.com/photo-1577460551100-907eb5455cedc?w=800&auto=format&fit=crop',
        category: 'Vitamins',
        tags: ['omega-3', 'fish oil', 'heart health'],
        quantity: 55
      }
    ];
    
    // First, remove any existing products to avoid duplicates
    const { error: deleteError } = await supabaseClient
      .from('products')
      .delete()
      .neq('id', '0'); // Delete all products
    
    if (deleteError) {
      console.error('Error deleting existing products:', deleteError);
    }
    
    // Add the service role key to bypass RLS policies
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const adminKey = authHeader.replace('Bearer ', '');
      supabaseClient.auth.setAuth(adminKey);
    }
    
    // Insert new products one by one to see detailed errors
    for (const product of demoProducts) {
      try {
        const { data, error } = await supabaseClient
          .from('products')
          .insert(product)
          .select();
        
        if (error) {
          console.error('Failed to create product:', error);
        } else {
          products.push(data[0]);
        }
      } catch (insertError) {
        console.error('Exception creating product:', insertError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully created ${products.length} products`, 
        products 
      }),
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
