import React, { Component } from "react";

/* a component for displaying a user or teams avatar (used on team and user pages)
 * props: data — either user or team, used to get avatar or seed for random generation.
 *				 if data does not have either name or username defined, empty avatar will be returned */
class Avatar extends Component {
  render() {
    const data = this.props.data;
    const has_avatar = data.profile.has_avatar;
    const avatar = data.profile.avatar_url;
    if (has_avatar) {
      // avatar is uploaded
      return <img className="avatar border-gray" src={avatar} alt="Avatar" />;
    } else {
      if (!data.name && !data.username && !data.id) {
        // data not fully loaded, return placeholder
        return (
          <div
            className="avatar border-gray"
            style={{ display: "inline-block" }}
          ></div>
        );
      }
    }
  }
}

export default Avatar;
