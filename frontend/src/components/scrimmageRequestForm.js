// Based on https://stackoverflow.com/a/67233977
import React, { Component } from "react";
import Api from "../api";

import ActionMessage from "../components/actionMessage";
import Alert from "../components/alert";

const PLAYER_ORDERS = [
  { value: "?", name: "Shuffled" },
  { value: "+", name: "Requester first" },
  { value: "-", name: "Requester last" },
];

class ScrimmageRequestForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      is_ranked: true,
      player_order: PLAYER_ORDERS[0].value,
      maps: ["", "", ""],
      available_maps: [],
      update_status: "waiting",
      alert_message: "",
    };

    this.getMaps();

    this.changeHandler = this.changeHandler.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.requestScrimmage = this.requestScrimmage.bind(this);
  }

  getRandomMaps(available_maps) {
    const possible_maps = available_maps.slice();
    // Pick a random subset of 3 maps, assuming that there are at least 3 possible maps
    const random_maps = [];
    for (let i = 0; i < 3; i++) {
      const map_index = Math.floor(Math.random() * possible_maps.length);
      random_maps.push(possible_maps[map_index].name);
      possible_maps.splice(map_index, 1);
    }
    return random_maps;
  }

  getMaps() {
    Api.getMaps(this.props.episode, (available_maps) => {
      const random_maps = this.getRandomMaps(available_maps);
      this.setState({ available_maps, maps: random_maps });
    });
  }

  changeHandler(e) {
    const id = e.target.id;
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (id.startsWith("map")) {
      this.setState(function (prevState, props) {
        var map_number = id.split("_")[1];
        prevState.maps[map_number] = val;
        return prevState;
      });
    } else {
      this.setState(function (prevState, props) {
        prevState[id] = val;
        return prevState;
      });
    }
  }

  requestScrimmage() {
    if (new Set(this.state.maps).size !== this.state.maps.length) {
      this.setState({
        alert_message: "Cannot have duplicate maps in scrimmage request.",
      });
      return;
    }
    this.setState({ update_status: "loading" });
    Api.requestScrimmage(
      this.state.is_ranked,
      this.props.team.id,
      this.state.player_order,
      this.state.maps,
      this.props.episode,
      (success) => {
        /* Being lazy about error handling since in theory frontend
                   form validation should eliminate chance of user errors,
                   and the backend doesn't yet give useful messages anyway.
                */
        if (success) {
          this.setState({ update_status: "success" });
        } else {
          this.setState({ update_status: "failure" });
          this.setState({
            alert_message:
              "Scrimmage request failed! Have you and the opponent both made successful code submissions yet?",
          });
        }
        setTimeout(() => {
          this.setState({ update_status: "waiting" });
        }, 2000);
      }
    );
  }

  closeModal(e) {
    // Reset state
    const random_maps = this.getRandomMaps(this.state.available_maps);
    this.setState({
      is_ranked: true,
      player_order: PLAYER_ORDERS[0].value,
      maps: random_maps,
    });

    e.stopPropagation();
    this.props.closeRequestForm();
  }

  closeAlert = () => {
    this.setState({ alert_message: "" });
  };

  render() {
    const displayStyle = this.props.team !== null ? "show" : "fade";

    /* Based on example in https://getbootstrap.com/docs/4.0/components/modal/#live-demo */
    return (
      <div>
        <Alert
          alert_message={this.state.alert_message}
          closeAlert={this.closeAlert}
        />
        <div
          className={`modal ${displayStyle}`}
          id="exampleModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Requesting scrimmage against team{" "}
                  {this.props.team && this.props.team.name}
                </h5>
                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={this.closeModal}
                  style={{ fontSize: "3em", marginTop: "-32px" }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Player order</label>
                  <select
                    className="form-control"
                    id="player_order"
                    onChange={this.changeHandler}
                    value={this.state.player_order}
                  >
                    {PLAYER_ORDERS.map((player_order) => {
                      return (
                        <option
                          value={player_order.value}
                          key={player_order.value}
                        >
                          {player_order.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {this.state.maps.map((map_name, map_number) => {
                  return (
                    <div className="form-group" key={map_number}>
                      <label>Map {map_number + 1}</label>
                      <select
                        className="form-control"
                        id={`map_${map_number}`}
                        onChange={this.changeHandler}
                        value={map_name}
                      >
                        {this.state.available_maps.map((map) => {
                          return (
                            <option value={map.name} key={map.name}>
                              {map.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
                <div className="form-group" style={{ display: "flex" }}>
                  <label>Ranked?</label>
                  <input
                    type="checkbox"
                    className="form-control"
                    onChange={this.changeHandler}
                    style={{
                      width: "20px",
                      height: "20px",
                      margin: "0 0 0 10px",
                    }}
                    id="is_ranked"
                    checked={this.props.is_ranked}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.requestScrimmage}
                >
                  <ActionMessage
                    default_message="Request scrimmage"
                    status={this.state.update_status}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ScrimmageRequestForm;
