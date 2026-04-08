# Chalo Khelne - Layout & UX Guide

> Unified design system derived from the CK logo palette (Orange + Green + Gold).
> Updated after full module-by-module audit of 28+ pages across 6 roles.
> Updated with competitive analysis of 7+ Indian sports-tech apps.

---

## Brand Color System

```
Primary (Orange)   #F97316  - CTAs, active states, primary buttons, links
Primary Dark       #EA580C  - Hover states
Secondary (Green)  #0EA572  - Success, badges, secondary actions, online status
Secondary Dark     #07875E  - Hover on green elements
Accent (Gold)      #F5C31C  - Stars, ratings, highlights, premium features
Neutral BG         #F5F7FA  - Page background (ALL roles, no variations)
Surface            #FFFFFF  - Cards, modals, sidebar
Text Primary       #111827  - Headings, body
Text Muted         #6B7280  - Captions, placeholders
Border             #E5E7EB  - Card borders, dividers
```

### CSS Variables (in index.css)
```css
var(--color-primary)       var(--color-primary-600)
var(--color-secondary)     var(--color-secondary-600)
var(--color-accent)        var(--color-accent-600)
```

---

## Part A: Universal Patterns

### A1. Master Layout Shell

ALL roles use ONE shell. Only sidebar items differ.

```
+--------------------------------------------------+
| TopBar (h-14, sticky, white, border-b, blur)     |
|  [=] [Breadcrumb / Page Title]   [Search][Bell][Avatar]
+--------+-----------------------------------------+
|Sidebar |  <main>                                 |
|w-[250] |    max-w-[1400px] mx-auto               |
|collaps |    p-6 lg:p-8                            |
|to w-17 |                                          |
|        |    [Page Content]                        |
|        |                                          |
+--------+-----------------------------------------+
```

- Background: `#F5F7FA` everywhere
- Sidebar: white, 250px / 68px collapsed, hover-expand on desktop, slide-overlay on mobile
- TopBar: white, h-14, sticky top-0, `backdrop-blur-md`, border-b border-gray-100
- Content: `max-w-[1400px] mx-auto`, padding `p-6 lg:p-8`

### A2. Page Header

```jsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
  </div>
  {cta && <Button variant="primary">{cta}</Button>}
</div>
```

### A3. Stat Card

```jsx
<div className="bg-white rounded-2xl border border-gray-100 p-5">
  <div className="flex items-center justify-between mb-3">
    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-[var(--color-primary)]" />
    </div>
    <span className="text-xs font-semibold text-[var(--color-secondary)]">+12%</span>
  </div>
  <p className="text-2xl font-bold text-gray-900">156</p>
  <p className="text-xs text-gray-500 mt-0.5">Total Tournaments</p>
</div>
```

Color coding:
- Tournaments/Events: `--color-primary` orange tint
- Users/Players: `--color-secondary` green tint
- Revenue/Finance: `--color-accent` gold tint
- Alerts/Pending: `red/amber` tint

### A4. Section Card (for forms)

```jsx
<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-[var(--color-primary)]" />
    </div>
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
  </div>
  <div className="p-6 space-y-4">{children}</div>
</div>
```

### A5. Input Field

```jsx
<div>
  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
  <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50
    focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20
    focus:border-[var(--color-primary)] transition" />
</div>
```

### A6. Data Table

```jsx
<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-gray-50/80 border-b border-gray-100">
        <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">...</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      <tr className="hover:bg-[var(--color-primary)]/[0.02] transition">
        <td className="px-5 py-4 text-sm">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

### A7. Modal

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
  <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-gray-100">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <button onClick={onClose}><X /></button>
    </div>
    <div className="p-5 overflow-y-auto">{body}</div>
    <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </div>
  </div>
</div>
```

### A8. Empty State

```jsx
<div className="text-center py-16">
  <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/5 flex items-center justify-center mx-auto mb-4">
    <Icon className="w-8 h-8 text-[var(--color-primary)]/30" />
  </div>
  <h3 className="text-lg font-bold text-gray-700">No items yet</h3>
  <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Description</p>
  <Button variant="primary" className="mt-4">+ Create</Button>
</div>
```

### A9. Badge / Status Pills

| Status     | Classes                                                           |
|------------|-------------------------------------------------------------------|
| Active     | `bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]`   |
| Live       | `bg-red-50 text-red-600` + animated pulse dot                    |
| Upcoming   | `bg-blue-50 text-blue-600`                                       |
| Pending    | `bg-amber-50 text-amber-600`                                     |
| Completed  | `bg-gray-100 text-gray-500`                                      |
| Premium    | `bg-[var(--color-accent)]/10 text-[var(--color-accent-700)]`     |
| Rejected   | `bg-red-50 text-red-600`                                         |

All pills: `px-2.5 py-0.5 rounded-full text-[10px] font-bold`

### A10. Button Variants

| Variant   | Style                                                                        |
|-----------|------------------------------------------------------------------------------|
| Primary   | `bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)]`   |
| Secondary | `bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-600)]`|
| Ghost     | `bg-transparent text-gray-600 hover:bg-gray-100`                            |
| Outline   | `border border-gray-200 text-gray-700 hover:bg-gray-50`                     |
| Danger    | `bg-red-500 text-white hover:bg-red-600`                                     |
| Accent    | `bg-[var(--color-accent)] text-gray-900 hover:bg-[var(--color-accent-600)]`  |

All: `rounded-xl text-sm font-semibold px-4 py-2.5 transition active:scale-[0.98]`

---

## Part B: Module-Specific Layouts

### B1. Dashboard Pages

**Used by:** Manager, Player, ClubAdmin, Corporate, Trainer, SuperAdmin

```
[Page Header: "Welcome back, {name}"]
[Stats Row: 3-4 KPI cards — grid-cols-2 sm:grid-cols-4 gap-4]
[Two-Column Body — grid-cols-1 lg:grid-cols-3 gap-6]
  [Main (col-span-2):                ]  [Side (col-span-1):  ]
  [  Recent Tournaments card         ]  [  Profile mini-card  ]
  [  Recent Activity / Bookings card ]  [  Quick Actions      ]
  [  Revenue Chart (if applicable)   ]  [  Upcoming Events    ]
[Full-Width: Notifications or Activity Feed]
```

**Module-specific notes:**
- **Manager**: Show active tournaments, whitelisted count, recent bookings. Hero gradient header is OK but standardize to brand orange gradient: `from-[var(--color-primary)] to-[var(--color-primary-600)]`
- **Player (PHome — currently empty)**: Show upcoming bookings, registered tournaments, win/loss stats, recommended trainers, nearby turfs. Player dashboard should feel personal and action-oriented.
- **ClubAdmin**: Revenue overview, manager performance, turf occupancy %. Add sparkline charts.
- **Corporate**: Expand beyond 3 basic stats. Add staff activity, tournament calendar, budget utilization.
- **Trainer**: Upcoming sessions today (highlighted), pending requests (action needed), session history stats. Use green tint `--color-secondary` for session-active indicators instead of hardcoded #36B37E.
- **SuperAdmin**: System health overview. User approval queue with inline approve/reject. Sport management should be a separate page, not on dashboard.

---

### B2. Tournament Management

**Used by:** Manager, Player, Corporate

```
[Page Header + Create Button]
[Tab Bar: Live | Upcoming | Completed]
[Filter Row: Sport, Type (Knockout/League), Search]
[Tournament Card Grid — grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5]
```

**Tournament Card:**
```
+-------------------------------+
| [Image / Sport Banner]   LIVE |  <- status badge top-right
|-------------------------------|
| Tournament Title              |
| Sport Tag  |  Location        |
| Date Range                    |
| Players: 24/32  |  Fee: 500  |
|-------------------------------|
| [View]  [Edit]  [Share]       |
+-------------------------------+
```

- Live tab: Cards show pulse dot, live score if available
- Upcoming: Show registration countdown, player count
- Completed: Show winner, final standings link
- **Player view**: Replace Edit/Share with "Register" / "View Bracket" actions

---

### B3. Turf / Venue Management

**Used by:** ClubAdmin (manage), Manager (view assigned), Player (browse & book)

**ClubAdmin — Add/Edit Turf (already implemented well):**
```
[Back + Title]
[Section: Basic Info — name, description]
[Section: Photos — 3-slot upload grid]
[Section: Location — address, area, city, pin, lat/lng]
[Section: Sports & Pricing — sport + price/hr + presets]
[Section: Operating Hours — open/close time + day toggles]
[Section: Facilities — tag-toggle grid]
[Cancel | Save]
```

**Player — Turf Discovery:**
```
[Search + Location Filter + Sport Filter]
[Turf Card Grid — grid-cols-1 md:grid-cols-2 lg:grid-cols-3]
```

**Player — Turf Detail (before booking):**
```
[Image Gallery — main + thumbnails]
[Title + Rating Stars + Location]
[Tab Bar: Overview | Availability | Reviews]
  Overview:  Sports list, facilities tags, description, operating hours
  Availability:  Calendar date picker + time-slot grid (green=open, gray=booked)
  Reviews:  Star distribution bar + review list
[Sticky Bottom: Price/hr + "Book Now" CTA]
```

**Player — Booking Flow:**
```
Step 1: Select Date (calendar) → Select Time Slot (grid) → Select Sport
Step 2: Confirm Details (pre-filled name, email, phone) + Special Requests
Step 3: Payment → Confirmation with booking ID
```
Better as a 3-step wizard than a single form.

---

### B4. Slot Booking / Calendar Views

**Used by:** Manager (manage bookings), Player (book slots)

```
[Page Header]
[View Toggle: Calendar | List]
[Calendar View:]
  +---+---+---+---+---+---+---+
  |Mon|Tue|Wed|Thu|Fri|Sat|Sun|
  +---+---+---+---+---+---+---+
  | 3 | 1 |   | 5 | 2 | 8 | 6 |  <- booking count per day
  +---+---+---+---+---+---+---+
  Click day → shows time-slot detail:
  06:00 [Booked - John]  07:00 [Open]  08:00 [Booked - Team X]

[List View:]
  Grouped by date, each booking as a row with user, sport, time, status
```

---

### B5. Social Feed

**Used by:** Manager (MSocial), ClubAdmin (CSocial)

```
[Create Post CTA — top of feed]
[Feed — single column, max-w-2xl mx-auto]
  +----------------------------------+
  | [Avatar] Name          2h ago    |
  |----------------------------------|
  | Post content with @blue #orange  |
  | [Image if any]                   |
  |----------------------------------|
  | [Heart] 12  [Comment] 3  [Share] |
  +----------------------------------+
```

- Posts should be narrow (max-w-2xl) for readability
- @mentions in `text-[var(--color-primary)]` (orange)
- #hashtags in `text-[var(--color-secondary)]` (green)
- Keep Create Post as inline expandable at top, not a full modal

---

### B6. Chat / Messaging

**Used by:** Group Chat (all roles)

```
+--------------------------------------------------+
| Chat Header: Group Name (5 members)  [Members] [i]|
+--------------------------------------------------+
| Message area (flex-1, overflow-y-auto)            |
|                                                    |
|        [Other user bubble - left aligned]          |
|                                                    |
|   [My bubble - right, orange tint bg]              |
|                                                    |
+--------------------------------------------------+
| [Attach] [Message input...............] [Send ->] |
+--------------------------------------------------+
```

- My messages: `bg-[var(--color-primary)]/10` right-aligned
- Others: `bg-gray-100` left-aligned
- Members panel: slide-in from right on toggle
- Chat takes full height of content area (no page scroll, only message scroll)
- Input: sticky bottom, always visible

---

### B7. Live Match / Scoring

**Used by:** Manager (scoring), Player (viewing)

This is an **immersive full-screen layout** — NO sidebar, NO topbar.

```
+--------------------------------------------------+
| [<Back] Match Title     Round 2    LIVE [pulse]   |
+--------------------------------------------------+
|           TEAM A     3 - 2     TEAM B             |
|           Set scores: 11-9, 8-11, 11-7, ...      |
+--------------------------------------------------+
| [Scoreboard]  |  [Match Timeline]  | [Scorer]    |
| Set detail    |  Event log         | Score input  |
| grid          |  Goals/points      | per sport    |
|               |  with timestamps   |              |
+--------------------------------------------------+
```

- Desktop: 3-column grid (scoreboard | timeline | scorer)
- Tablet: 2-column (scoreboard+timeline | scorer)
- Mobile: stacked with tab switching between views
- Header: dark bg `bg-gray-900 text-white` for contrast
- Live indicator: red pulse dot + "LIVE" badge
- Scoring input: sport-aware (SetBasedScorer, TimeBasedScorer, etc.)

---

### B8. Forum / Discussion

**Used by:** All roles (features/forum)

**Thread List:**
```
[Page Header + "New Thread" button]
[Category pills — horizontal scroll]
[Sort: Newest | Popular | Active]
[Thread cards — single column, max-w-3xl]
  +----------------------------------+
  | [Avatar] Author    Category pill  |
  | Thread Title (font-bold)          |
  | Preview text (2 lines, truncate)  |
  | [Heart] 12  [Reply] 5  [Eye] 89  |
  +----------------------------------+
```

**Thread Detail:**
```
[Breadcrumb: Forum > Category > Thread Title]
[Original Post — full width, prominent]
[Reply count + Sort]
[Reply cards — nested with left border for threading]
  | Reply 1
  |   | Nested reply 1a
  |   | Nested reply 1b
  | Reply 2
[Reply input — sticky bottom or after last reply]
```

- Category pills: each category gets a unique color from the palette
- Thread cards: subtle left border colored by category
- Nested replies: `border-l-2 border-[var(--color-primary)]/20 ml-6`

---

### B9. Notifications

**Used by:** Manager (Notification.jsx), all roles

```
[Page Header: Notifications]
[Filter Bar: All | Bookings | Payments | System]
[Status Filter: Pending | Accepted | Rejected]
[Notification List — single column]
  +------------------------------------------+
  | [Icon] [Avatar] User Name       2h ago   |
  |          Action description               |
  |          Tournament: XYZ  |  Amount: 500  |
  |          [Accept] [Reject]  Status: Badge |
  +------------------------------------------+
```

- Unread notifications: subtle `bg-[var(--color-primary)]/[0.03]` tint
- Action buttons inline for pending items
- Group by date: "Today", "Yesterday", "This Week"
- Bell icon in TopBar shows unread count badge

---

### B10. Profile / Settings Pages

**Used by:** Player (PProfile), Trainer (TrainerProfile), Corporate (CorporateProfile), Manager (MSettings)

```
[Profile Header Card]
  +------------------------------------------+
  | [Large Avatar]  Name                      |
  |                 Role Badge                |
  |                 email@example.com         |
  |                 [Edit Profile]            |
  +------------------------------------------+

[Tab Bar: Personal | Security | Preferences]

Personal Tab:
  [Section: Personal Info — name, dob, gender, sports]
  [Section: Contact — phone, emergency contact, address]

Security Tab:
  [Change Password card]
  [Active Sessions card]

Preferences Tab (if applicable):
  [Notification preferences]
  [Theme/language]
```

- Avatar: 80x80, rounded-full, border-4 border-white shadow
- Stats bar below avatar: `Win: 12 | Loss: 3 | Draw: 1` (for Player)
- Certifications tab (Trainer): card list with upload

---

### B11. Staff / People Management

**Used by:** ClubAdmin (ManagerAdmin), Corporate (CorporateStaff), SuperAdmin (Pending/Approved)

```
[Page Header + "Add Staff" button]
[Tab Bar: Active | Analytics | Activity Log]

Active Tab:
  [Search + Role Filter]
  [Staff Table]
    | Avatar | Name | Email | Role | Status | Actions |
    |  [img] | John | j@..  | Mgr  | Active | [Edit][X] |

Analytics Tab:
  [Stats Row: Total, Active, New this month, Avg response time]
  [Charts: Staff distribution pie, Activity trend bar chart]

Activity Log Tab:
  [Date range selector]
  [Timeline of actions with filters]
```

- Add Staff: modal with name, email, auto-generated password, role select
- Inline status toggle (active/inactive)
- CSV export button in header

---

### B12. Finance / Payments

**Used by:** ClubAdmin (ClubAdminFinance), Manager (MPayments)

```
[Page Header]
[Stats Row: Total Revenue | Booking Revenue | Tournament Revenue | Pending]
[Tab Bar: Overview | By Manager | By Tournament]

Overview Tab:
  [Revenue trend chart — line/area chart]
  [Recent transactions table]

By Manager Tab:
  [Clickable manager list → drill-down to their transactions]

By Tournament Tab:
  [Clickable tournament list → drill-down to revenue breakdown]
```

- Use accent gold `--color-accent` for revenue/money values
- Drill-down pattern: click row → detail view with back button
- Status badges on payments: confirmed (green), pending (amber), failed (red)

---

### B13. News / Content Management

**Used by:** Manager (MNews), SuperAdmin (NewsManagement)

```
[Page Header + "Create" button]
[Filter Row: Status (Draft|Published|Expired) | Type | Search]
[News Card Grid — grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5]
  +-------------------------------+
  | [Thumbnail Image]             |
  |-------------------------------|
  | Type Badge    Status Badge    |
  | Title (font-bold, 2-line)     |
  | Sport tags                    |
  | Publish date                  |
  |-------------------------------|
  | [Edit] [Publish/Archive] [X]  |
  +-------------------------------+
```

- Create/Edit: full-page form (not modal — content is rich)
- Add rich text editor for body content
- Preview mode before publishing

---

### B14. Coupon Management

**Used by:** Manager (MCoupons)

```
[Page Header]
[Stats Row: Total | Active | Used | Expired]
[Coupon List — single column cards]
  +----------------------------------------------+
  | CODE: SAVE20        [Toggle ON/OFF]          |
  | 20% off (max 200)  |  Valid till: Dec 2026   |
  | Usage: 15/100       |  Min order: 500         |
  | Applied to: All tournaments                   |
  +----------------------------------------------+
```

- Large coupon code text with copy button
- Toggle switch for enable/disable (instant, no confirmation needed)
- Expired coupons: muted/grayed out

---

### B15. Referee Management

**Used by:** Manager (MRefree), ClubAdmin (CRefree)

```
[Page Header]
[Tab Bar: Directory | My Requests]

Directory Tab:
  [Search + Sport Filter]
  [Profile Card Grid — grid-cols-1 md:grid-cols-2 lg:grid-cols-3]
    +-------------------------------+
    | [Avatar]  Name                |
    |           Certified Level     |
    |           Exp: 5 years        |
    |           Sports: Cricket, FB |
    |           [Request]           |
    +-------------------------------+

My Requests Tab:
  [Status Filter: Pending | Accepted | Rejected]
  [Request List with status badges and details]
```

---

### B16. RBAC / Permissions (SuperAdmin)

```
[Page Header]
[Tab Bar: Matrix | Roles | Permissions]

Matrix Tab:
  Sticky-header table with roles as columns, permissions as rows
  Checkboxes at intersections, color-coded by module

Roles Tab:
  [Role cards with authority level, color indicator]
  [Create Role button → modal]

Permissions Tab:
  [Grouped by module: Tournament, Turf, Player, Finance...]
  [Expandable sections with permission list]
```

---

### B17. Vendor Marketplace (SuperAdmin)

```
[Page Header]
[Filter Bar: Sport | Category | Condition]
[Search]
[Equipment Grid — grid-cols-1 md:grid-cols-2 lg:grid-cols-3]
  +-------------------------------+
  | Equipment Name                |
  | Sport tag  |  Category tag    |
  | Condition: [Like New] badge   |
  | Vendor: Amazon  |  Price: 899 |
  | [Add Vendor Link] [Delete]    |
  +-------------------------------+
[Pagination]
```

---

## Part C: Design Tokens

### Spacing (8px grid)

| Token        | Value   | Usage                            |
|--------------|---------|----------------------------------|
| `gap-4`      | 16px    | Form fields, tight card grids    |
| `gap-5`      | 20px    | Card grids                       |
| `gap-6`      | 24px    | Between sections                 |
| `p-5`        | 20px    | Card padding                     |
| `p-6`        | 24px    | Section / modal padding          |
| `mb-6`       | 24px    | After page header                |
| `p-6 lg:p-8` | 24-32px | Page wrapper                    |

### Typography

| Role         | Classes                                                    | Usage              |
|--------------|------------------------------------------------------------|---------------------|
| Page Title   | `text-2xl font-bold text-gray-900`                         | Page headers        |
| Subtitle     | `text-sm text-gray-500`                                    | Below titles        |
| Section Head | `text-sm font-bold text-gray-800`                          | Card headers        |
| Body         | `text-sm text-gray-700`                                    | Content text        |
| Caption      | `text-xs text-gray-500`                                    | Timestamps, meta    |
| Label        | `text-xs font-semibold text-gray-500`                      | Form labels         |
| Tiny Tag     | `text-[10px] font-bold uppercase tracking-wider text-gray-400` | Badges, tags   |
| Stat Number  | `text-2xl font-bold text-gray-900`                         | KPI values          |
| Price        | `text-lg font-bold text-[var(--color-accent-700)]`         | Money amounts       |

### Shadows

| Context     | Value                                     |
|-------------|-------------------------------------------|
| Card        | `shadow-[0_1px_3px_rgba(0,0,0,0.04)]`    |
| Card Hover  | `shadow-[0_4px_12px_rgba(0,0,0,0.06)]`   |
| Dropdown    | `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`   |
| Modal       | `shadow-2xl`                               |

### Icons

Standardize on **Lucide React** across all roles.

| Size     | Classes     | Usage                          |
|----------|-------------|--------------------------------|
| Small    | `w-3.5 h-3.5` | Inside badges, tiny buttons |
| Default  | `w-4 h-4`  | Buttons, nav items, inline     |
| Medium   | `w-5 h-5`  | Page headers, TopBar           |
| Large    | `w-8 h-8`  | Empty states, feature icons    |

### Responsive Breakpoints

| Screen     | Sidebar       | Grid                   | Behavior              |
|------------|---------------|------------------------|-----------------------|
| < 768px    | Hidden, burger| 1 column               | Stack everything      |
| 768-1024px | Collapsed 68px| 2 columns              | Compact cards         |
| > 1024px   | Expanded 250px| 3-4 columns            | Full layout           |

---

## Part D: Pages That Need Attention

| Page | Issue | Action |
|------|-------|--------|
| **PHome.jsx** | Empty "Coming Soon" | Build player dashboard with bookings, stats, nearby turfs |
| **Ptrainers.jsx** | Empty "Coming Soon" | Build trainer discovery with filters, request session CTA |
| **TrainerDashboard** | Uses hardcoded green `#36B37E` | Replace with `--color-secondary` |
| **PlayerLayout** | Broken dynamic Tailwind `ml-${collapsed}` | Use inline style or fixed classes |
| **SuperAdmin Layout** | No mobile responsive | Use shared AppLayout |
| **CorporateDashboard** | Only 3 basic stats | Expand with activity feed, calendar, budget |
| **All sidebars** | Mixed icon libs (FA, Heroicons, Lucide) | Standardize to Lucide React |
| **All backgrounds** | 3 different grays used | Standardize to `#F5F7FA` |

---

## Part E: Landing Page (Public)

- Navbar: `bg-gray-950/90 backdrop-blur-xl`, CK logo + nav tabs + Login/Register
- Hero: Full-width with gradient overlay, large headline, CTA buttons in orange
- Sections: White bg cards with `rounded-2xl`, subtle borders
- CTAs: `bg-[var(--color-primary)] text-white` orange buttons
- Footer: Dark `bg-gray-950` matching navbar
- Mobile: Hamburger menu, stacked sections

---

## Part F: Competitive Analysis & UX Upgrades

### F1. Competitor Landscape

| App | Focus | Strengths We Must Beat | Their Weakness (Our Edge) |
|-----|-------|------------------------|---------------------------|
| **Playo** | Venue booking + community | Scarcity UX on venue cards ("Only 2 slots left"), recently visited venues, social playpals | No tournament management, no live scoring, no multi-role admin |
| **KheloMore** | Venue booking (250+ cities) | Split payment, membership booking, 500+ venues, refund tracking | No tournament brackets, no scoring, no club admin tools |
| **Turf Town** | Venue booking (South India) | Vertical slot view for time scanning, tournament discovery, club creation | Limited to South India, basic tournament features |
| **CricHeroes** | Cricket scoring + tournaments | Auto-schedule generator, NRR calculator, wagon wheel/manhattan charts, live streaming, player stats profiles | Cricket only, no venue booking, no multi-sport |
| **SportVot** | Live streaming + scoring | Cloud studio, 30+ sport scorers, multi-camera streaming, auto highlights | No venue booking, no club/turf management |
| **BookForSport** | Basic turf booking | Simple booking flow | No community, no tournaments, no analytics |
| **BookMyShow Sports** | Event ticketing | Large audience, payment infra | Not sports-focused, no management tools |

### F2. Chalo Khelne's Unique Position

CK is the **only app** that combines ALL of these:
- Multi-sport venue booking with pricing
- Full tournament management (knockout + group stage + league)
- Live scoring with sport-specific scorers (10+ formats)
- Multi-role admin (SuperAdmin, ClubAdmin, Corporate, Manager, Trainer, Player)
- Club/Corporate management with staff, finance, RBAC
- Trainer booking and session management

**Strategy: Beat each competitor on their OWN strength, then combine everything.**

---

### F3. UX Patterns Stolen from Competitors (Implement These)

#### From Playo — Scarcity & Personalization

**1. Venue Card with Scarcity Signal**
Show "Only X slots left today" on turf cards. Creates urgency.
```
+-------------------------------+
| [Turf Image]                  |
|-------------------------------|
| Turf Name           4.5 star  |
| Kharadi, Pune                 |
| Cricket, Football             |
| from 500/hr                   |
|                               |
| [flame] Only 3 slots left!    |  <- scarcity badge (amber)
| [Book Now]                    |
+-------------------------------+
```
- Scarcity badge: `bg-amber-50 text-amber-700 border border-amber-200`
- Show real-time slot count from backend

**2. Recently Visited / Quick Re-book**
Top of Player home — horizontal scroll of recently booked turfs for one-tap rebooking.
```
[Recently Played — horizontal scroll]
  [Turf A]  [Turf B]  [Turf C]
  [Rebook]  [Rebook]  [Rebook]
```

**3. Personalized Home Feed**
Sort venues/tournaments by: user's sport preferences, location proximity, past bookings.

---

#### From CricHeroes — Scoring & Player Profiles

**4. Player Stats Profile Card**
Rich player profile with visual stats — not just text.
```
+------------------------------------------+
| [Avatar 80px]  Player Name               |
|                All-Rounder  |  Pune       |
+------------------------------------------+
| Matches  |  Wins  |  Losses  |  Win %    |
|   45     |   32   |    11    |   71%     |
+------------------------------------------+
| [Batting Avg Chart]  [Sport Breakdown Pie]|
+------------------------------------------+
| Recent Matches                            |
|  vs Team X — Won by 15 runs    2 days ago|
|  vs Team Y — Lost by 3 wickets 5 days ago|
+------------------------------------------+
| Badges: [First Win] [10 Matches] [MVP]   |
+------------------------------------------+
```

**5. Tournament Auto-Schedule Display**
After fixture generation, show bracket/schedule visually:
- Knockout: bracket tree view (left vs right converging to final)
- Group Stage: group tables with NRR, points, played/won/lost
- Both: clickable match cards linking to live scoring

**6. Rich Scorecard View**
After match completion, show detailed scorecard like CricHeroes:
- Score summary header
- Innings breakdown (for cricket)
- Set-by-set scores (for racquet sports)
- Player performance highlights
- MVP badge on top performer

---

#### From Turf Town — Slot Discovery UX

**7. Vertical Slot Timeline**
Replace basic time pickers with a visual timeline:
```
  06:00  [████████] Booked — Rahul's Team
  07:00  [        ] AVAILABLE — 500/hr  [Book]
  08:00  [        ] AVAILABLE — 500/hr  [Book]
  09:00  [████████] Booked — Corporate Event
  10:00  [████████] Booked — Cricket Match
  11:00  [        ] AVAILABLE — 600/hr  [Book]  <- peak pricing
```
- Booked slots: gray/muted, show who booked
- Available: green border, price, instant book button
- Peak hours: subtle price highlight in accent gold

**8. Tournament Discovery Feed**
Horizontal carousel of trending/nearby tournaments on player home:
```
[Trending Tournaments — swipeable]
  +------------------+  +------------------+
  | [Banner]         |  | [Banner]         |
  | Cricket Blast    |  | Football League  |
  | Mar 15  |  Pune  |  | Mar 20  |  Mumbai|
  | 24/32 registered |  | 8/16 registered  |
  | [Register]       |  | [Register]       |
  +------------------+  +------------------+
```

---

#### From SportVot — Live Experience

**9. Live Match Immersive Mode**
Full-screen dark UI for live match viewing:
```
+--------------------------------------------------+
| bg-gray-950                                       |
| [<] IPL Practice Match      LIVE [pulse]  [share]|
|                                                    |
|    TEAM ALPHA        3 - 1        TEAM BETA       |
|    [logo]          Set 4         [logo]            |
|                   11 - 8                           |
|                                                    |
| Set 1: 11-9  |  Set 2: 8-11  |  Set 3: 11-7     |
|                                                    |
| [Timeline]                                         |
|  11:02  Team Alpha scores — Rahul serve ace       |
|  10:58  Team Beta timeout                          |
|  10:55  Team Alpha scores — Net kill               |
+--------------------------------------------------+
```
- Dark mode ONLY for live match (high contrast for outdoor viewing)
- Large score numbers (text-5xl on mobile)
- Auto-scroll timeline
- Share button for live match link

---

### F4. Gamification System (Beat CricHeroes)

**Badges** — Award automatically after milestones:

| Badge | Trigger | Icon Color |
|-------|---------|------------|
| First Blood | Win first match | `--color-primary` orange |
| Hat Trick | Win 3 in a row | `--color-secondary` green |
| Century Club | Play 100 matches | `--color-accent` gold |
| MVP | Get MVP in a tournament | Gold with star |
| Iron Wall | 0 goals conceded in tournament | Silver |
| Sharp Shooter | Highest scorer in tournament | Orange gradient |
| Social Butterfly | Join 5 groups | Green |
| Turf Regular | Book same turf 10 times | Blue |

Display on profile as a badge grid (3-4 per row, with locked badges grayed out).

**Leaderboards** — Keep them small and contextual:
- Per tournament (not global — avoids discouragement)
- Per sport in a city
- Monthly reset for "Monthly Champions"
- Show user's rank + 2 above + 2 below (not full list)

**Streaks:**
- "5-day booking streak" — show flame icon on profile
- "3-tournament win streak" — special badge

---

### F5. Micro-Interactions That Win Users

| Interaction | Implementation |
|-------------|----------------|
| **Booking confirmation** | Confetti animation + green check + booking ID card |
| **Score update** | Number flip animation (like airport departure boards) |
| **Tournament registration** | Progress bar: "24/32 spots filled" with fill animation |
| **Badge earned** | Gold shimmer animation + toast notification |
| **Slot almost gone** | Pulse animation on scarcity badge |
| **Match going live** | Red pulse dot + subtle screen edge glow |
| **Payment success** | Check mark draws itself (Lottie animation) |
| **Pull to refresh** | Sport ball bouncing (custom spinner per sport) |

---

### F6. Mobile-First Patterns (70%+ Users Are Mobile)

| Pattern | Desktop | Mobile |
|---------|---------|--------|
| **Sidebar** | 250px sticky | Bottom tab bar (5 icons) |
| **Stat cards** | 4 per row | 2 per row, swipeable |
| **Tournament cards** | 3-col grid | Full-width stack |
| **Live scoring** | 3-column | Tab switching: Score / Timeline / Input |
| **Chat** | Side panel for members | Full-screen, sheet for members |
| **Slot timeline** | Horizontal day view | Vertical scroll (Turf Town style) |
| **Profile** | Side-by-side info | Stacked cards |

**Bottom Tab Bar (Mobile — replaces sidebar):**
```
+------+--------+------+--------+------+
| Home | Tourna | Book | Chat   | More |
| [ic] | [ic]   | [ic] | [ic]   | [ic] |
+------+--------+------+--------+------+
```
- Active tab: `--color-primary` orange icon + label
- Inactive: gray
- "Book" center tab: larger, raised circle (FAB style) — primary CTA

---

### F7. Features Our Competitors DON'T Have (Defend These)

| Feature | Why It's Our Moat |
|---------|-------------------|
| **Multi-sport scoring engine** | CricHeroes = cricket only. We score 15+ sports |
| **Corporate tournament module** | No competitor has corporate admin + employee whitelist + QR invite |
| **Club admin with finance drill-down** | Revenue by manager, by tournament, by turf — unique |
| **Trainer session management** | Live timer, attendance, session notes — like a mini-LMS |
| **RBAC permissions matrix** | Enterprise-grade role management, no competitor has this |
| **Group chat per tournament** | Coordination tool built-in, not separate WhatsApp groups |
| **Referee request system** | Structured referee hiring with match fee + sport filter |

**Protect these in UI by making them prominent, not hidden in sub-menus.**

---

### F8. What to Build Next (Competitor Gap Analysis)

| Priority | Feature | Inspired By | Impact |
|----------|---------|-------------|--------|
| P0 | Scarcity on venue cards ("3 slots left") | Playo | +conversion |
| P0 | Player stats dashboard (charts, win %) | CricHeroes | +retention |
| P1 | Vertical slot timeline for booking | Turf Town | +booking UX |
| P1 | Badge/achievement system | CricHeroes + gamification | +engagement |
| P1 | Recently visited turfs (quick rebook) | Playo | +repeat usage |
| P2 | Tournament bracket visual (tree view) | CricHeroes | +tournament UX |
| P2 | Live match dark immersive mode | SportVot | +live experience |
| P2 | Split payment for group bookings | KheloMore | +group adoption |
| P3 | Mobile bottom tab navigation | All competitors | +mobile UX |
| P3 | Player leaderboards per city/sport | CricHeroes | +competition |
| P3 | Booking confirmation animation | Modern UX | +delight |
