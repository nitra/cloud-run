import { updateJob } from '@nitra/cloud-run'
import log from '@nitra/bunyan'

updateJob('caps-job-recalc-salary-dev', log, [{ key: 'TEST', value: new Date() }], 1)
