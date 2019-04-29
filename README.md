# Cloudwatch Cleaner

An example Serverless project to clean up old Cloudwatch Logs by setting automatically setting their retention period each night.  It is currently configured to set ALL CloudWatch Log Groups to a retention period of 180 days, and to run once per night to check for new log groups.

## Required Configuration

Manual Step:  Create a Lambda execution IAM role capable of calling 'describeLogGroups' and 'putLogRetentionPolicy' under AWS CloudwatchLogs.  Update deploy.env.yml with your role ARN.


## Dev Setup

This project is developed against NodeJS 8.10.  To install, run 

``` 
npm install
```

Additional helpful commands:

```
npm run start - start the project using the Serverless Offline module for local testing.  Not very useful since there are no events hooked up to, but you can add a simple HTTP get to test invocation locally.

npm run test - run all unit tests

npm run cover - generate a Code Coverage report with Istanbul.  
    Open up ./coverage/html/index.html for helpful details and coverage analysis

npm run deploy - deploy the project using your locally configured AWS credentials
```