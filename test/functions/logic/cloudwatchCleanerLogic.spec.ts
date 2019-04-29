import expect = require("expect.js");
import AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

import { CloudwatchCleanerLogic } from "src/functions/logic/cloudwatchCleanerLogic";


describe("CloudwatchCleanerLogic", () => {

    let sandbox: any;
    let sinon: any;

    before(() => {
        sinon = require("sinon");
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("#handleUpdateRetentions", () => {

        it("should return 200 on a happy path", (done) => {
            let findStub = sandbox.stub(CloudwatchCleanerLogic, "setRetentionsForPrefix").resolves(2);
            let callbackSuccess = (err: any, res: any) => {
                expect(res.statusCode).to.equal(200);
                done();
            };
            CloudwatchCleanerLogic.handleUpdateRetentions(null, null, callbackSuccess);
        });
    });

    describe("#setRetentionsForPrefix", () => {
        it ("should call describeLogGroups and get no data back", async () => {
            let cw = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
            const describeStub = sandbox.stub(cw, "describeLogGroups").returns({
                promise : () => { return {}; }
            });

            let result = await CloudwatchCleanerLogic.setRetentionsForPrefix(cw, "waffles");
            expect(result).to.equal(0);
        });

        it ("should call describeLogGroups", async () => {
            let cw = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
            const describeStub = sandbox.stub(cw, "describeLogGroups").returns({
                promise : () => { return { logGroups: []}; }
            });

            let result = await CloudwatchCleanerLogic.setRetentionsForPrefix(cw, "waffles");
            expect(result).to.equal(0);
        });

        it ("should return data with matching retentionInDays", async () => {
            let cw = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
            const describeStub = sandbox.stub(cw, "describeLogGroups").returns({
                promise : () => {
                    return {
                        logGroups: [{ logGroupName: "/aws/lambda/test1",
                        creationTime: 1500921394994,
                        retentionInDays: 180,
                        metricFilterCount: 0,
                        arn: "arn1",
                        storedBytes: 1031 }
                    ]
                    };
                }
            });

            let result = await CloudwatchCleanerLogic.setRetentionsForPrefix(cw, "waffles");
            expect(result).to.equal(0);
        });

        it ("should return data with mismatching retentionInDays", async () => {
            let cw = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
            const describeStub = sandbox.stub(cw, "describeLogGroups").returns({
                promise : () => {
                    return {
                        logGroups: [{ logGroupName: "/aws/lambda/test1",
                        creationTime: 1500921394994,
                        retentionInDays: 1,
                        metricFilterCount: 0,
                        arn: "arn1",
                        storedBytes: 1031 }
                    ]
                    };
                }
            });

            const putStub = sandbox.stub(cw, "putRetentionPolicy").returns({
                promise : () => {
                    return {
                        "Message": "Success"
                    };
                }
            });

            let result = await CloudwatchCleanerLogic.setRetentionsForPrefix(cw, "waffles");
            expect(result).to.equal(1);
        });

        it ("should return a nextToken", async () => {
            let cw = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
            const describeStub = sandbox.stub(cw, "describeLogGroups");
            describeStub.onCall(0).returns({
                promise : () => {
                    return {
                        nextToken: "12345",
                        logGroups: [{ logGroupName: "/aws/lambda/test1",
                        creationTime: 1500921394994,
                        retentionInDays: 180,
                        metricFilterCount: 0,
                        arn: "arn1",
                        storedBytes: 1031 }
                    ]
                    };
                }
            });
            describeStub.onCall(1).returns({
                promise : () => {
                    return {
                        logGroups: [{ logGroupName: "/aws/lambda/test1",
                        creationTime: 1500921394994,
                        retentionInDays: 180,
                        metricFilterCount: 0,
                        arn: "arn1",
                        storedBytes: 1031 }
                    ]
                    };
                }
            });

            let result = await CloudwatchCleanerLogic.setRetentionsForPrefix(cw, "waffles");
            expect(result).to.equal(0);
        });

        it ("should swallow errors", async () => {
            let cw = new AWS.CloudWatchLogs({apiVersion: "2014-03-28"});
            const describeStub = sandbox.stub(cw, "describeLogGroups").returns({
                promise : () => { throw new Error("Oops!"); }
            });

            let result = await CloudwatchCleanerLogic.setRetentionsForPrefix(cw, "waffles");
            expect(result).to.equal(0);
        });

    });

});

