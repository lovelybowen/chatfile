import { bootstrapBefore } from 'configs/bootstrap'
import development, { EevRecord } from 'configs/constants/development'
import staging from 'configs/constants/staging'
import production from 'configs/constants/production'
import { ENVS } from 'configs/constants/envs'

const parsedEnvs = bootstrapBefore()

const getCurrentEnv = (): ENVS => {
  const env = process.env?.ENV
  if (typeof env === 'undefined') {
    console.warn(`/n> ENV is not set, fallback to ${ENVS.DEVELOPMENT}.`)
  }
  const upperCaseEnv = `${env}`.toUpperCase()
  if (upperCaseEnv === ENVS.PRODUCTION) return ENVS.PRODUCTION
  if (upperCaseEnv === ENVS.STAGING) return ENVS.STAGING
  return ENVS.DEVELOPMENT
}

const getCurrentConstants = (ident: ENVS): EevRecord => {
  let constants = development
  const source =
    ident === ENVS.PRODUCTION
      ? production
      : ident === ENVS.STAGING
      ? staging
      : development
  Object.keys(development).forEach(key => {
    const sourceValue = source[key]
    const processValue = process.env[key]
    const parsedValue = parsedEnvs[key]

    if (typeof sourceValue !== 'undefined') {
      constants[key] = sourceValue
    }
    if (typeof processValue !== 'undefined') {
      constants[key] = processValue
    }
    if (typeof parsedValue !== 'undefined') {
      constants[key] = parsedValue
    }
  })

  constants.ENV_LABEL = source.ENV_LABEL

  return constants
}

export const CURRENT_ENV = getCurrentEnv()

export const isProd = () => CURRENT_ENV === ENVS.PRODUCTION
const CONSTANTS = getCurrentConstants(CURRENT_ENV)

export default CONSTANTS
