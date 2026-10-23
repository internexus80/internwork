# CareerAI --- Virtual Internship Platform

## Complete Antigravity Build Prompt

You are an expert product designer and senior Next.js frontend engineer.
Build a complete, production-quality virtual internship platform called
**CareerAI**.

The product is a modern virtual internship management platform where
students can discover internships, enroll, receive an offer letter,
complete project-based tasks, submit work, track internship progress,
pay applicable processing/task-review fees, request certificates, and
manage their internship profile.

Use the **uploaded dashboard screenshot in this conversation as the
primary visual reference**. Recreate its overall information
architecture, spacing rhythm, card proportions, typography hierarchy,
navigation behavior, task-card layout, progress visualization, and
visual polish very closely, but do NOT copy the Thiranex brand, logo,
colors exactly, proprietary assets, or wording. The finished product
must feel like an original product named **careerai**.

For product/content inspiration and clarification about how a real
virtual internship platform can be structured, review: -
https://www.thiranex.in/ - https://www.thiranex.in/student-login -
https://www.thiranex.in/register

Important: CareerAI is its own product. Do not display Thiranex branding
anywhere in the UI. Use only CareerAI branding and the mock data
supplied below.

------------------------------------------------------------------------

# 1. PRODUCT VISION

CareerAI should feel like a premium student career platform rather than
a generic admin dashboard.

Core experience:

1.  Student lands on CareerAI.
2.  Student understands what a CareerAI virtual internship is.
3.  Student can browse internship programs.
4.  Student signs in or creates an account.
5.  Student reaches the internship dashboard.
6.  Dashboard shows current internship, internship count, tasks,
    deadlines, submissions, certificates, and actions.
7.  Student can open each navbar section without leaving the visual
    system.
8.  Every interaction should feel polished, responsive, and animated.
9.  The platform must work beautifully on desktop, tablet, and mobile.

The UI should be: - Minimalist - Modern - Premium - Trustworthy -
Student-friendly - Clean - Spacious - Highly readable - Slightly
futuristic but not overly "AI neon" - Responsive - Accessible -
Fast-feeling

Avoid: - Generic Bootstrap appearance - Excessive gradients - Excessive
glassmorphism - Huge decorative illustrations - Overloaded dashboards -
Sidebars - Dense tables - Random dashboard widgets - Excessive
animation - Dark-only UI - Fake enterprise complexity

------------------------------------------------------------------------

# 2. REQUIRED TECH STACK

Use:

-   Next.js latest stable with App Router
-   TypeScript
-   Tailwind CSS
-   shadcn/ui where useful
-   Lucide React icons
-   GSAP for high-quality animation
-   Framer Motion only where it genuinely improves
    interaction/micro-animation
-   Lenis for smooth scrolling
-   React Hook Form
-   Zod for validation
-   Recharts only if a future analytics component needs charts
-   Local mock data for this prototype
-   No backend required for the first version
-   No database required
-   No authentication provider required
-   Use mocked authentication state/local storage for demo purposes

Do not introduce unnecessary libraries.

------------------------------------------------------------------------

# 3. PROJECT STRUCTURE

Use a clean component-driven architecture similar to:

app/ page.tsx login/ page.tsx register/ page.tsx internships/ page.tsx
dashboard/ page.tsx dashboard/tasks/ page.tsx dashboard/certifications/
page.tsx dashboard/payments/ page.tsx dashboard/profile/ page.tsx
dashboard/id-card/ page.tsx

components/ layout/ Navbar.tsx Footer.tsx PageContainer.tsx landing/
Hero.tsx InternshipSearch.tsx InternshipCard.tsx HowItWorks.tsx
Benefits.tsx Domains.tsx Testimonials.tsx FAQ.tsx CTA.tsx dashboard/
DashboardNavbar.tsx WelcomeHero.tsx InternshipCounter.tsx QuestLog.tsx
TaskCard.tsx TaskFilters.tsx CertificateTaskCard.tsx EmptyState.tsx
auth/ LoginForm.tsx RegisterForm.tsx AuthLayout.tsx common/ Logo.tsx
StatusBadge.tsx ProgressRing.tsx Modal.tsx Toast.tsx

data/ mockInternships.ts mockTasks.ts mockUser.ts

lib/ utils.ts mockAuth.ts

public/ images/ icons/

------------------------------------------------------------------------

# 4. BRAND

Product name:

**careerai**

Use a simple lowercase wordmark:

careerai

Create an original abstract CareerAI icon. Suggested direction: - small
four-point AI sparkle/star - subtle purple/blue gradient - clean
geometric shape - no copied logo

Typography: - Use Inter, Geist, or a similarly modern sans-serif. -
Strong heading weight. - Medium body text. - Compact labels. - Excellent
line height.

Primary visual language: - White background - Very light cool-gray
sections - Deep navy/purple hero panels - Electric indigo/purple
accent - Soft blue secondary accent - Green success - Amber
payment/pending - Red only for destructive/error states

Suggested palette: - Background: #F8FAFC - Surface: #FFFFFF - Text:
#111827 - Muted: #64748B - Primary: #4F46E5 - Secondary: #6366F1 - Deep
hero: #17164B / #1E1B4B - Success: #16A34A - Success background:
#ECFDF3 - Warning: #D97706 - Warning background: #FFF7DB - Border:
#E5E7EB

Do not make the entire site purple. Purple should be an accent.

------------------------------------------------------------------------

# 5. GLOBAL NAVBAR

There must be NO SIDEBAR.

This is an important requirement.

All dashboard navigation must exist in the top navbar.

Desktop navbar:

Left: - CareerAI logo

Center: - Dashboard - Tasks - Certifications - Payments - Profile - ID
Card

Right: - Help - Notification icon with small unread indicator - Avatar
with initials - Student name - Small dropdown chevron

Navbar: - White - Sticky - Thin bottom border - Slight backdrop blur -
Around 72--80px height - Maximum content width - Horizontally centered -
Clean spacing

Active navbar item: - Subtle light-purple background OR bottom
indicator - Purple icon/text - Smooth transition

Do not make navbar overly large.

Mobile: - CareerAI logo on left - Hamburger/menu button - Profile avatar
on right - Navigation opens in a clean dropdown/sheet - Do not use a
permanent sidebar

Navbar components should be reusable across dashboard pages.

------------------------------------------------------------------------

# 6. DASHBOARD PAGE

The dashboard screenshot provided by the user is the main reference.

The dashboard should have:

1.  Navbar
2.  Large Welcome Hero
3.  Quest Log
4.  Task grid

Do NOT include: - Sidebar - Milestone card - Stats cards between hero
and Quest Log - Bottom statistics card - Extra promotional card between
hero and Quest Log

The user specifically wants the layout simplified.

The visual flow must be:

NAVBAR ↓ WELCOME HERO ↓ QUEST LOG HEADER + FILTERS ↓ TASK GRID

That is the primary dashboard structure.

------------------------------------------------------------------------

# 7. WELCOME HERO

Make this the visual anchor.

Desktop: - Full-width within max-width container - Rounded corners -
Approx. 380--420px tall - Deep navy/purple background - Subtle abstract
wave/grid pattern - Soft glow - Premium shadow - Generous internal
padding

Left content:

Small label: "Welcome Intern 👋"

Large: "Hari Narayan S"

Pill: "Full Stack Development"

Information row: - Intern ID: CAI45872 - Joined On: 12 Aug 2026 -
Status: Active

Action buttons: - Download Offer Letter - Pay & Request - Join WhatsApp
Group

Right side:

A circular internship counter.

IMPORTANT: Do NOT show "Internship Progress".

Show:

"1 / 1"

with label:

"Internships"

Under it: "You've completed all your internships! 🎉"

The circle represents NUMBER OF INTERNSHIPS, not percentage progress.

For a student with multiple internships, this should dynamically
become: - 1 / 2 - 2 / 3 - etc.

Use a polished circular ring.

The counter must be accessible and readable.

Hero responsive behavior: - Desktop: two-column - Tablet: two-column but
compact - Mobile: stacked - On mobile, internship counter moves below
student information - Buttons wrap or become full-width

------------------------------------------------------------------------

# 8. QUEST LOG

Immediately after the hero.

No milestone card. No stats section. No promotional card.

Quest Log header:

Left: small purple task/list icon

Title: "Quest Log"

Subtitle: "Track and complete all tasks to finish your internship."

Right: segmented filters:

-   All Tasks
-   Completed
-   Pending

Active filter: Purple filled button.

Inactive: White with subtle border.

Add a subtle fade/slide animation when filtering.

------------------------------------------------------------------------

# 9. TASK GRID

Desktop: 4 columns

Tablet: 2 columns

Mobile: 1 column

Use cards with: - White background - 1px border - subtle shadow -
16--20px radius - consistent height where practical - internal padding -
clear hierarchy

Task card structure:

Top row: - Task number/icon - Status badge

Meta: - Due Date - Submission state

Title

Description

Optional "Key Features"

Bottom: large status/action area

Completed example: "✓ Completed Successfully!"

Pending example: "Submit Task"

Available certificate example: "Payment Required to Submit"

Use green for successful states. Use amber for payment required. Use
purple/blue for active actions.

Do not make cards too visually noisy.

------------------------------------------------------------------------

# 10. MOCK TASK DATA

Use these exact mock tasks for the dashboard prototype.

Task 1: Title: Mandatory: Offer Letter & LinkedIn Post Due Date:
Immediate Submission Status: Completed Description: Download your offer
letter, post it on LinkedIn tagging careerai, and share the post URL
here. Bottom status: Completed Successfully!

Task 2: Title: Personal Portfolio Website Due Date: 12 Aug 2026 Status:
Completed Description: Build a full-stack personal portfolio to showcase
your projects and skills. Key Features: - Frontend: HTML, CSS,
JavaScript or React.js - Backend: Node.js/Express.js or Django/Flask -
Database: MySQL, MongoDB, or PostgreSQL - Deploy using a hosting
platform

Task 3: Title: Task Management Application Due Date: 19 Aug 2026 Status:
Completed Description: Develop a task management web application for
creating, updating, and tracking tasks. Key Features: - User
authentication - CRUD operations - Responsive design - Optional
real-time updates

Task 4: Title: E-Commerce Web Application Due Date: 26 Aug 2026 Status:
Completed Description: Build a basic online store with product
management and order tracking. Key Features: - Product catalog - Add to
cart - Checkout functionality - Login and role-based access - Backend
APIs - Database integration

Task 5: Title: Blog Platform with Comments Due Date: 02 Sep 2026 Status:
Completed Description: Develop a blogging platform where users can
create posts and comment. Key Features: - Registration and login -
Create/edit/delete posts - Comment system - REST API - Database
integration

Certificate task: Title: Share Certificate on LinkedIn Status: Available
Description: Post your verified certificate on LinkedIn tagging
careerai.

Payment state: "Payment Required to Submit"

Secondary: "You must complete the payment before you can submit the
Certificate task."

CTA: "Go to Payment Tab"

------------------------------------------------------------------------

# 11. DASHBOARD DATA MODEL

Create mock user data:

{ name: "Hari Narayan S", initials: "HN", internId: "CAI45872", domain:
"Full Stack Development", joinedOn: "12 Aug 2026", status: "Active",
totalInternships: 1, completedInternships: 1 }

The internship counter must derive its UI from:

completedInternships / totalInternships

Do not hardcode the visual text in the component.

------------------------------------------------------------------------

# 12. DASHBOARD COMPONENT BEHAVIOR

Dashboard page should be composed from reusable components.

Example:

`<DashboardNavbar />`{=html}

```{=html}
<main>
```
`<WelcomeHero />`{=html} `<QuestLog>`{=html} `<TaskFilters />`{=html}
`<TaskGrid />`{=html} `</QuestLog>`{=html}
```{=html}
</main>
```
Task filtering should actually work.

When user clicks: - All Tasks → show all - Completed → only completed -
Pending → pending/available

Use React state.

No page reload required.

------------------------------------------------------------------------

# 13. TASK DETAILS INTERACTION

Clicking a task card should open a modal or detail drawer.

The modal should contain: - Task title - Description - Due date -
Requirements - Submission status - Submission input - Upload area -
Submit button

For completed tasks: Show: "Submission completed"

For pending: Show: "Submit Task"

For certificate task: If payment is not completed: Show payment warning
and route to Payments.

Use smooth GSAP/Framer Motion entrance.

------------------------------------------------------------------------

# 14. TASK SUBMISSION UI

Build a reusable submission component.

Support: - Text/URL submission - File upload mock UI - Drag-and-drop
visual area - Submit button - Success toast - Loading state - Error
state

No real file upload backend is required.

Simulate submission with local state.

After submission: - status becomes Completed - task card updates -
success toast appears

------------------------------------------------------------------------

# 15. OTHER NAVBAR PAGES

The navbar items are components/pages, not separate sidebar modules.

Implement:

## Dashboard

Main internship dashboard.

## Tasks

Dedicated task management page.

Features: - All internship tasks - Search - Status filter - Due date -
Task details - Submission state

## Certifications

Certification center.

Show: - Internship completion status - Certificate eligibility -
Certificate preview - Verification ID - Download certificate - Share to
LinkedIn - Certificate verification

Use mock certificate:

Certificate ID: CAI-CERT-2026-45872

Student: Hari Narayan S

Program: Full Stack Development Internship

Status: Verified

## Payments

Payment dashboard.

Show: - Payment history - Pending payments - Payment purpose - Amount -
Status - Payment CTA

Mock payment:

Purpose: Internship Task Review & Certificate Processing

Amount: ₹100

Status: Pending

Use the same warning visual language as the certificate card.

## Profile

Profile management page.

Sections: - Personal information - Academic information - Contact
information - Internship information - Account settings

Use editable form fields.

## ID Card

Create a digital internship ID card.

Show: - CareerAI logo - Student photo placeholder - Hari Narayan S -
Intern ID CAI45872 - Full Stack Development - Status Active - QR code
placeholder - Validity - Verified badge

Make it visually resemble a modern professional ID card.

## Help

Create a help/support page or modal.

Include: - Search help - FAQ - Contact support - Internship-related
questions - Payment questions - Certificate questions

------------------------------------------------------------------------

# 16. LANDING PAGE

Create a premium CareerAI landing page.

The landing page should be substantially different from the dashboard
while maintaining the same design system.

Sections:

1.  Navbar
2.  Hero
3.  Internship search / domain selector
4.  Trusted / credibility strip
5.  How CareerAI works
6.  Internship domains
7.  Why CareerAI
8.  Featured internships
9.  Student testimonials
10. FAQ
11. CTA
12. Footer

Hero headline:

"Build Real Skills. Get Real Internship Experience."

Supporting text:

"CareerAI helps students gain practical experience through structured
virtual internships, real-world projects, mentor guidance, and verified
credentials."

Primary CTA: "Explore Internships"

Secondary CTA: "How It Works"

Hero visual: Create an original dashboard/product mockup or floating
internship cards. Do not copy the dashboard screenshot directly into the
landing hero.

Add subtle animated elements.

------------------------------------------------------------------------

# 17. LANDING PAGE INTERNSHIP DOMAINS

Use cards for:

-   Full Stack Development
-   Frontend Development
-   Backend Development
-   Python Development
-   AI & Machine Learning
-   Data Science
-   Cyber Security
-   UI/UX Design
-   Digital Marketing
-   Cloud & DevOps

Each card: - icon - title - short description - duration - difficulty -
"Explore"

------------------------------------------------------------------------

# 18. HOW IT WORKS

Four steps:

01 Choose an Internship

02 Get Your Internship Plan

03 Build Real Projects

04 Earn Your Verified Credential

Animate each step as it enters the viewport.

Use GSAP ScrollTrigger.

------------------------------------------------------------------------

# 19. LOGIN PAGE

Create a premium but minimal login page.

Layout: Desktop two-column.

Left: - CareerAI branding - short message - abstract internship/career
visual

Right: - Login card

Fields: - Email - Password

Actions: - Login - Forgot password - Continue with Google mock button

Below: "Don't have an account? Create one"

Use validation.

Example: Email: hari@example.com

Password: ••••••••

Login should redirect to /dashboard.

Use mock authentication.

------------------------------------------------------------------------

# 20. REGISTER PAGE

Fields: - Full Name - Email - Mobile Number - College/University -
Graduation Year - Preferred Internship Domain - Password - Confirm
Password

Checkbox: "I agree to the Terms & Privacy Policy"

CTA: "Create CareerAI Account"

After registration: redirect to dashboard or internships page.

------------------------------------------------------------------------

# 21. INTERNSHIPS DISCOVERY PAGE

Create an internship browsing page.

Top: "Find Your Internship"

Search input: "Search by role, skill or domain"

Filters: - Domain - Duration - Difficulty - Mode - Availability

Cards:

Example: Full Stack Development Internship Duration: 4 Weeks Mode:
Virtual Level: Beginner Projects: 5 Certificate: Verified

CTA: "View Internship"

------------------------------------------------------------------------

# 22. GSAP ANIMATION SYSTEM

Use GSAP professionally, not excessively.

Animations:

Navbar: - subtle fade-in

Landing hero: - heading stagger - CTA reveal - floating UI movement

Dashboard: - welcome card fade/slide - internship counter scale-in -
task cards stagger in

Task filter: - subtle opacity/transform transition

Modal: - scale + fade

Scroll: - section reveal - cards stagger

Use GSAP ScrollTrigger for major scroll-based animations.

Do not animate every single element.

------------------------------------------------------------------------

# 23. LENIS SMOOTH SCROLL

Install and configure Lenis globally.

Requirements: - smooth desktop scrolling - natural easing - compatible
with GSAP ScrollTrigger - no scroll-jacking that feels uncomfortable -
disable/reduce smooth effects where accessibility settings prefer
reduced motion

Create a reusable smooth-scroll provider.

Synchronize Lenis with GSAP ticker correctly.

------------------------------------------------------------------------

# 24. ACCESSIBILITY

Must include:

-   semantic HTML
-   keyboard navigation
-   visible focus states
-   ARIA labels
-   sufficient contrast
-   accessible buttons
-   accessible modals
-   ESC closes modals
-   focus management
-   reduced-motion support

Do not rely only on color to communicate status.

------------------------------------------------------------------------

# 25. RESPONSIVE DESIGN

Desktop: - max width around 1280--1440px - 4-column task grid

Tablet: - 2-column task grid - compact navbar

Mobile: - 1-column task grid - hamburger navigation - stacked hero -
internship counter below content - full-width CTA buttons - horizontally
scrollable filter tabs if needed

The dashboard must remain visually clean at: - 1440px - 1280px -
1024px - 768px - 390px

------------------------------------------------------------------------

# 26. DESIGN DETAILS

Cards: - radius: 14--20px - subtle border - subtle shadow - hover lift
around 2--4px - transition 200--300ms

Buttons: - medium rounded corners - strong typography - clear hover -
clear active - loading states

Do not use overly rounded pill buttons everywhere.

Use pills mainly for: - status - categories - program labels

------------------------------------------------------------------------

# 27. ICONOGRAPHY

Use Lucide React.

Suggested icons: - LayoutDashboard - ListTodo - BadgeCheck -
CreditCard - UserRound - Contact - CircleHelp - Bell - CalendarDays -
CheckCircle2 - Clock3 - Upload - FileText - Linkedin - MessageCircle -
Download - ShieldCheck - Trophy - ArrowRight

Do not use random emoji icons except for small friendly text moments.

------------------------------------------------------------------------

# 28. MICRO-INTERACTIONS

Add: - button hover movement - card hover - status transitions -
notification pulse - progress ring animation - toast notifications -
modal transitions - filter transitions - form validation feedback

Keep all micro-interactions subtle.

------------------------------------------------------------------------

# 29. MOCK AUTH STATE

Create a simple mock auth utility.

If logged out: - landing page - login - register

If logged in: - dashboard - tasks - certifications - payments -
profile - ID card

Store demo login state in localStorage.

Demo credentials: Email: hari@example.com

Password: careerai123

Do not claim this is production authentication.

------------------------------------------------------------------------

# 30. FOOTER

Landing page footer:

CareerAI

"Build skills. Build projects. Build your career."

Links: - Internships - About - Help - Terms - Privacy - Contact

Social icons.

Copyright: © 2026 CareerAI. All rights reserved.

------------------------------------------------------------------------

# 31. EMPTY / LOADING / ERROR STATES

Every major page needs: - loading skeleton - empty state - error state

Example empty task: "No pending tasks" "You're all caught up."

Example no internships: "No internships match your search."

------------------------------------------------------------------------

# 32. COMPONENT REUSABILITY

Do not duplicate UI.

Reusable: - Navbar - Button - Badge - Card - Modal - ProgressRing -
TaskCard - InternshipCard - FormField - Toast - EmptyState -
LoadingSkeleton

Keep business logic outside presentational components where practical.

------------------------------------------------------------------------

# 33. CODE QUALITY

Use: - strict TypeScript - meaningful names - no `any` unless
unavoidable - no huge components - reusable hooks - reusable mock data -
clean imports - no dead code - no unnecessary dependencies

Avoid: - giant page.tsx files - inline repeated styles - hardcoded
repeated strings - duplicated components

------------------------------------------------------------------------

# 34. SEO

Landing page: - meaningful title - meta description - Open Graph
metadata - semantic headings - accessible images

Suggested title: "CareerAI --- Virtual Internships That Build Real
Skills"

Suggested description: "Discover structured virtual internships, build
real-world projects, and earn verified career credentials with
CareerAI."

------------------------------------------------------------------------

# 35. PERFORMANCE

Optimize: - images - fonts - animations - client components

Do not make the whole application a client component.

Use server components wherever possible.

Only use "use client" for: - interactive filters - forms - animations
requiring browser APIs - local state - modal interactions

------------------------------------------------------------------------

# 36. IMPORTANT VISUAL REFERENCE RULE

The uploaded screenshot is the primary reference for the dashboard.

Match: - overall visual density - navbar placement - hero composition -
hero height - circular internship indicator - task-card layout -
four-column desktop grid - clean white background - card borders - task
statuses - typography hierarchy - generous spacing

But change: - Brand → CareerAI - Logo → CareerAI - Content → CareerAI
mock content - Progress metric → Internship count - Remove sidebar -
Remove milestone section - Remove bottom stats section - Remove
intermediate stats cards - Put all navigation into the top navbar - Make
the dashboard a cleaner, more minimal product experience

The final dashboard hierarchy must be:

CareerAI Navbar ↓ Welcome Hero ↓ Quest Log Header ↓ Task Filters ↓ Task
Grid

Nothing else should be inserted between the Welcome Hero and Quest Log.

------------------------------------------------------------------------

# 37. IMPORTANT PRODUCT RULE

"Internship Progress" is NOT the metric shown in the hero.

Use:

1 / 1 Internships

The number must represent completed internships out of total enrolled
internships.

Example: If user has enrolled in two internships and completed one:

1 / 2 Internships

If they complete both:

2 / 2 Internships

Animate the ring based on completed/total.

------------------------------------------------------------------------

# 38. FINAL PAGE ROUTES

Implement these routes:

/ /login /register /internships /dashboard /dashboard/tasks
/dashboard/certifications /dashboard/payments /dashboard/profile
/dashboard/id-card /help

Navbar routing must work.

Use Next.js App Router.

------------------------------------------------------------------------

# 39. FINAL UX REQUIREMENT

The application should feel like a real product, not a design mockup.

Interactions must work: - Navbar navigation - Login - Register -
Dashboard filters - Task detail modal - Mock task submission - Payment
navigation - Certificate navigation - Profile editing - Notification
dropdown - User dropdown - Mobile menu - Internship browsing -
Search/filter - Toast feedback

Use mock data, but make the UX realistic.

------------------------------------------------------------------------

# 40. BUILD ORDER

Build in this order:

1.  Global Tailwind design system
2.  CareerAI logo/brand
3.  Navbar
4.  Landing page
5.  Login
6.  Register
7.  Dashboard shell
8.  Welcome hero
9.  Internship counter
10. Quest Log
11. Task cards
12. Task filtering
13. Task details modal
14. Tasks page
15. Certifications page
16. Payments page
17. Profile page
18. ID card page
19. Help page
20. Responsive behavior
21. GSAP animations
22. Lenis smooth scrolling
23. Accessibility
24. Final polish

------------------------------------------------------------------------

# 41. ACCEPTANCE CRITERIA

The implementation is complete only when:

-   [ ] CareerAI branding is used everywhere
-   [ ] No Thiranex branding appears
-   [ ] No sidebar exists
-   [ ] All dashboard navigation is in the top navbar
-   [ ] Dashboard visually follows the uploaded reference
-   [ ] Welcome hero is the first major dashboard section
-   [ ] Hero shows internship count, not internship progress
-   [ ] Internship count is dynamic from mock data
-   [ ] No milestone card exists
-   [ ] No bottom stats card exists
-   [ ] No intermediate stats cards exist
-   [ ] Quest Log immediately follows the hero
-   [ ] Task cards are responsive
-   [ ] Task filters work
-   [ ] Task detail modal works
-   [ ] Payment task routes to Payments
-   [ ] Login works with mock credentials
-   [ ] Register works
-   [ ] Navbar routes work
-   [ ] Landing page is complete
-   [ ] Internship discovery page is complete
-   [ ] Certifications page is complete
-   [ ] Payments page is complete
-   [ ] Profile page is complete
-   [ ] ID Card page is complete
-   [ ] Help page is complete
-   [ ] GSAP animations are implemented
-   [ ] Lenis smooth scrolling is implemented
-   [ ] Reduced-motion behavior exists
-   [ ] Mobile navigation works
-   [ ] Desktop layout looks polished
-   [ ] No TypeScript errors
-   [ ] No console errors
-   [ ] No broken links
-   [ ] No unnecessary placeholder sections

------------------------------------------------------------------------

# 42. FINAL INSTRUCTION TO ANTIGRAVITY

Do not stop after generating a static dashboard.

Build the entire CareerAI frontend as a cohesive virtual internship
product.

Use the uploaded screenshot as the dashboard visual reference and the
Thiranex public website only as a reference for understanding common
virtual-internship flows. Create an original CareerAI product.

Prioritize: 1. Visual fidelity to the supplied dashboard structure 2.
Clean minimalist design 3. Excellent spacing and typography 4. Reusable
components 5. Functional interactions 6. Responsive behavior 7. Smooth
but restrained animation 8. Production-quality Next.js architecture

The dashboard should feel immediately recognizable as a virtual
internship platform while remaining clearly different from Thiranex.

The final result should look like a real startup product that could be
shown to users, recruiters, colleges, and internship partners.
