# 🦞 Tamagotchi Lobster - Feature Showcase

## 🎨 Visual Features

### Pixel Art Lobster Character
- **5 Animation States**:
  - 😴 **Sleeping** - Closed eyes, lying down, Z's floating up (late night/idle)
  - 🧍 **Idle** - Gentle floating animation, relaxed pose
  - 🚶 **Walking** - Alternating leg movement, slight body bounce (2 frames)
  - 😊 **Happy** - Brighter colors, raised claws, gentle waving
  - 🎉 **Excited** - Bouncing animation, wide eyes, claws up high

### Ocean-Themed UI
- **Gradient Background**: Deep ocean blue fading from light to dark
- **Animated Waves**: Three layers of translucent waves moving at different speeds
- **Floating Bubbles**: 15 bubbles rising from bottom to top with random timing
- **Pixel-Perfect Rendering**: Crisp 8-bit/16-bit style graphics

### Responsive Design
- **Desktop Layout**: Side-by-side lobster and dashboard
- **Tablet/Mobile**: Stacked vertical layout
- **Small Screens**: Optimized for Raspberry Pi HDMI monitors
- **Adaptive Text**: Readable at all sizes

## 🎮 Interactive Features

### Pet the Lobster
- **Click Response**: Lobster bounces and shows excitement
- **Floating Hearts**: ❤️ hearts appear and float upward
- **Mood Change**: Temporarily switches to "excited" mood
- **Counter**: Tracks how many times you've petted Mardy

### Feed & Cleanup Button
- **System Cleanup**: Runs `apt-get clean` and journal vacuum
- **Health Boost**: Increases health bar by 10%
- **Visual Feedback**: Lobster reacts happily
- **Permission Handling**: Gracefully handles sudo requirements

### Settings Panel
- **Future Customization**: Placeholder for upcoming features
- **Modal Design**: Clean overlay with close button
- **Planned Features**:
  - Choose different creatures (crab, octopus, fish)
  - Custom color themes
  - Animation speed control
  - Sound effects toggle

## 📊 Real-Time Monitoring

### System Health Panel
- **CPU Usage**: Live percentage with color coding
- **Memory Usage**: Real-time RAM consumption
- **Temperature**: Raspberry Pi thermal monitoring
- **Auto-Update**: Refreshes every 5 seconds

### Wallet Balance Panel
- **ETH Balance**: Ethereum holdings with 4 decimal precision
- **USDC Balance**: Stablecoin amount
- **VIRTUAL Tokens**: ACP token balance
- **Gold Accents**: Special styling for financial data

### Activity Statistics
- **Active Sessions**: Number of concurrent OpenClaw sessions
- **Tasks Completed**: Cumulative task counter
- **Pet Count**: How many times Mardy has been petted
- **Color-Coded Values**: Important metrics highlighted

### API Usage Tracking
- **Daily Call Count**: Total API requests today
- **Tokens Used**: Token consumption with thousand separator
- **Average Response Time**: Performance metric in milliseconds
- **Rate Limiting**: Future support for quota visualization

### Health Bar
- **Visual Indicator**: 0-100% with smooth animation
- **Color Gradient**:
  - 🟢 Green (70-100%): Healthy
  - 🟡 Yellow (40-70%): Moderate
  - 🔴 Red (0-40%): Needs attention
- **Dynamic Calculation**: Based on wallet + system resources
- **Status Messages**: Contextual feedback ("Feeling great!", etc.)

## 🔌 Technical Features

### WebSocket Connection
- **Real-Time Updates**: Data pushed from server every 5 seconds
- **Connection Status**: Visual indicator (green dot = connected)
- **Auto-Reconnect**: Attempts to reconnect after 3 seconds on disconnect
- **Heartbeat**: Keeps connection alive
- **Error Handling**: Graceful fallback for connection issues

### State Management
- **React Hooks**: Modern functional component approach
- **Local State**: Per-component state for animations
- **Derived State**: Mood calculated from system metrics
- **Persistent Counters**: Pet count maintained during session

### Performance Optimizations
- **Efficient Re-renders**: Only update when data changes
- **CSS Animations**: Hardware-accelerated transforms
- **Lazy Loading**: Components load on demand
- **Optimized Images**: SVG for scalability
- **Minimal Bundle**: ~150KB JavaScript

### Server Architecture
- **Express.js**: Fast, minimal web framework
- **WebSocket Server**: Bidirectional communication
- **Async Operations**: Non-blocking system calls
- **Error Recovery**: Graceful handling of failed commands
- **CORS Support**: Cross-origin resource sharing ready

## 🧠 Smart Mood System

### Automatic Mood Detection

**Sleeping** (😴):
- Triggers between 10 PM - 6 AM
- Low or zero active sessions
- Gentle floating, darker colors
- Z's animation

**Idle** (🧍):
- Default daytime state
- Low CPU usage (<80%)
- Moderate system resources
- Relaxed floating animation

**Happy** (😊):
- Moderate activity (1-2 sessions)
- System resources healthy
- Recent task completions
- Gentle waving motion

**Excited** (🎉):
- High activity (3+ sessions)
- User interaction (petting)
- System cleanup completed
- Fast bouncing animation

**Busy** (🚶):
- High CPU usage (>80%)
- High memory usage (>90%)
- Multiple concurrent operations
- Fast walking animation

### Health Formula

```javascript
Health = WalletHealth + CPUHealth + MemoryHealth

WalletHealth = hasBalance ? 30 : 10
CPUHealth = ((100 - cpuUsage) / 100) * 35
MemoryHealth = ((100 - memUsage) / 100) * 35

Total = 0-100%
```

## 🎯 Future Enhancements

### Planned Features
- [ ] **Sound Effects**: Cute sounds for interactions
- [ ] **Voice Lines**: Text-to-speech for Mardy
- [ ] **Achievements**: Unlock badges and rewards
- [ ] **Mini-Games**: Play with your pet
- [ ] **Historical Charts**: Track health over time
- [ ] **Multiple Pets**: Switch between creatures
- [ ] **Seasonal Themes**: Holiday decorations
- [ ] **Social Features**: Share your pet's status
- [ ] **Mobile App**: Native iOS/Android version
- [ ] **Voice Commands**: "Hey Mardy" integration
- [ ] **AI Personality**: Chat with your pet
- [ ] **Widget Mode**: Compact view for desktop

### Community Ideas
- Custom sprite packs
- Theme marketplace
- Pet breeding (combine traits)
- Evolution system
- Pet battles (friendly competition)
- Time capsule memories
- Photo booth for screenshots
- Integration with other skills

## 📱 Platform Support

### Tested On
- ✅ Raspberry Pi 4/5 (Primary target)
- ✅ Desktop browsers (Chrome, Firefox, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome)
- ✅ Small HDMI monitors (7-10 inch)

### Browser Compatibility
- ✅ Modern browsers (ES6+)
- ✅ WebSocket support required
- ✅ SVG rendering
- ✅ CSS Grid and Flexbox
- ⚠️ No IE11 support (by design)

## 🔐 Security Features

- **No Sensitive Data**: Wallet addresses not displayed
- **Sudo Isolation**: Cleanup commands properly sandboxed
- **CORS Ready**: Cross-origin protection
- **Input Validation**: All user inputs sanitized
- **Error Handling**: No stack traces exposed
- **Local First**: All data stays on device

## ♿ Accessibility

- **Keyboard Navigation**: Tab through interactive elements
- **High Contrast**: Readable colors
- **Motion Reduction**: Respects prefers-reduced-motion
- **Screen Reader**: Semantic HTML structure
- **Focus Indicators**: Clear focus states
- **ARIA Labels**: Proper labeling for assistive tech

---

**Built with ❤️ for the OpenClaw community!**
