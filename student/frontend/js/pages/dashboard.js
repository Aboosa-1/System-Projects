console.log("🔥 DASHBOARD JS LOADED");
/**
 * Dashboard Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {

  // =========================================================
  // 1. AUTHENTICATION
  // =========================================================

  const token = await Storage.getToken();

  if (!token) {
    window.location.href = 'login.html';
    return;
  }


  // =========================================================
  // 2. ELEMENTS
  // =========================================================

  const editBtn =
    document.getElementById('edit-project-btn');

  const noProjectSection =
    document.getElementById('no-project-section');

  const hasProjectSection =
    document.getElementById('has-project-section');

  const reviewCard =
    document.getElementById('review-card');


  // =========================================================
  // 3. LOAD PROJECT
  // =========================================================

  let project = null;

  try {

    project = await Api.getMyProject();

    console.log('=================================');
    console.log('STUDENT PROJECT');
    console.log(project);
    console.log('FINAL DECISION');
    console.log(project?.finalDecision);
    console.log('=================================');

  } catch (err) {

    console.error(
      'LOAD STUDENT PROJECT ERROR:',
      err
    );

    if (err.status !== 404) {

      if (
        typeof Animations !== 'undefined' &&
        Animations.showToast
      ) {
        Animations.showToast(
          err.message ||
          'Could not load your project.',
          'error'
        );
      }
    }

    project = null;
  }


  // =========================================================
  // 4. NO PROJECT
  // =========================================================

  if (!project) {

    if (noProjectSection) {

      noProjectSection.classList.remove('hidden');

      if (
        typeof Animations !== 'undefined' &&
        Animations.slideUp
      ) {
        Animations.slideUp(
          noProjectSection
        );
      }
    }

    if (editBtn) {
      editBtn.classList.add('hidden');
    }

    if (reviewCard) {
      reviewCard.classList.add('hidden');
    }

    return;
  }


  // =========================================================
  // 5. HAS PROJECT
  // =========================================================

  if (hasProjectSection) {

    hasProjectSection.classList.remove('hidden');

    if (
      typeof Animations !== 'undefined' &&
      Animations.slideUp
    ) {
      Animations.slideUp(
        hasProjectSection
      );
    }
  }


  // =========================================================
  // 6. PROJECT TITLE
  // =========================================================

  const projectTitle =
    document.getElementById(
      'project-title-display'
    );

  if (projectTitle) {

    projectTitle.textContent =
      project.title_en ||
      project.title_ar ||
      '-';
  }


  // =========================================================
  // 7. TEAM MEMBERS
  // =========================================================

  let memberCount = 0;

  try {

    const members =
      await Api.getMembers(
        project.id
      );

    memberCount =
      Array.isArray(members)
        ? members.length
        : 0;

  } catch (err) {

    console.warn(
      'Could not load team members:',
      err
    );
  }


  const membersDisplay =
    document.getElementById(
      'project-members-display'
    );

  if (membersDisplay) {

    membersDisplay.textContent =
      `${memberCount} ${
        memberCount === 1
          ? 'member'
          : 'members'
      }`;
  }


  // =========================================================
  // 8. REGISTRATION DATE
  // =========================================================

  const dateDisplay =
    document.getElementById(
      'project-date-display'
    );

  if (dateDisplay) {

    if (project.created_at) {

      const date =
        new Date(project.created_at);

      dateDisplay.textContent =
        !Number.isNaN(date.getTime())
          ? date.toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
            )
          : '-';

    } else {

      dateDisplay.textContent = '-';
    }
  }


  // =========================================================
  // 9. PROJECT STATUS
  // =========================================================

  const statusBadge =
    document.getElementById(
      'project-status-badge'
    );

  const statusLabel =
    document.getElementById(
      'project-status-label'
    );

  if (
    statusBadge &&
    statusLabel &&
    typeof App !== 'undefined' &&
    typeof App.applyStatusBadge === 'function'
  ) {

    App.applyStatusBadge(
      statusBadge,
      statusLabel,
      project.status
    );
  }


  // =========================================================
  // 10. EDIT PROJECT
  // =========================================================

  if (
    editBtn &&
    typeof App !== 'undefined' &&
    typeof App.isEditBlockedStatus === 'function' &&
    App.isEditBlockedStatus(
      project.status
    )
  ) {

    editBtn.classList.add(
      'form-disabled'
    );

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


  // =========================================================
  // 11. FINAL ADMIN REVIEW
  // =========================================================

  function renderFinalAdminReview(review) {

    if (!reviewCard) {
      return;
    }


    console.log(
      'RENDER FINAL ADMIN REVIEW:',
      review
    );


    // -------------------------------------------------------
    // NO REVIEW
    // -------------------------------------------------------

    if (
      !review ||
      typeof review !== 'object'
    ) {

      reviewCard.classList.add(
        'hidden'
      );

      return;
    }


    // -------------------------------------------------------
    // COMMENT
    // -------------------------------------------------------

    const comment =
      review.admin_comments ??
      review.adminComments ??
      '';


    // -------------------------------------------------------
    // DECISION
    // -------------------------------------------------------

    const decision =
      review.admin_decision ??
      review.adminDecision ??
      '';


    // -------------------------------------------------------
    // DATE
    // -------------------------------------------------------

    const reviewedAt =
      review.reviewed_at ??
      review.reviewedAt ??
      null;


    // =======================================================
    // COMMENT
    // =======================================================

    const commentEl =
      document.getElementById(
        'doctor-review-comment'
      );

    if (commentEl) {

      const cleanComment =
        String(comment).trim();

      commentEl.textContent =
        cleanComment ||
        'No comment provided.';
    }


    // =======================================================
    // DECISION
    // =======================================================

    const decisionEl =
      document.getElementById(
        'doctor-review-decision'
      );

    if (decisionEl) {

      const decisionLabels = {

        Accepted:
          'Accepted',

        Rejected:
          'Rejected',

        MinorRevision:
          'Minor Revision Required',

        MajorRevision:
          'Major Revision Required',

        UnderReview:
          'Under Review',

        UnderDecision:
          'Pending Decision',

        Pending:
          'Pending Review'
      };


      decisionEl.textContent =
        decisionLabels[decision] ||
        decision ||
        '—';


      decisionEl.classList.remove(
        'review-success',
        'review-danger',
        'review-warning',
        'review-primary'
      );


      if (decision === 'Accepted') {

        decisionEl.classList.add(
          'review-success'
        );

      } else if (
        decision === 'Rejected' ||
        decision === 'MajorRevision'
      ) {

        decisionEl.classList.add(
          'review-danger'
        );

      } else if (
        decision === 'UnderReview' ||
        decision === 'UnderDecision'
      ) {

        decisionEl.classList.add(
          'review-primary'
        );

      } else {

        decisionEl.classList.add(
          'review-warning'
        );
      }
    }


    // =======================================================
    // DATE
    // =======================================================

    const dateEl =
      document.getElementById(
        'doctor-review-date'
      );

    if (dateEl) {

      if (reviewedAt) {

        const date =
          new Date(reviewedAt);

        if (!Number.isNaN(date.getTime())) {

          dateEl.textContent =
            'Reviewed on ' +
            date.toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
            );

        } else {

          dateEl.textContent = '';
        }

      } else {

        dateEl.textContent = '';
      }
    }


    // =======================================================
    // SHOW CARD
    // =======================================================

    reviewCard.classList.remove(
      'hidden'
    );

    if (
      typeof Animations !== 'undefined' &&
      typeof Animations.slideUp === 'function'
    ) {

      Animations.slideUp(
        reviewCard
      );
    }
  }


  // =========================================================
  // 12. GET FINAL DECISION
  // =========================================================

  const finalDecision =
    project.finalDecision || null;


  // =========================================================
  // 13. RENDER
  // =========================================================

  renderFinalAdminReview(
    finalDecision
  );

});
