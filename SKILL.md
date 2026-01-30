---
name: minimax-media
description: Generate speech, video, and music using MiniMax API models. Use when user wants to create audio clips, voiceovers, videos, or music from text prompts. Supports Discord attachment upload for generated media.
---

# MiniMax Media Skill

Generate speech, video, and music using MiniMax's media models.

## Prerequisites

Set these environment variables:
- `MINIMAX_API_KEY` - Your MiniMax API key from [platform.minimax.io](https://platform.minimax.io/user-center/basic-information/interface-key)
- `MINIMAX_API_HOST` - (optional) API endpoint host, defaults to `api.minimax.chat`

## Available Models

### Speech Models (T2A)
| Model | Description |
|-------|-------------|
| `speech-2.8-hd` | Latest HD model, highest quality |
| `speech-2.8-turbo` | Fast generation, good quality |
| `speech-2.6-hd` | HD model with excellent cloning |
| `speech-2.6-turbo` | Turbo model, 40 languages |
| `speech-02-hd` | Superior rhythm and stability |
| `speech-02-turbo` | Enhanced multilingual |

### Video Models
| Model | Description |
|-------|-------------|
| `MiniMax-Hailuo-2.3` | T2V & I2V, SOTA physics, 1080p@6s |
| `MiniMax-Hailuo-2.3-Fast` | I2V only, optimized for value |
| `MiniMax-Hailuo-02` | Legacy, 1080p@10s support |

### Music Models
| Model | Description |
|-------|-------------|
| `music-2.5` | Latest with vocals, professional quality |

## Usage

### Speech Generation

```bash
# Basic speech
node scripts/generate_speech.js --text "Hello, world!" --output hello.mp3

# With emotion
node scripts/generate_speech.js -t "I'm so excited!" -e happy -o excited.mp3

# Different model
node scripts/generate_speech.js -t "Quick message" -m speech-2.8-turbo -o quick.mp3
```

### Video Generation

```bash
# Text to Video
node scripts/generate_video.js --prompt "A cat playing piano in a cozy room" --output cat.mp4

# Image to Video
node scripts/generate_video.js --image https://example.com/photo.png --output animated.mp4

# Higher resolution
node scripts/generate_video.js -p "Ocean waves" -r 1080p -o ocean.mp4
```

### Music Generation

```bash
# Basic music with lyrics
node scripts/generate_music.js --lyrics "Hello world\nIt's a beautiful day" --prompt "Upbeat pop" --output song.mp3

# Instrumental (empty lyrics)
node scripts/generate_music.js -l "" --prompt "Relaxing piano ambient" --output instrumental.mp3
```

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/minimax_client.js` | Core API client module |
| `scripts/generate_speech.js` | Text-to-speech generation |
| `scripts/generate_video.js` | Text/Image-to-video generation |
| `scripts/generate_music.js` | Lyrics + prompt-to-music generation |

## Discord Integration

To upload generated media to Discord, use Clawdbot's message tool with the `buffer` parameter:

```javascript
// In a Clawdbot skill or script
const fs = require('fs');
const base64 = fs.readFileSync('output.mp3', 'base64');

message({
    action: 'send',
    channel: 'discord',
    message: 'Here is your audio:',
    buffer: base64,
    mimeType: 'audio/mpeg'
});
```

## Error Handling

- **Missing API Key**: Throws error, set `MINIMAX_API_KEY`
- **Polling Timeout**: Video/music generation times out after ~2 minutes
- **Invalid Model**: API returns error, check model name

## Troubleshooting

1. **"MINIMAX_API_KEY not set"** → Set environment variable or add to `.env`
2. **Timeout on video** → Longer videos (10s) take more time
3. **Audio not playing** → Check output format is compatible (MP3 works best)
4. **URL expired** → MiniMax URLs expire after 24 hours (music) or 9 hours (speech async)
