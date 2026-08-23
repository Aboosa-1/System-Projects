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
      Animations.showToast(err.message || 'Could not load your project.', 'error');
    }
    project = null;
  }

  // Note: there is no student-facing endpoint that reports whether project
  // registration is currently open/closed (backend/src/routes/settings.routes.js
  // is Admin-only), so this page no longer pre-emptively guesses that state.
  // If registration is closed, the backend will reject the create/update
  // request with a clear error at that point (see project-registration.js).

  if (!project) {
    const noProjectSection = document.getElementById('no-project-section');
    noProjectSection.classList.remove('hidden');
    Animations.slideUp(noProjectSection);
    if (editBtn) editBtn.classList.add('hidden');
  } else {
    const hasProjectSection = document.getElementById('has-project-section');
    hasProjectSection.classList.remove('hidden');
    Animations.slideUp(hasProjectSection);

    // Populate project data
    document.getElementById('project-title-display').textContent = project.title_en || project.title_ar || '-';

    let memberCount = 0;
    try {
      const members = await Api.getMembers(project.id);
      memberCount = (members || []).length;
    } catch (err) {
      // Non-fatal — leave member count at 0 if this call fails.
    }
    document.getElementById('project-members-display').textContent = memberCount + (memberCount === 1 ? ' member' : ' members');

    const dateStr = project.created_at
      ? new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '-';
    document.getElementById('project-date-display').textContent = dateStr;

    // Status badge (shared component/logic with Project Details page)
    App.applyStatusBadge(
      document.getElementById('project-status-badge'),
      document.getElementById('project-status-label'),
      project.status
    );

    // Editing is blocked server-side once the project is Accepted,
    // UnderReview, or UnderDecision — reflect that in the UI up front.
    if (editBtn && App.isEditBlockedStatus(project.status)) {
      editBtn.classList.add('form-disabled');
      editBtn.setAttribute('aria-disabled', 'true');
      editBtn.title = 'This project cannot be edited at its current review stage.';
      editBtn.addEventListener('click', (e) => e.preventDefault());
    }
  }
});
