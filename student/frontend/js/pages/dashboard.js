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

  const registerBtn =
    document.getElementById('register-project-btn');

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

    console.log(
      'STUDENT PROJECT:',
      project
    );

    console.log(
      'FINAL ADMIN DECISION:',
      project?.finalDecision
    );

  } catch (err) {

    console.error(
      'LOAD STUDENT PROJECT ERROR:',
      err
    );

    if (err.status !== 404) {

      Animations.showToast(
        err.message ||
        'Could not load your project.',
        'error'
      );
    }

    project = null;
  }


  // =========================================================
  // 4. NO PROJECT
  // =========================================================

  if (!project) {

    if (noProjectSection) {

      noProjectSection.classList.remove(
        'hidden'
      );

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

    hasProjectSection.classList.remove(
      'hidden'
    );

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
      memberCount +
      (
        memberCount === 1
          ? ' member'
          : ' members'
      );
  }


  // =========================================================
  // 8. REGISTRATION DATE
  // =========================================================

  const dateDisplay =
    document.getElementById(
      'project-date-display'
    );

  if (dateDisplay) {

    const dateStr =
      project.created_at
        ? new Date(
            project.created_at
          ).toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }
          )
        : '-';

    dateDisplay.textContent =
      dateStr;
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
    App.applyStatusBadge
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
    App.isEditBlockedStatus &&
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
  // 11. FINAL ADMIN DECISION
  // =========================================================

  /*
   * Backend returns:
   *
   * finalDecision: {
   *   admin_decision,
   *   admin_comments,
   *   reviewed_at
   * }
   */

  const finalDecision =
    project.finalDecision || null;


  console.log(
    'FINAL ADMIN DECISION:',
    finalDecision
  );


  // =========================================================
  // 12. RENDER FINAL ADMIN REVIEW
  // =========================================================

  function renderReview(review) {

    if (!reviewCard) {
      return;
    }


    // -------------------------------------------------------
    // NO FINAL REVIEW
    // -------------------------------------------------------

    if (!review) {

      reviewCard.classList.add(
        'hidden'
      );

      return;
    }


    // -------------------------------------------------------
    // COMMENT
    // -------------------------------------------------------

    const comment =
      review.admin_comments !== null &&
      typeof review.admin_comments !== 'undefined'
        ? String(review.admin_comments).trim()
        : '';


    // -------------------------------------------------------
    // DECISION
    // -------------------------------------------------------

    const decision =
      review.admin_decision !== null &&
      typeof review.admin_decision !== 'undefined'
        ? String(review.admin_decision).trim()
        : '';


    // -------------------------------------------------------
    // REVIEW DATE
    // -------------------------------------------------------

    const reviewDate =
      review.reviewed_at ||
      null;


    // =======================================================
    // COMMENT ELEMENT
    // =======================================================

    const commentEl =
      document.getElementById(
        'doctor-review-comment'
      );

    if (commentEl) {

      commentEl.textContent =
        comment ||
        'No comment provided.';
    }


    // =======================================================
    // DECISION ELEMENT
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


      // Remove old classes

      decisionEl.classList.remove(
        'review-success',
        'review-danger',
        'review-warning',
        'review-primary'
      );


      // =====================================================
      // DECISION STYLE
      // =====================================================

      if (
        decision === 'Accepted'
      ) {

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
    // REVIEW DATE
    // =======================================================

    const dateEl =
      document.getElementById(
        'doctor-review-date'
      );

    if (dateEl) {

      if (reviewDate) {

        const parsedDate =
          new Date(reviewDate);

        if (!Number.isNaN(parsedDate.getTime())) {

          dateEl.textContent =
            'Reviewed on ' +
            parsedDate.toLocaleDateString(
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
      Animations.slideUp
    ) {

      Animations.slideUp(
        reviewCard
      );
    }
  }


  // =========================================================
  // 13. RENDER FINAL REVIEW
  // =========================================================

  renderReview(
    finalDecision
  );

});
