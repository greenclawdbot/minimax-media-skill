#!/usr/bin/env node
/**
 * Generate Speech - Text to Speech using MiniMax API
 * Usage: node generate_speech.js --text "Hello" --output hello.mp3 [--model speech-2.8-hd] [--emotion happy]
 */

const fs = require('fs');
const path = require('path');
const minimax = require('./minimax_client.cjs');
const { execSync } = require('child_process');

// Parse args
const args = process.argv.slice(2);
let text = null;
let output = 'speech.mp3';
let model = 'speech-2.8-hd';
let emotion = null;

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--text':
        case '-t':
            text = args[++i];
            break;
        case '--output':
        case '-o':
            output = args[++i];
            break;
        case '--model':
        case '-m':
            model = args[++i];
            break;
        case '--emotion':
        case '-e':
            emotion = args[++i];
            break;
        case '--help':
        case '-h':
            console.log(`
Usage: node generate_speech.js [options]

Options:
  --text, -t "text"     Text to synthesize (required)
  --output, -o file     Output file path (default: speech.mp3)
  --model, -m name      Model name (default: speech-2.8-hd)
  --emotion, -e name    Emotion (optional)

Examples:
  node generate_speech.js --text "Hello, world!" --output hello.mp3
  node generate_speech.js -t "I'm so excited!" -e happy -o excited.mp3
            `);
            process.exit(0);
    }
}

if (!text) {
    console.error('Error: --text is required');
    console.log('Use --help for usage information');
    process.exit(1);
}

async function main() {
    try {
        console.log(`🎤 Generating speech...`);
        console.log(`   Text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        console.log(`   Model: ${model}`);
        console.log(`   Output: ${output}`);

        const response = await minimax.generateSpeech(text, { model, emotion });

        // Check if we got audio data or a URL
        if (response.data && response.data.audio) {
            const audioData = response.data.audio;
            
            if (audioData.startsWith('http')) {
                // URL response - download it
                console.log(`📥 Downloading from ${audioData.substring(0, 50)}...`);
                const axios = require('axios');
                const res = await axios.get(audioData, { responseType: 'arraybuffer' });
                fs.writeFileSync(output, res.data);
            } else {
                // Hex encoded - decode and save
                const buffer = Buffer.from(audioData, 'hex');
                fs.writeFileSync(output, buffer);
            }
            
            console.log(`✅ Speech saved to ${output}`);
        } else {
            console.log('Response:', JSON.stringify(response, null, 2));
        }
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
}

main();
