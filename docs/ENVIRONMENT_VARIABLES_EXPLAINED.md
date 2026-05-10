# 🌍 Environment Variables - Complete Beginner's Guide

> **For:** 15-year-old with basic coding knowledge  
> **Topic:** How frontend connects to backend in different environments

---

## 📚 Table of Contents

1. [What is that mysterious line?](#1-what-is-that-mysterious-line)
2. [What are environment variables?](#2-what-are-environment-variables)
3. [How Vite handles environment variables](#3-how-vite-handles-environment-variables)
4. [The three environments](#4-the-three-environments)
5. [Local development flow](#5-local-development-flow)
6. [Dev environment flow](#6-dev-environment-flow)
7. [Staging environment flow](#7-staging-environment-flow)
8. [Complete visual flow](#8-complete-visual-flow)
9. [Common issues and solutions](#9-common-issues-and-solutions)

---

## 1. What is that mysterious line?

### The Code:
```typescript
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
```

### Breaking it down word by word:

#### Part 1: `const BASE`
- Creates a variable called `BASE`
- This will store the backend server URL

#### Part 2: `import.meta.env`
- **Think of it as:** A magic box that Vite (your build tool) fills with settings
- **Real meaning:** Special object that contains environment variables
- **Only works in:** Vite projects (not regular JavaScript)

#### Part 3: `VITE_API_BASE_URL`
- The specific setting we're looking for inside the magic box
- Must start with `VITE_` for Vite to see it
- Holds the backend URL (like `http://localhost:3000`)

#### Part 4: `as string | undefined`
- TypeScript safety check
- Says: "This could be text OR nothing"

#### Part 5: `?? ''`
- **Called:** Nullish coalescing operator
- **Does:** If left side is `null` or `undefined`, use right side
- **Result:** If no URL is set, use empty string `''` instead

### Real-world examples:

**Local development:**
```typescript
// VITE_API_BASE_URL = "http://localhost:3000"
const BASE = "http://localhost:3000"
```

**Dev environment:**
```typescript
// VITE_API_BASE_URL = "https://dev-api.syeia.gov.uk"
const BASE = "https://dev-api.syeia.gov.uk"
```

**If not set:**
```typescript
// VITE_API_BASE_URL = undefined
const BASE = ""  // Empty string
```

---

## 2. What are environment variables?

### Simple analogy: 🏠
Imagine you have three houses:
- Your LOCAL house (your computer)
- Your DEV house (development server in AWS)
- Your STAGING house (staging server in AWS)

Each house needs different addresses for things:
- Where's the grocery store? (Backend API)
- What's the wifi password? (API keys)
- What time is dinner? (Timeout settings)

**Environment variables** are like a note board in each house with these addresses/settings written down.

### In our frontend:

| Variable Name | What it controls | Local value | Dev value | Staging value |
|--------------|------------------|-------------|-----------|---------------|
| `VITE_API_BASE_URL` | Backend server URL | `http://localhost:3000` | AWS Dev URL | AWS Staging URL |
| `VITE_LOGIN_DISABLED` | Skip login for testing | `"false"` | `"false"` | `"false"` |
| `VITE_SESSION_TIMEOUT_SECONDS` | How long before auto-logout | `1800` | `1800` | `1800` |

---

## 3. How Vite handles environment variables

### Vite is smart! 🧠

When you run `npm run dev` or `npm run build`, Vite:

1. **Looks for `.env` files** in this order:
   ```
   .env.local          ← Loaded FIRST (highest priority)
   .env.development    ← Only in dev mode
   .env.production     ← Only in build mode
   .env                ← Base file (lowest priority)
   ```

2. **Filters variables:**
   - ✅ Keeps: Variables starting with `VITE_`
   - ❌ Ignores: Everything else (for security)

3. **Injects them into your code:**
   - Replaces `import.meta.env.VITE_XXX` with actual values
   - Happens during build/compile time
   - Final bundle has real values, not the variable names

### Example transformation:

**Your code:**
```typescript
const url = import.meta.env.VITE_API_BASE_URL;
```

**After Vite processes it:**
```typescript
const url = "http://localhost:3000";
```

### Special built-in variables (always available):

| Variable | What it is | Example value |
|----------|-----------|---------------|
| `import.meta.env.MODE` | Environment mode | `"development"` or `"production"` |
| `import.meta.env.DEV` | Are we in dev mode? | `true` or `false` |
| `import.meta.env.PROD` | Are we in production? | `true` or `false` |
| `import.meta.env.BASE_URL` | Base path of your app | `"/frontend"` |

---

## 4. The three environments

### 🏠 LOCAL (Your Computer)

**Purpose:** Development and testing on your machine

**How it works:**
- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- Both on YOUR computer

**Who uses it:** Developers while coding

---

### 🌐 DEV (AWS Development Server)

**Purpose:** Testing new features before releasing

**How it works:**
- Backend and Frontend both running in AWS
- Uses AWS load balancer URL
- Connected to test database

**Who uses it:** Team for testing, QA team

---

### 🎯 STAGING (AWS Pre-Production Server)

**Purpose:** Final testing before going live

**How it works:**
- Exact copy of production setup
- Uses real-like data
- Last checkpoint before users see it

**Who uses it:** Final QA testing, demo to stakeholders

---

## 5. Local development flow

### Step-by-step: What happens when you run `run-frontend.ps1`

```
┌─────────────────────────────────────────────────────┐
│  You double-click run-frontend.ps1                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 1: PowerShell script runs                     │
│  Location: run-frontend.ps1 (lines 91-115)          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 2: Script sets Windows environment variables  │
│  These are IN MEMORY only (not saved to files)      │
│                                                      │
│  $env:VITE_API_BASE_URL = "http://localhost:3000"  │
│  $env:VITE_LOGIN_DISABLED = "false"                │
│  $env:VITE_DUMMY_USER_TYPE = "DNO_TEAM_COORDINATOR"│
│  $env:MODE = "local"                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 3: Script runs "npm run build"                │
│  - TypeScript compiles to JavaScript                │
│  - Checks for errors                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 4: Script runs "npm run dev"                  │
│  This triggers: vite --mode development             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 5: Vite starts up                             │
│  1. Reads vite.config.js                            │
│  2. Looks for .env files                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 6: Vite loads .env.local file                 │
│  File location: /desnz-syeia-frontend-beta/.env.local│
│                                                      │
│  Content:                                           │
│    VITE_API_BASE_URL=http://localhost:3000         │
│    VITE_LOGIN_DISABLED=${VITE_LOGIN_DISABLED}      │
│    VITE_SESSION_TIMEOUT_SECONDS=1800               │
│    ...                                              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 7: Environment variable substitution          │
│                                                      │
│  PowerShell env vars OVERRIDE .env.local values:    │
│                                                      │
│  VITE_API_BASE_URL = "http://localhost:3000"       │
│    (from PowerShell, not file)                      │
│                                                      │
│  VITE_LOGIN_DISABLED = "false"                     │
│    (PowerShell value replaces ${VITE_LOGIN_DISABLED})│
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 8: Vite injects values into your code         │
│                                                      │
│  Before (your code):                                │
│    const BASE = import.meta.env.VITE_API_BASE_URL; │
│                                                      │
│  After (browser receives):                          │
│    const BASE = "http://localhost:3000";           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 9: Frontend server starts                     │
│  URL: http://localhost:5173                         │
│  Opens automatically in your browser                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 10: Your code makes API calls                 │
│                                                      │
│  In consent-api.ts:                                 │
│    const BASE = "http://localhost:3000"            │
│    fetch(`${BASE}/cookies/preferences`)            │
│                                                      │
│  Actual request:                                    │
│    fetch("http://localhost:3000/cookies/preferences")│
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 11: Request goes to LOCAL backend             │
│  Backend running on: http://localhost:3000          │
│  Backend processes request and returns data         │
└─────────────────────────────────────────────────────┘
```

### Key files in local development:

1. **`run-frontend.ps1`** (Lines 91-115)
   ```powershell
   $env:VITE_API_BASE_URL = "http://localhost:3000"
   $env:VITE_LOGIN_DISABLED = "false"
   npm run dev
   ```

2. **`.env.local`**
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_SESSION_TIMEOUT_SECONDS=1800
   ```

3. **`vite.config.js`**
   ```javascript
   server: {
     port: 5173,
     proxy: {
       '/backend/api': { target: env.API_URL }
     }
   }
   ```

### Priority order (highest to lowest):
1. 🥇 PowerShell `$env:` variables (set in run-frontend.ps1)
2. 🥈 `.env.local` file
3. 🥉 `.env.development` file (if exists)
4. 📋 `.env` file (base defaults)

---

## 6. Dev environment flow

### How DEV environment gets its variables

```
┌─────────────────────────────────────────────────────┐
│  AWS ECS Fargate Container starts                   │
│  (Container = Isolated mini-computer in cloud)      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 1: ECS Task Definition loaded                 │
│  This is like a recipe for the container            │
│  Stored in AWS ECS service                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 2: Environment variables from SSM             │
│  SSM = AWS Systems Manager Parameter Store          │
│  (Secure storage for secrets and config)            │
│                                                      │
│  Task Definition specifies:                         │
│    {                                                │
│      "name": "VITE_API_BASE_URL",                  │
│      "valueFrom": "arn:aws:ssm:eu-west-2:          │
│                    123456789:parameter/            │
│                    syeia/dev/frontend/api-url"     │
│    }                                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 3: ECS fetches value from SSM                 │
│                                                      │
│  SSM Parameter:                                     │
│    Name: /syeia/dev/frontend/api-url               │
│    Value: https://dev-api.syeia.gov.uk             │
│    Type: SecureString (encrypted)                  │
│                                                      │
│  ECS IAM Role has permission to read SSM            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 4: Container environment set                  │
│  Inside the container:                              │
│    VITE_API_BASE_URL=https://dev-api.syeia.gov.uk  │
│    VITE_LOGIN_DISABLED=false                       │
│    VITE_SESSION_TIMEOUT_SECONDS=1800               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 5: Dockerfile CMD runs                        │
│  Command: npm run dev                               │
│  (Same as local, but env vars are different)        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 6: Vite loads .env.dev file                   │
│  File: /app/.env.dev (inside container)             │
│                                                      │
│  But... Container env vars OVERRIDE file values     │
│  So file is just a template                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STEP 7: Application runs with DEV settings         │
│  All API calls go to: https://dev-api.syeia.gov.uk │
└─────────────────────────────────────────────────────┘
```

### AWS SSM Parameter Store structure:

```
/syeia/
  ├── dev/
  │   ├── frontend/
  │   │   ├── api-url              → https://dev-api.syeia.gov.uk
  │   │   ├── login-disabled       → false
  │   │   ├── session-timeout      → 1800
  │   │   └── auth-login-url       → https://dev-api.../auth/login
  │   └── backend/
  │       ├── database-url         → (database connection string)
  │       └── ...
  │
  └── staging/
      ├── frontend/
      │   ├── api-url              → https://staging-api.syeia.gov.uk
      │   └── ...
      └── backend/
          └── ...
```

### How to view/set SSM parameters:

**View a parameter:**
```bash
aws ssm get-parameter \
  --name "/syeia/dev/frontend/api-url" \
  --with-decryption \
  --region eu-west-2
```

**Set a parameter:**
```bash
aws ssm put-parameter \
  --name "/syeia/dev/frontend/api-url" \
  --value "https://dev-api.syeia.gov.uk" \
  --type "SecureString" \
  --region eu-west-2 \
  --overwrite
```

---

## 7. Staging environment flow

### Same as DEV, but different parameter paths:

```
SSM Parameters:
  /syeia/staging/frontend/api-url
  /syeia/staging/frontend/session-timeout
  ...

Container environment:
  VITE_API_BASE_URL=https://staging-api.syeia.gov.uk
  
All API calls go to staging backend
```

### Key difference between Dev and Staging:

| Aspect | DEV | STAGING |
|--------|-----|---------|
| SSM path | `/syeia/dev/...` | `/syeia/staging/...` |
| Backend URL | `https://dev-api...` | `https://staging-api...` |
| Database | Test data | Production-like data |
| Updates | Frequently | Only before release |
| Purpose | Daily testing | Final validation |

---

## 8. Complete visual flow

### The Big Picture: How everything connects

```
┌──────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER (Local)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. You run: run-frontend.ps1                                │
│     ↓                                                         │
│  2. PowerShell sets: $env:VITE_API_BASE_URL="localhost:3000"│
│     ↓                                                         │
│  3. npm run dev → Vite starts                                │
│     ↓                                                         │
│  4. Vite reads .env.local                                    │
│     ↓                                                         │
│  5. Browser opens: http://localhost:5173                     │
│     ↓                                                         │
│  6. Code: const BASE = "http://localhost:3000"               │
│     ↓                                                         │
│  7. API call: fetch("http://localhost:3000/cookies/...")     │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ ✈️ Network request
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  LOCAL BACKEND (Your computer)                │
│                  http://localhost:3000                        │
│                  Responds with data                           │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                     AWS DEV ENVIRONMENT                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. ECS Container starts                                     │
│     ↓                                                         │
│  2. Task Definition loaded                                   │
│     ↓                                                         │
│  3. ECS reads SSM: /syeia/dev/frontend/api-url              │
│     Returns: "https://dev-api.syeia.gov.uk"                 │
│     ↓                                                         │
│  4. Container env: VITE_API_BASE_URL=https://dev-api...     │
│     ↓                                                         │
│  5. npm run dev (inside container)                           │
│     ↓                                                         │
│  6. Vite builds with DEV env vars                            │
│     ↓                                                         │
│  7. Code: const BASE = "https://dev-api.syeia.gov.uk"       │
│     ↓                                                         │
│  8. API call: fetch("https://dev-api.../cookies/...")       │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ ✈️ Internal AWS network
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  DEV BACKEND (AWS ECS)                        │
│                  https://dev-api.syeia.gov.uk                 │
│                  Responds with data                           │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                   AWS STAGING ENVIRONMENT                     │
│                   (Same flow as DEV, different URLs)          │
│                                                               │
│  SSM: /syeia/staging/frontend/api-url                       │
│  Value: https://staging-api.syeia.gov.uk                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Common issues and solutions

### Issue 1: "API calls going to wrong URL"

**Symptoms:**
- Local frontend calling production backend
- Getting CORS errors
- 404 errors on API endpoints

**Cause:** Environment variable not set correctly

**Solution:**
```powershell
# Check in run-frontend.ps1
$env:VITE_API_BASE_URL = "http://localhost:3000"  # ← Make sure this is set

# Check in .env.local
VITE_API_BASE_URL=http://localhost:3000  # ← Make sure this matches
```

---

### Issue 2: "Variables are undefined in browser"

**Symptoms:**
- `import.meta.env.VITE_API_BASE_URL` is `undefined`
- Features not working

**Cause:** Variable name doesn't start with `VITE_`

**Wrong:**
```typescript
API_BASE_URL=http://localhost:3000  // ❌ Won't work!
```

**Correct:**
```typescript
VITE_API_BASE_URL=http://localhost:3000  // ✅ Works!
```

---

### Issue 3: "Changes to .env not working"

**Cause:** Vite caches the values

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Delete `.vite` cache folder
3. Run `run-frontend.ps1` again

---

### Issue 4: "Different team members have different URLs"

**Cause:** Everyone's `.env.local` file is different

**Solution:** Use `run-frontend.ps1` which sets standard values:
```powershell
# This is the same for everyone
$env:VITE_API_BASE_URL = "http://localhost:3000"
```

---

### Issue 5: "Production build has wrong environment variables"

**Cause:** Build-time variables are baked into the code

**Solution:** For DEV/STAGING, build happens IN the container with correct env vars from SSM

---

## 🎯 Quick Reference

### Need to check current environment?

**In browser console:**
```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Mode:', import.meta.env.MODE);
console.log('Is Dev?', import.meta.env.DEV);
```

### Need to add a new environment variable?

1. **Add to `.env.local`:**
   ```env
   VITE_MY_NEW_SETTING=somevalue
   ```

2. **Add to `run-frontend.ps1`:**
   ```powershell
   $env:VITE_MY_NEW_SETTING = "somevalue"
   ```

3. **For DEV/STAGING, create SSM parameter:**
   ```bash
   aws ssm put-parameter \
     --name "/syeia/dev/frontend/my-new-setting" \
     --value "somevalue" \
     --type "String"
   ```

4. **Add to ECS Task Definition:**
   ```json
   {
     "name": "VITE_MY_NEW_SETTING",
     "valueFrom": "arn:aws:ssm:eu-west-2:...:parameter/syeia/dev/frontend/my-new-setting"
   }
   ```

5. **Use in code:**
   ```typescript
   const mySetting = import.meta.env.VITE_MY_NEW_SETTING;
   ```

---

## 📖 Summary

### The line explained:
```typescript
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
```

**Means:** "Get the backend URL from environment settings, or use empty string if not set"

### How it works:
- **Local:** PowerShell script → .env.local → Your code
- **DEV:** AWS SSM → ECS Container → .env.dev → Your code  
- **STAGING:** AWS SSM → ECS Container → Your code

### Key files:
- `run-frontend.ps1` - Sets local environment
- `.env.local` - Local defaults
- `.env.dev` - Dev template
- `vite.config.js` - Vite configuration
- AWS SSM Parameter Store - Cloud environment variables

### Remember:
- Variables MUST start with `VITE_`
- PowerShell values override file values
- Build-time variables are baked into the code
- Each environment has its own SSM parameters

---

**Questions? Issues? Check the troubleshooting section or ask the team!** 🚀
