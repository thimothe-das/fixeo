# AWS S3 Setup for Photo Uploads

This guide will help you set up AWS S3 for photo uploads in your Fixéo application.

## Step 1: Create an AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Create an account if you don't have one
3. Sign in to the AWS Console

## Step 2: Create an S3 Bucket
1. Navigate to **S3** service in AWS Console
2. Click **Create bucket**
3. Choose a unique bucket name (e.g., `fixeo-photos-your-name`)
4. Select a region (e.g., `us-east-1`)
5. **Object Ownership**: Keep "ACLs disabled (recommended)" - this is the default
6. **Block Public Access**: Uncheck "Block all public access" (we need public read access for images)
7. Acknowledge the warning about public access
8. Click **Create bucket**

## Step 3: Configure Bucket Policy
1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy** and click **Edit**
3. Add this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

**Important**: Replace `YOUR-BUCKET-NAME` with your exact bucket name (e.g., `fixeo-photos-john-2024`)

## Step 4: Create IAM User for API Access
1. Navigate to **IAM** service
2. Go to **Users** → **Create user**
3. Username: `fixeo-s3-user`
4. Check **Provide user access to the AWS Management Console** (optional)
5. Click **Next**
6. **Attach policies directly** → Search for `AmazonS3FullAccess`
7. Select `AmazonS3FullAccess` policy
8. Click **Next** → **Create user**

## Step 5: Generate Access Keys
1. Go to your created user → **Security credentials** tab
2. Scroll to **Access keys** → **Create access key**
3. Select **Application running outside AWS**
4. Click **Next** → **Create access key**
5. **IMPORTANT**: Copy the Access Key ID and Secret Access Key

## Step 6: Configure Environment Variables
Add these variables to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
AWS_REGION="us-east-1"
```

## Step 7: Test the Setup
1. Restart your development server: `npm run dev`
2. Go to your application
3. Try uploading a photo in a service request
4. Check your S3 bucket to see if the image was uploaded

## Security Notes
- **ACLs are disabled by default** - this is the recommended security setting
- We use **bucket policy** for public read access instead of ACLs
- Never commit your AWS credentials to version control
- Consider using IAM roles instead of access keys for production
- Review S3 bucket permissions regularly
- Enable S3 bucket logging for production environments

## Cost Optimization
- S3 storage costs ~$0.023/GB per month
- Data transfer costs ~$0.09/GB
- Consider using S3 Intelligent Tiering for long-term storage
- Set up lifecycle policies to delete old images if needed

## Troubleshooting
- **403 Forbidden**: Check bucket policy and IAM permissions
- **Upload fails**: Verify environment variables are correct
- **Images not displaying**: Ensure public read access is enabled via bucket policy
- **ACL errors**: Make sure you're NOT using ACLs (they should be disabled)
- **"AccessControlListNotSupported"**: This is expected - we use bucket policy instead 