// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import './safe-contracts/Safe.sol';
import './interfaces/UserOperation.sol';
import './utils/EllipticalCurveLibrary.sol';
import './utils/Exec.sol';
import './utils/BytesUtils.sol';
import './utils/Base64.sol';
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';
import { IERC20 } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol';

contract BananaAccount is Safe, AxelarExecutable {
    event TokenReceivedEvent(string tokenSymbol, string sourceAddress, uint256 amount, string sourceChain);

    using BytesUtils for bytes32;

    //return value in case of signature failure, with no time-range.
    uint256 internal constant SIG_VALIDATION_FAILED = 1;

    //EIP4337 trusted entrypoint
    address public entryPoint;
     IAxelarGasService immutable gasService;

    //maintaing mapping of encodedId to qValues
    mapping (bytes32 => uint256[2]) public encodedIdHashToQValues;

    constructor(address _gateway, address _gasReceiver) AxelarExecutable(_gateway) {
         gasService = IAxelarGasService(_gasReceiver);
    }

    function setupWithEntrypoint(
        address[] calldata _owners,
        uint256 _threshold,
        address to,
        bytes calldata data,
        address fallbackHandler,
        address paymentToken,
        uint256 payment,
        address payable paymentReceiver,
        address _entryPoint,
        bytes32 _encodedIdHash,
        uint256[2] memory _qValues
    ) external {
        entryPoint = _entryPoint;
        encodedIdHashToQValues[_encodedIdHash] = _qValues;

        _executeAndRevert(
            address(this),
            0,
            abi.encodeCall(
                Safe.setup,
                (
                    _owners,
                    _threshold,
                    to,
                    data,
                    fallbackHandler,
                    paymentToken,
                    payment,
                    paymentReceiver
                )
            ),
            Enum.Operation.DelegateCall
        );
    }

    function _payPrefund(uint256 missingAccountFunds) internal {
        if (missingAccountFunds != 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds,
                gas: type(uint256).max
            }('');
            (success);
            //ignore failure (its EntryPoint's job to verify, not account.)
        }
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        _requireFromEntryPoint();
        validationData = _validateSignature(userOp, userOpHash);
        require(userOp.nonce < type(uint64).max, 'account: nonsequential nonce');
        _payPrefund(missingAccountFunds);
    }

    /**
     * ensure the request comes from the known entrypoint.
     */
    function _requireFromEntryPoint() internal view virtual {
        require(msg.sender == entryPoint, 'account: not from EntryPoint');
    }

    function _getMessageToBeSigned(
        bytes32 userOpHash,
        bytes memory authenticatorData,
        string memory clientDataJSONPre,
        string memory clientDataJSONPost
    ) internal pure returns (bytes32 messageToBeSigned) {
        bytes memory base64RequestId = bytes(Base64.encode(userOpHash.bytes32ToString()));
        string memory clientDataJSON = string.concat(
            clientDataJSONPre,
            string(base64RequestId),
            clientDataJSONPost
        );
        messageToBeSigned = sha256(bytes.concat(authenticatorData, sha256(bytes(clientDataJSON))));
    }

    /// implement template method of BaseAccount
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual returns (uint256 validationData) {
        (
            uint256 r,
            uint256 s,
            bytes memory authenticatorData,
            string memory clientDataJSONPre,
            string memory clientDataJSONPost,
            bytes32 encodedIdHash
        ) = abi.decode(userOp.signature, (uint256, uint256, bytes, string, string, bytes32));

        bool success = Secp256r1.Verify(
            uint(
                _getMessageToBeSigned(
                    userOpHash,
                    authenticatorData,
                    clientDataJSONPre,
                    clientDataJSONPost
                )
            ),
            [r, s],
            encodedIdHashToQValues[encodedIdHash]
        );

        if (!success) return SIG_VALIDATION_FAILED;
        return 0;
    }

    function execTransactionFromEntrypoint(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public {
        // Only Entrypoint is allowed.
        require(msg.sender == entryPoint, 'account: not from EntryPoint');
        // Execute transaction without further confirmations.
        // just for testing
         emit TokenReceivedEvent("sample", "0x288d1d682311018736B820294D22Ed0DBE372188", 10, "chain");
        _executeAndRevert(to, value, data, operation);
    }


    function execBatchTransactionFromEntrypoint(
        address[] calldata to,
        uint256[] calldata value,
        bytes[] memory data,
        Enum.Operation operation
    ) public {
        // Only Entrypoint is allowed.
        require(msg.sender == entryPoint, 'account: not from EntryPoint');
        // Execute transaction without further confirmations.
        require(to.length == data.length, "wrong array lengths");
        for(uint256 i=0; i < to.length; i++) {
            _executeAndRevert(to[i], value[i], data[i], operation);
        }
    }
    function _executeWithToken(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
        ) internal override {
            emit TokenReceivedEvent(tokenSymbol, sourceAddress, amount, sourceChain);
    }

       function crossChainTransact(
        string memory symbol,
        string memory destinationChain,
        string memory contractAddress,
        uint256 amount,
        bytes memory payload
    ) public payable {
        address tokenX = gateway.tokenAddresses(symbol);
        IERC20(tokenX).approve(address(gateway), amount);

        gasService.payNativeGasForContractCallWithToken{value: msg.value}(
            address(this),
            destinationChain,
            contractAddress,
            payload,
            symbol,
            amount,
            msg.sender
        );

        gateway.callContractWithToken(destinationChain, contractAddress, payload, symbol, amount);
    }


    function verifySignature(bytes32 messageToBeSigned, uint256[2] calldata signature, uint256[2] calldata publicKey) external view returns (bool) {
        return Secp256r1.Verify(
            uint(messageToBeSigned),
            signature,
            publicKey
        );
    }

    function _executeAndRevert(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) internal {
        bool success = execute(to, value, data, operation, type(uint256).max);

        bytes memory returnData = Exec.getReturnData(type(uint256).max);
        // Revert with the actual reason string
        // Adopted from: https://github.com/Uniswap/v3-periphery/blob/464a8a49611272f7349c970e0fadb7ec1d3c1086/contracts/base/Multicall.sol#L16-L23
        if (!success) {
            if (returnData.length < 68) revert();
            assembly {
                returnData := add(returnData, 0x04)
            }
            revert(abi.decode(returnData, (string)));
        }
    }
}
