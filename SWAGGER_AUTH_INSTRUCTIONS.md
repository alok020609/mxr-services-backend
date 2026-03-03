# How to Use Authorization in Swagger UI

## Step 1: Get Your Token
1. Use the `/api/v1/auth/login` endpoint
2. Enter your email and password
3. Copy the `token` value from the response (it's in `data.token`)

## Step 2: Authorize in Swagger UI
1. Look for the **"Authorize"** button at the top right of the Swagger UI page
2. Click the **"Authorize"** button
3. In the popup, you'll see "bearerAuth" with an input field
4. Enter your JWT token (just the token, without "Bearer " prefix)
5. Click **"Authorize"** to save
6. Click **"Close"** to close the popup

## Step 3: Test Authenticated Endpoints
Now all authenticated endpoints will automatically include your token in the Authorization header.

## Troubleshooting

If you don't see the "Authorize" button:
1. **Hard refresh** your browser (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
2. **Clear browser cache** and reload
3. Check the browser console for JavaScript errors (F12)
4. Make sure you're accessing `http://localhost:3000/api-docs`

The "Authorize" button should appear automatically when:
- Security schemes are defined (✓ we have bearerAuth)
- At least one endpoint uses security (✓ we have 237+ endpoints with security)

## Alternative: Manual Header
If the button still doesn't appear, you can manually add the Authorization header:
- Header name: `Authorization`
- Header value: `Bearer YOUR_TOKEN_HERE`

