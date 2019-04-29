import AWS = require("aws-sdk");
import path = require("path");
require("app-module-path").addPath("." + path.sep + "build");
let dotenv = require("dotenv").config({silent: true});

AWS.config.update({ region: "us-east-1" });
const RETENTION_PERIOD = 180; // How long to keep logs

export class CloudwatchCleanerLogic {

    static handleUpdateRetentions = async (event: any, context: any, callback: any) => {
        let cwLogs = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
        let lambdaUpdates = await CloudwatchCleanerLogic.setRetentionsForPrefix(cwLogs, "/aws/lambda");
        let apiGatewayUpdates = await CloudwatchCleanerLogic.setRetentionsForPrefix(cwLogs, "/aws/apigateway");
        let message = (lambdaUpdates + apiGatewayUpdates) + " Retention Period(s) Updated";
        console.log(message);
        // Handy if we hook up a GET request for testing
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({message})
        });
    }

    static setRetentionsForPrefix = async (cwLogs: AWS.CloudWatchLogs, prefix: string, nextToken?: string) => {
        let updated = 0;
        try {
            let data: AWS.CloudWatchLogs.DescribeLogGroupsResponse = await cwLogs.describeLogGroups({logGroupNamePrefix: prefix, nextToken}).promise();
            if (data.logGroups) {
                console.log(data.logGroups);
                for(let logGroup of data.logGroups) {
                    if (logGroup.retentionInDays !== RETENTION_PERIOD) {
                        updated += 1;
                        let params: AWS.CloudWatchLogs.PutRetentionPolicyRequest = {
                            "logGroupName": logGroup.logGroupName as string,
                            "retentionInDays": RETENTION_PERIOD
                        };
                        await cwLogs.putRetentionPolicy(params).promise();
                    }
                }
            }
            if (data.nextToken)
                updated += await CloudwatchCleanerLogic.setRetentionsForPrefix(cwLogs, prefix, data.nextToken);
        } catch(err) {
            console.log(err, err.stack); // Something went wrong
        }
        return updated;
    }
}