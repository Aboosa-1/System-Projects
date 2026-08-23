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
  // STATUS HELPERS
  // =========================================================

  function getStatusClass(status) {

    if (!status) return 'pending';

    const normalized = String(status)
      .trim()
      .toLowerCase();

    if (normalized === 'accepted') {
      return 'accepted';
    }

    if (normalized === 'rejected') {
      return 'rejected';
    }

    if (
      normalized === 'minorrevision' ||
      normalized === 'majorrevision'
    ) {
      return 'revision';
    }

    if (
      normalized === 'underreview' ||
      normalized === 'underdecision'
    ) {
      return 'reviewing';
    }

    return 'pending';
  }



  function getStatusLabel(status) {

    if (!status) {
      return 'Pending Review';
    }

    const normalized = String(status)
      .trim()
      .toLowerCase();

    switch (normalized) {

      case 'accepted':
        return 'Accepted';

      case 'rejected':
        return 'Rejected';

      case 'minorrevision':
        return 'Minor Revision';

      case 'majorrevision':
        return 'Major Revision';

      case 'underreview':
        return 'Under Review';

      case 'underdecision':
        return 'Under Decision';

      case 'pending':
        return 'Pending Review';

      default:
        return status;
    }
  }



  // =========================================================
  // RENDER PROJECT STATUS
  // =========================================================

  function renderProjectStatus(status) {

    const statusContainer =
      document.getElementById('project-review-status');

    const statusLabel =
      document.getElementById('project-review-status-label');

    if (!statusContainer || !statusLabel) {
      return;
    }

    const statusClass = getStatusClass(status);

    statusContainer.className =
      'project-review-status ' + statusClass;

    statusLabel.textContent =
      getStatusLabel(status);
  }



  // =========================================================
  // RENDER STAFF REVIEWS
  // =========================================================

  function renderReviews(reviews) {

    const section =
      document.getElementById('staff-reviews-section');

    const list =
      document.getElementById('reviews-list');

    const emptyState =
      document.getElementById('no-review-state');

    if (!section || !list) {
      return;
    }

    list.innerHTML = '';

    if (!Array.isArray(reviews) || reviews.length === 0) {

      section.classList.add('hidden');

      if (emptyState) {
        emptyState.classList.remove('hidden');
      }

      return;
    }

    section.classList.remove('hidden');

    if (emptyState) {
      emptyState.classList.add('hidden');
    }


    reviews.forEach((review, index) => {

      const reviewCard =
        document.createElement('div');

      reviewCard.className = 'review-item';


      // -----------------------------------------------------
      // HEADER
      // -----------------------------------------------------

      const header =
        document.createElement('div');

      header.className = 'review-item-header';


      const reviewerInfo =
        document.createElement('div');

      reviewerInfo.className =
        'reviewer-info';


      const avatar =
        document.createElement('div');

      avatar.className =
        'reviewer-avatar';

      avatar.textContent =
        getInitials(review.staff_name);


      const reviewerText =
        document.createElement('div');

      reviewerText.className =
        'reviewer-text';


      const reviewerName =
        document.createElement('div');

      reviewerName.className =
        'reviewer-name';

      reviewerName.textContent =
        review.staff_name || 'Staff Reviewer';


      const reviewerRole =
        document.createElement('div');

      reviewerRole.className =
        'reviewer-role';

      reviewerRole.textContent =
        'Staff Reviewer';


      reviewerText.append(
        reviewerName,
        reviewerRole
      );


      reviewerInfo.append(
        avatar,
        reviewerText
      );


      // -----------------------------------------------------
      // DECISION
      // -----------------------------------------------------

      const decision =
        document.createElement('span');

      decision.className =
        'review-decision ' +
        getStatusClass(review.decision);

      decision.textContent =
        getStatusLabel(review.decision);


      header.append(
        reviewerInfo,
        decision
      );


      // -----------------------------------------------------
      // COMMENTS
      // -----------------------------------------------------

      const comments =
        document.createElement('div');

      comments.className =
        'review-comments';


      if (review.comments) {

        comments.textContent =
          review.comments;

      } else {

        comments.textContent =
          'No comments provided.';

        comments.classList.add(
          'review-no-comments'
        );
      }


      // -----------------------------------------------------
      // DATE
      // -----------------------------------------------------

      const footer =
        document.createElement('div');

      footer.className =
        'review-item-footer';


      const date =
        document.createElement('span');

      date.className =
        'review-date';


      if (review.reviewed_at) {

        date.textContent =
          formatReviewDate(review.reviewed_at);

      } else {

        date.textContent =
          'Review date unavailable';
      }


      footer.appendChild(date);


      reviewCard.append(
        header,
        comments,
        footer
      );


      list.appendChild(reviewCard);


      if (typeof Animations !== 'undefined') {
        Animations.slideUp(reviewCard, 250);
      }

    });
  }



  // =========================================================
  // RENDER FINAL ADMIN DECISION
  // =========================================================

  function renderFinalDecision(finalDecision) {

    const section =
      document.getElementById(
        'final-decision-section'
      );

    const value =
      document.getElementById(
        'final-decision-value'
      );

    const commentsWrapper =
      document.getElementById(
        'final-decision-comments-wrapper'
      );

    const comments =
      document.getElementById(
        'final-decision-comments'
      );

    const date =
      document.getElementById(
        'final-decision-date'
      );


    if (!section) {
      return;
    }


    if (
      !finalDecision ||
      !finalDecision.admin_decision
    ) {

      section.classList.add('hidden');

      return;
    }


    section.classList.remove('hidden');


    const decision =
      finalDecision.admin_decision;


    value.textContent =
      getStatusLabel(decision);


    value.className =
      'final-decision-value ' +
      getStatusClass(decision);


    if (finalDecision.admin_comments) {

      commentsWrapper.classList.remove(
        'hidden'
      );

      comments.textContent =
        finalDecision.admin_comments;

    } else {

      commentsWrapper.classList.add(
        'hidden'
      );
    }


    if (finalDecision.reviewed_at) {

      date.textContent =
        'Reviewed on ' +
        formatReviewDate(
          finalDecision.reviewed_at
        );

    } else {

      date.textContent = '';
    }
  }



  // =========================================================
  // HELPERS
  // =========================================================

  function getInitials(name) {

    if (!name) {
      return 'SR';
    }

    const parts =
      String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }



  function formatReviewDate(dateValue) {

    try {

      const date =
        new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return String(dateValue);
      }

      return date.toLocaleString(
        'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    } catch (error) {

      return String(dateValue);
    }
  }



  // =========================================================
  // DOM READY
  // =========================================================

  document.addEventListener(
    'DOMContentLoaded',
    async () => {

      const token =
        await Storage.getToken();

      if (!token) {

        window.location.href =
          'login.html';

        return;
      }


      // -----------------------------------------------------
      // GET PROJECT
      // -----------------------------------------------------

      let project = null;

      try {

        project =
          await Api.getMyProject();

      } catch (err) {

        if (err.status !== 404) {

          Animations.showToast(
            err.message ||
            'Could not load your project.',
            'error'
          );
        }

        project = null;
      }


      if (!project) {

        document
          .getElementById('no-project')
          .classList.remove('hidden');

        return;
      }


      // -----------------------------------------------------
      // GET MEMBERS
      // -----------------------------------------------------

      let members = [];

      try {

        members =
          await Api.getMembers(project.id);

      } catch (err) {

        Animations.showToast(
          err.message ||
          'Could not load team members.',
          'error'
        );

        members = [];
      }


      const normalizedMembers =
        members.map((m) => ({

          name: m.member_name,

          phone: m.member_phone,

          role: m.track_or_role,

          studentCode: m.student_code,

          isLeader: m.is_leader

        }));


      // -----------------------------------------------------
      // SHOW CONTENT
      // -----------------------------------------------------

      const projectContent =
        document.getElementById(
          'project-content'
        );

      projectContent.classList.remove(
        'hidden'
      );

      Animations.slideUp(
        projectContent
      );


      // =====================================================
      // TEAM INFORMATION
      // =====================================================

      document.getElementById(
        'd-year'
      ).textContent =
        project.academic_year || '-';


      document.getElementById(
        'd-dept'
      ).textContent =
        project.department || '-';


      document.getElementById(
        'd-program'
      ).textContent =
        project.program_name ||
        (
          project.program_id
            ? String(project.program_id)
            : '-'
        );


      document.getElementById(
        'd-supervisor'
      ).textContent =
        project.supervisor_doctor || '-';


      document.getElementById(
        'd-assistant-supervisor'
      ).textContent =
        project.supervisor_ta || '-';



      // =====================================================
      // PROJECT INFORMATION
      // =====================================================

      document.getElementById(
        'd-title-ar'
      ).textContent =
        project.title_ar || '-';


      document.getElementById(
        'd-title-en'
      ).textContent =
        project.title_en || '-';


      document.getElementById(
        'd-regulation'
      ).textContent =
        project.regulation || '-';


      document.getElementById(
        'd-idea'
      ).textContent =
        project.idea || '-';


      document.getElementById(
        'd-problem'
      ).textContent =
        project.problem_definition || '-';


      document.getElementById(
        'd-objectives'
      ).textContent =
        project.objectives || '-';


      document.getElementById(
        'd-contribution'
      ).textContent =
        project.expected_contribution || '-';



      // =====================================================
      // PROJECT STATUS
      // =====================================================

      renderProjectStatus(
        project.status
      );



      // =====================================================
      // TEAM LEADER
      // =====================================================

      const leaderRow =
        document.getElementById(
          'd-leader-row'
        );

      const leader =
        normalizedMembers.find(
          (m) => m.isLeader
        );


      leaderRow.innerHTML = '';


      if (leader) {

        leaderRow.appendChild(
          buildMemberRow(leader)
        );
      }



      // =====================================================
      // TEAM MEMBERS
      // =====================================================

      const membersList =
        document.getElementById(
          'd-members-list'
        );


      membersList.innerHTML = '';


      document.getElementById(
        'd-members-count'
      ).textContent =
        normalizedMembers.length;


      normalizedMembers.forEach(
        (member) => {

          membersList.appendChild(
            buildMemberRow(member)
          );

        }
      );



      // =====================================================
      // STAFF REVIEWS
      // =====================================================

      renderReviews(
        project.reviews || []
      );



      // =====================================================
      // ADMIN FINAL DECISION
      // =====================================================

      renderFinalDecision(
        project.finalDecision
      );

    }
  );

})();
