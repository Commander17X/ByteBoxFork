import { NextRequest, NextResponse } from 'next/server'

// Persistent Tabs API endpoint
// Manages persistent tab state

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Import the persistent tabs service
    const { persistentTabs } = await import('../../../lib/persistent-tabs')

    switch (action) {
      case 'get_all_tabs':
        const tabs = persistentTabs.getAllTabs()
        return NextResponse.json({
          success: true,
          data: tabs
        })

      case 'get_active_tab':
        const activeTab = persistentTabs.getActiveTab()
        return NextResponse.json({
          success: true,
          data: activeTab
        })

      case 'get_tab':
        const tabId = searchParams.get('tabId')
        if (!tabId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID is required'
          }, { status: 400 })
        }

        const tab = persistentTabs.getTab(tabId)
        if (!tab) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: tab
        })

      case 'get_tabs_by_component':
        const component = searchParams.get('component')
        if (!component) {
          return NextResponse.json({
            success: false,
            error: 'Component is required'
          }, { status: 400 })
        }

        const componentTabs = persistentTabs.getTabsByComponent(component)
        return NextResponse.json({
          success: true,
          data: componentTabs
        })

      case 'get_tab_groups':
        const groups = persistentTabs.getAllTabGroups()
        return NextResponse.json({
          success: true,
          data: groups
        })

      case 'get_tab_group':
        const groupId = searchParams.get('groupId')
        if (!groupId) {
          return NextResponse.json({
            success: false,
            error: 'Group ID is required'
          }, { status: 400 })
        }

        const group = persistentTabs.getTabGroup(groupId)
        if (!group) {
          return NextResponse.json({
            success: false,
            error: 'Group not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: group
        })

      case 'get_tabs_in_group':
        const groupIdForTabs = searchParams.get('groupId')
        if (!groupIdForTabs) {
          return NextResponse.json({
            success: false,
            error: 'Group ID is required'
          }, { status: 400 })
        }

        const tabsInGroup = persistentTabs.getTabsInGroup(groupIdForTabs)
        return NextResponse.json({
          success: true,
          data: tabsInGroup
        })

      case 'get_stats':
        const stats = persistentTabs.getStats()
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'export_tabs':
        const exportData = persistentTabs.exportTabs()
        return NextResponse.json({
          success: true,
          data: { exportData }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Persistent tabs GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    // Import the persistent tabs service
    const { persistentTabs } = await import('../../../lib/persistent-tabs')

    switch (action) {
      case 'create_tab':
        const { title, url, component, favicon, isPinned, metadata } = data

        if (!title || !url || !component) {
          return NextResponse.json({
            success: false,
            error: 'Title, URL, and component are required'
          }, { status: 400 })
        }

        const tabId = persistentTabs.createTab({
          title,
          url,
          component,
          favicon,
          isPinned,
          metadata
        })

        return NextResponse.json({
          success: true,
          data: { tabId }
        })

      case 'close_tab':
        const { tabId: closeTabId } = data

        if (!closeTabId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID is required'
          }, { status: 400 })
        }

        const closed = persistentTabs.closeTab(closeTabId)
        if (!closed) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or could not be closed'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab closed successfully'
        })

      case 'set_active_tab':
        const { tabId: activeTabId } = data

        if (!activeTabId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID is required'
          }, { status: 400 })
        }

        const activated = persistentTabs.setActiveTab(activeTabId)
        if (!activated) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or could not be activated'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab activated successfully'
        })

      case 'update_tab':
        const { tabId: updateTabId, updates } = data

        if (!updateTabId || !updates) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID and updates are required'
          }, { status: 400 })
        }

        const updated = persistentTabs.updateTab(updateTabId, updates)
        if (!updated) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or could not be updated'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab updated successfully'
        })

      case 'toggle_pin_tab':
        const { tabId: pinTabId } = data

        if (!pinTabId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID is required'
          }, { status: 400 })
        }

        const pinned = persistentTabs.togglePinTab(pinTabId)
        if (!pinned) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or could not be pinned/unpinned'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab pin status toggled successfully'
        })

      case 'create_tab_group':
        const { name, tabIds, color } = data

        if (!name) {
          return NextResponse.json({
            success: false,
            error: 'Group name is required'
          }, { status: 400 })
        }

        const groupId = persistentTabs.createTabGroup(name, tabIds || [], color)
        return NextResponse.json({
          success: true,
          data: { groupId }
        })

      case 'add_tab_to_group':
        const { tabId: addTabId, groupId: addGroupId } = data

        if (!addTabId || !addGroupId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID and Group ID are required'
          }, { status: 400 })
        }

        const added = persistentTabs.addTabToGroup(addTabId, addGroupId)
        if (!added) {
          return NextResponse.json({
            success: false,
            error: 'Tab or group not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab added to group successfully'
        })

      case 'remove_tab_from_group':
        const { tabId: removeTabId, groupId: removeGroupId } = data

        if (!removeTabId || !removeGroupId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID and Group ID are required'
          }, { status: 400 })
        }

        const removed = persistentTabs.removeTabFromGroup(removeTabId, removeGroupId)
        if (!removed) {
          return NextResponse.json({
            success: false,
            error: 'Tab or group not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab removed from group successfully'
        })

      case 'save_tab_state':
        const { tabId: stateTabId, state } = data

        if (!stateTabId || !state) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID and state are required'
          }, { status: 400 })
        }

        const saved = persistentTabs.saveTabState(stateTabId, state)
        if (!saved) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or state could not be saved'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab state saved successfully'
        })

      case 'duplicate_tab':
        const { tabId: duplicateTabId } = data

        if (!duplicateTabId) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID is required'
          }, { status: 400 })
        }

        const newTabId = persistentTabs.duplicateTab(duplicateTabId)
        if (!newTabId) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or could not be duplicated'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: { newTabId }
        })

      case 'move_tab':
        const { tabId: moveTabId, newIndex } = data

        if (!moveTabId || newIndex === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Tab ID and new index are required'
          }, { status: 400 })
        }

        const moved = persistentTabs.moveTab(moveTabId, newIndex)
        if (!moved) {
          return NextResponse.json({
            success: false,
            error: 'Tab not found or could not be moved'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tab moved successfully'
        })

      case 'cleanup_old_tabs':
        const { maxAge } = data
        const cleanedCount = persistentTabs.cleanupOldTabs(maxAge)
        return NextResponse.json({
          success: true,
          data: { cleanedCount }
        })

      case 'import_tabs':
        const { jsonData } = data

        if (!jsonData) {
          return NextResponse.json({
            success: false,
            error: 'JSON data is required'
          }, { status: 400 })
        }

        const imported = persistentTabs.importTabs(jsonData)
        if (!imported) {
          return NextResponse.json({
            success: false,
            error: 'Failed to import tabs data'
          }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          message: 'Tabs imported successfully'
        })

      case 'initialize':
        persistentTabs.initialize()
        return NextResponse.json({
          success: true,
          message: 'Persistent tabs initialized'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Persistent tabs POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
