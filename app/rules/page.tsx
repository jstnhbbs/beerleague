import './rules.css'

export default function RulesPage() {
    return (
        <div className="container">
            <div className="rules-container">
                <h1 className="rules-title">League Rules</h1>

                <div className="rules-content">
                    <section className="rule-section">
                        <h1>Beer League Fantasy Football League Rules</h1>
                        <h2>Updated 8/19/25 PB</h2>
                        <p>Some of this information is built into the settings of the ESPN Fantasy App and mentioned here for clarity.  Other areas are decided and handled manually by the Commissioner or the League.  Everything here is written to the best of my (Paul) ability.  If an error or discrepancy exists, the Commissioner will make a decision, discuss with the officers and/or put it to a vote.  Remember, this is supposed to be fun.</p>
                    </section>

                    <section className="rule-section">
                        <h2>Officers</h2>
                        <ul>
                            <li>Commissioner: Garrett</li>
                            <li>Treasurer: Paul</li>
                            <li>Assistant to the Commissioner: Hobbs</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Fees</h2>
                        <ul>
                            <li>$20 fee paid to Treasurer</li>
                            <li>Payment deadline is by the start of the first game of the season.</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Draft</h2>
                        <ul>
                            <li>Snake Draft</li>
                            <li>Date determined by Commissioner</li>
                            <li>Draft order is drawn randomly by Commissioner prior to draft.  Usually this involves a decent quality video definitely done while he is at work and may or may not be done while actively watching children.</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Keepers</h2>
                        <ul>
                            <li>One player can be designated prior to draft as a keeper from the previous season's final roster.</li>
                            <li>Not required to keep a player from previous roster</li>
                            <li>Deadline for keeper designation is determined by Commissioner</li>
                            <li>If a player was drafted, keeping them will cost you a draft pick in the round prior to the round they were drafted.  (ex: drafted in round 9, keeper will be your 8th round pick the next season).</li>
                            <li>If a player was drafted after round 10 or an undrafted free agent, they would be considered a 10th round draft pick for keeper purposes.</li>
                            <li>Each successive season you keep the player, will cost you the draft pick one round earlier than the previous season. (ex: drafted in round 9, kept next season for 8th round pick, third year would cost your 7th round pick).</li>
                            <li>A player can only be kept on your roster for a maximum of 3 years.</li>
                            <li>First round picks from the previous season cannot be kept, even if they have been on your roster for less than 3 years.</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Rosters</h2>
                        <ul>
                            <li>1 QB (4 max)</li>
                            <li>2 RB (8 max)</li>
                            <li>2 WR (8 max)</li>
                            <li>1 TE (3 max)</li>
                            <li>1 Flex</li>
                            <li>1 D/ST (3 max)</li>
                            <li>1K (3 max)</li>
                            <li>7 bench positions</li>
                            <li>1 IR roster spot</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Scoring</h2>
                        <ul>
                            <li>Half PPR (0.5 points per reception)</li>
                            <li>Rounded to a hundredth of a point to avoid ties.</li>
                            <li>Determined by Commissioner prior to draft and available for review on website or app.</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Waivers</h2>
                        <ul>
                            <li>No limit</li>
                            <li>Team moved to the end of the waiver order after a successful claim</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Trades</h2>
                        <ul>
                            <li>Limited to 15 trades</li>
                            <li>Trade Deadline is set at beginning of season</li>
                            <li>Review period is 2 days</li>
                            <li>Votes required to veto trade is 6</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Playoffs</h2>
                        <ul>
                            <li>3 week playoff at the end of the regular season.</li>
                            <li>Top 8 teams go to the playoffs</li>
                            <li>Tiebreaker: Total points For (PF)</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Sacko Playoff</h2>
                        <ul>
                            <li>Bottom 2 teams go to Sacko Playoff</li>
                            <li>Tiebreaker: Total points For (PF)</li>
                            <li>Losers play best of 3 series against each other</li>
                            <li>First to 2 losses is the Sacko</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Prize for Champion</h2>
                        <ul>
                            <li>The Champion will receive a growler (or credit toward a growler) of their choosing paid for with league dues.</li>
                            <li>Laser inscribed with your name and the year you won (including shipping).</li>
                            <li>Purchase, laser engraving and shipping to be handled by the Treasurer.</li>
                            <li>Additional money available after growler purchase, laser engraving and shipping will be used to purchase additional beer for the champion. Will be coordinated with Sacko if necessary for shipping purposes.</li>
                        </ul>
                    </section>

                    <section className="rule-section">
                        <h2>Sacko Punishment</h2>
                        <ul>
                            <li>Sacko will purchase $30 of “quality” beer to be delivered to the winner by Super Bowl Sunday.</li>
                            <li>Sacko can choose to work with the Treasurer and Champion to pay debt (determining beer, coordinating place of purchase, shipping, etc.).</li>
                            <li>
                                Sacko will choose one of the following options when hanging out with any other member(s) of the League.
                                <ul>
                                    <li>Not drink any alcohol</li>
                                    <li>Purchase a round of drinks for all league members present for every drink the loser wishes to drink.</li>
                                </ul>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
