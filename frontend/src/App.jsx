import { useState } from "react";

const API = "http://localhost:8080/api";
const AUTH_API = API + "/auth";
const ELECTION_API = API + "/elections";
const CANDIDATE_API = API + "/candidates";
const VOTE_API = API + "/votes";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },
  loginPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "linear-gradient(135deg,#101a35,#243e70)",
  },
  loginCard: {
    width: "100%",
    maxWidth: 410,
    background: "white",
    padding: 35,
    borderRadius: 18,
    boxShadow: "0 15px 50px rgba(0,0,0,.2)",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    margin: "8px 0 18px",
    border: "1px solid #d7dce5",
    borderRadius: 8,
    fontSize: 15,
  },
  button: {
    padding: "11px 17px",
    border: "none",
    borderRadius: 8,
    background: "#2458c6",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    margin: "4px",
  },
  secondary: {
    padding: "10px 15px",
    border: "1px solid #ccd4e2",
    borderRadius: 8,
    background: "white",
    color: "#24334f",
    cursor: "pointer",
    fontWeight: 600,
    margin: "4px",
  },
  danger: {
    padding: "10px 15px",
    border: "none",
    borderRadius: 8,
    background: "#c73545",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    margin: "4px",
  },
  layout: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: 235,
    background: "#14213d",
    color: "white",
    padding: 22,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  main: {
    flex: 1,
    padding: 30,
    minWidth: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  panel: {
    background: "white",
    border: "1px solid #e3e7ef",
    borderRadius: 13,
    padding: 22,
    marginBottom: 20,
    boxShadow: "0 3px 12px rgba(20,35,65,.04)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 17,
  },
  muted: {
    color: "#68758b",
    fontSize: 14,
  },
};

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Request failed: HTTP " + response.status
    );
  }

  return data;
}

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [elections, setElections] = useState([]);
  const [electionsLoading, setElectionsLoading] = useState(false);

  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [voteLoading, setVoteLoading] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");
  const [voteError, setVoteError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingElection, setSavingElection] = useState(false);

  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const isAdmin =
    String(user?.role || "").toUpperCase() === "ADMIN";

  async function loadElections() {
    setElectionsLoading(true);
    setError("");

    try {
      const data = await apiRequest(ELECTION_API);
      setElections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load elections: " + err.message);
    } finally {
      setElectionsLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(AUTH_API + "/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const loggedInUser = {
        id: data.id,
        username: data.username || username,
        fullName: data.fullName || data.username || username,
        role: data.role || "VOTER",
      };

      setUser(loggedInUser);
      setPassword("");
      setMessage("Login successful!");
      setActiveSection("dashboard");

      await loadElections();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setUsername("");
    setPassword("");
    setElections([]);
    setSelectedElection(null);
    setCandidates([]);
    setSelectedCandidate(null);
    setResults(null);
    setMessage("");
    setError("");
    setVoteMessage("");
    setVoteError("");
    setHasVoted(false);
    setActiveSection("dashboard");
  }

  async function openElection(election) {
    setSelectedElection(election);
    setSelectedCandidate(null);
    setCandidates([]);
    setResults(null);
    setVoteMessage("");
    setVoteError("");
    setHasVoted(false);
    setActiveSection("details");

    setCandidatesLoading(true);

    try {
      const data = await apiRequest(
        CANDIDATE_API + "/election/" + election.id
      );
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      setVoteError("Could not load candidates: " + err.message);
    } finally {
      setCandidatesLoading(false);
    }
  }

  async function loadResults() {
    if (!selectedElection) return;

    setResultsLoading(true);

    try {
      const data = await apiRequest(
        VOTE_API + "/results/" + selectedElection.id
      );
      setResults(data);
    } catch (err) {
      setError("Could not load results: " + err.message);
    } finally {
      setResultsLoading(false);
    }
  }

  async function castVote() {
    if (!selectedElection || !selectedCandidate) {
      setVoteError("Please select a candidate first.");
      return;
    }

    const confirmed = window.confirm(
      "Submit your vote for " + selectedCandidate.name +
      "? You cannot vote again in this election."
    );

    if (!confirmed) return;

    setVoteLoading(true);
    setVoteError("");
    setVoteMessage("");

    try {
      const data = await apiRequest(VOTE_API, {
        method: "POST",
        body: JSON.stringify({
          electionId: selectedElection.id,
          candidateId: selectedCandidate.id,
        }),
      });

      setVoteMessage(data.message || "Vote submitted successfully.");
      setSelectedCandidate(null);
      setHasVoted(true);
      await loadResults();
    } catch (err) {
      setVoteError(err.message || "Could not submit your vote.");
    } finally {
      setVoteLoading(false);
    }
  }

  async function createElection(event) {
    event.preventDefault();
    setSavingElection(true);
    setError("");
    setMessage("");

    if (
      electionForm.startDate &&
      electionForm.endDate &&
      new Date(electionForm.endDate) <= new Date(electionForm.startDate)
    ) {
      setError("End date must be after start date.");
      setSavingElection(false);
      return;
    }

    try {
      await apiRequest(ELECTION_API, {
        method: "POST",
        body: JSON.stringify({
          title: electionForm.title.trim(),
          description: electionForm.description.trim(),
          startDate: electionForm.startDate
            ? electionForm.startDate + ":00"
            : null,
          endDate: electionForm.endDate
            ? electionForm.endDate + ":00"
            : null,
          status: "UPCOMING",
          active: true,
        }),
      });

      setMessage("Election created successfully.");
      setElectionForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      setShowCreateForm(false);
      await loadElections();
    } catch (err) {
      setError("Could not create election: " + err.message);
    } finally {
      setSavingElection(false);
    }
  }

  async function changeElectionStatus(election, activate) {
    const action = activate ? "activate" : "deactivate";

    try {
      await apiRequest(
        ELECTION_API + "/" + election.id + "/" + action,
        { method: "PUT" }
      );

      setMessage("Election status updated.");
      await loadElections();

      if (selectedElection?.id === election.id) {
        setSelectedElection({
          ...selectedElection,
          active: activate,
          status: activate ? "ACTIVE" : "INACTIVE",
        });
      }
    } catch (err) {
      setError("Could not update election: " + err.message);
    }
  }

  async function deleteElection(election) {
    const confirmed = window.confirm(
      "Delete " + election.title + "? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await apiRequest(ELECTION_API + "/" + election.id, {
        method: "DELETE",
      });

      if (selectedElection?.id === election.id) {
        setSelectedElection(null);
        setCandidates([]);
        setResults(null);
        setActiveSection("elections");
      }

      setMessage("Election deleted successfully.");
      await loadElections();
    } catch (err) {
      setError("Could not delete election: " + err.message);
    }
  }

  function isActive(election) {
    return (
      election.active === true ||
      String(election.status || "").toUpperCase() === "ACTIVE"
    );
  }

  if (!user) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: 25 }}>
            <div style={{
              width: 55,
              height: 55,
              borderRadius: 14,
              background: "#2458c6",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: "bold",
            }}>
              ✓
            </div>
            <h1 style={{ marginBottom: 5 }}>SecureVote</h1>
            <p style={styles.muted}>Secure Voting Management System</p>
          </div>

          <form onSubmit={login}>
            <label>Username</label>
            <input
              style={styles.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />

            <label>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />

            <button
              style={{ ...styles.button, width: "100%", padding: 14 }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {error && (
            <p style={{ color: "#c73545" }} role="alert">{error}</p>
          )}
          {message && (
            <p style={{ color: "green" }} role="status">{message}</p>
          )}

          <p style={{ ...styles.muted, textAlign: "center", marginTop: 25 }}>
            Your voice. Your vote. Your choice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h2 style={{ marginBottom: 4 }}>✓ SecureVote</h2>
          <p style={{ color: "#aebbd3", fontSize: 11 }}>
            VOTING PLATFORM
          </p>

          <p style={{
            color: "#9eacc5",
            fontSize: 11,
            marginTop: 35,
            letterSpacing: 1,
          }}>
            WORKSPACE
          </p>

          <button
            style={styles.secondary}
            onClick={() => {
              setActiveSection("dashboard");
              setSelectedElection(null);
            }}
          >
            Dashboard
          </button>

          <button
            style={styles.secondary}
            onClick={() => {
              setActiveSection("elections");
              setSelectedElection(null);
              loadElections();
            }}
          >
            Elections
          </button>

          <button
            style={styles.secondary}
            onClick={() => setActiveSection("profile")}
          >
            My Profile
          </button>

          <div style={{ flex: 1 }} />

          <p style={{ color: "#aebbd3", fontSize: 12 }}>
            Security first. Keep your credentials private.
          </p>

          <button style={styles.danger} onClick={logout}>
            Sign Out
          </button>
        </aside>

        <main style={styles.main}>
          <header style={styles.header}>
            <div>
              <p style={styles.muted}>Workspace / Overview</p>
              <h1 style={{ margin: 0 }}>
                {activeSection === "details"
                  ? "Election Details"
                  : activeSection === "profile"
                    ? "My Profile"
                    : activeSection === "elections"
                      ? "Elections"
                      : isAdmin
                        ? "Admin Dashboard"
                        : "Dashboard"}
              </h1>
            </div>

            <div>
              <strong>{user.fullName}</strong>
              <p style={{ ...styles.muted, margin: "5px 0" }}>
                {user.role}
              </p>
            </div>
          </header>

          {message && (
            <div style={{
              ...styles.panel,
              color: "#187342",
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              ...styles.panel,
              color: "#bd2838",
            }}>
              {error}
            </div>
          )}

          {activeSection === "dashboard" && (
            <>
              <div style={styles.panel}>
                <h2>Welcome, {user.fullName}</h2>
                <p style={styles.muted}>
                  Welcome to your SecureVote dashboard. View elections,
                  review candidates and participate in active elections.
                </p>
                <button
                  style={styles.button}
                  onClick={() => {
                    setActiveSection("elections");
                    loadElections();
                  }}
                >
                  View Elections
                </button>
              </div>

              <div style={styles.grid}>
                <div style={styles.panel}>
                  <h3>Total Elections</h3>
                  <h1>{elections.length}</h1>
                </div>
                <div style={styles.panel}>
                  <h3>Active Elections</h3>
                  <h1>{elections.filter(isActive).length}</h1>
                </div>
                <div style={styles.panel}>
                  <h3>Account Type</h3>
                  <h2>{user.role}</h2>
                </div>
              </div>
            </>
          )}

          {activeSection === "elections" && (
            <>
              <div style={styles.header}>
                <div>
                  <h2>Available Elections</h2>
                  <p style={styles.muted}>
                    Select an election to view its candidates.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    style={styles.button}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                  >
                    {showCreateForm ? "Cancel" : "+ Create Election"}
                  </button>
                )}
              </div>

              {showCreateForm && isAdmin && (
                <div style={styles.panel}>
                  <h3>Create New Election</h3>
                  <form onSubmit={createElection}>
                    <label>Election title</label>
                    <input
                      style={styles.input}
                      value={electionForm.title}
                      onChange={(event) =>
                        setElectionForm({
                          ...electionForm,
                          title: event.target.value,
                        })
                      }
                      required
                    />

                    <label>Description</label>
                    <textarea
                      style={{ ...styles.input, minHeight: 85 }}
                      value={electionForm.description}
                      onChange={(event) =>
                        setElectionForm({
                          ...electionForm,
                          description: event.target.value,
                        })
                      }
                    />

                    <label>Start date and time</label>
                    <input
                      style={styles.input}
                      type="datetime-local"
                      value={electionForm.startDate}
                      onChange={(event) =>
                        setElectionForm({
                          ...electionForm,
                          startDate: event.target.value,
                        })
                      }
                    />

                    <label>End date and time</label>
                    <input
                      style={styles.input}
                      type="datetime-local"
                      value={electionForm.endDate}
                      onChange={(event) =>
                        setElectionForm({
                          ...electionForm,
                          endDate: event.target.value,
                        })
                      }
                    />

                    <button
                      style={styles.button}
                      type="submit"
                      disabled={savingElection}
                    >
                      {savingElection ? "Creating..." : "Create Election"}
                    </button>
                  </form>
                </div>
              )}

              {electionsLoading && <p>Loading elections...</p>}

              {!electionsLoading && elections.length === 0 && (
                <div style={styles.panel}>
                  <h3>No elections found</h3>
                  <p style={styles.muted}>
                    Elections will appear here when they are created.
                  </p>
                </div>
              )}

              <div style={styles.grid}>
                {elections.map((election) => (
                  <div style={styles.panel} key={election.id}>
                    <h3>{election.title}</h3>

                    <p style={styles.muted}>
                      {election.description || "No description available."}
                    </p>

                    <p>
                      Status: {election.status || "Not specified"}
                    </p>

                    <p style={styles.muted}>
                      Election ID: {election.id}
                    </p>

                    <button
                      style={styles.button}
                      onClick={() => openElection(election)}
                    >
                      View Election
                    </button>

                    {isAdmin && (
                      <div>
                        <button
                          style={styles.secondary}
                          onClick={() =>
                            changeElectionStatus(election, !isActive(election))
                          }
                        >
                          {isActive(election) ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          style={styles.danger}
                          onClick={() => deleteElection(election)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "details" && selectedElection && (
            <>
              <button
                style={styles.secondary}
                onClick={() => setActiveSection("elections")}
              >
                ← Back to Elections
              </button>

              <div style={styles.panel}>
                <h2>{selectedElection.title}</h2>
                <p>{selectedElection.description || "No description available."}</p>
                <p>Election ID: {selectedElection.id}</p>
                <p>Status: {selectedElection.status || "Not specified"}</p>
              </div>

              {voteMessage && (
                <div style={{ ...styles.panel, color: "green" }}>
                  {voteMessage}
                </div>
              )}

              {voteError && (
                <div style={{ ...styles.panel, color: "#bd2838" }}>
                  {voteError}
                </div>
              )}

              <h2>Election Candidates</h2>

              {candidatesLoading && <p>Loading candidates...</p>}

              {!candidatesLoading && candidates.length === 0 && (
                <div style={styles.panel}>
                  <h3>No candidates registered</h3>
                  <p>An administrator must add candidates to this election.</p>
                </div>
              )}

              <div style={styles.grid}>
                {candidates.map((candidate) => (
                  <div style={styles.panel} key={candidate.id}>
                    <h3>{candidate.name}</h3>
                    <p style={styles.muted}>
                      {candidate.party || "Independent"}
                    </p>
                    <p>
                      {candidate.manifesto || "No manifesto provided."}
                    </p>

                    <button
                      style={
                        selectedCandidate?.id === candidate.id
                          ? styles.secondary
                          : styles.button
                      }
                      disabled={hasVoted}
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      {selectedCandidate?.id === candidate.id
                        ? "Selected"
                        : "Select Candidate"}
                    </button>
                  </div>
                ))}
              </div>

              {selectedCandidate && !hasVoted && (
                <div style={styles.panel}>
                  <h3>Confirm Your Vote</h3>
                  <p>
                    Selected candidate: <strong>{selectedCandidate.name}</strong>
                  </p>

                  <button
                    style={styles.button}
                    onClick={castVote}
                    disabled={voteLoading}
                  >
                    {voteLoading ? "Submitting..." : "Submit Vote"}
                  </button>
                </div>
              )}

              <div style={styles.panel}>
                <h3>Election Results</h3>

                <button
                  style={styles.secondary}
                  onClick={loadResults}
                  disabled={resultsLoading}
                >
                  {resultsLoading ? "Loading..." : "View Results"}
                </button>

                {results && (
                  <div>
                    <p>Total votes: {results.totalVotes}</p>

                    {Array.isArray(results.candidates) &&
                      results.candidates.map((result) => (
                        <div
                          key={result.candidateId}
                          style={{
                            padding: 12,
                            borderBottom: "1px solid #e3e7ef",
                          }}
                        >
                          <strong>{result.candidateName}</strong>
                          <p>Party: {result.party || "Independent"}</p>
                          <p>Votes: {result.votes}</p>
                          <p>Percentage: {result.percentage}%</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === "profile" && (
            <div style={styles.panel}>
              <h2>My Profile</h2>
              <p><strong>Full Name:</strong> {user.fullName}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;