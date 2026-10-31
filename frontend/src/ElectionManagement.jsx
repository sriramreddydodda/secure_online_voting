import React, { useEffect, useState } from "react";
import "./ElectionManagement.css";

const API_URL = "http://localhost:8080/api/elections";

export default function ElectionManagement() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadElections() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to load elections: HTTP " + response.status);
      }

      const data = await response.json();
      setElections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadElections();
  }, []);

  async function createElection(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (
      startDate &&
      endDate &&
      new Date(endDate) <= new Date(startDate)
    ) {
      setError("End date must be later than start date.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
          status: "UPCOMING",
          active: true
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create election: HTTP " + response.status);
      }

      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setNotice("Election created successfully.");
      await loadElections();
    } catch (err) {
      setError(err.message || "Could not create election.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(election) {
    setError("");
    setNotice("");

    const action = election.active ? "deactivate" : "activate";

    try {
      const response = await fetch(
        '${API_URL}/${election.id}/${action}',
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Failed to update election status.");
      }

      setNotice("Election status updated.");
      await loadElections();
    } catch (err) {
      setError(err.message || "Could not update election.");
    }
  }

  async function deleteElection(election) {
    if (!window.confirm('Delete "${election.title}" permanently?')) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch('${API_URL}/${election.id}', {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete election.");
      }

      setNotice("Election deleted successfully.");
      await loadElections();
    } catch (err) {
      setError(err.message || "Could not delete election.");
    }
  }

  function formatDate(value) {
    return value ? value.replace("T", " ") : "Not set";
  }

  const activeCount = elections.filter(
    (election) => election.active
  ).length;

  return (
    <main className="em-page">
      <header className="em-header">
        <div>
          <p className="em-eyebrow">SECUREVOTE / ADMINISTRATION</p>
          <h1>Election Management</h1>
          <p className="em-subtitle">
            Create and manage election records.
          </p>
        </div>

        <button
          className="em-button em-button-light"
          type="button"
          onClick={loadElections}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="em-alert em-alert-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="em-alert em-alert-success" role="status">
          {notice}
        </div>
      )}

      <section className="em-stats">
        <article className="em-stat-card">
          <span className="em-stat-icon">▦</span>
          <p>Total elections</p>
          <strong>{elections.length}</strong>
        </article>

        <article className="em-stat-card">
          <span className="em-stat-icon em-green">✓</span>
          <p>Active elections</p>
          <strong>{activeCount}</strong>
        </article>

        <article className="em-stat-card">
          <span className="em-stat-icon em-purple">◷</span>
          <p>Inactive elections</p>
          <strong>{elections.length - activeCount}</strong>
        </article>
      </section>

      <section className="em-panel">
        <div className="em-section-heading">
          <div>
            <h2>Create an election</h2>
            <p>Enter the election details below.</p>
          </div>
          <span className="em-badge">New record</span>
        </div>

        <form className="em-form" onSubmit={createElection}>
          <div className="em-field em-full">
            <label htmlFor="em-title">Election title *</label>
            <input
              id="em-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter election title"
              maxLength={150}
              required
            />
          </div>

          <div className="em-field em-full">
            <label htmlFor="em-description">Description</label>
            <textarea
              id="em-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter election description"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="em-field">
            <label htmlFor="em-start">Start date and time</label>
            <input
              id="em-start"
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="em-field">
            <label htmlFor="em-end">End date and time</label>
            <input
              id="em-end"
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div className="em-form-actions em-full">
            <button
              className="em-button em-button-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Election"}
            </button>
          </div>
        </form>
      </section>

      <section className="em-list-section">
        <div className="em-section-heading">
          <div>
            <h2>All elections</h2>
            <p>Election records from your database.</p>
          </div>
          <span className="em-count">{elections.length} records</span>
        </div>

        {loading ? (
          <div className="em-empty">Loading elections...</div>
        ) : elections.length === 0 ? (
          <div className="em-empty">
            <span className="em-empty-icon">▦</span>
            <h3>No elections yet</h3>
            <p>Create your first election above.</p>
          </div>
        ) : (
          <div className="em-election-grid">
            {elections.map((election) => (
              <article className="em-election-card" key={election.id}>
                <div className="em-card-top">
                  <span className="em-card-icon">▦</span>
                  <span
                    className={
                      "em-status " +
                      (election.active
                        ? "em-status-active"
                        : "em-status-inactive")
                    }
                  >
                    {election.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="em-election-id">
                  ELECTION #{election.id}
                </p>

                <h3>{election.title || "Untitled election"}</h3>

                <p className="em-card-description">
                  {election.description || "No description provided."}
                </p>

                <div className="em-details">
                  <div>
                    <span>Status</span>
                    <strong>{election.status || "UPCOMING"}</strong>
                  </div>
                  <div>
                    <span>Starts</span>
                    <strong>{formatDate(election.startDate)}</strong>
                  </div>
                  <div>
                    <span>Ends</span>
                    <strong>{formatDate(election.endDate)}</strong>
                  </div>
                </div>

                <div className="em-card-actions">
                  <button
                    className="em-button em-button-light"
                    type="button"
                    onClick={() => changeStatus(election)}
                  >
                    {election.active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    className="em-button em-button-danger"
                    type="button"
                    onClick={() => deleteElection(election)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="em-footer">
        <span>✓ SecureVote</span>
        <span>Secure Voting Management System · Educational project</span>
      </footer>
    </main>
  );
}