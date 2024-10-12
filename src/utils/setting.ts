import { getAppEnvConfig } from '@/utils/env'
import type { GlobConfig } from '#/env'

export const useGlobSetting = (): Readonly<GlobConfig> => {
  const { VITE_GLOB_APP_TITLE, VITE_GLOB_BASE_URL } = getAppEnvConfig()

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    appTitle: VITE_GLOB_APP_TITLE,
    baseUrl: VITE_GLOB_BASE_URL
  }
  return glob as Readonly<GlobConfig>
}
