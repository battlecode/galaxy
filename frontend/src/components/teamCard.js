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
    const members = this.props.team_profile.team.members;
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
    this.props.team_profile.team.members.forEach((user_id, user_index) => {
      Api.getProfileByUser(user_id, this.getSetUserCallback(user_index), true);
    });
  }

  /* add user to state array, should never change length of users */
  getSetUserCallback(user_index) {
    return (user_profile) => {
      this.setState(function (prevState, props) {
        prevState.users[user_index] = user_profile;
        return prevState;
      });
    };
  }

  componentDidUpdate() {
    if (this.state.users.length === 0 && this.props.team_profile.team.members) {
      this.setupUsers();
      this.getUserData();
    }
  }

  render() {
    const team_profile = this.props.team_profile;

    const userDivs = this.state.users.map((user_profile) => {
      console.log("user_profile: ", user_profile);
      return user_profile ? (
        <div className="small-user-list" key={user_profile.user.username}>
          {" "}
          {/*<Avatar data={user} /> TODO: avatar*/}
          <small>{user_profile.user.username}</small>
        </div>
      ) : null;
    });

    return (
      <div className="card card-user">
        <div className="image"></div>
        <div className="content" style={{ minHeight: "190px" }}>
          <div className="author">
            {/*<Avatar data={team} /> TODO: team avatar */}
            <h4 className="title">
              {team_profile.team.name}
              <br />
              <div className="row-items-box">{userDivs}</div>
            </h4>
          </div>
          <br />
          <p className="description text-center">{team_profile.biography}</p>
        </div>
      </div>
    );
  }
}

export default TeamCard;
