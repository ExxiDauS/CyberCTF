FROM ubuntu:22.04

# Set environment variables with default values
ENV SSH_USER=defaultuser
ENV SSH_PASSWORD=defaultpassword
ENV FLAG=FewPeeranat

# Install necessary packages
RUN apt-get update && apt-get install -y \
    openssh-server \
    sudo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure SSH
RUN mkdir /var/run/sshd
RUN echo 'PermitRootLogin no' >> /etc/ssh/sshd_config
RUN echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config
RUN sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config

# Create script to set up user and start SSH
RUN echo '#!/bin/bash \n\
echo "Creating user $SSH_USER" \n\
useradd -m -s /bin/bash $SSH_USER \n\
echo "$SSH_USER:$SSH_PASSWORD" | chpasswd \n\
usermod -aG sudo $SSH_USER \n\
echo "$SSH_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$SSH_USER \n\
chmod 440 /etc/sudoers.d/$SSH_USER \n\
# Set bash as the default shell for the user\n\
echo "exec bash" > /home/$SSH_USER/.profile \n\
chown $SSH_USER:$SSH_USER /home/$SSH_USER/.profile \n\
/usr/sbin/sshd -D \
' > /start.sh

RUN chmod +x /start.sh

# Create the flag file correctly
RUN echo -n "SumetSan{" > .flags && \
    echo -n "$FLAG" | md5sum | cut -d ' ' -f1 >> .flags && \
    echo -n "}" >> .flags

# Expose SSH port
EXPOSE 22

# Start SSH server
CMD ["/start.sh"]