# VPS Deployment Guide - Step by Step

## Server: 57.131.29.182
## Domain: agencyadmin.innothinklabs.com

### Step 1: Connect to VPS
```bash
ssh root@57.131.29.182
```

### Step 2: Update System
```bash
apt update && apt upgrade -y
```

### Step 3: Install Required Software
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### Step 4: Clone Your Project
```bash
cd /opt
git clone https://github.com/wissem-thinklab/agency-admin-innothinklabs.git
cd agency-admin-innothinklabs
```

### Step 5: Setup Environment
```bash
# Copy production environment
cp server/.env.production server/.env
```

### Step 6: Setup Nginx Configuration
```bash
# Create Nginx config for your domain
nano /etc/nginx/sites-available/agencyadmin.innothinklabs.com
```

**Paste this Nginx configuration:**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name agencyadmin.innothinklabs.com www.agencyadmin.innothinklabs.com;
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS main server
server {
    listen 443 ssl http2;
    server_name agencyadmin.innothinklabs.com www.agencyadmin.innothinklabs.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/agencyadmin.innothinklabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agencyadmin.innothinklabs.com/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin $http_origin;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin $http_origin;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 7: Enable Nginx Site
```bash
# Enable the site
ln -s /etc/nginx/sites-available/agencyadmin.innothinklabs.com /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 8: Get SSL Certificate
```bash
# Create directory for certbot validation
mkdir -p /var/www/certbot

# Get SSL certificate
certbot --nginx -d agencyadmin.innothinklabs.com -d www.agencyadmin.innothinklabs.com
```

### Step 9: Update Docker Compose for Production
```bash
# Create production docker-compose file
nano docker-compose.prod.yml
```

**Paste this configuration:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: innothinklab-backend-prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=5000
    env_file:
      - ./server/.env
    volumes:
      - ./server/uploads:/app/uploads
    ports:
      - "5000:5000"
    networks:
      - innothinklab-network
    command: node server.js

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: innothinklab-frontend-prod
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=https://agencyadmin.innothinklabs.com/api
      - FILES_SERVER=https://agencyadmin.innothinklabs.com
    ports:
      - "3000:80"
    networks:
      - innothinklab-network

networks:
  innothinklab-network:
    driver: bridge
```

### Step 10: Deploy Application
```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Step 11: Setup SSL Auto-Renewal
```bash
# Add cron job for SSL renewal
crontab -e
```

**Add this line:**
```
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### Step 12: Verify Deployment
```bash
# Check if services are running
docker-compose -f docker-compose.prod.yml logs

# Check Nginx status
systemctl status nginx

# Test SSL certificate
certbot certificates
```

## Management Commands

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update Application
```bash
cd /opt/agency-admin-innothinklabs
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

## Firewall Setup (Recommended)
```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

Your application will be available at: https://agencyadmin.innothinklabs.com
