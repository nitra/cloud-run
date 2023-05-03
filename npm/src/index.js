import { v2 } from '@google-cloud/run'
import { getProjectInfo } from '@nitra/gcp-metadata'

const { projectId, region } = await getProjectInfo()

const runClient = new v2.JobsClient()
const gPath = `projects/${projectId}/locations/${region}`
const connector = `${gPath}/connectors/${region}-vpc`

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
  const name = `${gPath}/jobs/${jobName}`
  log.info('update Job name: ', name, env, taskCount)

  // Поточні налаштування сервісу
  const jobTemplate = await runClient.getJob({ name })
  log.debug('jobTemplate: ', JSON.stringify(jobTemplate, null, 2))

  // Повертає 3 елементи масиву, якщо job знайдено
  if (!jobTemplate.length) {
    log.error(`job ${name} not found`)
    return
  }

  const { template } = jobTemplate[0]

  // Оновлюємо кількість задач
  template.template.taskCount = taskCount

  // Оновлюємо ENV
  for (const { key, value } of env) {
    // Знаходимо індекс елемента env з іменем переданим в key
    const index = template.template.containers[0].env.findIndex(el => el.name === key)
    log.debug(`index ${key}: `, index)

    // Якщо такого елемента ще немає, то створюємо його
    if (index === -1) {
      template.template.containers[0].env.push({
        name: key,
        value
      })
    } else {
      // Записуємо в цей елемент нове значення
      template.template.containers[0].env[index].value = value
    }
  }
  log.debug('env: ', template.template.containers[0].env)

  // Оновлюємо job з новими env
  const request = {
    job: {
      name,
      template
    }
  }

  // Якщо у джоба є vpc, та він не в повному форматі
  if (
    request.job.template.template.vpcAccess &&
    !request.job.template.template.vpcAccess.connector.startsWith('projects/')
  ) {
    // Приводимо vpcAccess до формату, який очікує метод updateJob
    request.job.template.template.vpcAccess.connector = connector
  }

  const [operation] = await runClient.updateJob(request)
  const [response] = await operation.promise()
  log.debug('response: ', response)
}

/**
 * Запускаємо job
 *
 * @param {string} jobName - назва джобу
 * @param {object} log - логер
 *
 */
export async function executeJob(jobName, log) {
  const name = `${gPath}/jobs/${jobName}`
  log.info('execute Job name: ', name)

  const [operation] = await runClient.runJob({ name })
  const [response] = await operation.promise()
  log.debug('run Job response: ', JSON.stringify(response, null, 2))

  return response?.name
}
