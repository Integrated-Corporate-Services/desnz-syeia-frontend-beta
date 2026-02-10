# 🚀 Complete Setup Instructions

## Step-by-Step Guide to Run Terminal Logger

### ✅ Step 1: Verify Node.js

```powershell
node --version
```

Should show v14 or higher. If not, install from https://nodejs.org/

### ✅ Step 2: Navigate to Project

```powershell
cd C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger
```

### ✅ Step 3: Verify Files

```powershell
dir
```

You should see:
```
Mode  Name
----  ----
d---- launchers/
d---- logs/
d---- src/
d---- utils/
-a--- .gitignore
-a--- package.json
-a--- README.md
```

### ✅ Step 4: Test Command Wrapper

```powershell
.\launchers\run-logger node --version
```

**Expected Output**:
```
============================================================
Executing: node --version
Session ID: 20260129_143200
Logs: C:\...\terminal-logger\logs
============================================================

v22.18.0

============================================================
Command finished with exit code: 0
Logs saved to: ...\logs\session_20260129_143200.log
============================================================
```

### ✅ Step 5: Test Session Logger

```powershell
.\launchers\start-session

# You'll see:
================================================================================
TERMINAL SESSION LOGGER
================================================================================
Session ID: 20260129_143300
Started: 2026-01-29 14:33:00

📝 Everything you type and see will be logged in real-time.
💡 Type 'exit' to end the session and stop logging.
================================================================================

PS C:\...\terminal-logger>
```

Now test inside the session:
```powershell
# Inside the logged session
PS> node --version
PS> npm --version
PS> echo "Testing logger"
PS> exit
```

### ✅ Step 6: View Your Logs

```powershell
# List all log files
dir logs

# View latest log
Get-Content logs\session_*.log -Tail 50
```

## 🎯 Common Use Cases

### Use Case 1: Log npm Install

```powershell
cd C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger
.\launchers\run-logger npm install
Get-Content logs\session_*.log
```

### Use Case 2: Log Entire Development Session

```powershell
cd C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger
.\launchers\start-session

# Inside logged session
PS> cd C:\your-project
PS> npm install
PS> npm start
# ... server runs, all logs captured ...
PS> exit

# View complete session
Get-Content logs\session_*.log
```

### Use Case 3: Monitor Logs in Real-Time

```powershell
# Terminal 1: Start session
cd C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger
.\launchers\start-session
PS> npm start

# Terminal 2: Watch logs live
cd C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger
Get-Content logs\session_*.log -Wait -Tail 50
```

## 🚚 Deploy to Your Project

### Option 1: Copy Entire Folder

```powershell
# Copy terminal-logger folder to your project
Copy-Item -Recurse "C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger" "C:\your-project\terminal-logger"

# Use it
cd C:\your-project\terminal-logger
.\launchers\start-session
```

### Option 2: Copy Just Files You Need

```powershell
# Create directories
New-Item -ItemType Directory -Path "C:\your-project\logger"
New-Item -ItemType Directory -Path "C:\your-project\logger\src"
New-Item -ItemType Directory -Path "C:\your-project\logger\utils"

# Copy files
Copy-Item "C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger\launchers\*" "C:\your-project\logger\"
Copy-Item "C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger\src\*" "C:\your-project\logger\src\"
Copy-Item "C:\Users\KumarSagar(ICS)\Documents\learningJs\terminal-logger\utils\*" "C:\your-project\logger\utils\"

# Use it
cd C:\your-project\logger
.\start-session.bat
```

## 📂 Custom Log Location

```powershell
# Set custom log path
$env:LOG_OUTPUT_PATH = "C:\MyLogs"

# Now run logger
.\launchers\start-session

# Logs will be saved to C:\MyLogs
```

## 🔧 Troubleshooting

### Issue: "run-logger is not recognized"

**PowerShell**:
```powershell
# Use .\ prefix
.\launchers\run-logger node --version
```

**CMD**:
```cmd
REM No prefix needed
launchers\run-logger node --version
```

### Issue: "Cannot be loaded because running scripts is disabled"

```powershell
# Set execution policy
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# Then try again
.\launchers\start-session.ps1
```

**OR use batch file instead**:
```cmd
launchers\start-session.bat
```

### Issue: Node.js not found

Install from: https://nodejs.org/

Then restart your terminal and try again.

### Issue: Logs not created

1. Check logs directory exists:
   ```powershell
   dir logs
   ```

2. If not, create it:
   ```powershell
   New-Item -ItemType Directory -Path logs
   ```

3. Run logger again

## ✅ Verification Checklist

- [ ] Node.js installed (v14+)
- [ ] Can navigate to terminal-logger directory
- [ ] Can see all files (src/, utils/, launchers/)
- [ ] `.\launchers\run-logger node --version` works
- [ ] `.\launchers\start-session` starts logged session
- [ ] Logs created in `logs/` directory
- [ ] Can view logs with `Get-Content`

## 🎓 Next Steps

1. ✅ Test both loggers (command wrapper & session)
2. ✅ Try logging your actual project commands
3. ✅ Set up real-time log monitoring
4. ✅ Deploy to your production projects
5. ✅ Customize log paths if needed

## 📞 Quick Reference

**Command Wrapper**:
```powershell
.\launchers\run-logger <your-command>
```

**Session Logger**:
```powershell
.\launchers\start-session
# work normally
exit
```

**View Logs**:
```powershell
Get-Content logs\session_*.log -Tail 50
```

**Real-time Monitoring**:
```powershell
Get-Content logs\session_*.log -Wait
```

---

**You're all set!** 🎉 Start logging your terminal now!
