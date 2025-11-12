let authToken: string | null = null;
let currentUser: { username: string; email: string } | null = null;

export const authUtils = {
  setToken: (token: string, username: string = 'User', email: string = 'user@example.com') => {
    authToken = token;
    currentUser = { username, email };
  },
  getToken: () => authToken,
  clearToken: () => {
    authToken = null;
    currentUser = null;
  },
  isAuthenticated: () => !!authToken,
  getCurrentUser: () => currentUser,
};