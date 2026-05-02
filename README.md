# Custom Keyboard Visualiser

A web-based tool built with React that visualizes mechanical keyboard layouts and simulates the acoustics of different mechanical switches.

## Features

- Dynamic layouts: Currently supports 60%, 75%, and 80% (TKL) layouts using an accurate CSS Grid span system.
- Hardware sync: Pressing physical keys on your keyboard will visually trigger the corresponding keys on the web interface.
- Switch acoustics: Uses the Web Audio API to synthesize typing sounds instead of relying on external audio files. It includes simulations for linear, tactile, and clicky switches.

## Local Development

To run this project locally, make sure you have Node.js installed, then execute the following commands:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the local development server

The app will be available at http://localhost:5173.

## Technical Details

The keyboard grid is built purely with CSS. Standard 1U keys take up 4 column spans, while modifiers take up fractional equivalents (e.g., a 2.25U left shift takes 9 spans). This allows for accurate keycap sizing without relying on absolute positioning or flexbox hacks.

Audio synthesis is handled by a combination of oscillators and filtered noise buffers to simulate the bottom-out resonance and plastic friction of a real switch housing.
