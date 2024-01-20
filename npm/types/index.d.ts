/**
 * Оновлює job
 *
 * @param {string} jobName - назва джобу
 * @param {object} log - логер
 * @param {Array} env - нові значення змінних середовища
 * @param {Number} taskCount - кількість задач
 *
 */
export function updateJob(jobName: string, log: object, env?: any[], taskCount?: number): Promise<void>;
/**
 * Запускаємо job
 *
 * @param {string} jobName - назва джобу
 * @param {object} log - логер
 *
 */
export function executeJob(jobName: string, log: object): Promise<string>;
