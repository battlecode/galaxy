import React, { Component } from "react";
import Api from "../api";

import RankingTeamSearch from "../components/rankingTeamSearch";

class ScrimmageRequestor extends Component {
  // state = {
  //   autocompleteOptions: [],
  //   input: "",
  // };

  // handleInput = (e) => {
  //   const newInput = e.target.value;

  //   this.setState({
  //     input: newInput,
  //     autocompleteOptions: [],
  //   });
  //   if (newInput) {
  //     Api.searchTeam(newInput, 1, this.onAutocompleteReturn);
  //   }
  // };

  // onAutocompleteReturn = ({ query, teams }) => {
  //   const { state } = this;

  //   if (query === state.input) {
  //     this.setState({ autocompleteOptions: teams });
  //   }
  // };

  render() {
    const { state, props } = this;

    // const hasAutocompleteOptions = !!state.autocompleteOptions.length;

    // const dataOptions = hasAutocompleteOptions && (
    //   <datalist id="team-options">
    //     {state.autocompleteOptions.map((option) => {
    //       return <option key={option.id} value={option.name} />;
    //     })}
    //   </datalist>
    // );

    return (
      <RankingTeamSearch
        episode={this.props.episode}
        episode_info={this.props.episode_info}
        search_placeholder="Search for a Team to Scrimmage..."
        history={this.props.history}
      />
    );
  }
}

export default ScrimmageRequestor;
