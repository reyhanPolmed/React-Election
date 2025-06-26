export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  ELECTIONS: {
    ALL: "/admin/elections",
    ACTIVE: "/elections/active",
    BY_ID: (id) => `/elections/${id}`,
    RESULTS: (id) => `/admin/elections/${id}/results`,
    UPDATE_STATUS: (id) => `/admin/elections/${id}/status`,
  },
  CANDIDATES: {
    BY_ELECTION: (electionId) => `/candidates/election/${electionId}`,
    BY_ID: (id) => `/candidates/${id}`,
    CREATE: "/candidates",
    UPDATE: (id) => `/candidates/${id}`,
    DELETE: (id) => `/candidates/${id}`,
  },
  VOTES: {
    CAST: "/votes",
    STATUS: (electionId) => `/votes/status/${electionId}`,
    VERIFY: (hash) => `/votes/verify/${hash}`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    VERIFY_USER: (userId) => `/admin/users/${userId}/verify`,
    ANALYTICS: "/admin/analytics/voting",
  },
}

export const ELECTION_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
}

export const USER_ROLES = {
  VOTER: "voter",
  ADMIN: "admin",
}

export const VOTE_STATUS = {
  NOT_VOTED: "not_voted",
  VOTED: "voted",
}
