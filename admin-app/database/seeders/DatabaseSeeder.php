<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Prompt;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User (only user needed — mobile app has no login)
        User::firstOrCreate(
            ['email' => 'admin@promptcraft.ai'],
            [
                'name'     => 'Admin Lead',
                'password' => Hash::make('password'),
                'role'     => 'admin',
                'avatar'   => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            ]
        );

        // Categories
        $categoriesData = [
            ['name' => 'Image Generation', 'slug' => 'image-generation', 'description' => 'Photorealistic, cinematic, and stylized prompts for Midjourney, DALL-E 3, and Stable Diffusion.', 'image' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', 'icon' => 'image'],
            ['name' => 'Coding',           'slug' => 'coding',           'description' => 'Architectural prompts, debugging wizards, full-stack code generators, and refactoring experts.', 'image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', 'icon' => 'code'],
            ['name' => 'Writing',          'slug' => 'writing',          'description' => 'Creative writing, storytelling, executive speechwriting, and compelling essays.', 'image' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80', 'icon' => 'feather'],
            ['name' => 'Marketing',        'slug' => 'marketing',        'description' => 'High-converting ad copy, email drip sequences, landing page hooks, and SEO playbooks.', 'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', 'icon' => 'trending-up'],
            ['name' => 'Business',         'slug' => 'business',         'description' => 'Pitch deck outlines, financial modeling frameworks, executive summaries, and SWOT strategies.', 'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', 'icon' => 'briefcase'],
            ['name' => 'Education',        'slug' => 'education',        'description' => 'Feynman-technique lesson plans, syllabus creators, interactive quizzes, and tutor personas.', 'image' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80', 'icon' => 'book-open'],
            ['name' => 'Social Media',     'slug' => 'social-media',     'description' => 'Viral thread hooks, LinkedIn thought leadership, TikTok video scripts, and engagement prompts.', 'image' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80', 'icon' => 'share-2'],
            ['name' => 'Productivity',     'slug' => 'productivity',     'description' => 'Time-blocking routines, meeting synthesizers, deep work blueprints, and automation workflows.', 'image' => 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80', 'icon' => 'check-circle'],
            ['name' => 'Video',            'slug' => 'video',            'description' => 'Sora, Runway Gen-3, and Pika prompts for hyper-realistic cinematic video generation.', 'image' => 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80', 'icon' => 'video'],
            ['name' => 'Design',           'slug' => 'design',           'description' => 'UI/UX design systems, color palette generators, 3D icon specifications, and brand guidelines.', 'image' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', 'icon' => 'layers'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['slug']] = Category::firstOrCreate(['slug' => $c['slug']], array_merge($c, ['status' => 'active']));
        }

        // Prompts
        $promptsData = [
            ['category_slug' => 'image-generation', 'title' => 'Cinematic 8K Luxury Product Advertisement', 'description' => 'Generate mind-blowing luxury commercial product photography with dramatic studio lighting and water droplets.', 'prompt_text' => "Commercial luxury product photography of [PRODUCT, e.g. frosted glass matte black perfume bottle with gold typography], placed on wet obsidian rock pedestal. Dramatic cinematic rim lighting, volumetric soft mist, water droplets clinging to glass surface. Shot on Hasselblad H6D-100c, 85mm f/1.4 lens, ISO 64, shallow depth of field, raytraced reflections, hyper-detailed caustics, octane render, 8k resolution, elegant, sleek, editorial Vogue layout --ar 16:9 --style raw --v 6.0", 'cover_image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', 'tags' => ['Commercial','Luxury','Hasselblad','Photorealistic','8K'], 'is_featured' => true, 'is_trending' => true, 'views' => 2450, 'unlock_count' => 842],
            ['category_slug' => 'coding', 'title' => 'Senior Full-Stack TypeScript Architect & Code Auditor', 'description' => 'A battle-tested senior architect persona that reviews PRs, refactors code, and optimizes algorithmic bottlenecks.', 'prompt_text' => "Act as a World-Class Staff Software Engineer and Principal TypeScript Architect specializing in high-throughput distributed React Native and Next.js applications.\n\nWhen I provide code or an architectural challenge:\n1. Conduct a deep-dive security & performance audit.\n2. Refactor the code adhering strictly to SOLID, DRY, and Clean Architecture principles.\n3. Use modern TypeScript 5+ features.\n4. Provide unit and integration test fixtures using Vitest.\n5. Provide a step-by-step migration guide with zero downtime considerations.\n\nHere is the codebase/module to review:\n```typescript\n[INSERT YOUR CODE HERE]\n```", 'cover_image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80', 'tags' => ['TypeScript','Architecture','CleanCode','Refactoring'], 'is_featured' => true, 'is_trending' => true, 'views' => 1980, 'unlock_count' => 610],
            ['category_slug' => 'image-generation', 'title' => 'Cyberpunk Futuristic Neon Tokyo Streetscape', 'description' => 'Ultra-realistic rainy night in Neo-Tokyo with glowing holographic billboards and cybernetic atmosphere.', 'prompt_text' => "Wide-angle cinematic street photography of Neo Tokyo in the year 2088 during a torrential midnight rainstorm. Towering chrome skyscrapers adorned with translucent 3D holographic anime advertisements. Wet asphalt reflecting vivid magenta, cyan, and amber neon lights. Flying autonomous hovercrafts streaking light trails. Blade Runner 2049 aesthetic, Kodak Portra 800 tone curve, anamorphic lens flare, photorealistic, 8k --ar 16:9 --v 6.0", 'cover_image' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80', 'tags' => ['Cyberpunk','Tokyo','Neon','Futuristic','BladeRunner'], 'is_featured' => false, 'is_trending' => true, 'views' => 1640, 'unlock_count' => 523],
            ['category_slug' => 'marketing', 'title' => 'High-Conversion SaaS Landing Page Copywriter', 'description' => 'Craft landing page headlines, sub-headlines, and high-converting CTA sections following the PAS formula.', 'prompt_text' => "Act as a legendary direct-response conversion copywriter. Your task is to write high-converting SaaS landing page copy for [PRODUCT NAME] which helps [TARGET AUDIENCE] solve [CORE PROBLEM].\n\nFollow this conversion architecture:\n1. Above-the-fold Hero Section with magnetic 7-word primary value proposition\n2. Problem Agitation (PAS Framework)\n3. Solution & Core Pillars with 3 value pillars\n4. FAQs tackling top 5 conversion objections\n5. Urgency-infused Final CTA", 'cover_image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80', 'tags' => ['Copywriting','SaaS','Conversion','LandingPage'], 'is_featured' => true, 'is_trending' => false, 'views' => 1420, 'unlock_count' => 489],
            ['category_slug' => 'writing', 'title' => 'Bestselling Fiction World-Building & Character Architect', 'description' => 'Design rich fantasy/sci-fi magic systems, geopolitical factions, and flawed, unforgettable protagonists.', 'prompt_text' => "You are an award-winning creative writing coach and speculative fiction novelist. Help me construct a deeply immersive fictional universe for my story about [CONCEPT].\n\nStructure your output into:\n1. Lore & Magic/Tech System: The fundamental rules, limitations, and catastrophic costs of power.\n2. Geopolitical Tension: 3 competing factions with mutually irreconcilable ideologies.\n3. Protagonist Profile: Name, public persona, and secret fatal flaw (hamartia).", 'cover_image' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80', 'tags' => ['Novel','WorldBuilding','Storytelling','Fiction'], 'is_featured' => false, 'is_trending' => true, 'views' => 1250, 'unlock_count' => 380],
            ['category_slug' => 'video', 'title' => 'Sora & Runway Gen-3 Cinematic Drone Flythrough', 'description' => 'Hyper-detailed camera movement prompt for generative AI video models creating breathtaking cinematic sequences.', 'prompt_text' => "Ultra high-definition continuous cinematic FPV drone flythrough shot at golden hour. The camera glides swiftly through a cascading misty waterfall in the Norwegian fjords, dipping mere inches above swirling crystal emerald glacial water. It tilts upward smoothly to reveal towering mossy cliffs bathed in amber sunset light, with snow-capped peaks in the background. Hyper-realistic fluid dynamics, volumetric mist catching sunbeams, shot on 35mm Arri Alexa 65 format, 60fps slow-motion, color graded with warm teal and golden tones.", 'cover_image' => 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80', 'tags' => ['Sora','Runway','Gen3','Cinematic','Drone'], 'is_featured' => true, 'is_trending' => true, 'views' => 2100, 'unlock_count' => 730],
            ['category_slug' => 'social-media', 'title' => 'Viral Twitter/X & LinkedIn Mega-Thread Generator', 'description' => 'Generate captivating viral threads that hook readers on tweet 1 and drive thousands of bookmarks.', 'prompt_text' => "Act as a viral ghostwriter for top 1% tech CEOs and creators who consistently generates 1M+ impressions per post.\n\nTopic: [ENTER TOPIC]\n\nWrite an 8-part thread:\n- Tweet 1 (The Hook): Must stop the scroll. Under 240 characters.\n- Tweet 2: The Stakes (Why 99% of people are doing this backwards).\n- Tweets 3-6: 4 actionable, highly specific tactical frameworks.\n- Tweet 7: The high-level summary / Cheat Sheet.\n- Tweet 8 (CTA): Retweet request + follow prompt.", 'cover_image' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=80', 'tags' => ['Viral','Twitter','LinkedIn','GrowthHacking'], 'is_featured' => false, 'is_trending' => true, 'views' => 1530, 'unlock_count' => 490],
            ['category_slug' => 'business', 'title' => 'YC-Style 10-Slide Pitch Deck Storyboarder', 'description' => 'Turn your startup idea into a compelling 10-slide VC pitch deck ready to raise seed or Series A capital.', 'prompt_text' => "You are a Silicon Valley Venture Capital Partner who has helped founders raise over \$100M.\n\nBased on:\nCompany: [COMPANY NAME]\nIndustry: [SECTOR]\nTraction: [CURRENT METRICS]\n\nCreate a 10-slide pitch deck:\nSlide 1: Vision / One-liner\nSlide 2: The Urgent Problem (Quantified)\nSlide 3: The Solution\nSlide 4: Market Size (TAM/SAM/SOM)\nSlide 5: Business Model\nSlide 6: Unfair Advantage / Moat\nSlide 7: Traction & Milestones\nSlide 8: Competition Matrix\nSlide 9: The Dream Team\nSlide 10: The Ask", 'cover_image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80', 'tags' => ['Startup','PitchDeck','VentureCapital'], 'is_featured' => false, 'is_trending' => false, 'views' => 1180, 'unlock_count' => 340],
            ['category_slug' => 'design', 'title' => 'Design System Tokens & Micro-Component Specs', 'description' => 'Generate complete Figma/CSS design tokens: color scales, typography, elevation shadows, and button states.', 'prompt_text' => "You are a Design Systems Lead at Apple or Airbnb.\n\nCreate a modern, comprehensive design token hierarchy in JSON and CSS Variables for a dark-mode first mobile & web application:\n1. Color Tokens: Primary brand ramp (50 to 950) based on vibrant electric indigo (#6366f1)\n2. Typography Scale (rem & px pairings, line heights, letter spacing)\n3. Spacing Grid (4px/8px incremental tokens)\n4. Elevation & Glass Shadows\n5. Button State Matrix (Default, Hover, Active, Focus-visible, Loading, Disabled)", 'cover_image' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80', 'tags' => ['DesignSystem','Tokens','UIUX','Figma'], 'is_featured' => false, 'is_trending' => false, 'views' => 960, 'unlock_count' => 280],
            ['category_slug' => 'education', 'title' => 'Feynman Technique Master Tutor', 'description' => 'Deconstruct complex quantum physics, economics, or CS concepts into vivid analogies for a 12-year-old.', 'prompt_text' => "You are Richard Feynman, Nobel laureate and legendary educator.\n\nConcept to teach: [CONCEPT, e.g. Quantum Entanglement / Zero Knowledge Proofs]\n\nExplain using the 4-step Feynman method:\nStep 1: The Child Analogy - Explain using physical, everyday items a 10-year-old understands.\nStep 2: Identify and Fill Knowledge Gaps - Highlight the counterintuitive part where most adults get confused.\nStep 3: Real-World Implication - Why does this concept matter in the next 20 years?\nStep 4: Interactive Comprehension Check - Ask 2 thought-provoking multiple-choice scenarios.", 'cover_image' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80', 'tags' => ['Education','FeynmanTechnique','Learning'], 'is_featured' => false, 'is_trending' => false, 'views' => 890, 'unlock_count' => 260],
            ['category_slug' => 'productivity', 'title' => 'Executive Weekly Time-Blocking & Deep Work Planner', 'description' => 'Turn a chaotic to-do list into a prioritized Eisenhower matrix and an optimal 40-hour deep work calendar.', 'prompt_text' => "Act as an elite executive productivity strategist.\n\nHere is my raw list of tasks for this week:\n[PASTE YOUR TO-DO LIST]\n\nPerform:\n1. Eisenhower Matrix Categorization (Do Now, Schedule, Delegate, Eliminate)\n2. Energy-Matched Scheduling: Morning peak dopamine windows (9 AM - 12 PM) for high-leverage tasks\n3. Context Batching: Group low-cognition admin tasks into 45-minute afternoon sprints\n4. Output a Monday-Friday hourly schedule with buffer slots\n5. Identify the ONE Lead Domino task", 'cover_image' => 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=80', 'tags' => ['Productivity','TimeBlocking','DeepWork','Focus'], 'is_featured' => false, 'is_trending' => true, 'views' => 1340, 'unlock_count' => 412],
        ];

        foreach ($promptsData as $pData) {
            $category = $categories[$pData['category_slug']] ?? null;
            if (!$category) continue;

            $slug = Str::slug($pData['title']);
            Prompt::firstOrCreate(
                ['slug' => $slug],
                [
                    'category_id'  => $category->id,
                    'title'        => $pData['title'],
                    'slug'         => $slug,
                    'description'  => $pData['description'],
                    'prompt_text'  => $pData['prompt_text'],
                    'cover_image'  => $pData['cover_image'],
                    'tags'         => $pData['tags'],
                    'is_featured'  => $pData['is_featured'],
                    'is_trending'  => $pData['is_trending'],
                    'is_published' => true,
                    'views'        => $pData['views'],
                    'unlock_count' => $pData['unlock_count'],
                ]
            );
        }
    }
}
