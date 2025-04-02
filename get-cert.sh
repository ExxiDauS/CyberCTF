#!/bin/bash

# Create directory for webroot
mkdir -p ./public

# Run Certbot
sudo docker run --rm \
  -v "$(pwd)/certbot/etc:/etc/letsencrypt" \
  -v "$(pwd)/certbot/var:/var/lib/letsencrypt" \
  -v "$(pwd)/public:/var/www/html" \
  --network host \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/html \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d cyberctfproject.duckdns.org

# Check if certificates were created successfully
if [ -d "$(pwd)/certbot/etc/live/cyberctfproject.duckdns.org" ]; then
  echo "Certificates obtained successfully!"
  
  # Create the final nginx configuration with SSL
  cat > ./nginx.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name cyberctfproject.duckdns.org;
    
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name cyberctfproject.duckdns.org;
    
    ssl_certificate /etc/letsencrypt/live/cyberctfproject.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cyberctfproject.duckdns.org/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    
    location / {
        proxy_pass http://ctf_app:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

  # Create the final docker-compose file
  cat > ./docker-compose.yml <<EOF
version: '3'
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./public:/var/www/html
      - ./certbot/etc:/etc/letsencrypt
      - ./certbot/var:/var/lib/letsencrypt
    depends_on:
      - ctf_app
      
  ctf_app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ctf_app
    restart: always
    ports:
      - "3000:3000"
    command: npm run start
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - NODE_ENV=production
EOF

  # Restart docker-compose with the new configuration
  docker-compose down
  docker-compose up -d
  
  echo "Nginx restarted with SSL configuration!"
else
  echo "Failed to obtain certificates. Check the Certbot logs for more information."
fi
