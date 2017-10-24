const lib = require('lib')({token: process.env.STDLIB_TOKEN});

/**
* message event
*
*   All events use this template, simply create additional files with different
*   names to add event responses
*
*   See https://api.slack.com/events-api for more details.
*
* @param {string} user The user id of the user that invoked this event (name is usable as well)
* @param {string} channel The channel id the event was executed in (name is usable as well)
* @param {string} text The text contents of the event
* @param {object} event The full Slack event object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/



module.exports = (user, channel, text = '', event = {}, botToken = null, callback) => {



  union_normal_hours = [7, 8, 9, 11, 12, 13, 14, 15, 16, 17];

  var union_map = new Map();
  for (const hour of union_normal_hours) {
    union_map.set(hour, [0, 10, 20, 30, 40, 50]);
    }
  union_map.set(6, [30, 40, 50]);
  union_map.set(10, [10, 40]);
  union_map.set(18, [0, 15, 30, 45]);
  union_map.set(19, [0, 15, 30, 45]);

  king_even_hours = [11, 12, 13, 14];
  king_odd_hours = [9, 15, 16, 17];
  var king_map = new Map();
  for (const hour of king_even_hours) {
    king_map.set(hour, [0, 10, 20, 30, 40, 50]);
  }
  for (const hour of king_odd_hours) {
    king_map.set(hour, [5, 15, 25, 35, 45, 55]);
  }
  king_map.set(6, [40, 50]);
  king_map.set(7, [0, 10, 20, 30, 45]);
  king_map.set(8, [0, 5, 15, 25, 35, 45, 55]);
  king_map.set(10, [0, 20, 30, 50]);
  king_map.set(18, [5, 15, 30, 45]);
  king_map.set(19, [0, 15, 30, 45]);


  var cur_date = new Date();
  var timezone_offset = cur_date.getTimezoneOffset();
  var toronto_offset = -4;
  var cur_hour = cur_date.getUTCHours() + toronto_offset;
  var cur_minute = cur_date.getUTCMinutes();

  if (text.match(/shuttle from union|shuttle from station|shuttle to king|shuttle to 351|shuttle to office|shuttle to building/i)) {
    var next_shuttle_time = getNextShuttleTime(union_map, cur_hour, cur_minute);
    callback(null, {
      text: 'The next shuttle from Union Station is at: ' + next_shuttle_time.hour + ':' + formatMinute(next_shuttle_time.minute)
    });
  } else if(text.match(/shuttle to union|shuttle to station|shuttle from king|shuttle from 351|shuttle from office|shuttle from building/i)) {
      var next_shuttle_time = getNextShuttleTime(king_map, cur_hour, cur_minute);
      callback(null, {
        text: 'The next shuttle from 351 King St. East is at: ' + next_shuttle_time.hour + ':' + formatMinute(next_shuttle_time.minute)
      });
  } else if(text.match(/shuttle-bot help|help shuttle-bot|how does shuttle-bot work|what does shuttle-bot do|shuttlebot help|help shuttlebot|how does shuttlebot work|what does shuttlebot do|shuttle bot help|help shuttle bot|how does shuttle bot work|what does shuttle bot do/i)) {
	  callback(null, {
	    text: `I can tell you when the next shuttle will arrive at Union Station or 351 King St. East. Possible ways to ask are:
		shuttle to/from union
		shuttle to/from station
		shuttle to/from king
		shuttle to/from office
		shuttle to/from 351
		shuttle to/from building`
	  });
  } else {
    callback(null, {});
  }
};


function formatMinute(minute) {
  str = minute.toString()
  if(str.length == 1) {
    str = '0' + str
  }
  return str
}

function getNextShuttleTime(timeMap, cur_hour, cur_minute) {

  var reply_hour = cur_hour;
  var reply_min = cur_minute;

  var done = false;
  var search_minutes = undefined;
  while(done === false) {
    search_minutes = timeMap.get(cur_hour);
    while(search_minutes === undefined) {
      cur_hour += 1;
      cur_minute = 0;
      if(cur_hour >= 20) {
        cur_hour = 6;
      }
      search_minutes = timeMap.get(cur_hour);
    }
    for (const shuttle_min of search_minutes) {
      if (shuttle_min >= cur_minute) {
        reply_hour = cur_hour;
        reply_min = shuttle_min;
        done = true;
        break;
      }
    }
    cur_hour += 1;
    cur_minute = 0;
    if(cur_hour >= 20) {
      cur_hour = 6;
    }
  }

  return {
    hour: reply_hour,
    minute: reply_min
  };
}



