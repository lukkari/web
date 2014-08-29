module.exports = {
  development : {
    db  : process.env.MONGODB_URI,
    app : {
      name : 'Lukkari'
    },
    log : {
      path   : '/logs/main.log',
      format : 'default'
    },
    cache : {
      statics : 0,
      apis    : 0
    }
  },

  production : {
    db  : process.env.MONGODB_URI,
    app : {
      name : 'Lukkari'
    },
    log : {
      path   : '/logs/main.log',
      format : 'default'
    },
    cache : {
      statics : (1000*60*60*24*7), // One week
      apis    : (1000*60*60*24)    // One day
    }
  }
};
