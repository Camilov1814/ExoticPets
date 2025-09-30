# Cognito SECRET_HASH Error Fix

## 🚨 Error: "Client is configured with secret but SECRET_HASH was not received"

This error occurs because your Cognito App Client `64qm8hd96a17ftstq98a2opn81` is configured to use a client secret, but AWS Amplify v6 for web applications doesn't automatically handle SECRET_HASH calculation.

## ✅ **Solution 1: Disable Client Secret (Recommended)**

### Step 1: Go to AWS Cognito Console
1. Navigate to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Select your User Pool: `us-east-2_XYvLHdUiv`
3. Go to **"App integration"** tab
4. Click on your App Client: `64qm8hd96a17ftstq98a2opn81`

### Step 2: Edit App Client Settings
1. Click **"Edit"** button
2. Scroll down to **"Authentication flow configuration"**
3. Under **"App client secret"**, make sure it's set to **"Don't generate a secret"**
4. If it shows **"Generate a secret"**, change it to **"Don't generate a secret"**
5. Click **"Save changes"**

### Step 3: Update App Client (if needed)
If you can't modify the existing client, create a new one:
1. Click **"Create app client"**
2. App client name: `exotic-pets-client-no-secret`
3. **Authentication flows**:
   - ✅ ALLOW_USER_SRP_AUTH
   - ✅ ALLOW_REFRESH_TOKEN_AUTH
4. **App client secret**: Don't generate a secret
5. Click **"Create app client"**
6. Copy the new **App client ID**
7. Update your `.env` file with the new client ID

### Step 4: Update Your .env File (if new client)
```env
VITE_AWS_REGION=us-east-2
VITE_AWS_USER_POOL_ID=us-east-2_XYvLHdUiv
VITE_AWS_USER_POOL_CLIENT_ID=YOUR_NEW_CLIENT_ID_WITHOUT_SECRET
```

## 🔧 **Solution 2: Code-Based SECRET_HASH (Backup)**

If you must keep the client secret, you can implement SECRET_HASH calculation:

### Add Client Secret to Environment
```env
# Add to .env
VITE_AWS_USER_POOL_CLIENT_SECRET=your_client_secret_here
```

### Create SECRET_HASH Utility
```javascript
// utils/secretHash.js
import { createHmac } from 'crypto';

export const calculateSecretHash = (username, clientId, clientSecret) => {
  const message = username + clientId;
  const hmac = createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
};
```

**⚠️ IMPORTANT**: This approach requires exposing the client secret in your frontend code, which is **NOT RECOMMENDED** for security reasons.

## 🎯 **Recommended Approach**

**Use Solution 1** - Disable the client secret in your Cognito App Client. This is the standard approach for web applications and provides better security since client secrets can't be kept secret in frontend code.

## ✅ **After Fixing**

Once you've disabled the client secret:
1. Restart your development server
2. Try creating a new account
3. The SECRET_HASH error should be resolved
4. User registration and login should work normally

## 🚀 **Why This Happens**

- **Mobile/Native Apps**: Use client secrets for additional security
- **Web Applications**: Don't use client secrets (they can't be kept secret)
- **AWS Amplify**: Automatically detects the environment and handles accordingly
- **Your Setup**: Currently configured for mobile but being used for web

The fix aligns your Cognito configuration with web application best practices.