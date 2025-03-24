// authUtils.js

export const checkAuth = () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Якщо немає обох токенів
      if (!accessToken && !refreshToken) {
        return false;
      }
  
      const decodeToken = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
      };
  
      // Перевіряємо access token
      if (accessToken) {
        const accessPayload = decodeToken(accessToken);
        if (accessPayload.exp * 1000 > Date.now()) {
          return true; // Access token ще валідний
        }
      }
  
      // Якщо access token протермінований або відсутній, перевіряємо refresh token
      if (refreshToken) {
        const refreshPayload = decodeToken(refreshToken);
        if (refreshPayload.exp * 1000 > Date.now()) {
          // Refresh token валідний, можна оновити access token
          return 'refresh'; // Спеціальний статус, що потрібно оновити access token
        }
      }
  
      // Обидва токени протерміновані
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    } catch {
      return false;
    }
  };