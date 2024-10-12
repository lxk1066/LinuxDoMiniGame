import type { GlobEnvConfig } from '#/env'

export function getAppEnvConfig() {
  const ENV = import.meta.env as unknown as GlobEnvConfig

  const { VITE_GLOB_APP_TITLE, VITE_GLOB_BASE_URL } = ENV

  return {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_BASE_URL
  }
}

/**
 * @description: Development mode
 */
export const devMode = 'development'

/**
 * @description: Production mode
 */
export const prodMode = 'production'

/**
 * @description: Get environment variables
 * @returns:
 * @example:
 */
export function getEnv(): string {
  return import.meta.env.MODE
}
