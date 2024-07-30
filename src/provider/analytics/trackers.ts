/**
 * Generates a unique analytics user ID.
 *
 * @returns {string} The generated user ID.
 */
export function generateUserId(): string {
  return `uid_${new Date().getTime()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

/**
 * Saves the user ID to the local storage.
 *
 * If the user ID is not already stored, it generates a new one and saves it.
 *
 * @returns The user ID.
 */
export function saveUserIdToLocalStorage(): string {
  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = generateUserId();
    localStorage.setItem("userId", userId);
  }

  return userId;
}
