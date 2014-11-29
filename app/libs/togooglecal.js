/**
 * Transform schedule entry to google calendar format
 */

/**
 *
 * Transform this
 *
 * {
    "subject": {
        "_id": "5411aa0b5cf5a5664a1701e7",
        "name": "Freelab CCNA3; SN, F"
    },
    "_id": "545a6faf3b91d9211aef072e",
    "__v": 0,
    "createdAt": "2014-11-05T18:42:55.678Z",
    "teachers": [
        {
            "_id": "5411aa065cf5a5664a16fd9f",
            "name": "Slotte Vesa"
        },
        {
            "_id": "5411aa065cf5a5664a16fdab",
            "name": "Virtanen Tero"
        }
    ],
    "groups": [
        {
            "_id": "5411aa065cf5a5664a16fd5e",
            "name": "NINFOS13"
        }
    ],
    "rooms": [
        {
            "_id": "5411aa065cf5a5664a16fdc6",
            "name": "ICT C3033 cisco"
        },
        {
            "_id": "5411aa065cf5a5664a16fdc7",
            "name": "ICT C3039 cisco"
        }
    ],
    "duration": 4,
    "date": "2014-12-01T06:15:00.000Z"
  }

  to this

  {
    "summary" : "Freelab CCNA3; SN, F",
    "description" : "with Slotte Vesa, Virtanen Tero",
    "location" : "ICT C3033 cisco, ICT C3039 cisco",
    "start" : {
      "dateTime" : "2014-12-01T06:15:00.000Z"
    },
    "end" : {
      "dateTime" : "2014-12-01T010:15:00.000Z"
    }
  }

 */

exports.transform = function (entry) {
  var out = {};
  var date;

  out.summary = entry.subject.name;
  out.description = "with " + entry.teachers
                                      .map(function (teacher) { return teacher.name; })
                                      .join(", ");

  out.location = entry.rooms
                        .map(function (room) { return room.name; })
                        .join(", ");

  date = new Date(entry.date);
  out.start = {
    dateTime : date.toISOString()
  };

  date = new Date(date.getTime() + (entry.duration *60*60*1000));
  out.end = {
    dateTime : date.toISOString()
  };

  return out;
};
