#!/usr/bin/env node
/**
 * Generate Music - Text + Lyrics to Music using MiniMax API
 * Usage: node generate_music.js --lyrics "Hello world\nIt's a beautiful day" --prompt "Upbeat pop" --output song.mp3
 */

const fs = require('fs');
const path = require('path');
const minimax = require('./minimax_client');

// Parse args
const args = process.argv.slice(2);
let lyrics = null;
let prompt = null;
let output = 'song.mp3';
let model = 'music-2.5';
let outputFormat = 'url';

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--lyrics':
        case '-l':
            lyrics = args[++i];
            break;
        case '--prompt':
        case '-p':
            prompt = args[++i];
            break;
        case '--output':
        case '-o':
            output = args[++i];
            break;
        case '--model':
        case '-m':
            model = args[++i];
            break;
        case '--format':
        case '-f':
            outputFormat = args[++i];
            break;
        case '--help':
        case '-h':
            console.log(`
Usage: node generate_music.js [options]

Options:
  --lyrics, -l "text"    Song lyrics (use \\n for newlines)
  --prompt, -p "text"    Style/mood description
  --output, -o file      Output file path (default: song.mp3)
  --model, -m name       Model name (default: music-2.5)
  --format, -f format    Output format: url or hex (default: url)

Examples:
  node generate_music.js -l "Hello world\\nIt's a beautiful day" -p "Upbeat pop" -o song.mp3
            `);
            process.exit(0);
    }
}

if (!lyrics) {
    console.error('Error: --lyrics is required');
    console.log('Use --help for usage information');
    process.exit(1);
}

async function main() {
    try {
        console.log(`🎵 Generating music...`);
        console.log(`   Lyrics: ${lyrics.substring(0, 50).replace(/\n/g, '\\n')}...`);
        console.log(`   Prompt: ${prompt || '(none)'}`);
        console.log(`   Model: ${model}`);
        console.log(`   Output: ${output}`);

        const response = await minimax.generateMusic(lyrics, prompt, { model, outputFormat });

        if (response.data && response.data.audio) {
            if (outputFormat === 'url' && response.data.audio.startsWith('http')) {
                console.log(`📥 Downloading from ${response.data.audio.substring(0, 50)}...`);
                const axios = require('axios');
                const res = await axios.get(response.data.audio, { responseType: 'arraybuffer' });
                fs.writeFileSync(output, res.data);
                console.log(`✅ Music saved to ${output}`);
            } else {
                const buffer = Buffer.from(response.data.audio, 'hex');
                fs.writeFileSync(output, buffer);
                console.log(`✅ Music saved to ${output} (hex decoded)`);
            }
        } else {
            console.log('Response:', JSON.stringify(response, null, 2));
        }
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
}

main();
