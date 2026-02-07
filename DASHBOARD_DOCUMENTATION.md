# 🎨 Customizable Dashboard System Documentation

## Overview

The customizable dashboard is a **Photoshop-style** workspace that allows users to:
- Create multiple custom dashboards (workspaces)
- Drag and drop widgets freely
- Resize and reposition panels
- Persist their layouts
- Switch between workspaces instantly
- Reset to default layouts

## 🏗️ Architecture

### File Structure

```
src/
├── components/
│   ├── Layout.jsx                    # Main layout wrapper
│   └── dashboard/
│       ├── TopBar.jsx                # Header with workspace selector
│       ├── LeftSidebar.jsx           # Tool panel with widget types
│       ├── CenterCanvas.jsx          # Main canvas workspace
│       ├── RightPanel.jsx            # Properties/inspector panel
│       ├── DraggablePanel.jsx        # Individual widget component
│       └── Widgets.jsx               # Widget implementations
├── pages/
│   └── CustomDashboard.jsx           # Page wrapper for dashboard
└── store/
    └── dashboardStore.js            # Zustand state management
```

## 📋 Key Features

### 1️⃣ **Workspace Management**
- **Create workspaces**: Users can create multiple custom dashboards
- **Switch workspaces**: Instantly switch between saved layouts
- **Duplicate workspaces**: Copy existing workspace configurations
- **Delete workspaces**: Remove custom workspaces (default cannot be deleted)
- **Rename workspaces**: Change workspace names anytime

### 2️⃣ **Panel System**
Panels can be:
- **Dragged**: Click header and drag to move
- **Resized**: Drag bottom-right corner to resize
- **Docked**: Set to left, right, bottom, or floating positions
- **Collapsed**: Minimize to show only title bar
- **Removed**: Delete panels from workspace
- **Selected**: Click to inspect and edit properties

### 3️⃣ **Widget Types**

Available widgets:
- 💰 **Income Panel**: Monthly income overview
- 💸 **Expense Panel**: Monthly expense tracking
- ⚖️ **Balance Panel**: Net balance display
- 🏦 **Bank Panel**: Cash + Bank balance
- 📈 **Investment Panel**: Investment performance
- 🏦 **Loans Panel**: Loan given vs collected
- 📋 **Transactions Panel**: Recent transaction list
- 📊 **Chart Panel**: Visual analytics
- 🔔 **Alerts Panel**: Notifications and reminders
- 🧠 **AI Insights Panel**: AI-powered suggestions

### 4️⃣ **Customization Features**

Properties that can be customized for each panel:
- **Title**: Panel name/label
- **Position**: X and Y coordinates
- **Size**: Width and height
- **Z-Index**: Stacking order
- **Dock Location**: Placement mode
- **Collapsed State**: Minimized/expanded

### 5️⃣ **State Management**

Using **Zustand** for state management:

```javascript
// Get current workspace
const workspace = useDashboardStore((state) => state.getCurrentWorkspace());

// Get all panels
const panels = useDashboardStore((state) => state.getPanels());

// Update a panel
const updatePanel = useDashboardStore((state) => state.updatePanel);
updatePanel(panelId, { x: 100, y: 50, width: 400 });

// Create workspace
const createWorkspace = useDashboardStore((state) => state.createWorkspace);
createWorkspace('My Custom Dashboard');

// Switch workspace
const switchWorkspace = useDashboardStore((state) => state.switchWorkspace);
switchWorkspace(workspaceId);
```

## 🎯 Default Workspace

The **Default Workspace** ("Main Finance") includes:
- 3 panels on the left sidebar (Income, Expenses, Balance)
- 6 floating panels with key metrics and charts
- Professional, optimized layout
- **Read-only** (cannot be edited, but can be duplicated)

### Default Layout Structure

```javascript
{
  id: 'default',
  name: 'Main Finance',
  isDefault: true,
  isEditable: false,
  layout: {
    theme: 'dark',
    panels: [
      {
        id: 'income_overview',
        type: 'income',
        title: 'Total Income',
        dock: 'left',
        width: 300,
        height: 180,
        x: 0,
        y: 0,
        collapsed: false,
        zIndex: 1
      },
      // ... more panels
    ]
  }
}
```

## 🎮 User Interactions

### Adding a Panel
1. **Method 1**: Click "+ Add" button in tool panel
2. **Method 2**: Drag tool icon from left sidebar to canvas
3. **Method 3**: Drop tool type onto the canvas area

### Moving a Panel
1. Click and hold the header (grip icon area)
2. Drag to desired position
3. Release to place

### Resizing a Panel
1. Position cursor on bottom-right corner (diagonal arrow appears)
2. Click and drag to resize
3. Minimum size: 250px × 150px

### Editing Panel Properties
1. Click any panel to select
2. Right panel shows properties
3. Edit title, position, size, z-index, dock location
4. Changes apply in real-time

### Removing a Panel
1. Select panel
2. Click X button in top-right corner
3. Confirm removal

### Collapsing a Panel
1. Click minimize icon in header
2. Panel collapses to title bar only
3. Click expand icon to restore

## 💾 Persistence

Layouts are automatically saved to browser's **localStorage**:
- Workspace names and configurations
- Panel positions, sizes, and states
- Theme preferences (light/dark)
- Active workspace selection

**Storage Key**: `dashboard-store`

```javascript
// Example stored data
{
  "workspaces": [...],
  "currentWorkspaceId": "default",
  "selectedPanel": null,
  "isDragging": false,
  "snapToGrid": false
}
```

## 🎨 Theming

Two themes supported:
- **Dark Mode** (default): Professional dark theme
- **Light Mode**: Clean light theme

Toggle via button in top bar. Theme preference is saved per workspace.

## 🔧 API Reference

### Store Actions

```javascript
const store = useDashboardStore();

// Workspace Operations
store.createWorkspace(name);                    // Create new workspace
store.deleteWorkspace(id);                      // Delete workspace (not default)
store.switchWorkspace(id);                      // Switch to workspace
store.renameWorkspace(id, newName);             // Rename workspace
store.duplicateWorkspace(id);                   // Duplicate workspace
store.resetWorkspaceToDefault();                // Reset to default layout

// Panel Operations
store.addPanel(panel);                          // Add new panel
store.removePanel(panelId);                     // Remove panel
store.updatePanel(panelId, updates);            // Update panel properties
store.selectPanel(panelId);                     // Select panel
store.deselectPanel();                          // Deselect panel

// Utilities
store.getCurrentWorkspace();                    // Get active workspace
store.getPanels();                              // Get panels from active workspace
store.setDragging(boolean);                     // Set dragging state
store.toggleSnapToGrid();                       // Toggle grid snapping
store.setTheme(theme);                          // Change theme
```

## 🎯 Use Cases

### Personal Finance View
- Income overview
- Expense tracking
- Recent transactions
- Category breakdown

### Investment Dashboard
- Investment summary
- Performance charts
- Profit/loss metrics
- Portfolio allocation

### Loans & Debt Management
- Outstanding loans
- Payment due dates
- Loan amount tracking
- Repayment schedule

### Admin Dashboard
- System KPIs
- User metrics
- Revenue tracking
- Error logs

## 🚀 Accessing the Dashboard

### Route
```
/dashboard/custom
```

### Navigation
From the main dashboard, users can:
1. Click "Dashboard" in navigation
2. Select "Custom Workspace" mode
3. Or access directly via `/dashboard/custom`

## 📱 Responsive Design

The dashboard is optimized for:
- **Desktop** (1920px+): Full layout with all features
- **Laptops** (1366px): Optimized spacing
- **Tablets** (768px): Stacked panels
- **Mobile** (< 768px): Simplified view (coming soon)

## 🔐 Role-Based Access Control

**Super Admin** can see:
- System-wide KPIs
- User activity
- Subscription metrics
- Error locations

**Admin** can see:
- Organization dashboards
- Team metrics
- Approval workflows

**User** can see:
- Personal finance only
- Their own dashboards

## 🛠️ Development Guide

### Adding a New Widget Type

1. **Create widget component** in `Widgets.jsx`:
```javascript
export const MyWidget = () => (
  <div className="h-full flex flex-col">
    {/* Your widget content */}
  </div>
);
```

2. **Add to widget mapper**:
```javascript
export const getWidget = (type, title) => {
  switch (type) {
    case 'my_widget':
      return <MyWidget />;
    // ...
  }
}
```

3. **Add to panel types** in `LeftSidebar.jsx`:
```javascript
const panelTypes = [
  // ...
  { id: 'my_widget', name: 'My Widget', icon: '📊' }
];
```

### Customizing Panel Styling

Edit `DraggablePanel.jsx` for panel appearance:
```javascript
className={`rounded-lg border shadow-lg flex flex-col overflow-hidden ${
  isDark 
    ? 'bg-gray-700 border-gray-600'
    : 'bg-white border-gray-300'
}`}
```

### Adding Default Panels

Modify `dashboardStore.js` in the `defaultLayout` object:
```javascript
panels: [
  {
    id: 'my_panel',
    type: 'my_widget',
    title: 'My Panel',
    // ... other properties
  }
]
```

## 📊 Data Structure

### Panel Object
```javascript
{
  id: string,              // Unique identifier
  type: string,            // Widget type (income, expense, etc.)
  title: string,           // Display name
  dock: string,            // 'left' | 'right' | 'bottom' | 'floating'
  width: number,           // Width in pixels
  height: number,          // Height in pixels
  x: number,              // Horizontal position (for floating only)
  y: number,              // Vertical position (for floating only)
  collapsed: boolean,      // Is minimized
  zIndex: number          // Stacking order
}
```

### Workspace Object
```javascript
{
  id: string,
  name: string,
  isDefault: boolean,
  isEditable: boolean,
  layout: {
    theme: 'light' | 'dark',
    panels: Panel[]
  }
}
```

## 🎓 Examples

### Duplicate Default and Customize
```javascript
const duplicateWorkspace = useDashboardStore((state) => state.duplicateWorkspace);
const newId = duplicateWorkspace('default');
// Now user can edit the duplicate without affecting default
```

### Create Empty Workspace
```javascript
const createWorkspace = useDashboardStore((state) => state.createWorkspace);
createWorkspace('My Custom View');
// Workspace created with no panels, user can add as needed
```

### Reset Custom Workspace
```javascript
const resetWorkspaceToDefault = useDashboardStore((state) => state.resetWorkspaceToDefault);
resetWorkspaceToDefault();
// Resets current workspace to default layout
```

## 🔄 Dashboard Workflow

```
1. User logs in → Default workspace is shown
2. User can:
   a. Customize current workspace
   b. Create new workspace
   c. Duplicate workspace
   d. Switch between workspaces
3. All changes are auto-saved to localStorage
4. On logout/login, last active workspace is restored
5. Can reset any custom workspace to default anytime
```

## ⚡ Performance Tips

- **Limit panels**: Keep under 15 panels for optimal performance
- **Avoid excessive z-index**: Use reasonable stacking order
- **Duplication**: Duplicate large workspaces instead of recreating from scratch
- **Reset unused**: Delete unnecessary workspaces to keep store lean

## 🐛 Troubleshooting

### Panels not saving
- Check localStorage is enabled in browser
- Clear browser cache and reload
- Check browser console for errors

### Panels overlapping oddly
- Manually adjust z-index in properties panel
- Reset workspace to default and rebuild

### Layout lost after refresh
- Ensure localStorage is not cleared
- Check if cookie settings block storage

### Dragging feels laggy
- Reduce number of panels
- Close other browser tabs
- Check browser performance

## 📝 Future Enhancements

- [ ] Column/grid-based layout system
- [ ] Widget resizing constraints
- [ ] Workspace sharing
- [ ] Layout templates
- [ ] Undo/redo system
- [ ] Keyboard shortcuts
- [ ] Mobile optimization
- [ ] Real-time data updates
- [ ] Custom widget builder
- [ ] Workspace versioning

## 🤝 Contributing

To add new features:
1. Create feature branch
2. Update store actions if needed
3. Create/modify components
4. Test thoroughly
5. Update documentation
6. Submit PR with screenshots/demo

---

**Current Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready
