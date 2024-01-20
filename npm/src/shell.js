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
export async function updateJob(jobName, log, env = [], taskCount = 1, parallelism = 0) {

  // Якщо не задано паралелізм, то використовуємо кількість задач
  if(parallelism === 0) {
    parallelism = taskCount
  }

  let envString = ''
  // Оновлюємо ENV
  for (const { key, value } of env) {
    envString += `--update-env-vars ${key}=${value} `
  }

  const { stdout, stderr } = await execPromise(`gcloud run jobs update ${jobName} \
  --tasks ${taskCount} --parallelism ${parallelism} --region ${region} ${envString}`)

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
