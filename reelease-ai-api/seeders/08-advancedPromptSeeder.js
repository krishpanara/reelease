exports.up = async ({ db }, mongoose) => {
  const { AIPrompt } = db;
  try {
    const templates = [
      { category: 'characters', prompt: 'A cyberpunk ronin standing in a rain-slicked Tokyo alley, neon signs reflecting in chrome armor, cinematic lighting, 8k.' },
      { category: 'characters', prompt: 'An ethereal elf druid with glowing green eyes, wearing moss-covered robes, standing in a sun-dappled ancient forest, intricate detail.' },
      { category: 'characters', prompt: 'A victorian steampunk inventor with brass goggles, surrounded by complex clockwork machinery, steam and copper aesthetic.' },
      { category: 'characters', prompt: 'A fierce viking shieldmaiden standing on a snowy mountain peak, wearing fur and iron armor, holding a battle-worn shield.' },
      { category: 'characters', prompt: 'A rugged bounty hunter in weathered space armor, standing in a crowded alien bazaar, multiple suns in the sky.' },
      { category: 'characters', prompt: 'A mysterious plague doctor in a dark alley, long beak mask, carrying a glowing lantern, gothic and atmospheric.' },
      { category: 'characters', prompt: 'A regal Egyptian queen sitting on a gold throne, surrounded by pyramids and desert sands, cinematic sun lighting.' },
      { category: 'characters', prompt: 'A samurai warrior in traditional silk robes, standing under falling cherry blossom petals, serene and majestic.' },
      { category: 'characters', prompt: 'A futuristic cyborg hacker with glowing neural implants, surrounded by data streams and digital screens.' },
      { category: 'characters', prompt: 'A whimsical forest fairy with translucent wings, sitting on a giant glowing mushroom, magical sparkles in the air.' },

      { category: 'worlds', prompt: 'Surreal landscape of floating islands with waterfalls cascading into the clouds, lush vegetation, giant flying birds.' },
      { category: 'worlds', prompt: 'A sprawling domed city on the red surface of Mars, dust storms in the background, futuristic rovers.' },
      { category: 'worlds', prompt: 'A massive underground cave filled with glowing bioluminescent crystals, a subterranean river of turquoise water.' },
      { category: 'worlds', prompt: 'An ancient overgrown stone temple deep in a tropical jungle, giant tree roots entwined with carvings.' },
      { category: 'worlds', prompt: 'A sprawling futuristic city at night, multi-layered flying car traffic, neon-drenched skyscrapers.' },
      { category: 'worlds', prompt: 'A frozen arctic landscape with a giant crystal palace, aurora borealis dancing in the sky, mystical and cold.' },
      { category: 'worlds', prompt: 'An underwater coral city with bioluminescent buildings, schools of exotic fish, ethereal deep sea lighting.' },
      { category: 'worlds', prompt: 'A medieval kingdom built into the side of a massive waterfall, stone bridges and castles, epic fantasy scale.' },
      { category: 'worlds', prompt: 'A surreal desert with giant clock faces buried in the sand, distorted perspective, Salvador Dali style.' },
      { category: 'worlds', prompt: 'A cosmic library floating in deep space, books made of starlight, nebula clouds visible through giant windows.' },

      { category: 'videos', prompt: 'Cinematic drone shot flying fast through a misty redwood forest, sunlight rays piercing through the canopy, dynamic motion.' },
      { category: 'videos', prompt: 'Slow motion macro video of colorful ink clouds swirling in clear water, psychedelic patterns, smooth transitions.' },
      { category: 'videos', prompt: 'Epic time-lapse of a volcanic eruption at night, glowing red lava flows, lightning within the ash cloud.' },
      { category: 'videos', prompt: 'A first-person view flying through a vibrant colorful nebula in deep space, stars rushing past.' },
      { category: 'videos', prompt: 'Long exposure motion of city traffic at night, glowing light trails from cars, bustling urban energy.' },
      { category: 'videos', prompt: 'Fast-paced action shot of a car racing through a futuristic city tunnel, motion blur, neon reflections.' },
      { category: 'videos', prompt: 'A peaceful sunrise over a calm ocean, gentle waves lapping at the shore, slow motion and serene.' },
      { category: 'videos', prompt: 'A dramatic stormy sea with massive waves crashing against jagged rocks, thunder and lightning, powerful motion.' },
      { category: 'videos', prompt: 'Abstract digital particles flowing and forming geometric shapes, 3D motion graphics, sleek and modern.' },
      { category: 'videos', prompt: 'A close-up of a blooming flower in high-speed time-lapse, vibrant petals unfolding, intricate nature motion.' },

      { category: 'styles', prompt: 'A beautiful portrait created in a vibrant watercolor style, loose brushstrokes, paint splatters, expressive colors.' },
      { category: 'styles', prompt: 'A clean and cozy 3D isometric render of a gaming room, soft pastel colors, miniature style, warm lighting.' },
      { category: 'styles', prompt: 'A classical oil painting of a rolling countryside at sunset, heavy impasto brushstrokes, rich textures.' },
      { category: 'styles', prompt: 'A retro-futuristic synthwave landscape, purple grid floor, giant glowing sun on the horizon, 1980s aesthetic.' },
      { category: 'styles', prompt: 'A highly detailed pencil sketch portrait of an elderly man, expressive wrinkles, realistic shading.' },
      { category: 'styles', prompt: 'Pop art style portrait with bold colors and Ben-Day dots, comic book aesthetic, vibrant and energetic.' },
      { category: 'styles', prompt: 'A minimalist ink wash painting of a lone pine tree on a misty mountain, traditional Japanese Sumi-e style.' },
      { category: 'styles', prompt: 'An intricate paper-cut art scene of a fairytale forest, multiple layers of depth, soft backlighting.' },
      { category: 'styles', prompt: 'A glitch art portrait with distorted digital artifacts, chromatic aberration, futuristic and edgy.' },
      { category: 'styles', prompt: 'A dreamy lo-fi aesthetic scene of a bedroom at dusk, soft grainy textures, purple and pink color palette.' },

      { category: 'architecture', prompt: 'A twisting glass and steel skyscraper reaching above the clouds, sunset reflections on the facade.' },
      { category: 'architecture', prompt: 'Interior of a massive gothic cathedral, light streaming through stained glass, intricate stone carvings.' },
      { category: 'architecture', prompt: 'A futuristic city built into giant trees, wooden bridges connecting platforms, vertical gardens.' },
      { category: 'architecture', prompt: 'A minimalist modern house overlooking a traditional Japanese zen garden, koi pond, peaceful design.' },
      { category: 'architecture', prompt: 'A decaying Victorian mansion at night, overgrown with ivy, broken windows, haunting atmosphere.' },
      { category: 'architecture', prompt: 'A brutalist concrete library with massive geometric shapes, harsh lighting, raw industrial aesthetic.' },
      { category: 'architecture', prompt: 'An Art Deco inspired hotel lobby, gold and marble surfaces, geometric patterns, glamorous and opulent.' },
      { category: 'architecture', prompt: 'A floating sky-temple with white marble pillars, surrounded by white clouds, ethereal and majestic.' },
      { category: 'architecture', prompt: 'A modern desert villa made of glass and rammed earth, integrated into the rocky landscape, sunset views.' },
      { category: 'architecture', prompt: 'A futuristic space station interior with modular pods, white sleek surfaces, views of earth from windows.' },

      { category: 'fashion', prompt: 'High-fashion editorial shot of a model wearing iridescent neon streetwear, cyberpunk accessories, futuristic urban background.' },
      { category: 'fashion', prompt: 'A lifestyle shot of a woman in a flowy bohemian summer dress, sun-kissed skin, wheat field background.' },
      { category: 'fashion', prompt: 'Avant-garde fashion photography featuring a model in a dress made entirely of origami paper, geometric folds.' },
      { category: 'fashion', prompt: 'An elegant woman in a flowing deep red silk evening gown, standing on a grand marble staircase, glamorous.' },
      { category: 'fashion', prompt: 'Futuristic tech-wear outfit with integrated glowing circuits, tactical harness, brutalist concrete environment.' },
      { category: 'fashion', prompt: 'A vintage 1950s style fashion shot, polka dot dress, classic car, bright sunny day, retro aesthetic.' },
      { category: 'fashion', prompt: 'High-end athletic wear with metallic fabrics, model in a dynamic running pose, sleek and modern.' },
      { category: 'fashion', prompt: 'A gothic lolita fashion shot in a Victorian garden, intricate lace and ruffles, moody and dark aesthetic.' },
      { category: 'fashion', prompt: 'Minimalist high-fashion look with oversized sculptural shapes, monochromatic white, high contrast studio lighting.' },
      { category: 'fashion', prompt: 'Street fashion shot in Seoul, colorful layered clothing, bright neon lights, urban youth energy.' }
    ];

    for (const temp of templates) {
      const existing = await AIPrompt.findOne({ prompt: temp.prompt, category: temp.category });
      if (!existing) {
        await new AIPrompt(temp).save();
      }
    }

    console.log('Advanced Prompt Library seeded successfully with 60 minimal prompts (10 per category).');
  } catch (error) {
    console.error('Error seeding Advanced Prompt Library:', error);
  }
};

exports.down = async ({ db }, mongoose) => {
  const { AIPrompt } = db;
  try {
    const categories = ['characters', 'worlds', 'videos', 'styles', 'architecture', 'fashion'];
    await AIPrompt.deleteMany({ category: { $in: categories } });
    console.log('Advanced Prompt Library entries removed.');
  } catch (error) {
    console.error('Error reverting Advanced Prompt Library seeder:', error);
  }
};
