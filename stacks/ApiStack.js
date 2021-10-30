import * as sst from "@serverless-stack/resources";
//import HttpJwtAuthorizer from "@aws-cdk/aws-apigatewayv2-authorizers";

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { table } = props;

        // Create the API
        this.api = new sst.Api(this, "Api", {
            defaultFunctionProps: {
                environment: {
                    TABLE_NAME: table.tableName,
                    JWT_SECRET: "1xion-secret-jwt-2021-10-15",
                    JWT_EXPIRES_IN: "7d"
                },
            },
            cors: true,
            /*defaultAuthorizer: new HttpJwtAuthorizer({
                jwtAudience: ["UsGRQJJz5sDfPQDs6bhQ9Oc3hNISuVif"],
                jwtIssuer: "https://myorg.us.auth0.com",
            }),*/
            routes: {
                "POST   /auth/nonce": "src/auth.nonce",
                "POST   /auth/login": "src/auth.login",
                "POST   /auth/verify": "src/auth.verify",
                "GET    /auth/secure": {
                    //authorizationType: sst.ApiAuthorizationType.JWT,
                    function: "src/auth.secure",
                },
            },
        });

        // Allow the API to access the table
        this.api.attachPermissions([table]);

        // Show the API endpoint in the output
        this.addOutputs({
            ApiEndpoint: this.api.url,
        });
    }
}
