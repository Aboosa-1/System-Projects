document.addEventListener("DOMContentLoaded", async function () {

    // =========================================================
    // 1. GET PROJECT ID
    // =========================================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const projectId =
        urlParams.get("id");


    if (!projectId) {

        alert("No project selected.");

        window.location.href =
            "../dashboard/index.html";

        return;
    }


    // =========================================================
    // 2. LOAD PROJECT
    // =========================================================

    let project = null;


    try {

        project = await StaffApi.get(
            `/assignments/my-projects/${projectId}`
        );

        console.log(
            "STAFF PROJECT RESPONSE:",
            project
        );

    } catch (err) {

        console.error(
            "LOAD PROJECT ERROR:",
            err
        );

        alert(
            err.message ||
            "Project not found!"
        );

        window.location.href =
            "../dashboard/index.html";

        return;
    }


    // =========================================================
    // 3. PROJECT DATA
    // =========================================================

    const projectInfo =
        project.projectInformation || {};

    const teamInfo =
        project.teamInformation || {};


    // =========================================================
    // 4. STATUS FORMAT
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
    // 5. STATUS CLASS
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
    // 6. ESCAPE HTML
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
    // 7. NORMALIZE MEMBER
    // =========================================================

    function normalizeMember(member) {

        if (!member) {
            return null;
        }


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
                member.phone_number ??
                member.phoneNumber ??
                member.mobile ??
                member.mobile_number ??
                member.mobileNumber ??
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
                member.is_leader === "1" ||
                member.is_leader === "true" ||

                member.isLeader === true ||
                member.isLeader === 1 ||
                member.isLeader === "1" ||
                member.isLeader === "true"

        };
    }


    // =========================================================
    // 8. RENDER PROJECT
    // =========================================================

    function renderProject() {


        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        const pTitle =
            document.getElementById("pTitle");

        if (pTitle) {

            pTitle.textContent =
                projectInfo.titleEn ||
                projectInfo.titleAr ||
                "—";
        }


        // -----------------------------------------------------
        // DEPARTMENT
        // -----------------------------------------------------

        const pDepartment =
            document.getElementById("pDepartment");

        if (pDepartment) {

            pDepartment.textContent =
                teamInfo.department ||
                projectInfo.department ||
                "—";
        }


        // -----------------------------------------------------
        // PROGRAM
        // -----------------------------------------------------

        const pProgram =
            document.getElementById("pProgram");

        if (pProgram) {

            pProgram.textContent =
                teamInfo.programName ||
                projectInfo.programName ||
                "—";
        }


        // -----------------------------------------------------
        // ACADEMIC YEAR
        // -----------------------------------------------------

        const pAcademicYear =
            document.getElementById("pAcademicYear");

        if (pAcademicYear) {

            pAcademicYear.textContent =
                projectInfo.academicYear ||
                "—";
        }


        // -----------------------------------------------------
        // IDEA
        // -----------------------------------------------------

        const pIdea =
            document.getElementById("pIdea");

        if (pIdea) {

            pIdea.textContent =
                projectInfo.idea ||
                "N/A";
        }


        // -----------------------------------------------------
        // PROBLEM
        // -----------------------------------------------------

        const pProblem =
            document.getElementById("pProblem");

        if (pProblem) {

            pProblem.textContent =
                projectInfo.problemDefinition ||
                "N/A";
        }


        // -----------------------------------------------------
        // OBJECTIVES
        // -----------------------------------------------------

        const pObjectives =
            document.getElementById("pObjectives");

        if (pObjectives) {

            pObjectives.textContent =
                projectInfo.objectives ||
                "N/A";
        }


        // -----------------------------------------------------
        // CONTRIBUTION
        // -----------------------------------------------------

        const pContribution =
            document.getElementById("pContribution");

        if (pContribution) {

            pContribution.textContent =
                projectInfo.expectedContribution ||
                "N/A";
        }


        // -----------------------------------------------------
        // SUPERVISOR DOCTOR
        // -----------------------------------------------------

        const supervisorDoctorEl =
            document.getElementById(
                "pSupervisorDoctor"
            );

        if (supervisorDoctorEl) {

            supervisorDoctorEl.textContent =
                teamInfo.supervisorDoctor ||
                "—";
        }


        // -----------------------------------------------------
        // SUPERVISOR TA
        // -----------------------------------------------------

        const supervisorTaEl =
            document.getElementById(
                "pSupervisorTa"
            );

        if (supervisorTaEl) {

            supervisorTaEl.textContent =
                teamInfo.supervisorTa ||
                "—";
        }


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        const statusEl =
            document.getElementById("pStatus");

        const modalStatusEl =
            document.getElementById(
                "modalCurrentStatus"
            );


        const formattedStatus =
            formatStatus(
                projectInfo.status
            );


        if (statusEl) {

            statusEl.textContent =
                formattedStatus;

            statusEl.className =
                "status-badge " +
                getStatusBadgeClass(
                    projectInfo.status
                );
        }


        if (modalStatusEl) {

            modalStatusEl.textContent =
                formattedStatus;

            modalStatusEl.className =
                "status-badge " +
                getStatusBadgeClass(
                    projectInfo.status
                );
        }


        // -----------------------------------------------------
        // MEMBERS
        // -----------------------------------------------------

        const rawMembers =
            Array.isArray(
                project.teamMembers
            )
                ? project.teamMembers
                : [];


        const members =
            rawMembers
                .map(normalizeMember)
                .filter(Boolean);


        // -----------------------------------------------------
        // FIND LEADER
        // -----------------------------------------------------

        let leader =
            members.find(
                member =>
                    member.isLeader === true
            );


        // -----------------------------------------------------
        // FALLBACK
        // -----------------------------------------------------

        if (
            !leader &&
            project.teamLeader
        ) {

            leader =
                normalizeMember(
                    project.teamLeader
                );
        }


        console.log(
            "RAW TEAM MEMBERS:",
            rawMembers
        );

        console.log(
            "NORMALIZED MEMBERS:",
            members
        );

        console.log(
            "FINAL LEADER:",
            leader
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
                            ${escapeHtml(
                                leader.name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                leader.phone
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                leader.role
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                leader.studentCode
                            )}
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

            membersTableBody.innerHTML = "";


            if (members.length > 0) {

                members.forEach(
                    member => {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                            <td>
                                ${escapeHtml(
                                    member.name
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    member.phone
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    member.role
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    member.studentCode
                                )}
                            </td>

                        `;


                        membersTableBody.appendChild(
                            row
                        );

                    }
                );

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
    // 9. RENDER
    // =========================================================

    renderProject();


    // =========================================================
    // 10. MODAL ELEMENTS
    // =========================================================

    const modal =
        document.getElementById(
            "reviewModal"
        );


    const openBtn =
        document.getElementById(
            "openReviewModalBtn"
        );


    const closeBtn =
        document.getElementById(
            "closeModalBtn"
        );


    const cancelBtn =
        document.getElementById(
            "cancelModalBtn"
        );


    const staffCommentInput =
        document.getElementById(
            "staffComment"
        );


    const studentCommentInput =
        document.getElementById(
            "studentComment"
        );


    const sendStaffBtn =
        document.getElementById(
            "sendStaffCommentBtn"
        );


    const sendStudentBtn =
        document.getElementById(
            "sendStudentDecisionBtn"
        );


    // =========================================================
    // 11. CHECK REVIEW STATUS
    // =========================================================

    if (
        projectInfo.status !==
        "UnderReview"
    ) {

        if (openBtn) {

            openBtn.disabled =
                true;

            openBtn.title =
                "This project isn't open for review right now.";
        }
    }


    // =========================================================
    // 12. OPEN MODAL
    // =========================================================

    if (openBtn) {

        openBtn.addEventListener(
            "click",
            () => {

                if (modal) {

                    modal.classList.add(
                        "active"
                    );
                }
            }
        );
    }


    // =========================================================
    // 13. CLOSE MODAL
    // =========================================================

    function closeModal() {

        if (modal) {

            modal.classList.remove(
                "active"
            );
        }
    }


    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeModal
        );
    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeModal
        );
    }


    // =========================================================
    // 14. CLICK OUTSIDE
    // =========================================================

    window.addEventListener(
        "click",
        function (e) {

            if (
                modal &&
                e.target === modal
            ) {

                closeModal();
            }

        }
    );


    // =========================================================
    // 15. SEND STAFF COMMENT
    // =========================================================

    if (sendStaffBtn) {

        sendStaffBtn.addEventListener(
            "click",
            async function () {

                const comment =
                    staffCommentInput
                        ? staffCommentInput.value.trim()
                        : "";


                if (!comment) {

                    alert(
                        "Please enter a comment for the staff."
                    );

                    if (staffCommentInput) {
                        staffCommentInput.focus();
                    }

                    return;
                }


                sendStaffBtn.disabled =
                    true;


                const originalText =
                    sendStaffBtn.innerHTML;


                sendStaffBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Sending...
                `;


                try {

                    /*
                     * STAFF COMMENT
                     *
                     * This sends ONLY the staff comment.
                     */

                    await StaffApi.post(
                        "/reviews/staff-comment",
                        {
                            projectId:
                                projectInfo.id ||
                                projectId,

                            comment:
                                comment
                        }
                    );


                    alert(
                        "Staff comment sent successfully!"
                    );


                    staffCommentInput.value =
                        "";

                } catch (err) {

                    console.error(
                        "SEND STAFF COMMENT ERROR:",
                        err
                    );


                    alert(
                        err.message ||
                        "Failed to send staff comment."
                    );

                } finally {

                    sendStaffBtn.disabled =
                        false;

                    sendStaffBtn.innerHTML =
                        originalText;
                }

            }
        );
    }


    // =========================================================
    // 16. SEND FINAL DECISION TO STUDENTS
    // =========================================================

    if (sendStudentBtn) {

        sendStudentBtn.addEventListener(
            "click",
            async function () {


                // -------------------------------------------------
                // SELECT FINAL DECISION
                // -------------------------------------------------

                const selectedDecision =
                    document.querySelector(
                        'input[name="finalDecision"]:checked'
                    )?.value;


                // -------------------------------------------------
                // STUDENT COMMENT
                // -------------------------------------------------

                const studentComment =
                    studentCommentInput
                        ? studentCommentInput.value.trim()
                        : "";


                // -------------------------------------------------
                // VALIDATE DECISION
                // -------------------------------------------------

                if (!selectedDecision) {

                    alert(
                        "Please select the final decision."
                    );

                    return;
                }


                // -------------------------------------------------
                // VALIDATE COMMENT
                // -------------------------------------------------

                if (!studentComment) {

                    alert(
                        "Please enter a comment for the students."
                    );

                    if (studentCommentInput) {
                        studentCommentInput.focus();
                    }

                    return;
                }


                // -------------------------------------------------
                // DISABLE BUTTON
                // -------------------------------------------------

                sendStudentBtn.disabled =
                    true;


                const originalText =
                    sendStudentBtn.innerHTML;


                sendStudentBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Sending...
                `;


                try {

                    /*
                     * FINAL DECISION
                     *
                     * This is the ONLY decision sent
                     * to the students.
                     */

                    await StaffApi.post(
                        "/reviews/final-decision",
                        {
                            projectId:
                                projectInfo.id ||
                                projectId,

                            decision:
                                selectedDecision,

                            comment:
                                studentComment
                        }
                    );


                    alert(
                        "Final decision sent to students successfully!"
                    );


                    closeModal();


                    window.location.reload();


                } catch (err) {

                    console.error(
                        "SEND FINAL DECISION ERROR:",
                        err
                    );


                    alert(
                        err.message ||
                        "Failed to send final decision."
                    );

                } finally {

                    sendStudentBtn.disabled =
                        false;

                    sendStudentBtn.innerHTML =
                        originalText;
                }

            }
        );
    }

});
