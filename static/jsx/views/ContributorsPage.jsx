define([
    'react',
    'jquery',
    'underscore',
    'views/TableView',
    'mixins/UrlMixin'
  ],
  function(React, $, _, TableView, UrlMixin) {
    'use strict';

    var UsersTableRow = React.createClass({
      render: function() {
        var href = '/users/' + this.props.username;
        return (
          <tr>
            <td>{this.props.rank}</td>
            <td><a href={href}>{this.props.username}</a></td>
            <td>{this.props.authored}</td>
            <td>{this.props.reviewed}</td>
          </tr>
        );
      }
    });

    var NavItem = React.createClass({
      mixins: [UrlMixin],
      onClick: function(event) {
        var component = this.props.component;
        var hash = window.location.hash.split(/#|&/);
        if (hash.length === 3) {
          this.pushAnchor(component, hash[1]);
        } else {
          this.pushAnchor(component);
        }
      },

      render: function() {
        return (
          <li className={this.props.active ? "subnav-active" : ""}>
            <a onClick={this.onClick}>
              {this.props.component}
            </a>
          </li>
        );
      }
    });

    var ContributorsPage = React.createClass({
      mixins: [UrlMixin],
      getInitialState: function() {
        return {activeTab: ''};
      },

      columnNames: ['', 'Username', 'PRs Authored', 'PRs Reviewed'],

      sortFunctions: {
        '': function(row) { return row.props.rank; },
        'Username': function(row) { return row.props.username.toLowerCase(); },
        'PRs Authored': function(row) { return row.props.authored; },
        'PRs Reviewed': function(row) { return row.props.reviewed; }
      },

      tableRows: function(component) {
        var users = [];
        if (component === "STC") {
          var stcContributors = this.props.stcContributors;
          if (stcContributors) {
          users = stcContributors;
          }
        } else {
          var topContributors = this.props.topContributors;
          if (topContributors) {
            users = topContributors;
          }
        }
        var tableRows = _.map(users, function(user, index) {
          return (
            <UsersTableRow
              rank={index + 1}
              username={user[0]}
              authored={user[1][0]}
              reviewed={user[1][1]}/>);
        });
        return tableRows;
      },

      componentDidMount: function() {
          this._prepareData();
      },

      componentWillReceiveProps: function(nextProps) {
        this._prepareData();
      },

      componentDidUpdate: function(prevProps, prevState) {
        var newActiveTab = this.state.activeTab;
        if (prevState.activeTab !== newActiveTab) {
          this.setState({ activeTab: newActiveTab });
        }
      },

      _prepareData: function() {
        var tab = this._checkTabAvailability();

        this.setState({ activeTab: tab ? tab : "All" });
      },

      _checkTabAvailability: function() {
        var hash = window.location.hash.split(/#|&/);
        var anchor = hash.pop();
        var stcComponent = "STC";
        var component = "All";

        if (this.getAnchor(stcComponent) === anchor) {
          return stcComponent;
        } else if (this.getAnchor(component) === anchor) {
          return component;
        }
      },

      render: function() {
        var navItems = [], userTables = [];
        var display_none = { display: 'none' };
        var display_block = { display: 'block' };

        var activeTab = this.state.activeTab;
        var stcComponent = "STC";
        var component = "All";

        navItems.push(
          <NavItem
            component={component}
            active={component === activeTab}/>
        );
        userTables.push(
          <div id={component} style={component === activeTab ? display_block : display_none}>
            <TableView
              rows={this.tableRows(component)}
              columnNames={this.columnNames}
              sortFunctions={this.sortFunctions}/>
          </div>
        );

        navItems.push(
          <NavItem
            component={stcComponent}
            active={stcComponent === activeTab}/>
        );
        userTables.push(
          <div id={stcComponent} style={stcComponent === activeTab ? display_block : display_none}>
            <TableView
              rows={this.tableRows(stcComponent)}
              columnNames={this.columnNames}
              sortFunctions={this.sortFunctions}/>
          </div>
        );

        var navBar = (
          <nav className="sub-nav navbar navbar-default" role="navigation">
            <div className="container-fluid">
              <ul className="nav navbar-nav">
                {navItems}
              </ul>
            </div>
          </nav>
        );


        return (
          <div>
            {navBar}
            <div className='container'>
              {userTables}
            </div>
          </div>
          );
      }
    });

    return ContributorsPage;
  }
);
