import expect = require("expect.js");
import { updateRetentions } from "src/functions/handler";
import { CloudwatchCleanerLogic } from "src/functions/logic/cloudwatchCleanerLogic";

describe("handler", () => {
    describe("#updateRetentions", () => {

        let sinon: any;

        before(function () {
            sinon = require("sinon");
        });

        it("should call handleCheckReservation", (done) => {
            let handlerStub = sinon.stub(CloudwatchCleanerLogic, "handleUpdateRetentions").callsFake(
                (event: any, context: any, callback: any) => {
                    const response = { statusCode: 200 };
                    callback(null, response);
                });

            let callbackSuccess = (err: any, res: any) => {
                expect(res.statusCode).to.equal(200);
                handlerStub.restore();
                done();
            };

            updateRetentions(null, null, callbackSuccess);
        });
    });
});

