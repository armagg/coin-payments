import fs from 'fs'
import path from 'path'
import { omit } from 'lodash'
import { FeeRateType, BalanceResult, TransactionStatus, NetworkType } from '@faast/payments-common'

import {
  HdLitecoinPayments, LitecoinTransactionInfo, HdLitecoinPaymentsConfig,
  LitecoinSignedTransaction, LitecoinUnsignedTransaction, AddressType,
} from '../src'

import { txInfo_e10d7, signedTx_valid, signedTx_invalid } from './fixtures/transactions'
import { accountsByAddressType, AccountFixture } from './fixtures/accounts'
import { END_TRANSACTION_STATES, delay, expectEqualWhenTruthy, logger, expectEqualOmit } from './utils'
import { toBigNumber } from '@faast/ts-common'
import BigNumber from 'bignumber.js'

const EXTERNAL_ADDRESS = 'MCTwS16sNbKENcr7qs5drkZTtSfaJLw8tB'

const SECRET_XPRV_FILE = 'test/keys/mainnet.key'

const rootDir = path.resolve(__dirname, '..')
const secretXprvFilePath = path.resolve(rootDir, SECRET_XPRV_FILE)
let secretXprv = ''
if (fs.existsSync(secretXprvFilePath)) {
  secretXprv = fs
    .readFileSync(secretXprvFilePath)
    .toString('utf8')
    .trim()
  logger.log(`Loaded ${SECRET_XPRV_FILE}. Send and sweep tests enabled.`)
} else {
  logger.log(
    `File ${SECRET_XPRV_FILE} missing. Send and sweep e2e mainnet tests will be skipped. To enable them ask Dylan to share the file with you.`,
  )
}

function assertTxInfo(actual: LitecoinTransactionInfo, expected: LitecoinTransactionInfo): void {
  expectEqualOmit(actual, expected, ['data.confirmations', 'confirmations'])
}

const describeAll = !secretXprv ? describe.skip : describe

describeAll('e2e mainnet', () => {
  let testsComplete = false

  afterAll(() => {
    testsComplete = true
  })

  const payments = new HdLitecoinPayments({
    hdKey: secretXprv,
    network: NetworkType.Mainnet,
    addressType: AddressType.SegwitNative,
    logger,
    targetUtxoPoolSize: 5,
  })
  const feeRate = '21'
  const feeRateType = FeeRateType.BasePerWeight
  const address0 = 'ltc1qcv0tz0xkwn7kxztk0n5kjzk3ww7jjmfax6xeez'
  const address0balance = '0.03'
  const address3 = 'ltc1qsatqfa63kujzjkzy58avm8x03fqx6yty2nt4s5'
  const xpub =
    'xpub6Bvk7TZL7RXk6vMPS3aTszwr57mYGEnWwS1gnoNiE3R7CxvRV6Nq9NChJwoztJG3rwNfyi1G368cfbgjpHyTYQWHqJSMZH4Nb7x7b92oeUF'
  const address0utxos = [
    {
      'txid': '99c436723346aa9f9b1dfa024266abc8f5d5f4b142a6bbfff56cf91687b8f348',
      'vout': 0,
      'value': '0.05',
      'satoshis': 5000000,
      'height': 613152,
      'confirmations': 8753
    }
  ]
  const omitUtxoFieldEquality = ['height', 'confirmations', 'lockTime']

  it('get correct xpub', async () => {
    expect(payments.xpub).toEqual(xpub)
  })
  it('get correct address for index 0', async () => {
    expect(await payments.getPayport(0)).toEqual({ address: address0 })
  })
  it('get correct address for index 3', async () => {
    expect(await payments.getPayport(3)).toEqual({ address: address3 })
  })
  it('get correct balance for index 0', async () => {
    expect(await payments.getBalance(0)).toEqual({
      confirmedBalance: address0balance,
      unconfirmedBalance: '0',
      spendableBalance: address0balance,
      sweepable: true,
      requiresActivation: false,
    })
  })
  it('get correct balance for address 0', async () => {
    expect(await payments.getBalance({ address: address0 })).toEqual({
      confirmedBalance: address0balance,
      unconfirmedBalance: '0',
      spendableBalance: address0balance,
      sweepable: true,
      requiresActivation: false,
    })
  })
  it('get correct balance for address 3', async () => {
    expect(await payments.getBalance({ address: address3 })).toEqual({
      confirmedBalance: '0',
      unconfirmedBalance: '0',
      spendableBalance: '0',
      sweepable: false,
      requiresActivation: false,
    })
  })

  it('can get balance of unused address', async () => {
    expect(await payments.getBalance(12345678)).toEqual({
      confirmedBalance: '0',
      unconfirmedBalance: '0',
      spendableBalance: '0',
      sweepable: false,
      requiresActivation: false,
    })
  })

  it('get transaction by arbitrary hash', async () => {
    const tx = await payments.getTransactionInfo('4d111229fefb8b856beafa1a5e2799a16d2718f558e1c0ada0fde13fd41653a9')
    assertTxInfo(tx, txInfo_e10d7)
  })
  it('fail to get an invalid transaction hash', async () => {
    await expect(payments.getTransactionInfo('123456abcdef'))
      .rejects.toThrow("Transaction '123456abcdef' not found")
  })

  it('creates transaction with fixed fee', async () => {
    const fee = '0.00005'
    const tx = await payments.createSweepTransaction(0, 3, { feeRate: fee, feeRateType: FeeRateType.Main })
    expect(tx.fee).toBe(fee)
  })
  it('create sweep transaction to an index', async () => {
    const tx = await payments.createSweepTransaction(0, 3, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    expect(toBigNumber(tx.amount).plus(tx.fee).toString()).toEqual(address0balance)
    expect(tx.fromAddress).toEqual(address0)
    expect(tx.toAddress).toEqual(address3)
    expect(tx.fromIndex).toEqual(0)
    expect(tx.toIndex).toEqual(3)
    expect(tx.inputUtxos).toBeTruthy()
  })
  it('create sweep transaction to an internal address', async () => {
    const tx = await payments.createSweepTransaction(0, { address: address3 }, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    expect(toBigNumber(tx.amount).plus(tx.fee).toString()).toEqual(address0balance)
    expect(tx.fromAddress).toEqual(address0)
    expect(tx.toAddress).toEqual(address3)
    expect(tx.fromIndex).toEqual(0)
    expect(tx.toIndex).toEqual(null)
    expect(tx.inputUtxos).toBeTruthy()
  })
  it('create sweep transaction to an external address', async () => {
    const tx = await payments.createSweepTransaction(0, { address: EXTERNAL_ADDRESS }, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    expect(toBigNumber(tx.amount).plus(tx.fee).toString()).toEqual(address0balance)
    expect(tx.fromAddress).toEqual(address0)
    expect(tx.toAddress).toEqual(EXTERNAL_ADDRESS)
    expect(tx.fromIndex).toEqual(0)
    expect(tx.toIndex).toEqual(null)
    expect(tx.inputUtxos).toBeTruthy()
  })
  it('create sweep transaction to an external address with unconfirmed utxos', async () => {
    const feeRate = '21'
    const tx = await payments.createSweepTransaction(0, { address: EXTERNAL_ADDRESS }, {
      useUnconfirmedUtxos: true,
      utxos: [{
        ...address0utxos[0],
        height: undefined,
        confirmations: undefined,
      }],
      feeRate,
      feeRateType,
    })
    expect(tx).toBeDefined()
    expect(toBigNumber(tx.amount).plus(tx.fee).toString()).toEqual(address0balance)
    expect(tx.fromAddress).toEqual(address0)
    expect(tx.toAddress).toEqual(EXTERNAL_ADDRESS)
    expect(tx.fromIndex).toEqual(0)
    expect(tx.toIndex).toEqual(null)
    expectEqualOmit(tx.inputUtxos, address0utxos, omitUtxoFieldEquality)
    const expectedTxSize = 112
    const expectedFee = new BigNumber(feeRate).times(expectedTxSize).times(1e-8).toString()
    expect(tx.fee).toBe(expectedFee)
  })

  it('create send transaction to an index', async () => {
    const amount = '0.00005'
    const feeRate = '21'
    const tx = await payments.createTransaction(0, 3, amount, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    expect(tx.amount).toEqual(amount)
    expect(tx.fromAddress).toEqual(address0)
    expect(tx.toAddress).toEqual(address3)
    expect(tx.fromIndex).toEqual(0)
    expect(tx.toIndex).toEqual(3)
    expectEqualOmit(tx.inputUtxos, address0utxos, omitUtxoFieldEquality)
    expect(tx.externalOutputs).toEqual([{ address: address3, value: amount }])
    const expectedTxSize = 140
    const expectedFee = new BigNumber(feeRate).times(expectedTxSize).times(1e-8).toString()
    expect(tx.fee).toBe(expectedFee)
    const expectedChange = new BigNumber(address0balance).minus(amount).minus(expectedFee).toString()
    expect(tx.data.changeOutputs).toEqual([{ address: address0, value: expectedChange }])
  })
  it('create send transaction to an internal address', async () => {
    const amount = '0.00005'
    const tx = await payments.createTransaction(0, { address: address3 }, amount, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    expect(tx.amount).toEqual(amount)
    expect(tx.fromAddress).toEqual(address0)
    expect(tx.toAddress).toEqual(address3)
    expect(tx.fromIndex).toEqual(0)
    expect(tx.toIndex).toEqual(null)
    expect(tx.inputUtxos).toBeTruthy()
  })

  it('can sign transaction', async () => {
    const tx = await payments.createSweepTransaction(0, 3, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    const signedTx = await payments.signTransaction(tx)
    expect(signedTx).toBeDefined()
    expect(signedTx.status).toBe(TransactionStatus.Signed)
    expect(signedTx.data.hex).toMatch(/^[a-f0-9]+$/)
    expect(signedTx.data.partial).toBe(false)
    expect(signedTx.data.unsignedTxHash).toMatch(/^[a-f0-9]+$/)
  })

  it('can sign transaction without rawHex', async () => {
    const tx = await payments.createSweepTransaction(0, 3, { feeRate, feeRateType })
    expect(tx).toBeDefined()
    tx.data.rawHex = undefined
    const signedTx = await payments.signTransaction(tx)
    expect(signedTx).toBeDefined()
    expect(signedTx.status).toBe(TransactionStatus.Signed)
    expect(signedTx.data.hex).toMatch(/^[a-f0-9]+$/)
    expect(signedTx.data.partial).toBe(false)
    expect(signedTx.data.unsignedTxHash).toMatch(/^[a-f0-9]+$/)
  })

  async function pollUntilEnded(signedTx: LitecoinSignedTransaction) {
    const txId = signedTx.id
    logger.log('polling until ended', txId)
    let tx: LitecoinTransactionInfo | undefined
    while (!testsComplete && (!tx || !END_TRANSACTION_STATES.includes(tx.status) || tx.confirmations === 0)) {
      try {
        tx = await payments.getTransactionInfo(txId)
      } catch (e) {
        if (e.message.includes('Transaction not found')) {
          logger.log('tx not found yet', txId, e.message)
        } else {
          throw e
        }
      }
      await delay(5000)
    }
    if (!tx) {
      throw new Error(`failed to poll until ended ${txId}`)
    }
    logger.log(tx.status, tx)
    expect(tx.id).toBe(signedTx.id)
    expect(tx.fromAddress).toBe(signedTx.fromAddress)
    expectEqualWhenTruthy(tx.fromExtraId, signedTx.fromExtraId)
    expect(tx.toAddress).toBe(signedTx.toAddress)
    expectEqualWhenTruthy(tx.toExtraId, signedTx.toExtraId)
    expect(tx.data).toBeDefined()
    expect(tx.status).toBe(TransactionStatus.Confirmed)
    expect(tx.isConfirmed).toBe(true)
    expect(tx.isExecuted).toBe(true)
    expect(tx.confirmationId).toMatch(/^\w+$/)
    expect(tx.confirmationTimestamp).toBeDefined()
    expect(tx.confirmations).toBeGreaterThan(0)
    return tx
  }

  jest.setTimeout(300 * 1000)

  it.skip('end to end sweep', async () => {
    const indicesToTry = [0, 1]
    const balances: { [i: number]: BalanceResult } = {}
    let indexToSweep: number = -1
    for (const index of indicesToTry) {
      const balanceResult = await payments.getBalance(index)
      balances[index] = balanceResult
      if (balanceResult.sweepable) {
        indexToSweep = index
        break
      }
    }
    if (indexToSweep < 0) {
      const allAddresses = await Promise.all(indicesToTry.map(async i => (await payments.getPayport(i)).address))
      throw new Error(`Cannot end to end test sweeping due to lack of funds. Send mainnet LTC to any of the following addresses and try again. ${JSON.stringify(allAddresses)}`)
    }
    const recipientIndex = indexToSweep === indicesToTry[0] ? indicesToTry[1] : indicesToTry[0]
    try {
      const unsignedTx = await payments.createSweepTransaction(indexToSweep, recipientIndex, { feeRate, feeRateType })
      const signedTx = await payments.signTransaction(unsignedTx)
      logger.log(`Sweeping ${signedTx.amount} from ${indexToSweep} to ${recipientIndex} in tx ${signedTx.id}`)
      expect(await payments.broadcastTransaction(signedTx)).toEqual({
        id: signedTx.id,
      })
      const tx = await pollUntilEnded(signedTx)
      expect(tx.amount).toEqual(signedTx.amount)
      expect(tx.fee).toEqual(signedTx.fee)
    } catch (e) {
      if ((e.message || (e as string)).includes('balance is not sufficient')) {
        logger.log('Ran consecutive tests too soon, previous sweep not complete. Wait a minute and retry')
      }
      throw e
    }
  })
  
  it.skip('end to end send', async () => {
    const indicesToTry = [1, 0]
    const balances: { [i: number]: BalanceResult } = {}
    let indexToSend: number = -1
    let highestBalance = toBigNumber(0)
    for (const index of indicesToTry) {
      const balanceResult = await payments.getBalance(index)
      balances[index] = balanceResult
      if (toBigNumber(balanceResult.confirmedBalance).gt(highestBalance)) {
        indexToSend = index
        break
      }
    }
    if (indexToSend < 0) {
      const allAddresses = await Promise.all(indicesToTry.map(async i => (await payments.getPayport(i)).address))
      throw new Error(`Cannot end to end test sweeping due to lack of funds. Send LTC to any of the following addresses and try again. ${JSON.stringify(allAddresses)}`)
    }
    const recipientIndex = indexToSend === indicesToTry[0] ? indicesToTry[1] : indicesToTry[0]
    const unsignedTx = await payments.createTransaction(
      indexToSend,
      recipientIndex,
      '0.03',
      { useUnconfirmedUtxos: true }, // Prevents consecutive tests from failing
    )
    const signedTx = await payments.signTransaction(unsignedTx)
    logger.log(`Sending ${signedTx.amount} from ${indexToSend} to ${recipientIndex} in tx ${signedTx.id}`)
    expect(await payments.broadcastTransaction(signedTx)).toEqual({
      id: signedTx.id,
    })
    // const tx = await pollUntilEnded(signedTx)
    const tx = await payments.getTransactionInfo(signedTx.id)
    expect(tx.amount).toEqual(signedTx.amount)
    expect(tx.fee).toEqual(signedTx.fee)
  })
})
