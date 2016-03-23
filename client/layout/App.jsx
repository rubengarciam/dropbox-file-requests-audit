App = React.createClass({
  // This mixin makes the getMeteorData method work
  mixins: [ReactMeteorData],
  // Setting Startup States
  getInitialState() {
    return {
      order: true,
      search: false,
      filters: true,
      settings: false,
      message: "",
      filterFRs: "",
      filterUsers: ""
    }
  },
  // Get App Data
  getMeteorData() {
    let query = {};
    let sort = {};
    let orderBin = 1;
    var logsArray = Logs.find().fetch();
    // Number of File Requests
    var distinctFRs = _.compact(_.uniq(_.flatten(logsArray.map(function(b) {
      return b.info_dict.title;
    })))).sort();
    // Number of Users
    var distinctUsers = _.compact(_.uniq(_.flatten(logsArray.map(function(b) {
      return b.name;
    })))).sort();
    // Number of Submissions
    var distinctSubmisions = _.compact(_.uniq(_.flatten(logsArray.map(function(b) {
      return b.info_dict.submitter_name;
    })))).sort();
    // Filters
    if (this.state.filterUsers != "") {
      //query.name = this.state.filterUsers;
      query.name = {
        $in: this.state.filterUsers.split(',')
      };
      console.log(query.name);
    }
    if (this.state.filterFRs != "") {
      query["info_dict.title"] = {
        $in: this.state.filterFRs.split(',')
      };
    }
    // Order
    if (this.state.order) {
      orderBin = -1;
    }
    sort = {
      sort: {
        time: orderBin
      }
    };
    // Data pulled from MongoDB to use in App
    return {
      logs: Logs.find(query, sort).fetch(),
      logsCount: Logs.find({}).count(),
      frs: distinctFRs,
      users: distinctUsers,
      submissions: distinctSubmisions
    };
  },
  // JS actions for this compomnent on mount and update
  componentDidMount() {
    var self = this;
    // Dropdowns
    $('.ui.dropdown').dropdown();
    $('.ui.dropdown.frs').dropdown({
      onChange: function(value, text, $selectedItem) {
        self.toggleFilterFR(value);
      }
    });
    $('.ui.dropdown.users').dropdown({
      onChange: function(value, text, $selectedItem) {
        self.toggleFilterUser(value);
      }
    });
    // Sticky
    $('.ui.panel').sticky({context: 'body'});
  },
  componentDidUpdate() {
    var self = this;
    // Sticky
    $('.ui.panel').sticky('refresh');
    // Dropdowns
    //$('.ui.dropdown').dropdown();
    $('.ui.dropdown.frs').dropdown({
      onChange: function(value, text, $selectedItem) {
        self.toggleFilterFR(value);
      }
    });
    $('.ui.dropdown.users').dropdown({
      onChange: function(value, text, $selectedItem) {
        self.toggleFilterUser(value);
      }
    });
  },
  // Save API Token
  saveSettings() {
    var token = $('.ui.form').form('get value', 'settings-token');
    var self = this;
    Meteor.call('setToken', token, function(error, result) {
      if (error) {} else {
        self.toggleMessage("token saved");
      }
    });
  },
  // Refresh Data
  toggleRefresh() {
    var self = this;
    self.toggleSearch();
    var promise = Meteor.callPromise('getEvents')
    promise.then(function(result) {
      self.toggleSearch();
    })
    promise.catch(function(error) {
      if (isKnownError(error)) {
        self.toggleMessage(error.reason);
      } else {
        self.toggleMessage("An unknown error occurred :( " + error.reason);
      }
      self.toggleSearch();
    })
  },
  // Clear Filters
  clearFilters() {
    this.setState({order: true, search: false, filterFRs: "", filterUsers: ""});
    $('.ui.dropdown').dropdown('clear');
  },
  // Search, Orders and Filters
  toggleSearch() {
    this.setState({
      search: !this.state.search
    });
  },
  toggleOrder() {
    this.setState({
      order: !this.state.order
    });
  },
  toggleMessage(msg) {
    this.setState({message: msg});
    $(".system.message").transition('slide down');
    setTimeout(function() {
      $(".system.message").transition('slide down');
    }, 3000);
  },
  toggleFilters() {
    this.setState({
      filters: !this.state.filters
    });
  },
  toggleSettings() {
    this.setState({
      settings: !this.state.settings
    });
  },
  toggleFilterFR(value) {
    this.setState({filterFRs: value})
  },
  toggleFilterUser(value) {
    this.setState({filterUsers: value});
  },
  toggleFilterDescription() {
    this.setState({filterDescription: document.getElementById('search-description').value})
  },
  // Export colleciton to CSV file
  JSON2CSV(objArray) {
    console.log(objArray);
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

      var str = '';
      var line = '';

      //if ($("#labels").is(':checked')) {
          var head = array[0];
          //if ($("#quote").is(':checked')) {
              for (var index in array[0]) {
                  var value = index + "";
                  line += '"' + value.replace(/"/g, '""') + '",';
              }
          /*} else {
              for (var index in array[0]) {
                  line += index + ',';
              }
          }*/

          line = line.slice(0, -1);
          str += line + '\r\n';
      //}

      for (var i = 0; i < array.length; i++) {
          var line = '';

          if ($("#quote").is(':checked')) {
              for (var index in array[i]) {
                  var value = array[i][index] + "";
                  line += '"' + value.replace(/"/g, '""') + '",';
              }
          } else {
              for (var index in array[i]) {
                  line += array[i][index] + ',';
              }
          }

          line = line.slice(0, -1);
          str += line + '\r\n';
      }
      return str;

  },
  export() {
    var csv = this.JSON2CSV(this.data.logs);
    window.open("data:text/csv;charset=utf-8," + escape(csv))
  },
// Render Filters Panel
renderFilters() {
  var orderIconClass = this.state.order
    ? "long arrow down inverted icon"
    : "long arrow up inverted icon";
  if (this.state.filters) {
    return (
      <div className="ui filters stackable grid">
        <div className="two column order">
          <div className="item ui grey label" onClick={this.toggleOrder}>
            <i className={orderIconClass}></i>Time
          </div>
        </div>
        <div className="five wide column">
          <div className="ui fluid multiple search floating dropdown users">
            <input type="hidden" name="users"/>
            <div className="default text">Filter by Users</div>
            <div className="menu">{this.renderUsers()}</div>
          </div>
        </div>
        <div className="five wide column">
          <div className="ui fluid multiple search floating dropdown frs">
            <input type="hidden" name="frs"/>
            <div className="default text">Filter by File Requests</div>
            <div className="menu">{this.renderFRs()}</div>
          </div>
        </div>
        <div className="two wide right floated column label">
          <div className="ui orange label item" onClick={this.clearFilters}>
            Clear all filters
            <i className="delete icon"></i>
          </div>
        </div>
      </div>
    )
  }
},
// Render Logs Table
renderLogs() {
  return (
    <div id="dvData">
      <table className="ui very basic table">
        <thead>
          <tr>
            <th>File Request</th>
            <th>Submitter</th>
            <th>Email</th>
            <th>Time</th>
            <th>File (1st)</th>
          </tr>
        </thead>
        <tbody>
          {this.data.logs.map((log) => {
            var link = "https://www.dropbox.com/home" + log.info_dict.path + "?preview=" + log.info_dict.file_names[0];
            return (
              <tr key={log._id}>
                <td>{log.info_dict.title}
                  (by {log.name})</td>
                <td>{log.info_dict.submitter_name}</td>
                <td>{log.info_dict.submitter_email}</td>
                <td>{log.time}</td>
                <td>{log.info_dict.file_names[0]}
                  <a href={link} target="_blank">
                    <i className="caret right grey icon"></i>
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
},
// Render Content Page
renderContent() {
  var segmentClass = "ui "
  if (this.state.search) {
    segmentClass += "loading "
  }
  segmentClass += "basic segment";
  if (!this.state.settings) {
    return (
      <div className={segmentClass}>
        {this.renderFilters()}
        {this.renderLogs()}
      </div>
    )
  }
},
// Render Settings Panel
renderSettings() {
  if (this.state.settings) {
    return (
      <div className="settings">
        <h4 className="ui header">Please introduce your
          <strong>Dropbox Enterprise</strong>
          access token</h4>
        <p>In order to get them please go to
          <a href="ps://www.dropbox.com/developers" target="_blank">
            dropbox.com/developers</a>, create a new app for the
          <i>Dropbox Business API</i>
          with
          <i>Team auditing</i>
          access.</p>
        <div className="ui message">
          <p>This is an unofficial app to showcase how to obtain file requests submitters email from the Dropbox Business API. It comes with no support from Dropbox.</p>
        </div>
        <form className="ui form">
          <div className="field">
            <label>Access Token</label>
            <input type="text" name="settings-token" id="settings-token" placeholder="Your audit api access token. Please don't share with anyone"/>
          </div>
          <div className="ui green button" onClick={this.saveSettings}>Save</div>
        </form>
        <div className="ui section">
          <div className="ui right floated basic button" onClick={this.renderReadme}>See app info</div>
          <div id="readme"></div>
        </div>
      </div>
    )
  }
},
// Rendering README file
renderReadme() {
  if (this.state.settings) {
    var markdown = Markdown.findOne();
    document.getElementById('readme').innerHTML = marked(markdown.data);
  }
},
// Render Message bar
renderMessage() {
  return (
    <div className="ui center aligned hidden system message">
      <p>{this.state.message}</p>
    </div>
  )
},
// Render File Requests Dropdown Content
renderFRs() {
  return this.data.frs.map((fr) => {
    return (
      <div className="item" key={fr} data-value={fr}>{fr}</div>
    );
  });
},
// Render Users Dropdown Content
renderUsers() {
  return this.data.users.map((user) => {
    return (
      <div className="item" key={user} data-value={user}>{user}</div>
    );
  });
},
// Render Main Content
render() {
  var refreshIconClass = "refresh "
  if (this.state.search) {
    refreshIconClass += "loading "
  }
  if (this.state.settings) {
    refreshIconClass += "disabled "
  }
  refreshIconClass += "inverted icon";

  var exportIconClass = this.state.settings
    ? "disabled "
    : "";
  exportIconClass += "file excel outline inverted icon";

  var optionsIconClass = this.state.settings
    ? "disabled "
    : "";
  optionsIconClass += "options inverted icon";

  var settingsIconClass = this.state.settings
    ? "loading "
    : "";
  settingsIconClass += "setting inverted icon";
  return (
    <div>
      <div className="ui fixed top sticky panel" id="header">
        <div className="ui borderless main inverted blue secondary menu" id="main-menu">
          <div className="item">
            <img src="/images/logo.png"/>
          </div>
          <div className="item">
            File Requests Audit Tool
            <div className="ui teal label">
              beta
            </div>
          </div>
          <div className="ui compact icon borderless layout right inverted blue menu">
            <a className="item" onClick={this.export}>
              <i className={exportIconClass}></i>
            </a>
            <a className="item" onClick={this.toggleRefresh}>
              <i className={refreshIconClass}></i>
            </a>
            <a className="item" onClick={this.toggleFilters}>
              <i className={optionsIconClass}></i>
            </a>
            <a className="item" onClick={this.toggleSettings}>
              <i className={settingsIconClass}></i>
            </a>
          </div>
        </div>
        {this.renderMessage()}
      </div>
      <div className="ui fluid container" id="main-container">
        {this.renderSettings()}
        {this.renderContent()}
      </div>
    </div>
  );
}
});
