# analemma

Automated Ring camera timelapse generator that creates daily timelapses from Ring doorbell footage. The system runs autonomously via GitHub Actions, processes video with FFmpeg, and stores results in Cloudflare R2 object storage.

![alt text](sign-in.png)

## Overview

This project combines automation, video processing, and cloud infrastructure to create an end-to-end timelapse generation system. Users can view, search, and manage generated videos through a modern web interface with Google OAuth authentication.

## Tech Stack

**Frontend**

- Next.js 16 (App Router) with React 19
- TypeScript for type safety
- Tailwind CSS for styling
- NextAuth.js for OAuth authentication
- Radix UI for accessible components

**Backend & Infrastructure**

- Next.js API Routes for REST endpoints
- AWS SDK for S3-compatible storage (Cloudflare R2)
- GitHub Actions for automated workflows
- FFmpeg for video transcoding and processing

**Video Processing Pipeline**

- Ring Client API for camera footage retrieval
- FFmpeg for 1080p transcoding and speedup effects
- Multipart streaming uploads to object storage
- Automated scheduling with timezone-aware triggers

**External Services**

- Cloudflare R2 for scalable video storage with presigned URLs
- Google OAuth for secure authentication
- Ring API for doorbell camera integration
- GitHub API for workflow dispatch automation

## Key Features

- Fully automated daily timelapse generation on schedule
- Web-based video gallery with search and filtering
- OAuth-protected access with email allowlisting
- Manual workflow triggering via secure API endpoint
- Efficient video streaming with presigned URLs
- Favorite/bookmarking system for videos
- Timezone-aware scheduling (handles DST automatically)
