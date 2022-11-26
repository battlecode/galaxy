import React, { Component } from "react";

class AvatarUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAvatarFile: null,
    };

    this.uploadAvatar = this.uploadAvatar.bind(this);
  }

  fileChangeHandler = (event) => {
    this.setState({
      selectedAvatarFile: event.target.files[0],
      loaded: 0,
    });
  };

  uploadAvatar() {
    this.props.uploadAvatar(this.state.selectedAvatarFile);
  }

  render() {
    // Avatar upload button logic
    const avatar_uploaded = this.state.selectedAvatarFile !== null;
    const avatar_file_label = !avatar_uploaded
      ? "No file chosen."
      : this.state.selectedAvatarFile["name"];
    const avatar_btn_class =
      "btn btn" + (!avatar_uploaded ? "" : " btn-info btn-fill");
    const avatar_upload_button = (
      <button
        disabled={!avatar_uploaded}
        style={{ float: "right" }}
        onClick={this.uploadAvatar}
        className={avatar_btn_class}
      >
        {" "}
        Upload Avatar{" "}
      </button>
    );

    return (
      <div className="col-md-12">
        <div className="form-group">
          <label>Avatar</label>
          <br />
          <label htmlFor="avatar_file_upload">
            <div className="btn"> Choose File </div>{" "}
            <span
              style={{
                textTransform: "none",
                marginLeft: "10px",
                fontSize: "14px",
              }}
            >
              {" "}
              {avatar_file_label}{" "}
            </span>
          </label>
          <input
            id="avatar_file_upload"
            type="file"
            onChange={this.fileChangeHandler}
            style={{ display: "none" }}
          />
          {avatar_upload_button}
        </div>
      </div>
    );
  }
}

export default AvatarUpload;
