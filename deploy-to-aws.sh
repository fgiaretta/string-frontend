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
  echo "Usage: $0 -p|--profile <aws-profile>"
  echo "Options:"
  echo "  -p, --profile    AWS profile to use for deployment (required)"
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

# Check if AWS profile is provided
if [ -z "$AWS_PROFILE" ]; then
  echo "Error: AWS profile is required"
  show_usage
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
if ! aws s3 ls "s3://$S3_BUCKET" --profile $AWS_PROFILE 2>&1 > /dev/null; then
  echo -e "${YELLOW}Bucket does not exist. Creating bucket $S3_BUCKET...${NC}"
  aws s3 mb "s3://$S3_BUCKET" --profile $AWS_PROFILE --region $AWS_REGION
  
  # Configure the bucket for static website hosting
  echo -e "${YELLOW}Configuring bucket for static website hosting...${NC}"
  aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document index.html --profile $AWS_PROFILE
  
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
  }' --profile $AWS_PROFILE
else
  echo -e "${GREEN}Bucket already exists.${NC}"
fi

# Step 3: Upload files to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync dist/ "s3://$S3_BUCKET" --delete --profile $AWS_PROFILE

if [ $? -ne 0 ]; then
  echo -e "${RED}Upload failed. Please check your AWS credentials and permissions.${NC}"
  exit 1
fi

echo -e "${GREEN}Files uploaded successfully!${NC}"

# Step 4: Handle CloudFront distribution
echo -e "${YELLOW}Checking CloudFront configuration...${NC}"

# Check if CloudFront config file exists
if [ ! -f "$CLOUDFRONT_CONFIG_FILE" ]; then
  echo -e "${RED}CloudFront configuration file $CLOUDFRONT_CONFIG_FILE not found.${NC}"
  echo -e "${YELLOW}Skipping CloudFront setup.${NC}"
else
  # Get the domain name from the config file
  DOMAIN_NAME=$(grep -o '"DomainName": "[^"]*"' "$CLOUDFRONT_CONFIG_FILE" | head -1 | cut -d'"' -f4)
  
  # Check if the domain name in the config matches our S3 bucket
  EXPECTED_DOMAIN="$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
  
  if [[ "$DOMAIN_NAME" != "$EXPECTED_DOMAIN" ]]; then
    echo -e "${YELLOW}Warning: Domain name in CloudFront config ($DOMAIN_NAME) doesn't match the expected S3 website endpoint ($EXPECTED_DOMAIN).${NC}"
    echo -e "${YELLOW}You may need to update your CloudFront configuration.${NC}"
  fi
  
  # Check if distribution already exists for this domain or for the CNAME
  DISTRIBUTIONS=$(aws cloudfront list-distributions --profile $AWS_PROFILE --output json)
  
  # Extract CNAME from config file
  CNAME=$(grep -o '"Items": \[[^]]*\]' "$CLOUDFRONT_CONFIG_FILE" | grep -o '"[^"]*\.tec\.br"' | tr -d '"')
  
  # Try to find the distribution ID by looking for the CNAME in the actual distributions list
  if [ ! -z "$CNAME" ]; then
    echo -e "${YELLOW}Looking for existing distribution with CNAME: $CNAME${NC}"
    # Use jq if available for more reliable JSON parsing
    if command -v jq &> /dev/null; then
      CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTIONS" | jq -r --arg CNAME "$CNAME" '.DistributionList.Items[] | select(.Aliases.Items[] | contains($CNAME)) | .Id' | head -1)
    else
      # Fallback to grep but with more careful extraction to get actual distribution ID
      TEMP_FILE=$(mktemp)
      echo "$DISTRIBUTIONS" > "$TEMP_FILE"
      DISTRIBUTION_BLOCK=$(grep -A 100 -B 10 "$CNAME" "$TEMP_FILE" | head -n 200)
      CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_BLOCK" | grep -o '"Id": "[A-Z0-9]*"' | head -1 | cut -d'"' -f4)
      rm "$TEMP_FILE"
    fi
    
    if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
      echo -e "${YELLOW}Found existing distribution with ID: $CLOUDFRONT_DISTRIBUTION_ID for CNAME: $CNAME${NC}"
    fi
  fi
  
  # If not found by CNAME, try to find by domain name
  if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    # Use jq if available
    if command -v jq &> /dev/null; then
      CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTIONS" | jq -r --arg DOMAIN "$DOMAIN_NAME" '.DistributionList.Items[] | select(.Origins.Items[].DomainName | contains($DOMAIN)) | .Id' | head -1)
    else
      # Fallback to grep with careful extraction
      TEMP_FILE=$(mktemp)
      echo "$DISTRIBUTIONS" > "$TEMP_FILE"
      DISTRIBUTION_BLOCK=$(grep -A 100 -B 10 "$DOMAIN_NAME" "$TEMP_FILE" | head -n 200)
      CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_BLOCK" | grep -o '"Id": "[A-Z0-9]*"' | head -1 | cut -d'"' -f4)
      rm "$TEMP_FILE"
    fi
  fi
  
  # Validate that we have a proper CloudFront distribution ID (should be alphanumeric)
  if [[ ! "$CLOUDFRONT_DISTRIBUTION_ID" =~ ^[A-Z0-9]+$ ]]; then
    CLOUDFRONT_DISTRIBUTION_ID=""
  fi
  
  if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    # Distribution doesn't exist, create a new one
    echo -e "${YELLOW}Creating new CloudFront distribution...${NC}"
    DISTRIBUTION_RESULT=$(aws cloudfront create-distribution --profile $AWS_PROFILE --distribution-config file://$CLOUDFRONT_CONFIG_FILE)
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to create CloudFront distribution.${NC}"
      echo -e "${RED}$DISTRIBUTION_RESULT${NC}"
      
      # If the error is about CNAME already existing, suggest finding the existing distribution
      if [[ "$DISTRIBUTION_RESULT" == *"CNAMEAlreadyExists"* ]]; then
        echo -e "${YELLOW}The CNAME $CNAME is already associated with another distribution.${NC}"
        echo -e "${YELLOW}Try to find the existing distribution ID with:${NC}"
        echo -e "${YELLOW}aws cloudfront list-distributions --profile $AWS_PROFILE | grep -A 10 -B 10 \"$CNAME\"${NC}"
        
        # List all distributions to help identify the one with the CNAME
        echo -e "${YELLOW}Listing all CloudFront distributions:${NC}"
        aws cloudfront list-distributions --profile $AWS_PROFILE --query "DistributionList.Items[].{Id:Id, DomainName:DomainName, Aliases:Aliases.Items}" --output table
      fi
    else
      CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_RESULT" | grep -o '"Id": "[A-Z0-9]*"' | head -1 | cut -d'"' -f4)
      echo -e "${GREEN}CloudFront distribution created with ID: $CLOUDFRONT_DISTRIBUTION_ID${NC}"
    fi
  else
    # Distribution exists, update it
    echo -e "${YELLOW}Updating existing CloudFront distribution $CLOUDFRONT_DISTRIBUTION_ID...${NC}"
    
    # Get the ETag and current config for the distribution
    DIST_CONFIG_RESULT=$(aws cloudfront get-distribution-config --id $CLOUDFRONT_DISTRIBUTION_ID --profile $AWS_PROFILE)
    ETAG=$(echo "$DIST_CONFIG_RESULT" | grep -o '"ETag": "[^"]*"' | cut -d'"' -f4)
    
    # Create a temporary file with the current distribution config
    TMP_CONFIG=$(mktemp)
    echo "$DIST_CONFIG_RESULT" > $TMP_CONFIG
    
    # Check if the existing distribution has logging enabled
    HAS_LOGGING=$(grep -o '"Logging":' $TMP_CONFIG)
    
    if [ ! -z "$HAS_LOGGING" ]; then
      echo -e "${YELLOW}Existing distribution has logging enabled. Preserving logging configuration...${NC}"
      
      # Extract the logging configuration from the current config
      LOGGING_CONFIG=$(sed -n '/"Logging": {/,/}/p' $TMP_CONFIG)
      
      # Create a temporary file with our desired config
      TMP_NEW_CONFIG=$(mktemp)
      cat $CLOUDFRONT_CONFIG_FILE > $TMP_NEW_CONFIG
      
      # Check if our config already has logging
      HAS_OUR_LOGGING=$(grep -o '"Logging":' $TMP_NEW_CONFIG)
      
      if [ -z "$HAS_OUR_LOGGING" ]; then
        # Find the position to insert the logging config (before the last closing brace)
        sed -i '' -e '$i\
  ,'"$LOGGING_CONFIG" $TMP_NEW_CONFIG
      fi
      
      # Use the modified config file for the update
      UPDATE_RESULT=$(aws cloudfront update-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --if-match "$ETAG" --distribution-config file://$TMP_NEW_CONFIG --profile $AWS_PROFILE)
      
      # Clean up the temporary file
      rm -f $TMP_NEW_CONFIG
    else
      # No logging in the existing config, use our config file as is
      UPDATE_RESULT=$(aws cloudfront update-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --if-match "$ETAG" --distribution-config file://$CLOUDFRONT_CONFIG_FILE --profile $AWS_PROFILE)
    fi
    
    # Clean up the temporary file
    rm -f $TMP_CONFIG
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to update CloudFront distribution.${NC}"
      echo -e "${RED}$UPDATE_RESULT${NC}"
      
      # If the error is about logging, skip the update
      if [[ "$UPDATE_RESULT" == *"Logging is missing"* ]]; then
        echo -e "${YELLOW}Skipping distribution update due to logging configuration mismatch.${NC}"
        echo -e "${YELLOW}The deployment will continue and cache will still be invalidated.${NC}"
      fi
    else
      echo -e "${GREEN}CloudFront distribution updated successfully.${NC}"
    fi
    fi
    
    # Clean up temporary file
    rm -f $TMP_CONFIG
  fi
  
  # Invalidate CloudFront cache if we have a distribution ID
  if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    
    # Verify the distribution exists before trying to invalidate
    if aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --profile $AWS_PROFILE &>/dev/null; then
      # Run the invalidation but capture the output
      INVALIDATION_RESULT=$(aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --profile $AWS_PROFILE)
      
      if [ $? -ne 0 ]; then
        echo -e "${RED}CloudFront invalidation failed.${NC}"
      else
        # Extract just the invalidation ID for a cleaner message
        INVALIDATION_ID=$(echo "$INVALIDATION_RESULT" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}CloudFront cache invalidation started successfully. ID: $INVALIDATION_ID${NC}"
      fi
    else
      echo -e "${RED}Cannot invalidate cache: Distribution $CLOUDFRONT_DISTRIBUTION_ID does not exist.${NC}"
    fi
  fi

# Print website URL
WEBSITE_URL="http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your website is available at: ${YELLOW}$WEBSITE_URL${NC}"

if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  # Verify the distribution exists before trying to get its domain name
  if aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --profile $AWS_PROFILE &>/dev/null; then
    # Get CloudFront domain name
    if command -v jq &> /dev/null; then
      CF_DOMAIN=$(aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --profile $AWS_PROFILE | jq -r '.Distribution.DomainName')
    else
      CF_DOMAIN=$(aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --profile $AWS_PROFILE | grep -o '"DomainName": "[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    echo -e "${GREEN}CloudFront URL: ${YELLOW}https://$CF_DOMAIN${NC}"
  else
    echo -e "${RED}CloudFront distribution $CLOUDFRONT_DISTRIBUTION_ID does not exist.${NC}"
  fi
  
  # Check if there's a custom domain in the CloudFront config
  CUSTOM_DOMAIN=$(grep -o '"Items": \[[^]]*\]' "$CLOUDFRONT_CONFIG_FILE" | grep -o '"[^"]*\.tec\.br"' | tr -d '"')
  if [ ! -z "$CUSTOM_DOMAIN" ]; then
    echo -e "${GREEN}Custom domain: ${YELLOW}https://$CUSTOM_DOMAIN${NC}"
  fi
fi
