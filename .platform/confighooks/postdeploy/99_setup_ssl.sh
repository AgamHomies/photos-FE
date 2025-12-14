#!/bin/bash
set -e

echo "=== SSL Certificate Setup Script ==="

# Check if environment variables are set
if [ -z "$CERT_DOMAIN" ] || [ -z "$CERT_EMAIL" ]; then
    echo "ERROR: CERT_DOMAIN and CERT_EMAIL environment variables must be set"
    exit 1
fi

echo "Domain: $CERT_DOMAIN"
echo "Email: $CERT_EMAIL"

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    yum install -y certbot python3-certbot-nginx 2>/dev/null || dnf install -y certbot python3-certbot-nginx
fi

# Check if certificate already exists
if [ ! -f "/etc/letsencrypt/live/$CERT_DOMAIN/fullchain.pem" ]; then
    echo "Obtaining SSL certificate for $CERT_DOMAIN..."
    
    # Stop Nginx temporarily
    systemctl stop nginx
    
    # Get certificate
    certbot certonly --non-interactive --agree-tos -m $CERT_EMAIL --domains $CERT_DOMAIN --standalone
    
    # Start Nginx
    systemctl start nginx
    
    echo "SSL certificate obtained successfully"
else
    echo "SSL certificate already exists for $CERT_DOMAIN"
fi

# Create HTTPS Nginx configuration
echo "Creating Nginx HTTPS configuration..."
cat > /etc/nginx/conf.d/https.conf << EOF
server {
    listen 443 ssl;
    server_name _;
    
    ssl_certificate /etc/letsencrypt/live/$CERT_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$CERT_DOMAIN/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Proxy all requests to the Node.js server
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:8080/health;
    }
}
EOF

echo "HTTPS configuration created successfully"

# Reload Nginx to apply changes
systemctl reload nginx

echo "=== SSL Setup Complete ==="
