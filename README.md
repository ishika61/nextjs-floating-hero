# Legal Work Platform — Floating Hero Section

A pixel-close recreation of the **"A single platform to manage every part of your legal work"** hero section, built as part of the Round-1 Frontend Assignment.

The project uses **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **lucide-react**, and **Matter.js** to create an interactive physics-based floating-card experience.

---
---

## 🚀 Live Demo

**Demo video:** https://drive.google.com/file/d/1FLz56gXXXzX7fNqPomXCPuTIy28EveeD/view?usp=sharing

**Live URL:** https://nextjs-floating-hero.onrender.com/

**GitHub:** https://github.com/ishika61/nextjs-floating-hero


## ✨ Features

- 🎯 Pixel-close recreation of the provided reference design
- ⚖️ Split hero layout with text on the left and floating visualization on the right
- 🃏 Physics-based floating cards using Matter.js
- 🌊 Cards fall, collide, bounce, slide, and naturally pile up
- 🖱️ Cards are draggable and throwable with mouse/touch interaction
- 🔄 Continuous card spawn → settle → hold → fade → reset animation
- 🌙 Dark mode with persisted user preference
- ✨ Smooth entrance and hover animations
- 🎨 Blurred background shapes matching the reference design
- 📱 Responsive layout with a simplified mobile card layout
- 🎨 Reusable `FloatingCard` component
- 💬 Special `Portal` variant for the "John Doe - Portal" card
- 🧩 Lucide icons for Matters, Documents, Tasks, and Billing
- 📐 Custom card rotations and physics properties for a natural layout

---

## 🎨 Design Requirements Implemented

### Layout

- Text content positioned on the left
- Floating-card visualization positioned on the right
- Responsive behavior for smaller screens
- Mobile layout switches from physics simulation to a simplified static card layout

### Floating Elements

The following cards are implemented:

- Billing
- Matters
- Tasks
- Documents
- John Doe - Portal

Cards have custom:

- Width and height
- Rotation
- Position
- Color
- Friction
- Restitution
- Density

This creates a controlled **"chaotic but organized"** visual effect while keeping the cards readable.

### Reusable Component

The `FloatingCard` component supports reusable properties such as:

```tsx
color
rotation
icon
label
variant
message
meta
