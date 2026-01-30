---
name: minimax-media
description: Generate speech, video, and music using MiniMax API models. Use when user wants to create audio clips, voiceovers, videos, or music from text prompts. Supports Discord attachment upload for generated media.
---

# MiniMax Media Skill

Generate speech, video, and music using MiniMax's media models.

## Available Models

### Speech Models
- `speech-2.8-hd` - Highest quality voice synthesis
- `speech-2.8-turbo` - Fast voice synthesis
- `speech-2.6-hd` / `speech-2.6-turbo` - Alternative quality/speed tradeoffs
- `speech-02-hd` / `speech-02-turbo` - Legacy models

### Video Models
- `MiniMax Hailuo 2.3` - Text-to-Video & Image-to-Video, 1080p@6s
- `MiniMax Hailuo 2.3Fast` - Image-to-Video only, optimized
- `MiniMax Hailuo 02` - Legacy video model

### Music Models
- `Music-2.5` - Latest music generation with vocals
- `Music-2.0` - Legacy music model

## Usage

### Speech Generation
```bash
# Generate speech with specific voice
./scripts/generate_speech.sh --model speech-2.8-hd --text "Hello, this is a test" --output speech.mp3

# With emotion
./scripts/generate_speech.sh --model speech-2.8-hd --text "I'm so excited!" --emotion happy --output excited.mp3
```

### Video Generation
```bash
# Text to video
./scripts/generate_video.sh --model "MiniMax Hailuo 2.3" --prompt "A cat playing piano in a cozy room" --output video.mp4

# Image to video
./scripts/generate_video.sh --model "MiniMax Hailuo 2.3" --image input.png --output animated.mp4
```

### Music Generation
```bash
# Generate music
./scripts/generate_music.sh --model Music-2.5 --prompt "Upbeat pop song with piano and drums" --output song.mp3
```

## Scripts

- `scripts/generate_speech.sh` - Voice synthesis
- `scripts/generate_video.sh` - Video generation
- `scripts/generate_music.sh` - Music generation
- `scripts/upload_media.sh` - Upload generated file to Discord

## Discord Integration

Use the `message` tool with `buffer` parameter for attachments:

```bash
# Pseudocode - actual implementation in scripts
base64_encode file.mp3 > encoded.txt
message --action send --channel discord --message "Here's your audio:" --buffer $(cat encoded.txt)
```

## Configuration

Set these environment variables:
- `MINIMAX_API_KEY` - Your MiniMax API key
- `MINIMAX_API_ENDPOINT` - API base URL (default: MiniMax API)

## TODO

- [ ] Implement API client for MiniMax media endpoints
- [ ] Create speech generation script with emotion support
- [ ] Create video generation script with resolution options
- [ ] Create music generation script with style parameters
- [ ] Add Discord attachment upload helper
- [ ] Add error handling and retry logic
- [ ] Write reference docs for each model type
