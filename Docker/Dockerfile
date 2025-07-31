FROM mcr.microsoft.com/dotnet/aspnet:8.0

#
# App dependencies:
# 
# - libc6-dev
#
# Network utilities for troubleshooting:
#
# - iputils-ping
# - telnet
# - curl
#
# SSH Access for Azure - https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#enable-ssh
#
# - dialog
# - openssh-server
#
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libc6-dev \
        iputils-ping \
        telnet \
        curl \
        dialog \
        openssh-server \
    && echo "root:Docker!" | chpasswd

COPY sshd_config /etc/ssh/

WORKDIR /app
COPY publish .

ENV ASPNETCORE_ENVIRONMENT=Linux \
    ASPNETCORE_HTTP_PORTS=80 \
    DOTNET_NOLOGO=true \
    Bindings__HttpsMode=Optional \
    Bindings__UseReverseProxy=true

EXPOSE 80 2222

ENTRYPOINT ["./entrypoint.sh"]
