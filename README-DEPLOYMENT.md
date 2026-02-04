# Production Deployment Guide

## VPS Setup for agencyadmin.innothinklabs.com

### Prerequisites
- VPS with Ubuntu 20.04+ (IP: 57.131.29.182)
- Domain pointed to VPS: agencyadmin.innothinklabs.com
- SSH access to VPS

### Quick Deployment

1. **Connect to your VPS:**
   ```bash
   ssh root@57.131.29.182
   ```

2. **Download and run deployment script:**
   ```bash
   wget https://raw.githubusercontent.com/wissem-thinklab/agency-admin-innothinklabs/main/deploy.sh
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Deployment Steps

1. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Install Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone Repository:**
   ```bash
   git clone https://github.com/wissem-thinklab/agency-admin-innothinklabs.git /opt/innothinklab-admin
   cd /opt/innothinklab-admin
   ```

4. **Setup SSL Certificate:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d agencyadmin.innothinklabs.com -d www.agencyadmin.innothinklabs.com
   ```

5. **Copy SSL Certificates:**
   ```bash
   mkdir -p nginx/ssl
   sudo cp /etc/letsencrypt/live/agencyadmin.innothinklabs.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/agencyadmin.innothinklabs.com/privkey.pem nginx/ssl/
   sudo chown $USER:$USER nginx/ssl/*
   ```

6. **Setup Environment:**
   ```bash
   cp server/.env.production server/.env
   ```

7. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Service Management

- **View logs:** `docker-compose -f docker-compose.prod.yml logs -f`
- **Stop services:** `docker-compose -f docker-compose.prod.yml down`
- **Restart services:** `docker-compose -f docker-compose.prod.yml restart`
- **Update:** `git pull && docker-compose -f docker-compose.prod.yml build && docker-compose -f docker-compose.prod.yml up -d`

### Environment Variables

**Backend (.env):**
- `PORT=5000`
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://agencyadmin.innothinklabs.com`

### Security Notes

- SSL certificates auto-renew via cron job
- Firewall should allow ports 80, 443
- Regular backups recommended for MongoDB
- Monitor logs for suspicious activity

### Troubleshooting

1. **SSL Issues:**
   ```bash
   sudo certbot renew --dry-run
   ```

2. **Container Issues:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs [service-name]
   ```

3. **Permission Issues:**
   ```bash
   sudo chown -R $USER:$USER /opt/innothinklab-admin
   ```
