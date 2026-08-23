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

      Animations.slideUp(
        noProjectSection
      );
    }

    if (editBtn) {

      editBtn.classList.add(
        'hidden'
      );
    }

    if (reviewCard) {

      reviewCard.classList.add(
        'hidden'
      );
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

    Animations.slideUp(
      hasProjectSection
    );
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

  App.applyStatusBadge(
    statusBadge,
    statusLabel,
    project.status
  );


  // =========================================================
  // 10. EDIT PROJECT
  // =========================================================

  if (
    editBtn &&
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
  // 11. FIND REVIEW / COMMENT
  // =========================================================
  //
  // The backend may return the review using different names.
  // We check the common structures safely.
  //

  function getLatestReview(project) {

    // -------------------------------------------------------
    // Direct review
    // -------------------------------------------------------

    if (
      project.review &&
      typeof project.review === 'object'
    ) {

      return project.review;
    }


    // -------------------------------------------------------
    // Latest review
    // -------------------------------------------------------

    if (
      project.latestReview &&
      typeof project.latestReview === 'object'
    ) {

      return project.latestReview;
    }


    // -------------------------------------------------------
    // reviewData
    // -------------------------------------------------------

    if (
      project.reviewData &&
      typeof project.reviewData === 'object'
    ) {

      return project.reviewData;
    }


    // -------------------------------------------------------
    // reviews array
    // -------------------------------------------------------

    if (
      Array.isArray(project.reviews) &&
      project.reviews.length > 0
    ) {

      const reviews =
        [...project.reviews];

      reviews.sort(
        (a, b) => {

          const dateA =
            new Date(
              a.created_at ||
              a.createdAt ||
              a.reviewed_at ||
              a.reviewedAt ||
              0
            ).getTime();

          const dateB =
            new Date(
              b.created_at ||
              b.createdAt ||
              b.reviewed_at ||
              b.reviewedAt ||
              0
            ).getTime();

          return dateB - dateA;
        }
      );

      return reviews[0];
    }


    // -------------------------------------------------------
    // No review
    // -------------------------------------------------------

    return null;
  }


  // =========================================================
  // 12. RENDER REVIEW
  // =========================================================

  function renderReview(review) {

    if (!reviewCard) {
      return;
    }


    // -------------------------------------------------------
    // No review
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
      review.comments ??
      review.comment ??
      review.doctorComment ??
      review.doctor_comment ??
      '';


    // -------------------------------------------------------
    // DECISION
    // -------------------------------------------------------

    const decision =
      review.decision ??
      review.status ??
      '';


    // -------------------------------------------------------
    // DATE
    // -------------------------------------------------------

    const reviewDate =
      review.created_at ??
      review.createdAt ??
      review.reviewed_at ??
      review.reviewedAt ??
      null;


    // -------------------------------------------------------
    // COMMENT ELEMENT
    // -------------------------------------------------------

    const commentEl =
      document.getElementById(
        'doctor-review-comment'
      );

    if (commentEl) {

      commentEl.textContent =
        comment ||
        'No comment provided.';
    }


    // -------------------------------------------------------
    // DECISION ELEMENT
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // DATE
    // -------------------------------------------------------

    const dateEl =
      document.getElementById(
        'doctor-review-date'
      );

    if (dateEl) {

      if (reviewDate) {

        dateEl.textContent =
          new Date(
            reviewDate
          ).toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }
          );

      } else {

        dateEl.textContent =
          '';
      }
    }


    // -------------------------------------------------------
    // SHOW CARD
    // -------------------------------------------------------

    reviewCard.classList.remove(
      'hidden'
    );

    Animations.slideUp(
      reviewCard
    );
  }


  // =========================================================
  // 13. RENDER REVIEW
  // =========================================================

  const latestReview =
    getLatestReview(
      project
    );

  console.log(
    'LATEST STUDENT REVIEW:',
    latestReview
  );

  renderReview(
    latestReview
  );

});
