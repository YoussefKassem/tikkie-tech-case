#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PersonServiceStack } from "../infrastructure/person-service-stack";

const app = new cdk.App();
const environment = app.node.tryGetContext("environment") ?? "dev";

new PersonServiceStack(app, `${environment}-PersonServiceStack`, {
	environment,
});
