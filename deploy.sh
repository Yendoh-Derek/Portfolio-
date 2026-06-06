#!/bin/bash

# Configuration
PROJECT_ID="ageless-talent-425021-g8"
IMAGE_NAME="ai-portfolio"
REGION="us-central1"
REPO_NAME="gcr.io/$PROJECT_ID/$IMAGE_NAME"

# Load environment variables from .env.local
if [ -f .env.local ]; then
    # Read .env.local, ignoring comments and running export for each line
    # Fix: sed handles spaces around '=' if they exist, though standard .env shouldn't have them
    set -a
    source <(sed -e 's/ *= */=/g' -e 's/^export //' .env.local | grep -v '^#')
    set +a
    echo "✅ Loaded environment variables from .env.local"
else
    echo "❌ Error: .env.local file not found!"
    exit 1
fi

echo "🚀 Starting Deployment for Project: $PROJECT_ID"

# 1. Enable APIs (Idempotent - usually fast if already enabled)
echo "------------------------------------------------"
echo "🔌 Ensuring APIs are enabled..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID

# 2. Build Image
echo "------------------------------------------------"
echo "🏗️  Building Docker Image..."

# Create temporary .env.production for the build context
# (Cloud Build doesn't see .env.local by default, and NEXT_PUBLIC_ vars need to be present at build time)
cp .env.local .env.production
echo "📝 Created temporary .env.production for build..."

BUILD_SUBMIT_OUTPUT="$(gcloud builds submit \
  --tag "$REPO_NAME" \
  . \
  --project="$PROJECT_ID" \
  --async \
  --format='value(id)' 2>&1)"
echo "$BUILD_SUBMIT_OUTPUT"

BUILD_ID="$(printf '%s\n' "$BUILD_SUBMIT_OUTPUT" | sed -nE 's#^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$#\1#p' | head -n1)"

if [ -z "$BUILD_ID" ]; then
    BUILD_ID="$(printf '%s\n' "$BUILD_SUBMIT_OUTPUT" | sed -nE 's#.*builds/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}).*#\1#p' | head -n1)"
fi

if [ -z "$BUILD_ID" ]; then
    echo "❌ Failed to start Cloud Build (no build id returned)."
    exit 1
fi

echo "🧾 Cloud Build started: $BUILD_ID"
echo "⏱️  Polling build status with backoff..."

POLL_SECONDS=10
MAX_POLL_SECONDS=60

while true; do
    set +e
    BUILD_STATUS_OUTPUT="$(gcloud builds describe "$BUILD_ID" --project="$PROJECT_ID" --format='value(status)' 2>&1)"
    DESCRIBE_EXIT_CODE=$?
    set -e

    if [ $DESCRIBE_EXIT_CODE -ne 0 ]; then
        if echo "$BUILD_STATUS_OUTPUT" | grep -Eq "RATE_LIMIT_EXCEEDED|quota|429|RESOURCE_EXHAUSTED"; then
            echo "⚠️  Cloud Build API rate-limited. Retrying in ${POLL_SECONDS}s..."
            sleep "$POLL_SECONDS"
            POLL_SECONDS=$((POLL_SECONDS * 2))
            if [ $POLL_SECONDS -gt $MAX_POLL_SECONDS ]; then
                POLL_SECONDS=$MAX_POLL_SECONDS
            fi
            continue
        fi

        echo "❌ Failed to read build status:"
        echo "$BUILD_STATUS_OUTPUT"
        exit 1
    fi

    BUILD_STATUS="$(echo "$BUILD_STATUS_OUTPUT" | tr -d '\r\n')"
    POLL_SECONDS=10

    case "$BUILD_STATUS" in
        SUCCESS)
            echo "✅ Cloud Build completed successfully."
            break
            ;;
        FAILURE|INTERNAL_ERROR|TIMEOUT|CANCELLED|EXPIRED)
            echo "❌ Cloud Build ended with status: $BUILD_STATUS"
            exit 1
            ;;
        *)
            echo "⏳ Cloud Build status: $BUILD_STATUS. Checking again in ${POLL_SECONDS}s..."
            sleep "$POLL_SECONDS"
            ;;
    esac
done

# Cleanup
rm .env.production
echo "🗑️  Removed temporary .env.production"

# 3. Deploy to Cloud Run
echo "------------------------------------------------"
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME \
  --image $REPO_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --labels dev-tutorial=devnewyear2026 \
  --project=$PROJECT_ID \
  --set-env-vars GEMINI_API_KEY="$GEMINI_API_KEY",NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY="$NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY",NEXTAUTH_SECRET="$NEXTAUTH_SECRET",NEXTAUTH_URL="https://ai-portfolio-48210516724.us-central1.run.app",NEXT_PUBLIC_APP_URL="https://ai-portfolio-48210516724.us-central1.run.app",NEXT_PUBLIC_ADMIN_USER="$NEXT_PUBLIC_ADMIN_USER",ADMIN_PASSWORD="$ADMIN_PASSWORD",NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY",NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID",NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID"

if [ $? -ne 0 ]; then   
    echo "❌ Deployment failed! Check logs."
    exit 1
fi

echo "------------------------------------------------"
echo "✅ Deployment Successful!"

# 4. Cleanup Old Images
echo "------------------------------------------------"
echo "🧹 Cleaning up old images to save costs..."

# List all digests for this image, sort by date (oldest first), exclude the latest one (tail -n +2 is to skip headers/latest logic depending on format, here we use precise gcloud filtering)
# Strategy: List all digests, sort by creation time desc, keep top 2, delete rest.

# Get list of digests sorted by date (newest first)
DIGESTS=$(gcloud container images list-tags $REPO_NAME --limit=9999 --sort-by=~TIMESTAMP --format='get(digest)')

# Counter to keep track of images kept
COUNT=0
KEEP=2

for digest in $DIGESTS; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -le $KEEP ]; then
        echo "   Keep: $digest (Recent)"
    else
        echo "   🗑️  Deleting: $digest"
        gcloud container images delete "$REPO_NAME@$digest" --force-delete-tags --quiet
    fi
done

echo "✨ Cleanup complete. Kept last $KEEP images."
echo "🌍 Your site is live!"
