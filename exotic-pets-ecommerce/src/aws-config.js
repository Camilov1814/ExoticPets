// AWS Cognito Configuration
// Replace these values with your actual Cognito User Pool settings

const awsConfig = {
  Auth: {
    Cognito: {
      // REQUIRED - Amazon Cognito Region
      region: import.meta.env.VITE_AWS_REGION || 'us-east-2',

      // REQUIRED - Amazon Cognito User Pool ID
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,

      // REQUIRED - Amazon Cognito Web Client ID
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,

      // OPTIONAL - This is used for sign up verification method
      signUpVerificationMethod: 'code',

      loginWith: {
        // OPTIONAL - Enforce user authentication prior to accessing AWS resources
        email: true,
      }
    }
  }
};

export default awsConfig;