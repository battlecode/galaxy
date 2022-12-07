import React, { Component } from "react";

import UserCard from "../components/userCard";
import TeamCard from "../components/teamCard";

class PublicUser extends Component {
  constructor(props) {
    super(props);

    const copied_user = { ...props.user };
    copied_user.profile = props.user ? { ...props.user.profile } : {};
  }

  setupUsers() {
    // Form dummy team member data before the users have been fetched.
    const members = this.props.team.members;
    const dummyArr = Array(members.length).fill(null);

    // If the "state" variable is already initialized,
    // be careful not to re-assign it again.
    // If it hasn't been initialized then we need to initialize it.
    if (this.state) {
      this.setState({
        users: dummyArr,
      });
    } else {
      this.state = {
        users: dummyArr,
      };
    }
  }

  // don't want to make ajax calls before component is mounted!
  componentDidMount() {
    this.getUserData();
  }

  getUserData() {
    this.props.team.members.forEach((user, user_index) => {
      this.setState(function (prevState, props) {
        prevState.users[user_index] = user;
        return prevState;
      });
    });
  }

  componentDidUpdate() {
    if (this.state.users.length === 0 && this.props.team.members) {
      this.setupUsers();
      this.getUserData();
    }
  }

  render() {
    const team = this.props.team;

    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <UserCard user={copied_user} />
              <TeamCard team={team} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PublicUser;
