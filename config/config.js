module.exports = {
  development: {
    db  : 'mongodb://localhost/learnnode_dev',
    app : {
      name : 'Lukkari'
    },
    log : {
      path   : '/logs/main.log',
      format : 'default'
    }
  }
};