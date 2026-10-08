exports.up = async ({ db }, mongoose) => {
  const { Plan } = db;
  try {
    const plans = [
      {
        name: 'Free Plan',
        slug: 'free-plan',
        description: 'Get started with basic AI features.',
        plan_type: 'subscription',
        billing_cycle: 'monthly',
        validity_days: 30,
        total_credits: 50,
        is_featured: false,
        status: 'active',
        amount: 0,
        currency: 'USD',
        ai_features: {
          text_to_image: true,
          image_to_image: false,
          video_motion: false,
          images_to_video: false,
          text_to_video: false,
          ai_caption_generator: false,
          ecommerce_catalogue: false,
          character_generation: false,
        },
      },
      {
        name: 'Pro Plan',
        slug: 'pro-plan',
        description: 'Advanced features for power users.',
        plan_type: 'subscription',
        billing_cycle: 'monthly',
        validity_days: 30,
        total_credits: 500,
        is_featured: true,
        status: 'active',
        amount: 29,
        currency: 'USD',
        ai_features: {
          text_to_image: true,
          image_to_image: true,
          video_motion: true,
          images_to_video: true,
          text_to_video: false,
          ai_caption_generator: true,
          ecommerce_catalogue: false,
          character_generation: false,
        },
      },
      {
        name: 'Enterprise Plan',
        slug: 'enterprise-plan',
        description: 'Unlimited access for teams.',
        plan_type: 'subscription',
        billing_cycle: 'monthly',
        validity_days: 30,
        total_credits: 2000,
        is_featured: false,
        status: 'active',
        amount: 99,
        currency: 'USD',
        ai_features: {
          text_to_image: true,
          image_to_image: true,
          video_motion: true,
          images_to_video: true,
          text_to_video: true,
          ai_caption_generator: true,
          ecommerce_catalogue: true,
          character_generation: true,
        },
      },
    ];

    for (const planData of plans) {
      const existing = await Plan.findOne({ slug: planData.slug });
      if (!existing) {
        await new Plan(planData).save();
      }
    }

    console.log('Plans seeded successfully.');
  } catch (error) {
    console.error('Error seeding Plans:', error);
  }
};

exports.down = async ({ db }, mongoose) => {
  const { Plan } = db;
  try {
    await Plan.deleteMany({});
    console.log('Plans removed.');
  } catch (error) {
    console.error('Error reverting Plan seeder:', error);
  }
};
