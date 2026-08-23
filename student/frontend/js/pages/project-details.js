/**
 * Project Details Page Logic
 */
(function () {

  // =========================================================
  // BUILD MEMBER ROW
  // =========================================================

  function buildMemberRow(member) {
    const tr = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = member.name || '-';

    if (member.isLeader) {
      const tag = document.createElement('span');
      tag.className = 'pd-member-leader-tag';
      tag.textContent = 'Leader';
      nameCell.append(' ', tag);
    }

    const roleCell = document.createElement('td');
    roleCell.textContent = member.role || '-';

    const phoneCell = document.createElement('td');
    phoneCell.className = 'member-phone-text';
    phoneCell.textContent = member.phone || '-';

    const codeCell = document.createElement('td');
    codeCell.textContent = member.studentCode || '-';

    tr.append(
      nameCell,
      roleCell,
      phoneCell,
      codeCell
    );

    return tr;
  }


  // =========================================================
  // BUILD REVIEW CARD
  // =========================================================

  function buildReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    // Header
    const header = document.createElement('div');
    header.className = 'review-card-header';

    const staffName = document.createElement('h4');
    staffName.className = 'review-staff-name';
    staffName.textContent = review.staff_name || 'Staff Reviewer';

    const decision = document.createElement('span');
    decision.className = 'review-decision';

    const decisionValue = review.decision || '-';

    decision.textContent = decisionValue;

    // Try to use existing status styling if available
    const normalizedDecision = String(decisionValue)
      .toLowerCase()
      .replace(/\s+/g, '');

    if (
      normalizedDecision === 'approved' ||
      normalizedDecision === 'accept' ||
      normalizedDecision === 'accepted'
    ) {
      decision.classList.add('success');
    } else if (
      normalizedDecision === 'rejected' ||
      normalizedDecision === 'reject'
    ) {
      decision.classList.add('danger');
    } else if (
      normalizedDecision.includes('revision') ||
      normalizedDecision.includes('major') ||
      normalizedDecision.includes('minor')
    ) {
      decision.classList.add('warning');
    } else {
      decision.classList.add('neutral');
    }

    header.append(
      staffName,
      decision
    );

    // Comments
    const commentsWrapper = document.createElement('div');
    commentsWrapper.className = 'review-comments';

    const commentsLabel = document.createElement('span');
    commentsLabel.className = 'review-comments-label';
    commentsLabel.textContent = 'Comments';

    const comments = document.createElement('p');
    comments.textContent =
      review.comments || 'No comments provided.';

    commentsWrapper.append(
      commentsLabel,
      comments
    );

    // Date
    const footer = document.createElement('div');
    footer.className = 'review-card-footer';

    const date = document.createElement('small');

    if (review.reviewed_at) {
      const dateValue = new Date(review.reviewed_at);

      if (!Number.isNaN(dateValue.getTime())) {
        date.textContent = dateValue.toLocaleString();
      } else {
        date.textContent = review.reviewed_at;
      }
    } else {
      date.textContent = '';
    }

    footer.appendChild(date);

    card.append(
      header,
      commentsWrapper,
      footer
    );

    return card;
  }


  // =========================================================
  // RENDER REVIEWS
  // =========================================================

  function renderReviews(project) {
    const reviewsContainer =
      document.getElementById('reviews-container');

    if (!reviewsContainer) {
      return;
    }

    reviewsContainer.innerHTML = '';

    const reviews = Array.isArray(project.reviews)
      ? project.reviews
      : [];

    // No reviews
    if (reviews.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'review-empty';

      empty.textContent = 'No staff reviews yet.';

      reviewsContainer.appendChild(empty);
      return;
    }

    // Reviews
    reviews.forEach((review) => {
      const reviewCard = buildReviewCard(review);

      reviewsContainer.appendChild(reviewCard);

      if (typeof Animations !== 'undefined' &&
          typeof Animations.slideUp === 'function') {
        Animations.slideUp(reviewCard, 200);
      }
    });
  }


  // =========================================================
  // DOM READY
  // =========================================================

  document.addEventListener('DOMContentLoaded', async () => {

    // =======================================================
    // AUTHENTICATION
    // =======================================================

    const token = await Storage.getToken();

    if (!token) {
      window.location.href = 'login.html';
      return;
    }


    // =======================================================
    // LOAD PROJECT
    // =======================================================

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


    // =======================================================
    // NO PROJECT
    // =======================================================

    if (!project) {
      document
        .getElementById('no-project')
        .classList.remove('hidden');

      return;
    }


    // =======================================================
    // LOAD TEAM MEMBERS
    // =======================================================

    let members = [];

    try {

      members = await Api.getMembers(project.id);

    } catch (err) {

      Animations.showToast(
        err.message || 'Could not load team members.',
        'error'
      );

      members = [];
    }


    // =======================================================
    // NORMALIZE MEMBERS
    // =======================================================

    const normalizedMembers = members.map((m) => ({
      name: m.member_name,
      phone: m.member_phone,
      role: m.track_or_role,
      studentCode: m.student_code,
      isLeader: m.is_leader
    }));


    // =======================================================
    // SHOW PROJECT CONTENT
    // =======================================================

    document
      .getElementById('project-content')
      .classList.remove('hidden');

    Animations.slideUp(
      document.getElementById('project-content')
    );


    // =======================================================
    // TEAM INFO
    // =======================================================

    const yearElement =
      document.getElementById('d-year');

    if (yearElement) {
      yearElement.textContent =
        project.academic_year || '-';
    }


    const deptElement =
      document.getElementById('d-dept');

    if (deptElement) {
      deptElement.textContent =
        project.department || '-';
    }


    const programElement =
      document.getElementById('d-program');

    if (programElement) {
      programElement.textContent =
        project.program_name ||
        (
          project.program_id
            ? String(project.program_id)
            : '-'
        );
    }


    const supervisorElement =
      document.getElementById('d-supervisor');

    if (supervisorElement) {
      supervisorElement.textContent =
        project.supervisor_doctor || '-';
    }


    const assistantSupervisorElement =
      document.getElementById('d-assistant-supervisor');

    if (assistantSupervisorElement) {
      assistantSupervisorElement.textContent =
        project.supervisor_ta || '-';
    }


    // =======================================================
    // PROJECT INFO
    // =======================================================

    const titleArElement =
      document.getElementById('d-title-ar');

    if (titleArElement) {
      titleArElement.textContent =
        project.title_ar || '-';
    }


    const titleEnElement =
      document.getElementById('d-title-en');

    if (titleEnElement) {
      titleEnElement.textContent =
        project.title_en || '-';
    }


    const regulationElement =
      document.getElementById('d-regulation');

    if (regulationElement) {
      regulationElement.textContent =
        project.regulation || '-';
    }


    // =======================================================
    // PROJECT STATUS
    // =======================================================

    const statusBadge =
      document.getElementById('project-status-badge');

    const statusLabel =
      document.getElementById('project-status-label');

    if (
      typeof App !== 'undefined' &&
      typeof App.applyStatusBadge === 'function'
    ) {
      App.applyStatusBadge(
        statusBadge,
        statusLabel,
        project.status
      );
    }


    // =======================================================
    // PROJECT DESCRIPTION
    // =======================================================

    const ideaElement =
      document.getElementById('d-idea');

    if (ideaElement) {
      ideaElement.textContent =
        project.idea || '-';
    }


    const problemElement =
      document.getElementById('d-problem');

    if (problemElement) {
      problemElement.textContent =
        project.problem_definition || '-';
    }


    const objectivesElement =
      document.getElementById('d-objectives');

    if (objectivesElement) {
      objectivesElement.textContent =
        project.objectives || '-';
    }


    const contributionElement =
      document.getElementById('d-contribution');

    if (contributionElement) {
      contributionElement.textContent =
        project.expected_contribution || '-';
    }


    // =======================================================
    // TEAM LEADER
    // =======================================================

    const leaderRow =
      document.getElementById('d-leader-row');

    const leader =
      normalizedMembers.find(
        (m) => m.isLeader
      );

    if (leader && leaderRow) {

      leaderRow.innerHTML = '';

      leaderRow.appendChild(
        buildMemberRow(leader)
      );
    }


    // =======================================================
    // TEAM MEMBERS
    // =======================================================

    const membersList =
      document.getElementById('d-members-list');

    const membersCount =
      document.getElementById('d-members-count');

    if (membersCount) {
      membersCount.textContent =
        normalizedMembers.length;
    }

    if (membersList) {

      membersList.innerHTML = '';

      normalizedMembers.forEach((member) => {

        membersList.appendChild(
          buildMemberRow(member)
        );

      });
    }


    // =======================================================
    // STAFF REVIEWS
    // =======================================================

    renderReviews(project);

  });

})();
