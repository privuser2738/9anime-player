# 9Anime Player - Verbose Logging System

## Overview

The 9Anime Player extension now includes a comprehensive verbose logging system that runs in the background and captures all extension activity in a detailed text log.

## Features

### What Gets Logged

The logging system captures:

1. **User Interactions**
   - Button clicks (play, pause, next, previous)
   - Checkbox toggles (autoplay, loop, auto-jump)
   - Genre selections
   - Episode selections

2. **API/Network Calls**
   - Genre page fetches
   - Response status and timing
   - Failed requests with error details

3. **State Changes**
   - Extension state updates
   - Player settings modifications
   - Storage operations

4. **Performance Metrics**
   - Episode extraction timing
   - API call durations
   - Memory usage (when available)

5. **Video Events**
   - Video ended events
   - Episode completions
   - Series completions

6. **Navigation**
   - Page loads
   - Episode transitions
   - Auto-jump navigations

7. **Errors**
   - All exceptions with stack traces
   - Failed operations
   - Invalid states

## Using the Logger

### Enable/Disable Logging

1. Click the extension icon to open the popup
2. Scroll to the "📝 Verbose Logging" section
3. Check/uncheck "Enable verbose logging"

### View Log Statistics

The popup displays real-time statistics:
- Total number of log entries
- Time of first and last log
- Breakdown by category (USER_INTERACTION, API_CALL, etc.)

Statistics refresh every 3 seconds while the popup is open.

### Export Logs

#### Export as Text File
1. Click "Export Logs (Text)" button
2. A `.txt` file will download with human-readable format
3. Each log entry includes:
   - Timestamp
   - Category
   - Message
   - Session ID
   - URL
   - Detailed data (JSON format)

#### Export as JSON
1. Click "Export Logs (JSON)" button
2. A `.json` file will download with structured data
3. Includes:
   - All log entries
   - Statistics
   - Export metadata

### Clear Logs

1. Click "Clear All Logs" button
2. Confirm the action
3. All logs will be permanently deleted

## Log Structure

Each log entry contains:

```javascript
{
  timestamp: "2025-11-15T12:34:56.789Z",
  sessionId: "session_1234567890_abc123",
  category: "USER_INTERACTION",
  message: "Episode selected",
  data: {
    episodeIndex: 5,
    episodeTitle: "Episode 5",
    episodeUrl: "https://..."
  },
  url: "https://9animetv.to/watch/anime-name?ep=123",
  userAgent: "Mozilla/5.0..."
}
```

## Log Categories

- `USER_INTERACTION` - User clicks, inputs, selections
- `API_CALL` - Network requests and responses
- `STATE_CHANGE` - Extension state modifications
- `PERFORMANCE` - Timing and resource usage metrics
- `ERROR` - Exceptions and failures
- `NAVIGATION` - Page transitions
- `VIDEO_EVENT` - Video playback events
- `STORAGE` - Browser storage operations
- `SYSTEM` - Extension lifecycle events

## Storage

- Logs are stored in browser.storage.local
- Maximum of 5,000 log entries (oldest are removed first)
- Logs are saved every 10 entries automatically
- Logs persist across browser sessions
- Each session gets a unique session ID

## Performance Impact

The logging system is designed to be lightweight:
- Logs are batched (saved every 10 entries)
- Old logs are automatically pruned
- Logging can be disabled without reloading the extension
- Minimal performance overhead (<1ms per log entry)

## Use Cases

1. **Debugging** - Track down issues with episode transitions or auto-jump
2. **Usage Analysis** - Understand viewing patterns and preferences
3. **Performance Monitoring** - Identify slow API calls or operations
4. **Error Tracking** - Capture and diagnose errors with full context
5. **Feature Development** - Test new features with detailed logging

## Privacy

- All logs are stored locally in your browser
- Logs are never transmitted to external servers
- You have full control over log export and deletion
- Logs contain URLs and viewing data - handle exports accordingly

## Troubleshooting

**Logs not appearing?**
- Check that logging is enabled in the popup
- Verify the extension is active on the current page
- Check browser console for errors

**Export not working?**
- Ensure popup blockers allow downloads
- Check browser download settings
- Try exporting in a different format (text vs JSON)

**Stats showing 0 entries?**
- Logging may be disabled
- Extension may not have loaded yet
- Try refreshing the page

## Technical Details

- Logger class: `VerboseLogger` (logger.js:1)
- Background integration: background.js:16-30
- Content integration: content.js:3-14
- UI controls: popup.html:121-131, popup.js:78-211

## File Locations

- Logger module: `logger.js`
- Background integration: `background.js`
- Content integration: `content.js`
- UI: `popup.html`, `popup.js`
- This guide: `LOGGING-GUIDE.md`
