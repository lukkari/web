module.exports = {
  development : {
    db  : 'mongodb://localhost/lukkari_dev',
    app : {
      name : 'Lukkari'
    },
    log : {
      path   : '/logs/main.log',
      format : 'default'
    },
    cache : {
      path   : 'app/cache/',
      expire : 60*60*24*7 // Expire in a week
    }
  },

  production : {
    db  : 'mongodb://localhost/lukkari',
    app : {
      name : 'Lukkari'
    },
    log : {
      path   : '/logs/main.log',
      format : 'default'
    },
    cache : {
      path   : 'app/cache/',
      expire : 60*60*24*7 // Expire in a week
    }
  }
};
