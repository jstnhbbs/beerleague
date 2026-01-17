import './rules.css'

export default function RulesPage() {
  return (
    <div className="container">
      <div className="rules-container">
        <h1 className="rules-title">League Rules</h1>
        
        <div className="rules-content">
          <section className="rule-section">
            <h2>General Rules</h2>
            <p>Welcome to the Beer League! Here are the rules and guidelines for the season.</p>
          </section>

          <section className="rule-section">
            <h2>Gameplay</h2>
            <ul>
              <li>Games are played according to standard league rules</li>
              <li>All players must be registered before participating</li>
              <li>Substitutions are allowed as per league guidelines</li>
            </ul>
          </section>

          <section className="rule-section">
            <h2>Statistics</h2>
            <ul>
              <li>Stats are updated after each game</li>
              <li>Individual team stats can be viewed on each team's page</li>
              <li>League standings are updated weekly</li>
            </ul>
          </section>

          <section className="rule-section">
            <h2>Conduct</h2>
            <ul>
              <li>Respect all players, officials, and spectators</li>
              <li>Unsportsmanlike conduct will result in penalties</li>
              <li>Have fun and enjoy the game!</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
