var path = require('path');

module.exports = function (fs, config) {
  var hashes = [],
      folder = path.resolve('./' + config.path),
      expire = config.expire;

  // Java function
  var hashCode = function(str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  },

  find = function (hash) {
    return hashes.indexOf(hash);
  },

  deleteFile = function (file, hash) {
    fs.unlink(file, function (err) {
      if(err) return;

      var i = hashes.indexOf(hash);

      if(i === -1) return;
      hashes.splice(i, 1);
    });
  },

  addData = function (hash, data, cb) {
    var file = folder + '/' + hash;
    fs.writeFile(file, JSON.stringify(data), function (err) {
      if(!err) {
        hashes.push(hash);
        setTimeout(function () {
            deleteFile(file, hash);
          },
          expire
        );
      }

      cb(err, data);
    });
  },

  getData = function (i, cb) {
    fs.readFile(folder + '/' + hashes[i], { encoding : 'utf8' }, function (err, data) {
      cb(err, JSON.parse(data));
    });
  };

  fs.readdir(folder, function (err, files) {
    if(err) return;

    files.forEach(function (file) {
      fs.unlinkSync(folder + '/' + file);
    });
  });

  return {
    clear : function () {
      hashes.length = 0;
      fs.readdir(folder, function (err, files) {
        if(err)
          console.log(err);

        files.forEach(function (file) {
          fs.unlink(folder + '/' + file, function (err) {
            if(err) return;

            var hash = parseInt(file, 10),
                i    = hashes.indexOf(hash);

            if(i === -1) return;
            hashes.splice(i, 1);
          });
        });
      });
    },

    get : function (url, cb, add) {
      var hash = hashCode(url.substr(1));

      if(!(url && typeof cb === 'function')) return false;

      var i;
      if((i = find(hash)) !== -1) {
        getData(i, cb);
        return this;
      }

      add(function (data, err) {
        if(err)
          cb(err, data);
        else
          addData(hash, data, cb);
      });

      return this;
    }
  };
};
