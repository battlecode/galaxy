import React, { Component } from "react";

/* a component for displaying a user or teams avatar (used on team and user pages)
 * props: data — either user or team, used to get avatar
 * Assumes that the backend will always return a URL, which Jerry claims to trust */
class Avatar extends Component {
  render() {
    const data = this.props.data;
    const avatar = data.profile.avatar_url;
    return <img className="avatar border-gray" src={avatar} alt="Avatar" />;
  }
}

export default Avatar;
