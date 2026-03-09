import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";
import * as path from "node:path";

interface PersonServiceStackProps extends cdk.StackProps {
  environment: string;
}

export class PersonServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PersonServiceStackProps) {
    super(scope, id, props);

    const { environment } = props;

    const table = new dynamodb.Table(this, "PersonTable", {
      tableName: `${environment}-person-table`,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const eventBus = new events.EventBus(this, "PersonEventBus", {
      eventBusName: `${environment}-person-event-bus`,
    });

    const createPersonFn = new lambda.NodejsFunction(
      this,
      "CreatePersonFunction",
      {
        functionName: `${environment}-create-person`,
        entry: path.join(__dirname, "../src/api/create-person-handler.ts"),
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        environment: {
          TABLE_NAME: table.tableName,
          EVENT_BUS_NAME: eventBus.eventBusName,
        },
        bundling: {
          minify: true,
          sourceMap: true,
        },
      },
    );

    table.grantWriteData(createPersonFn);
    table.grantReadData(createPersonFn);
    eventBus.grantPutEventsTo(createPersonFn);

    const api = new apigateway.RestApi(this, "PersonApi", {
      restApiName: `${environment}-person-api`,
    });

    const personResource = api.root.addResource("person");
    personResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createPersonFn),
    );

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
  }
}
