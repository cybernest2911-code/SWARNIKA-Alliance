# Swarnika International Private Limited — 3D Flagship Corporate Website

Official 3D flagship digital platform built for **Swarnika International Private Limited**, communicating **"ONE GLOBAL BRAND. TWO STRENGTHS."** based strictly on the Swarnika International Brand & Transition Blueprint.

---

## 🎨 Visual Identity & Creative Architecture

- **Core Concept**: *"A Golden Global Thread connecting capital, corridors and cultivation"*
- **Primary Color Tokens**:
  - **Deep Ink**: `#16222F` (Primary backgrounds, navigation, main typography)
  - **Swarn Gold**: `#C29A3B` / `#E8D48A` (Signature accent used for lines, highlights, key numbers, monogram)
  - **Warm Paper**: `#FBF8F1` (Editorial background cards & human tone surfaces)
- **Division Accents**:
  - **Swarnika Alliance Slate**: `#2E4B60` (Advisory materials & practice areas)
  - **Swarnika Agro Green**: `#4F7243` (Agro-Industrial business lines)
- **Typography**:
  - `EB Garamond` (Serif Display / Hero headlines / Pull quotes)
  - `Inter` (UI, Body, Statistics, Navigation)

---

## 🌐 Three.js 3D Visual Engine

The platform features an interactive **Three.js WebGL 3D Globe**:
- **Dark Matte Sphere & Fine Grid**: Atmospheric dark globe with geographical latitude/longitude rings.
- **3D Golden Thread Arcs**: 3D quadratic bezier curves originating from **New Delhi** connecting to **Stavanger (Nordic Office)**, **Frankfurt (Europe)**, **Nairobi (Africa)**, and **Dubai (Gulf)**.
- **Interactive Corridor Selector**: Clicking corridor buttons highlights specific 3D golden arcs on the globe.
- **Responsive Parallax**: Smooth cursor mouse-tracking and camera inertia.
- **Card 3D Preview Objects**: Geometric node network for Alliance and organic 3D seed ring for Agro.

---

## 🚀 GoDaddy Hosting & Deployment Instructions

The site is built as a **zero-dependency, static web package** (HTML5, CSS3, ES6 JavaScript, Three.js WebGL CDN). It requires **NO Node.js server, NO build pipeline, and NO database**, making it 100% compatible with any **GoDaddy Web Hosting / cPanel account**.

### Step 1: Prepare Files for Upload
Copy all files from this directory:
- `index.html`
- `css/styles.css`
- `js/app.js`
- `assets/logo.svg`
- `README.md`

### Step 2: Upload to GoDaddy File Manager
1. Log into your **GoDaddy Account** &rarr; **My Products** &rarr; **Web Hosting** &rarr; Click **cPanel Admin**.
2. Open **File Manager** and double-click `public_html/`.
3. Zip all files, click **Upload** in cPanel File Manager, select your `.zip` file, and click **Extract**.

### Step 3: Configure Dual Email Desks
In GoDaddy cPanel **Email Accounts / Forwarders**:
- Route `alliance@swarnikainternational.com` to the Advisory Team lead.
- Route `agro@swarnikainternational.com` to the Agro Operations Desk.

### Step 4: 301 Domain Forwarding
- Forward `swarnikaagro.com` &rarr; `https://swarnikainternational.com/#agro`
- Forward `innowizconsulting.com` &rarr; `https://swarnikainternational.com/#alliance`

---

## 💻 Local Preview

To test locally:
```bash
# Option 1: Python
python -m http.server 8080 --directory "C:\Users\Admin\.gemini\antigravity\scratch\swarnika-international"

# Option 2: Double-click index.html in Chrome / Edge / Safari
```
Then visit `http://localhost:8080`.
