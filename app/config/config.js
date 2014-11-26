/**
 * App main config
 */

module.exports = {
  development : {
    db  : process.env.MONGODB_URI,
    app : {
      name : 'Lukkari',
      url : 'http://localhost:3000'
    },
    cache : {
      day : 0,
      week : 0,
      month : 0
    },
    API : {
      google : {
        CLIENT_ID : process.env.CLIENT_ID,
        CLIENT_SECRET : process.env.CLIENT_SECRET
      }
    }
  },

  production : {
    db  : process.env.MONGODB_URI,
    app : {
      name : 'Lukkari',
      url : 'http://lukkari.dc.turkuamk.fi'
    },
    cache : {
      day : (60*60*24),
      week : (60*60*24*7),
      month : (60*60*24*30)
    },
    API : {
      google : {
        CLIENT_ID : '123',
        CLIENT_SECRET : '123'
      }
    }
  }
};
