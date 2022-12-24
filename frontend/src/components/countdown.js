import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "../api";
import Duration from "duration";
import { getDateTimeText } from "../utils/date";

import Spinner from "./spinner";
class Countdown extends Component {
  constructor() {
    super();

    // Initialize defaults to render before API call finishes
    // Make sure this is as minimal as possible
    this.state = {
      days: null,
      hours: null,
      min: null,
      sec: null,
    };
  }

  componentDidMount() {
    if (this.props.is_game_released) {
      Api.getNextTournament(this.props.episode, (next_tournament) => {
        this.setState({ next_tournament });
        if (next_tournament) {
          this.setState({
            countdown_time: new Date(next_tournament.submission_freeze),
          });
        }
        //   const has_next_tournament = next_tournament !== null;
        //   this.setState({has_next_tournament});

        //   if (has_next_tournament) {
        //     this.setState({ countdown_time: new Date(next_tournament.submission_freeze) });

        //     this.setState({ tournament_name: next_tournament.tournament_name });
        //     this.setState({
        //       does_tour_require_resume: next_tournament.does_tour_require_resume,
        //     });
        //   }
      });
    } else {
      this.setState({ countdown_time: new Date(this.props.game_release) });
    }
    this.refreshCountdown();
    this.interval = setInterval(() => {
      this.refreshCountdown();
    }, 1000);
  }

  refreshCountdown() {
    const countdownResult = this.calculateCountdown(this.state.countdown_time);
    if (countdownResult !== false) {
      this.setState(countdownResult);
      this.setState({
        did_countdown_time_pass: false,
      });
    } else {
      this.stop();
      this.setState({
        did_countdown_time_pass: true,
      });
    }
  }

  componentWillUnmount() {
    this.stop();
  }

  // If endDate is in the future: returns a dict of {years:, ..., sec:} representing the time left
  // If not: returns false
  calculateCountdown(endDate) {
    const submission_countdown = new Duration(new Date(), endDate);

    // clear countdown when date is reached
    if (submission_countdown.valueOf() <= 0) return false;

    const timeLeft = {
      // Be careful of using full units vs trailing units
      // See https://www.npmjs.com/package/duration
      days: submission_countdown.days,
      hours: submission_countdown.hour,
      min: submission_countdown.minute,
      sec: submission_countdown.second,
    };

    return timeLeft;
  }

  stop() {
    clearInterval(this.interval);
  }

  addLeadingZeros(value) {
    return String(value).padStart(2, "0");
  }

  render() {
    let title = "";
    let extra_info = null;
    let show_countdown = false;
    console.log("!!", this.state.countdown_time);
    const countdown_time_text = this.state.countdown_time
      ? getDateTimeText(this.state.countdown_time)
      : null;
    const tense_verb = this.state.did_countdown_time_pass ? "was" : "is";
    if (!this.props.is_game_released) {
      title = "Game Release Countdown";
      show_countdown = true;
      extra_info = (
        <p>
          The game will be released at{" "}
          {countdown_time_text && countdown_time_text.est_date_str}, which{" "}
          {tense_verb}{" "}
          <b>{countdown_time_text && countdown_time_text.local_date_str}</b>.
        </p>
      );
    } else {
      title = "Next Submission Deadline";
      show_countdown =
        this.state.next_tournament !== undefined &&
        this.state.next_tournament !== null;
      extra_info =
        this.state.next_tournament !== undefined ? (
          <div>
            {this.state.next_tournament !== null ? (
              <p>
                The submission deadline for the{" "}
                <b>{this.state.next_tournament.name_long}</b> {tense_verb} at{" "}
                {countdown_time_text.est_date_str}, which {tense_verb}{" "}
                <b>{countdown_time_text.local_date_str}</b>.
              </p>
            ) : (
              <p>
                The submission deadline for the next tournament has not been set
                yet.
              </p>
            )}
            {this.state.next_tournament !== null &&
            this.state.next_tournament.require_resume ? (
              <p>
                Make sure to have indicated your eligibility on your{" "}
                <NavLink to="team">team profile page</NavLink>. Also make sure
                to have all members upload a resume, at your{" "}
                <NavLink to="account">personal profile page</NavLink>. See the
                eligibility rules given in the{" "}
                <NavLink to="team">tournament page</NavLink> for more info.
              </p>
            ) : null}
          </div>
        ) : (
          <Spinner />
        );
    }

    let countdown = show_countdown ? (
      <div className="countdown-container">
        <div className="Countdown">
          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>
                {this.state.days !== null
                  ? this.addLeadingZeros(this.state.days)
                  : "-"}
              </strong>
              <span>{this.state.days === 1 ? "Day" : "Days"}</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>
                {this.state.hours !== null
                  ? this.addLeadingZeros(this.state.hours)
                  : "-"}
              </strong>
              <span>{this.state.hours === 1 ? "Hour" : "Hours"}</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>
                {this.state.min !== null
                  ? this.addLeadingZeros(this.state.min)
                  : "-"}
              </strong>
              <span>Min</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>
                {this.state.sec !== null
                  ? this.addLeadingZeros(this.state.sec)
                  : "-"}
              </strong>
              <span>Sec</span>
            </span>
          </span>
        </div>
      </div>
    ) : undefined;

    return (
      <div className="card">
        <div className="header">
          <h4 className="title">{title}</h4>
        </div>
        <div className="content">
          {countdown}
          {extra_info}
        </div>
      </div>
    );
  }
}

export default Countdown;
