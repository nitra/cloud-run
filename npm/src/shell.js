import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { getRegion } from '@nitra/gcp-metadata'

const region = await getRegion()
const execPromise = promisify(exec)
/**
 * Оновлює job
 *
 * @param {string} jobName - назва джобу
 * @param {object} log - логер
 * @param {Array} env - нові значення змінних середовища
 * @param {Number} taskCount - кількість задач
 *
 */
export async function updateJob(jobName, log, env = [], taskCount = 1) {
  let envString = ''
  // Оновлюємо ENV
  for (const { key, value } of env) {
    envString += `--set-env-vars ${key}=${value} `
  }

  const { stdout, stderr } = await execPromise(`gcloud run jobs update ${jobName} \
  --tasks ${taskCount} \
  ${envString}
  --region ${region}`)

  log.debug('updateJob: ', stdout, stderr)
}

/**
 * Запускаємо job
 *
 * @param {string} jobName - назва джобу
 * @param {object} log - логер
 *
 */
export async function executeJob(jobName, log) {
  const { stdout } = await execPromise(`gcloud run jobs execute ${jobName} \
  --format json \
  --region ${region}`)

  log.info('executeJob: ', stdout)
  const { metadata } = JSON.parse(stdout)

  return metadata.name
}
