import { FeeLevel } from '@faast/payments-common'

export const PACKAGE_NAME = 'ethereum-payments'
export const DECIMAL_PLACES = 18

export const DEFAULT_FULL_NODE = process.env.ETH_FULL_NODE_URL
export const DEFAULT_SOLIDITY_NODE = process.env.ETH_SOLIDITY_NODE_URL
export const DEFAULT_EVENT_SERVER = process.env.ETH_EVENT_SERVER_URL
export const DEFAULT_FEE_LEVEL = FeeLevel.Medium

export const FEE_LEVEL_MAP: { [key: string]: string } = {
  'low': 'SLOW',
  'medium': 'NORM',
  'high': 'FAST',
}
export const MIN_CONFIRMATIONS = 0
export const DEFAULT_GAS_PRICE_IN_WEI = '50000000000'
export const GAS_STATION_URL = 'https://ethgasstation.info'

// The following are effective maximum gas amounts for various txs we send
export const ETHEREUM_TRANSFER_COST = '50000'
export const CONTRACT_DEPLOY_COST = '285839'
export const TOKEN_SWEEP_COST = '816630'
export const TOKEN_TRANSFER_COST = '250000'

/** Multiply all web3 estimateGas calls by this because it's innacurate */
export const GAS_ESTIMATE_MULTIPLIER = 1.5

export const SPEED: { [key: string]: string } = {
  SLOW: 'safeLow',
  NORM: 'average',
  FAST: 'fast',
}
export const PRICES: { [key: string]: string } = {
  'ETHEREUM_TRANSFER': ETHEREUM_TRANSFER_COST,
  'CONTRACT_DEPLOY': CONTRACT_DEPLOY_COST,
  'TOKEN_SWEEP': TOKEN_SWEEP_COST,
  'TOKEN_TRANSFER': TOKEN_TRANSFER_COST,
}
