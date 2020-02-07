import * as t from 'io-ts'
import {
  extendCodec,
  Logger,
  nullable,
  Numeric
} from '@faast/ts-common'
import {
  BaseTransactionInfo,
  BaseUnsignedTransaction,
  BaseSignedTransaction,
  BaseBroadcastResult,
  BaseConfig,
  Payport,
  FromTo,
  ResolveablePayport,
  ResolvedFeeOption,
} from '@faast/payments-common'

const keys = t.type({
    pub: t.string,
    prv: t.string,
})

const xkeys = t.type({
  xprv: t.string,
  xpub: t.string,
})

const NullableOptionalString = t.union([t.string, t.null, t.undefined])
const OptionalString = t.union([t.string, t.undefined])

export const EthereumSignatory = t.type(
  {
    address: t.string,
    keys,
    xkeys,
  },
  'EthereumSignatory',
)
export type EthereumSignatory = t.TypeOf<typeof EthereumSignatory>

export const BaseEthereumPaymentsConfig = extendCodec(
  BaseConfig,
  {},
  {
    fullNode:   OptionalString,
    parityNode: OptionalString,
    gasStation: OptionalString,
  },
  'BaseEthereumPaymentsConfig',
)
export type BaseEthereumPaymentsConfig = t.TypeOf<typeof BaseEthereumPaymentsConfig>

export const HdEthereumPaymentsConfig = extendCodec(
  BaseEthereumPaymentsConfig,
  {
    hdKey: t.string,
  },
  'HdEthereumPaymentsConfig',
)
export type HdEthereumPaymentsConfig = t.TypeOf<typeof HdEthereumPaymentsConfig>


export const KeyPairEthereumPaymentsConfig = extendCodec(
  BaseEthereumPaymentsConfig,
  {
    // can be private keys or addresses
    keyPairs: t.union([t.array(NullableOptionalString), t.record(t.number, NullableOptionalString)]),
  },
  'KeyPairEthereumPaymentsConfig',
)
export type KeyPairEthereumPaymentsConfig = t.TypeOf<typeof KeyPairEthereumPaymentsConfig>

export const EthereumPaymentsConfig = t.union([HdEthereumPaymentsConfig, KeyPairEthereumPaymentsConfig], 'EthereumPaymentsConfig')
export type EthereumPaymentsConfig = t.TypeOf<typeof EthereumPaymentsConfig>

export const EthereumUnsignedTransaction = extendCodec(
  BaseUnsignedTransaction,
  {
    id: t.string,
    amount: t.string,
    fee: t.string,
  },
  'EthereumUnsignedTransaction',
)
export type EthereumUnsignedTransaction = t.TypeOf<typeof EthereumUnsignedTransaction>

export const EthereumSignedTransaction = extendCodec(
  BaseSignedTransaction,
  {},
  {},
  'EthereumSignedTransaction'
)
export type EthereumSignedTransaction = t.TypeOf<typeof EthereumSignedTransaction>

export const EthereumTransactionInfo = extendCodec(
  BaseTransactionInfo,
  {},
  {},
  'EthereumTransactionInfo')
export type EthereumTransactionInfo = t.TypeOf<typeof EthereumTransactionInfo>

export const EthereumBroadcastResult = extendCodec(
  BaseBroadcastResult,
  {
    transactionHash: t.string,
    transactionIndex: t.number,
    blockHash: t.string,
    blockNumber: t.number,
    from: t.string,
    to: t.string,
    gasUsed: t.number,
    cumulativeGasUsed: t.number,
    contractAddress: t.null,
    logs: t.array(t.any),
    status: t.boolean,
    logsBloom: t.string,
    v: t.string,
    r: t.string,
    s: t.string,
  },
  'EthereumBroadcastResult',
)
export type EthereumBroadcastResult = t.TypeOf<typeof EthereumBroadcastResult>

export const EthereumResolvedFeeOption = extendCodec(
  ResolvedFeeOption,
  {
    gasPrice: t.string,
  },
  'EthereumResolvedFeeOption'
)
export type EthereumResolvedFeeOption = t.TypeOf<typeof EthereumResolvedFeeOption>
