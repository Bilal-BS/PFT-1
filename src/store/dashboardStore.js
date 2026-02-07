import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultLayout = {
  workspaces: [
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
            zIndex: 1,
            color: 'green-500'
          },
          {
            id: 'expense_overview',
            type: 'expense',
            title: 'Total Expenses',
            dock: 'left',
            width: 300,
            height: 180,
            x: 0,
            y: 190,
            collapsed: false,
            zIndex: 1,
            color: 'red-500'
          },
          {
            id: 'net_balance',
            type: 'balance',
            title: 'Net Balance',
            dock: 'left',
            width: 300,
            height: 180,
            x: 0,
            y: 380,
            collapsed: false,
            zIndex: 1,
            color: 'blue-500'
          },
          {
            id: 'bank_cash',
            type: 'bank',
            title: 'Cash + Bank Balance',
            dock: 'floating',
            width: 400,
            height: 200,
            x: 350,
            y: 100,
            collapsed: false,
            zIndex: 2,
            color: 'cyan-500'
          },
          {
            id: 'investment_summary',
            type: 'investment',
            title: 'Investment Summary',
            dock: 'floating',
            width: 400,
            height: 200,
            x: 800,
            y: 100,
            collapsed: false,
            zIndex: 2,
            color: 'purple-500'
          },
          {
            id: 'loans_overview',
            type: 'loans',
            title: 'Loan Given vs Collected',
            dock: 'floating',
            width: 400,
            height: 200,
            x: 350,
            y: 320,
            collapsed: false,
            zIndex: 2,
            color: 'yellow-500'
          },
          {
            id: 'recent_transactions',
            type: 'transactions',
            title: 'Recent Transactions',
            dock: 'floating',
            width: 600,
            height: 300,
            x: 800,
            y: 320,
            collapsed: false,
            zIndex: 2,
            color: 'indigo-500'
          },
          {
            id: 'expense_chart',
            type: 'chart',
            title: 'Expense by Category',
            dock: 'floating',
            width: 500,
            height: 300,
            x: 350,
            y: 540,
            collapsed: false,
            zIndex: 2,
            color: 'pink-500'
          },
          {
            id: 'income_vs_expense',
            type: 'chart',
            title: 'Income vs Expense',
            dock: 'floating',
            width: 500,
            height: 300,
            x: 880,
            y: 540,
            collapsed: false,
            zIndex: 2,
            color: 'blue-500'
          }
        ]
      }
    }
  ],
  currentWorkspaceId: 'default',
  selectedPanel: null,
  isDragging: false,
  snapToGrid: false,
  isBlueprintMode: false,
  aiCommands: []
};

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      workspaces: defaultLayout.workspaces,
      currentWorkspaceId: defaultLayout.currentWorkspaceId,
      selectedPanel: defaultLayout.selectedPanel,
      isDragging: defaultLayout.isDragging,
      snapToGrid: defaultLayout.snapToGrid,
      isBlueprintMode: defaultLayout.isBlueprintMode,
      aiCommands: defaultLayout.aiCommands,

      // Get current workspace
      getCurrentWorkspace: () => {
        const state = get();
        return state.workspaces.find(w => w.id === state.currentWorkspaceId);
      },

      // Get all panels in current workspace
      getPanels: () => {
        const workspace = get().getCurrentWorkspace();
        return workspace?.layout.panels || [];
      },

      // Create new workspace
      createWorkspace: (name) => {
        set((state) => ({
          workspaces: [
            ...state.workspaces,
            {
              id: `workspace_${Date.now()}`,
              name,
              isDefault: false,
              isEditable: true,
              layout: {
                theme: state.workspaces[0].layout.theme,
                panels: []
              }
            }
          ]
        }));
      },

      // Delete workspace
      deleteWorkspace: (workspaceId) => {
        if (workspaceId === 'default') return; // Cannot delete default workspace
        set((state) => ({
          workspaces: state.workspaces.filter(w => w.id !== workspaceId),
          currentWorkspaceId: state.currentWorkspaceId === workspaceId ? 'default' : state.currentWorkspaceId
        }));
      },

      // Rename workspace
      renameWorkspace: (workspaceId, newName) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === workspaceId ? { ...w, name: newName } : w
          )
        }));
      },

      // Switch workspace
      switchWorkspace: (workspaceId) => {
        set({ currentWorkspaceId: workspaceId });
      },

      // Duplicate workspace
      duplicateWorkspace: (workspaceId) => {
        const workspace = get().workspaces.find(w => w.id === workspaceId);
        if (!workspace) return;

        const newWorkspace = {
          id: `workspace_${Date.now()}`,
          name: `${workspace.name} (Copy)`,
          isDefault: false,
          isEditable: true,
          layout: JSON.parse(JSON.stringify(workspace.layout))
        };

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace]
        }));

        return newWorkspace.id;
      },

      // Add panel to workspace
      addPanel: (panel) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === state.currentWorkspaceId
              ? {
                ...w,
                layout: {
                  ...w.layout,
                  panels: [...w.layout.panels, panel]
                }
              }
              : w
          )
        }));
      },

      // Remove panel from workspace
      removePanel: (panelId) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === state.currentWorkspaceId
              ? {
                ...w,
                layout: {
                  ...w.layout,
                  panels: w.layout.panels.filter(p => p.id !== panelId)
                }
              }
              : w
          )
        }));
      },

      // Update panel position/size
      updatePanel: (panelId, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === state.currentWorkspaceId
              ? {
                ...w,
                layout: {
                  ...w.layout,
                  panels: w.layout.panels.map(p =>
                    p.id === panelId ? { ...p, ...updates } : p
                  )
                }
              }
              : w
          ),
          selectedPanel: panelId
        }));
      },

      // Select panel
      selectPanel: (panelId) => {
        set({ selectedPanel: panelId });
      },

      // Deselect panel
      deselectPanel: () => {
        set({ selectedPanel: null });
      },

      // Set dragging state
      setDragging: (isDragging) => {
        set({ isDragging });
      },

      // Toggle snap to grid
      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }));
      },

      // Reset workspace to default
      resetWorkspaceToDefault: () => {
        const defaultWorkspace = get().workspaces.find(w => w.id === 'default');
        if (!defaultWorkspace) return;

        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === state.currentWorkspaceId && w.id !== 'default'
              ? {
                ...w,
                layout: JSON.parse(JSON.stringify(defaultWorkspace.layout))
              }
              : w
          )
        }));
      },

      // Set theme
      setTheme: (theme) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === state.currentWorkspaceId
              ? {
                ...w,
                layout: {
                  ...w.layout,
                  theme
                }
              }
              : w
          )
        }));
      },

      // Toggle Blueprint Mode
      toggleBlueprintMode: () => {
        set((state) => ({ isBlueprintMode: !state.isBlueprintMode }));
      },

      // Add AI Command
      addAICommand: (command) => {
        set((state) => ({
          aiCommands: [...state.aiCommands, { ...command, timestamp: Date.now() }]
        }));
      },

      // Toggle Snap to Grid
      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }));
      }
    }),
    {
      name: 'dashboard-store'
    }
  )
);
