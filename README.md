# Incrementality Lab

Incrementality Lab is a small interactive simulation that shows the gap between reported attribution and incremental performance.

It is built to help marketers, growth teams, and operators reason about a common problem: a channel can report strong performance while creating much less true lift.

## Demo

https://lab.mzhirnov.com

## Why this exists

Attribution often answers a reporting question: which channel touched a conversion.

Incrementality answers a different question: what actually changed because the channel was active.

Those two views can diverge meaningfully, especially in channels like retargeting where many exposed users were already likely to convert. Incrementality Lab is designed to make that counterfactual easier to understand.

## Current scope

Incrementality Lab currently focuses on a single scenario: retargeting.

It is designed as a simple interactive demonstration of how reported performance can diverge from incremental reality.

## Possible future scenarios

Potential future additions may include:

- brand search cannibalization
- paid vs organic overlap
- budget saturation
- multi-channel overlap

These are possible extensions, not committed roadmap items.

## How it works

The model splits users into three groups:

- users who would convert anyway
- persuadable users who may convert if exposed to ads
- users who are unlikely to convert in either case

Retargeting reaches a share of the audience. Only exposed persuadable users can generate incremental lift. Reported attribution, however, can also claim exposed users who would have converted anyway.

The difference between those two quantities is the core idea the tool is trying to illustrate.

## Features

- interactive controls for a retargeting scenario
- benchmark guidance for typical parameter ranges
- attributed vs incremental conversion comparison
- attributed vs incremental ROAS comparison
- exportable snapshot for slides and sharing
- shareable scenarios via URL
- currency-aware display presets for money inputs

## Tech stack

- React
- TypeScript
- Vite
- CSS
- html-to-image for client-side snapshot export

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Disclaimer

This is a simplified model intended to illustrate common patterns, not to produce exact forecasts.

It uses deterministic assumptions and heuristic ranges to make the mechanics of attribution vs incrementality easier to inspect. It should be used for understanding and communication, not as a substitute for experimentation or causal measurement.
