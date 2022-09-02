import React, { Component } from "react";
import Api from "../api";
import Duration from "duration";

class Countdown extends Component {
  constructor() {
    super();

    // Initialize defaults to render before API call finishes
    // Make sure this is as minimal as possible
    this.state = {
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
    };
  }

  componentDidMount() {
    Api.getNextTournament((tournament_info) => {
      // Note that state updates asynchronously, but we need it immediately for computation.
      // So we can't only set state here
      this.submission_deadline = tournament_info.submission_deadline;
      this.setState({ submission_deadline: this.submission_deadline });
      const text_submission_deadline = tournament_info.submission_deadline_strs;
      this.setState({ text_submission_deadline });

      this.refreshCountdown();
      this.interval = setInterval(() => {
        this.refreshCountdown();
      }, 1000);

      this.setState({ tournament_name: tournament_info.tournament_name });
      this.setState({
        has_next_tournament: tournament_info.has_next_tournament,
      });
    });
  }

  refreshCountdown() {
    const countdownResult = this.calculateCountdown(this.submission_deadline);
    if (countdownResult !== false) {
      this.setState(countdownResult);
      this.setState({
        did_submission_deadline_pass: false,
      });
    } else {
      this.stop();
      this.setState({
        did_submission_deadline_pass: true,
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
    let title = "Submission Deadline";
    let tense_verb = this.state.did_submission_deadline_pass ? "was" : "is";

    // Needs to be cleaned, see issue #16 for tracking this and discussion
    let explanatoryText = this.state.has_next_tournament ? (
      <div>
        The submission deadline for the <b>{this.state.tournament_name}</b>{" "}
        {tense_verb} at {this.state.text_submission_deadline.est_date_str},
        which {tense_verb}{" "}
        <b>{this.state.text_submission_deadline.local_date_str}</b>.
      </div>
    ) : (
      <div>
        The submission deadline for the next tournament has not been set yet.
      </div>
    );

    let countdown = this.state.has_next_tournament ? (
      <div className="countdown-container">
        <div className="Countdown">
          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(this.state.days)}</strong>
              <span>{this.state.days === 1 ? "Day" : "Days"}</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(this.state.hours)}</strong>
              <span>{this.state.hours === 1 ? "Hour" : "Hours"}</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(this.state.min)}</strong>
              <span>Min</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(this.state.sec)}</strong>
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
          {explanatoryText}
        </div>
      </div>
    );
  }
}

export default Countdown;
