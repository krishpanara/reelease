exports.up = async ({ db }, mongoose) => {
  const { AICaptionModel } = db;
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY || 'GEMINI_API_KEY_REQUIRED';
    const openaiApiKey = process.env.OPENAI_API_KEY || 'OPENAI_API_KEY_REQUIRED';

    const models = [
      {
        name: 'Gemini 2.0 Flash',
        model_id: 'gemini-2.0-flash',
        provider: 'gemini',
        api_key: geminiApiKey,
        is_default: true,
        is_active: true,
        credit_cost: 10,
        description: 'Fast and efficient model for general caption generation',
        max_output_tokens: 500
      },
      {
        name: 'Gemini 2.0 Flash Lite',
        model_id: 'gemini-2.0-flash-lite',
        provider: 'gemini',
        api_key: geminiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 8,
        description: 'Lightweight model for cost-effective caption generation',
        max_output_tokens: 500
      },
      {
        name: 'Gemini 2.5 Pro',
        model_id: 'gemini-2.5-pro',
        provider: 'gemini',
        api_key: geminiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 15,
        description: 'Advanced model with enhanced reasoning for complex captions',
        max_output_tokens: 500
      },
      {
        name: 'Gemini 2.5 Flash',
        model_id: 'gemini-2.5-flash',
        provider: 'gemini',
        api_key: geminiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 12,
        description: 'Balanced model with improved quality and speed',
        max_output_tokens: 500
      },
      {
        name: 'Gemini 2.5 Flash Lite',
        model_id: 'gemini-2.5-flash-lite',
        provider: 'gemini',
        api_key: geminiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 10,
        description: 'Efficient model optimized for quick caption generation',
        max_output_tokens: 500
      },
      {
        name: 'GPT-4o',
        model_id: 'gpt-4o',
        provider: 'openai',
        api_key: openaiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 20,
        description: 'OpenAI\'s most advanced model for high-quality captions',
        max_output_tokens: 500
      },
      {
        name: 'GPT-4o Mini',
        model_id: 'gpt-4o-mini',
        provider: 'openai',
        api_key: openaiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 12,
        description: 'Cost-effective OpenAI model for general caption generation',
        max_output_tokens: 500
      },
      {
        name: 'GPT-4 Turbo',
        model_id: 'gpt-4-turbo',
        provider: 'openai',
        api_key: openaiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 18,
        description: 'Enhanced GPT-4 with improved performance and knowledge',
        max_output_tokens: 500
      },
      {
        name: 'o1 Mini',
        model_id: 'o1-mini',
        provider: 'openai',
        api_key: openaiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 15,
        description: 'Reasoning-optimized model for strategic caption creation',
        max_output_tokens: 500
      },
      {
        name: 'o3 Mini',
        model_id: 'o3-mini',
        provider: 'openai',
        api_key: openaiApiKey,
        is_default: false,
        is_active: true,
        credit_cost: 16,
        description: 'Latest generation model with advanced capabilities',
        max_output_tokens: 500
      }
    ];

    for (const model of models) {
      const existing = await AICaptionModel.findOne({ model_id: model.model_id });
      if (existing) {
        await AICaptionModel.updateOne({ model_id: model.model_id }, { $set: model });
      } else {
        await AICaptionModel.create(model);
      }
    }
    console.log('✅ AI Caption Models seeded/updated successfully.');

  } catch (error) {
    console.error('Error seeding AI Caption Models:', error);
  }
};

exports.down = async ({ db }, mongoose) => {
  const { AICaptionModel } = db;
  try {
    await AICaptionModel.deleteMany({});
  } catch (error) {
    console.error('Error removing AI Caption Models:', error);
  }
};
