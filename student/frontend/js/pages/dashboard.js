/**
 * Dashboard Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const user = await Storage.getToken();

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const registerBtn = document.getElementById('register-project-btn');
  const editBtn = document.getElementById('edit-project-btn');

  let project = null;

  try {
    project = await Api.getMyProject();
  } catch (err) {
    if (err.status !== 404) {
      Animations.showToast(
        err.message || 'Could not load your project.',
        'error'
      );
    }

    project = null;
  }

  // =========================================================
  // NO PROJECT
  // =========================================================

  if (!project) {
    const noProjectSection =
      document.getElementById('no-project-section');

    if (noProjectSection) {
      noProjectSection.classList.remove('hidden');
      Animations.slideUp(noProjectSection);
    }

    if (editBtn) {
      editBtn.classList.add('hidden');
    }

    return;
  }

  // =========================================================
  // HAS PROJECT
  // =========================================================

  const hasProjectSection =
    document.getElementById('has-project-section');

  if (hasProjectSection) {
    hasProjectSection.classList.remove('hidden');
    Animations.slideUp(hasProjectSection);
  }

  // =========================================================
  // PROJECT INFORMATION
  // =========================================================

  const titleElement =
    document.getElementById('project-title-display');

  if (titleElement) {
    titleElement.textContent =
      project.title_en ||
      project.title_ar ||
      '-';
  }

  // =========================================================
  // TEAM MEMBERS
  // =========================================================

  let memberCount = 0;

  try {
    const members = await Api.getMembers(project.id);

    memberCount = (members || []).length;
  } catch (err) {
    // Non-fatal — leave member count at 0 if this call fails.
  }

  const membersElement =
    document.getElementById('project-members-display');

  if (membersElement) {
    membersElement.textContent =
      memberCount +
      (memberCount === 1 ? ' member' : ' members');
  }

  // =========================================================
  // PROJECT DATE
  // =========================================================

  const dateStr = project.created_at
    ? new Date(project.created_at).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      )
    : '-';

  const dateElement =
    document.getElementById('project-date-display');

  if (dateElement) {
    dateElement.textContent = dateStr;
  }

  // =========================================================
  // PROJECT STATUS
  // =========================================================

  App.applyStatusBadge(
    document.getElementById('project-status-badge'),
    document.getElementById('project-status-label'),
    project.status
  );

  // =========================================================
  // DOCTOR / STAFF COMMENT
  // =========================================================
  //
  // Backend should return:
  //
  // project.reviews = [
  //   {
  //      staff_name: "...",
  //      comments: "...",
  //      decision: "...",
  //      reviewed_at: "..."
  //   }
  // ]
  //
  // We display the latest review comment.
  // =========================================================

  const reviews = Array.isArray(project.reviews)
    ? project.reviews
    : [];

  const latestReview =
    reviews.length > 0
      ? reviews[reviews.length - 1]
      : null;

  const doctorCommentElement =
    document.getElementById('doctor-comment');

  const doctorNameElement =
    document.getElementById('doctor-reviewer');

  const doctorDateElement =
    document.getElementById('doctor-review-date');

  if (doctorCommentElement) {
    if (latestReview && latestReview.comments) {
      doctorCommentElement.textContent =
        latestReview.comments;
    } else {
      doctorCommentElement.textContent =
        'No doctor comment yet.';
    }
  }

  // Doctor / Staff name
  if (doctorNameElement) {
    if (latestReview && latestReview.staff_name) {
      doctorNameElement.textContent =
        `Reviewed by ${latestReview.staff_name}`;
    } else {
      doctorNameElement.textContent = '';
    }
  }

  // Review date
  if (doctorDateElement) {
    if (latestReview && latestReview.reviewed_at) {
      doctorDateElement.textContent =
        new Date(
          latestReview.reviewed_at
        ).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }
        );
    } else {
      doctorDateElement.textContent = '';
    }
  }

  // =========================================================
  // EDITING
  // =========================================================

  // Editing is blocked server-side once the project is
  // Accepted, UnderReview, or UnderDecision.
  //
  // Reflect that in the UI up front.

  if (
    editBtn &&
    App.isEditBlockedStatus(project.status)
  ) {
    editBtn.classList.add('form-disabled');

    editBtn.setAttribute(
      'aria-disabled',
      'true'
    );

    editBtn.title =
      'This project cannot be edited at its current review stage.';

    editBtn.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
      }
    );
  }
});
