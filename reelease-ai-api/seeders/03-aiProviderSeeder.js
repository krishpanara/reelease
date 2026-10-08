exports.up = async ({ db }, mongoose) => {
  const { AIProvider, AIFeatureCredit } = db;
  try {
    let existingProvider = await AIProvider.findOne({ name: 'Kie.ai' });

    const textToImageConfig = {
      enabled: true,
      base_url: 'https://api.kie.ai',
      api_key: '',
      auth_type: 'Bearer Token',
      create_job_request: {
        method: 'POST',
        endpoint: '/api/v1/jobs/createTask',
        payload: '{\n  "model": "flux-2/pro-text-to-image",\n  "input": {\n    "prompt": "{{prompt}}",\n    "resolution": "{{resolution}}",\n    "aspect_ratio": "{{aspect_ratio}}"\n  }\n}',
        job_id_path: 'data.taskId'
      },
      poll_job_status: {
        method: 'GET',
        endpoint: '/api/v1/jobs/recordInfo?taskId={{taskId}}',
        state_path: 'data.state',
        success_state_value: 'success',
        failed_state_value: 'fail',
        result_media_url_path: 'data.resultJson.resultUrls[0]'
      }
    };

    const imageToImageConfig = {
      enabled: true,
      base_url: 'https://api.kie.ai',
      api_key: '',
      auth_type: 'Bearer Token',
      create_job_request: {
        method: 'POST',
        endpoint: '/api/v1/jobs/createTask',
        payload: '{\n  "model": "flux-2/pro-image-to-image",\n  "input": {\n    "prompt": "{{prompt}}",\n    "resolution": "{{resolution}}",\n    "aspect_ratio": "{{aspect_ratio}}",\n    "input_urls": {{reference_urls}}\n  }\n}',
        job_id_path: 'data.taskId'
      },
      poll_job_status: {
        method: 'GET',
        endpoint: '/api/v1/jobs/recordInfo?taskId={{taskId}}',
        state_path: 'data.state',
        success_state_value: 'success',
        failed_state_value: 'fail',
        result_media_url_path: 'data.resultJson.resultUrls[0]'
      }
    };

    const videoMotionConfig = {
      enabled: true,
      base_url: 'https://api.kie.ai',
      api_key: '',
      auth_type: 'Bearer Token',
      create_job_request: {
        method: 'POST',
        endpoint: '/api/v1/jobs/createTask',
        payload: '{\n  "model": "kling-2.6/motion-control",\n  "input": {\n    "prompt": "{{prompt}}",\n    "input_urls": [\n      "{{reference_url}}"\n    ],\n    "video_urls": [\n      "{{video_url}}"\n    ],\n    "character_orientation": "video",\n    "mode": "720p"\n  }\n}',
        job_id_path: 'data.taskId'
      },
      poll_job_status: {
        method: 'GET',
        endpoint: '/api/v1/jobs/recordInfo?taskId={{taskId}}',
        state_path: 'data.state',
        success_state_value: 'success',
        failed_state_value: 'fail',
        result_media_url_path: 'data.resultJson.resultUrls[0]'
      }
    };

    const imagesToVideoConfig = {
      enabled: true,
      base_url: 'https://api.kie.ai',
      api_key: '',
      auth_type: 'Bearer Token',
      create_job_request: {
        method: 'POST',
        endpoint: '/api/v1/jobs/createTask',
        payload: '{\n  "model": "kling-3.0/video",\n  "input": {\n    "prompt": "{{prompt}}",\n    "image_urls": {{reference_urls}},\n    "sound": {{sound}},\n    "duration": "{{duration}}",\n    "aspect_ratio": "{{aspect_ratio}}",\n    "mode": "{{mode}}",\n    "multi_shots": {{multi_shots}},\n    "multi_prompt": {{multi_prompt}},\n    "kling_elements": {{kling_elements}}\n  }\n}',
        job_id_path: 'data.taskId'
      },
      poll_job_status: {
        method: 'GET',
        endpoint: '/api/v1/jobs/recordInfo?taskId={{taskId}}',
        state_path: 'data.state',
        success_state_value: 'success',
        failed_state_value: 'fail',
        result_media_url_path: 'data.resultJson.resultUrls[0]'
      }
    };

    const textToVideoConfig = {
      enabled: true,
      base_url: 'https://api.kie.ai',
      api_key: '',
      auth_type: 'Bearer Token',
      create_job_request: {
        method: 'POST',
        endpoint: '/api/v1/jobs/createTask',
        payload: '{\n  "model": "kling-3.0/video",\n  "input": {\n    "prompt": "{{prompt}}",\n    "sound": {{sound}},\n    "duration": "{{duration}}",\n    "aspect_ratio": "{{aspect_ratio}}",\n    "mode": "{{mode}}",\n    "multi_shots": {{multi_shots}},\n    "multi_prompt": {{multi_prompt}},\n    "kling_elements": {{kling_elements}}\n  }\n}',
        job_id_path: 'data.taskId'
      },
      poll_job_status: {
        method: 'GET',
        endpoint: '/api/v1/jobs/recordInfo?taskId={{taskId}}',
        state_path: 'data.state',
        success_state_value: 'success',
        failed_state_value: 'fail',
        result_media_url_path: 'data.resultJson.resultUrls[0]'
      }
    };

    const providerData = {
      name: 'Kie.ai',
      text_to_image: textToImageConfig,
      image_to_image: imageToImageConfig,
      video_motion: videoMotionConfig,
      images_to_video: imagesToVideoConfig,
      text_to_video: textToVideoConfig
    };

    if (existingProvider) {
      for (const feature of ['text_to_image', 'image_to_image', 'video_motion', 'images_to_video', 'text_to_video']) {
         if (existingProvider[feature]) {
            providerData[feature].api_key = existingProvider[feature].api_key;
            providerData[feature].enabled = existingProvider[feature].enabled;
         }
      }
      await AIProvider.updateOne({ _id: existingProvider._id }, { $set: providerData });
      console.log('Kie.ai provider updated successfully.');
    } else {
      existingProvider = new AIProvider(providerData);
      await existingProvider.save();
      console.log('Kie.ai provider seeded successfully.');
    }

    const credits = [
      {
        provider_id: existingProvider._id,
        feature_key: 'text_to_image',
        display_name: 'Text to Image',
        description: 'Generate high-quality images from text prompts.',
        icon: 'image',
        credits: 5,
        is_per_second: false
      },
      {
        provider_id: existingProvider._id,
        feature_key: 'image_to_image',
        display_name: 'Image to Image',
        description: 'Transform an existing image based on a prompt.',
        icon: 'images',
        credits: 5,
        is_per_second: false
      },
      {
        provider_id: existingProvider._id,
        feature_key: 'video_motion',
        display_name: 'Video Motion',
        description: 'Add motion control to images and videos.',
        icon: 'move',
        credits: 10,
        is_per_second: false
      },
      {
        provider_id: existingProvider._id,
        feature_key: 'images_to_video',
        display_name: 'Images to Video',
        description: 'Create cinematic videos from one or more images.',
        icon: 'video',
        credits: 20,
        is_per_second: false
      },
      {
        provider_id: existingProvider._id,
        feature_key: 'text_to_video',
        display_name: 'Text to Video',
        description: 'Generate cinematic videos from text prompts.',
        icon: 'clapperboard',
        credits: 25,
        is_per_second: false
      }
    ];

    for (const credit of credits) {
       const existingCredit = await AIFeatureCredit.findOne({ provider_id: existingProvider._id, feature_key: credit.feature_key });
       if (!existingCredit) {
         await AIFeatureCredit.create(credit);
       } else {
         await AIFeatureCredit.updateOne({ _id: existingCredit._id }, { $set: credit });
       }
    }
    console.log('Credits for Kie.ai seeded successfully.');

  } catch (error) {
    console.error('Error seeding AI Provider or Credits:', error);
  }
};

exports.down = async ({ db }, mongoose) => {
  const { AIProvider, AIFeatureCredit } = db;
  try {
    const provider = await AIProvider.findOne({ name: 'Kie.ai' });
    if (provider) {
      await AIFeatureCredit.deleteMany({ provider_id: provider._id });
      await AIProvider.deleteOne({ _id: provider._id });
    }
    console.log('Kie.ai provider and its credits removed.');
  } catch (error) {
    console.error('Error reverting AI Provider seeder:', error);
  }
};
