exports.up = async ({ db }, mongoose) => {
  const { AITemplate, AITemplateCategory, Attachment } = db;
  try {
    const category = await AITemplateCategory.findOne({ slug: 'futuristic' });
    if (!category) return console.log('Category futuristic not found, skipping template seeding.');

    const dummyAttachment = new Attachment({
      name: 'futuristic-city.jpg',
      file_path: '/uploads/futuristic-city.jpg',
      file_type: 'image',
      file_size: 1024,
      mime_type: 'image/jpeg'
    });
    await dummyAttachment.save();

    const templates = [
      {
        title: 'Cyberpunk Metropolis',
        description: 'A neon-lit futuristic city at night.',
        attachment_id: dummyAttachment._id,
        category_id: category._id,
        type: 'image',
        prompt: 'Futuristic city with neon lights, cyberpunk aesthetic, high detail, 8k',
        status: true
      }
    ];

    for (const temp of templates) {
      const existing = await AITemplate.findOne({ title: temp.title });
      if (!existing) {
        await new AITemplate(temp).save();
      }
    }

    console.log('AI Templates seeded successfully.');
  } catch (error) {
    console.error('Error seeding AI Templates:', error);
  }
};

exports.down = async ({ db }, mongoose) => {
  const { AITemplate, Attachment } = db;
  try {
    await AITemplate.deleteMany({});
    console.log('AI Templates removed.');
  } catch (error) {
    console.error('Error reverting AI Template seeder:', error);
  }
};
