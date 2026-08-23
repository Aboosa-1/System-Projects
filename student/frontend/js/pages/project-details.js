/**
 * Project Details Page Logic
 */
(function () {

  // =========================================================
  // Build Team Member Row
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
  // DOM Loaded
  // =========================================================
  document.addEventListener('DOMContentLoaded', async () => {

    // =======================================================
    // Check Authentication
    // =======================================================
    const token = await Storage.getToken();

    if (!token) {
      window.location.href = 'login.html';
      return;
    }


    // =======================================================
    // Get Project
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
    // No Project
    // =======================================================
    if (!project) {

      const noProject = document.getElementById('no-project');

      if (noProject) {
        noProject.classList.remove('hidden');
      }

      return;
    }


    // =======================================================
    // Get Team Members
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
    // Normalize Members
    // =======================================================
    const normalizedMembers = members.map((m) => ({
      name: m.member_name,
      phone: m.member_phone,
      role: m.track_or_role,
      studentCode: m.student_code,
      isLeader: m.is_leader
    }));


    // =======================================================
    // Show Project Content
    // =======================================================
    const projectContent = document.getElementById('project-content');

    if (projectContent) {
      projectContent.classList.remove('hidden');
      Animations.slideUp(projectContent);
    }


    // =======================================================
    // Team Information
    // =======================================================

    const yearElement = document.getElementById('d-year');

    if (yearElement) {
      yearElement.textContent =
        project.academic_year || '-';
    }


    const departmentElement = document.getElementById('d-dept');

    if (departmentElement) {
      departmentElement.textContent =
        project.department || '-';
    }


    const programElement = document.getElementById('d-program');

    if (programElement) {
      programElement.textContent =
        project.program_name ||
        (project.program_id
          ? String(project.program_id)
          : '-');
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
    // Project Information
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
    // Project Status
    // =======================================================

    const statusBadge =
      document.getElementById('project-status-badge');

    const statusLabel =
      document.getElementById('project-status-label');

    if (statusBadge && statusLabel) {

      App.applyStatusBadge(
        statusBadge,
        statusLabel,
        project.status
      );
    }


    // =======================================================
    // Project Idea
    // =======================================================

    const ideaElement =
      document.getElementById('d-idea');

    if (ideaElement) {
      ideaElement.textContent =
        project.idea || '-';
    }


    // =======================================================
    // Problem Definition
    // =======================================================

    const problemElement =
      document.getElementById('d-problem');

    if (problemElement) {
      problemElement.textContent =
        project.problem_definition || '-';
    }


    // =======================================================
    // Objectives
    // =======================================================

    const objectivesElement =
      document.getElementById('d-objectives');

    if (objectivesElement) {
      objectivesElement.textContent =
        project.objectives || '-';
    }


    // =======================================================
    // Expected Contribution
    // =======================================================

    const contributionElement =
      document.getElementById('d-contribution');

    if (contributionElement) {
      contributionElement.textContent =
        project.expected_contribution || '-';
    }


    // =======================================================
    // ADMIN FINAL DECISION
    // =======================================================
    // Backend returns:
    //
    // finalDecision: {
    //   admin_decision,
    //   admin_comments,
    //   reviewed_at
    // }
    //
    // We display them here for the student.
    // =======================================================

    const finalDecision =
      project.finalDecision || null;


    // -------------------------------------------------------
    // Admin Decision
    // -------------------------------------------------------

    const adminDecisionElement =
      document.getElementById('d-admin-decision');

    if (adminDecisionElement) {

      adminDecisionElement.textContent =
        finalDecision?.admin_decision || '-';
    }


    // -------------------------------------------------------
    // Admin Comments
    // -------------------------------------------------------

    const adminCommentsElement =
      document.getElementById('d-admin-comments');

    if (adminCommentsElement) {

      adminCommentsElement.textContent =
        finalDecision?.admin_comments || '-';
    }


    // -------------------------------------------------------
    // Reviewed At
    // -------------------------------------------------------

    const reviewedAtElement =
      document.getElementById('d-admin-reviewed-at');

    if (reviewedAtElement) {

      if (finalDecision?.reviewed_at) {

        const date = new Date(
          finalDecision.reviewed_at
        );

        reviewedAtElement.textContent =
          date.toLocaleString();

      } else {

        reviewedAtElement.textContent = '-';
      }
    }


    // =======================================================
    // Populate Team Leader
    // =======================================================

    const leaderRow =
      document.getElementById('d-leader-row');

    const leader =
      normalizedMembers.find(
        (m) => m.isLeader
      );

    if (leaderRow && leader) {

      leaderRow.appendChild(
        buildMemberRow(leader)
      );
    }


    // =======================================================
    // Populate Team Members
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

  });

})();
