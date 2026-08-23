document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // PROJECT ID
    // =========================================================

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    if (!projectId) {
        alert("No project selected.");
        window.location.href = "../projects/index.html";
        return;
    }


    // =========================================================
    // ELEMENTS
    // =========================================================

    const setText = (id, value) => {

        const element = document.getElementById(id);

        if (!element) return;

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            element.textContent = value;
        } else {
            element.textContent = "—";
        }
    };


    // =========================================================
    // STATE
    // =========================================================

    let currentProject = null;
    let teamMembers = [];


    // =========================================================
    // LOAD PROJECT
    // =========================================================

    async function loadProject() {

        try {

            console.log("Loading project:", projectId);

            // -------------------------------------------------
            // GET PROJECT
            // -------------------------------------------------

            currentProject = await AdminApi.get(
                `/projects/${projectId}`
            );

            console.log(
                "PROJECT RESPONSE:",
                currentProject
            );


            if (!currentProject) {
                throw new Error("Project not found.");
            }


            // -------------------------------------------------
            // GET TEAM MEMBERS
            // -------------------------------------------------

            try {

                teamMembers = await AdminApi.get(
                    `/projects/${currentProject.id}/members`
                );

                console.log(
                    "TEAM MEMBERS RESPONSE:",
                    teamMembers
                );

                if (!Array.isArray(teamMembers)) {
                    teamMembers = [];
                }

            } catch (membersError) {

                console.warn(
                    "Could not load team members:",
                    membersError
                );

                // Try data already returned with project

                if (
                    Array.isArray(
                        currentProject.team_members
                    )
                ) {

                    teamMembers =
                        currentProject.team_members;

                } else if (
                    Array.isArray(
                        currentProject.members
                    )
                ) {

                    teamMembers =
                        currentProject.members;

                } else {

                    teamMembers = [];
                }
            }


            // -------------------------------------------------
            // RENDER
            // -------------------------------------------------

            renderProjectInfo();

            renderTeamMembers();

            renderStatus();


        } catch (error) {

            console.error(
                "LOAD PROJECT ERROR:",
                error
            );

            alert(
                error.message ||
                "Could not load this project."
            );
        }
    }


    // =========================================================
    // RENDER PROJECT INFO
    // =========================================================

    function renderProjectInfo() {

        // -----------------------------------------------------
        // TEAM
        // -----------------------------------------------------

        setText(
            "teamDepartment",
            currentProject.department
        );

        setText(
            "teamProgram",
            currentProject.program_name
        );

        setText(
            "teamAcademicYear",
            currentProject.academic_year
        );

        setText(
            "teamRegulation",
            currentProject.regulation
        );

        setText(
            "teamSupervisorDoctor",
            currentProject.supervisor_doctor
        );

        setText(
            "teamSupervisorTa",
            currentProject.supervisor_ta
        );


        // -----------------------------------------------------
        // PROJECT
        // -----------------------------------------------------

        setText(
            "projectTitleAr",
            currentProject.title_ar
        );


        const titleEn =
            document.getElementById(
                "projectTitleEn"
            );

        if (titleEn) {

            titleEn.textContent =
                currentProject.title_en
                    ? `(${currentProject.title_en})`
                    : "";
        }


        setText(
            "projectIdea",
            currentProject.idea
        );

        setText(
            "projectProblem",
            currentProject.problem_definition
        );

        setText(
            "projectObjectives",
            currentProject.objectives
        );

        setText(
            "projectContribution",
            currentProject.expected_contribution
        );
    }


    // =========================================================
    // NORMALIZE MEMBER
    // =========================================================

    function normalizeMember(member) {

        return {

            id:
                member.id ??
                member.student_id ??
                member.studentId ??
                null,

            name:
                member.member_name ??
                member.memberName ??
                member.full_name ??
                member.fullName ??
                member.name ??
                "—",

            phone:
                member.member_phone ??
                member.memberPhone ??
                member.phone ??
                "—",

            role:
                member.track_or_role ??
                member.trackOrRole ??
                member.role ??
                "—",

            studentCode:
                member.student_code ??
                member.studentCode ??
                member.student_id ??
                member.studentId ??
                "—",

            isLeader:
                member.is_leader === true ||
                member.is_leader === 1 ||
                member.is_leader === "true" ||
                member.isLeader === true ||
                member.isLeader === 1 ||
                member.isLeader === "true"
        };
    }


    // =========================================================
    // ESCAPE HTML
    // =========================================================

    function escapeHtml(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return "—";
        }

        const div =
            document.createElement("div");

        div.textContent =
            String(value);

        return div.innerHTML;
    }


    // =========================================================
    // RENDER TEAM MEMBERS
    // =========================================================

    function renderTeamMembers() {

        const normalizedMembers =
            teamMembers.map(normalizeMember);


        console.log(
            "NORMALIZED MEMBERS:",
            normalizedMembers
        );


        // -----------------------------------------------------
        // FIND LEADER
        // -----------------------------------------------------

        const leader =
            normalizedMembers.find(
                member => member.isLeader
            );


        // -----------------------------------------------------
        // MEMBER HTML
        // -----------------------------------------------------

        function buildMemberCells(member) {

            return `
                <td class="arabic-name">
                    ${escapeHtml(member.name)}

                    ${
                        member.isLeader
                            ? `
                                <span class="member-leader-tag">
                                    Leader
                                </span>
                              `
                            : ""
                    }
                </td>

                <td>
                    ${escapeHtml(member.phone)}
                </td>

                <td>
                    ${escapeHtml(member.role)}
                </td>

                <td>
                    ${escapeHtml(member.studentCode)}
                </td>
            `;
        }


        // -----------------------------------------------------
        // LEADER TABLE
        // -----------------------------------------------------

        const leaderBody =
            document.getElementById(
                "leaderTableBody"
            );

        if (leaderBody) {

            if (leader) {

                leaderBody.innerHTML = `
                    <tr>
                        ${buildMemberCells(leader)}
                    </tr>
                `;

            } else {

                leaderBody.innerHTML = `
                    <tr>
                        <td
                            colspan="4"
                            style="
                                text-align:center;
                                color:#94A3B8;
                            "
                        >
                            No leader recorded.
                        </td>
                    </tr>
                `;
            }
        }


        // -----------------------------------------------------
        // MEMBERS TABLE
        // -----------------------------------------------------

        const membersBody =
            document.getElementById(
                "membersTableBody"
            );

        if (membersBody) {

            const nonLeaderMembers =
                normalizedMembers.filter(
                    member => !member.isLeader
                );


            if (nonLeaderMembers.length > 0) {

                membersBody.innerHTML =
                    nonLeaderMembers
                        .map(member => `
                            <tr>
                                ${buildMemberCells(member)}
                            </tr>
                        `)
                        .join("");

            } else {

                membersBody.innerHTML = `
                    <tr>
                        <td
                            colspan="4"
                            style="
                                text-align:center;
                                color:#94A3B8;
                            "
                        >
                            No members recorded.
                        </td>
                    </tr>
                `;
            }
        }
    }


    // =========================================================
    // STATUS
    // =========================================================

    function formatStatus(status) {

        const statuses = {

            Pending:
                "Pending",

            UnderReview:
                "Under Review",

            UnderDecision:
                "Pending Decision",

            Accepted:
                "Accepted",

            Rejected:
                "Rejected",

            MinorRevision:
                "Minor Revision",

            MajorRevision:
                "Major Revision"
        };

        return (
            statuses[status] ||
            status ||
            "Pending"
        );
    }


    function renderStatus() {

        const status =
            currentProject.status;


        const statusBadge =
            document.getElementById(
                "projectStatusBadge"
            );


        const statusText =
            document.getElementById(
                "projectStatusText"
            );


        if (statusText) {

            statusText.textContent =
                formatStatus(status);
        }


        if (statusBadge) {

            statusBadge.classList.remove(
                "status-under-review",
                "status-under-decision"
            );


            if (status === "UnderReview") {

                statusBadge.classList.add(
                    "status-under-review"
                );
            }


            if (status === "UnderDecision") {

                statusBadge.classList.add(
                    "status-under-decision"
                );
            }
        }
    }


    // =========================================================
    // START
    // =========================================================

    loadProject();

});
