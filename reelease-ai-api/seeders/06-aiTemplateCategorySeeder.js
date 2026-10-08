exports.up = async ({ db }, mongoose) => {
  const { AITemplateCategory } = db;
  try {
    const categories = [
      { name: 'Futuristic', slug: 'futuristic', description: 'Advanced technology and sci-fi aesthetics.' },
      { name: 'Cinematic', slug: 'cinematic', description: 'Movie-like high quality visuals.' },
      { name: 'Anime', slug: 'anime', description: 'Japanese animation style.' },
      { name: 'Product Showcase', slug: 'product-showcase', description: 'High-end product photography and videos.' },
      { name: 'Abstract', slug: 'abstract', description: 'Non-representational artistic visuals.' }
    ];

    for (const cat of categories) {
      const existing = await AITemplateCategory.findOne({ slug: cat.slug });
      if (!existing) {
        await new AITemplateCategory(cat).save();
      }
    }

    console.log('AI Template Categories seeded successfully.');
  } catch (error) {
    console.error('Error seeding AI Template Categories:', error);
  }
};

exports.down = async ({ db }, mongoose) => {
  const { AITemplateCategory } = db;
  try {
    await AITemplateCategory.deleteMany({});
    console.log('AI Template Categories removed.');
  } catch (error) {
    console.error('Error reverting AI Template Category seeder:', error);
  }
};
