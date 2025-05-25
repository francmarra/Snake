# Snake 3D Game

A 3D Snake game built with Three.js, Vite, and TailwindCSS.

## Project Structure

```
/
├── assets/               # Static assets
│   ├── audio/            # Audio files
│   ├── fonts/            # Font files
│   ├── images/           # Image assets 
│   │   └── themes/       # Theme-specific images
│   └── models/           # 3D models
├── config/               # Game configuration
├── managers/             # Game managers
├── src/                  # Source code
│   ├── components/       # Game components
│   └── utils/            # Utility functions
├── public/               # Public files
├── index.html            # Entry HTML file
├── main.js               # Main application file
├── style.css             # Global CSS styles
├── package.json          # Project dependencies
└── vite.config.js        # Vite configuration
```

## Game Components

- **Snake**: The main player-controlled entity
- **Fruit**: Collectible items that increase score
- **Bomb**: Obstacles that decrease score
- **Rock/Tree/Flower/Mushroom**: Environmental objects

## Features

- 3D gameplay with different camera perspectives
- Multiple color themes
- Custom settings
- Minimap for navigation
- Score tracking

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
````
