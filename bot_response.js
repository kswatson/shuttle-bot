module.exports = (slack_event, context) => {
    var union_map = buildTimetableFromUnion()
    var king_map = buildTimetableFromKing()
  
    var cur_date = new Date();
    var toronto_offset = -5; //REMEMBER DAYLIGHT SAVINGS!! (-4 after Spring Forward, -5 after Fall Back)
    var cur_hour = cur_date.getUTCHours() + toronto_offset;
    var cur_minute = cur_date.getUTCMinutes();
  
    text = slack_event['text']
    
    if (text.match(/shuttle from union|shuttle from station|shuttle to king|shuttle to 351|shuttle to office|shuttle to building/i)) {
      var next_shuttle_time = getNextShuttleTime(union_map, cur_hour, cur_minute);
      return 'The next shuttle from Union Station is at: ' + next_shuttle_time.hour + ':' + formatMinute(next_shuttle_time.minute);
    } else if(text.match(/shuttle to union|shuttle to station|shuttle from king|shuttle from 351|shuttle from office|shuttle from building/i)) {
        var next_shuttle_time = getNextShuttleTime(king_map, cur_hour, cur_minute);
        return 'The next shuttle from 351 King St. East is at: ' + next_shuttle_time.hour + ':' + formatMinute(next_shuttle_time.minute);
    } else if(text.match(/shuttle-bot help|help shuttle-bot|how does shuttle-bot work|what does shuttle-bot do|shuttlebot help|help shuttlebot|how does shuttlebot work|what does shuttlebot do|shuttle bot help|help shuttle bot|how does shuttle bot work|what does shuttle bot do/i)) {
        return `I can tell you when the next shuttle will arrive at Union Station or 351 King St. East. Possible ways to ask are:
          shuttle to/from union
          shuttle to/from station
          shuttle to/from king
          shuttle to/from office
          shuttle to/from 351
          shuttle to/from building`;
    } else {
      return null
    }
  };
  
  function buildTimetableFromUnion() {
    union_normal_hours = [7, 8, 9];
  
    var union_map = new Map();
    for (const hour of union_normal_hours) {
      union_map.set(hour, [0, 10, 20, 30, 40, 50]);
      }
    union_map.set(6, [30, 40, 50]);
    union_map.set(10, [0, 30, 50]);
    union_map.set(11, [20, 50]);
    union_map.set(12, [20, 50]);
    union_map.set(13, [20, 50]);
    union_map.set(14, [20, 45]);
    union_map.set(15, [0, 15, 25, 35, 45, 55]);
    union_map.set(16, [5, 15, 25, 35, 45, 55]);
    union_map.set(17, [5, 15, 25, 35, 45, 55]);
    union_map.set(18, [5, 15, 25, 35]);
    union_map.set(19, [0, 30]);
    
    return union_map;
  }
  
  function buildTimetableFromKing() {
    var king_map = new Map();
  
    king_map.set(6, [40, 50]);
    king_map.set(7, [0, 10, 20, 30, 40, 50]);
    king_map.set(8, [0, 10, 20, 35, 45, 55]);
    king_map.set(9, [5, 15, 25, 35, 45, 55]);
    king_map.set(10, [5, 35]);
    king_map.set(11, [5, 35]);
    king_map.set(12, [5, 35]);
    king_map.set(13, [5, 35]);
    king_map.set(14, [5, 35]);
    king_map.set(15, [0, 15, 25, 35, 45, 55]);
    king_map.set(16, [5, 15, 25, 35, 45, 55]);
    king_map.set(17, [5, 15, 25, 35, 55]);
    king_map.set(18, [5, 15, 25, 35, 45]);
    king_map.set(19, [15, 45]);
    
    return king_map;
  }
  
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
  };
