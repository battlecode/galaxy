import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import MultiEpisode from "./multi-episode";

class Resources extends Component {
  constructor(params) {
    super(params);
    this.state = {
      episode: MultiEpisode.getEpisodeFromCurrentPathname(),
    };
  }

  render() {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">Game Specifications</h4>
                </div>
                <div className="content">
                  <p className="text-center">
                    <a
                      type="button"
                      className="btn btn-info btn-fill text-center"
                      href={`https://play.battlecode.org/specs/${this.state.episode}/specs.md.html`}
                    >
                      Specifications for {this.state.episode}!
                    </a>
                  </p>
                  <p className="text-center">
                    <a
                      type="button"
                      className="btn btn-info btn-fill text-center"
                      href={`https://play.battlecode.org/javadocs/${this.state.episode}/index.html`}
                    >
                      Javadocs for {this.state.episode}!
                    </a>
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="header">
                  <h4 className="title">Coding Resources</h4>
                </div>
                <div className="content">
                  <p>
                    If you're just starting out, check out the{" "}
                    <NavLink
                      to={`/${this.state.episode}/getting-started`}
                      style={{ fontWeight: 700 }}
                    >
                      getting started
                    </NavLink>{" "}
                    page!
                  </p>
                  <p>For more helpful resources while coding, see:</p>
                  <p className="text-center">
                    <a
                      type="button"
                      className="btn btn-info btn-fill text-center"
                      href="/common-issues"
                    >
                      Common Issues
                    </a>
                  </p>
                  <p className="text-center">
                    <a
                      type="button"
                      className="btn btn-info btn-fill text-center"
                      href="/debugging"
                    >
                      Debugging Tips
                    </a>
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="header">
                  <h4 className="title">Third-party Tools</h4>
                </div>
                <div className="content">
                  <p>
                    The tools below were made by contestants! They haven't been
                    tested by the devs, but might prove to be very helpful in
                    developing your bot.
                  </p>
                  <p>
                    If you make a new tool that could be useful to others,
                    please post it in the{" "}
                    <a href="https://discordapp.com/channels/386965718572466197/531960965240193024">
                      #open-source-tools channel
                    </a>{" "}
                    on the Discord. Everyone will love you!!
                  </p>
                  <ul>
                    <li>There is nothing here yet...</li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="header">
                  <h4 className="title">Lectures</h4>
                </div>
                <div className="content">
                  <p>
                    Battlecode {this.state.episode} will be holding lectures,
                    where a dev will be going over possible strategy, coding up
                    an example player, answering questions, etc. Lectures are
                    streamed on Twitch every weekday the first two weeks of IAP
                    7-10 PM Eastern Time.
                  </p>
                  <p>
                    All lectures are streamed live on{" "}
                    <a href="https://twitch.tv/mitbattlecode">
                      our Twitch account
                    </a>
                    , and are later uploaded to{" "}
                    <a href="https://youtube.com/channel/UCOrfTSnyimIXfYzI8j_-CTQ">
                      our YouTube channel
                    </a>
                    .
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

export default Resources;
