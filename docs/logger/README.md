# Terminal Logger - Complete Project

A comprehensive Node.js terminal logging solution with two modes: command wrapper and persistent session logger.

## 📁 Project Structure

```
terminal-logger/
├── README.md                    # This file
├── package.json                 # NPM configuration
├── .gitignore                  # Git exclusions
│
├── launchers/                   # Easy-to-use launchers
│   ├── run-logger.bat          # Command wrapper (Windows)
│   ├── start-session.bat       # Session logger (Windows)
│   └── start-session.ps1       # Session logger (PowerShell)
│
├── src/                         # Main source code
│   ├── terminal-logger.js      # Command wrapper implementation
│   └── session-logger.js       # Persistent session logger
│
├── utils/                       # Utility modules
│   ├── logger.js               # Core logging engine
│   ├── file-handler.js         # File operations
│   └── timestamp.js            # Timestamp utilities
│
├── logs/                        # Log output (auto-created)
│   └── .gitkeep
│
└── docs/                        # Documentation
    ├── QUICK-START.md          # Quick start guide
    └── SESSION-LOGGER.md       # Session logger guide
```

## 🚀 Quick Start (3 Steps)

### Step 1: Navigate to Project

```powershell
cd C:\terminal-logger
```

### Step 2: Choose Your Mode

**Mode A: Wrap Single Commands**
```powershell
.\launchers\run-logger npm --version
```

**Mode B: Continuous Session (Recommended)**
```powershell
.\launchers\start-session

# Now work normally
npm install
.\run-frontend.ps1
npm start

# Exit when done
exit
```

### Step 3: View Logs

```powershell
Get-Content logs\session_*.log -Tail 50
```

## 📦 Installation

No installation needed! Just:

1. **Copy this folder** to your desired location
2. **Ensure Node.js** is installed (v14+)
3. **Run the launchers** as shown above

## 🎯 Two Logger Modes

### Mode 1: Command Wrapper (run-logger)

**Use when**: You want to log specific commands

```powershell
.\launchers\run-logger <your-command>
.\launchers\run-logger npm test
.\launchers\run-logger node app.js
```

**Output**: One log file per command

### Mode 2: Session Logger (start-session)

**Use when**: You want continuous logging of your entire work session

```powershell
.\launchers\start-session

# Everything captured automatically
PS> npm start
PS> node app.js
PS> .\run-frontend.ps1
PS> exit
```

**Output**: One continuous log file for entire session

## 📖 Documentation

- **[QUICK-START.md](docs/QUICK-START.md)** - Get started in 2 minutes
- **[SESSION-LOGGER.md](docs/SESSION-LOGGER.md)** - Detailed session logger guide
- **package.json** - NPM scripts and configuration

## 🎓 How It Works

### Command Wrapper Flow
```
You → run-logger npm install → terminal-logger.js → spawns npm install → captures output → saves to log
```

### Session Logger Flow
```
You → start-session → session-logger.js → spawns PowerShell → you work inside it → all output captured → exit → saves log
```

## 📂 Log Files

**Location**: `logs/`

**Format**: `session_YYYYMMDD_HHMMSS_mmm.log`

**Example**: `session_20260129_143022_456.log`

**Custom path**:
```powershell
$env:LOG_OUTPUT_PATH = "C:\MyLogs"
.\launchers\start-session
```

## 🛠️ NPM Scripts

```json
{
  "scripts": {
    "log": "node src/terminal-logger.js",
    "session": "node src/session-logger.js",
    "test": "node src/terminal-logger.js node --version"
  }
}
```

Usage:
```powershell
npm run log -- npm install
npm run session
npm test
```

## ⚙️ Configuration

**Environment Variables**:
- `LOG_OUTPUT_PATH` - Custom log directory

**Default Settings**:
- Flush interval: 2 seconds
- Buffer size: 50 lines
- Log formats: .log (readable) + .json (structured)

## 🎮 Usage Examples

### Example 1: Log npm Install
```powershell
.\launchers\run-logger npm install
# Check logs
Get-Content logs\session_*.log
```

### Example 2: Full Development Session
```powershell
# Start session logger
.\launchers\start-session

# Work normally
PS> cd my-project
PS> npm install
PS> npm start
# Server runs, all logs captured
PS> exit

# View complete session log
Get-Content logs\session_*.log
```

### Example 3: Real-time Monitoring
```powershell
# Terminal 1: Start session
.\launchers\start-session
PS> npm start

# Terminal 2: Watch logs
Get-Content logs\session_*.log -Wait -Tail 50
```

## 🔧 Troubleshooting

### PowerShell "Command not recognized"
Use `.\` prefix:
```powershell
.\launchers\start-session
```

### No Node.js
Install from: https://nodejs.org/

### Execution Policy Error
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Logs not updating
Wait 2 seconds for auto-flush or exit command.

## 📊 Features

- ✅ Real-time logging (2-second intervals)
- ✅ Two logging modes (command & session)
- ✅ No external dependencies
- ✅ Windows/Unix compatible
- ✅ Dual format logs (.log + .json)
- ✅ Configurable output path
- ✅ Auto-flush on exit
- ✅ Session tracking
- ✅ Error handling

## 🚚 Deployment

### Copy to Your Project

```powershell
# Copy entire folder
copy -Recurse terminal-logger C:\your-project\terminal-logger

# Use it
cd C:\your-project\terminal-logger
.\launchers\start-session
```

### Or Copy Just the Launchers

```powershell
copy terminal-logger\launchers\* C:\your-project\
copy terminal-logger\src\* C:\your-project\
copy terminal-logger\utils\* C:\your-project\utils\

# Use it
cd C:\your-project
.\start-session.bat
```

## 📝 License

ISC

## 👤 Author

Created for comprehensive terminal logging and debugging.

## 🔗 Quick Links

- Command Wrapper: `.\launchers\run-logger <command>`
- Session Logger: `.\launchers\start-session`
- Logs Directory: `logs/`
- Documentation: `docs/`

---

**Ready to use!** Just run the launchers and start logging. 🎉
