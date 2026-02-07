# ⚡ Quick Reference - Customizable Dashboard

## 🎯 One-Minute Overview

**What**: Drag-and-drop dashboard system (like Photoshop)  
**Where**: `/dashboard/custom` route  
**How**: Drag widgets from left sidebar onto canvas  
**Persistence**: Auto-saves to localStorage  

---

## 🚀 Quick Start

```bash
# Dashboard is live!
# Just navigate to: /dashboard/custom
# No additional setup needed
```

---

## 📋 Component Locations

| Component | Path | Purpose |
|-----------|------|---------|
| Layout | `components/Layout.jsx` | Main wrapper |
| TopBar | `components/dashboard/TopBar.jsx` | Header |
| LeftSidebar | `components/dashboard/LeftSidebar.jsx` | Tools |
| Canvas | `components/dashboard/CenterCanvas.jsx` | Main area |
| Panel | `components/dashboard/DraggablePanel.jsx` | Widget |
| Properties | `components/dashboard/RightPanel.jsx` | Inspector |
| Widgets | `components/dashboard/Widgets.jsx` | Widget impl |
| Store | `store/dashboardStore.js` | State |
| Page | `pages/CustomDashboard.jsx` | Route page |

---

## 🎛️ Store Actions

```javascript
import { useDashboardStore } from '@/store/dashboardStore';

const store = useDashboardStore();

// Workspaces
store.createWorkspace(name);
store.switchWorkspace(id);
store.deleteWorkspace(id);
store.duplicateWorkspace(id);
store.renameWorkspace(id, newName);
store.resetWorkspaceToDefault();

// Panels
store.addPanel(panel);
store.removePanel(panelId);
store.updatePanel(panelId, updates);
store.selectPanel(panelId);
store.deselectPanel();

// Utilities
store.getCurrentWorkspace();
store.getPanels();
store.setTheme(theme);
store.setDragging(boolean);
store.toggleSnapToGrid();
```

---

## 📊 Widget Types

| Type | Icon | ID |
|------|------|-----|
| Income | 💰 | `income` |
| Expense | 💸 | `expense` |
| Balance | ⚖️ | `balance` |
| Bank | 🏦 | `bank` |
| Investment | 📈 | `investment` |
| Loans | 🏦 | `loans` |
| Transactions | 📋 | `transactions` |
| Chart | 📊 | `chart` |
| Alerts | 🔔 | `alerts` |
| AI Insights | 🧠 | `ai_insights` |

---

## 🎨 Adding a New Widget

### Step 1: Create Widget
```javascript
// In Widgets.jsx
export const MyWidget = () => (
  <div className="h-full flex flex-col">
    <p>My custom widget content</p>
  </div>
);
```

### Step 2: Add to Mapper
```javascript
export const getWidget = (type, title) => {
  switch (type) {
    case 'my_widget':
      return <MyWidget />;
    // ... rest
  }
};
```

### Step 3: Add to Sidebar
```javascript
// In LeftSidebar.jsx
const panelTypes = [
  // ... existing
  { id: 'my_widget', name: 'My Widget', icon: '🎯' }
];
```

Done! Widget is now available to drag/drop.

---

## 📝 Panel Object Structure

```javascript
{
  id: 'income_1234567890',           // Unique ID
  type: 'income',                    // Widget type
  title: 'Total Income',             // Display title
  dock: 'floating',                  // Position: floating|left|right|bottom
  width: 400,                        // Width in px
  height: 200,                       // Height in px
  x: 350,                           // X position (floating only)
  y: 100,                           // Y position (floating only)
  collapsed: false,                  // Is minimized
  zIndex: 2                         // Stacking order
}
```

---

## 💾 Persistence

Automatically saved to:
- **Key**: `dashboard-store`
- **Type**: localStorage
- **Size**: ~50KB per workspace
- **When**: After every change

No extra code needed - Zustand handles it!

---

## 🎯 Common Tasks

### Get Current Panels
```javascript
const panels = useDashboardStore(state => state.getPanels());
```

### Update Panel Position
```javascript
const updatePanel = useDashboardStore(state => state.updatePanel);
updatePanel(panelId, { x: 100, y: 50 });
```

### Create Workspace
```javascript
const createWorkspace = useDashboardStore(state => state.createWorkspace);
createWorkspace('My Dashboard');
```

### Switch Theme
```javascript
const setTheme = useDashboardStore(state => state.setTheme);
setTheme('light'); // or 'dark'
```

### Select Panel for Editing
```javascript
const selectPanel = useDashboardStore(state => state.selectPanel);
selectPanel(panelId);
```

---

## 🎮 User Interactions

| Action | How To | Result |
|--------|--------|--------|
| Add Panel | Click/drag from sidebar | Panel appears on canvas |
| Move Panel | Drag header | Panel repositions |
| Resize | Drag bottom-right | Panel resizes |
| Collapse | Click minimize icon | Panel minimizes |
| Delete | Click X button | Panel removed |
| Select | Click panel | Shows properties |
| Theme | Click theme button | Switches light/dark |
| Create Workspace | Enter name in dropdown | New workspace created |
| Switch Workspace | Click dropdown menu | Workspace changes |

---

## 🔍 Debugging

### Check State in Console
```javascript
// In browser console
window.__ZUSTAND_DEVTOOLS_LOG__ = true;
// Clear and check localStorage
localStorage.removeItem('dashboard-store');
location.reload();
```

### Reset Everything
```javascript
localStorage.clear();
location.reload();
```

### View Current Panels
```javascript
const { getState } = useDashboardStore;
console.log(getState().getPanels());
```

---

## 🚀 Performance Tips

- Keep < 15 panels in workspace
- Don't use extreme z-index values
- Use default layout as template
- Duplicate for similar layouts
- Reset unused workspaces

---

## 📚 File Dependencies

```
Layout.jsx
├── TopBar.jsx
│   └── useDashboardStore
├── LeftSidebar.jsx
│   └── useDashboardStore
├── CenterCanvas.jsx
│   ├── DraggablePanel.jsx
│   │   ├── Widgets.jsx (getWidget)
│   │   └── useDashboardStore
│   └── useDashboardStore
└── RightPanel.jsx
    └── useDashboardStore
```

---

## 🎓 Example: Custom Panel with Real Data

```javascript
// 1. Create widget
export const MyDataWidget = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/my-data').then(r => r.json()).then(setData);
  }, []);

  return (
    <div>
      <h3>My Data: {data?.value}</h3>
    </div>
  );
};

// 2. Add to mapper
case 'my_data':
  return <MyDataWidget />;

// 3. Add to sidebar
{ id: 'my_data', name: 'My Data', icon: '📊' }

// Done! Now users can drag/drop it
```

---

## 🌐 Route Structure

```
/dashboard/custom          ← Main dashboard
/dashboard                ← Original dashboard (fallback)
/                         ← Home
```

---

## 🎨 Theme Variables

```javascript
// Dark Mode (default)
bg: #0f172a  (gray-950)
border: #374151  (gray-700)
text: #e5e7eb  (gray-200)
primary: #3b82f6  (blue-500)

// Light Mode
bg: #ffffff
border: #d1d5db  (gray-300)
text: #111827  (gray-900)
primary: #2563eb  (blue-600)
```

All handled by TailwindCSS conditional classes!

---

## ✨ Key Features Recap

✅ Drag & drop widgets  
✅ Resize panels (min 250×150)  
✅ Light/dark theme  
✅ Multiple workspaces  
✅ Auto-persist to localStorage  
✅ Default + custom layouts  
✅ Real-time property editing  
✅ Collapse/expand panels  
✅ Delete unwanted panels  
✅ Professional UI/UX  

---

## 📞 Need Help?

1. Check `DASHBOARD_DOCUMENTATION.md` for detailed guide
2. Check `DASHBOARD_IMPLEMENTATION.md` for architecture
3. View component files - well-commented code
4. Check browser console for errors
5. Try resetting localStorage: `localStorage.clear()`

---

## 🎉 You're All Set!

The dashboard is **production-ready** and **fully customizable**. 

Go to `/dashboard/custom` and start building! 🚀

---

**Version**: 1.0.0 | **Status**: ✅ Live | **Updated**: Feb 2026
