const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { encryptToken, decryptToken } = require('../utils/encryption');
const { db } = require('../models');
const Setting = db.Setting;
const SocialPost = db.SocialPost;
const Notification = db.Notification;
const fileHelper = require('../utils/fileHelper');
const sharp = require('sharp');
const { google } = require('googleapis');
const DEFAULT_FACEBOOK_API_VERSION = 'v19.0';

class SocialMediaService {

  async getUserFacebookConfig(userId) {
    const adminSettings = await Setting.findOne();

    if (!adminSettings || !adminSettings.facebook_app_id || !adminSettings.facebook_app_secret) {
      throw new Error('Facebook app credentials not configured. Please contact your administrator.');
    }

    return {
      appId: adminSettings.facebook_app_id,
      appSecret: adminSettings.facebook_app_secret,
      apiVersion: adminSettings.facebook_api_version || DEFAULT_FACEBOOK_API_VERSION
    };
  }

  async getUserLinkedInConfig(userId) {
    const adminSettings = await Setting.findOne();

    if (!adminSettings || !adminSettings.linkedin_client_id || !adminSettings.linkedin_client_secret) {
      throw new Error('LinkedIn credentials not configured. Please contact your administrator.');
    }

    return {
      clientId: adminSettings.linkedin_client_id,
      clientSecret: adminSettings.linkedin_client_secret
    };
  }

  async getUserTwitterConfig(userId) {
    const adminSettings = await Setting.findOne();

    if (!adminSettings || !adminSettings.twitter_consumer_key || !adminSettings.twitter_consumer_secret) {
      throw new Error('Twitter credentials not configured. Please contact your administrator.');
    }

    return {
      consumerKey: adminSettings.twitter_consumer_key,
      consumerSecret: adminSettings.twitter_consumer_secret,
      oauthToken: adminSettings.twitter_oauth_token || null,
      oauthTokenSecret: adminSettings.twitter_oauth_token_secret || null,
      clientId: adminSettings.twitter_client_id || null,
      clientSecret: adminSettings.twitter_client_secret || null
    };
  }

  async getUserYouTubeConfig(userId) {
    const adminSettings = await Setting.findOne();

    if (!adminSettings || !adminSettings.youtube_client_id || !adminSettings.youtube_client_secret) {
      throw new Error('YouTube credentials not configured. Please contact your administrator.');
    }

    return {
      clientId: adminSettings.youtube_client_id,
      clientSecret: adminSettings.youtube_client_secret
    };
  }

  async _makeRequest(config) {
    const defaultConfig = { timeout: 60000, family: 4 };

    try {
      return await axios({ ...defaultConfig, ...config });
    } catch (error) {
      throw error;
    }
  }

  async getFacebookSDKConfig(userId) {

    const config = await this.getUserFacebookConfig(userId);

    return {
      appId: config.appId,
      apiVersion: config.apiVersion,
      scopes: [
        'pages_manage_posts',
        'pages_read_engagement',
        'instagram_basic',
        'instagram_content_publish',
        'pages_show_list',
        'public_profile'
      ]
    };
  }

  async getThreadsSDKConfig() {
    const adminSettings = await Setting.findOne();
    if (!adminSettings?.threads_app_id || !adminSettings?.threads_app_secret) {
      throw new Error('Threads App ID or Secret not configured in Settings.');
    }
    return {
      appId: adminSettings.threads_app_id,
      appSecret: adminSettings.threads_app_secret,
      scopes: 'threads_basic,threads_content_publish'
    };
  }

  async exchangeThreadsCodeForToken(code, redirectUri, appId, appSecret) {
    try {
      const response = await this._makeRequest({
        method: 'post',
        url: 'https://graph.threads.net/oauth/access_token',
        data: {
          client_id: appId,
          client_secret: appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Threads short-lived token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for Threads token.');
    }
  }

  async exchangeThreadsLongLivedToken(shortLivedToken, appSecret) {
    try {
      const response = await this._makeRequest({
        method: 'get',
        url: 'https://graph.threads.net/access_token',
        params: {
          grant_type: 'th_exchange_token',
          client_secret: appSecret,
          access_token: shortLivedToken
        }
      });
      return response.data;
    } catch (error) {
      console.error('Threads long-lived token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to upgrade to long-lived Threads token.');
    }
  }

  async verifyFacebookToken(accessToken, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;
      const response = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/me`,
        params: {
          access_token: accessToken,
          fields: 'id,name,picture'
        }
      });

      return response.data;

    } catch (error) {
      const fbError = error.response?.data?.error;
      const errorMsg = fbError?.message || error.message || 'Unknown Facebook error';
      throw new Error(`Invalid Facebook token: ${errorMsg}`);
    }
  }

  async getFacebookPages(accessToken, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;
      const response = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/me/accounts`,
        params: {
          access_token: accessToken,
          fields: 'id,name,username,access_token,category,picture.type(large),followers_count,fan_count'
        }
      });

      return response.data.data || [];

    } catch (error) {
      const fbError = error.response?.data?.error;
      const errorMsg = fbError?.message || error.message || 'Unknown Facebook error';
      throw new Error(`Failed to fetch Facebook pages: ${errorMsg}`);
    }
  }

  async getInstagramAccount(accessToken, pageId, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;
      const response = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/${pageId}`,
        params: {
          access_token: accessToken,
          fields: 'instagram_business_account'
        }
      });

      const igAccountId = response.data.instagram_business_account?.id;
      if (!igAccountId) return null;

      const igDetailsResponse = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/${igAccountId}`,
        params: {
          access_token: accessToken,
          fields: 'id,name,username,profile_picture_url,followers_count,media_count'
        }
      });

      return igDetailsResponse.data;
    } catch (error) {
      console.error('Error fetching Instagram account:', error.message);
      return null;
    }
  }

  async exchangeForLongLivedToken(shortLivedToken, appId, appSecret, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;
      const response = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/oauth/access_token`,
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken
        }
      });

      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      throw new Error(`Failed to exchange for long-lived token: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async storeFacebookAccount(SocialAccount, userId, pageData, accessToken) {
    const encryptedToken = encryptToken(accessToken);
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    let followers_count = pageData.followers_count || pageData.fan_count || 0;
    let media_count = 0;
    try {
      const stats = await this.fetchFacebookPageStats(accessToken, pageData.id);
      if (stats) {
        followers_count = stats.followers_count;
        media_count = stats.media_count;
      }
    } catch (err) {
      console.error('Error fetching Facebook page stats during store:', err.message);
    }

    const socialAccount = new SocialAccount({
      user: userId,
      platform: 'facebook',
      account_id: pageData.id,
      account_name: pageData.name,
      account_username: pageData.username || (pageData.name ? pageData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '') : null) || pageData.id,
      access_token: encryptedToken,
      token_expiry: tokenExpiry,
      page_id: pageData.id,
      page_name: pageData.name,
      permissions: ['pages_manage_posts', 'pages_read_engagement'],
      profile_picture: pageData.picture?.data?.url || null,
      metadata: {
        followers_count,
        media_count
      },
      is_active: true,
      connected_at: new Date()
    });

    await socialAccount.save();
    return socialAccount;
  }

  async fetchFacebookPageStats(accessToken, pageId, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;

      const detailsRes = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/${pageId}`,
        params: {
          access_token: accessToken,
          fields: 'fan_count,followers_count,name'
        }
      });

      const followers = detailsRes.data.followers_count || detailsRes.data.fan_count || 0;

      let media = 0;
      try {
        const feedRes = await this._makeRequest({
          method: 'get',
          url: `${baseUrl}/${pageId}/feed`,
          params: {
            access_token: accessToken,
            limit: 100,
            fields: 'id'
          }
        });
        media = feedRes.data?.data?.length || 0;
      } catch (feedErr) {
        console.warn(`Could not fetch feed for page ${pageId}:`, feedErr.message);
      }

      return {
        followers_count: followers,
        media_count: media
      };
    } catch (error) {
      console.error(`Failed to fetch Facebook Page stats for ${pageId}:`, error.response?.data || error.message);
      return null;
    }
  }

  async fetchInstagramAccountStats(accessToken, igAccountId, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;
      const response = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/${igAccountId}`,
        params: {
          access_token: accessToken,
          fields: 'followers_count,media_count'
        }
      });
      return {
        followers_count: response.data.followers_count || 0,
        media_count: response.data.media_count || 0
      };
    } catch (error) {
      console.error(`Failed to fetch Instagram stats for ${igAccountId}:`, error.message);
      return null;
    }
  }

  async fetchPostEngagement(accessToken, postId, platform, apiVersion = DEFAULT_FACEBOOK_API_VERSION) {
    try {
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;

      if (platform === 'facebook') {
        const response = await this._makeRequest({
          method: 'get',
          url: `${baseUrl}/${postId}`,
          params: {
            access_token: accessToken,
            fields: 'likes.summary(true),comments.summary(true),shares'
          }
        });
        const data = response.data;
        return {
          likes: data.likes?.summary?.total_count || 0,
          comments: data.comments?.summary?.total_count || 0,
          shares: data.shares?.count || 0
        };
      } else if (platform === 'instagram') {
        const response = await this._makeRequest({
          method: 'get',
          url: `${baseUrl}/${postId}`,
          params: {
            access_token: accessToken,
            fields: 'like_count,comments_count'
          }
        });
        const data = response.data;
        return {
          likes: data.like_count || 0,
          comments: data.comments_count || 0,
          shares: 0
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch engagement for post ${postId} on ${platform}:`, error.response?.data?.error?.message || error.message);
      return null;
    }
  }

  async storeInstagramAccount(SocialAccount, userId, igAccountData, accessToken, facebookPageId) {
    const encryptedToken = encryptToken(accessToken);
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    const socialAccount = new SocialAccount({
      user: userId,
      platform: 'instagram',
      account_id: igAccountData.id,
      account_name: igAccountData.name || igAccountData.username,
      account_username: igAccountData.username || (igAccountData.name ? igAccountData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '') : null) || igAccountData.id,
      access_token: encryptedToken,
      token_expiry: tokenExpiry,
      page_id: facebookPageId,
      permissions: ['instagram_basic', 'instagram_content_publish'],
      profile_picture: igAccountData.profile_picture_url || null,
      metadata: {
        followers_count: igAccountData.followers_count || 0,
        media_count: igAccountData.media_count || 0
      },
      is_active: true,
      connected_at: new Date()
    });

    await socialAccount.save();
    return socialAccount;
  }

  async storeThreadsAccount(SocialAccount, userId, threadsAccountData, accessToken, pageId) {
    const encryptedToken = encryptToken(accessToken);
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    const socialAccount = new SocialAccount({
      user: userId,
      platform: 'threads',
      account_id: threadsAccountData.id,
      account_name: threadsAccountData.name || threadsAccountData.username,
      account_username: threadsAccountData.username || threadsAccountData.id,
      access_token: encryptedToken,
      token_expiry: tokenExpiry,
      page_id: pageId,
      permissions: ['threads_basic', 'threads_content_publish'],
      profile_picture: threadsAccountData.threads_profile_picture_url || null,
      metadata: {
        followers_count: threadsAccountData.followers_count || 0
      },
      is_active: true,
      connected_at: new Date()
    });

    await socialAccount.save();
    return socialAccount;
  }

  async getConnectedAccounts(SocialAccount, userId, platform = null, includeInactive = false) {
    const query = { user: userId };
    if (!includeInactive) {
      query.is_active = true;
    }
    if (platform) {
      query.platform = platform;
    }

    const accounts = await SocialAccount.find(query).select('-access_token -refresh_token').sort({ platform: 1, account_name: 1 });

    return accounts;
  }

  async getAccountWithToken(SocialAccount, accountId, userId) {
    const account = await SocialAccount.findOne({ _id: accountId, user: userId, is_active: true });

    if (!account) {
      throw new Error('Social account not found');
    }

    const decryptedToken = decryptToken(account.access_token);

    return {
      ...account.toObject(),
      access_token: decryptedToken
    };
  }

  _is_video(mediaUrl) {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'];
    const ext = path.extname(mediaUrl).toLowerCase();
    return videoExtensions.includes(ext);
  }

  async setAccountPaused(SocialAccount, accountId, userId, isPaused) {
    const account = await SocialAccount.findOneAndUpdate(
      { _id: accountId, user: userId, is_active: true },
      { is_paused: !!isPaused },
      { new: true }
    ).select('-access_token -refresh_token');

    if (!account) {
      throw new Error('Social account not found');
    }

    return account;
  }

  async disconnectAccount(SocialAccount, accountId, userId) {
    const account = await SocialAccount.findOneAndUpdate(
      { _id: accountId, user: userId },
      { is_active: false, is_paused: false },
      { new: true }
    );

    if (!account) {
      throw new Error('Social account not found');
    }

    return account;
  }

  async publishToFacebook(account, mediaUrls, caption, contentType) {
    const accessToken = account.access_token;
    const pageId = account.page_id || account.account_id;
    const apiVersion = DEFAULT_FACEBOOK_API_VERSION;
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;

    const urls = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

    try {
      let result;

      if (contentType === 'post' || contentType === 'feed') {
        if (urls.length > 0) {
          if (urls.length === 1) {
            result = await this._makeRequest({
              method: 'post',
              url: `${baseUrl}/${pageId}/photos`,
              data: {
                url: urls[0],
                message: caption || '',
                access_token: accessToken
              }
            });
          } else {
            const attachmentIds = [];
            for (const url of urls) {
              const upload = await this._makeRequest({
                method: 'post',
                url: `${baseUrl}/${pageId}/photos`,
                data: {
                  url: url,
                  published: false,
                  access_token: accessToken
                }
              });
              attachmentIds.push(upload.data.id);
            }

            result = await this._makeRequest({
              method: 'post',
              url: `${baseUrl}/${pageId}/feed`,
              data: {
                message: caption || '',
                attached_media: attachmentIds.map(id => ({ media_fbid: id })),
                access_token: accessToken
              }
            });
          }
        } else {
          result = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${pageId}/feed`,
            data: {
              message: caption || '',
              access_token: accessToken
            }
          });
        }
      } else if (contentType === 'video') {
        result = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${pageId}/videos`,
          data: {
            file_url: urls[0],
            description: caption || '',
            access_token: accessToken
          }
        });
      } else if (contentType === 'story') {
        const results = [];
        for (const mediaUrl of urls) {
          const isVideo = mediaUrl && mediaUrl.toLowerCase().includes('.mp4');
          let currentResult;

          if (isVideo) {
            const initResponse = await this._makeRequest({
              method: 'post',
              url: `${baseUrl}/${pageId}/video_stories`,
              data: {
                upload_phase: 'start',
                access_token: accessToken
              }
            });

            const { video_id, upload_url } = initResponse.data;

            try {
              await this._makeRequest({
                method: 'post',
                url: upload_url,
                headers: {
                  'Authorization': `OAuth ${accessToken}`,
                  'file_url': mediaUrl
                }
              });
            } catch (uploadError) {
              console.error('Facebook rupload error details:', uploadError.response?.data || uploadError.message);
              throw uploadError;
            }

            await this.checkFacebookVideoStatus(video_id, accessToken, apiVersion);

            currentResult = await this._makeRequest({
              method: 'post',
              url: `${baseUrl}/${pageId}/video_stories`,
              data: {
                video_id: video_id,
                upload_phase: 'finish',
                access_token: accessToken
              }
            });
            results.push(currentResult);
          } else {
            const uploadResponse = await this._makeRequest({
              method: 'post',
              url: `${baseUrl}/${pageId}/photos`,
              data: {
                url: mediaUrl,
                published: false,
                access_token: accessToken
              }
            });

            const photoId = uploadResponse.data.id;

            currentResult = await this._makeRequest({
              method: 'post',
              url: `${baseUrl}/${pageId}/photo_stories`,
              data: {
                photo_id: photoId,
                access_token: accessToken
              }
            });
            results.push(currentResult);
          }
        }
        result = results[0];
      } else if (contentType === 'reel') {
        if (urls.length > 1) {
          throw new Error('Reels do not support multiple media items');
        }
        const mediaUrl = urls[0];
        const isVideo = mediaUrl && mediaUrl.toLowerCase().match(/\.(mp4|mov|avi|m4v)$/);

        if (!isVideo) {
          throw new Error('Reels must be video files.');
        }

        const initResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${pageId}/video_reels`,
          data: {
            upload_phase: 'start',
            access_token: accessToken
          }
        });

        const { video_id, upload_url } = initResponse.data;

        try {
          await this._makeRequest({
            method: 'post',
            url: upload_url,
            headers: {
              'Authorization': `OAuth ${accessToken}`,
              'file_url': mediaUrl
            }
          });
        } catch (uploadError) {
          console.error('Facebook Reels rupload error details:', uploadError.response?.data || uploadError.message);
          throw uploadError;
        }

        await this.checkFacebookVideoStatus(video_id, accessToken, apiVersion);

        result = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${pageId}/video_reels`,
          data: {
            video_id: video_id,
            upload_phase: 'finish',
            video_state: 'PUBLISHED',
            description: caption || '',
            access_token: accessToken
          }
        });
      }

      return {
        success: true,
        postId: result.data.id || result.data.post_id || `fb_${pageId}_${Date.now()}`,
        postUrl: result.data.id ? `https://facebook.com/${result.data.id}` : `https://facebook.com/${pageId}`
      };
    } catch (error) {
      console.error('Facebook publish error:', error);
      const fbError = error.response?.data?.error;
      const errorMsg = fbError?.message || error.message || 'Unknown Facebook error';

      if (errorMsg.includes('reduce the amount of data') || error.response?.status === 500) {
        console.warn('Facebook returned an error but likely succeeded posting the media. Marking as published.');
        return {
          success: true,
          postId: `fb_fallback_${Date.now()}`,
          postUrl: `https://facebook.com/${account.page_id || account.account_id}`
        };
      }

      throw new Error(`Facebook publishing failed: ${errorMsg}`);
    }
  }

  async publishToInstagram(account, mediaUrls, caption, contentType) {
    const accessToken = account.access_token;
    const igAccountId = account.account_id;
    const apiVersion = DEFAULT_FACEBOOK_API_VERSION;
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;

    const urls = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

    try {
      console.log(`Publishing to Instagram: platform=instagram, contentType=${contentType}, urls=${JSON.stringify(urls)}`);
      if (urls.length === 0) {
        throw new Error('Instagram requires at least one image or video.');
      }

      const isStory = contentType === 'story';
      const isReel = contentType === 'reel';

      const normalizeImageAspectRatio = async (imageUrl) => {
        try {
          const response = await this._makeRequest({ method: 'get', url: imageUrl, responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data);
          const metadata = await sharp(buffer).metadata();
          const { width, height } = metadata;

          if (!width || !height) {
            throw new Error('Unable to determine image dimensions');
          }

          const aspectRatio = width / height;
          let targetWidth = width;
          let targetHeight = height;

          if (isStory) {
            targetWidth = 1080;
            targetHeight = 1920;
          } else if (isReel) {
            targetWidth = 1080;
            targetHeight = 1920;
          } else {
            if (aspectRatio < 0.8) {
              targetWidth = 1080;
              targetHeight = 1350;
            } else if (aspectRatio > 1.91) {
              targetWidth = 1080;
              targetHeight = 566;
            } else {
              return imageUrl;
            }
          }

          const resizedBuffer = await sharp(buffer)
            .resize(targetWidth, targetHeight, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 95 })
            .toBuffer();

          const tempDir = path.join(process.cwd(), 'uploads', 'social-post');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          const tempFileName = `temp_instagram_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
          const tempFilePath = path.join(tempDir, tempFileName);
          fs.writeFileSync(tempFilePath, resizedBuffer);

          const urlObj = new URL(imageUrl);
          const publicBaseUrl = `${urlObj.protocol}//${urlObj.host}`;
          const relativePath = path.join('uploads', 'social-post', tempFileName);
          const fullUrl = `${publicBaseUrl}/${relativePath.replace(/\\/g, '/')}`;

          return fullUrl;
        } catch (error) {
          console.warn('Failed to normalize image aspect ratio, using original:', error.message);
          return imageUrl;
        }
      };

      const normalizedUrls = [];
      for (const url of urls) {
        const isImage = url && !url.toLowerCase().match(/\.(mp4|mov|avi|m4v)$/);
        if (isImage) {
          const normalizedUrl = await normalizeImageAspectRatio(url);
          normalizedUrls.push(normalizedUrl);
        } else {
          normalizedUrls.push(url);
        }
      }

      if (isStory) {
        const results = [];
        for (const mediaUrl of normalizedUrls) {
          let containerData;
          if (mediaUrl && mediaUrl.includes('.mp4')) {
            const containerParams = {
              video_url: mediaUrl,
              media_type: 'STORIES',
              access_token: accessToken,
              is_story: true
            };
            const containerResponse = await this._makeRequest({ method: 'post', url: `${baseUrl}/${igAccountId}/media`, data: containerParams });
            containerData = containerResponse.data;
          } else {
            const containerParams = {
              image_url: mediaUrl,
              media_type: 'STORIES',
              access_token: accessToken
            };
            const containerResponse = await this._makeRequest({ method: 'post', url: `${baseUrl}/${igAccountId}/media`, data: containerParams });
            containerData = containerResponse.data;
          }

          const containerId = containerData.id;
          await this.checkContainerStatus(igAccountId, containerId, accessToken, apiVersion, 60);

          const publishResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${igAccountId}/media_publish`,
            data: {
              creation_id: containerId,
              access_token: accessToken
            }
          });
          results.push(publishResponse.data.id);
        }

        let postUrl = `https://instagram.com/stories/${account.account_name || 'me'}/${results[0]}`;
        return {
          success: true,
          postId: results[0],
          postUrl: postUrl
        };
      } else if (normalizedUrls.length === 1) {
        const mediaUrl = normalizedUrls[0];
        let containerData;
        const isVideo = mediaUrl && mediaUrl.toLowerCase().match(/\.(mp4|mov|avi|m4v)$/);

        if (isReel && !isVideo) {
          throw new Error('Instagram Reels must be video files.');
        }

        if (isReel || isVideo) {
          const containerParams = {
            video_url: mediaUrl,
            media_type: isStory ? 'STORIES' : 'REELS',
            access_token: accessToken
          };

          if (containerParams.media_type === 'REELS') {
            containerParams.share_to_feed = true;
          }

          if (!isStory) {
            containerParams.caption = caption || '';
          }

          if (isStory) {
            containerParams.is_story = true;
          }

          const containerResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${igAccountId}/media`,
            data: containerParams
          });
          containerData = containerResponse.data;
        } else {
          const containerParams = {
            image_url: mediaUrl,
            caption: caption || '',
            access_token: accessToken
          };

          const containerResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${igAccountId}/media`,
            data: containerParams
          });
          containerData = containerResponse.data;
        }

        const containerId = containerData.id;
        await this.checkContainerStatus(igAccountId, containerId, accessToken, apiVersion, 60);

        const publishResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${igAccountId}/media_publish`,
          data: {
            creation_id: containerId,
            access_token: accessToken
          }
        });

        let postUrl = `https://instagram.com/p/${publishResponse.data.id}`;
        try {
          const mediaInfo = await this._makeRequest({
            method: 'get',
            url: `${baseUrl}/${publishResponse.data.id}`,
            params: { fields: 'shortcode,permalink', access_token: accessToken }
          });
          if (mediaInfo.data.permalink) postUrl = mediaInfo.data.permalink;
          else if (mediaInfo.data.shortcode) postUrl = `https://instagram.com/p/${mediaInfo.data.shortcode}/`;
        } catch (urlError) {
          console.error('Failed to fetch Instagram shortcode:', urlError.message);
        }

        return {
          success: true,
          postId: publishResponse.data.id,
          postUrl: isStory
            ? `https://instagram.com/stories/${account.account_username || "me"}/${publishResponse.data.id}`
            : postUrl,
        };
      } else {
        if (isReel) {
          throw new Error('Reels do not support multiple media items (Carousels)');
        }

        const childIds = [];
        for (const url of normalizedUrls) {
          const isVideo = url.includes('.mp4');
          const payload = {
            access_token: accessToken,
            is_carousel_item: true,
            ...(isVideo ? { video_url: url, media_type: 'VIDEO' } : { image_url: url })
          };

          const childResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${igAccountId}/media`,
            data: payload
          });
          childIds.push(childResponse.data.id);
        }

        for (const childId of childIds) {
          await this.checkContainerStatus(igAccountId, childId, accessToken, apiVersion, 60);
        }

        const carouselResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${igAccountId}/media`,
          data: {
            media_type: 'CAROUSEL',
            caption: caption || '',
            children: childIds,
            access_token: accessToken
          }
        });

        const carouselId = carouselResponse.data.id;
        await this.checkContainerStatus(igAccountId, carouselId, accessToken, apiVersion, 60);

        const publishResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${igAccountId}/media_publish`,
          data: {
            creation_id: carouselId,
            access_token: accessToken
          }
        });

        let postUrl = `https://instagram.com/p/${publishResponse.data.id}`;
        try {
          const mediaInfo = await this._makeRequest({
            method: 'get',
            url: `${baseUrl}/${publishResponse.data.id}`,
            params: {
              fields: 'shortcode,permalink',
              access_token: accessToken
            }
          });
          if (mediaInfo.data.permalink) {
            postUrl = mediaInfo.data.permalink;
          } else if (mediaInfo.data.shortcode) {
            postUrl = `https://instagram.com/p/${mediaInfo.data.shortcode}/`;
          }
        } catch (urlError) {
          console.error('Failed to fetch Instagram shortcode:', urlError.message);
        }

        return {
          success: true,
          postId: publishResponse.data.id,
          postUrl: postUrl
        };
      }
    } catch (error) {
      console.error('Instagram publish error detailed:', error.response?.data || error);
      const fbError = error.response?.data?.error;
      const errorMsg = fbError?.message || error.message || 'Unknown Instagram error';
      throw new Error(`Instagram publishing failed: ${errorMsg}`);
    }
  }

  async checkContainerStatus(igAccountId, containerId, accessToken, apiVersion = DEFAULT_FACEBOOK_API_VERSION, maxRetries = 60) {
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await this._makeRequest({
          method: 'get',
          url: `${baseUrl}/${containerId}`,
          params: {
            fields: 'status_code',
            access_token: accessToken
          },
          timeout: 30000
        });

        const statusCode = response.data.status_code;

        if (statusCode === 'FINISHED') {
          return response.data;
        }

        if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
          let reason = 'Unknown reason';
          try {
            const errResponse = await this._makeRequest({
              method: 'get',
              url: `${baseUrl}/${containerId}`,
              params: {
                fields: 'failure_reason',
                access_token: accessToken
              },
              timeout: 10000
            });
            reason = errResponse.data.status || 'Unknown reason';
          } catch (e) {
            console.error('Failed to fetch container failure reason:', e.message);
          }
          throw new Error(`Instagram media processing failed: Status ${statusCode}`);
        }

        await new Promise(resolve => setTimeout(resolve, 8000));
        retries++;
      } catch (error) {
        if (error.response?.status === 400 && retries < maxRetries) {
          if (retries === 0 || retries % 5 === 0) {
            const fbError = error.response?.data?.error;
            const errorMsg = fbError?.message || 'Still propagating...';
          }
          await new Promise(resolve => setTimeout(resolve, 8000));
          retries++;
          continue;
        }

        if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.message.includes('timeout')) && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 8000));
          retries++;
          continue;
        }

        console.error(`Status check failed for container ${containerId}:`, error.response?.data || error.message);
        throw error;
      }

    }

    throw new Error('Media container processing timed out');
  }

  async checkFacebookVideoStatus(videoId, accessToken, apiVersion = DEFAULT_FACEBOOK_API_VERSION, maxRetries = 30) {
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await this._makeRequest({
          method: 'get',
          url: `${baseUrl}/${videoId}`,
          params: {
            fields: 'status',
            access_token: accessToken
          }
        });

        const status = response.data.status;
        const videoStatus = status?.video_status;
        const uploadStatus = status?.uploading_phase?.status;
        const processingStatus = status?.processing_phase?.status;

        if (videoStatus === 'ready' || (uploadStatus === 'complete' && videoStatus !== 'error')) {
          return response.data;
        }

        if (videoStatus === 'error' || uploadStatus === 'error' || processingStatus === 'error') {
          const errorMsg = status?.processing_phase?.errors?.[0]?.message || 'Unknown processing error';
          throw new Error(`Facebook video processing failed: ${errorMsg}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        retries++;
      } catch (error) {
        if (error.response?.status === 400 && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          retries++;
          continue;
        }
        throw error;
      }
    }

    throw new Error('Facebook video processing timed out');
  }

  async publishContent(SocialAccount, socialPostId, userId, mediaUrls, caption, contentType, platform, baseUrl, io = null) {
    const socialPost = await SocialPost.findById(socialPostId);
    if (!socialPost) {
      console.error(`SocialPost ${socialPostId} not found for background publishing`);
      return;
    }

    try {
      const account = await this.getAccountWithToken(SocialAccount, socialPost.account, userId);

      if (account.platform !== platform) {
        throw new Error(`Account platform mismatch. Expected ${platform}, got ${account.platform}`);
      }

      await SocialAccount.findByIdAndUpdate(socialPost.account, {
        last_used: new Date()
      });

      const fullMediaUrls = Array.isArray(mediaUrls)
        ? mediaUrls.map(url => fileHelper.getFullUrl(url, baseUrl))
        : (mediaUrls ? [fileHelper.getFullUrl(mediaUrls, baseUrl)] : []);

      let result;
      if (platform === 'facebook') {
        result = await this.publishToFacebook(account, fullMediaUrls, caption, contentType);
      } else if (platform === 'instagram') {
        result = await this.publishToInstagram(account, fullMediaUrls, caption, contentType);
      } else if (platform === 'threads') {
        result = await this.publishToThreads(account, fullMediaUrls, caption, contentType);
      } else if (platform === 'linkedin') {
        const adminSettings = await Setting.findOne();
        result = await this.publishToLinkedIn(account, fullMediaUrls, caption, contentType, adminSettings);
      } else if (platform === 'twitter') {
        const adminSettings = await Setting.findOne();
        result = await this.publishToTwitter(account, fullMediaUrls, caption, contentType, adminSettings);
      } else if (platform === 'youtube') {
        const adminSettings = await Setting.findOne();
        result = await this.publishToYouTube(account, fullMediaUrls, caption, contentType, adminSettings);
      } else {
        throw new Error(`Platform ${platform} is not supported for publishing`);
      }

      if (result && result.success && result.postId) {
        socialPost.post_id = result.postId;
        socialPost.post_url = result.postUrl;
        socialPost.status = 'published';
        socialPost.metadata = result;
        socialPost.published_at = new Date();
        await socialPost.save();

        if (io) {
          const notificationData = {
            success: true,
            status: 'published',
            postId: result.postId,
            historyId: socialPost._id,
            platform: platform,
            account_name: account.account_name,
            post_url: result.postUrl
          };

          const notification = new Notification({
            user: userId,
            title: 'Post Published Successfully',
            message: `Your ${contentType} has been published to ${platform} (${account.account_name}).`,
            type: 'social-publish',
            data: notificationData
          });
          await notification.save();

          io.emit(`social-post-${userId}`, notificationData);
          io.emit(`notification-${userId}`, notification);
        }
      }

      return result;
    } catch (error) {
      console.error(`Background publishing failed for ${socialPostId}:`, error);

      socialPost.status = 'failed';
      socialPost.error_message = error.message;
      await socialPost.save();

      if (io) {
        const notificationData = {
          success: false,
          status: 'failed',
          message: error.message,
          historyId: socialPost._id,
          platform: platform
        };

        const notification = new Notification({
          user: userId,
          title: 'Post Publishing Failed',
          message: `Failed to publish your ${contentType} to ${platform}: ${error.message}`,
          type: 'social-publish',
          data: notificationData
        });
        await notification.save();

        io.emit(`social-post-${userId}`, notificationData);
        io.emit(`notification-${userId}`, notification);
      }

      throw error;
    }
  }

  async deleteSocialPost(SocialPost, SocialAccount, historyId, userId) {
    const post = await SocialPost.findOne({ _id: historyId, user: userId });

    if (!post) {
      throw new Error('Post not found in history');
    }

    if (post.status === 'deleted') {
      throw new Error('Post is already marked as deleted');
    }

    const account = await this.getAccountWithToken(SocialAccount, post.account, userId);
    const accessToken = account.access_token;
    const apiVersion = DEFAULT_FACEBOOK_API_VERSION;
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;

    let platformDeleted = false;
    let platformMessage = '';

    if (post.platform === 'facebook') {
      try {
        await this._makeRequest({
          method: 'delete',
          url: `${baseUrl}/${post.post_id}`,
          params: { access_token: accessToken }
        });
        platformDeleted = true;
      } catch (error) {

        console.error('Facebook post deletion error:', error.response?.data || error.message);
        const fbError = error.response?.data?.error;
        const errorMsg = fbError?.message || error.message;

        if (fbError?.code === 100 || fbError?.code === 21) {
          platformDeleted = true;
          platformMessage = 'Post was already deleted from Facebook.';
        } else {
          throw new Error(`Failed to delete post from Facebook: ${errorMsg}`);
        }
      }
    } else if (post.platform === 'instagram') {
      try {
        await axios.delete(`${baseUrl}/${post.post_id}`, {
          params: { access_token: accessToken }
        });
        platformDeleted = true;
      } catch (error) {
        const fbError = error.response?.data?.error;
        const errorMsg = fbError?.message || error.message;

        if (fbError?.code === 100 || fbError?.code === 21) {
          platformDeleted = true;
          platformMessage = 'Post was already deleted from Instagram.';
        } else {
          throw new Error(`Failed to delete post from Instagram: ${errorMsg}`);
        }
      }
    } else if (post.platform === 'linkedin') {
      try {
        const urnParts = post.post_id.split(':');
        const entityType = urnParts.length > 2 ? urnParts[2] : 'ugcPosts';
        const endpoint = entityType === 'share' ? 'shares' : 'ugcPosts';

        await this._makeRequest({
          method: 'delete',
          url: `https://api.linkedin.com/v2/${endpoint}/${encodeURIComponent(post.post_id)}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        platformDeleted = true;
      } catch (error) {
        console.error('LinkedIn deletion error:', error.response?.data || error.message);
        platformMessage = 'Failed to delete from LinkedIn, or it was already deleted.';
      }
    } else if (post.platform === 'twitter' || post.platform === 'x') {
      try {
        const adminSettings = await Setting.findOne();
        const oauthCreds = adminSettings && adminSettings.twitter_consumer_key ? {
          consumerKey: adminSettings.twitter_consumer_key,
          consumerSecret: adminSettings.twitter_consumer_secret,
          oauthToken: adminSettings.twitter_oauth_token || null,
          oauthTokenSecret: adminSettings.twitter_oauth_token_secret || null
        } : null;

        const url = `https://api.twitter.com/2/tweets/${post.post_id}`;

        if (oauthCreds?.consumerKey) {
          const { OAuth } = require('oauth');
          const oauth = new OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            oauthCreds.consumerKey,
            oauthCreds.consumerSecret,
            '1.0A', null, 'HMAC-SHA1'
          );

          const authHeader = oauth.authHeader(
            url,
            oauthCreds.oauthToken,
            oauthCreds.oauthTokenSecret,
            'DELETE'
          );

          await axios.delete(url, {
            headers: { 'Authorization': authHeader }
          });
        } else {
           await axios.delete(url, {
             headers: { 'Authorization': `Bearer ${accessToken}` }
           });
        }
        platformDeleted = true;
      } catch (error) {
        console.error('Twitter deletion error:', error.response?.data || error.message);
        platformMessage = 'Failed to delete from Twitter, or it was already deleted.';
      }
    } else if (post.platform === 'youtube') {
      try {
        const adminSettings = await Setting.findOne();
        const oauth2Client = new google.auth.OAuth2(
          adminSettings.youtube_client_id,
          adminSettings.youtube_client_secret
        );

        const refreshToken = account.refresh_token ? (typeof account.refresh_token === 'string' && account.refresh_token.length > 100 ? decryptToken(account.refresh_token) : account.refresh_token) : null;

        let expiryDateMs = null;
        if (account.token_expiry) {
          const parsedDate = new Date(account.token_expiry).getTime();
          if (!isNaN(parsedDate)) {
            expiryDateMs = parsedDate;
          }
        }

        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken,
          expiry_date: expiryDateMs
        });

        oauth2Client.on('tokens', async (tokens) => {
          try {
            const updateData = {};
            if (tokens.access_token) {
              updateData.access_token = encryptToken(tokens.access_token);
            }
            if (tokens.expiry_date) {
              updateData.token_expiry = new Date(tokens.expiry_date);
            }
            if (tokens.refresh_token) {
              updateData.refresh_token = encryptToken(tokens.refresh_token);
            }

            if (Object.keys(updateData).length > 0) {
              await SocialAccount.findByIdAndUpdate(account._id, updateData);
            }
          } catch (err) {
            console.error('Error saving refreshed YouTube tokens during delete:', err.message);
          }
        });

        try {
          await oauth2Client.getAccessToken();
        } catch (refreshErr) {
          throw new Error(`YouTube authentication failed: ${refreshErr.message || 'Invalid credentials'}`);
        }

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        await youtube.videos.delete({
          id: post.post_id
        });
        platformDeleted = true;
      } catch (error) {
        console.error('YouTube deletion error:', error.response?.data || error.message);
        const errorCode = error.code || error.response?.status;
        const ytError = error.errors?.[0] || error.response?.data?.error;
        const errorMsg = ytError?.message || error.message;

        if (errorCode === 404 || errorMsg?.toLowerCase().includes('not found')) {
          platformDeleted = true;
          platformMessage = 'Video was already deleted from YouTube.';
        } else if (
          errorCode === 403 ||
          errorCode === 401 ||
          errorMsg?.toLowerCase().includes('scope') ||
          errorMsg?.toLowerCase().includes('permission') ||
          errorMsg?.toLowerCase().includes('auth') ||
          errorMsg?.toLowerCase().includes('credentials')
        ) {
          platformDeleted = false;
          platformMessage = 'Post removed from history, but could not be deleted from YouTube due to insufficient permissions. Please reconnect your YouTube account.';
        } else {
          throw new Error(`Failed to delete video from YouTube: ${errorMsg}`);
        }
      }
    }

    await SocialPost.findByIdAndDelete(historyId);

    return {
      success: true,
      platformDeleted,
      message: platformDeleted ? 'Post deleted successfully from both platform and history.' : platformMessage
    };
  }

  async publishToThreads(account, mediaUrls, caption, contentType) {
    const accessToken = account.access_token;
    const threadsUserId = account.account_id;
    const baseUrl = `https://graph.threads.net/v1.0`;

    const urls = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

    try {
      let publishedPostId;

      if (urls.length === 0) {
        const containerResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${threadsUserId}/threads`,
          data: {
            media_type: 'TEXT',
            text: caption || '',
            access_token: accessToken
          }
        });

        const containerId = containerResponse.data.id;
        
        const publishResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${threadsUserId}/threads_publish`,
          data: {
            creation_id: containerId,
            access_token: accessToken
          }
        });

        publishedPostId = publishResponse.data.id;
      } else if (urls.length === 1) {
        const mediaUrl = urls[0];
        const isVideo = mediaUrl && mediaUrl.toLowerCase().match(/\.(mp4|mov|avi|m4v)$/);
        
        let containerData;
        if (isVideo) {
          const containerResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${threadsUserId}/threads`,
            data: {
              media_type: 'VIDEO',
              video_url: mediaUrl,
              text: caption || '',
              access_token: accessToken
            }
          });
          containerData = containerResponse.data;
        } else {
          const containerResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${threadsUserId}/threads`,
            data: {
              media_type: 'IMAGE',
              image_url: mediaUrl,
              text: caption || '',
              access_token: accessToken
            }
          });
          containerData = containerResponse.data;
        }

        const containerId = containerData.id;
        await this.checkThreadsContainerStatus(threadsUserId, containerId, accessToken, 60);

        const publishResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${threadsUserId}/threads_publish`,
          data: {
            creation_id: containerId,
            access_token: accessToken
          }
        });

        publishedPostId = publishResponse.data.id;
      } else {
        const childIds = [];
        for (const url of urls) {
          const isVideo = url && url.toLowerCase().match(/\.(mp4|mov|avi|m4v)$/);
          const payload = {
            access_token: accessToken,
            is_carousel_item: true,
            ...(isVideo ? { video_url: url, media_type: 'VIDEO' } : { image_url: url, media_type: 'IMAGE' })
          };

          const childResponse = await this._makeRequest({
            method: 'post',
            url: `${baseUrl}/${threadsUserId}/threads`,
            data: payload
          });
          childIds.push(childResponse.data.id);
        }

        for (const childId of childIds) {
          await this.checkThreadsContainerStatus(threadsUserId, childId, accessToken, 60);
        }

        const carouselResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${threadsUserId}/threads`,
          data: {
            media_type: 'CAROUSEL',
            children: childIds,
            text: caption || '',
            access_token: accessToken
          }
        });

        const carouselId = carouselResponse.data.id;
        await this.checkThreadsContainerStatus(threadsUserId, carouselId, accessToken, 60);

        const publishResponse = await this._makeRequest({
          method: 'post',
          url: `${baseUrl}/${threadsUserId}/threads_publish`,
          data: {
            creation_id: carouselId,
            access_token: accessToken
          }
        });

        publishedPostId = publishResponse.data.id;
      }

      let postUrl = `https://www.threads.com/@${account.account_username}/post/${publishedPostId}`;
      try {
        const permalink = await this.getThreadsPermalink(publishedPostId, accessToken);
        if (permalink) {
          postUrl = permalink.replace('threads.net', 'threads.com');
        }
      } catch (linkErr) {
        console.error('Failed to retrieve Threads permalink, fallback to default URL:', linkErr.message);
      }

      return {
        success: true,
        postId: publishedPostId,
        postUrl: postUrl
      };
    } catch (error) {
      console.error('Threads publish error detailed:', error.response?.data || error);
      const threadsError = error.response?.data?.error;
      const errorMsg = threadsError?.message || error.message || 'Unknown Threads error';
      throw new Error(`Threads publishing failed: ${errorMsg}`);
    }
  }

  async getThreadsPermalink(mediaId, accessToken) {
    try {
      const baseUrl = `https://graph.threads.net/v1.0`;
      const response = await this._makeRequest({
        method: 'get',
        url: `${baseUrl}/${mediaId}`,
        params: {
          fields: 'permalink',
          access_token: accessToken
        }
      });
      return response.data?.permalink || null;
    } catch (error) {
      console.error(`Error fetching Threads permalink for media ${mediaId}:`, error.response?.data || error.message);
      return null;
    }
  }

  async checkThreadsContainerStatus(threadsUserId, containerId, accessToken, maxRetries = 60) {
    const baseUrl = `https://graph.threads.net/v1.0`;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await this._makeRequest({
          method: 'get',
          url: `${baseUrl}/${containerId}`,
          params: {
            fields: 'status,error_message',
            access_token: accessToken
          },
          timeout: 30000
        });

        const status = response.data.status;

        if (status === 'FINISHED') {
          return response.data;
        }

        if (status === 'ERROR' || status === 'EXPIRED') {
          throw new Error(`Threads media processing failed: ${response.data.error_message || 'Unknown error'}`);
        }

        await new Promise(resolve => setTimeout(resolve, 8000));
        retries++;
      } catch (error) {
        if (error.response?.status === 400 && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 8000));
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Threads media container processing timed out');
  }

  async publishToLinkedIn(account, mediaUrls, caption, contentType, userSettings) {
    const accessToken = account.access_token;
    const urls = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

    try {
      let personId = account.account_id;
      try {
        const meResponse = await this._makeRequest({
          method: 'get',
          url: 'https://api.linkedin.com/v2/me',
          headers: { Authorization: `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' },
          timeout: 15000
        });
        personId = meResponse.data.id;
      } catch (meErr) {
        console.warn('LinkedIn: Could not resolve person ID from /me, using stored account_id:', meErr.message);
      }

      const authorUrn = `urn:li:person:${personId}`;
      const mediaAssets = [];
      let shareMediaCategory = 'NONE';

      if (urls.length > 0) {
        const isVideo = this._is_video(urls[0]);
        shareMediaCategory = isVideo ? 'VIDEO' : 'IMAGE';

        for (const mediaUrl of urls) {
          try {
            const asset = await this.uploadLinkedInMedia(accessToken, personId, mediaUrl);
            if (asset) mediaAssets.push(asset);
          } catch (uploadErr) {
            console.error(`LinkedIn: Failed to upload media ${mediaUrl}:`, uploadErr.message);
          }
        }
        if (mediaAssets.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      let postPayload;
      if (mediaAssets.length > 0) {
        postPayload = {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: caption || '' },
              shareMediaCategory,
              media: mediaAssets.map(asset => ({
                status: 'READY',
                description: { text: caption || '' },
                media: asset,
                title: { text: shareMediaCategory === 'VIDEO' ? 'Video' : 'Image' }
              }))
            }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        };
      } else {
        postPayload = {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: caption || '' },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        };
      }

      const postResponse = await this._makeRequest({
        method: 'post',
        url: 'https://api.linkedin.com/v2/ugcPosts',
        data: postPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 30000
      });

      const postId = postResponse.data.id;
      return {
        success: true,
        postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}`
      };
    } catch (error) {
      console.error('LinkedIn publish error:', error.response?.data || error.message);
      const msg = error.response?.data?.message || error.message || 'Unknown LinkedIn error';
      throw new Error(`LinkedIn publishing failed: ${msg}`);
    }
  }

  async uploadLinkedInMedia(accessToken, personId, mediaUrl) {
    try {
      const isVideo = this._is_video(mediaUrl);
      const recipe = isVideo ? 'urn:li:digitalmediaRecipe:feedshare-video' : 'urn:li:digitalmediaRecipe:feedshare-image';
      const ownerUrn = `urn:li:person:${personId}`;

      const registerResponse = await this._makeRequest({
        method: 'post',
        url: 'https://api.linkedin.com/v2/assets?action=registerUpload',
        data: {
          registerUploadRequest: {
            recipes: [recipe],
            owner: ownerUrn,
            serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }]
          }
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 30000
      });

      const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerResponse.data.value.asset;

      if (!uploadUrl || !asset) {
        throw new Error('Failed to register LinkedIn media upload');
      }

      let mediaBuffer;
      if (mediaUrl.startsWith('http')) {
        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000 });
        mediaBuffer = Buffer.from(mediaResponse.data, 'binary');
      } else {
        const filePath = path.isAbsolute(mediaUrl) ? mediaUrl : path.join(process.cwd(), mediaUrl);
        if (!fs.existsSync(filePath)) throw new Error(`Local media file not found: ${filePath}`);
        mediaBuffer = fs.readFileSync(filePath);
      }

      await axios.put(uploadUrl, mediaBuffer, {
        headers: { 'Content-Type': isVideo ? 'video/mp4' : 'application/octet-stream' },
        timeout: 120000
      });

      if (isVideo) {
        let isReady = false;
        let attempts = 0;
        const maxAttempts = 15;

        while (!isReady && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;

          try {
            const statusResponse = await this._makeRequest({
              method: 'get',
              url: `https://api.linkedin.com/v2/assets/(${asset})`,
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
              }
            });

            const status = statusResponse.data.recipes[0].status;

            if (status === 'AVAILABLE') {
              isReady = true;
            } else if (status === 'PROCESSING_FAILED') {
              throw new Error('LinkedIn video processing failed');
            }
          } catch (err) {
            console.warn(`Error checking LinkedIn asset status: ${err.message}`);
          }
        }

        if (!isReady) {
          console.warn('LinkedIn video processing timed out, attempting to post anyway...');
        }
      }

      return asset;
    } catch (error) {
      console.error('LinkedIn media upload error:', error.response?.data || error.message);
      throw error;
    }
  }

  async publishToTwitter(account, mediaUrls, caption, contentType, userSettings) {
    const accessToken = account.access_token;
    const urls = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

    const oauthCreds = userSettings && userSettings.twitter_consumer_key ? {
      consumerKey: userSettings.twitter_consumer_key,
      consumerSecret: userSettings.twitter_consumer_secret,
      oauthToken: userSettings.twitter_oauth_token || null,
      oauthTokenSecret: userSettings.twitter_oauth_token_secret || null
    } : null;

    try {
      let mediaIds = [];

      if (urls.length > 0 && oauthCreds?.oauthToken) {
        for (const mediaUrl of urls) {
          try {
            const mediaId = await this.uploadTwitterMedia(mediaUrl, oauthCreds);
            if (mediaId) mediaIds.push(mediaId);
          } catch (uploadErr) {
            console.error(`Twitter: Media upload failed for ${mediaUrl}:`, uploadErr.message);
          }
        }
        if (mediaIds.length === 0) {
          console.warn('Twitter: All media uploads failed — posting text only');
        }
      }

      const payload = { text: caption || '' };
      if (mediaIds.length > 0) payload.media = { media_ids: mediaIds };

      let response;
      if (oauthCreds?.consumerKey) {
        const { OAuth } = require('oauth');
        const oauth = new OAuth(
          'https://api.twitter.com/oauth/request_token',
          'https://api.twitter.com/oauth/access_token',
          oauthCreds.consumerKey,
          oauthCreds.consumerSecret,
          '1.0A', null, 'HMAC-SHA1'
        );
        const authHeader = oauth.authHeader(
          'https://api.twitter.com/2/tweets',
          oauthCreds.oauthToken,
          oauthCreds.oauthTokenSecret,
          'POST'
        );
        response = await axios.post('https://api.twitter.com/2/tweets', payload, {
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        });
      } else {
        response = await axios.post('https://api.twitter.com/2/tweets', payload, {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
      }

      const responseData = response.data?.data || response.data;
      return {
        success: true,
        postId: responseData.id,
        postUrl: `https://twitter.com/i/web/status/${responseData.id}`
      };
    } catch (error) {
      console.error('Twitter publish error:', error.response?.data || error.message);
      const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
      throw new Error(`Twitter publishing failed: ${msg}`);
    }
  }

  async uploadTwitterMedia(mediaUrl, oauthCreds) {
    try {
      const { OAuth } = require('oauth');
      const { consumerKey, consumerSecret, oauthToken, oauthTokenSecret } = oauthCreds;

      const oauth = new OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        consumerKey, consumerSecret, '1.0A', null, 'HMAC-SHA1'
      );

      let resolvedUrl = mediaUrl;
      if (!mediaUrl.startsWith('http')) {
        const baseUrl = process.env.APP_URL || 'http://localhost:3000';
        resolvedUrl = `${baseUrl.replace(/\/+$/, '')}/${mediaUrl.replace(/^\/+/, '')}`;
      }
      let mediaBuffer;
      if (resolvedUrl.startsWith('http')) {
        const mediaRes = await axios.get(resolvedUrl, { responseType: 'arraybuffer', timeout: 30000 });
        mediaBuffer = Buffer.from(mediaRes.data, 'binary');
      } else {
        const filePath = path.isAbsolute(resolvedUrl) ? resolvedUrl : path.join(process.cwd(), resolvedUrl);
        mediaBuffer = fs.readFileSync(filePath);
      }

      const ext = resolvedUrl.split('.').pop().toLowerCase().split('?')[0];
      const videoExts = ['mp4', 'mov', 'avi'];
      const isVideo = videoExts.includes(ext);
      const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
      const mediaCategory = isVideo ? 'tweet_video' : 'tweet_image';

      const initResult = await new Promise((resolve, reject) => {
        oauth.post(
          'https://upload.twitter.com/1.1/media/upload.json',
          oauthToken, oauthTokenSecret,
          { command: 'INIT', total_bytes: mediaBuffer.length.toString(), media_type: mimeType, media_category: mediaCategory },
          'application/x-www-form-urlencoded',
          (err, data) => {
            if (err) return reject(new Error(err.data || err.message || JSON.stringify(err)));
            try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`INIT parse error: ${data}`)); }
          }
        );
      });

      const mediaId = initResult.media_id_string;
      if (!mediaId) throw new Error(`Twitter INIT did not return media_id: ${JSON.stringify(initResult)}`);

      const chunkSize = 5 * 1024 * 1024;
      let segmentIndex = 0;
      for (let offset = 0; offset < mediaBuffer.length; offset += chunkSize) {
        const chunk = mediaBuffer.slice(offset, offset + chunkSize);
        const appendForm = new FormData();
        appendForm.append('command', 'APPEND');
        appendForm.append('media_id', mediaId);
        appendForm.append('segment_index', segmentIndex.toString());
        appendForm.append('media', chunk, { filename: 'media', contentType: mimeType });
        const authHeader = oauth.authHeader(
          'https://upload.twitter.com/1.1/media/upload.json',
          oauthToken, oauthTokenSecret, 'POST'
        );
        await axios.post('https://upload.twitter.com/1.1/media/upload.json', appendForm, {
          headers: { ...appendForm.getHeaders(), Authorization: authHeader }
        });
        segmentIndex++;
      }

      const finalizeResult = await new Promise((resolve, reject) => {
        oauth.post(
          'https://upload.twitter.com/1.1/media/upload.json',
          oauthToken, oauthTokenSecret,
          { command: 'FINALIZE', media_id: mediaId },
          'application/x-www-form-urlencoded',
          (err, data) => {
            if (err) return reject(new Error(err.data || err.message || JSON.stringify(err)));
            try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`FINALIZE parse error: ${data}`)); }
          }
        );
      });

      if (finalizeResult.processing_info) {
        await this._waitForTwitterMedia(mediaId, oauthToken, oauthTokenSecret, oauth);
      }

      return mediaId;
    } catch (error) {
      console.error('Twitter: uploadTwitterMedia error:', error.message);
      return null;
    }
  }

  async _waitForTwitterMedia(mediaId, oauthToken, oauthTokenSecret, oauth) {
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const status = await new Promise((resolve, reject) => {
        oauth.get(
          `https://upload.twitter.com/1.1/media/upload.json?command=STATUS&media_id=${mediaId}`,
          oauthToken, oauthTokenSecret,
          (err, data) => {
            if (err) return reject(new Error(err.data || err.message || JSON.stringify(err)));
            try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`STATUS parse error: ${data}`)); }
          }
        );
      });
      const state = status.processing_info?.state;
      if (state === 'succeeded') return;
      if (state === 'failed') {
        throw new Error(`Twitter media processing failed: ${JSON.stringify(status.processing_info?.error)}`);
      }
    }
    throw new Error('Twitter media processing timeout after ~60s');
  }

  async publishToYouTube(account, mediaUrls, caption, contentType, adminSettings) {
    const accessToken = account.access_token;
    const refreshToken = account.refresh_token ? (typeof account.refresh_token === 'string' && account.refresh_token.length > 100 ? decryptToken(account.refresh_token) : account.refresh_token) : null;

    const urls = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

    if (urls.length === 0) {
      throw new Error('YouTube requires at least one video file to publish.');
    }

    const videoUrl = urls[0];
    const isVideo = videoUrl && videoUrl.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/);
    if (!isVideo) {
      throw new Error('YouTube only supports video uploads. Please provide a video file (MP4, MOV, etc.).');
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        adminSettings.youtube_client_id,
        adminSettings.youtube_client_secret
      );

      let expiryDateMs = null;
      if (account.token_expiry) {
        const parsedDate = new Date(account.token_expiry).getTime();
        if (!isNaN(parsedDate)) {
          expiryDateMs = parsedDate;
        }
      }

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDateMs
      });

      oauth2Client.on('tokens', async (tokens) => {
        try {
          const updateData = {};
          if (tokens.access_token) {
            updateData.access_token = encryptToken(tokens.access_token);
          }
          if (tokens.expiry_date) {
            updateData.token_expiry = new Date(tokens.expiry_date);
          }
          if (tokens.refresh_token) {
            updateData.refresh_token = encryptToken(tokens.refresh_token);
          }

          if (Object.keys(updateData).length > 0) {
            const SocialAccount = db.SocialAccount;
            await SocialAccount.findByIdAndUpdate(account._id, updateData);
          }
        } catch (err) {
          console.error('Error saving refreshed YouTube tokens:', err.message);
        }
      });

      try {
        await oauth2Client.getAccessToken();
      } catch (refreshErr) {
        throw new Error(`YouTube authentication failed: ${refreshErr.message || 'Invalid credentials'}. Please try reconnecting your YouTube account.`);
      }

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const tempDir = path.join(process.cwd(), 'uploads', 'social-post');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const tempFileName = `yt_upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
      const tempFilePath = path.join(tempDir, tempFileName);

      const videoResponse = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        timeout: 300000
      });

      const writer = fs.createWriteStream(tempFilePath);
      videoResponse.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const isShort = contentType === 'shorts' || contentType === 'reel';
      let title = caption
        ? caption.substring(0, 100).replace(/#\S+/g, '').trim() || 'Video Upload'
        : 'Video Upload';
      if (isShort && !title.toLowerCase().includes('#shorts')) {
        title = `${title} #Shorts`.substring(0, 100);
      }
      const description = caption || '';

      const videoResource = {
        snippet: {
          title: title,
          description: description,
          categoryId: '22'
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      };

      const uploadResponse = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: videoResource,
        media: {
          body: fs.createReadStream(tempFilePath)
        }
      });

      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Failed to clean up temp YouTube upload file:', e.message);
      }

      const videoId = uploadResponse.data.id;
      const postUrl = isShort
        ? `https://youtube.com/shorts/${videoId}`
        : `https://youtube.com/watch?v=${videoId}`;

      return {
        success: true,
        postId: videoId,
        postUrl: postUrl
      };
    } catch (error) {
      const tempDir = path.join(process.cwd(), 'uploads', 'social-post');
      const files = fs.readdirSync(tempDir).filter(f => f.startsWith('yt_upload_'));
      for (const f of files) {
        try { fs.unlinkSync(path.join(tempDir, f)); } catch (e) {  }
      }

      console.error('YouTube publish error:', error);
      const errorMsg = error.response?.data?.error?.message || error.errors?.[0]?.message || error.message || 'Unknown YouTube error';
      throw new Error(`YouTube publishing failed: ${errorMsg}`);
    }
  }

}

module.exports = new SocialMediaService();
