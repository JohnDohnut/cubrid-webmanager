#!/usr/bin/env bash
set -euo pipefail

# Default values
PLATFORM="linux"
DEPLOY="both"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --deploy)
            DEPLOY="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [--platform linux|win|both] [--deploy docs|server|both]"
            echo "  --platform: Target platform (default: linux)"
            echo "  --deploy:   What to deploy (default: both)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate arguments
case $PLATFORM in
    linux|win|both) ;;
    *) echo "ERROR: Invalid platform. Use: linux, win, or both"; exit 1 ;;
esac

case $DEPLOY in
    docs|server|both) ;;
    *) echo "ERROR: Invalid deploy option. Use: docs, server, or both"; exit 1 ;;
esac

USER="cubrid"
TARGET_HOSTS=("192.168.2.36" "192.168.2.50")
REMOTE_PATH="/home/cubrid/web_ca_server"

ART_LINUX="dist/webca-server-linux"
ART_WIN="dist/webca-server-win.exe"
DOCS_PATH="docs"

# Function to check if file exists
check_file_exists() {
    local file_path="$1"
    if [[ ! -f "$file_path" ]]; then
        echo "ERROR: File not found: $file_path"
        exit 1
    fi
}

# Function to check if directory exists
check_dir_exists() {
    local dir_path="$1"
    if [[ ! -d "$dir_path" ]]; then
        echo "ERROR: Directory not found: $dir_path"
        exit 1
    fi
}

# Function to run command with error handling
run_command() {
    local command="$1"
    local description="$2"
    echo "Running: $description..."
    if ! eval "$command"; then
        echo "ERROR: Failed: $description"
        exit 1
    fi
    echo "SUCCESS: $description completed"
}

# Function to deploy to a single host
deploy_to_host() {
    local target_host="$1"
    
    echo ""
    echo "=== Deploying to $target_host ==="
    
    # Prepare remote directory
    echo "Preparing remote directory..."
    ssh "$USER@$target_host" "mkdir -p $REMOTE_PATH"
    
    # Deploy based on options
    case $DEPLOY in
        docs)
            echo "=== DOCS ONLY DEPLOYMENT ==="
            
            # Deploy docs
            echo "Deploying documentation to $USER@$target_host:$REMOTE_PATH/docs"
            scp -r "$DOCS_PATH" "$USER@$target_host:$REMOTE_PATH"
            
            # Stop existing docs server
            echo "Stopping existing docs server on port 7777..."
            ssh "$USER@$target_host" "
                if pgrep -f 'http-server.*7777' >/dev/null 2>&1; then
                    echo 'Stopping docs server...'
                    pkill -f 'http-server.*7777'
                    sleep 1
                fi
            "
            
            # Start docs server
            echo "Starting documentation server on port 7777..."
            ssh "$USER@$target_host" "
                cd $REMOTE_PATH && 
                nohup npx http-server docs -p 7777 --cors --gzip > docs.log 2>&1 &
                disown
                echo 'Documentation server started'
            "
            echo "Documentation available at: http://$target_host:7777"
            ;;
        
        server)
            echo "=== SERVER ONLY DEPLOYMENT ==="
            
            # Platform-specific packaging and deployment
            case $PLATFORM in
                linux)
                    echo "Deploying Linux binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_LINUX" "$USER@$target_host:$REMOTE_PATH"
                    ;;
                win)
                    echo "Deploying Windows binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_WIN" "$USER@$target_host:$REMOTE_PATH"
                    ;;
                both)
                    echo "Deploying Linux binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_LINUX" "$USER@$target_host:$REMOTE_PATH"
                    echo "Deploying Windows binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_WIN" "$USER@$target_host:$REMOTE_PATH"
                    ;;
            esac
            
            # Stop existing server
            echo "Stopping existing WebCA server on port 8080..."
            ssh "$USER@$target_host" "
                if pgrep -f 'webca-server.*8080' >/dev/null 2>&1; then
                    echo 'Stopping WebCA server...'
                    pkill -f 'webca-server.*8080'
                    sleep 1
                fi
            "
            
            # Start server
            if [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "both" ]; then
                echo "Starting WebCA server on port 8080..."
                ssh "$USER@$target_host" "cd $REMOTE_PATH && chmod +x webca-server-linux && nohup ./webca-server-linux --SEED=seed --SALT=salt --PORT=8080 > server.log 2>&1 & disown && echo 'WebCA server started'"
                echo "WebCA server available at: https://$target_host:8080"
            elif [ "$PLATFORM" = "win" ]; then
                echo "Starting WebCA server on port 8080..."
                ssh "$USER@$target_host" "cd $REMOTE_PATH && nohup ./webca-server-win.exe --SEED=seed --SALT=salt --PORT=8080 > server.log 2>&1 & disown && echo 'WebCA server started'"
                echo "WebCA server available at: https://$target_host:8080"
            fi
            ;;
        
        both)
            echo "=== FULL DEPLOYMENT (DOCS + SERVER) ==="
            
            # Platform-specific packaging and deployment
            case $PLATFORM in
                linux)
                    echo "Deploying Linux binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_LINUX" "$USER@$target_host:$REMOTE_PATH"
                    ;;
                win)
                    echo "Deploying Windows binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_WIN" "$USER@$target_host:$REMOTE_PATH"
                    ;;
                both)
                    echo "Deploying Linux binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_LINUX" "$USER@$target_host:$REMOTE_PATH"
                    echo "Deploying Windows binary to $USER@$target_host:$REMOTE_PATH"
                    scp "$ART_WIN" "$USER@$target_host:$REMOTE_PATH"
                    ;;
            esac
            
            # Deploy documentation
            echo "Deploying documentation to $USER@$target_host:$REMOTE_PATH/docs"
            scp -r "$DOCS_PATH" "$USER@$target_host:$REMOTE_PATH"
            
            # Stop existing servers
            echo "Stopping existing servers on ports 7777 and 8080..."
            ssh "$USER@$target_host" "
                if pgrep -f 'http-server.*7777' >/dev/null 2>&1; then
                    echo 'Stopping docs server...'
                    pkill -f 'http-server.*7777'
                    sleep 1
                fi
                if pgrep -f 'webca-server.*8080' >/dev/null 2>&1; then
                    echo 'Stopping WebCA server...'
                    pkill -f 'webca-server.*8080'
                    sleep 1
                fi
            "
            
            # Start servers
            echo "Starting documentation server on port 7777..."
            ssh "$USER@$target_host" "
                cd $REMOTE_PATH && 
                nohup npx http-server docs -p 7777 --cors --gzip > docs.log 2>&1 &
                disown
                echo 'Documentation server started'
            "
            
            if [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "both" ]; then
                echo "Starting WebCA server on port 8080..."
                ssh "$USER@$target_host" "cd $REMOTE_PATH && chmod +x webca-server-linux && nohup ./webca-server-linux --SEED=seed --SALT=salt --PORT=8080 > server.log 2>&1 & disown && echo 'WebCA server started'"
            elif [ "$PLATFORM" = "win" ]; then
                echo "Starting WebCA server on port 8080..."
                ssh "$USER@$target_host" "cd $REMOTE_PATH && nohup ./webca-server-win.exe --SEED=seed --SALT=salt --PORT=8080 > server.log 2>&1 & disown && echo 'WebCA server started'"
            fi
            
            # Final Summary
            echo "--- Deployment Summary for $target_host ---"
            if [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "both" ]; then
                echo "WebCA server available at: https://$target_host:8080"
            elif [ "$PLATFORM" = "win" ]; then
                echo "WebCA server available at: https://$target_host:8080"
            fi
            echo "Documentation available at: http://$target_host:7777"
            ;;
    esac
}

# Build phase (only once, before deploying to all hosts)
case $DEPLOY in
    docs)
        echo "=== BUILDING DOCS ==="
        run_command "npm run docs:build" "Building TypeDoc documentation"
        check_dir_exists "$DOCS_PATH"
        ;;
    
    server)
        echo "=== BUILDING SERVER ==="
        run_command "npm run build" "Building project"
        
        case $PLATFORM in
            linux)
                run_command "npm run pkg:linux" "Packaging for Linux"
                check_file_exists "$ART_LINUX"
                ;;
            win)
                run_command "npm run pkg:win" "Packaging for Windows"
                check_file_exists "$ART_WIN"
                ;;
            both)
                run_command "npm run pkg:linux" "Packaging for Linux"
                run_command "npm run pkg:win" "Packaging for Windows"
                check_file_exists "$ART_LINUX"
                check_file_exists "$ART_WIN"
                ;;
        esac
        ;;
    
    both)
        echo "=== BUILDING EVERYTHING ==="
        run_command "npm run build" "Building project"
        run_command "npm run docs:build" "Building TypeDoc documentation"
        check_dir_exists "$DOCS_PATH"
        
        case $PLATFORM in
            linux)
                run_command "npm run pkg:linux" "Packaging for Linux"
                check_file_exists "$ART_LINUX"
                ;;
            win)
                run_command "npm run pkg:win" "Packaging for Windows"
                check_file_exists "$ART_WIN"
                ;;
            both)
                run_command "npm run pkg:linux" "Packaging for Linux"
                run_command "npm run pkg:win" "Packaging for Windows"
                check_file_exists "$ART_LINUX"
                check_file_exists "$ART_WIN"
                ;;
        esac
        ;;
esac

# Deploy to all hosts
for target_host in "${TARGET_HOSTS[@]}"; do
    deploy_to_host "$target_host"
done

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Deployed to: ${TARGET_HOSTS[*]}"
