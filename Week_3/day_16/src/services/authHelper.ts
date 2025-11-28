let authToken: string | null = null;

export const authHelper = {
  setToken: (token: string) => {
    authToken = token;
  },
  
  getToken: (): string | null => {
    return authToken;
  },
  
  clearToken: () => {
    authToken = null;
  }
};