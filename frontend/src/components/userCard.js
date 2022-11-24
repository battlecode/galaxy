import React, { Component } from "react";
import Avatar from "../components/avatar";

class UserCard extends Component {
  render() {
    const user = this.props.user;
    const staff_msg =
      // Short-circuit check for nested object,
      // in case user hasn't been set yet.
      user && user.is_staff ? (
        <small>
          {" "}
          | <label>Staff</label>
        </small>
      ) : null;
    let avatar = "";
    if (user) avatar = "loading";
    if (user.profile.avatar_url != "") avatar = user.profile.avatar_url;

    return (
      <div className="card card-user">
        <div className="image"></div>
        <div className="content">
          <div className="author">
            <Avatar data={user} />
            <h4 className="title">
              {user.first_name + " " + user.last_name}
              <br />
              <small>{user.username}</small> {staff_msg}{" "}
            </h4>
          </div>
          <br />
          <p className="description text-center">{user.profile.biography}</p>
        </div>
      </div>
    );
  }
}

export default UserCard;
