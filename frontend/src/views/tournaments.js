import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "../api";
class Tournaments extends Component {
  componentDidMount() {}

  render() {
    const tournamentRows = this.props.tournament_info.map((tournament) => {
      return (
        <tr key={tournament.name_short} className="page-item">
          <td>{tournament.name_long}</td>
          <td>
            {new Date(tournament.display_date).toLocaleDateString([], {
              timeZone: "UTC",
            })}
          </td>
          {this.props.team !== null ? (
            <td style={{ textAlign: "center" }}>
              {tournament.is_eligible ? (
                <i className="fa fa-check text-success" title="Yes"></i>
              ) : (
                <i className="fa fa-times text-danger" title="No"></i>
              )}
            </td>
          ) : (
            ""
          )}
          <td>
            <NavLink
              to={`/${this.props.episode}/tournament_matches/${tournament.name_short}`}
            >
              View
            </NavLink>
          </td>
          <td>{tournament.blurb}</td>
        </tr>
      );
    });
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">
                    {this.props.episode_name_long} Tournament Schedule
                  </h4>
                </div>
                <div className="content">
                  <p>
                    {this.props.episode_name_long} will have several tournaments
                    throughout the month! We stream and commentate all
                    tournaments online.
                  </p>
                  <p>
                    The deadline to submit code for each non-final tournament is
                    usually 7 pm EST <i>the day before</i> the tournament.
                  </p>
                  <div className="table-responsive table-full-width">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Tournament</th>
                          <th>Date</th>
                          {this.props.team !== null ? <th>Eligibility</th> : ""}
                          <th>Results</th>
                          <th>About</th>
                        </tr>
                      </thead>
                      <tbody>{tournamentRows}</tbody>
                    </table>
                  </div>
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
                  <h4 className="title">Prizes</h4>
                </div>
                <div className="content">
                  <p>
                    Prize amounts are approximate and will be finalized soon!
                  </p>
                  <ul>
                    <li>
                      <b>Final Tournament prizes:</b> Prizes will likely range
                      from $4000 for 1st place to $500 for 16th place.
                    </li>
                    <li>
                      <b>Sprint prizes:</b> Prizes will likely be around $250
                      per team for the top team.
                    </li>
                    <li>
                      <b>Newbie, High School prizes:</b> Prizes will likely be
                      around $400/team for the top 2 teams.
                    </li>
                    <li>
                      <a href="https://www.regression.gg/battlecode">
                        <b>Best Devlog Series Prize:</b>
                      </a>{" "}
                      Prize given by our Gold Sponsor,{" "}
                      <a href="https://www.regression.gg">Regression Games</a>.
                      First place will receive $250, and all winners will
                      receive a chance to interview for internships.
                      <ul>
                        <li>
                          We want to see what you are building during the
                          Battlecode season! Share your Battlecode development
                          experience on your favorite social media platform over
                          the course of the tournament. Post your learnings, fun
                          moments, hardships, and progress! You must tag
                          Battlecode and Regression Games in the post to be
                          eligible for this prize (see{" "}
                          <a href="https://regression.gg/battlecode">
                            regression.gg/battlecode
                          </a>{" "}
                          for more info, ideas, and social media handles).
                          {/* Historically, we have given out prizes for creative
                          strategies, major bugs found, and other game-specific
                          topics. Have fun with your strategies, write-ups, and
                          overall participation in Battlecode! */}
                        </li>
                      </ul>
                    </li>
                    <li>
                      <b>Best Strategy Report Prize: </b>
                      Prize given by our Gold Sponsor,{" "}
                      <a href="https://argus.gg/">Argus Labs</a>. First place
                      will receive $250, and all winners will receive a chance
                      to interview for internships and a swag box.
                      <ul>
                        <li>
                          Submit a strategy report detailing the strategies you
                          used to develop your bot! We'd love to see how you
                          handled communication, resource allocation, battling,
                          and more. Tell us what unique strategies your team
                          came up with! A link for submitting reports will be
                          provided later.
                          {/* Historically, we have given out prizes for creative
                          strategies, major bugs found, and other game-specific
                          topics. Have fun with your strategies, write-ups, and
                          overall participation in Battlecode! */}
                        </li>
                      </ul>
                    </li>
                  </ul>
                  <p>
                    If you are an international participant, please note that{" "}
                    <a href="https://www.bis.doc.gov/index.php/policy-guidance/country-guidance/sanctioned-destinations">
                      US export regulations
                    </a>{" "}
                    may restrict our ability to award prizes to students from
                    certain countries.
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="header">
                  <h4 className="title">Tournament Format</h4>
                </div>
                <div className="content">
                  <p>
                    Each match within a tournament will consist of at least 3
                    games, each on a different map, and the team that wins the
                    most games will advance.
                  </p>
                  <p>
                    Scrimmage rankings will be used to determine seeds for all
                    tournaments. Ties will be broken by Sprint tournament
                    rankings.
                  </p>
                  <p>
                    Tournaments will be in a double elimination format, with the
                    exception of both Sprint Tournaments, which are single
                    elimination. The Final Tournament will start with a blank
                    slate (any losses from the Qualifying Tournament are reset).
                  </p>
                  <p>
                    Even if you miss earlier tournaments, you can participate in
                    later tournaments (except the Final Tournament). This
                    includes the Qualifying Tournament — you can participate
                    even if you miss every other tournament (your seed will be
                    determined by your scrimmage rank).
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="header">
                  <h4 className="title">Eligibility Rules</h4>
                </div>
                <div className="content">
                  {/* <ul>

                  </ul>
                <ul>

                  </ul> */}
                  <p>
                    Anyone can write a bot, create a team, and participate in
                    scrimmage matches/rankings. The Sprint Tournaments are open
                    to everyone, but the other tournaments have stricter
                    eligibility rules.
                  </p>
                  <p>
                    Your team must meet <b>all three conditions</b> by a
                    tournament's submission deadline to be eligible for it:
                  </p>
                  <ol>
                    <li>Have uploaded a bot</li>
                    <li>
                      Have correctly indicated your eligibility on your Team
                      Profile page
                    </li>
                    <li>
                      Have all members upload a resume, at your personal profile
                      page (This condition does not apply to the Sprint
                      Tournaments).
                    </li>
                  </ol>
                  <p>
                    Additionally, tournament specific eligibility is listed
                    below:
                  </p>
                  <ul>
                    <li>
                      <b>Sprint Tournament: </b> All teams are eligible.
                    </li>
                    <li>
                      <b>US Qualifier:</b> Teams must{" "}
                      <b>consist entirely of US college students</b> studying
                      full-time, or in a transition phase.
                    </li>
                    <li>
                      <b>International Qualifier:</b> Teams must{" "}
                      <b>consist entirely of college students</b> studying
                      full-time, or in a transition phase, where at least one
                      team member is not a US student.
                    </li>
                    <li>
                      <b>MIT Newbie Tournament:</b> Teams must{" "}
                      <b>consist entirely of MIT students</b> who have never
                      competed in Battlecode before.
                    </li>
                    <li>
                      <b>High School Tournament:</b> Teams must{" "}
                      <b>consist entirely of high school students</b>.
                    </li>
                    <li>
                      <b>Final Tournament:</b> Teams must have qualified via the
                      US or International Qualifier. The final match of the
                      Newbie and High School tournaments will also be played at
                      the final tournament.
                    </li>
                  </ul>

                  <p>
                    Contact us on{" "}
                    <a href="https://discord.gg/N86mxkH">Discord</a> or at{" "}
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
