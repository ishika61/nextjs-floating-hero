# Legal Work Platform — Floating Hero Section

A responsive recreation of the **Legal Work Platform** hero section from the Round-1 assignment, built with **Next.js 14+, App Router, Tailwind CSS, and Matter.js**.

The project combines a clean split-layout design with an interactive physics-based floating card visualization.

---

## 🚀 Live Demo

**Demo video:** https://drive.google.com/file/d/1FLz56gXXXzX7fNqPomXCPuTIy28EveeD/view?usp=sharing


**Live URL:** https://nextjs-floating-hero.onrender.com/

**GitHub:** https://github.com/ishika61/nextjs-floating-hero



---

## 📌 Assignment

### Round-1 — The Floating Hero Section

The objective was to recreate the supplied **Legal Work Platform** hero design as closely as possible using Next.js.

### Requirements implemented

- Split hero layout
- Left-side headline and supporting text
- Right-side floating card visualization
- Billing, Matters, Tasks and Documents cards
- Unique "John Doe - Portal" card variant
- Responsive layout
- Blurred background shapes
- Typography hierarchy
- Lucide icons
- Tailwind CSS styling
- Interactive physics-based card movement
- Dark mode support
- Subtle animations
- Hover and interaction effects
- Smooth card entrance/fade animations

---

## ✨ Features

### 1. Floating Physics Cards

The right side uses **Matter.js** to create a physics-based environment.

Cards can:

- Fall from the top
- Bounce off boundaries
- Collide with each other
- Rotate naturally
- Be grabbed and dragged
- Be thrown with the mouse
- Settle into a pile
- Automatically reset and repeat

This creates the "floating/raining cards" effect from the reference concept.

---

### 2. Reusable FloatingCard Component

The cards are implemented using a reusable component:

```tsx
<FloatingCard
  color="billing"
  rotation={-10}
  icon={<Receipt />}
  label="Billing"
/>
