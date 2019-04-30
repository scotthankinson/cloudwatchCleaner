#!/bin/bash

RETENTION_PERIOD="180"
LOG_GROUPS=($(aws logs describe-log-groups --output json | grep 'logGroupName'))

for i in "${LOG_GROUPS[@]}"
do
   if [[ $i =~ .*"logGroupName".* ]]
   then
      continue
   else 
      NAME="${i:1:${#i}-3}"
      echo "Updating log group for $NAME"
      aws logs  put-retention-policy --log-group-name ${NAME} --retention-in-days ${RETENTION_PERIOD}
   fi
done

