// import {Credentials, OAuth2Client} from "google-auth-library";
// import {GoogleApis} from "googleapis";
import UserRepository from "../persistence/repositories/UserRepository.js";

type ScriptRunnerProps = {clientId: string, clientSecret: string, redirectUri: string, scriptId: string};
type ScriptRunnerDeps = {userRepository: UserRepository};

export default class ScriptRunner {
    private userRepository: any;
    private scriptId: string;
    // private auth: OAuth2Client;

    constructor({clientId, clientSecret, redirectUri, scriptId}: ScriptRunnerProps, {userRepository}: ScriptRunnerDeps) {
        this.userRepository = userRepository;
        this.scriptId = scriptId;
        // this.auth = new OAuth2Client({
        //     clientId,
        //     clientSecret,
        //     redirectUri,
        // });
    }

    // setCredentials(googleId: string, tokens: Credentials) {
    //     this.auth.setCredentials(tokens);
    //     this.auth.getAccessToken(async (err, token) => {
    //         if (err) {
    //             throw err;
    //         }
    //         await this.userRepository.updateAccessToken(googleId, token as string);
    //         this.auth.setCredentials({
    //             ...tokens,
    //             access_token: token,
    //         });
    //     });
    // }

    // async run(functionName: string, parameters: any[] = []) {
    //     try {
    //         const script = new GoogleApis({
    //             // conflicts between Auth type from google-auth-library and googleapis-common packages
    //             // @ts-ignore
    //             auth: this.auth,
    //         }).script('v1');
    //         const response = await script.scripts.run({
    //             scriptId: this.scriptId,
    //             requestBody: {
    //                 function: functionName,
    //                 parameters,
    //                 devMode: true,
    //             }
    //         });
    //         return JSON.parse(response.data.response?.result);
    //     } catch (e) {
    //         throw e;
    //     }
    // }

}
