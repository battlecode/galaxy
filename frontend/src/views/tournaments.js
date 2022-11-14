import React, { Component } from "react";
import Api from "../api";
import MultiEpisode from "./multi-episode";

class Tournaments extends Component {
  constructor() {
    super();
    this.state = {
      tournaments: [],
      episode: MultiEpisode.getEpisodeFromPathname(window.location.pathname),
    };
  }

  componentDidMount() {
    Api.getTournaments(
      function (t) {
        this.setState({ tournaments: t });
      }.bind(this)
    );
  }

  render() {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">
                    {this.state.episode} Tournament Schedule
                  </h4>
                </div>
                <div className="content">
                  <p>
                    Battlecode {this.state.episode} will consist of seven
                    tournaments throughout the month! We stream and commentate
                    all tournaments online.
                  </p>
                  <ul>
                    <li>
                      <b>Sprint Tournament 1: 1/11.</b> One week after spec
                      release, you're given a chance to win small prizes in this
                      tournament. The goal is to get an idea of the meta-game,
                      and a chance to test your bot prototypes.
                    </li>
                    <li>
                      <b>Sprint Tournament 2: 1/18.</b> One week after the
                      Sprint Tournament 1, you're given another chance to win
                      small prizes, test the metagame, and make changes.
                    </li>
                    <li>
                      <b>International Qualifying Tournament: 1/23.</b> This
                      tournament determines the <i>4 international teams</i>{" "}
                      that will qualify for the Final Tournament.
                    </li>
                    <li>
                      <b>US Qualifying Tournament: 1/25.</b>
                      This tournament determines the <i>
                        12 US-based teams
                      </i>{" "}
                      that will qualify for the Final Tournament.
                    </li>
                    <li>
                      <b>Newbie Tournament: 1/27.</b> The top newbie teams
                      compete for a smaller prize pool. The final match between
                      the top 2 teams will be run at the Final Tournament.
                    </li>
                    <li>
                      <b>High School Tournament: 1/27.</b> The top high school
                      teams compete for a smaller prize pool. Like the Newbie
                      Tournament, the final match will be run at the Final
                      Tournament.
                    </li>
                    <li>
                      <b>Final Tournament: 2/5. (Note the change!)</b> The top
                      16 teams, as determined by the qualifying tournaments,
                      compete for glory, fame and a big prize pool. The
                      tournament will take place live, at 7 pm, at MIT in 32-123
                      (and will of course be streamed online).{" "}
                      <b>All finalist teams will be invited to MIT.</b>
                    </li>
                  </ul>
                  <p>
                    <b>
                      The deadline to submit code for each non-final tournament
                      is 7 pm EST <i>the day before</i> the tournament.
                    </b>
                  </p>
                </div>
              </div>

              {/*<div className="card">*/}
              {/*  <div className="header">*/}
              {/*    <h4 className="title">Tournament Results</h4>*/}
              {/*  </div>*/}
              {/*  <div className="content">*/}
              {/*  </div>*/}
              {/*</div>*/}

              <div className="card">
                <div className="header">
                  <h4 className="title">Tournament Format</h4>
                </div>
                <div className="content">
                  <p>
                    Scrimmage rankings will be used to determine seeds for the
                    Sprint Tournaments. For all other tournaments, results from
                    the previous tournament will be used to seed teams (where
                    ties will be broken by the scrimmage ranking right before
                    the tournament).
                  </p>
                  <p>
                    Tournaments will be in a{" "}
                    <a href="https://en.wikipedia.org/wiki/Double-elimination_tournament">
                      double elimination
                    </a>{" "}
                    format, with the exception of both Sprint Tournaments, which
                    are single elimination. The Final Tournament will start with
                    a blank slate (any losses from the Qualifying Tournament are
                    reset).
                  </p>
                  <p>
                    Even if you miss earlier tournaments, you can participate in
                    later tournaments (except the Final Tournament). This
                    includes the Qualifying Tournament — you can participate
                    even if you miss every other tournament (your seed will be
                    determined by your scrimmage rank).
                  </p>
                  <p>
                    Each match within a tournament will consist of at least 3
                    games, each on a different map, and the team that wins the
                    most games will advance.
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="header">
                  <h4 className="title">Prizes</h4>
                </div>
                <div className="content">
                  <ul>
                    <li>
                      <b>Final Tournament prizes:</b> Our top 16 finalist teams
                      will battle it out for the top prizes.
                    </li>
                    <li>
                      Smaller prizes for top placers in other non-final (newbie,
                      US high school, sprint) tournaments.
                    </li>
                    <li>
                      <b>Bonus prizes, to be announced</b> 👀
                      <ul>
                        <li>
                          Historically, we have given out prizes for creative
                          strategies, major bugs found, and other game-specific
                          topics. Have fun with your strategies, write-ups, and
                          overall participation in Battlecode!
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="header">
                  <h4 className="title">Eligibility Rules</h4>
                </div>
                <div className="content">
                  <p>
                    Anyone is welcome to participate in Battlecode! Anyone can
                    write a bot, create a team, and participate in matches and
                    the Sprint Tournaments.
                  </p>
                  <p>
                    Your team must meet <b>all three conditions</b> to be
                    eligible for the Qualifying and Final tournaments by the
                    submission deadline:
                  </p>
                  <ol>
                    <li>Have uploaded a bot</li>
                    <li>
                      Have indicated your eligibility on your Team Profile page
                    </li>
                    <li>
                      Have all members upload a resume, at your personal profile
                      page.
                    </li>
                  </ol>
                  <p>As a reminder, the tournament divisions are:</p>
                  <ul>
                    <li>
                      <b>Full-time US teams</b>, consisting entirely of US
                      college students studying full-time, or in a transition
                      phase. We may ask for some documentation to verify your
                      student status if you advance to the finals. The{" "}
                      <b>top 12 teams</b> in this division will earn a place out
                      of 16 final tournament spots.
                    </li>
                    <li>
                      <b>Full-time international teams</b>, consisting entirely
                      of college students studying full-time, or in a transition
                      phase, where at least one team member is not a US student.
                      We may ask for some documentation to verify your student
                      status if you advance to the finals. The{" "}
                      <b>top 4 teams</b> in this division will earn a place out
                      of 16 final tournament spots.
                    </li>
                    <li>
                      <b>High-school teams</b>, consisting entirely of high
                      school students. The <b>top 2 teams</b> will have the
                      final match played during the final tournament.
                    </li>
                    <li>
                      <b>Newbie teams</b>, consisting entirely of MIT students
                      who have never competed in Battlecode before.{" "}
                      <b>The top 2 teams</b> will have their final match played
                      during the final tournament.
                    </li>
                  </ul>

                  <p>
                    More eligibility details can be found{" "}
                    <a href="https://battlecode.org#about">here</a>.
                  </p>

                  <p>
                    Only current full-time students are eligible for prizes.
                  </p>

                  <p>
                    Contact us on{" "}
                    <a href="https://discordapp.com/channels/386965718572466197/650097270804709436">
                      Discord
                    </a>{" "}
                    or at{" "}
                    <a href="mailto:battlecode@mit.edu">battlecode@mit.edu</a>{" "}
                    if you are unsure of your eligibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Tournaments;

// // This class is unused but kept, in case it comes in handy
// // (we've long thought about embedding challonge into our website,
// // you could do this through a component for each tournament)
// class Tournament extends Component {
//   render() {
//     return (
//       <div>
//         <p dangerouslySetInnerHTML={{ __html: this.props.blurb }}></p>
//         <h5 className="mb-0">
//           <button
//             className="btn btn-default btn-block collapsed"
//             type="button"
//             data-toggle="collapse"
//             data-target={"#" + this.props.name.replace(" ", "") + "0"}
//           >
//             {this.props.name.charAt(0).toUpperCase() + this.props.name.slice(1)}{" "}
//             Tournament Bracket
//           </button>
//         </h5>
//         <div
//           id={this.props.name.replace(" ", "") + "0"}
//           className="collapse"
//           data-parent={"#" + this.props.name}
//           style={{ "margin-top": "-1em" }}
//         >
//           <div className="card-body">
//             <iframe
//               title={this.props.challonge}
//               src={this.props.challonge + "/module"}
//               width="100%"
//               height="400px"
//               frameborder="0"
//               scrolling="auto"
//               allowtransparency="true"
//             ></iframe>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
