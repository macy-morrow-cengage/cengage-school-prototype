const products = [
  { id: 1, name: "American Government Institutions and Policies, 16th Updated Edition AP Edition", seats: "127 Used | 124 Available", courseCount: 28, associationCount: 4, associatedCourseCount: 8 },
  { id: 2, name: "American Government: Institutions & Policies, AP® Edition", seats: "127 Used | 30 Available", courseCount: 54, associationCount: 4, associatedCourseCount: 8 },
  { id: 3, name: "American Pageant", seats: "127 Used | 330 Available", courseCount: 42, associationCount: 4, associatedCourseCount: 8 },
  { id: 4, name: "An Introduction to Comparative Politics, AP® Edition, Student Edition", seats: "127 Used | 330 Available", courseCount: 14, associationCount: 4, associatedCourseCount: 8 },
  { id: 5, name: "Century 21 Accounting: General Journal", seats: "127 Used | 330 Available", courseCount: 24, associationCount: 4, associatedCourseCount: 8 },
  { id: 6, name: "Environmental Science", seats: "127 Used | 330 Available", courseCount: 24, associationCount: 4, associatedCourseCount: 8 }
];

const baseCourses = [
  "Biology", "AP Biology", "AP Biology Period A", "AP Biology Period B",
  "Advanced Cellular Biology", "Molecular Biology - Block A", "Ecology and Environmental Science - Block A", "Biochemistry and Biotechnology - Block B"
];

const state = {
  screen: "products",
  selectedProduct: products[0],
  expandedAssociationIds: new Set(),
  selected: new Set(),
  courses: [...baseCourses],
  detached: new Set(),
  associations: [
    { id: 1, type: "Code", courses: 4, courseNames: baseCourses.slice(0, 4), level: "Course", value: "9954", platform: "Explore" },
    { id: 2, type: "Code", courses: 2, courseNames: baseCourses.slice(4, 6), level: "Course", value: "9954", platform: "01234" },
    { id: 3, type: "Code", courses: 2, courseNames: baseCourses.slice(6, 8), level: "Course", value: "9954", platform: "01234" },
    { id: 4, type: "Code", courses: 0, courseNames: [], level: "Course", value: "9954", platform: "01234" }
  ],
  productQuery: "",
  courseQuery: "",
  modal: null
};

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const toastRoot = document.querySelector("#toast-root");

const iconAssets = {
  home: "nav-toggle.svg",
  grid: "nav-grid.svg",
  building: "nav-building.svg",
  school: "nav-school.svg",
  report: "nav-assignments.svg",
  book: "nav-book.svg",
  people: "nav-people.svg",
  sync: "nav-sync.svg",
  settings: "nav-settings.svg",
  help: "help.svg",
  exit: "sign-out.svg"
};

function asset(name, alt = "", className = "") {
  return `<img src="./assets/figma/${name}" alt="${alt}" class="${className}">`;
}

function shell(content) {
  return `
    <header class="topbar">
      <div class="brand">${asset("cengage-school-logo.png", "Cengage School", "brand-logo")}</div>
      <div class="account"><span class="avatar">${asset("account.svg", "", "account-icon")}</span><span>Welcome, Janine Teagues</span>${asset("chevron-down.svg", "", "top-chevron")}</div>
    </header>
    <div class="shell">
      <nav class="sidenav" aria-label="Primary navigation">
        ${["home","grid","building","school","report","book","people"].map(name => `<button class="nav-icon" aria-label="${name}">${asset(iconAssets[name], "", name === "home" ? "nav-icon-24" : "")}</button>`).join("")}
        <div class="nav-divider"></div><button class="nav-icon" aria-label="sync">${asset(iconAssets.sync)}</button>
        <div class="nav-divider"></div><button class="nav-icon" aria-label="settings">${asset(iconAssets.settings)}</button>
        <div class="nav-spacer"></div><button class="nav-icon" aria-label="help">${asset(iconAssets.help)}</button><button class="nav-icon" aria-label="sign out">${asset(iconAssets.exit)}</button>
      </nav>
      <main class="main">
        ${districtHeader()}
        ${content}
      </main>
    </div>`;
}

function districtHeader() {
  return `
    <div class="breadcrumbs"><button class="link-button" data-action="products">Districts</button>${asset("breadcrumb-chevron.svg", "", "breadcrumb-icon")}<span>Ann Arbor Pub School District</span></div>
    <div class="district-head">
      <div class="district-title"><div class="district-icon">${asset("district.svg")}</div><div><div style="display:flex;align-items:center;gap:8px"><h1>Ann Arbor Pub School District</h1><span class="tag status-tag">Active</span></div><div class="district-subtitle">ALBANY, CA, United States</div></div></div>
      <button class="btn config-btn">${asset("configurations.svg", "", "config-icon")} Configurations</button>
    </div>`;
}

function tabs() {
  return `<div class="tabs" role="tablist">${["Details","Schools","Courses","Products","People"].map(label => `<button class="tab ${label === "Products" ? "active" : ""}" role="tab" aria-selected="${label === "Products"}">${label}</button>`).join("")}</div>`;
}

function productScreen() {
  const visible = products.filter(product => product.name.toLowerCase().includes(state.productQuery.toLowerCase()));
  return shell(`${tabs()}
    <div class="toolbar"><div class="search-wrap"><input data-action="product-search" aria-label="Search products" placeholder="Search products..." value="${state.productQuery}"></div><button class="btn">Download ${asset("row-chevron.svg", "", "button-chevron")}</button></div>
    <div class="table-card"><table aria-label="Products"><colgroup><col style="width:25%"><col style="width:12%"><col style="width:20%"><col style="width:11%"><col style="width:11%"><col style="width:20%"></colgroup><thead><tr>${["Product name","Platform","Seats","Status","All courses","Associations & courses"].map(h => `<th>${h}<span class="sort">↕</span></th>`).join("")}</tr></thead><tbody>
      ${visible.map(product => `<tr><td>${asset("row-chevron.svg", "", "row-chevron-icon")}<span class="product-name">${product.name}</span></td><td>Mindtap</td><td>${product.seats}</td><td><span class="tag">Active</span></td><td><button class="row-trigger" data-action="courses" data-product="${product.id}" ${product.id === 1 ? "data-testid=all-courses-link" : ""}>${product.courseCount}</button></td><td><button class="row-trigger" data-action="associations" data-product="${product.id}" ${product.id === 1 ? "data-testid=associations-link" : ""}>${product.associationCount} & ${product.associatedCourseCount}</button><button class="round-action" data-action="add" data-product="${product.id}" aria-label="Add association for ${product.name}">${asset("add-circle.svg")}</button></td></tr>`).join("") || `<tr><td colspan="6" class="empty">No products match your search.</td></tr>`}
    </tbody></table></div>${pagination()}`);
}

function detailHeading(countLabel) {
  return `<div class="detail-title"><button class="back-btn" data-action="products" aria-label="Back to products">${asset("back.svg")}</button><span><strong>${countLabel}</strong>: ${state.selectedProduct.name}</span></div>`;
}

function associationRows() {
  return state.associations.map(item => {
    const isExpanded = state.expandedAssociationIds.has(item.id);
    return `
    <tr>
      <td>${item.type}</td>
      <td>${item.courses ? `<button class="row-trigger association-toggle" data-action="expand" data-id="${item.id}" aria-expanded="${isExpanded}">${asset("row-chevron.svg", "", `row-chevron-icon ${isExpanded ? "open" : ""}`)}${item.courses}</button>` : "0"}</td>
      <td>${item.level}</td><td>${item.value}</td><td>${item.platform}</td>
      <td><div class="action-buttons"><button class="icon-action" data-action="edit" data-id="${item.id}" aria-label="Edit association ${item.id}">${asset("edit.svg")}</button><button class="icon-action" data-action="delete-association" data-id="${item.id}" aria-label="Delete association ${item.id}">${asset("delete.svg")}</button></div></td>
    </tr>${isExpanded ? childCourseRow(item) : ""}`;
  }).join("");
}

function coursesForAssociation(item) {
  return item.courseNames.filter(name => state.courses.includes(name)).slice(0, item.courses);
}

function childCourseRow(item) {
  const courses = coursesForAssociation(item);
  const allSelected = courses.length > 0 && courses.every(name => state.selected.has(name));
  return `<tr><td colspan="6" class="child-wrap"><div class="child-table"><table aria-label="Courses in association ${item.id}"><colgroup><col style="width:20%"><col style="width:11%"><col style="width:12%"><col style="width:12%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:9%"><col style="width:4%"></colgroup><thead><tr>${["Course","Key","Teacher","School","ISBN (IAC)","Dates","Created","Status"].map(h => `<th>${h}<span class="sort">↕</span></th>`).join("")}<th><input class="check" type="checkbox" data-action="select-all" data-association="${item.id}" aria-label="Select all courses in association ${item.id}" ${allSelected ? "checked" : ""}></th></tr></thead><tbody>${courses.map(courseRow).join("")}</tbody></table></div></td></tr>`;
}

function courseRow(name) {
  const checked = state.selected.has(name);
  return `<tr><td>${name}</td><td><span class="ellipsis">E-XT9W8M5W...</span></td><td><span class="ellipsis">christopher.obrien@cengage.com</span></td><td>Berkmar High School</td><td><span class="ellipsis">9781337400572</span></td><td>2026.08.03 - 2027.01.04</td><td>2026.08.03</td><td><span class="tag">Active</span></td><td><input class="check" type="checkbox" data-action="select-course" data-course="${name}" aria-label="Select ${name}" ${checked ? "checked" : ""}></td></tr>`;
}

function associationsScreen() {
  const selectedBar = state.selected.size ? bulkBar() : "";
  return shell(`${detailHeading(`${state.selectedProduct.associationCount} associations & ${state.selectedProduct.associatedCourseCount} courses`)}
    <div class="toolbar"><div class="toolbar-left"><select class="filter-select filter-select-association" aria-label="Association type"><option>Association type</option><option>Code</option></select><select class="filter-select filter-select-level" aria-label="Level"><option>Level</option><option>Course</option></select></div><button class="btn" data-action="add">Add OneRoster association</button></div>
    <div class="table-card"><table aria-label="Associations"><colgroup><col style="width:19%"><col style="width:18%"><col style="width:18%"><col style="width:16%"><col style="width:16%"><col style="width:12%"></colgroup><thead><tr>${["Association type","Courses","Level","Value","Platform","Actions"].map(h => `<th>${h}<span class="sort">↕</span></th>`).join("")}</tr></thead><tbody>${associationRows()}</tbody></table></div>${pagination()}${selectedBar}`);
}

function coursesScreen() {
  const visible = state.courses.filter(name => name.toLowerCase().includes(state.courseQuery.toLowerCase()));
  return shell(`${detailHeading(`${state.selectedProduct.courseCount} courses`)}
    <div class="toolbar"><div class="search-wrap"><input data-action="course-search" aria-label="Search courses" placeholder="Search courses..." value="${state.courseQuery}"></div></div>
    <div class="table-card"><table aria-label="All courses"><colgroup><col style="width:19%"><col style="width:9%"><col style="width:10%"><col style="width:10%"><col style="width:9%"><col style="width:11%"><col style="width:11%"><col style="width:10%"><col style="width:7%"><col style="width:4%"></colgroup><thead><tr>${["Course","Key","Teacher","School","Roster type","ISBN (IAC)","Dates","Created","Status"].map(h => `<th>${h}<span class="sort">↕</span></th>`).join("")}<th><input class="check" type="checkbox" aria-label="Select all listed courses"></th></tr></thead><tbody>${visible.map(name => `<tr><td>${name}</td><td>E-XT9W8M5...</td><td><span class="ellipsis">christopher.obrien@cengage.com</span></td><td>Berkmar High School</td><td>OneRoster</td><td>9781337400572</td><td>2026.08.03 - 2027.01.04</td><td>2026.08.03</td><td><span class="tag">Active</span></td><td><input class="check" type="checkbox" aria-label="Select ${name}"></td></tr>`).join("")}</tbody></table></div>${pagination()}`);
}

function pagination() {
  return `<div class="pagination-row"><div class="entries">Entries <select aria-label="Entries per page"><option>10</option><option>25</option></select><strong>Showing 1 to 10 of 100 entries</strong></div><div class="pagination" aria-label="Pagination"><button class="page">←</button>${[1,2,3,4,5,6,7,8,9,10].map(n => `<button class="page ${n===1?"active":""}">${n}</button>`).join("")}<button class="page">→</button></div></div>`;
}

function bulkBar() {
  return `<div class="bulkbar"><span>${state.selected.size} courses selected</span><div class="bulk-actions"><button class="deselect" data-action="deselect">Deselect all</button><button class="btn btn-sm" data-action="detach">Detach OneRoster mappings</button><button class="btn btn-sm" data-action="delete-courses">Delete</button></div></div>`;
}

function render() {
  app.innerHTML = state.screen === "products" ? productScreen() : state.screen === "courses" ? coursesScreen() : associationsScreen();
  document.title = `Cengage School · ${state.screen === "products" ? "District products" : state.screen === "courses" ? "Courses" : "Associations"}`;
  renderModal();
}

function renderModal() {
  if (!state.modal) { modalRoot.innerHTML = ""; return; }
  if (state.modal.type === "add" || state.modal.type === "edit") {
    const editing = state.modal.type === "edit";
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${editing ? "Edit" : "Add"} OneRoster association</h2><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${asset("close.svg")}</button></div><form data-action="association-form"><div class="modal-body"><p>${editing ? "Edit your" : "Add an"} association for your <strong>${state.selectedProduct.name}</strong> product.</p><label class="field"><span>Association level</span><select name="level" aria-label="Association level"><option value="">Select level</option><option value="Course" ${editing ? "selected" : ""}>Course</option><option value="School">School</option></select></label><label class="field"><span>Association type</span><select name="type" aria-label="Association type" ${editing ? "" : "disabled"}><option value="">Select type</option><option value="Code" ${editing ? "selected" : ""}>Code</option><option value="Name">Name</option></select></label><label class="field"><span>Association value</span><input name="value" aria-label="Association value" placeholder="Enter value" value="${editing ? state.modal.item.value : ""}"></label></div><div class="modal-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${editing ? "Save" : "Submit"}</button></div></form></section></div>`;
  } else {
    const deleting = state.modal.type === "delete-courses";
    const names = [...state.selected];
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${deleting ? "Delete classes" : "Detach OneRoster mappings"}</h2><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${asset("close.svg")}</button></div><div class="modal-body"><p>Are you sure you want to ${deleting ? "delete" : "detach the OneRoster mappings from"} these ${names.length} courses?</p><ul>${names.map(name => `<li>${name}</li>`).join("")}</ul><div class="notice"><span class="info-icon">i</span><span>${deleting ? "The courses and all of their information will be deleted. This action cannot be undone." : "The link between OneRoster and these courses will be broken and they’ll no longer be able to be updated via OneRoster. This action cannot be undone."}</span></div></div><div class="modal-actions"><button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="confirm-bulk">Yes, ${deleting ? "delete" : "detach"}</button></div></section></div>`;
  }
}

function toast(message) {
  toastRoot.innerHTML = `<div class="toast">${message}</div>`;
  window.setTimeout(() => { toastRoot.innerHTML = ""; }, 2600);
}

function selectProductFrom(target) {
  if (!target.dataset.product) return;
  const product = products.find(item => item.id === Number(target.dataset.product));
  if (product) state.selectedProduct = product;
}

app.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (["product-search", "course-search", "select-all", "select-course"].includes(action)) return;
  if (["courses", "associations", "add"].includes(action)) selectProductFrom(target);
  if (action === "products") { state.screen = "products"; state.expandedAssociationIds.clear(); state.selected.clear(); }
  if (action === "associations") state.screen = "associations";
  if (action === "courses") state.screen = "courses";
  if (action === "expand") {
    const association = state.associations.find(item => item.id === Number(target.dataset.id));
    if (association && state.expandedAssociationIds.has(association.id)) {
      state.expandedAssociationIds.delete(association.id);
      coursesForAssociation(association).forEach(name => state.selected.delete(name));
    } else if (association) {
      state.expandedAssociationIds.add(association.id);
    }
  }
  if (action === "add") state.modal = { type: "add" };
  if (action === "edit") state.modal = { type: "edit", item: state.associations.find(item => item.id === Number(target.dataset.id)) };
  if (action === "delete-association") { state.associations = state.associations.filter(item => item.id !== Number(target.dataset.id)); toast("Association deleted"); }
  if (action === "deselect") state.selected.clear();
  if (action === "detach") state.modal = { type: "detach" };
  if (action === "delete-courses") state.modal = { type: "delete-courses" };
  render();
});

app.addEventListener("input", event => {
  if (event.target.dataset.action === "product-search") { state.productQuery = event.target.value; render(); document.querySelector('[data-action="product-search"]').focus(); }
  if (event.target.dataset.action === "course-search") { state.courseQuery = event.target.value; render(); document.querySelector('[data-action="course-search"]').focus(); }
});

app.addEventListener("change", event => {
  const action = event.target.dataset.action;
  if (action === "select-all") {
    const association = state.associations.find(item => item.id === Number(event.target.dataset.association));
    const courses = association ? coursesForAssociation(association) : [];
    courses.forEach(name => event.target.checked ? state.selected.add(name) : state.selected.delete(name));
    render();
  }
  if (action === "select-course") {
    event.target.checked ? state.selected.add(event.target.dataset.course) : state.selected.delete(event.target.dataset.course);
    render();
  }
});

modalRoot.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "close-modal" || (action === "backdrop" && event.target === target)) { state.modal = null; renderModal(); }
  if (action === "confirm-bulk") {
    if (state.modal.type === "delete-courses") {
      state.courses = state.courses.filter(name => !state.selected.has(name));
      toast(`${state.selected.size} courses deleted`);
    } else {
      state.selected.forEach(name => state.detached.add(name));
      toast(`${state.selected.size} OneRoster mappings detached`);
    }
    state.selected.clear(); state.modal = null; render();
  }
});

modalRoot.addEventListener("change", event => {
  if (event.target.name === "level") {
    const type = modalRoot.querySelector('[name="type"]');
    type.disabled = !event.target.value;
  }
});

modalRoot.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const level = form.get("level"), type = form.get("type"), value = form.get("value").trim();
  if (!level || !type || !value) { toast("Complete all association fields"); return; }
  if (state.modal.type === "edit") {
    Object.assign(state.modal.item, { level, type, value });
    toast("Association updated");
  } else {
    state.associations.push({ id: Date.now(), type, courses: 0, level, value, platform: "OneRoster" });
    toast("Association added");
  }
  state.modal = null; render();
});

document.addEventListener("keydown", event => { if (event.key === "Escape" && state.modal) { state.modal = null; renderModal(); } });
render();
