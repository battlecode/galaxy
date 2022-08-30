import React, { Component } from "react";
import Api from "../api";

class Countdown extends Component {
  constructor() {
    super();

    this.state = {
      submission_deadline: undefined,
      text_submission_deadline: undefined,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
      end_date: null,
      tournament_name: "",
      est_date: "",
    };
  }

  componentDidMount() {
    Api.getNextTournament((tournament_info) => {
      // Note that state updates asynchronously,
      // but we need it immediately for computation
      // so we can't directly set state here
      // Instead work around that, and still hold references,
      // by using other component vars.
      // Also note that this.date doesn't get rendered directly; variables derived from it do.
      // So any changes to this.date will still have to require refreshes,
      // regardless of whether this.data is part of state or not.
      this.submission_deadline = tournament_info.submission_deadline;
      const text_submission_deadline = this.getDateTimeText(
        this.submission_deadline
      );
      console.log(text_submission_deadline);
      this.setState({ text_submission_deadline });

      this.interval = setInterval(() => {
        this.refreshCountdown();
      }, 1000);

      this.setState({ tournament_name: tournament_info.tournament_name });
      this.setState({
        has_next_tournament: tournament_info.has_next_tournament,
      });
    });
  }

  getDateTimeText(date) {
    // Use US localization for standardization in date format
    const est_string = date.toLocaleString("en-US", {
      timeZone: "EST",
    });
    // need to pass weekday here, since weekday isn't shown by default
    const est_day_of_week = date.toLocaleString("en-US", {
      timeZone: "EST",
      weekday: "short",
    });
    const est_date_str = `${est_day_of_week}, ${est_string} Eastern Time`;

    // Allow for localization here
    const locale_string = date.toLocaleString();
    const locale_day_of_week = date.toLocaleString([], {
      weekday: "short",
    });
    const local_date_str = `${locale_day_of_week}, ${locale_string} in your locale and time zone`;

    return { est_date_str: est_date_str, local_date_str: local_date_str };
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
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000;

    // clear countdown when date is reached
    if (diff <= 0) return false;

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
      millisec: 0,
    };

    // calculate time difference between now and expected date
    if (diff >= 365.25 * 86400) {
      // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400));
      diff -= timeLeft.years * 365.25 * 86400;
    }
    if (diff >= 86400) {
      // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400);
      diff -= timeLeft.days * 86400;
    }
    if (diff >= 3600) {
      // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600);
      diff -= timeLeft.hours * 3600;
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60);
      diff -= timeLeft.min * 60;
    }
    timeLeft.sec = diff;

    return timeLeft;
  }

  stop() {
    clearInterval(this.interval);
  }

  addLeadingZeros(value) {
    value = String(value);
    while (value.length < 2) {
      value = "0" + value;
    }
    return value;
  }

  render() {
    const countDown = this.state;
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
              <strong>{this.addLeadingZeros(countDown.days)}</strong>
              <span>{countDown.days === 1 ? "Day" : "Days"}</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(countDown.hours)}</strong>
              <span>{countDown.hours === 1 ? "Hour" : "Hours"}</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(countDown.min)}</strong>
              <span>Min</span>
            </span>
          </span>

          <span className="Countdown-col">
            <span className="Countdown-col-element">
              <strong>{this.addLeadingZeros(countDown.sec)}</strong>
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
