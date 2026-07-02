# Fixing the 401 Toast Error on Refresh

## Why did it happen?

When your React application first loads or when you refresh the page, `AppContext.jsx` automatically calls the `getauthState` function inside a `useEffect` hook. This function sends an API request to your backend at `/api/v1/auth/is-auth` to check if you are logged in.

If you are not logged in (because you haven't logged in yet, or your token expired), the backend correctly replies with a **401 Unauthorized** error.

By default, the `axios` library throws an exception whenever a request fails with an HTTP error code like 401. This exception was caught in the `catch` block of `getauthState`, which was programmed to display the error message in a UI toast:

```javascript
// Old code
} catch (error) {
    toast.error(error.message) // ❌ This caused "Request failed with status code 401" on refresh
}
```

## How was it fixed?

Failing the `is-auth` check is perfectly normal behavior—it just means the user shouldn't see authenticated pages. It is not an application error that requires a toast notification to the user.

To fix it, we modified the `catch` block so that it silently sets `isLoggedIn(false)` without triggering `toast.error()`.

```javascript
// Fixed code
} catch (error) {
    setIsLoggedIn(false);
    // ✅ No toast error shown; it just means the user is not logged in.
}
```

Now, when you refresh the page while logged out, the system checks your auth status, gets the 401, catches it silently, updates the state correctly, and you no longer see the annoying red toast notification!
