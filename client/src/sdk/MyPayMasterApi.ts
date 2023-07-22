// @ts-nocheck
import { UserOperationStruct } from "@account-abstraction/contracts";
import { PaymasterAPI } from "@account-abstraction/sdk";


export class MyPaymasterApi extends PaymasterAPI {

    async getPaymasterAndData (userOp: Partial<UserOperationStruct>): Promise<string> {
        // return your paymaster information here
        return '0x'
    }
}