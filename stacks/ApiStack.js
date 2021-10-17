import * as sst from "@serverless-stack/resources";

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
            routes: {
                //"GET    /auth/nonce/{id}": "src/auth.nonce",
                "POST   /auth/login": "src/auth.login",
                "POST   /auth/verify": "src/auth.verify",
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
