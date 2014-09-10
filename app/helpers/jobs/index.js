/**
 * Main jobs configuration file (runs all jobs)
 */

var CronJob   = require('cron').CronJob;

// Run parser job
var runParser = require('./runParser');

new CronJob(
  '00 05 9 * * *',
  runParser,
  null,
  true
);
