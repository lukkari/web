// Add getWeek support
Date.prototype.getWeek = function () {
  var onejan = new Date(this.getFullYear(),0,1),
      time   = this.getMilliseconds()
             + this.getSeconds()*1000
             + this.getMinutes()*60*1000
             + this.getHours()*60*60*1000;
  return Math.ceil((((this - onejan - time) / 86400000) + onejan.getDay()+1)/7);
};

// Get study week (increment if sat)
Date.prototype.getStudyWeek = function () {
  var inc = (this.getDay() == 6) ? 1 : 0;
  return this.getWeek() + inc;
};

// Find week's first day
Date.prototype.getDateOfISOWeek = function (w, y) {
  var simple = new Date(y, 0, 1 + (w - 1) * 7);
  var dow = simple.getDay();
  var ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}
