module.exports = {
  db  : 'mongodb://localhost/learnnode_dev',
  app : {
    name : 'Lukkari'
  },
  log : {
    path   : '/logs/main.log',
    format : 'default'
  },
  cache : {
    path   : 'app/cache',
    expire : 60*60*24*7 // Expire in a week
  }
};
