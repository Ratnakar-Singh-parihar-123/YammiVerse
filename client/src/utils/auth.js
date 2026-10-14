const TOKEN_KEY = "recipeHub-token";
const USER_KEY = "recipeHub-user";

export const getAuthToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  );
};

export const getAuthUser = () => {
  const raw =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse stored user:", err);
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getAuthToken());
};

export const setAuthSession = (token, user, rememberMe = true) => {
  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  // Clear from the other storage to prevent desync
  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);

  // Also remove legacy keys if any existed
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (token) {
    targetStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    targetStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Notify all listeners in the current window & other tabs
  window.dispatchEvent(new Event("auth-change"));
};

export const updateAuthUser = (updatedUser) => {
  if (!updatedUser) return;
  // If stored in localStorage, update localStorage; otherwise update sessionStorage
  if (localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  } else if (sessionStorage.getItem(USER_KEY)) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }
  window.dispatchEvent(new Event("auth-change"));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  // Clear any legacy keys
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("auth-change"));
};
