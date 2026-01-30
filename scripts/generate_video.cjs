#!/usr/bin/env node
/**
 * Generate Video - Text/Image to Video using MiniMax API
 * Usage: node generate_video.js --prompt "A cat playing piano" --output video.mp4 [--model MiniMax-Hailuo-2.3]
 */

const fs = require('fs');
const path = require('path');
const minimax = require('./minimax_client.cjs');

// Parse args
const args = process.argv.slice(2);
let prompt = null;
let image = null;
let output = 'video.mp4';
let model = 'MiniMax-Hailuo-2.3';
let resolution = '768p';
let duration = 6;

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--prompt':
        case '-p':
            prompt = args[++i];
            break;
        case '--image':
        case '-i':
            image = args[++i];
            break;
        case '--output':
        case '-o':
            output = args[++i];
            break;
        case '--model':
        case '-m':
            model = args[++i];
            break;
        case '--resolution':
        case '-r':
            resolution = args[++i];
            break;
        case '--duration':
        case '-d':
            duration = parseInt(args[++i]);
            break;
        case '--help':
        case '-h':
            console.log(`
Usage: node generate_video.js [options]

Options:
  --prompt, -p "text"    Text prompt for video (for T2V)
  --image, -i url        Image URL (for I2V)
  --output, -o file      Output file path (default: video.mp4)
  --model, -m name       Model name (default: MiniMax-Hailuo-2.3)
  --resolution, -r res   Resolution: 512p, 768p, 1080p (default: 768p)
  --duration, -d seconds Duration: 6 or 10 seconds (default: 6)

Examples:
  node generate_video.js --prompt "A cat playing piano" --output cat.mp4
  node generate_video.js -i https://example.com/image.png -o animated.mp4
            `);
            process.exit(0);
    }
}

if (!prompt && !image) {
    console.error('Error: --prompt or --image is required');
    console.log('Use --help for usage information');
    process.exit(1);
}

async function main() {
    try {
        console.log(`🎬 Generating video...`);
        console.log(`   ${image ? 'Image to Video' : 'Text to Video'}`);
        console.log(`   Model: ${model}`);
        console.log(`   Output: ${output}`);

        // Start video generation task
        const taskId = await minimax.generateVideo(prompt || image, { model, image, resolution, duration });
        console.log(`   Task ID: ${taskId}`);

        // Poll for completion
        console.log(`⏳ Polling for completion...`);
        const result = await minimax.pollTask(taskId);

        if (result.data && result.data.file_id) {
            const fileInfo = await minimax.getFile(result.data.file_id);
            
            if (fileInfo.file && fileInfo.file.url) {
                console.log(`📥 Downloading from ${fileInfo.file.url.substring(0, 50)}...`);
                const axios = require('axios');
                const res = await axios.get(fileInfo.file.url, { responseType: 'stream' });
                
                const writer = fs.createWriteStream(output);
                res.data.pipe(writer);
                
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                
                console.log(`✅ Video saved to ${output}`);
            }
        } else {
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
}

main();
