import React, { Component } from "react";
import Avatar from "../components/avatar";

class UserCard extends Component {
  render() {
    const user_profile = this.props.user_profile;
    const staff_msg =
      // Short-circuit check for nested object,
      // in case user_profile hasn't been set yet.
      user_profile && user_profile.user.is_staff ? (
        <small>
          {" "}
          | <label>Staff</label>
        </small>
      ) : null;
    return (
      <div className="card card-user">
        <div className="image"></div>
        <div className="content">
          <div className="author">
            {/*<Avatar data={user} />*/}
            <h4 className="title">
              {user_profile.user.first_name + " " + user_profile.user.last_name}
              <br />
              <small>{user_profile.user.username}</small> {staff_msg}{" "}
            </h4>
          </div>
          <br />
          <p className="description text-center">{user_profile.biography}</p>
        </div>
      </div>
    );
  }
}

export default UserCard;
