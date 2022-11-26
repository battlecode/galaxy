import React, { Component } from "react";
import Avatar from "../components/avatar";
import Api from "../api";

class TeamCard extends Component {
  constructor(props) {
    super(props);
    this.setupUsers();
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

    const userDivs = this.state.users.map((user) => {
      return user ? (
        <div className="small-user-list" key={user.username}>
          {" "}
          <Avatar data={user} />
          <small>{user.username}</small>
        </div>
      ) : null;
    });

    return (
      <div className="card card-user">
        <div className="image"></div>
        <div className="content" style={{ minHeight: "190px" }}>
          <div className="author">
            <Avatar data={team} />
            <h4 className="title">
              {team.name}
              <br />
              <div className="row-items-box">{userDivs}</div>
            </h4>
          </div>
          <br />
          <p className="description text-center">{team.profile.biography}</p>
        </div>
      </div>
    );
  }
}

export default TeamCard;
