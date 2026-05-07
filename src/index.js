import process from 'node:process'

import { startServer } from '#/server/common/helpers/start-server.js'
import { createLogger } from '#/server/common/helpers/logging/logger.js'

process.stderr.write = (() => {
  const write = process.stdout.write.bind(process.stdout);
  return (chunk, encoding, callback) => write(chunk, encoding, callback);
})();

await startServer()

process.on('unhandledRejection', (error) => {
  const logger = createLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
