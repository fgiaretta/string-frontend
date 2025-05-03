# Deployment Plan for Internal Control Panel

This document outlines the steps to deploy the React frontend application to AWS CloudFront with the domain panel.string.tec.br using Route 53.

## Prerequisites

1. AWS CLI installed and configured with appropriate permissions
2. A domain registered in Route 53 (string.tec.br)
3. Node.js and npm installed

## Step 1: Build the Application

```bash
# Navigate to the project directory
cd /Users/fgiaretta/codes/string/frontend

# Install dependencies if not already installed
npm install

# Build the application
npm run build
# If TypeScript errors occur, you can bypass type checking with:
npx vite build
```

## Step 2: Create an S3 Bucket

```bash
# Create an S3 bucket to host the static files
aws s3api create-bucket --bucket panel-string-tec-br --region us-east-1
```

## Step 3: Configure the S3 Bucket for Static Website Hosting

```bash
# Configure the bucket for static website hosting
aws s3api put-bucket-website --bucket panel-string-tec-br --website-configuration '{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}'

# Set bucket policy to allow public read access
aws s3api put-bucket-policy --bucket panel-string-tec-br --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::panel-string-tec-br/*"
        }
    ]
}'
```

## Step 4: Upload the Built Files to S3

```bash
# Upload the built files to the S3 bucket
aws s3 sync dist/ s3://panel-string-tec-br/ --delete
```

## Step 5: Create an SSL Certificate with AWS Certificate Manager

```bash
# Request a certificate for panel.string.tec.br
aws acm request-certificate \
    --domain-name panel.string.tec.br \
    --validation-method DNS \
    --region us-east-1
```

Note: You'll need to add the validation CNAME records to your Route 53 hosted zone. The AWS console will provide these details.

## Step 6: Create a CloudFront Distribution

```bash
# Create a CloudFront distribution
aws cloudfront create-distribution \
    --origin-domain-name panel-string-tec-br.s3-website-us-east-1.amazonaws.com \
    --default-root-object index.html \
    --aliases panel.string.tec.br \
    --default-cache-behavior '{
        "TargetOriginId": "S3-panel-string-tec-br",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    }' \
    --ssl-certificate-arn <YOUR_CERTIFICATE_ARN>
```

Replace `<YOUR_CERTIFICATE_ARN>` with the ARN of the certificate you created in Step 5.

## Step 7: Configure Route 53 to Point to CloudFront

```bash
# Create a Route 53 record set
aws route53 change-resource-record-sets \
    --hosted-zone-id <YOUR_HOSTED_ZONE_ID> \
    --change-batch '{
        "Changes": [
            {
                "Action": "CREATE",
                "ResourceRecordSet": {
                    "Name": "panel.string.tec.br",
                    "Type": "A",
                    "AliasTarget": {
                        "HostedZoneId": "Z2FDTNDATAQYW2",
                        "DNSName": "<YOUR_CLOUDFRONT_DOMAIN_NAME>",
                        "EvaluateTargetHealth": false
                    }
                }
            }
        ]
    }'
```

Replace:
- `<YOUR_HOSTED_ZONE_ID>` with your Route 53 hosted zone ID for string.tec.br
- `<YOUR_CLOUDFRONT_DOMAIN_NAME>` with the domain name of your CloudFront distribution (e.g., d1234abcdef.cloudfront.net)

## Step 8: Configure CloudFront for SPA Routing

For a single-page application (SPA), you need to configure CloudFront to redirect all requests to index.html:

```bash
# Create a custom error response for 404 errors
aws cloudfront update-distribution \
    --id <YOUR_DISTRIBUTION_ID> \
    --custom-error-responses '{
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    }'
```

Replace `<YOUR_DISTRIBUTION_ID>` with your CloudFront distribution ID.

## Step 9: Set Up Continuous Deployment (Optional)

For continuous deployment, you can set up a GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to CloudFront

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://panel-string-tec-br/ --delete
        
      - name: Invalidate CloudFront cache
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Step 10: Testing and Verification

1. Wait for the CloudFront distribution to deploy (this can take up to 15 minutes)
2. Visit https://panel.string.tec.br to verify the deployment
3. Test navigation and ensure all routes work correctly

## Environment Configuration

Make sure your production environment variables are correctly set in `.env.production`:

```
VITE_API_URL=https://api.string.tec.br
```

## Troubleshooting

1. **CORS Issues**: If you encounter CORS issues, ensure your API is configured to accept requests from the CloudFront domain.

2. **Routing Issues**: For client-side routing, ensure CloudFront is configured to redirect all requests to index.html.

3. **Certificate Validation**: If certificate validation fails, verify the DNS records in Route 53.

4. **Cache Issues**: If changes don't appear immediately, you may need to invalidate the CloudFront cache.
