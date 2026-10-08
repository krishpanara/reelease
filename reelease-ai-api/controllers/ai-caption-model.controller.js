const { db } = require('../models');
const AICaptionModel = db.AICaptionModel;

const maskApiKey = (apiKey) => {
  if (!apiKey || apiKey.length <= 4) return apiKey;
  return '•'.repeat(apiKey.length - 4) + apiKey.slice(-4);
};

exports.getListModels = async (req, res) => {
  try {
    const { provider, is_active, search, sort_by = 'name', sort_order = 'asc', page = 1, limit = 10 } = req.query;

    const query = {};

    if (provider) query.provider = provider;

    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model_id: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {
      [sort_by]: sort_order === 'desc' ? -1 : 1
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [models, total] = await Promise.all([
      AICaptionModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      AICaptionModel.countDocuments(query)
    ]);

    const maskedModels = models.map(model => {
      const modelObj = model.toObject();
      modelObj.api_key = maskApiKey(modelObj.api_key);
      return modelObj;
    });

    res.json({
      success: true,
      data: maskedModels,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching AI caption models:', error);
    res.status(500).json({
      message: 'Failed to fetch AI caption models'
    });
  }
};

exports.getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    const model = await AICaptionModel.findById(id);

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    const modelObj = model.toObject();
    modelObj.api_key = maskApiKey(modelObj.api_key);

    res.json({
      success: true,
      data: modelObj
    });
  } catch (error) {
    console.error('Error fetching AI caption model:', error);
    res.status(500).json({ message: 'Failed to fetch AI caption model' });
  }
};

exports.createModel = async (req, res) => {
  try {
    const { name, model_id, provider, api_key, is_default, is_active, credit_cost, description, max_output_tokens } = req.body;

    if (!name || !model_id || !provider || !api_key) {
      return res.status(400).json({ message: 'name, model_id, provider, and api_key are required' });
    }

    if (!credit_cost || credit_cost < 1) {
      return res.status(400).json({ message: 'credit_cost must be at least 1' });
    }

    const existingModel = await AICaptionModel.findOne({ model_id: model_id.toLowerCase() });
    if (existingModel) {
      return res.status(400).json({ message: 'Model ID already exists' });
    }

    if (is_default) {
      await AICaptionModel.updateMany({ is_default: true }, { is_default: false });
    }

    const newModel = new AICaptionModel({
      name,
      model_id: model_id.toLowerCase(),
      provider,
      api_key,
      is_default: is_default || false,
      is_active: is_active !== undefined ? is_active : true,
      credit_cost,
      description,
      max_output_tokens: max_output_tokens || 500
    });

    await newModel.save();

    const modelObj = newModel.toObject();
    modelObj.api_key = maskApiKey(modelObj.api_key);

    res.status(201).json({
      success: true,
      message: 'AI caption model created successfully',
      data: modelObj
    });
  } catch (error) {
    console.error('Error creating AI caption model:', error);
    res.status(500).json({ message: error.message || 'Failed to create AI caption model' });
  }
};

exports.updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model_id, provider, api_key, is_default, is_active, credit_cost, description, max_output_tokens } = req.body;

    const model = await AICaptionModel.findById(id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (credit_cost !== undefined && credit_cost < 1) {
      return res.status(400).json({ message: 'credit_cost must be at least 1' });
    }

    if (model_id && model_id.toLowerCase() !== model.model_id) {
      const existingModel = await AICaptionModel.findOne({
        model_id: model_id.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingModel) {
        return res.status(400).json({ message: 'Model ID already exists' });
      }
      model.model_id = model_id.toLowerCase();
    }

    if (is_default === true) {
      await AICaptionModel.updateMany({ is_default: true, _id: { $ne: id } }, { is_default: false });
    }

    if (name !== undefined) model.name = name;
    if (provider !== undefined) model.provider = provider;
    if (api_key !== undefined) model.api_key = api_key;
    if (is_default !== undefined) model.is_default = is_default;
    if (is_active !== undefined) model.is_active = is_active;
    if (credit_cost !== undefined) model.credit_cost = credit_cost;
    if (description !== undefined) model.description = description;
    if (max_output_tokens !== undefined) model.max_output_tokens = max_output_tokens;

    await model.save();

    const modelObj = model.toObject();
    modelObj.api_key = maskApiKey(modelObj.api_key);

    res.json({
      success: true,
      message: 'AI caption model updated successfully',
      data: modelObj
    });
  } catch (error) {
    console.error('Error updating AI caption model:', error);
    res.status(500).json({ message: error.message || 'Failed to update AI caption model' });
  }
};

exports.setAsDefault = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await AICaptionModel.findById(id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    await AICaptionModel.updateMany({ is_default: true }, { is_default: false });

    model.is_default = true;
    await model.save();

    const modelObj = model.toObject();
    modelObj.api_key = maskApiKey(modelObj.api_key);

    res.json({
      success: true,
      message: 'Default model updated successfully',
      data: modelObj
    });
  } catch (error) {
    console.error('Error setting default model:', error);
    res.status(500).json({ message: 'Failed to set default model' });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await AICaptionModel.findById(id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (model.is_active) {
      const activeCount = await AICaptionModel.countDocuments({ is_active: true });
      if (activeCount <= 1) {
        return res.status(400).json({
          message: 'Cannot deactivate the last active model. At least one model must be active.'
        });
      }
    }

    model.is_active = !model.is_active;
    await model.save();

    const modelObj = model.toObject();
    modelObj.api_key = maskApiKey(modelObj.api_key);

    res.json({
      success: true,
      message: `Model ${model.is_active ? 'activated' : 'deactivated'} successfully`,
      data: modelObj
    });
  } catch (error) {
    console.error('Error toggling model status:', error);
    res.status(500).json({ message: 'Failed to toggle model status' });
  }
};

exports.deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await AICaptionModel.findById(id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (model.is_default) {
      return res.status(400).json({
        message: 'Cannot delete the default model. Please set another model as default first.'
      });
    }

    const activeCount = await AICaptionModel.countDocuments({ is_active: true, _id: { $ne: id } });
    if (activeCount === 0 && model.is_active) {
      return res.status(400).json({
        message: 'Cannot delete the last active model. At least one model must be active.'
      });
    }

    await AICaptionModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'AI caption model deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting AI caption model:', error);
    res.status(500).json({ message: 'Failed to delete AI caption model' });
  }
};

exports.deleteModels = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Model IDs array is required' });
    }

    const defaultModelCount = await AICaptionModel.countDocuments({ _id: { $in: ids }, is_default: true });
    if (defaultModelCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete the default model. Please set another model as default first.'
      });
    }

    const activeModelsInList = await AICaptionModel.countDocuments({ _id: { $in: ids }, is_active: true });
    if (activeModelsInList > 0) {
      const totalActive = await AICaptionModel.countDocuments({ is_active: true });
      if (totalActive - activeModelsInList === 0) {
        return res.status(400).json({
          message: 'Cannot delete the last active model. At least one model must be active.'
        });
      }
    }

    const result = await AICaptionModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No AI caption models found' });
    }

    const response = {
      success: true,
      message: `${result.deletedCount} AI caption model(s) deleted successfully`,
      deletedCount: result.deletedCount
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in deleteModels:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getActiveModels = async (req, res) => {
  try {
    const models = await AICaptionModel.find({ is_active: true })
      .select('name model_id provider credit_cost description is_default')
      .sort({ is_default: -1, name: 1 });

    res.json({
      success: true,
      data: models,
      total: models.length
    });
  } catch (error) {
    console.error('Error fetching active AI caption models:', error);
    res.status(500).json({ message: 'Failed to fetch active AI caption models' });
  }
};
