import {
  deriveAddress,
  derivePrivateKey,
  splitDerivationPath,
  deriveHDNode,
  deriveKeyPair,
  xprvToXpub,
  isValidXprv,
  isValidXpub,
} from '../src/bip44'
import { AddressType } from '../src'
import { fromBase58 } from 'bip32'
import {
  DERIVED_XPRV, DERIVATION_PATH, ROOT_XPRV, NETWORK, PARTIALLY_DERIVED_XPRV, ADDRESS_LEGACY,
  ADDRESS_SEGWIT_P2SH, ADDRESS_SEGWIT_NATIVE, PRIVATE_KEY, DERIVED_XPUB
} from './fixtures'

export const BASE_NODE = fromBase58(DERIVED_XPRV, NETWORK)

describe('bip44', () => {
  describe('splitDerivationPath', () => {
    it('returns correct value', () => {
      expect(splitDerivationPath(DERIVATION_PATH)).toEqual(["44'", "2'", "0'"])
    })
  })
  describe('deriveHDNode', () => {
    it('derives root xprv correctly', () => {
      expect(deriveHDNode(ROOT_XPRV, DERIVATION_PATH, NETWORK).toBase58()).toEqual(DERIVED_XPRV)
    })
    it('derives partially derived xprv correctly', () => {
      expect(deriveHDNode(PARTIALLY_DERIVED_XPRV, DERIVATION_PATH, NETWORK).toBase58()).toEqual(DERIVED_XPRV)
    })
    it('derives fully derived xprv correctly', () => {
      expect(deriveHDNode(DERIVED_XPRV, DERIVATION_PATH, NETWORK).toBase58()).toEqual(DERIVED_XPRV)
    })
  })
  describe('deriveKeyPair', () => {
    it('derives index correctly', () => {
      expect(deriveKeyPair(BASE_NODE, 2, NETWORK)).toEqual(BASE_NODE.derive(0).derive(2))
    })
  })
  describe('deriveAddress', () => {
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 2, NETWORK, AddressType.Legacy)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 0, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 1, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 5, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 6, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 10, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 10000, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives legacy address', () => {
      expect(deriveAddress(BASE_NODE, 20000, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_LEGACY)
    })
    it('derives p2sh segwit address', () => {
      expect(deriveAddress(BASE_NODE, 2, NETWORK, AddressType.SegwitP2SH)).toBe(ADDRESS_SEGWIT_P2SH)
    })
    it('derives native segwit address', () => {
      expect(deriveAddress(BASE_NODE, 2, NETWORK, AddressType.SegwitNative)).toBe(ADDRESS_SEGWIT_NATIVE)
    })
  })
  describe('derivePrivateKey', () => {
    it('derives private key', () => {
      expect(derivePrivateKey(BASE_NODE, 2, NETWORK)).toBe(PRIVATE_KEY)
    })
  })
  describe('xprvToXpub', () => {
    it('returns correct xpub for root xprv', () => {
      expect(xprvToXpub(ROOT_XPRV, DERIVATION_PATH, NETWORK)).toEqual(DERIVED_XPUB)
    })
    it('returns correct xpub for partially derived xprv', () => {
      expect(xprvToXpub(PARTIALLY_DERIVED_XPRV, DERIVATION_PATH, NETWORK)).toEqual(DERIVED_XPUB)
    })
    it('returns correct xpub for fully derived xprv', () => {
      expect(xprvToXpub(DERIVED_XPRV, DERIVATION_PATH, NETWORK)).toEqual(DERIVED_XPUB)
    })
  })
  describe('isValidXpub', () => {
    it('should return true for valid', () => {
      expect(isValidXpub(DERIVED_XPUB, NETWORK)).toBe(true)
    })
    it('should return false for invalid', () => {
      expect(isValidXpub('xpat1234', NETWORK)).toBe(false)
    })
  })
  describe('isValidXprv', () => {
    it('should return true for valid', () => {
      expect(isValidXprv(DERIVED_XPRV, NETWORK)).toBe(true)
    })
    it('should return false for invalid', () => {
      expect(isValidXprv('xpat1234', NETWORK)).toBe(false)
    })
  })
})
