import Axios from 'axios'
import { UserCredentialObject, RequestType } from './interfaces/Banana.interface'
import constructUniqueIdentifier from './utils/constructUserUniqueIdentifier'
import { SERVER_URL, ADD_WALLETCRED_ROUTE, GET_WALLETCRED_ROUTE, CHECK_INITCODE_ROUTE,IS_WALLETNAME_UNIQUE_ROUTE} from './routes'
import { BANANA_SERVER } from './Constants';

Axios.defaults.baseURL = '';
const getUserCredentials = async (walletIdentifier: string) => {
    try {
        const identifier = constructUniqueIdentifier(walletIdentifier, window.location.hostname);
        const walletCredentials = await Axios({
            url: SERVER_URL + GET_WALLETCRED_ROUTE,
            method: RequestType.GET,
            params: {
                uniqueIdentifier: identifier
            }
        })

        if(walletCredentials.data.data !== '') {
            return JSON.parse(walletCredentials.data.data);
        }
        return '';
    } catch (err) {
        throw err;
    }
}

const setUserCredentials = async (userIdentifier: string, userCredentialObject: UserCredentialObject) => {
    try {
        const identifier = constructUniqueIdentifier(userIdentifier, window.location.hostname);
        const updateUserCredentialStatus = await Axios({
            url: SERVER_URL + ADD_WALLETCRED_ROUTE,
            method: RequestType.POST,
            data: {
                uniqueIdentifier: identifier,
                userCredentials: userCredentialObject
            }
        })

        if(updateUserCredentialStatus) 
        return {
            success: true
        }

        return {
            success: false
        }
    } catch (err) {
        throw err;
    }
}

const checkInitCodeStatus = async (walletIdentifier: string) => {
    try {
        const initCodeStatus = await Axios({
            url: SERVER_URL + CHECK_INITCODE_ROUTE,
            method: RequestType.GET,
            params: {
                uniqueIdentifier: walletIdentifier
            }
        });
        if(initCodeStatus.data.isInitCode) {
            return {
                isInitCode: true
            }
        }

        return {
            isInitCode: false
        }
    } catch (err) {
        throw err;
    }
}

const checkIsWalletNameExist = async (walletName: string) => {
    try {
        const identifier = constructUniqueIdentifier(walletName, window.location.hostname);
        const isWalletUnique = await Axios({
            url: SERVER_URL + IS_WALLETNAME_UNIQUE_ROUTE,
            method: RequestType.POST,
            data: {
                walletName: identifier
            }
        })
        if(isWalletUnique.data.isUnique) {
            return true;
        }
        return false;
    } catch (err) {
      throw err;
    }
}

const getUsernameFromSessionId = async (sessionId: string): Promise<string> => {
    try {
        const usernameResponse = await Axios({
            url: BANANA_SERVER + '/connect',
            method: RequestType.GET,
            params: {
                sessionId: sessionId
            }
        });
        //@ts-ignore
        return usernameResponse.data.data
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export { getUserCredentials, setUserCredentials, checkInitCodeStatus, checkIsWalletNameExist, getUsernameFromSessionId };