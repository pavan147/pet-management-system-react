import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addCommentToPost,
  createCommunityPost,
  deleteCommunityPost,
  fetchCommunityFeed,
  fetchCommunityPostById,
  fetchLostPetsFeed,
  fetchPostPhotoBlob,
} from "../../services/CommunityService";
import {
  getLoggedInDisplayName,
  getUserRole,
  isAdminUser,
} from "../../services/VeterinaryRegistrationService";
import "./community.css";

const CATEGORY_OPTIONS = ["GENERAL", "QUESTION", "TIP", "LOST_PET", "DISEASE_ALERT"];

const formatCategory = (value) =>
  value
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const CommunityPage = ({ lostPetsOnly = false }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedPost, setSelectedPost] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    category: lostPetsOnly ? "LOST_PET" : "GENERAL",
    location: "",
    petName: "",
    contactInfo: "",
    photo: null,
  });

  const [photoCache, setPhotoCache] = useState({});

  const loggedInName = getLoggedInDisplayName();
  const loggedInRole = getUserRole();

  const subtitleText = lostPetsOnly
    ? "Report and track missing pets quickly"
    : "Share tips, ask questions, and discuss pet health";

  const canDeletePost = (post) => {
    if (isAdminUser()) return true;
    return (post.authorName || "").toLowerCase() === (loggedInName || "").toLowerCase();
  };

  const fetchFeed = async (targetPage = 0) => {
    try {
      setLoadingFeed(true);
      setFeedError("");

      const data = lostPetsOnly
        ? await fetchLostPetsFeed({ page: targetPage, size })
        : await fetchCommunityFeed({
            category: selectedCategory || undefined,
            keyword: keyword || undefined,
            page: targetPage,
            size,
          });

      setPosts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(data.number || 0);
    } catch (error) {
      setFeedError(error.response?.data?.error || "Failed to load community feed.");
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeed(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lostPetsOnly, selectedCategory, keyword]);

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i), [totalPages]);

  const openPostDetails = async (postId) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      const data = await fetchCommunityPostById(postId);
      setSelectedPost(data);

      if (data.hasPhoto && !photoCache[data.id]) {
        const photoUrl = await fetchPostPhotoBlob(data.id);
        setPhotoCache((prev) => ({ ...prev, [data.id]: photoUrl }));
      }
    } catch (error) {
      setDetailsError(error.response?.data?.error || "Failed to load post details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteCommunityPost(postId);
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
      await fetchFeed(page);
    } catch (error) {
      window.alert(error.response?.data?.error || "Unable to delete post.");
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      await addCommentToPost(selectedPost.id, newComment.trim());
      setNewComment("");
      await openPostDetails(selectedPost.id);
      await fetchFeed(page);
    } catch (error) {
      window.alert(error.response?.data?.error || "Unable to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      content: "",
      category: lostPetsOnly ? "LOST_PET" : "GENERAL",
      location: "",
      petName: "",
      contactInfo: "",
      photo: null,
    });
    setCreateError("");
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!createForm.title.trim() || !createForm.content.trim()) {
      setCreateError("Title and content are required.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");

      const payload = {
        title: createForm.title.trim(),
        content: createForm.content.trim(),
        category: createForm.category,
        location: createForm.location.trim() || null,
        petName: createForm.petName.trim() || null,
        contactInfo: createForm.contactInfo.trim() || null,
      };

      await createCommunityPost(payload, createForm.photo);
      setCreateOpen(false);
      resetCreateForm();
      await fetchFeed(0);
    } catch (error) {
      setCreateError(error.response?.data?.error || "Failed to create post.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4 community-page pb-5">
      <div className="community-hero card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
          <div>
            <h2 className="fw-bold mb-1">{lostPetsOnly ? "Lost Pet Alerts" : "Pet Community"}</h2>
            <p className="text-muted mb-0">{subtitleText}</p>
            <small className="text-secondary">Logged in as {loggedInName || "User"} ({loggedInRole || "ROLE_PET_OWNER"})</small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {!lostPetsOnly && (
              <button className="btn btn-outline-primary" onClick={() => navigate("/community/lost-pets")}>
                View Lost Pets
              </button>
            )}
            {lostPetsOnly && (
              <button className="btn btn-outline-primary" onClick={() => navigate("/community")}>
                Open Full Community
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              Create Post
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            {!lostPetsOnly && (
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setPage(0);
                    setSelectedCategory(e.target.value);
                  }}
                >
                  <option value="">All categories</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>{formatCategory(category)}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={lostPetsOnly ? "col-md-10" : "col-md-7"}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, content, or location"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={lostPetsOnly}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setPage(0);
                  setKeyword(searchInput.trim());
                }}
                disabled={lostPetsOnly}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {feedError && <div className="alert alert-danger">{feedError}</div>}

      {loadingFeed ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {posts.length === 0 ? (
              <div className="col-12"><div className="alert alert-info mb-0">No posts found for current filters.</div></div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="col-xl-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <span className="badge text-bg-light border">{formatCategory(post.category)}</span>
                          <h5 className="mt-2 mb-1">{post.title}</h5>
                          <p className="text-muted small mb-2">by {post.authorName} ({post.authorRole}) | {formatDateTime(post.createdAt)}</p>
                        </div>
                        {canDeletePost(post) && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePost(post.id)} title="Delete post">
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>

                      <p className="mb-2">{post.content}</p>

                      <div className="small text-secondary d-flex flex-wrap gap-3 mb-3">
                        {post.location && <span>Location: {post.location}</span>}
                        {post.petName && <span>Pet: {post.petName}</span>}
                        {post.contactInfo && <span>Contact: {post.contactInfo}</span>}
                        <span>Comments: {post.commentCount}</span>
                      </div>

                      <button className="btn btn-outline-primary btn-sm" onClick={() => openPostDetails(post.id)}>
                        Open Discussion
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 d-flex flex-wrap gap-2">
              {pageNumbers.map((p) => (
                <button key={p} className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-primary"}`} onClick={() => fetchFeed(p)}>
                  {p + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className={`community-overlay ${selectedPost ? "show" : ""}`} onClick={() => setSelectedPost(null)}></div>
      <aside className={`community-drawer ${selectedPost ? "show" : ""}`}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="mb-0">Discussion</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedPost(null)}>Close</button>
        </div>

        {detailsLoading && <div className="text-center py-4"><div className="spinner-border"></div></div>}
        {detailsError && <div className="alert alert-danger">{detailsError}</div>}

        {selectedPost && !detailsLoading && (
          <>
            <h6 className="fw-bold">{selectedPost.title}</h6>
            <p className="text-muted small mb-2">by {selectedPost.authorName} ({selectedPost.authorRole})</p>
            <p>{selectedPost.content}</p>

            {selectedPost.hasPhoto && photoCache[selectedPost.id] && (
              <img src={photoCache[selectedPost.id]} alt="Post" className="img-fluid rounded border mb-3" />
            )}

            <div className="border-top pt-3 mt-3">
              <h6>Comments</h6>
              {(selectedPost.comments || []).length === 0 && <p className="text-muted small">No comments yet.</p>}
              <div className="community-comments">
                {(selectedPost.comments || []).map((comment) => (
                  <div className="comment-item" key={comment.id}>
                    <div className="small fw-semibold">{comment.commenterName} <span className="text-muted">({comment.commenterRole})</span></div>
                    <div className="small text-secondary">{formatDateTime(comment.createdAt)}</div>
                    <p className="mb-0 mt-1">{comment.comment}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <textarea className="form-control" rows="3" placeholder="Write a helpful comment" value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                <button className="btn btn-primary btn-sm mt-2" disabled={commentLoading || !newComment.trim()} onClick={handleAddComment}>
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {createOpen && (
        <div className="community-modal-backdrop">
          <div className="community-modal card border-0 shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Create Community Post</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                  setCreateOpen(false);
                  resetCreateForm();
                }}>Close</button>
              </div>

              {createError && <div className="alert alert-danger py-2">{createError}</div>}

              <form onSubmit={handleCreatePost}>
                <div className="mb-2">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={createForm.title} onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))} maxLength={120} required />
                </div>

                <div className="mb-2">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={createForm.category} onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))} disabled={lostPetsOnly}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>{formatCategory(category)}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows="4" value={createForm.content} onChange={(e) => setCreateForm((prev) => ({ ...prev, content: e.target.value }))} maxLength={5000} required></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-4">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={createForm.location} onChange={(e) => setCreateForm((prev) => ({ ...prev, location: e.target.value }))} maxLength={120} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Pet Name</label>
                    <input className="form-control" value={createForm.petName} onChange={(e) => setCreateForm((prev) => ({ ...prev, petName: e.target.value }))} maxLength={100} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Contact Info</label>
                    <input className="form-control" value={createForm.contactInfo} onChange={(e) => setCreateForm((prev) => ({ ...prev, contactInfo: e.target.value }))} maxLength={80} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Photo (optional)</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setCreateForm((prev) => ({
                    ...prev,
                    photo: e.target.files && e.target.files.length ? e.target.files[0] : null,
                  }))} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? "Publishing..." : "Publish Post"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;

