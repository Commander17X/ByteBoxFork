// Shared waitlist data store
// In production, this would be replaced with a proper database

export interface WaitlistUser {
  id: string
  email: string
  joinedAt: string
  status: 'waiting' | 'beta' | 'removed'
  position: number
  notes?: string
}

class WaitlistStore {
  private users: WaitlistUser[] = []

  // Add a new user to the waitlist
  addUser(email: string): WaitlistUser {
    // Check if email already exists
    const existingUser = this.users.find(user => user.email === email)
    if (existingUser) {
      throw new Error('Email already exists in waitlist')
    }

    const newUser: WaitlistUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
      position: this.users.filter(u => u.status === 'waiting').length + 1
    }

    this.users.push(newUser)
    return newUser
  }

  // Get all users
  getAllUsers(): WaitlistUser[] {
    return [...this.users]
  }

  // Get users by status
  getUsersByStatus(status: 'waiting' | 'beta' | 'removed' | 'all'): WaitlistUser[] {
    if (status === 'all') {
      return [...this.users]
    }
    return this.users.filter(user => user.status === status)
  }

  // Get user by ID
  getUserById(id: string): WaitlistUser | undefined {
    return this.users.find(user => user.id === id)
  }

  // Get users by IDs
  getUsersByIds(ids: string[]): WaitlistUser[] {
    return this.users.filter(user => ids.includes(user.id))
  }

  // Update user status
  updateUserStatus(id: string, status: 'waiting' | 'beta' | 'removed'): WaitlistUser | null {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return null
    }

    this.users[userIndex].status = status
    return this.users[userIndex]
  }

  // Get statistics
  getStats() {
    return {
      total: this.users.length,
      waiting: this.users.filter(u => u.status === 'waiting').length,
      beta: this.users.filter(u => u.status === 'beta').length,
      removed: this.users.filter(u => u.status === 'removed').length
    }
  }

  // Get user emails for email composer
  getUserEmails(userIds?: string[], status?: string): Array<{ id: string; email: string; status: string }> {
    let filteredUsers = this.users

    // Filter by user IDs if provided
    if (userIds && userIds.length > 0) {
      filteredUsers = filteredUsers.filter(user => userIds.includes(user.id))
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    return filteredUsers.map(user => ({
      id: user.id,
      email: user.email,
      status: user.status
    }))
  }
}

// Export singleton instance
export const waitlistStore = new WaitlistStore()
