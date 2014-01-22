var calendar = function () {

  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function buildMonth(w, pdate) {
    // Counting first and last day of current month
    var fd = new Date(pdate.getFullYear(), pdate.getMonth(), 1),
        ld = new Date(fd.getFullYear(), fd.getMonth() + 1, 0),
    // days from prev month and next month
        pm = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate() - fd.getDay() + 1),
        nm = new Date(ld.getFullYear(), ld.getMonth(), ld.getDate() + (7 - ld.getDay())),
    // duration
        oneday = 24*60*60*1000,
        dur    = Math.round((nm.getTime() - pm.getTime()) / oneday) + 1;

    var cal = {
      month : months[fd.getMonth()],
      dates : []
    },
        tmp = {
          days : []
        };

    for(var i = 0; i < dur; i += 1) {
      // Calculate current date
      var cd = new Date(pm.getFullYear(), pm.getMonth(), pm.getDate() + i);
      if(cd.getDay() > 0) {
        if(cd.getDay() == 6) {
          if(cd.getMonth() >= fd.getMonth()) {
            tmp.week    = cd.getWeek();
            tmp.curweek = Math.abs(cd.getWeek() - w);
            cal.dates.push(tmp);
          }
          var tmp = {
            days : []
          };
        }
        else {
          tmp.days.push({ old : Math.abs(cd.getMonth() - fd.getMonth()), day : cd.getDate()});
        }
      }
    }

    return cal;

  }

  function show(w, d, arr) {

    var res = [];
    arr.forEach(function (el) {
      res.push(buildMonth(w, new Date(d.getFullYear(), el, 1)));
    });

    return res;
  }

  return {
    get : function (w) {
      var d = new Date(),
          m = d.getMonth();

      if((m >= 8) && (m <= 10)) res = show(w, d, [8,9,10,11]);
      else if(m == 11) res = show(w, d, [10,11,0,1]);
      else if((m >= 0) && (m <= 5)) res = show(w, d, [0,1,2,3,4,5]);

      return res;
    }
  }

}();

module.exports = calendar;