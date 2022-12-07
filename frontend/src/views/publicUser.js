import React, { Component } from "react";

import UserCard from "../components/userCard";
import TeamCard from "../components/teamCard";

class PublicUser extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <UserCard user={this.props.user} />
              <TeamCard team={this.props.team} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PublicUser;
