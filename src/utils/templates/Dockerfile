FROM ubuntu:latest

# Install SSH server and other utilities
RUN apt-get update && apt-get install -y openssh-server sudo && \
    mkdir -p /run/sshd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Create a user for SSH access - super simplified version
RUN useradd -m sshuser && \
    usermod -aG sudo sshuser && \
    echo "sshuser:password" | chpasswd && \
    echo "sshuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]