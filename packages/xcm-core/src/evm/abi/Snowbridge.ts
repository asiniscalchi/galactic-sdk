export const SNOWBRIDGE = [
  {
    inputs: [
      { internalType: 'address', name: 'beefyClient', type: 'address' },
      { internalType: 'address', name: 'agentExecutor', type: 'address' },
      { internalType: 'ParaID', name: 'bridgeHubParaID', type: 'uint32' },
      { internalType: 'bytes32', name: 'bridgeHubAgentID', type: 'bytes32' },
      { internalType: 'uint8', name: 'foreignTokenDecimals', type: 'uint8' },
      {
        internalType: 'uint128',
        name: 'destinationMaxTransferFee',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AgentAlreadyCreated', type: 'error' },
  { inputs: [], name: 'AgentDoesNotExist', type: 'error' },
  { inputs: [], name: 'ChannelAlreadyCreated', type: 'error' },
  { inputs: [], name: 'ChannelDoesNotExist', type: 'error' },
  { inputs: [], name: 'Disabled', type: 'error' },
  { inputs: [], name: 'InsufficientEther', type: 'error' },
  { inputs: [], name: 'InvalidAgentExecutionPayload', type: 'error' },
  { inputs: [], name: 'InvalidChannelUpdate', type: 'error' },
  { inputs: [], name: 'InvalidCodeHash', type: 'error' },
  { inputs: [], name: 'InvalidConstructorParams', type: 'error' },
  { inputs: [], name: 'InvalidContract', type: 'error' },
  { inputs: [], name: 'InvalidNonce', type: 'error' },
  { inputs: [], name: 'InvalidProof', type: 'error' },
  { inputs: [], name: 'NativeTransferFailed', type: 'error' },
  { inputs: [], name: 'NotEnoughGas', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'x', type: 'uint256' },
      { internalType: 'uint256', name: 'y', type: 'uint256' },
    ],
    name: 'PRBMath_MulDiv18_Overflow',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'x', type: 'uint256' },
      { internalType: 'uint256', name: 'y', type: 'uint256' },
      { internalType: 'uint256', name: 'denominator', type: 'uint256' },
    ],
    name: 'PRBMath_MulDiv_Overflow',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'x', type: 'uint256' }],
    name: 'PRBMath_UD60x18_Convert_Overflow',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'UD60x18', name: 'x', type: 'uint256' }],
    name: 'PRBMath_UD60x18_Exp2_InputTooBig',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'UD60x18', name: 'x', type: 'uint256' }],
    name: 'PRBMath_UD60x18_Log_InputTooSmall',
    type: 'error',
  },
  { inputs: [], name: 'TokenNotRegistered', type: 'error' },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'agentID',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'agent',
        type: 'address',
      },
    ],
    name: 'AgentCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'ChannelID',
        name: 'channelID',
        type: 'bytes32',
      },
    ],
    name: 'ChannelCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'ChannelID',
        name: 'channelID',
        type: 'bytes32',
      },
    ],
    name: 'ChannelUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'tokenID',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'ForeignTokenRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'ChannelID',
        name: 'channelID',
        type: 'bytes32',
      },
      { indexed: false, internalType: 'uint64', name: 'nonce', type: 'uint64' },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageID',
        type: 'bytes32',
      },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
    ],
    name: 'InboundMessageDispatched',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum OperatingMode',
        name: 'mode',
        type: 'uint8',
      },
    ],
    name: 'OperatingModeChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'ChannelID',
        name: 'channelID',
        type: 'bytes32',
      },
      { indexed: false, internalType: 'uint64', name: 'nonce', type: 'uint64' },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageID',
        type: 'bytes32',
      },
      { indexed: false, internalType: 'bytes', name: 'payload', type: 'bytes' },
    ],
    name: 'OutboundMessageAccepted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'PricingParametersChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'TokenRegistrationSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'ParaID',
        name: 'destinationChain',
        type: 'uint32',
      },
      {
        components: [
          { internalType: 'enum Kind', name: 'kind', type: 'uint8' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        indexed: false,
        internalType: 'struct MultiAddress',
        name: 'destinationAddress',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
    ],
    name: 'TokenSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'TokenTransferFeesChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    inputs: [],
    name: 'AGENT_EXECUTOR',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'BEEFY_CLIENT',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'agentExecute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'agentID', type: 'bytes32' }],
    name: 'agentOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'ChannelID', name: 'channelID', type: 'bytes32' }],
    name: 'channelNoncesOf',
    outputs: [
      { internalType: 'uint64', name: '', type: 'uint64' },
      { internalType: 'uint64', name: '', type: 'uint64' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'ChannelID', name: 'channelID', type: 'bytes32' }],
    name: 'channelOperatingModeOf',
    outputs: [{ internalType: 'enum OperatingMode', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'createAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'createChannel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'depositEther',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'isTokenRegistered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'ChannelID', name: 'channelID', type: 'bytes32' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'mintForeignToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'operatingMode',
    outputs: [{ internalType: 'enum OperatingMode', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pricingParameters',
    outputs: [
      { internalType: 'UD60x18', name: '', type: 'uint256' },
      { internalType: 'uint128', name: '', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'queryForeignTokenID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'quoteRegisterTokenFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'ParaID', name: 'destinationChain', type: 'uint32' },
      { internalType: 'uint128', name: 'destinationFee', type: 'uint128' },
    ],
    name: 'quoteSendTokenFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'registerForeignToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'registerToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'ParaID', name: 'destinationChain', type: 'uint32' },
      {
        components: [
          { internalType: 'enum Kind', name: 'kind', type: 'uint8' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct MultiAddress',
        name: 'destinationAddress',
        type: 'tuple',
      },
      { internalType: 'uint128', name: 'destinationFee', type: 'uint128' },
      { internalType: 'uint128', name: 'amount', type: 'uint128' },
    ],
    name: 'sendToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'setOperatingMode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'setPricingParameters',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'setTokenTransferFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'ChannelID', name: 'channelID', type: 'bytes32' },
          { internalType: 'uint64', name: 'nonce', type: 'uint64' },
          { internalType: 'enum Command', name: 'command', type: 'uint8' },
          { internalType: 'bytes', name: 'params', type: 'bytes' },
          { internalType: 'uint64', name: 'maxDispatchGas', type: 'uint64' },
          { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
          { internalType: 'uint256', name: 'reward', type: 'uint256' },
          { internalType: 'bytes32', name: 'id', type: 'bytes32' },
        ],
        internalType: 'struct InboundMessage',
        name: 'message',
        type: 'tuple',
      },
      { internalType: 'bytes32[]', name: 'leafProof', type: 'bytes32[]' },
      {
        components: [
          {
            components: [
              { internalType: 'bytes32', name: 'parentHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'number', type: 'uint256' },
              { internalType: 'bytes32', name: 'stateRoot', type: 'bytes32' },
              {
                internalType: 'bytes32',
                name: 'extrinsicsRoot',
                type: 'bytes32',
              },
              {
                components: [
                  { internalType: 'uint256', name: 'kind', type: 'uint256' },
                  {
                    internalType: 'bytes4',
                    name: 'consensusEngineID',
                    type: 'bytes4',
                  },
                  { internalType: 'bytes', name: 'data', type: 'bytes' },
                ],
                internalType: 'struct Verification.DigestItem[]',
                name: 'digestItems',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct Verification.ParachainHeader',
            name: 'header',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'uint256', name: 'pos', type: 'uint256' },
              { internalType: 'uint256', name: 'width', type: 'uint256' },
              { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
            ],
            internalType: 'struct Verification.HeadProof',
            name: 'headProof',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'uint8', name: 'version', type: 'uint8' },
              { internalType: 'uint32', name: 'parentNumber', type: 'uint32' },
              { internalType: 'bytes32', name: 'parentHash', type: 'bytes32' },
              {
                internalType: 'uint64',
                name: 'nextAuthoritySetID',
                type: 'uint64',
              },
              {
                internalType: 'uint32',
                name: 'nextAuthoritySetLen',
                type: 'uint32',
              },
              {
                internalType: 'bytes32',
                name: 'nextAuthoritySetRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct Verification.MMRLeafPartial',
            name: 'leafPartial',
            type: 'tuple',
          },
          { internalType: 'bytes32[]', name: 'leafProof', type: 'bytes32[]' },
          { internalType: 'uint256', name: 'leafProofOrder', type: 'uint256' },
        ],
        internalType: 'struct Verification.Proof',
        name: 'headerProof',
        type: 'tuple',
      },
    ],
    name: 'submitV1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'tokenID', type: 'bytes32' }],
    name: 'tokenAddressOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'transferNativeToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'updateChannel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'upgrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
