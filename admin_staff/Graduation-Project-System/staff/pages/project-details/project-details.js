document.addEventListener("DOMContentLoaded", async function () {
    // 1️⃣ معرفة المشروع المطلوب من الـ URL (مثلاً: ?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    if (!projectId) {
        alert("No project selected.");
        window.location.href = "../dashboard/index.html";
        return;
    }

    let project = null;

    try {
        project = await StaffApi.get(`/assignments/my-projects/${projectId}`);
    } catch (err) {
        alert(err.message || "Project not found!");
        window.location.href = "../dashboard/index.html";
        return;
    }

    // The backend returns a nested shape:
    // { projectInformation, teamInformation, teamLeader, teamMembers, assignment }
    // — not the flat project row the rest of this file used to assume.
    const projectInfo = project.projectInformation || {};
    const teamInfo = project.teamInformation || {};

    function formatStatus(status) {
        const map = {
            Pending: "Pending",
            UnderReview: "Under Review",
            UnderDecision: "Pending Decision",
            Accepted: "Accepted",
            Rejected: "Rejected",
            MinorRevision: "Minor Revision",
            MajorRevision: "Major Revision",
        };
        return map[status] || status || "Pending";
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case "Accepted": return "status-success";
            case "Rejected": return "status-error";
            case "MinorRevision":
            case "MajorRevision": return "status-warning";
            default: return "status-warning";
        }
    }

    function renderProject() {
        document.getElementById("pTitle").textContent = projectInfo.titleEn || projectInfo.titleAr || "—";
        document.getElementById("pDepartment").textContent = teamInfo.department || projectInfo.department || "—";
        document.getElementById("pProgram").textContent = teamInfo.programName || projectInfo.programName || "—";
        document.getElementById("pAcademicYear").textContent = projectInfo.academicYear || "—";
        document.getElementById("pIdea").textContent = projectInfo.idea || "N/A";
        document.getElementById("pProblem").textContent = projectInfo.problemDefinition || "N/A";
        document.getElementById("pObjectives").textContent = projectInfo.objectives || "N/A";
        document.getElementById("pContribution").textContent = projectInfo.expectedContribution || "N/A";
        const supervisorDoctorEl = document.getElementById("pSupervisorDoctor");
        if (supervisorDoctorEl) supervisorDoctorEl.textContent = teamInfo.supervisorDoctor || "—";
        const supervisorTaEl = document.getElementById("pSupervisorTa");
        if (supervisorTaEl) supervisorTaEl.textContent = teamInfo.supervisorTa || "—";

        const statusEl = document.getElementById("pStatus");
        statusEl.textContent = formatStatus(projectInfo.status);
        statusEl.className = "status-badge " + getStatusBadgeClass(projectInfo.status);

        // The leader is returned as its own object (from the students table),
        // and teamMembers is the team_members table rows — which also
        // includes the leader's own row (isLeader: true), so it's excluded
        // here to avoid listing them twice.
        const leader = project.teamLeader || null;
        const members = project.teamMembers || [];

        const leaderTableBody = document.getElementById("pLeaderTableBody");
        leaderTableBody.innerHTML = leader
            ? `<tr>
                <td>${leader.name}</td>
                <td>${leader.phone || "—"}</td>
                <td>${leader.role || "—"}</td>
                <td>${leader.studentCode || "—"}</td>
               </tr>`
            : `<tr><td colspan="4" style="text-align:center;">No leader recorded.</td></tr>`;

        const membersTableBody = document.getElementById("pMembersTableBody");
        membersTableBody.innerHTML = "";
        members.forEach((member) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.phone || "—"}</td>
                <td>${member.role || "—"}</td>
                <td>${member.studentCode || "—"}</td>
            `;
            membersTableBody.appendChild(row);
        });
    }

    renderProject();

    // 5️⃣ التعامل مع الـ Modal
    const modal = document.getElementById("reviewModal");
    const openBtn = document.getElementById("openReviewModalBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelModalBtn");
    const reviewForm = document.getElementById("reviewForm");
    const submitBtn = reviewForm.querySelector('button[type="submit"]');

    // Staff can only submit a review while the project is actually
    // "UnderReview" (the backend enforces this too) — and only once.
    if (projectInfo.status !== "UnderReview") {
        openBtn.disabled = true;
        openBtn.title = "This project isn't open for review right now.";
    }

    openBtn.addEventListener("click", () => modal.classList.add("active"));
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    window.addEventListener("click", function (e) {
        if (e.target === modal) modal.classList.remove("active");
    });

    // 6️⃣ حفظ المراجعة عند الـ Submit — POST /api/reviews
    reviewForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const selectedStatus = document.querySelector('input[name="reviewStatus"]:checked')?.value;
        const doctorCommentInput = document.getElementById("doctorComment");
        const doctorComment = doctorCommentInput.value.trim();

        if (!selectedStatus) {
            alert("Please select a status decision.");
            return;
        }

        if (!doctorComment) {
            alert("Please enter a comment before submitting the report.");
            doctorCommentInput.focus();
            return;
        }

        submitBtn.disabled = true;

        try {
            await StaffApi.post("/reviews", {
                projectId: projectInfo.id,
                decision: selectedStatus,
                comments: doctorComment,
            });

            alert("Review submitted successfully!");
            modal.classList.remove("active");
            window.location.reload();
        } catch (err) {
            alert(err.message || "Failed to submit review.");
        } finally {
            submitBtn.disabled = false;
        }
    });
});
