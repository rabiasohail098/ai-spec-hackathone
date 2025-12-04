import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "@docusaurus/router";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

const ProfilePage = () => {
  const {
    user,
    isAuthenticated,
    logout,
    token,
    isInitialized,
    updateUserProfile,
  } = useAuth();
  const history = useHistory();
  const { withBaseUrl } = useBaseUrlUtils();
  const [readingProgress, setReadingProgress] = useState<any>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
  });

  // Initialize edit data when user is loaded
  useEffect(() => {
    if (user) {
      setEditData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    }
  }, [user]);

  // FIX 1: Check LocalStorage manually to prevent false "Access Denied"
  // during the split second after sign up/login redirect
  const hasLocalToken =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

  useEffect(() => {
    // Only fetch data if we are truly authenticated
    if (isInitialized && isAuthenticated && user) {
      fetchReadingProgress();
    } else if (isInitialized && !isAuthenticated && !hasLocalToken) {
      // Only stop loading if we are sure there is no token
      setDataLoading(false);
    }
  }, [isInitialized, isAuthenticated, user, token]);

  const fetchReadingProgress = async () => {
    try {
      const currentToken = token || hasLocalToken;
      if (!currentToken) return;

      const API_BASE_URL =
        process.env.NODE_ENV === "production"
          ? `${window.location.origin}/api/v1`
          : "http://localhost:8000/api/v1";

      const response = await fetch(`${API_BASE_URL}/auth/reading-progress`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReadingProgress(data.reading_progress || {});
      }
    } catch (error) {
      console.error("Failed to fetch reading progress:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    history.push(withBaseUrl("/"));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const success = await updateUserProfile(
        editData.first_name,
        editData.last_name,
      );

      if (success) {
        setIsEditing(false);
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
      } else {
        setEditError("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setEditError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating your profile",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditError(null);
    // Reset edit data to current user data
    if (user) {
      setEditData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    }
  };

  // FIX 2: Better Loading Logic
  // If context is initializing OR we have a local token but no user data yet, keep showing loading
  // This prevents the "Access Denied" flash after sign up
  const isLoadingState = !isInitialized || (hasLocalToken && !user);

  if (isLoadingState) {
    return (
      <Layout title="Profile" description="User profile page">
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div
                className="card"
                style={{ textAlign: "center", padding: "50px" }}
              >
                <div className="card__body">
                  <div
                    className="spinner"
                    style={{
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid #7e22ce",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 20px",
                    }}
                  ></div>
                  <h3>Loading Profile...</h3>
                  <p>Please wait while we retrieve your account details.</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // FIX 3: Robust Access Denied Check
  // Only deny access if initialized AND no user AND no local token
  if (!isAuthenticated && !user && !hasLocalToken) {
    return (
      <Layout title="Profile" description="User profile page">
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="card">
                <div className="card__header">
                  <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
                </div>
                <div className="card__body">
                  <p>You must be logged in to view this page.</p>
                  <div style={{ marginTop: "20px" }}>
                    <a
                      className="button button--primary button--block"
                      href="/signin"
                    >
                      Sign In
                    </a>
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                      or <a href="/signup">Create an Account</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate completed chapters safely
  const completedChapters = readingProgress
    ? Object.keys(readingProgress).filter(
        (key) => readingProgress[key]?.completed,
      ).length
    : 0;

  const totalChapters = readingProgress
    ? Object.keys(readingProgress).length
    : 0;

  return (
    <Layout
      title="Profile"
      description="Your Physical AI & Humanoid Robotics profile"
    >
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            {/* User Info Card */}
            <div className="card margin-bottom--lg shadow--md">
              <div
                className="card__header"
                style={{
                  background:
                    "linear-gradient(135deg, #7e22ce 0%, #c026d5 100%)",
                  color: "white",
                }}
              >
                <h2 style={{ margin: 0 }}>👤 Your Profile</h2>
              </div>
              <div className="card__body">
                {isEditing ? (
                  // Edit Form
                  <form onSubmit={handleEditSubmit}>
                    {editError && (
                      <div
                        style={{
                          padding: "10px",
                          marginBottom: "15px",
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          borderRadius: "6px",
                          border: "1px solid #fecaca",
                        }}
                      >
                        {editError}
                      </div>
                    )}
                    {editSuccess && (
                      <div
                        style={{
                          padding: "10px",
                          marginBottom: "15px",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          borderRadius: "6px",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        ✅ Profile updated successfully!
                      </div>
                    )}

                    <div className="margin-bottom--md">
                      <label
                        htmlFor="first_name"
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        First Name:
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={editData.first_name}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "1em",
                        }}
                      />
                    </div>

                    <div className="margin-bottom--md">
                      <label
                        htmlFor="last_name"
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Last Name:
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={editData.last_name}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "1em",
                        }}
                      />
                    </div>

                    <div className="margin-bottom--md">
                      <strong style={{ color: "#7e22ce" }}>Email:</strong>
                      <div
                        style={{
                          fontSize: "1em",
                          padding: "8px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "6px",
                          marginTop: "5px",
                        }}
                      >
                        {user?.email} (cannot be changed)
                      </div>
                    </div>

                    <div className="button-group button-group--block">
                      <button
                        type="submit"
                        className="button button--primary"
                        disabled={editLoading}
                      >
                        {editLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="button button--secondary margin-left--sm"
                        onClick={handleCancel}
                        disabled={editLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className="row">
                      <div className="col col--6">
                        <div className="margin-bottom--md">
                          <strong style={{ color: "#7e22ce" }}>
                            First Name:
                          </strong>
                          <div style={{ fontSize: "1.2em" }}>
                            {user?.first_name || "Not provided"}
                          </div>
                        </div>
                        <div className="margin-bottom--md">
                          <strong style={{ color: "#7e22ce" }}>
                            Last Name:
                          </strong>
                          <div style={{ fontSize: "1.2em" }}>
                            {user?.last_name || "Not provided"}
                          </div>
                        </div>
                      </div>
                      <div className="col col--6">
                        <div className="margin-bottom--md">
                          <strong style={{ color: "#7e22ce" }}>Email:</strong>
                          <div style={{ fontSize: "1.2em" }}>{user?.email}</div>
                        </div>
                        <div className="margin-bottom--md">
                          <strong style={{ color: "#7e22ce" }}>
                            Member since:
                          </strong>
                          <div>
                            {user?.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "Recent"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="card__footer">
                <div className="button-group button-group--block">
                  {!isEditing && (
                    <button
                      className="button button--primary"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                  <button
                    className="button button--secondary"
                    onClick={() => history.push("/")}
                  >
                    Go Home
                  </button>
                  <button
                    className="button button--danger margin-left--sm"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Reading Progress Card */}
            <div className="card margin-bottom--lg shadow--md">
              <div className="card__header">
                <h3>📚 Reading Progress</h3>
              </div>
              <div className="card__body">
                {dataLoading ? (
                  <p>Syncing progress...</p>
                ) : totalChapters > 0 ? (
                  <>
                    <div className="margin-bottom--md">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <strong>Completion Status</strong>
                        <span>
                          {completedChapters} / {totalChapters} Chapters
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          background: "#e5e7eb",
                          borderRadius: "5px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${(completedChapters / totalChapters) * 100}%`,
                            height: "100%",
                            background: "#10b981",
                            transition: "width 0.5s ease",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="margin-bottom--md">
                      <strong>Details:</strong>
                      <ul
                        style={{
                          marginTop: "10px",
                          listStyle: "none",
                          padding: 0,
                        }}
                      >
                        {Object.entries(readingProgress).map(
                          ([chapterId, progress]: [string, any]) => (
                            <li
                              key={chapterId}
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                📄 <strong>{chapterId}</strong>
                              </span>
                              <span>
                                {progress.completed ? (
                                  <span className="badge badge--success">
                                    ✅ Completed
                                  </span>
                                ) : (
                                  <span className="badge badge--secondary">
                                    📖 In Progress
                                  </span>
                                )}
                                <span
                                  style={{
                                    marginLeft: "10px",
                                    fontSize: "0.85em",
                                    color: "#666",
                                  }}
                                >
                                  ({Math.floor((progress.time_spent || 0) / 60)}{" "}
                                  min read)
                                </span>
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <p>No reading progress recorded yet.</p>
                    <a
                      href="/ai-spec-hackathone/docs/intro"
                      className="button button--primary button--sm"
                    >
                      Start Reading
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
