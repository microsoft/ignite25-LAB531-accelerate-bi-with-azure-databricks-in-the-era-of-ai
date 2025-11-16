#!/bin/bash

echo "🚀 Deploying Wanderbricks Travel Platform to Databricks..."

# Check if databricks CLI is available
if ! command -v databricks &> /dev/null; then
    echo "❌ Databricks CLI not found. Please install it first:"
    echo "   pip install databricks-cli"
    exit 1
fi

# Set target (default to dev)
TARGET=${1:-dev}

echo "📋 Target: $TARGET"

# Optional: Build frontend if --build-frontend flag is provided
if [[ "$*" == *"--build-frontend"* ]]; then
    echo "🎨 Building frontend..."
    cd frontend

    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Skipping frontend build."
    else
        npm run build

        if [ $? -ne 0 ]; then
            echo "❌ Frontend build failed!"
            exit 1
        fi

        echo "📦 Copying frontend build to backend/static..."
        mkdir -p ../backend/static
        cp -r dist/* ../backend/static/
        echo "✅ Frontend build copied successfully"
    fi

    cd ..
fi

# Validate bundle
echo "🔍 Validating bundle configuration..."
databricks bundle validate --target $TARGET

if [ $? -ne 0 ]; then
    echo "❌ Bundle validation failed!"
    exit 1
fi

# Deploy bundle
echo "🚀 Deploying bundle..."
databricks bundle deploy --target $TARGET

if [ $? -ne 0 ]; then
    echo "❌ Bundle deployment failed!"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available in the Databricks workspace."
echo ""
echo "💡 To build and deploy frontend changes, use:"
echo "   ./deploy.sh --build-frontend"
