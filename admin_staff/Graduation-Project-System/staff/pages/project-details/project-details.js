document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // PROJECT ID
    // =========================================================

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    if (!projectId) {
        alert("No project selected.");
        window.location.href = "../dashboard/index.html";
        return;
    }


    // =========================================================
    // STATE
    // =========================================================

    let currentProject = null;
    let teamMembers = [];


    // =========================================================
    // ELEMENTS
    // =========================================================

    const modal =
        document.getElementById("reviewModal");

    const openBtn =
        document.getElementById("openReviewModalBtn");

    const closeBtn =
        document.getElementById("closeModalBtn");

    const cancelBtn =
        document.getElementById("cancelModalBtn");

    const reviewForm =
        document.getElementById("reviewForm");


    // =========================================================
    // SAFE TEXT
    // =========================================================

    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            element.textContent = value;

        } else {

            element.textContent = "—";
        }
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

        div.textContent = String(value);

        return div.innerHTML;
    }


    // =========================================================
    // FORMAT STATUS
    // =========================================================

    function formatStatus(status) {

        const map = {

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
            map[status] ||
            status ||
            "Pending"
        );
    }


    // =========================================================
    // STATUS BADGE CLASS
    // =========================================================

    function getStatusBadgeClass(status) {

        switch (status) {

            case "Accepted":
                return "status-success";

            case "Rejected":
                return "status-error";

            case "MinorRevision":
            case "MajorRevision":
                return "status-warning";

            default:
                return "status-warning";
        }
    }


    // =========================================================
    // LOAD PROJECT
    // =========================================================

    async function loadProject() {

        try {

            console.log(
                "Loading project:",
                projectId
            );


            // =====================================================
            // 1. GET PROJECT
            // =====================================================

            currentProject =
                await StaffApi.get(
                    `/projects/${projectId}`
                );


            console.log(
                "STAFF PROJECT RESPONSE:",
                currentProject
            );


            if (!currentProject) {

                throw new Error(
                    "Project not found."
                );
            }


            // =====================================================
            // 2. GET TEAM MEMBERS
            // =====================================================

            try {

                if (
                    typeof StaffApi.getMembers === "function"
                ) {

                    teamMembers =
                        await StaffApi.getMembers(
                            currentProject.id
                        );

                } else {

                    teamMembers =
                        await StaffApi.get(
                            `/projects/${currentProject.id}/members`
                        );
                }


                console.log(
                    "STAFF TEAM MEMBERS RESPONSE:",
                    teamMembers
                );


                if (!Array.isArray(teamMembers)) {

                    teamMembers = [];
                }

            } catch (membersError) {

                console.error(
                    "LOAD TEAM MEMBERS ERROR:",
                    membersError
                );


                // =================================================
                // FALLBACK
                // =================================================

                if (
                    Array.isArray(
                        currentProject.team_members
                    )
                ) {

                    teamMembers =
                        currentProject.team_members;

                } else if (
                    Array.isArray(
                        currentProject.teamMembers
                    )
                ) {

                    teamMembers =
                        currentProject.teamMembers;

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


            // =====================================================
            // RENDER
            // =====================================================

            renderProject();

            setupReviewButton();

        } catch (err) {

            console.error(
                "LOAD PROJECT ERROR:",
                err
            );

            alert(
                err.message ||
                "Could not load this project."
            );

            window.location.href =
                "../dashboard/index.html";
        }
    }


    // =========================================================
    // RENDER PROJECT
    // =========================================================

    function renderProject() {

        // =====================================================
        // PROJECT INFORMATION
        // =====================================================

        setText(
            "pTitle",
            currentProject.title_en ||
            currentProject.title_ar
        );


        setText(
            "pDepartment",
            currentProject.department
        );


        setText(
            "pProgram",
            currentProject.program_name
        );


        setText(
            "pAcademicYear",
            currentProject.academic_year
        );


        setText(
            "pIdea",
            currentProject.idea
        );


        setText(
            "pProblem",
            currentProject.problem_definition
        );


        setText(
            "pObjectives",
            currentProject.objectives
        );


        setText(
            "pContribution",
            currentProject.expected_contribution
        );


        // =====================================================
        // SUPERVISORS
        // =====================================================

        setText(
            "pSupervisorDoctor",
            currentProject.supervisor_doctor
        );


        setText(
            "pSupervisorTa",
            currentProject.supervisor_ta
        );


        // =====================================================
        // STATUS
        // =====================================================

        const status =
            currentProject.status ||
            "Pending";


        const statusElement =
            document.getElementById(
                "pStatus"
            );


        if (statusElement) {

            statusElement.textContent =
                formatStatus(status);

            statusElement.className =
                "status-badge " +
                getStatusBadgeClass(status);
        }


        // =====================================================
        // TEAM
        // =====================================================

        renderTeamMembers();
    }


    // =========================================================
    // RENDER TEAM MEMBERS
    // =========================================================

    function renderTeamMembers() {

        console.log(
            "TEAM MEMBERS BEFORE NORMALIZATION:",
            teamMembers
        );


        const normalizedMembers =
            teamMembers.map(function (member) {

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
            });


        console.log(
            "NORMALIZED STAFF MEMBERS:",
            normalizedMembers
        );


        // =====================================================
        // FIND LEADER
        // =====================================================

        const leader =
            normalizedMembers.find(
                function (member) {
                    return member.isLeader === true;
                }
            );


        // =====================================================
        // LEADER TABLE
        // =====================================================

        const leaderTableBody =
            document.getElementById(
                "pLeaderTableBody"
            );


        if (leaderTableBody) {

            if (leader) {

                leaderTableBody.innerHTML = `
                    <tr>

                        <td>
                            ${escapeHtml(leader.name)}
                        </td>

                        <td>
                            ${escapeHtml(leader.phone)}
                        </td>

                        <td>
                            ${escapeHtml(leader.role)}
                        </td>

                        <td>
                            ${escapeHtml(leader.studentCode)}
                        </td>

                    </tr>
                `;

            } else {

                leaderTableBody.innerHTML = `
                    <tr>

                        <td
                            colspan="4"
                            style="text-align:center;"
                        >
                            No leader recorded.
                        </td>

                    </tr>
                `;
            }
        }


        // =====================================================
        // MEMBERS TABLE
        // =====================================================

        const membersTableBody =
            document.getElementById(
                "pMembersTableBody"
            );


        if (membersTableBody) {

            if (normalizedMembers.length > 0) {

                membersTableBody.innerHTML =
                    normalizedMembers
                        .map(function (member) {

                            return `
                                <tr>

                                    <td>
                                        ${escapeHtml(member.name)}
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

                                </tr>
                            `;

                        })
                        .join("");

            } else {

                membersTableBody.innerHTML = `
                    <tr>

                        <td
                            colspan="4"
                            style="text-align:center;"
                        >
                            No members recorded.
                        </td>

                    </tr>
                `;
            }
        }
    }


    // =========================================================
    // REVIEW BUTTON
    // =========================================================

    function setupReviewButton() {

        if (!openBtn) {
            return;
        }


        const status =
            currentProject.status;


        // Staff can review only UnderReview projects

        if (status !== "UnderReview") {

            openBtn.disabled = true;

            openBtn.title =
                "This project isn't open for review right now.";

            return;
        }


        openBtn.disabled = false;

        openBtn.title = "";
    }


    // =========================================================
    // OPEN REVIEW MODAL
    // =========================================================

    if (openBtn) {

        openBtn.addEventListener(
            "click",
            function () {

                if (!modal) {
                    return;
                }

                modal.classList.add(
                    "active"
                );
            }
        );
    }


    // =========================================================
    // CLOSE REVIEW MODAL
    // =========================================================

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            function () {

                if (!modal) {
                    return;
                }

                modal.classList.remove(
                    "active"
                );
            }
        );
    }


    // =========================================================
    // CANCEL REVIEW
    // =========================================================

    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            function () {

                if (!modal) {
                    return;
                }

                modal.classList.remove(
                    "active"
                );
            }
        );
    }


    // =========================================================
    // CLICK OUTSIDE MODAL
    // =========================================================

    window.addEventListener(
        "click",
        function (event) {

            if (
                modal &&
                event.target === modal
            ) {

                modal.classList.remove(
                    "active"
                );
            }
        }
    );


    // =========================================================
    // SUBMIT REVIEW
    // =========================================================

    if (reviewForm) {

        const submitBtn =
            reviewForm.querySelector(
                'button[type="submit"]'
            );


        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                // =================================================
                // STATUS
                // =================================================

                const selectedStatus =
                    document.querySelector(
                        'input[name="reviewStatus"]:checked'
                    )?.value;


                // =================================================
                // COMMENT
                // =================================================

                const doctorCommentInput =
                    document.getElementById(
                        "doctorComment"
                    );


                const doctorComment =
                    doctorCommentInput
                        ? doctorCommentInput.value.trim()
                        : "";


                // =================================================
                // VALIDATION
                // =================================================

                if (!selectedStatus) {

                    alert(
                        "Please select a status decision."
                    );

                    return;
                }


                if (!doctorComment) {

                    alert(
                        "Please enter a comment before submitting the report."
                    );


                    if (doctorCommentInput) {

                        doctorCommentInput.focus();
                    }


                    return;
                }


                // =================================================
                // DISABLE BUTTON
                // =================================================

                if (submitBtn) {

                    submitBtn.disabled = true;
                }


                try {

                    // =================================================
                    // POST REVIEW
                    // =================================================

                    await StaffApi.post(
                        "/reviews",
                        {
                            projectId:
                                currentProject.id,

                            decision:
                                selectedStatus,

                            comments:
                                doctorComment
                        }
                    );


                    alert(
                        "Review submitted successfully!"
                    );


                    // =================================================
                    // CLOSE MODAL
                    // =================================================

                    if (modal) {

                        modal.classList.remove(
                            "active"
                        );
                    }


                    // =================================================
                    // RELOAD DATA
                    // =================================================

                    await loadProject();


                    // Reset form if possible

                    reviewForm.reset();


                } catch (err) {

                    console.error(
                        "SUBMIT REVIEW ERROR:",
                        err
                    );


                    alert(
                        err.message ||
                        "Failed to submit review."
                    );

                } finally {

                    if (submitBtn) {

                        submitBtn.disabled = false;
                    }
                }
            }
        );
    }


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    loadProject();

});
