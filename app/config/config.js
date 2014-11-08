module.exports = {
  development : {
    db  : process.env.MONGODB_URI,
    app : {
      name : 'Lukkari'
    },
    cache : {
      day : 0,
      week : 0,
      month : 0
    }
  },

  production : {
    db  : process.env.MONGODB_URI,
    app : {
      name : 'Lukkari'
    },
    cache : {
      day : (60*60*24),
      week : (60*60*24*7),
      month : (60*60*24*30)
    }
  }
};
