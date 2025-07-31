#!/bin/bash

log () {
  if [[ -z $QUIET ]]; then echo $1; fi
}

QUIET=
for i
do if [[ $i == "-q" || $i == "--quiet" ]]; then QUIET=1; fi
done

log "Election Auditor entrypoint invoked"

if [[ ${ASPNETCORE_ENVIRONMENT^^} == "AZURE" || ${SSH_ENABLED^^} == "TRUE" ]]; then
  
  log "Starting SSH service"
  
  # Get env vars in the Dockerfile to show up in the SSH session - https://azureossd.github.io/2022/04/27/2022-Enabling-SSH-on-Linux-Web-App-for-Containers/
  eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)
  
  # Start service
  service ssh start
fi

log "Starting application"
dotnet Webvoto.ElectionAuditor.Site.dll "$@"
