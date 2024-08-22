FROM python:3.9-slim
WORKDIR /app

# Install netcat, postgresql-client, and OpenSSH server
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    postgresql-client \
    openssh-server && \
    rm -rf /var/lib/apt/lists/*

# Set up the environment for Flask
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /run/sshd

# Copy the entire backend directory, including migrations
COPY . .
COPY sshd_config /etc/ssh/
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Allow root login with an empty password
RUN echo 'root:root' | chpasswd && \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Expose ports for Flask and SSH
EXPOSE 5000 2222

ENTRYPOINT ["./entrypoint.sh"]

# Start SSH and the Flask app
CMD ["/usr/sbin/sshd", "-D"]