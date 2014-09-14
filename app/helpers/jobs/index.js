/**
 * Main jobs configuration file (runs all jobs)
 */

var CronJob   = require('cron').CronJob;

// Run parser job
var runParser = require('./runParser');

new CronJob(
  '00 02 01 * * *',
  function () {
    console.log('Start parsing automatically');
    runParser();
  },
  null,
  true
);
