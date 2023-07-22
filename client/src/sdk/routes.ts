const ADD_WALLETCRED_ROUTE = '/add-user-credentials'
const GET_WALLETCRED_ROUTE = '/get-user-credentials'
const CHECK_INITCODE_ROUTE = '/check-init-code'
const IS_WALLETNAME_UNIQUE_ROUTE = '/check-walletname-exists'
const SERVER_URL = 'https://banana-server.xyz'
// const SERVER_URL = 'http://localhost:80'
const REGISTRATION_LAMBDA_URL = 'https://8zfpr8iyag.execute-api.us-east-1.amazonaws.com/extract_qvalues'
const VERIFICATION_LAMBDA_URL = 'https://muw05wa93c.execute-api.us-east-1.amazonaws.com/'
const K1_SIGNATURE_LAMBDA_URL = 'https://kd682delzj.execute-api.us-east-1.amazonaws.com/default/generateK1Signature'

export { ADD_WALLETCRED_ROUTE, GET_WALLETCRED_ROUTE, CHECK_INITCODE_ROUTE, IS_WALLETNAME_UNIQUE_ROUTE, SERVER_URL, REGISTRATION_LAMBDA_URL, VERIFICATION_LAMBDA_URL, K1_SIGNATURE_LAMBDA_URL }