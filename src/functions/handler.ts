import path = require("path");
require("app-module-path").addPath("." + path.sep + "build");
let dotenv = require("dotenv").config({silent: true});


import { CloudwatchCleanerLogic } from "src/functions/logic/cloudwatchCleanerLogic";

export function updateRetentions(event: any, context: any, callback: any) {
    CloudwatchCleanerLogic.handleUpdateRetentions(event, context, callback);
}




