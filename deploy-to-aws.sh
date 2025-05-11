#!/bin/bash

# Default configuration variables
AWS_REGION="us-east-1"  # Change this to your preferred region
S3_BUCKET="panel-string-tec-br"  # S3 bucket name from CloudFront config
CLOUDFRONT_CONFIG_FILE="cloudfront-config.json"  # CloudFront configuration file
CLOUDFRONT_DISTRIBUTION_ID=""  # Will be populated if distribution exists

# Parse command line arguments
AWS_PROFILE=""

# Display usage information
function show_usage {
  echo "Usage: $0 [-p|--profile <aws-profile>]"
  echo "Options:"
  echo "  -p, --profile    AWS profile to use for deployment (optional)"
  echo "  -h, --help       Show this help message"
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -p|--profile)
      AWS_PROFILE="$2"
      shift 2
      ;;
    -h|--help)
      show_usage
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      ;;
  esac
done

# Check if AWS profile is provided or fallback to environment variables
if [ -z "$AWS_PROFILE" ]; then
  if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: Either AWS profile or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be provided."
    show_usage
  else
    echo "Using AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables for authentication."
    AWS_CLI_OPTIONS=""
  fi
else
  AWS_CLI_OPTIONS="--profile $AWS_PROFILE"
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process for String Frontend...${NC}"

# Step 1: Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm install

# Try to build, and if it fails, continue anyway
echo -e "${YELLOW}Attempting to build the application...${NC}"
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo -e "${RED}Build encountered errors.${NC}"
  echo -e "${YELLOW}Would you like to continue with deployment anyway? (y/n)${NC}"
  read -r CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
  fi
  echo -e "${YELLOW}Continuing with deployment despite build errors...${NC}"
else
  echo -e "${GREEN}Build successful!${NC}"
fi

# Step 2: Check if the S3 bucket exists, create if it doesn't
echo -e "${YELLOW}Checking if S3 bucket exists...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET" $AWS_CLI_OPTIONS 2>&1 > /dev/null; then
  echo -e "${YELLOW}Bucket does not exist. Creating bucket $S3_BUCKET...${NC}"
  aws s3 mb "s3://$S3_BUCKET" $AWS_CLI_OPTIONS --region $AWS_REGION
  
  # Configure the bucket for static website hosting
  echo -e "${YELLOW}Configuring bucket for static website hosting...${NC}"
  aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document index.html $AWS_CLI_OPTIONS
  
  # Set bucket policy to allow public access
  echo -e "${YELLOW}Setting bucket policy to allow public access...${NC}"
  aws s3api put-bucket-policy --bucket $S3_BUCKET --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::'$S3_BUCKET'/*"
      }
    ]
  }' $AWS_CLI_OPTIONS
else
  echo -e "${GREEN}Bucket already exists.${NC}"
fi

# Step 3: Upload files to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync dist/ "s3://$S3_BUCKET" --delete $AWS_CLI_OPTIONS

if [ $? -ne 0 ]; then
  echo -e "${RED}Upload failed. Please check your AWS credentials and permissions.${NC}"
  exit 1
fi

echo -e "${GREEN}Files uploaded successfully!${NC}"

# The rest of the script remains unchanged, using $AWS_CLI_OPTIONS for AWS CLI commands
