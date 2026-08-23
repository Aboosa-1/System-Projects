document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("projectsTableBody");
    const searchInput = document.getElementById("projectSearchInput");
    const programSelect = document.getElementById("programFilter");
    const yearSelect = document.getElementById("academicYearFilter");

    populateFilters();
    loadProjects();

    if (searchInput) searchInput.addEventListener("input", debounce(loadProjects, 300));
    if (programSelect) programSelect.addEventListener("change", loadProjects);
    if (yearSelect) yearSelect.addEventListener("change", loadProjects);

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // Fills the Program filter with this admin's own department's real
    // programs. The Academic Year filter is fixed to 2026/2027 — the one
    // academic year currently in use.
    async function populateFilters() {
        // Set first (synchronously, before any await) so there's no window
        // where a project load could fire using a stale value.
        if (yearSelect) {
            yearSelect.innerHTML = `<option value="">Department Year</option><option value="2026-2027">2026/2027</option>`;
        }

        if (programSelect) {
            try {
                const programs = await AdminApi.get("/programs");
                programSelect.innerHTML = programs
                    .map((p) => `<option value="${p.id}">${p.name}</option>`)
                    .join("");
            } catch (err) {
                programSelect.innerHTML = `<option value="">Program</option>`;
            }
        }
    }

    async function loadProjects() {
        const query = searchInput ? searchInput.value.trim() : "";
        const program = programSelect ? programSelect.value : "";
        const academicYear = yearSelect ? yearSelect.value : "";

        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (program) params.set("program", program);
        if (academicYear) params.set("academicYear", academicYear);

        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94A3B8; padding:24px;">Loading projects...</td></tr>`;
        }

        try {
            const projects = await AdminApi.get(`/projects/admin${params.toString() ? "?" + params.toString() : ""}`);
            renderProjects(projects);
        } catch (err) {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#EF4444; padding:24px;">${err.message}</td></tr>`;
            }
        }
    }

    // Maps the backend's raw status values (no spaces, e.g. "UnderReview")
    // to a readable label and the matching badge color class.
    function formatStatus(status) {
        const map = {
            Pending: { label: "Pending", cls: "badge-pending" },
            UnderReview: { label: "Under Review", cls: "badge-review" },
            UnderDecision: { label: "Pending Decision", cls: "badge-decision" },
            Accepted: { label: "Accepted", cls: "badge-accepted" },
            Rejected: { label: "Rejected", cls: "badge-rejected" },
            MinorRevision: { label: "Minor Revision", cls: "badge-minor" },
            MajorRevision: { label: "Major Revision", cls: "badge-major" },
        };
        return map[status] || { label: status || "Pending", cls: "badge-pending" };
    }

    function renderProjects(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #94A3B8; padding: 24px;">
                        No matching projects found.
                    </td>
                </tr>`;
            return;
        }

        data.forEach((project, index) => {
            const row = document.createElement("tr");
            const status = formatStatus(project.status);
            // members_count from the backend excludes the leader — add 1 back
            // in so this shows the whole team's size.
            const totalMembers = Number(project.members_count) || 0;
            row.innerHTML = `
                <td><strong>${index + 1}</strong></td>
                <td>
                    <div class="project-title-cell">
                        <span class="title-ar">${project.title_ar || ""}</span>
                        <span class="title-en">(${project.title_en || ""})</span>
                    </div>
                </td>
                <td class="arabic-student-name">${project.leader_name || "—"}</td>
                <td>${totalMembers} Members</td>
                <td>${project.student_id || "—"}</td>
                <td><span class="status-badge ${status.cls}">${status.label}</span></td>
                <td>
                    <a href="../project-details/index.html?id=${project.id}" class="btn-icon-view" title="View Details">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }
});
