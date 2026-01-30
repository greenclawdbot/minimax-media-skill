/**
 * MiniMax API Client
 * Handles speech, video, and music generation
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_KEY = process.env.MINIMAX_API_KEY;
const API_HOST = process.env.MINIMAX_API_HOST || 'api.minimax.chat';
const API_VERSION = process.env.MINIMAX_API_VERSION || 'v1';

const BASE_URL = `https://${API_HOST}/${API_VERSION}`;

/**
 * Make HTTP request to MiniMax API
 */
async function request(endpoint, options = {}) {
    if (!API_KEY) {
        throw new Error('MINIMAX_API_KEY not set');
    }

    const url = new URL(endpoint, BASE_URL);
    const body = options.body ? JSON.stringify(options.body) : null;

    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: options.method || 'POST',
            headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

/**
 * Speech Generation (T2A)
 * @param {string} text - Text to synthesize
 * @param {object} options - Model, voice, emotion, etc.
 */
async function generateSpeech(text, options = {}) {
    const {
        model = 'speech-2.8-hd',
        voice,
        emotion,
        language = 'en',
        format = 'mp3'
    } = options;

    const body = {
        model,
        input: { text },
        voice_setting: {
            voice_id: voice,
            emotion
        },
        audio_setting: {
            format
        }
    };

    const endpoint = `/audio/t2a_${model}`;
    return request(endpoint, { body });
}

/**
 * Speech Generation - Async (for long text)
 * @param {string} text - Text to synthesize
 * @param {object} options - Model, voice, etc.
 */
async function generateSpeechAsync(text, options = {}) {
    const { model = 'speech-2.8-hd', voice } = options;

    const body = {
        model,
        input: text,
        voice_setting: { voice_id: voice }
    };

    const createResp = await request('/audio/t2a_async', { body });
    return createResp.task_id;
}

/**
 * Poll async task status
 * @param {string} taskId - Task ID from async request
 * @param {number} maxAttempts - Maximum polling attempts
 */
async function pollTask(taskId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
        const resp = await request(`/audio/t2a_async/${taskId}`, { method: 'GET' });
        
        if (resp.base_resp.status_code === 0) {
            return resp; // Success
        }
        
        if (resp.base_resp.status_code !== 1001) {
            throw new Error(`Task failed: ${resp.base_resp.msg}`);
        }
        
        // Still processing, wait
        await new Promise(r => setTimeout(r, 2000));
    }
    
    throw new Error('Task polling timed out');
}

/**
 * Get file download URL
 * @param {string} fileId - File ID from completed task
 */
async function getFile(fileId) {
    return request(`/file/${fileId}`, { method: 'GET' });
}

/**
 * Video Generation
 * @param {string} prompt - Text prompt or image URL
 * @param {object} options - Model, resolution, duration
 */
async function generateVideo(prompt, options = {}) {
    const {
        model = 'MiniMax-Hailuo-2.3',
        image, // Image URL for I2V
        resolution = '768p',
        duration = 6
    } = options;

    const body = {
        model,
        input: image ? { type: 'image', image_url: image } : { type: 'text', prompt }
    };

    const createResp = await request('/video/generate', { body });
    return createResp.task_id;
}

/**
 * Music Generation
 * @param {string} lyrics - Song lyrics
 * @param {string} prompt - Style/mood description
 * @param {object} options - Model, output format
 */
async function generateMusic(lyrics, prompt, options = {}) {
    const { model = 'music-2.5', outputFormat = 'url' } = options;

    const body = {
        model,
        lyrics,
        prompt,
        output_format: outputFormat
    };

    return request('/music/generate', { body });
}

module.exports = {
    generateSpeech,
    generateSpeechAsync,
    pollTask,
    getFile,
    generateVideo,
    generateMusic,
    request
};
