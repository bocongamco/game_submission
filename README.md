# 🧠 Mind Match: *Sigma vs Stress*

## 🕹️ Overview
**Mind Match: Sigma vs Stress** is a lighthearted, web-based matching game built entirely with **HTML, CSS, and JavaScript**.  
Players flip pairs of cards to match common **stress triggers** with their corresponding **healthy coping strategies** — learning quick wellbeing tips while having fun.  
It’s designed for short play sessions and to raise awareness of mental-health habits among students and young adults.

---

## 🎮 Gameplay Summary
- The grid contains pairs of cards: each “Stress Arc” has a matching “Coping Move.”
- Flip two cards at a time.  
  - ✅ If they match → you score a point and keep them.  
  - ❌ If not → they flip back.  
- Match all pairs as fast as you can to earn a **Mental Rizz rank**:
  - 🥇 *Giga Chad* (under 45s)  
  - 🥈 *Sigma Ascendant* (under 75s)  
  - 🥉 *Based & Focused* (under 120s)  
  - 😅 *Recovering NPC* (over 120s)

Each round ends with a “W Rizz!” summary screen showing your completion time, score, and practical coping tips.

---

## ⚙️ Instructions to Run the Game

### Option 1: Open directly
1. Download or clone the project folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, or Safari).
3. Click **Start (No NPCs Allowed)** to begin.

> 🧩 If your browser blocks sounds or scripts when opened from `file:///`, use **Option 2** instead.

---

### Option 2: Run on a local server (recommended)
This avoids file-security restrictions and ensures all audio/sound features load correctly.

```bash
# In the game’s folder
python3 -m http.server 8080
```
Then visit **http://localhost:8080** in your browser.

You’ll see the menu screen → press **Start** to play.

---

## 🧰 Tech Stack
- **HTML5** for structure  
- **CSS3** (with gradients, glassmorphism, and animations) for visuals  
- **Vanilla JavaScript** for logic and interactivity  
- **Web Audio API** for offline-safe sound effects  
- **LocalStorage** for best-time tracking  
- Fully client-side — *no backend or installation required*

---

## 🧩 File Structure
```
MindMatch/
│
├── index.html        # Main entry page
├── style.css         # Game visuals and layout
├── script.js         # Game logic, sound, and interactions
├── data.js           # (optional) extra assets or constants
└── README.md         # Project documentation
```

---

## 💡 Project Summary
**Theme:** Mental health and wellbeing  
**Goal:** Promote awareness of everyday stress and quick self-care strategies in an engaging, humorous way.  
**Format:** 2D memory-match board game playable entirely in the browser.  
**Duration:** Designed to be completed within 2–3 minutes per session.  
**AI Use:** Game concept and assets (text, SVG graphics, sound code) were co-generated using LLM assistance.  

---

## 📜 Credits
Developed for a **Generative AI × Social Impact** coding challenge.  
Concept, scripting, and gameplay by *Nhat Tien Phat Cao*.  
Sound generation via **Web Audio API**, icons & emojis from Unicode set.
