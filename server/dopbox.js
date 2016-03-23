var headersConst = {
  'Authorization': "",
  'Content-Type': "application/json"
};

Meteor.methods({
  setToken: function(token) {
    headersConst.Authorization = "Bearer " + token;
  },
  getEvents: function() {
    try {
      // Calling Dropbox events API
      var result = HTTP.call("POST", "https://api.dropbox.com/1/team/log/get_events", {
        headers: headersConst,
        data: {
          category: "sharing"
        }
      });
      // Clear cached logs
      //Logs.remove({});
      // Introduce new logs
      events = JSON.parse(result.content);
      events.events.map((event) => {
        if ((event.event_type = "file_request_received_files") && (event.event_type_description = "File request received file(s)") && (event.info_dict.submitter_name)) {
          Logs.insert(event);
        }
      });
      return true;
    } catch (e) {
      console.log(e);
      var content = JSON.parse(e.response.content);
      if (e.response.statusCode == 400) {
        var reason = content.error_description + ". Very likely the token is empty or invalid";
        return throwError('no-token', reason);
      } else {
        return throwError('unkonwn', content.error_description);
      }
    }
  }
});
